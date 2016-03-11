using System;
using System.Linq;
using System.Threading.Tasks;
using Hudl.BugBounty.WebApp.DataServices;
using Hudl.BugBounty.WebApp.Models;
using Microsoft.AspNet.Mvc;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Hudl.BugBounty.WebApp.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IBountyRepository _bountyRepository;

        private readonly ISquadRepository _squadRepository;

        public HomeController(ILogger<HomeController> logger, IBountyRepository bountyRepository, ISquadRepository squadRepository)
        {
            _logger = logger;
            _bountyRepository = bountyRepository;
            _squadRepository = squadRepository;
        }

        // GET: /<controller>/
        public IActionResult Index()
        {
            _logger.LogInformation("Index action started.");
            return View();
        }

        [HttpGet]
        public async Task<JsonResult> GetLeaders(DateTime fromDate)
        {
            var bountiesFrom = await _bountyRepository.GetBountiesFrom(fromDate);
            var bountiesBySquad = bountiesFrom.GroupBy(i => i.SquadName).ToList();
            var squadData = await _squadRepository.GetSquadData(bountiesBySquad.Select(i => i.Key).ToList());


            var leaders = (from b in bountiesBySquad
                          join s in squadData on b.Key equals s.SquadName
                          select
                              new Leader()
                              {
                                  AllTimeScore = 2000,
                                  SquadName = s.SquadName,
                                  SquadImage = s.SquadImage,
                                  TimeWindowScore = b.Sum(i => i.Value)
                              }).OrderByDescending(i=>i.TimeWindowScore);
                           
            return Json(leaders);
        }
    }
}
