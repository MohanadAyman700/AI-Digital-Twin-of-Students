namespace DigitalTwinMvc.Models
{
    public class StudentSkill
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string SkillName { get; set; } = "";
        public int Level { get; set; }          // من 1 لـ 5
    }
}