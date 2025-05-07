namespace YouMedServer.Models.DTOs
{
    public class ClinicWorkingHourDTO
    {
        public int Id { get; set; }
        public int ClinicId { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsActive { get; set; }
    }
}