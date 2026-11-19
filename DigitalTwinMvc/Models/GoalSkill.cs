namespace DigitalTwinMvc.Models
{
    public class GoalSkill
    {
        public string Goal { get; set; } = "";
        public string SkillName { get; set; } = "";
        public int RequiredLevel { get; set; }  // من 1 لـ 5
    }
}