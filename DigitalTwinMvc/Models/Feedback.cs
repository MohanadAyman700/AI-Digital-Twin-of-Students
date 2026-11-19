namespace DigitalTwinMvc.Models
{
    public class Feedback
    {
        public int RecommendationId { get; set; }
        public int StudentId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }
}