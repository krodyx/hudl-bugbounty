from pymongo import MongoClient
import datetime
import json

count_sumo = '_count'
service_sumo = '_sourcecategory'
signature_sumo = 'signature'
time_sumo = '_timeslice'

id_mongo = '_id'
frequency_mongo = 'frequency'
freq_date_mongo = 'date'
freq_count_mongo = 'count'
service_mongo = 'service'
signature_mongo = 'signature'
time_mongo = 'firstOccurrence'


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
    for record in sumo_data:
        # entry_time produces a datetime, with milliseconds truncated
        # entry_date produces a datetime representing midnight (morning) of the entry_time
        # both are in UTC, so they include offset information
        # e.g. Mongo will show 2016-03-09T18:00:00.000-0600 for entry_date in Central time

        entry_time = datetime.datetime.fromtimestamp(int(record[time_sumo]) / 1000)
        entry_date = datetime.datetime(entry_time.year, entry_time.month, entry_time.day)

        existing_entry = collection.find_one({signature_sumo: record[signature_sumo]})

        if existing_entry is not None:
            print(record[signature_sumo] + ' already exists, updating frequency')

            has_date = False
            frequencies = existing_entry[frequency_mongo]
            for freq in frequencies:
                if str(freq[freq_date_mongo]) == str(entry_date):
                    print(record[signature_sumo] + ' frequency had date, updating count')
                    has_date = True
                    freq[freq_count_mongo] += record[count_sumo]

            if has_date is False:
                print(record[signature_sumo] + ' frequency did not have date, adding date')
                frequencies.append({
                    freq_date_mongo: entry_date,
                    freq_count_mongo: record[count_sumo]
                })

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


if __name__ == '__main__':
    mongo_url = 'mongodb://s-bountyhunt-mongo-rs1-use1c-01.external.app.staghudl.com:27017'
    errors_collection = get_errors_collection(mongo_url)
    process_sumo_data(collection=errors_collection)
