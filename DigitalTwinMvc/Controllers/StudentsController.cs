using DigitalTwinMvc.Data;
using DigitalTwinMvc.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DigitalTwinMvc.Controllers
{
    // All the functions available to a student.
    // Base URL: /api/student
    [ApiController]
    [Route("api/student")]
    public class StudentsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public StudentsController(AppDbContext db)
        {
            _db = db;
        }

        // ------------------------------------------------------------
        // Helper class: describes one missing skill
        // ------------------------------------------------------------
        private class SkillGap
        {
            public string SkillName { get; set; } = "";
            public int CurrentLevel { get; set; }
            public int RequiredLevel { get; set; }
            public int Gap { get; set; }
        }

        // ------------------------------------------------------------
        // Helper methods
        // ------------------------------------------------------------
        private Task<Student?> FindStudentAsync(int studentId)
        {
            return _db.Students.AsNoTracking().FirstOrDefaultAsync(s => s.Id == studentId);
        }

        // Attendance rate as a percentage (0 - 100).
        private async Task<double> GetAttendanceRateAsync(int studentId)
        {
            var total = await _db.Attendance.CountAsync(a => a.StudentId == studentId);
            if (total == 0) return 0;

            var present = await _db.Attendance.CountAsync(a => a.StudentId == studentId && a.Present);
            return Math.Round(present * 100.0 / total, 1);
        }

        // Average of all the student's grades.
        private async Task<double> GetGpaAsync(int studentId)
        {
            var avg = await _db.Courses
                .Where(c => c.StudentId == studentId)
                .Select(c => (double?)c.Grade)
                .AverageAsync();

            return Math.Round(avg ?? 0, 2);
        }

        // Gap = required level - current level (only gaps > 0 are returned).
        private async Task<List<SkillGap>> GetSkillGapsAsync(Student student)
        {
            var requiredSkills = await _db.GoalSkills
                .AsNoTracking()
                .Where(g => g.Goal == student.TargetGoal)
                .ToListAsync();

            var studentSkills = await _db.Skills
                .AsNoTracking()
                .Where(k => k.StudentId == student.Id)
                .ToListAsync();

            var gaps = new List<SkillGap>();

            foreach (var required in requiredSkills)
            {
                var studentSkill = studentSkills.FirstOrDefault(k => k.SkillName == required.SkillName);
                int currentLevel = studentSkill?.Level ?? 0;
                int gap = required.RequiredLevel - currentLevel;

                if (gap > 0)
                {
                    gaps.Add(new SkillGap
                    {
                        SkillName = required.SkillName,
                        CurrentLevel = currentLevel,
                        RequiredLevel = required.RequiredLevel,
                        Gap = gap
                    });
                }
            }

            return gaps.OrderByDescending(g => g.Gap).ToList();
        }

        // ============================================================
        // 1) View Academic Profile      GET /api/student/1/profile
        // ============================================================
        [HttpGet("{studentId:int}/profile")]
        public async Task<IActionResult> GetProfile(int studentId)
        {
            var student = await FindStudentAsync(studentId);
            if (student == null)
                return NotFound("Student not found.");

            var courses = await _db.Courses.AsNoTracking().Where(c => c.StudentId == studentId).ToListAsync();
            var skills = await _db.Skills.AsNoTracking().Where(k => k.StudentId == studentId).ToListAsync();

            return Ok(new
            {
                student.Id,
                student.FullName,
                student.Email,
                student.Interests,
                student.TargetGoal,
                Gpa = await GetGpaAsync(studentId),
                AttendanceRate = await GetAttendanceRateAsync(studentId),
                Courses = courses,
                Skills = skills
            });
        }

        // ============================================================
        // 2) Track Learning Progress    GET /api/student/1/progress
        // ============================================================
        [HttpGet("{studentId:int}/progress")]
        public async Task<IActionResult> GetProgress(int studentId)
        {
            if (!await _db.Students.AnyAsync(s => s.Id == studentId))
                return NotFound("Student not found.");

            var semesters = await _db.Courses
                .Where(c => c.StudentId == studentId)
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
                Semesters = semesters,
                SkillsCount = await _db.Skills.CountAsync(k => k.StudentId == studentId),
                AttendanceRate = await GetAttendanceRateAsync(studentId)
            });
        }

        // ============================================================
        // 3) View Predicted Academic Performance
        //    GET /api/student/1/predictions
        // ============================================================
        [HttpGet("{studentId:int}/predictions")]
        public async Task<IActionResult> GetPredictions(int studentId)
        {
            if (!await _db.Students.AnyAsync(s => s.Id == studentId))
                return NotFound("Student not found.");

            // Keep only the newest prediction for each course.
            var all = await _db.Predictions
                .AsNoTracking()
                .Where(p => p.StudentId == studentId)
                .ToListAsync();

            var predictions = all
                .OrderByDescending(p => p.CreatedAt)
                .GroupBy(p => p.CourseCode)
                .Select(g => g.First())
                .ToList();

            return Ok(predictions);
        }

        // ============================================================
        // 4) View Skill Gap Analysis    GET /api/student/1/skill-gaps
        // ============================================================
        [HttpGet("{studentId:int}/skill-gaps")]
        public async Task<IActionResult> GetSkillGapAnalysis(int studentId)
        {
            var student = await FindStudentAsync(studentId);
            if (student == null)
                return NotFound("Student not found.");

            var gaps = await GetSkillGapsAsync(student);

            return Ok(new
            {
                student.TargetGoal,
                Gaps = gaps
            });
        }

        // ============================================================
        // 5) Provide Feedback on Recommendations
        //    POST /api/student/feedback
        //    { "studentId": 1, "recommendationId": 1, "rating": 5, "comment": "Useful" }
        // ============================================================
        [HttpPost("feedback")]
        public async Task<IActionResult> ProvideFeedback([FromBody] FeedbackRequest request)
        {
            if (request.Rating < 1 || request.Rating > 5)
                return BadRequest("Rating must be between 1 and 5.");

            var recommendationExists = await _db.Recommendations.AnyAsync(
                r => r.Id == request.RecommendationId && r.StudentId == request.StudentId);

            if (!recommendationExists)
                return NotFound("Recommendation not found.");

            var oldFeedback = await _db.Feedbacks.FirstOrDefaultAsync(
                f => f.RecommendationId == request.RecommendationId
                  && f.StudentId == request.StudentId);

            if (oldFeedback == null)
            {
                _db.Feedbacks.Add(new Feedback
                {
                    RecommendationId = request.RecommendationId,
                    StudentId = request.StudentId,
                    Rating = request.Rating,
                    Comment = request.Comment
                });
            }
            else
            {
                oldFeedback.Rating = request.Rating;
                oldFeedback.Comment = request.Comment;
            }

            await _db.SaveChangesAsync();

            return Ok(new { message = "Feedback saved." });
        }

        // ============================================================
        // 6) View Learning Resources    GET /api/student/1/learning-resources
        // ============================================================
        [HttpGet("{studentId:int}/learning-resources")]
        public async Task<IActionResult> GetLearningResources(int studentId)
        {
            var student = await FindStudentAsync(studentId);
            if (student == null)
                return NotFound("Student not found.");

            var missingSkillNames = (await GetSkillGapsAsync(student))
                .Select(g => g.SkillName)
                .ToList();

            if (missingSkillNames.Count == 0)
                return Ok(await _db.Resources.AsNoTracking().ToListAsync());

            var resources = await _db.Resources
                .AsNoTracking()
                .Where(r => missingSkillNames.Contains(r.SkillName))
                .ToListAsync();

            return Ok(resources);
        }

        // ============================================================
        // Extra: guidance sent by the advisor   GET /api/student/1/guidance
        // ============================================================
        [HttpGet("{studentId:int}/guidance")]
        public async Task<IActionResult> GetGuidance(int studentId)
        {
            var messages = await _db.Messages
                .AsNoTracking()
                .Where(m => m.StudentId == studentId)
                .OrderByDescending(m => m.SentAt)
                .ToListAsync();

            return Ok(messages);
        }
    }
}