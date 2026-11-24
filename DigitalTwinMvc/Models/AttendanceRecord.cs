namespace DigitalTwinMvc.Models
{
    public class AttendanceRecord
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public bool Present { get; set; }
    }
}