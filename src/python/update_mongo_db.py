from pymongo import MongoClient
import datetime
import json

signature = 'signature'

client = MongoClient('mongodb://s-bountyhunt-mongo-rs1-use1c-01.external.app.staghudl.com:27017')
db = client.bounty
errors = db.errors

sumo_data = json.loads(open('sumo-output.json', 'r').read())
for entry in sumo_data:
    # entry_time produces a datetime, with milliseconds truncated
    # entry_date produces a datetime representing midnight (morning) of the entry_time
    # both are in UTC, so they include offset information
    # e.g. Mongo will show 2016-03-09T18:00:00.000-0600 for central time

    entry_time = datetime.datetime.fromtimestamp(int(entry['_timeslice']) / 1000)
    entry_date = datetime.datetime(entry_time.year, entry_time.month, entry_time.day)

    existing_entry = errors.find_one({signature: entry[signature]})

    if existing_entry is not None:
        print(entry[signature] + ' already exists, updating frequency')

        hasDate = False
        frequency = existing_entry['frequency']
        for freq in frequency:
            if str(freq['date']) == str(entry_date):
                print(entry[signature] + ' frequency had date, updating count')
                hasDate = True
                freq['count'] += entry['_count']

        if hasDate is False:
            print(entry[signature] + ' frequency did not have date, adding date')
            frequency.append({
                'date': entry_date,
                'count': entry['_count']
            })

        errors.update_one({'_id': existing_entry['_id']},
                          {'$set': {'frequency': frequency}})

    else:
        print(entry[signature] + ' is new, adding it')
        mongo_entry = {
            signature: entry[signature],
            'service': entry['_sourcecategory'],
            'firstOccurrence': entry_time,
            'frequency': [
                {
                    'date': datetime.datetime(entry_time.year, entry_time.month, entry_time.day),
                    'count': entry['_count']
                }
            ]
        }
        errors.insert(mongo_entry)
