using DigitalTwinMvc.Models;
using Microsoft.AspNetCore.Mvc;

namespace DigitalTwinMvc.Controllers
{
    // This controller contains all the functions available to an academic advisor.
    // Base URL: /api/advisor
    [ApiController]
    [Route("api/advisor")]
    public class AdvisorController : ControllerBase
    {
        // ------------------------------------------------------------
        // Helper methods (used by the actions below)
        // ------------------------------------------------------------

        // Returns the student ONLY if he belongs to this advisor.
        // This prevents an advisor from seeing students assigned to someone else.
        private Student? FindStudentOfAdvisor(int advisorId, int studentId)
        {
            return DemoStore.Students.FirstOrDefault(
                s => s.Id == studentId && s.AdvisorId == advisorId);
        }

        // Attendance rate as a percentage (0 - 100).
        private double GetAttendanceRate(int studentId)
        {
            var records = DemoStore.Attendance
                .Where(a => a.StudentId == studentId)
                .ToList();

            // Avoid dividing by zero when there are no records.
            if (records.Count == 0)
                return 0;

            int presentCount = records.Count(a => a.Present);
            double rate = presentCount * 100.0 / records.Count;

            return Math.Round(rate, 1);
        }

        // Average of all the student's grades.
        private double GetGpa(int studentId)
        {
            var courses = DemoStore.Courses
                .Where(c => c.StudentId == studentId)
                .ToList();

            if (courses.Count == 0)
                return 0;

            return Math.Round(courses.Average(c => c.Grade), 2);
        }

        // A course may have several predictions over time.
        // This method keeps only the newest prediction for each course.
        private List<Prediction> GetLatestPredictions(int studentId)
        {
            return DemoStore.Predictions
                .Where(p => p.StudentId == studentId)
                .OrderByDescending(p => p.CreatedAt)
                .GroupBy(p => p.CourseCode)
                .Select(g => g.First())
                .ToList();
        }

        // ============================================================
        // 1) Identify At-Risk Students
        //    GET /api/advisor/1/at-risk-students
        // ============================================================
        [HttpGet("{advisorId:int}/at-risk-students")]
        public IActionResult GetAtRiskStudents(int advisorId)
        {
            var atRiskStudents = new List<object>();

            // Only the students assigned to this advisor.
            var myStudents = DemoStore.Students
                .Where(s => s.AdvisorId == advisorId)
                .ToList();

            foreach (var student in myStudents)
            {
                // Newest prediction for each of the student's courses.
                var predictions = GetLatestPredictions(student.Id);

                // No predictions yet -> nothing to evaluate.
                if (predictions.Count == 0)
                    continue;

                // The student's overall risk = the highest risk among his courses.
                var highestRisk = predictions.Max(p => p.Risk);

                // Skip students who are not at risk.
                if (highestRisk == RiskLevel.Low)
                    continue;

                // Courses that are actually risky.
                var riskyCourses = predictions
                    .Where(p => p.Risk != RiskLevel.Low)
                    .Select(p => p.CourseCode)
                    .ToList();

                atRiskStudents.Add(new
                {
                    StudentId = student.Id,
                    student.FullName,
                    Gpa = GetGpa(student.Id),
                    AttendanceRate = GetAttendanceRate(student.Id),
                    Risk = highestRisk.ToString(),
                    RiskCourses = riskyCourses
                });
            }

            return Ok(atRiskStudents);
        }

        // ============================================================
        // 2) Review AI-Based Predictions
        //    GET /api/advisor/1/students/2/predictions
        // ============================================================
        [HttpGet("{advisorId:int}/students/{studentId:int}/predictions")]
        public IActionResult ReviewPredictions(int advisorId, int studentId)
        {
            // Step 1: the student must belong to this advisor.
            var student = FindStudentOfAdvisor(advisorId, studentId);
            if (student == null)
                return NotFound("Student not found for this advisor.");

            // Step 2: return the newest predictions.
            return Ok(new
            {
                StudentId = student.Id,
                student.FullName,
                Predictions = GetLatestPredictions(student.Id)
            });
        }

