using Hudl.BugBounty.WebApp.DataServices;
using Microsoft.AspNet.Mvc;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Hudl.BugBounty.WebApp.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IBountyRepository _bountyRepository;

        public HomeController(ILogger<HomeController> logger, IBountyRepository bountyRepository)
        {
            _logger = logger;
            _bountyRepository = bountyRepository;
        }

        // GET: /<controller>/
        public IActionResult Index()
        {
            _logger.LogInformation("Index action started.");
            return View();
        }
        [HttpGet]
        public async Task<JsonResult> Leaders()
        {
            return Json(await _bountyRepository.GetLeaders());
        }

        [HttpGet]
        public async Task<JsonResult> Hits()
        {
            return Json(await _bountyRepository.GetHitlist());
        }

        [HttpGet]
        public async Task<JsonResult> Hit(string signature)
        {
            return Json(await _bountyRepository.GetHit(signature));
        }


        [HttpGet]
        public async Task<JsonResult> Bounties()
        {
            return Json(await _bountyRepository.GetBounties());
        }
    }
}
