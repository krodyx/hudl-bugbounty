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
    public class MongoSquadRepository : ISquadRepository
    {
        private IMongoClient _mongoClient;

        private IMongoDatabase _mongoDatabase;

        public MongoSquadRepository(IOptions<DatabaseSettings> settings)
        {
            _mongoClient = new MongoClient($"mongodb://{settings.Value.Host}:{settings.Value.Port}");
            _mongoDatabase = _mongoClient.GetDatabase(settings.Value.Database);
        }

        public async Task<List<Squad>> GetSquadData(List<string> squadNames)
        {
            var squads = new List<Squad>();
            var squadCollection = _mongoDatabase.GetCollection<BsonDocument>("squads");
            var builder = Builders<BsonDocument>.Filter;
            var filter = builder.In("squadName", squadNames);
            using (var cursor = await squadCollection.FindAsync(filter))
            {
                while (await cursor.MoveNextAsync())
                {
                    var batch = cursor.Current;
                    foreach (var document in batch)
                    {
                        BsonElement squadName;
                        BsonElement squadImage;
                        string squadNameValue;
                        string squadImageValue = null;
                        if (!document.TryGetElement("squadName", out squadName)) continue;
                        squadNameValue = squadName.Value.AsString;
                        if (document.TryGetElement("squadImage", out squadImage)) squadImageValue = squadImage.Value.AsString;
                        squads.Add(new Squad() {SquadName = squadNameValue, SquadImage = squadImageValue});
                    }
                }
            }
            return squads;
        }
    }
}
