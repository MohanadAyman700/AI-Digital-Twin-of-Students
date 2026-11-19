namespace DigitalTwinMvc.Models
{
    public class FeedbackRequest
    {
        public int StudentId { get; set; } = 1;
        public int RecommendationId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }

    public class CreatePlanRequest
    {
        public int AdvisorId { get; set; } = 1;
        public int StudentId { get; set; }
        public string Title { get; set; } = "";
        public string Actions { get; set; } = "";
        public DateTime? DueDate { get; set; }
    }

    public class SendGuidanceRequest
    {
        public int AdvisorId { get; set; } = 1;
        public int StudentId { get; set; }
        public string Message { get; set; } = "";
    }
}