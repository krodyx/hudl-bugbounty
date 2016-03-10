using System;
using System.Collections.Generic;
using System.Linq;
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
                        BsonElement squadName;
                        BsonElement value;
                        BsonElement dateCollected;
                        string squadNameValue = null;
                        double valueValue = 0d;
                        DateTime? dateCollectedDate = null;
                        if(document.TryGetElement("squadName", out squadName)) squadNameValue = squadName.Value.AsString;
                        if (document.TryGetElement("value", out value)) valueValue = value.Value.ToInt32();
                        if(document.TryGetElement("dateCollected", out dateCollected)) dateCollectedDate = new DateTime(dateCollected.Value.AsBsonDateTime.MillisecondsSinceEpoch);
                        bounties.Add(new Bounty() {DateCollected = dateCollectedDate??DateTime.MinValue , Value = valueValue, SquadName = squadNameValue});
                    }
                }
            }
            return bounties;
        }
    }
}
