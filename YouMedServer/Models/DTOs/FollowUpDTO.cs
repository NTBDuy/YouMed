namespace YouMedServer.Models.DTOs
{
    public class FollowUpDTO
    {
        public int PatientID { get; set; }
        public int ClinicID { get; set; }
        public int DoctorID { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string? SymptomNote { get; set; }
        public string? AppointmentType { get; set; } = "FOLLOW_UP";
    }
}