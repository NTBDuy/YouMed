using System.ComponentModel.DataAnnotations;

namespace YouMedServer.Models.Entities
{
    public class AppointmentClinicalService
    {
        [Key]
        public int Id { get; set; }

        public int AppointmentID { get; set; }
        public Appointment? Appointment { get; set; }

        public int ClinicalServiceID { get; set; }   // ID dịch vụ cận lâm sàng (ví dụ xét nghiệm máu, chụp Xquang...)
        public ClinicalService? ClinicalService { get; set; }

        public int? RecordID { get; set; } // ID hồ sơ bệnh án (nếu có)
        public MedicalRecord? MedicalRecord { get; set; }

        public string? Note { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? CompletedAt { get; set; }

        [MaxLength(150)]
        public string? ResultSummary { get; set; }

        public string? Conclusion { get; set; }

        public string? Recommendations { get; set; }

        [Required]
        [MaxLength(20)]
        public required string Status { get; set; } // "Pending", "Completed", "Canceled"   
    }
}