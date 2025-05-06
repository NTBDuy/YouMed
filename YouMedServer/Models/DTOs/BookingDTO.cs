namespace YouMedServer.Models.DTOs
{
    public class BookingDTO
    {
        public int PatientID { get; set; }
        public int ClinicID { get; set; }
        public int DoctorID { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string? SymptomNote { get; set; }
        public int? RelatedAppointmentID { get; set; }
        public required string AppointmentType { get; set; }
    }
}