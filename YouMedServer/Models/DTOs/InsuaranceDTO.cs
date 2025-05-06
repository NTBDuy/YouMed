namespace YouMedServer.Models.DTOs
{
    public class InsuranceDTO
    {
        public required string HealthInsuranceID { get; set; }
        public required int PatientID { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public required string InitialMedicalFacility { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}