        // ============================================================
        // 3) Monitor Student Progress
        //    GET /api/advisor/1/students/2/progress
        // ============================================================
        [HttpGet("{advisorId:int}/students/{studentId:int}/progress")]
        public IActionResult MonitorProgress(int advisorId, int studentId)
        {
            // Step 1: the student must belong to this advisor.
            var student = FindStudentOfAdvisor(advisorId, studentId);
            if (student == null)
                return NotFound("Student not found for this advisor.");

            // Step 2: average grade for each semester.
            var semesters = DemoStore.Courses
                .Where(c => c.StudentId == student.Id)
                .GroupBy(c => c.Semester)
                .OrderBy(g => g.Key)
                .Select(g => new
                {
                    Semester = g.Key,
                    AverageGrade = Math.Round(g.Average(c => c.Grade), 2)
                })
                .ToList();

            // Step 3: return the progress summary.
            return Ok(new
            {
                student.FullName,
                Gpa = GetGpa(student.Id),
                Semesters = semesters,
                SkillsCount = DemoStore.Skills.Count(k => k.StudentId == student.Id),
                AttendanceRate = GetAttendanceRate(student.Id)
            });
        }

        // ============================================================
        // 4) Create Intervention Plans
        //    POST /api/advisor/intervention-plans
        //    Body example:
        //    { "advisorId": 1, "studentId": 2, "title": "Extra tutoring",
        //      "actions": "Weekly session + exercises", "dueDate": "2026-12-31" }
        // ============================================================
        [HttpPost("intervention-plans")]
        public IActionResult CreateInterventionPlan([FromBody] CreatePlanRequest request)
        {
            // Step 1: the student must belong to this advisor.
            var student = FindStudentOfAdvisor(request.AdvisorId, request.StudentId);
            if (student == null)
                return NotFound("Student not found for this advisor.");

            // Step 2: title and actions cannot be empty.
            if (string.IsNullOrWhiteSpace(request.Title) ||
                string.IsNullOrWhiteSpace(request.Actions))
            {
                return BadRequest("Title and Actions are required.");
            }

            // Step 3: create the plan and save it.
            var plan = new InterventionPlan
            {
                Id = DemoStore.Plans.Count + 1,   // simple auto-increment id
                StudentId = student.Id,
                AdvisorId = request.AdvisorId,
                Title = request.Title,
                Actions = request.Actions,
                DueDate = request.DueDate
            };

            DemoStore.Plans.Add(plan);

            return Ok(plan);
        }

        // ============================================================
        // Extra: list the plans created for one student
        //    GET /api/advisor/1/students/2/intervention-plans
        // ============================================================
        [HttpGet("{advisorId:int}/students/{studentId:int}/intervention-plans")]
        public IActionResult GetInterventionPlans(int advisorId, int studentId)
        {
            var plans = DemoStore.Plans
                .Where(p => p.AdvisorId == advisorId && p.StudentId == studentId)
                .ToList();

            return Ok(plans);
        }

        // ============================================================
        // 5) Send Personalized Guidance
        //    POST /api/advisor/guidance
        //    Body example:
        //    { "advisorId": 1, "studentId": 2, "message": "Please attend the lab sessions." }
        // ============================================================
        [HttpPost("guidance")]
        public IActionResult SendGuidance([FromBody] SendGuidanceRequest request)
        {
            // Step 1: the student must belong to this advisor.
            var student = FindStudentOfAdvisor(request.AdvisorId, request.StudentId);
            if (student == null)
                return NotFound("Student not found for this advisor.");

            // Step 2: the message cannot be empty.
            if (string.IsNullOrWhiteSpace(request.Message))
                return BadRequest("Message is required.");

            // Step 3: create the message and save it.
            var message = new GuidanceMessage
            {
                Id = DemoStore.Messages.Count + 1,   // simple auto-increment id
                StudentId = student.Id,
                AdvisorId = request.AdvisorId,
                Message = request.Message
            };

            DemoStore.Messages.Add(message);

            return Ok(message);
        }
    }
}