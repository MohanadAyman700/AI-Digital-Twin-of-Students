using DigitalTwinMvc.Models;

namespace DigitalTwinMvc.Data
{
    // Fills the database with the demo data that used to live in DemoStore.
    // Runs only when the Students table is empty.
    public static class DbSeeder
    {
        public static void Seed(AppDbContext db)
        {
            if (db.Students.Any()) return;

            var ahmed = new Student { FullName = "Ahmed Ali", Email = "ahmed@fa-hists.edu.eg", Interests = "AI, Web", AdvisorId = 1, TargetGoal = "Data Scientist" };
            var sara = new Student { FullName = "Sara Hassan", Email = "sara@fa-hists.edu.eg", Interests = "Security", AdvisorId = 1, TargetGoal = "Data Scientist" };
            var omar = new Student { FullName = "Omar Khaled", Email = "omar@fa-hists.edu.eg", Interests = "Mobile", AdvisorId = 2, TargetGoal = "Data Scientist" };
            db.Students.AddRange(ahmed, sara, omar);
            db.SaveChanges();   // generates the Ids

            db.Courses.AddRange(
                new CourseRecord { StudentId = ahmed.Id, CourseCode = "CS101", CourseName = "Programming", Semester = "2025-1", Grade = 85 },
                new CourseRecord { StudentId = ahmed.Id, CourseCode = "CS102", CourseName = "Data Structures", Semester = "2025-2", Grade = 62 },
                new CourseRecord { StudentId = sara.Id, CourseCode = "CS101", CourseName = "Programming", Semester = "2025-1", Grade = 48 },
                new CourseRecord { StudentId = sara.Id, CourseCode = "CS102", CourseName = "Data Structures", Semester = "2025-2", Grade = 55 },
                new CourseRecord { StudentId = omar.Id, CourseCode = "CS101", CourseName = "Programming", Semester = "2025-1", Grade = 90 });

            db.Attendance.AddRange(
                new AttendanceRecord { StudentId = ahmed.Id, Present = true },
                new AttendanceRecord { StudentId = ahmed.Id, Present = true },
                new AttendanceRecord { StudentId = ahmed.Id, Present = false },
                new AttendanceRecord { StudentId = sara.Id, Present = false },
                new AttendanceRecord { StudentId = sara.Id, Present = false },
                new AttendanceRecord { StudentId = sara.Id, Present = true },
                new AttendanceRecord { StudentId = omar.Id, Present = true });

            db.Skills.AddRange(
                new StudentSkill { StudentId = ahmed.Id, SkillName = "Python", Level = 3 },
                new StudentSkill { StudentId = ahmed.Id, SkillName = "SQL", Level = 2 },
                new StudentSkill { StudentId = sara.Id, SkillName = "Python", Level = 1 });

            db.GoalSkills.AddRange(
                new GoalSkill { Goal = "Data Scientist", SkillName = "Python", RequiredLevel = 4 },
                new GoalSkill { Goal = "Data Scientist", SkillName = "SQL", RequiredLevel = 4 },
                new GoalSkill { Goal = "Data Scientist", SkillName = "Machine Learning", RequiredLevel = 3 });

            db.Predictions.AddRange(
                new Prediction { StudentId = ahmed.Id, CourseCode = "CS102", PredictedGrade = 60, Risk = RiskLevel.Medium, Explanation = "Grades dropping and 1 absence" },
                new Prediction { StudentId = sara.Id, CourseCode = "CS101", PredictedGrade = 45, Risk = RiskLevel.High, Explanation = "Low grades and poor attendance" },
                new Prediction { StudentId = sara.Id, CourseCode = "CS102", PredictedGrade = 50, Risk = RiskLevel.High, Explanation = "Low grades and poor attendance" },
                new Prediction { StudentId = omar.Id, CourseCode = "CS101", PredictedGrade = 88, Risk = RiskLevel.Low });

            db.Recommendations.AddRange(
                new Recommendation { StudentId = ahmed.Id, Title = "Intro to Machine Learning", SkillName = "Machine Learning" },
                new Recommendation { StudentId = ahmed.Id, Title = "SQL for Data Analysis", SkillName = "SQL" });

            db.Resources.AddRange(
                new LearningResource { Title = "Python for Everybody", Url = "https://www.py4e.com", SkillName = "Python" },
                new LearningResource { Title = "SQLBolt", Url = "https://sqlbolt.com", SkillName = "SQL" },
                new LearningResource { Title = "ML Crash Course", Url = "https://developers.google.com/machine-learning/crash-course", SkillName = "Machine Learning" });

            db.SaveChanges();
        }
    }
}