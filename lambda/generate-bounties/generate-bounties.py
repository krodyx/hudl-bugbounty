import json
import requests
import datetime
import logging
import urllib


from pymongo import MongoClient

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# https://github.com/SumoLogic/sumo-api-doc/wiki/Search-API#search

sumo_base_url = 'https://api.us2.sumologic.com/api/v1/logs/search'
credentials_filename = 'credentials.json'
mongo_url = 'mongodb://s-bountyhunt-mongo-rs1-use1c-01.external.app.staghudl.com:27017'

# sumo record fields
count_sumo = '_count'
service_sumo = '_sourcecategory'
signature_sumo = 'signature'
time_sumo = '_timeslice'

# mongo column names
id_mongo = '_id'
frequency_mongo = 'frequency'
freq_date_mongo = 'date'
freq_count_mongo = 'count'
service_mongo = 'service'
signature_mongo = 'signature'
time_mongo = 'firstOccurrence'

def lambda_handler(event, context):
    query_string = """_index=app_hudl error signature
| where signature != "" 
| timeslice by 1d
| fields signature, _sourceCategory, _timeslice 
| count by signature, _timeslice, _sourceCategory
| sort by signature asc
"""
    today = datetime.datetime.now()
    yesterday = today + datetime.timedelta(days=-1)

    from_field = yesterday.strftime('%Y-%m-%dT00:00:00')
    to = today.strftime('%Y-%m-%dT00:00:00')
    tz = 'America/Chicago'

    query_url = generate_query_url(query=query_string.replace('\n', ' '), time_from=from_field, time_to=to, time_tz=tz)
    
    if query_url is not None:
        status_code = execute_query(url=query_url, access_id=get_access_id(), access_key=get_access_key())
        print status_code

    errors_collection = get_errors_collection(mongo_url)
    process_sumo_data(collection=errors_collection)


def get_access_id():
    credentials_json = json.loads(open(credentials_filename, 'r').read())
    return credentials_json.get('sumologic_access_id')


def get_access_key():
    credentials_json = json.loads(open(credentials_filename, 'r').read())
    return credentials_json.get('sumologic_secret_key')

# Returns None if no query was provided, and the query string if it was
def generate_query_url(query=None, time_from=None, time_to=None, time_tz=None, output_format=None):
    if query is None:
        print('You can\'t search Sumo without a query!')
        return None

    full_url = sumo_base_url + '?q=' + urllib.quote_plus(query)
    if time_from is not None:
        full_url += '&from=' + urllib.quote_plus(time_from)
    if time_to is not None:
        full_url += '&to=' + urllib.quote_plus(time_to)
    if time_tz is not None:
        full_url += '&tz=' +urllib.quote_plus(time_tz)
    if output_format is not None:
        full_url += '&format=' + urllib.quote_plus(output_format)
    return full_url

# Returns status code of request, but only saves to file on HTTP 200
def execute_query(url, access_id, access_key, filename='sumo-output.json'):
    
    logger.info('connecting to sumologic with id=%s key=%s', access_id,access_key)
    logger.info('requesting url %s', url)
    r = requests.get(url, auth=(access_id, access_key))

    if r.status_code != 200:
        logger.error('An error occurred when retrieving your results. Raw Response: %s', str(r.raw))

        return r.status_code

    output_file = open(filename, 'w')
    output_file.write(r.text)
    return r.status_code

def get_errors_collection(server_url=None):
    if server_url is None:
        print('No Mongo server url provided!')
        return None

    client = MongoClient(server_url)
    database = client.bounty
    errors = database.errors
    return errors


def process_sumo_data(filename='sumo-output.json', collection=None):
    if collection is None:
        print('No Mongo collection provided')
        return

    sumo_data = json.loads(open(filename, 'r').read())
    new_signatures = 0
    added_frequencies = 0
    updated_counts = 0
    for record in sumo_data:
        # entry_time produces a datetime, with milliseconds truncated
        # entry_date produces a datetime representing midnight (morning) of the entry_time
        # both are in UTC, so they include offset information
        # e.g. Mongo will show 2016-03-09T18:00:00.000-0600 for entry_date in Central time


        entry_time = datetime.datetime.fromtimestamp(int(record[time_sumo]) / 1000)
        entry_date = datetime.datetime(entry_time.year, entry_time.month, entry_time.day)

        existing_entry = collection.find_one({signature_sumo: record[signature_sumo]})

        if existing_entry is not None:
            has_date = False
            frequencies = existing_entry[frequency_mongo]
            for freq in frequencies:
                if str(freq[freq_date_mongo]) == str(entry_date):
                    print(record[signature_sumo] + ' frequency had date, updating count')
                    has_date = True
                    freq[freq_count_mongo] += record[count_sumo]
                    updated_counts = updated_counts + 1
            if has_date is False:
                print(record[signature_sumo] + ' frequency did not have date, adding date')
                frequencies.append({
                    freq_date_mongo: entry_date,
                    freq_count_mongo: record[count_sumo]
                })
                added_frequencies = added_frequencies + 1
            collection.update_one({id_mongo: existing_entry[id_mongo]}, {'$set': {frequency_mongo: frequencies}})

        else:
            print(record[signature_sumo] + ' is new, adding it')
            mongo_entry = {
                signature_mongo: record[signature_sumo],
                service_mongo: record[service_sumo],
                time_mongo: entry_time,
                frequency_mongo: [
                    {
                        freq_date_mongo: datetime.datetime(entry_time.year, entry_time.month, entry_time.day),
                        freq_count_mongo: record[count_sumo]
                    }
                ]
            }
            collection.insert(mongo_entry)
            new_signatures = new_signatures + 1

    logger.info('Updated Data.  New Signatures: %i, Added Frequencies: %i, Updated Counts: %i', 
                     new_signatures, added_frequencies, updated_counts)

