using System.ComponentModel.DataAnnotations;

namespace YouMedServer.Models.Entities
{
    public class HealthInsurance
    {
        [Key]
        public required string HealthInsuranceID { get; set; }

        public int PatientID { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        [MaxLength(255)]
        public string? InitialMedicalFacility { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}