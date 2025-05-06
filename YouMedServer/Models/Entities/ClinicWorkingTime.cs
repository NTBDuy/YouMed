namespace YouMedServer.Models.Entities
{
    public class ClinicWorkingTime
    {
        public int ClinicWorkingTimeID { get; set; }
        public int ClinicID { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public DateTime LastUpdated { get; set; }
    }
}