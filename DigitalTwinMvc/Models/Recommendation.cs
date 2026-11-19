namespace DigitalTwinMvc.Models
{
    public class Recommendation
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string Title { get; set; } = "";
        public string? SkillName { get; set; }
    }
}