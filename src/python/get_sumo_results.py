import json
import requests

# https://github.com/SumoLogic/sumo-api-doc/wiki/Search-API#search
# q (query) is required
# from is optional, defaults to 15 minutes ago
# to is optional, defaults to now
# tz is optional, defaults to UTC
# format is optional, default to json

credentials_json = json.loads(open('credentials.json', 'r').read())
access_id = credentials_json.get('access-id')
access_key = credentials_json.get('access-key')

sumo_base_url = 'https://api.us2.sumologic.com/api/v1/logs/search'
query = '_index=app_hudl error ' \
        '| where signature != "" ' \
        '| timeslice by 5m ' \
        '| fields signature, _sourceCategory, _timeslice ' \
        '| count by signature, _timeslice, _sourceCategory' \
        '| sort by signature asc'
from_field = '2016-03-08T23:00:00'
to = '2016-03-09T01:00:00'
tz = 'America/Chicago'
full_url = sumo_base_url + '?q=' + query + '&from=' + from_field + '&to=' + to + '&tz=' + tz

r = requests.get(full_url, auth=(access_id, access_key))
print('status code', r.status_code)

output_file = open('sumo-output.json', 'w')
output_file.write(r.text)
