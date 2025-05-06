namespace YouMedServer.Models.DTOs
{
    public class ClinicStatsDTO
    {
        public int? TodayAppointments { get; set;}
        public int? CompletedAppointments { get; set;}
        public int? PendingAppointments { get; set;}
        public int? ScheduledAppointments { get; set;}
    }
}