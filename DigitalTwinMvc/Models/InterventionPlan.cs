namespace DigitalTwinMvc.Models
{
    public class InterventionPlan
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public int AdvisorId { get; set; }
        public string Title { get; set; } = "";
        public string Actions { get; set; } = "";
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}