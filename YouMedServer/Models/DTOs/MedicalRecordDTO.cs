namespace YouMedServer.Models.DTOs
{
    public class MedicalRecordDTO
    {
        public int PatientID { get; set; }
        public int AppointmentID { get; set; }
        public int DoctorID { get; set; }
        public string? Diagnosis { get; set; }
        public string? Prescription { get; set; }
        public string? Notes { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public int? PreviousRecordID { get; set; }
    }
}