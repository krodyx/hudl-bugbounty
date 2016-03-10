import json
import requests

# https://github.com/SumoLogic/sumo-api-doc/wiki/Search-API#search
# q (query) is required
# from is optional, defaults to 15 minutes ago
# to is optional, defaults to now
# tz is optional, defaults to UTC
# format is optional, default to json

sumo_base_url = 'https://api.us2.sumologic.com/api/v1/logs/search'
credentials_filename = 'credentials.json'


def get_access_id():
    credentials_json = json.loads(open(credentials_filename, 'r').read())
    return credentials_json.get('access-id')


def get_access_key():
    credentials_json = json.loads(open(credentials_filename, 'r').read())
    return credentials_json.get('access-key')


# Returns None if no query was provided, and the query string if it was
def generate_query_url(query=None, time_from=None, time_to=None, time_tz=None, output_format=None):
    if query is None:
        print('You can\'t search Sumo without a query!')
        return None

    full_url = sumo_base_url + '?q=' + query
    if time_from is not None:
        full_url += '&from=' + time_from
    if time_to is not None:
        full_url += '&to=' + time_to
    if time_tz is not None:
        full_url += '&tz=' + time_tz
    if output_format is not None:
        full_url += '&format=' + output_format
    return full_url


# Returns status code of request, but only saves to file on HTTP 200
def execute_query(url, access_id, access_key, filename='sumo-output.json'):
    r = requests.get(url, auth=(access_id, access_key))

    if r.status_code != 200:
        print('An error occurred when retrieving your results.')
        print('Raw response: ' + str(r.raw))
        return r.status_code

    output_file = open(filename, 'w')
    output_file.write(r.text)
    return r.status_code


if __name__ == '__main__':
    query_string = '_index=app_hudl error ' \
        '| where signature != "" ' \
        '| timeslice by 5m ' \
        '| fields signature, _sourceCategory, _timeslice ' \
        '| count by signature, _timeslice, _sourceCategory' \
        '| sort by signature asc'
    from_field = '2016-03-09T23:00:00'
    to = '2016-03-10T01:00:00'
    tz = 'America/Chicago'
    query_url = generate_query_url(query=query_string, time_from=from_field, time_to=to, time_tz=tz)
    if query_url is not None:
        status_code = execute_query(url=query_url, access_id=get_access_id(), access_key=get_access_key())
        print status_code
