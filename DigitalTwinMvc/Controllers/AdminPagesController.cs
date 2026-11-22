
using Microsoft.AspNetCore.Mvc;

namespace DigitalTwinMvc.Controllers
{
    public class AdminPagesController : Controller
    {
        public IActionResult Dashboard()
        {
            return View();
        }

        public IActionResult Users()
        {
            return View();
        }

        public IActionResult Grades()
        {
            return View();
        }

        public IActionResult Credentials()
        {
            return View();
        }

        public IActionResult Notifications()
        {
            return View();
        }
    }
}
