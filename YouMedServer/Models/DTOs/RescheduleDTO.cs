namespace YouMedServer.Models.DTOs
{
    public class RescheduleDTO
    {
        public int AppointmentID { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string? SymptomNote { get; set; }
    }
}