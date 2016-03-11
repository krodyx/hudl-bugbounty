using Microsoft.AspNet.Mvc;
using Microsoft.Extensions.Logging;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Hudl.BugBounty.WebApp.Controllers
{
    public class HitsController : Controller
    {
        private readonly ILogger<HitsController> _logger;

        public HitsController(ILogger<HitsController> logger)
        {
            _logger = logger;
        }
        
        public IActionResult Index(string signature)
        {
            _logger.LogInformation("Index action started.");
            return View();
        }
        
        [HttpGet("/hit/{signature}")]
        public IActionResult Hit(string signature)
        {
            _logger.LogInformation("Index action started.");
            return View();
        }
    }
}
