using DigitalTwinMvc.Models;
using Microsoft.EntityFrameworkCore;

namespace DigitalTwinMvc.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Student> Students => Set<Student>();
        public DbSet<CourseRecord> Courses => Set<CourseRecord>();
        public DbSet<AttendanceRecord> Attendance => Set<AttendanceRecord>();
        public DbSet<StudentSkill> Skills => Set<StudentSkill>();
        public DbSet<GoalSkill> GoalSkills => Set<GoalSkill>();
        public DbSet<Prediction> Predictions => Set<Prediction>();
        public DbSet<Recommendation> Recommendations => Set<Recommendation>();
        public DbSet<Feedback> Feedbacks => Set<Feedback>();
        public DbSet<LearningResource> Resources => Set<LearningResource>();
        public DbSet<InterventionPlan> Plans => Set<InterventionPlan>();
        public DbSet<GuidanceMessage> Messages => Set<GuidanceMessage>();

        protected override void OnModelCreating(ModelBuilder b)
        {
            base.OnModelCreating(b);

            b.Entity<Student>(e =>
            {
                e.Property(x => x.FullName).HasMaxLength(150).IsRequired();
                e.Property(x => x.Email).HasMaxLength(200).IsRequired();
                e.Property(x => x.TargetGoal).HasMaxLength(100);
                e.HasIndex(x => x.Email).IsUnique();
                e.HasIndex(x => x.AdvisorId);
            });

            // Tables owned by a student -> FK to Students (deleting a student deletes his data)
            b.Entity<CourseRecord>(e =>
            {
                e.HasOne<Student>().WithMany().HasForeignKey(x => x.StudentId).OnDelete(DeleteBehavior.Cascade);
                e.Property(x => x.CourseCode).HasMaxLength(20);
                e.HasIndex(x => x.StudentId);
            });

            b.Entity<AttendanceRecord>(e =>
            {
                e.HasOne<Student>().WithMany().HasForeignKey(x => x.StudentId).OnDelete(DeleteBehavior.Cascade);
                e.HasIndex(x => x.StudentId);
            });

            b.Entity<StudentSkill>(e =>
            {
                e.HasOne<Student>().WithMany().HasForeignKey(x => x.StudentId).OnDelete(DeleteBehavior.Cascade);
                e.Property(x => x.SkillName).HasMaxLength(100);
                e.HasIndex(x => new { x.StudentId, x.SkillName }).IsUnique();
            });

            b.Entity<Prediction>(e =>
            {
                e.HasOne<Student>().WithMany().HasForeignKey(x => x.StudentId).OnDelete(DeleteBehavior.Cascade);
                e.Property(x => x.CourseCode).HasMaxLength(20);
                e.Property(x => x.Risk).HasConversion<string>().HasMaxLength(10);
                e.HasIndex(x => new { x.StudentId, x.CourseCode });
            });

            b.Entity<Recommendation>(e =>
            {
                e.HasOne<Student>().WithMany().HasForeignKey(x => x.StudentId).OnDelete(DeleteBehavior.Cascade);
            });

            // NoAction on both FKs to avoid the SQL Server "multiple cascade paths" error
            b.Entity<Feedback>(e =>
            {
                e.HasOne<Student>().WithMany().HasForeignKey(x => x.StudentId).OnDelete(DeleteBehavior.NoAction);
                e.HasOne<Recommendation>().WithMany().HasForeignKey(x => x.RecommendationId).OnDelete(DeleteBehavior.NoAction);
                e.HasIndex(x => new { x.StudentId, x.RecommendationId }).IsUnique();
            });

            b.Entity<InterventionPlan>(e =>
            {
                e.HasOne<Student>().WithMany().HasForeignKey(x => x.StudentId).OnDelete(DeleteBehavior.Cascade);
                e.HasIndex(x => new { x.AdvisorId, x.StudentId });
            });

            b.Entity<GuidanceMessage>(e =>
            {
                e.HasOne<Student>().WithMany().HasForeignKey(x => x.StudentId).OnDelete(DeleteBehavior.Cascade);
                e.HasIndex(x => x.StudentId);
            });

            b.Entity<GoalSkill>(e =>
            {
                e.Property(x => x.Goal).HasMaxLength(100);
                e.Property(x => x.SkillName).HasMaxLength(100);
                e.HasIndex(x => new { x.Goal, x.SkillName }).IsUnique();
            });
        }
    }
}