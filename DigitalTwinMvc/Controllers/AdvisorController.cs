using DigitalTwinMvc.Data;
using DigitalTwinMvc.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DigitalTwinMvc.Controllers
{
    // All the functions available to an academic advisor.
    // Base URL: /api/advisor
    [ApiController]
    [Route("api/advisor")]
    public class AdvisorController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AdvisorController(AppDbContext db)
        {
            _db = db;
        }

        // ------------------------------------------------------------
        // Helper methods
        // ------------------------------------------------------------

        // Returns the student ONLY if he belongs to this advisor.
        private Task<Student?> FindStudentOfAdvisorAsync(int advisorId, int studentId)
        {
            return _db.Students.AsNoTracking().FirstOrDefaultAsync(
                s => s.Id == studentId && s.AdvisorId == advisorId);
        }

        private async Task<double> GetAttendanceRateAsync(int studentId)
        {
            var total = await _db.Attendance.CountAsync(a => a.StudentId == studentId);
            if (total == 0) return 0;

            var present = await _db.Attendance.CountAsync(a => a.StudentId == studentId && a.Present);
            return Math.Round(present * 100.0 / total, 1);
        }

        private async Task<double> GetGpaAsync(int studentId)
        {
            var avg = await _db.Courses
                .Where(c => c.StudentId == studentId)
                .Select(c => (double?)c.Grade)
                .AverageAsync();

            return Math.Round(avg ?? 0, 2);
        }

        // Newest prediction for each course.
        private async Task<List<Prediction>> GetLatestPredictionsAsync(int studentId)
        {
            var all = await _db.Predictions
                .AsNoTracking()
                .Where(p => p.StudentId == studentId)
                .ToListAsync();

            return all
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
        public async Task<IActionResult> GetAtRiskStudents(int advisorId)
        {
            var atRiskStudents = new List<object>();

            var myStudents = await _db.Students
                .AsNoTracking()
                .Where(s => s.AdvisorId == advisorId)
                .ToListAsync();

            foreach (var student in myStudents)
            {
                var predictions = await GetLatestPredictionsAsync(student.Id);

                if (predictions.Count == 0)
                    continue;

                var highestRisk = predictions.Max(p => p.Risk);

                if (highestRisk == RiskLevel.Low)
                    continue;

                var riskyCourses = predictions
                    .Where(p => p.Risk != RiskLevel.Low)
                    .Select(p => p.CourseCode)
                    .ToList();

                atRiskStudents.Add(new
                {
                    StudentId = student.Id,
                    student.FullName,
                    Gpa = await GetGpaAsync(student.Id),
                    AttendanceRate = await GetAttendanceRateAsync(student.Id),
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
        public async Task<IActionResult> ReviewPredictions(int advisorId, int studentId)
        {
            var student = await FindStudentOfAdvisorAsync(advisorId, studentId);
            if (student == null)
                return NotFound("Student not found for this advisor.");

            return Ok(new
            {
                StudentId = student.Id,
                student.FullName,
                Predictions = await GetLatestPredictionsAsync(student.Id)
            });
        }

        // ============================================================
        // 3) Monitor Student Progress
        //    GET /api/advisor/1/students/2/progress
        // ============================================================
        [HttpGet("{advisorId:int}/students/{studentId:int}/progress")]
        public async Task<IActionResult> MonitorProgress(int advisorId, int studentId)
        {
            var student = await FindStudentOfAdvisorAsync(advisorId, studentId);
            if (student == null)
                return NotFound("Student not found for this advisor.");

            var semesters = await _db.Courses
                .Where(c => c.StudentId == student.Id)
                .GroupBy(c => c.Semester)
                .OrderBy(g => g.Key)
                .Select(g => new
                {
                    Semester = g.Key,
                    AverageGrade = Math.Round(g.Average(c => c.Grade), 2)
                })
                .ToListAsync();

            return Ok(new
            {
                student.FullName,
                Gpa = await GetGpaAsync(student.Id),
                Semesters = semesters,
                SkillsCount = await _db.Skills.CountAsync(k => k.StudentId == student.Id),
                AttendanceRate = await GetAttendanceRateAsync(student.Id)
            });
        }

        // ============================================================
        // 4) Create Intervention Plans
        //    POST /api/advisor/intervention-plans
        //    { "advisorId": 1, "studentId": 2, "title": "Extra tutoring",
        //      "actions": "Weekly session + exercises", "dueDate": "2026-12-31" }
        // ============================================================
        [HttpPost("intervention-plans")]
        public async Task<IActionResult> CreateInterventionPlan([FromBody] CreatePlanRequest request)
        {
            var student = await FindStudentOfAdvisorAsync(request.AdvisorId, request.StudentId);
            if (student == null)
                return NotFound("Student not found for this advisor.");

            if (string.IsNullOrWhiteSpace(request.Title) ||
                string.IsNullOrWhiteSpace(request.Actions))
            {
                return BadRequest("Title and Actions are required.");
            }

            // Id is generated by the database (IDENTITY column).
            var plan = new InterventionPlan
            {
                StudentId = student.Id,
                AdvisorId = request.AdvisorId,
                Title = request.Title,
                Actions = request.Actions,
                DueDate = request.DueDate
            };

            _db.Plans.Add(plan);
            await _db.SaveChangesAsync();

            return Ok(plan);
        }

        // ============================================================
        // Extra: list the plans created for one student
        //    GET /api/advisor/1/students/2/intervention-plans
        // ============================================================
        [HttpGet("{advisorId:int}/students/{studentId:int}/intervention-plans")]
        public async Task<IActionResult> GetInterventionPlans(int advisorId, int studentId)
        {
            var plans = await _db.Plans
                .AsNoTracking()
                .Where(p => p.AdvisorId == advisorId && p.StudentId == studentId)
                .ToListAsync();

            return Ok(plans);
        }

        // ============================================================
        // 5) Send Personalized Guidance
        //    POST /api/advisor/guidance
        //    { "advisorId": 1, "studentId": 2, "message": "Please attend the lab sessions." }
        // ============================================================
        [HttpPost("guidance")]
        public async Task<IActionResult> SendGuidance([FromBody] SendGuidanceRequest request)
        {
            var student = await FindStudentOfAdvisorAsync(request.AdvisorId, request.StudentId);
            if (student == null)
                return NotFound("Student not found for this advisor.");

            if (string.IsNullOrWhiteSpace(request.Message))
                return BadRequest("Message is required.");

            var message = new GuidanceMessage
            {
                StudentId = student.Id,
                AdvisorId = request.AdvisorId,
                Message = request.Message
            };

            _db.Messages.Add(message);
            await _db.SaveChangesAsync();

            return Ok(message);
        }
    }
}