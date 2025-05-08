using System.ComponentModel.DataAnnotations;

namespace YouMedServer.Models.Entities
{
    public enum AppointmentStatus { Pending, Scheduled, InProgress, Completed, Cancelled }

    public class Appointment
    {
        [Key]
        public int AppointmentID { get; set; }

        public int PatientID { get; set; }
        public Patient? Patient { get; set; }

        public int ClinicID { get; set; }

        public Clinic? Clinic { get; set; }

        public int DoctorID { get; set; }

        public Doctor? Doctor { get; set; }

        [Required]
        public DateTime AppointmentDate { get; set; }

        [MaxLength(20)]
        [Required]
        public required AppointmentStatus Status { get; set; }

        public string? SymptomNote { get; set; }

        public DateTime? CreatedAt { get; set; }

        [MaxLength(20)]
        [Required]
        public required string AppointmentType { get; set; }

        public int? RelatedAppointmentID { get; set; }

        public string? AppointmentService { get; set; } = "NO REQUEST";
    }
}