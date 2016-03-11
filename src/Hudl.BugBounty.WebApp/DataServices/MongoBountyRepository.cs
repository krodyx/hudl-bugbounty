using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Hudl.BugBounty.WebApp.Models;
using Hudl.BugBounty.WebApp.Options;
using Microsoft.Extensions.OptionsModel;
using MongoDB.Bson;
using MongoDB.Driver;
using Microsoft.Extensions.Logging;

namespace Hudl.BugBounty.WebApp.DataServices
{
    public sealed class MongoBountyRepository : IBountyRepository
    {
        private IMongoClient _mongoClient;
        private IMongoDatabase _mongoDatabase;
        private ILogger<MongoBountyRepository> _logger;


        public MongoBountyRepository(ILogger<MongoBountyRepository> logger, IOptions<DatabaseSettings> settings)
        {
            _logger = logger;
            _mongoClient = new MongoClient($"mongodb://{settings.Value.Host}:{settings.Value.Port}");
            _mongoDatabase = _mongoClient.GetDatabase(settings.Value.Database);
        }

        public async Task<List<Leader>> GetLeaders()
        {
            var leaders = new List<Leader>();

            // Get a list of the squads
            var squadCollection = _mongoDatabase.GetCollection<BsonDocument>("squads");
            using (var cursor = await squadCollection.FindAsync(new BsonDocument()))
            {
                while (await cursor.MoveNextAsync())
                {
                    var batch = cursor.Current;
                    foreach (var document in batch)
                    {
                        var leader = new Leader();
                        BsonElement squadName;
                        BsonElement squadImage;
                        if (document.TryGetElement("squadName", out squadName))
                        {
                            leader.SquadName = squadName.Value.AsString;
                        };
                        if (document.TryGetElement("squadImage", out squadImage))
                        {
                            leader.SquadImage = squadImage.Value.AsString;
                        };
                        leader.AllTimeScore = 100;
                        leader.WeeklyScore = 10;
                        leaders.Add(leader);
                    }
                }
            }
            return leaders;
        }

        public async Task<List<Hit>> GetHitlist()
        {
            var hits = new List<Hit>();

            // Get a list of the hits
            var errorsCollection = _mongoDatabase.GetCollection<BsonDocument>("errors");
            using (var cursor = await errorsCollection.FindAsync(new BsonDocument()))
            {
                while (await cursor.MoveNextAsync())
                {
                    var batch = cursor.Current;
                    foreach (var document in batch)
                    {
                        var hit = new Hit();
                        BsonElement signature;
                        BsonElement service;
                        BsonElement stacktrace;
                        BsonElement firstOccurance;

                        if (document.TryGetElement("signature", out signature))
                        {
                            hit.Signature = signature.Value.AsString;
                        };
                        if (document.TryGetElement("service", out service))
                        {
                            hit.Service = service.Value.AsString;
                        };
                        if (document.TryGetElement("stacktrace", out stacktrace))
                        {
                            hit.Stacktrace = stacktrace.Value.AsString;
                        };
                        if (document.TryGetElement("firstOccurance", out firstOccurance))
                        {
                            hit.FirstOccurance = firstOccurance.Value.ToUniversalTime();
                        };
                        hit.CurrentValue = 1000;
                        hits.Add(hit);
                    }
                }
            }
            return hits;
        }

        public async Task<List<Bounty>> GetBounties()
        {
            var hits = (await GetHitlist()).ToDictionary(h => h.Signature, h => h);
            var bounties = new List<Bounty>();
            var bountyCollection = _mongoDatabase.GetCollection<BsonDocument>("bounties");
            using (var cursor = await bountyCollection.FindAsync(new BsonDocument()))
            {
                while (await cursor.MoveNextAsync())
                {
                    var batch = cursor.Current;
                    foreach (var document in batch)
                    {
                        BsonElement squadName;
                        BsonElement value;
                        BsonElement dateCollected;
                        BsonElement key;
                        BsonElement signature;
                        string squadNameValue = null;
                        double valueValue = 0d;
                        DateTime? dateCollectedDate = null;
                        string signatureValue = null;
                        string keyValue = null;
                        Hit matchingHit = null;
                        if (document.TryGetElement("squadName", out squadName)) squadNameValue = squadName.Value.AsString;
                        if (document.TryGetElement("value", out value)) valueValue = value.Value.ToInt32();
                        if (document.TryGetElement("dateCollected", out dateCollected)) dateCollectedDate = new DateTime(dateCollected.Value.AsBsonDateTime.MillisecondsSinceEpoch);
                        if (document.TryGetElement("key", out key))
                        {
                            keyValue = key.Value.AsString;
                        }
                        if (document.TryGetElement("signature", out signature))
                        {
                            signatureValue = signature.Value.AsString;
                            _logger.LogDebug("Found signature on bounty. BountyId={0} Signature={1}", keyValue ?? "<missing>", signatureValue ?? "<missing>");
                            hits.TryGetValue(signatureValue, out matchingHit);
                        }
                        bounties.Add(new Bounty() { DateCollected = dateCollectedDate ?? DateTime.MinValue, Value = valueValue, SquadName = squadNameValue, Hit = matchingHit, HitId = signatureValue });
                    }
                }
            }
            return bounties;
        }

        public async Task<Hit> GetHit(string signature)
        {
            // Get a list of the hits
            var errorsCollection = _mongoDatabase.GetCollection<BsonDocument>("errors");
            var filter = Builders<BsonDocument>.Filter.Eq("signature", signature);
            using (var cursor = await errorsCollection.FindAsync(new BsonDocument()))
            {
                while (await cursor.MoveNextAsync())
                {
                    var batch = cursor.Current;
                    foreach (var document in batch)
                    {
                        var hit = new Hit();
                        BsonElement service;
                        BsonElement stacktrace;
                        BsonElement firstOccurance;
                        hit.Signature = signature;

                        if (document.TryGetElement("service", out service))
                        {
                            hit.Service = service.Value.AsString;
                        };
                        if (document.TryGetElement("stacktrace", out stacktrace))
                        {
                            hit.Stacktrace = stacktrace.Value.AsString;
                        };
                        if (document.TryGetElement("firstOccurance", out firstOccurance))
                        {
                            hit.FirstOccurance = firstOccurance.Value.ToUniversalTime();
                        };
                        hit.CurrentValue = 1000;
                        return hit;
                    }
                }
            }
            return null;
        }
    }
}
