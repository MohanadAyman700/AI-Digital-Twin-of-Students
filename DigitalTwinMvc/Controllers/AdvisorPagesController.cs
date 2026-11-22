
using Microsoft.AspNetCore.Mvc;

namespace DigitalTwinMvc.Controllers
{
    public class AdvisorPagesController : Controller
    {
        public IActionResult Dashboard()
        {
            return View();
        }

        public IActionResult AtRisk()
        {
            return View();
        }

        public IActionResult Review()
        {
            return View();
        }

        public IActionResult Monitor()
        {
            return View();
        }

        public IActionResult Plans()
        {
            return View();
        }

        public IActionResult Guidance()
        {
            return View();
        }

        public IActionResult Notifications()
        {
            return View();
        }
    }
}
