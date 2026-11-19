using DigitalTwinMvc.Models;
using Microsoft.AspNetCore.Mvc;

namespace DigitalTwinMvc.Controllers
{
    // This controller contains all the functions available to a student.
    // Base URL: /api/student
    [ApiController]
    [Route("api/student")]
    public class StudentsController : ControllerBase
    {
        // ------------------------------------------------------------
        // Helper class: describes one missing skill
        // ------------------------------------------------------------
        private class SkillGap
        {
            public string SkillName { get; set; } = "";
            public int CurrentLevel { get; set; }    // what the student has now
            public int RequiredLevel { get; set; }   // what the target goal needs
            public int Gap { get; set; }             // RequiredLevel - CurrentLevel
        }

        // ------------------------------------------------------------
        // Helper methods (used by the actions below)
        // ------------------------------------------------------------

        // Find a student by id. Returns null if the student does not exist.
        private Student? FindStudent(int studentId)
        {
            return DemoStore.Students.FirstOrDefault(s => s.Id == studentId);
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

        // Compare the student's skills with the skills required by his target goal.
        // Gap = required level - current level (only gaps greater than 0 are returned).
        private List<SkillGap> GetSkillGaps(Student student)
        {
            var gaps = new List<SkillGap>();

            // Skills required for the student's target goal (e.g. "Data Scientist").
            var requiredSkills = DemoStore.GoalSkills
                .Where(g => g.Goal == student.TargetGoal);

            foreach (var required in requiredSkills)
            {
                // Does the student already have this skill?
                var studentSkill = DemoStore.Skills.FirstOrDefault(
                    k => k.StudentId == student.Id && k.SkillName == required.SkillName);

                // If not, his level is 0.
                int currentLevel = 0;
                if (studentSkill != null)
                    currentLevel = studentSkill.Level;

                int gap = required.RequiredLevel - currentLevel;

                // Only keep skills that are still missing.
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

            // Biggest gap first.
            return gaps.OrderByDescending(g => g.Gap).ToList();
        }

        // ============================================================
        // 1) View Academic Profile
        //    GET /api/student/1/profile
        // ============================================================
        [HttpGet("{studentId:int}/profile")]
        public IActionResult GetProfile(int studentId)
        {
            // Step 1: make sure the student exists.
            var student = FindStudent(studentId);
            if (student == null)
                return NotFound("Student not found.");

            // Step 2: collect the student's data.
            var courses = DemoStore.Courses.Where(c => c.StudentId == studentId).ToList();
            var skills = DemoStore.Skills.Where(k => k.StudentId == studentId).ToList();

            // Step 3: return everything as JSON.
            return Ok(new
            {
                student.Id,
                student.FullName,
                student.Email,
                student.Interests,
                student.TargetGoal,
                Gpa = GetGpa(studentId),
                AttendanceRate = GetAttendanceRate(studentId),
                Courses = courses,
                Skills = skills
            });
        }

        // ============================================================
        // 2) Track Learning Progress
        //    GET /api/student/1/progress
        // ============================================================
        [HttpGet("{studentId:int}/progress")]
        public IActionResult GetProgress(int studentId)
        {
            // Step 1: make sure the student exists.
            if (FindStudent(studentId) == null)
                return NotFound("Student not found.");

            // Step 2: average grade for each semester
            // (shows whether the student is improving or declining).
            var semesters = DemoStore.Courses
                .Where(c => c.StudentId == studentId)
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
                Semesters = semesters,
                SkillsCount = DemoStore.Skills.Count(k => k.StudentId == studentId),
                AttendanceRate = GetAttendanceRate(studentId)
            });
        }

