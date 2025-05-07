namespace YouMedServer.Models.Entities
{
    public class ClinicWorkingHours
    {
        public int ClinicWorkingHoursID { get; set; }
        public int ClinicID { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsActive { get; set; }
        public DateTime LastUpdated { get; set; }
    }
}