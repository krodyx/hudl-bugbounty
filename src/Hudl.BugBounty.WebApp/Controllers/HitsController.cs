using System.Threading.Tasks;
using Hudl.BugBounty.WebApp.DataServices;
using Microsoft.AspNet.Mvc;
using Microsoft.Extensions.Logging;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Hudl.BugBounty.WebApp.Controllers
{
    public class HitsController : Controller
    {
        private readonly IBountyRepository _bountyRepository;
        private readonly ILogger<HitsController> _logger;

        public HitsController(ILogger<HitsController> logger, IBountyRepository bountyRepository)
        {
            _logger = logger;
            _bountyRepository = bountyRepository;
        }


        public IActionResult Index()
        {
            _logger.LogInformation("Index action started.");
            return View();
        }
        [HttpGet("/hits/{signature}")]
        public async Task<IActionResult> Hit(string signature)
        {
            _logger.LogInformation("Hit action started.");
            var hit = await _bountyRepository.GetHit(signature);
            return View(hit);
        }
    }
}
