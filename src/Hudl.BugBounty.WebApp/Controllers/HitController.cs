using System.Threading.Tasks;
using Hudl.BugBounty.WebApp.DataServices;
using Microsoft.AspNet.Mvc;
using Microsoft.Extensions.Logging;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Hudl.BugBounty.WebApp.Controllers
{
    public class HitController : Controller
    {
        private readonly ILogger<BountiesController> _logger;
        private readonly IBountyRepository _bountyRepository;

        public HitController(ILogger<BountiesController> logger, IBountyRepository bountyRepository)
        {
            _logger = logger;
            _bountyRepository = bountyRepository;
        }
        
        [HttpGet("/hit/{signature}")]
        public async Task<IActionResult> Hit(string signature)
        {
            _logger.LogInformation("Hit action started.");
            var hit = await _bountyRepository.GetHit(signature);
            return View(hit);
        }
    }
}
