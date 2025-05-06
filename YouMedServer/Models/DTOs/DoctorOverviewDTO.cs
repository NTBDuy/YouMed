namespace YouMedServer.Models.DTOs
{
    public class DoctorStatsDTO
    {
        public int? Upcoming { get; set;}
        public int? Completed { get; set;}
        public int? Cancelled { get; set;}
        public int? Total { get; set;}
    }
}