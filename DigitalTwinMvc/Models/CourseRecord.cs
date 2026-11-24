namespace DigitalTwinMvc.Models
{
    public class CourseRecord
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string CourseCode { get; set; } = "";
        public string CourseName { get; set; } = "";
        public string Semester { get; set; } = "";
        public double Grade { get; set; }
    }
}