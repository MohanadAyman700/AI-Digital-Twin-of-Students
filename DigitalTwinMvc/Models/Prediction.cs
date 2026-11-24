namespace DigitalTwinMvc.Models
{
    public class Prediction
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string CourseCode { get; set; } = "";
        public double PredictedGrade { get; set; }
        public RiskLevel Risk { get; set; }
        public string? Explanation { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}