namespace DigitalTwinMvc.Models
{
    public class GuidanceMessage
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public int AdvisorId { get; set; }
        public string Message { get; set; } = "";
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}