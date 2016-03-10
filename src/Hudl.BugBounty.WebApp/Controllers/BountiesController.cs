using Microsoft.AspNet.Mvc;
using Microsoft.Extensions.Logging;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Hudl.BugBounty.WebApp.Controllers
{
    public class BountiesController : Controller
    {
        private readonly ILogger<BountiesController> _logger;

        public BountiesController(ILogger<BountiesController> logger)
        {
            _logger = logger;
        }

        // GET: /<controller>/
        public IActionResult Index()
        {
            _logger.LogInformation("Index action started.");
            return View();
        }
    }
}
