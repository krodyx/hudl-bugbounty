using System.Collections.Generic;
using System.Threading.Tasks;
using Hudl.BugBounty.WebApp.Models;

namespace Hudl.BugBounty.WebApp.DataServices
{
    public interface ISquadRepository
    {
        Task<List<Squad>> GetSquadData(List<string> squadNames);
    }
}
