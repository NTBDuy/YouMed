using System.ComponentModel.DataAnnotations;

namespace YouMedServer.Models.Entities
{
    public class MedicalRecord
    {
        [Key]
        public int RecordID { get; set; }

        public int PatientID { get; set; }

        public Patient? Patient { get; set; }

        public int DoctorID { get; set; }

        public Doctor? Doctor { get; set; }

        public int AppointmentID { get; set; }

        public Appointment? Appointment { get; set; }

        public string? Diagnosis { get; set; }

        public string? Prescription { get; set; }

        public string? Notes { get; set; }

        public DateTime? FollowUpDate { get; set; }

        public DateTime? CreatedAt { get; set; }

        public int? PreviousRecordID { get; set; }

        public bool IsScheduleFollowUp { get; set; } = false;

        public bool IsFollowUp { get; set; } = false;
    }
}