        // ============================================================
        // 3) View Predicted Academic Performance
        //    GET /api/student/1/predictions
        // ============================================================
        [HttpGet("{studentId:int}/predictions")]
        public IActionResult GetPredictions(int studentId)
        {
            // Step 1: make sure the student exists.
            if (FindStudent(studentId) == null)
                return NotFound("Student not found.");

            // Step 2: a course may have several predictions over time,
            // so we keep only the newest one for each course.
            var predictions = DemoStore.Predictions
                .Where(p => p.StudentId == studentId)
                .OrderByDescending(p => p.CreatedAt)
                .GroupBy(p => p.CourseCode)
                .Select(g => g.First())
                .ToList();

            return Ok(predictions);
        }

        // ============================================================
        // 4) View Skill Gap Analysis
        //    GET /api/student/1/skill-gaps
        // ============================================================
        [HttpGet("{studentId:int}/skill-gaps")]
        public IActionResult GetSkillGapAnalysis(int studentId)
        {
            // Step 1: make sure the student exists.
            var student = FindStudent(studentId);
            if (student == null)
                return NotFound("Student not found.");

            // Step 2: calculate the missing skills.
            var gaps = GetSkillGaps(student);

            return Ok(new
            {
                student.TargetGoal,
                Gaps = gaps
            });
        }

        // ============================================================
        // 5) Provide Feedback on Recommendations
        //    POST /api/student/feedback
        //    Body example:
        //    { "studentId": 1, "recommendationId": 1, "rating": 5, "comment": "Useful" }
        // ============================================================
        [HttpPost("feedback")]
        public IActionResult ProvideFeedback([FromBody] FeedbackRequest request)
        {
            // Step 1: rating must be between 1 and 5.
            if (request.Rating < 1 || request.Rating > 5)
                return BadRequest("Rating must be between 1 and 5.");

            // Step 2: the recommendation must belong to this student.
            var recommendation = DemoStore.Recommendations.FirstOrDefault(
                r => r.Id == request.RecommendationId && r.StudentId == request.StudentId);

            if (recommendation == null)
                return NotFound("Recommendation not found.");

            // Step 3: did the student already rate this recommendation?
            var oldFeedback = DemoStore.Feedbacks.FirstOrDefault(
                f => f.RecommendationId == request.RecommendationId
                  && f.StudentId == request.StudentId);

            if (oldFeedback == null)
            {
                // First time: add a new feedback.
                var newFeedback = new Feedback
                {
                    RecommendationId = request.RecommendationId,
                    StudentId = request.StudentId,
                    Rating = request.Rating,
                    Comment = request.Comment
                };
                DemoStore.Feedbacks.Add(newFeedback);
            }
            else
            {
                // Already rated: update the old feedback.
                oldFeedback.Rating = request.Rating;
                oldFeedback.Comment = request.Comment;
            }

            return Ok(new { message = "Feedback saved." });
        }

        // ============================================================
        // 6) View Learning Resources
        //    GET /api/student/1/learning-resources
        // ============================================================
        [HttpGet("{studentId:int}/learning-resources")]
        public IActionResult GetLearningResources(int studentId)
        {
            // Step 1: make sure the student exists.
            var student = FindStudent(studentId);
            if (student == null)
                return NotFound("Student not found.");

            // Step 2: get the names of the skills the student is missing.
            var missingSkillNames = GetSkillGaps(student)
                .Select(g => g.SkillName)
                .ToList();

            // Step 3: if nothing is missing, return all resources.
            if (missingSkillNames.Count == 0)
                return Ok(DemoStore.Resources);

            // Otherwise return only the resources that teach the missing skills.
            var resources = DemoStore.Resources
                .Where(r => missingSkillNames.Contains(r.SkillName))
                .ToList();

            return Ok(resources);
        }

        // ============================================================
        // Extra: the student reads the guidance sent by his advisor
        //    GET /api/student/1/guidance
        // ============================================================
        [HttpGet("{studentId:int}/guidance")]
        public IActionResult GetGuidance(int studentId)
        {
            var messages = DemoStore.Messages
                .Where(m => m.StudentId == studentId)
                .OrderByDescending(m => m.SentAt)   // newest first
                .ToList();

            return Ok(messages);
        }
    }
}