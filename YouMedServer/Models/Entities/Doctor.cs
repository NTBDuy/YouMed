using System.ComponentModel.DataAnnotations;

namespace YouMedServer.Models.Entities
{
    public class Doctor
    {
        [Key]
        public int DoctorID { get; set; }

        public string? Introduction { get; set; }

        public int? Experience { get; set; }

        public int UserID { get; set; }

        public required User User { get; set; }

        public int ClinicID { get; set; }

        public Clinic? Clinic { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}