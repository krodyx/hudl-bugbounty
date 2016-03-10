using System.Threading.Tasks;
using Hudl.BugBounty.WebApp.DataServices;
using Microsoft.AspNet.Mvc;
using Microsoft.Extensions.Logging;

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
        public async Task<JsonResult> GetBounties()
        {
            return Json(await _bountyRepository.GetBounties());
        }
    }
}
