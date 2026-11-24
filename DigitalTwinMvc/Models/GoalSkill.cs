namespace DigitalTwinMvc.Models
{
    public class GoalSkill
    {
        public int Id { get; set; }
        public string Goal { get; set; } = "";
        public string SkillName { get; set; } = "";
        public int RequiredLevel { get; set; }  // من 1 لـ 5
    }
}