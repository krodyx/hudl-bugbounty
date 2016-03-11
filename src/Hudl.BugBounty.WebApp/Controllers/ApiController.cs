using System.Threading.Tasks;
using Hudl.BugBounty.WebApp.DataServices;
using Microsoft.AspNet.Mvc;
using Microsoft.Extensions.Logging;

namespace Hudl.BugBounty.WebApp.Controllers
{
    public class ApiController : Controller
    {
        
        private readonly ILogger<ApiController> _logger;
        private readonly IBountyRepository _bountyRepository;

        public ApiController(ILogger<ApiController> logger, IBountyRepository bountyRepository)
        {
            _logger = logger;
            _bountyRepository = bountyRepository;
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