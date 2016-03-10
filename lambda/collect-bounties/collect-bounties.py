import json
import logging
import pymongo
import datetime

from github import Github
from pymongo import MongoClient

squad_tag_prefix = 'squad:'

logger = logging.getLogger()
logger.setLevel(logging.INFO)

valid_signatures = []
print('Loading function')

github_token = '4485643f038ae74faa9459e3cc7aea88469b334e'
database_server = 's-bountyhunt-mongo-rs1-use1c-01.external.app.staghudl.com:27017'
security_group = ''

def lambda_handler(event, context):
    request_pr = Pull_Request(json.dumps(event, indent=2))
 
    pr_number = request_pr.number
    repoName = request_pr.repository['name']
    repoUser = request_pr.repository['owner']['login']
    pr_body = request_pr.pull_request['body']

 
    logger.info('Repo: ' + repoName)
    logger.info('RepoUser: ' + repoUser)
    logger.info('Body: ' + pr_body)

    # Check that the PR is being merged

    signatures_from_mongo = get_valid_signatures()

    for signature_from_mongo in signatures_from_mongo:
        valid_signatures.append(signature_from_mongo)

    signatures_repaired = []

    # Look for signatures in the body of the PR
    body_signatures = find_signatures(pr_body)
    for body_signature in body_signatures:
        logger.info('Found signature %s in commit message', body_signature)
        if body_signature not in signatures_repaired:
                signatures_repaired.append(body_signature)

    # Get the issue for the PR to pull the labels off of it.
    pr_issue = get_issue(repoUser, repoName, pr_number)
    labels = pr_issue.get_labels()

    # Get the squad name from the labels
    squad_name = "unknown"
    for label in labels:
        if label.name.startswith(squad_tag_prefix):
            squad_name = label.name.replace(squad_tag_prefix,'').strip()

    logger.info('Squad: ' + squad_name)
    
    # Get the PR to get the commits
    pr = get_pr(repoUser, repoName, pr_number)
    commits = pr.get_commits()
    pr_url = 'https://github.com/{repoUser}/{repoName}/pulls/{pr_number}'.format(
        repoUser=repoUser,
        repoName=repoName,
        pr_number=pr_number)

    pr_merged_at = pr.merged_at
    pr_merged_at = datetime.datetime.now()

    for commit in commits:
        commit_message = commit.commit.message
        commit_signatures = find_signatures(commit_message)

        for commit_signature in commit_signatures:
            logger.info('Found signature %s in commit message', commit_signature)
            if commit_signature not in signatures_repaired:
                signatures_repaired.append(commit_signature)

    #Display the signatures fixed in the repo
    logger.info('Signatures Repaired:')
    for signature_repaired in signatures_repaired:
        logger.info(' - ' + signature_repaired)
        insert_bounty(squad_name, signature_repaired, 1, pr_url, pr_merged_at)


def find_signatures(text):
    found_signatures = []
    words = text.split()
    for word in words:
        if word in valid_signatures:
            if word not in found_signatures:
                found_signatures.append(word)
                logger.info('signature ' + word + ' added')

    return found_signatures

def get_issue(repoUser, repoName, pr_number):
    g = Github(github_token)
    user = g.get_user(repoUser)
    repo = user.get_repo(repoName)
    issue = repo.get_issue(pr_number)
    return issue

def get_pr(repoUser, repoName, pr_number):
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

class Pull_Request(object):
    def __init__(self,serialized_object):
        self.__dict__ = json.loads(serialized_object)

