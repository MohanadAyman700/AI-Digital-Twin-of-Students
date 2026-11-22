
using Microsoft.AspNetCore.Mvc;

namespace DigitalTwinMvc.Controllers
{
    public class StudentPagesController : Controller
    {
        private IActionResult StudentView(string page)
        {
            return View($"../Student/{page}");
        }

        public IActionResult Dashboard() => StudentView("Dashboard");
        public IActionResult Profile() => StudentView("Profile");
        public IActionResult Progress() => StudentView("Progress");
        public IActionResult Ask() => StudentView("Ask");
        public IActionResult Notifications() => StudentView("Notifications");
        public IActionResult Upload() => StudentView("Upload");
    }
}
