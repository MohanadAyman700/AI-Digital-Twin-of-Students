namespace DigitalTwinMvc.Models
{
    public static class DemoStore
    {
        public static List<Student> Students = new()
        {
            new() { Id = 1, FullName = "Ahmed Ali",   Email = "ahmed@fa-hists.edu.eg", Interests = "AI, Web",  AdvisorId = 1, TargetGoal = "Data Scientist" },
            new() { Id = 2, FullName = "Sara Hassan", Email = "sara@fa-hists.edu.eg",  Interests = "Security", AdvisorId = 1, TargetGoal = "Data Scientist" },
            new() { Id = 3, FullName = "Omar Khaled", Email = "omar@fa-hists.edu.eg",  Interests = "Mobile",   AdvisorId = 2, TargetGoal = "Data Scientist" },
        };

        public static List<CourseRecord> Courses = new()
        {
            new() { StudentId = 1, CourseCode = "CS101", CourseName = "Programming",     Semester = "2025-1", Grade = 85 },
            new() { StudentId = 1, CourseCode = "CS102", CourseName = "Data Structures", Semester = "2025-2", Grade = 62 },
            new() { StudentId = 2, CourseCode = "CS101", CourseName = "Programming",     Semester = "2025-1", Grade = 48 },
            new() { StudentId = 2, CourseCode = "CS102", CourseName = "Data Structures", Semester = "2025-2", Grade = 55 },
            new() { StudentId = 3, CourseCode = "CS101", CourseName = "Programming",     Semester = "2025-1", Grade = 90 },
        };

        public static List<AttendanceRecord> Attendance = new()
        {
            new() { StudentId = 1, Present = true },
            new() { StudentId = 1, Present = true },
            new() { StudentId = 1, Present = false },
            new() { StudentId = 2, Present = false },
            new() { StudentId = 2, Present = false },
            new() { StudentId = 2, Present = true },
            new() { StudentId = 3, Present = true },
        };

        public static List<StudentSkill> Skills = new()
        {
            new() { StudentId = 1, SkillName = "Python", Level = 3 },
            new() { StudentId = 1, SkillName = "SQL",    Level = 2 },
            new() { StudentId = 2, SkillName = "Python", Level = 1 },
        };

        public static List<GoalSkill> GoalSkills = new()
        {
            new() { Goal = "Data Scientist", SkillName = "Python",           RequiredLevel = 4 },
            new() { Goal = "Data Scientist", SkillName = "SQL",              RequiredLevel = 4 },
            new() { Goal = "Data Scientist", SkillName = "Machine Learning", RequiredLevel = 3 },
        };

        public static List<Prediction> Predictions = new()
        {
            new() { StudentId = 1, CourseCode = "CS102", PredictedGrade = 60, Risk = RiskLevel.Medium, Explanation = "Grades dropping and 1 absence" },
            new() { StudentId = 2, CourseCode = "CS101", PredictedGrade = 45, Risk = RiskLevel.High,   Explanation = "Low grades and poor attendance" },
            new() { StudentId = 2, CourseCode = "CS102", PredictedGrade = 50, Risk = RiskLevel.High,   Explanation = "Low grades and poor attendance" },
            new() { StudentId = 3, CourseCode = "CS101", PredictedGrade = 88, Risk = RiskLevel.Low },
        };

        public static List<Recommendation> Recommendations = new()
        {
            new() { Id = 1, StudentId = 1, Title = "Intro to Machine Learning", SkillName = "Machine Learning" },
            new() { Id = 2, StudentId = 1, Title = "SQL for Data Analysis",     SkillName = "SQL" },
        };

        public static List<Feedback> Feedbacks = new();

        public static List<LearningResource> Resources = new()
        {
            new() { Id = 1, Title = "Python for Everybody", Url = "https://www.py4e.com", SkillName = "Python" },
            new() { Id = 2, Title = "SQLBolt",              Url = "https://sqlbolt.com",  SkillName = "SQL" },
            new() { Id = 3, Title = "ML Crash Course",      Url = "https://developers.google.com/machine-learning/crash-course", SkillName = "Machine Learning" },
        };

        public static List<InterventionPlan> Plans = new();
        public static List<GuidanceMessage> Messages = new();
    }
}