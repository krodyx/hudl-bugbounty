import json
import logging
import pymongo
import datetime

from github import Github
from pymongo import MongoClient

print('Loading function')

squad_tag_prefix = 'squad:'

logger = logging.getLogger()
logger.setLevel(logging.INFO)

valid_signatures = []

credentials_filename = 'credentials.json'

database_server = 's-bountyhunt-mongo-rs1-use1c-01.external.app.staghudl.com:27017'
security_group = 'sg-be4df5c6'

def lambda_handler(event, context):
    logger.debug("Received event: " + json.dumps(event, indent=2))
    request_pr = Pull_Request(json.dumps(event, indent=2))
 
    log_pr_info(request_pr)

    # Check that the PR is being merged
    if not request_pr.isMerged:
        message = 'PR is not being merged, ignoring.'
        logger.info(message)
        return message

    if not request_pr.action == 'closed':
        message = 'PR not being closed, being {}. ignoring.'.format(action)
        logger.info(message)
        return message

    # Get Github token from file.
    github_token = get_github_token()
    signatures_from_mongo = get_valid_signatures()

    for signature_from_mongo in signatures_from_mongo:
        valid_signatures.append(signature_from_mongo)

    logger.info("Checking against %i valid signatures", len(valid_signatures))

    signatures_repaired = []

    # Look for signatures in the body of the PR
    body_signatures = find_signatures(request_pr.pr_body)
    for body_signature in body_signatures:
        logger.info('Found signature %s in pull request body', body_signature)
        if body_signature not in signatures_repaired:
                signatures_repaired.append(body_signature)

    # Get the issue for the PR to pull the labels off of it.
    pr_issue = get_issue(github_token, request_pr.repository_user, request_pr.repository_name, request_pr.pr_number)
    labels = pr_issue.get_labels()

    # Get the squad name from the labels, if no label, then unknown
    squad_name = "unknown"
    for label in labels:
        if label.name.startswith(squad_tag_prefix):
            squad_name = label.name.replace(squad_tag_prefix,'').strip()

    logger.info('Squad: ' + squad_name)
    
    # get the PR object
    pr = get_pr(github_token, request_pr.repository_user, request_pr.repository_name, request_pr.pr_number)

    pr_url = build_github_url(request_pr.repository_user, request_pr.repository_name, request_pr.pr_number)
    pr_merged_at = pr.merged_at

    # Pull signatures out of commit messages
    commits = pr.get_commits()
    for commit in commits:
        commit_message = commit.commit.message
        commit_signatures = find_signatures(commit_message)

        for commit_signature in commit_signatures:
            logger.info('Found signature %s in commit message', commit_signature)
            if commit_signature not in signatures_repaired:
                signatures_repaired.append(commit_signature)

    bounty_count = 0

    #Display the signatures fixed in the repo
    logger.info('Signatures Repaired:')
    for signature_repaired in signatures_repaired:
        logger.info(' - ' + signature_repaired)
        insert_bounty(squad_name, signature_repaired, 1, pr_url, pr_merged_at)
        bounty_count = bounty_count + 1

    return 'Inserted {} bounties'.format(bounty_count)

def get_github_token():
    credentials_json = json.loads(open(credentials_filename, 'r').read())
    return credentials_json.get('github_token')

def build_github_url(repository_user, repository_name, pr_number):
    return 'https://github.com/{repository_user}/{repository_name}/pulls/{pr_number}'.format(
    repository_user=repository_user,
    repository_name=repository_name,
    pr_number=pr_number)

def find_signatures(text):
    found_signatures = []
    words = text.split()
    for word in words:
        if word in valid_signatures:
            if word not in found_signatures:
                found_signatures.append(word)
                logger.info('Signature ' + word + ' added')

    return found_signatures

def get_issue(github_token, repoUser, repoName, pr_number):
    g = Github(github_token)
    user = g.get_user(repoUser)
    repo = user.get_repo(repoName)
    issue = repo.get_issue(pr_number)
    return issue

def get_pr(github_token, repoUser, repoName, pr_number):
    g = Github(github_token)
    user = g.get_user(repoUser)
    repo = user.get_repo(repoName)
    pr = repo.get_pull(pr_number)
    return pr

def get_valid_signatures():
    client = MongoClient('mongodb://' + database_server)
    db = client.bounty
    collection = db.errors
    signature_objects = collection.find({}, {'_id':0, 'signature':1})
    signatures = []
    for signature_object in signature_objects:
        signature = signature_object['signature']
        signatures.append(signature)

    return signatures

def insert_bounty(squad_name, signature, bounty_value, pull_request_url, date_merged):
    bounty = {
        'squadName': squad_name,
        'signature': signature,
        'value': bounty_value,
        'pullRequest': {
            'url' : pull_request_url
        },
        'dateMerged': date_merged
    }
    client = MongoClient('mongodb://' + database_server)
    db = client.bounty
    collection = db.bounties
    collection.insert(bounty)

def log_pr_info(request_pr):
    logger.info('Repository: %s', request_pr.repository_name)
    logger.info('Repository User: %s', request_pr.repository_user)
    logger.info('Pull Request Number: %i', request_pr.pr_number)
    logger.info('Description: %s', request_pr.pr_body)
    logger.info('Is Merged: %r', request_pr.isMerged)
    logger.info('Action: %s', request_pr.action)

class Pull_Request(object):
    def __init__(self,serialized_object):
        self.__dict__ = json.loads(serialized_object)
        self.pr_number = self.number
        self.repository_name = self.repository['name']
        self.repository_user = self.repository['owner']['login']
        self.pr_body = self.pull_request['body']
        self.isMerged = self.pull_request['merged']    

