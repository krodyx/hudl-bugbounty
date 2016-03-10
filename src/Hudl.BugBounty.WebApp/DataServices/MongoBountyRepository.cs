using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Hudl.BugBounty.WebApp.Models;
using Hudl.BugBounty.WebApp.Options;
using Microsoft.Extensions.OptionsModel;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Hudl.BugBounty.WebApp.DataServices
{
    public sealed class MongoBountyRepository : IBountyRepository
    {
        private IMongoClient _mongoClient;
        private IMongoDatabase _mongoDatabase;

        public MongoBountyRepository(IOptions<DatabaseSettings> settings)
        {
            _mongoClient = new MongoClient($"mongodb://{settings.Value.Host}:{settings.Value.Port}");
            _mongoDatabase = _mongoClient.GetDatabase(settings.Value.Database);
        }

        public async Task<List<Bounty>> GetBounties()
        {
            var bounties = new List<Bounty>();
            var bountyCollection = _mongoDatabase.GetCollection<BsonDocument>("bounties");
            using(var cursor = await bountyCollection.FindAsync(new BsonDocument()))
            {
                while (await cursor.MoveNextAsync())
                {
                    var batch = cursor.Current;
                    foreach (var document in batch)
                    {
                        var squadName = document.GetElement("squadName").Value.AsString;
                        var value = document.GetElement("value").Value.AsDouble;
                        var dateCollected = document.GetElement("dateCollected").Value.AsBsonDateTime; // Will need to convert this to proper c# datetime
                        bounties.Add(new Bounty() {DateCollected = new DateTime(dateCollected.MillisecondsSinceEpoch), Value = value, SquadName = squadName});
                    }
                }
            }
            return bounties;
        }
    }
}
