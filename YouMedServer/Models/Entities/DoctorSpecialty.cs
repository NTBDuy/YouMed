using System.ComponentModel.DataAnnotations;

namespace YouMedServer.Models.Entities
{
    public class DoctorSpecialty
    {
        [Key]
        public int ID { get; set; }

        public int DoctorID { get; set; }

        public Doctor? Doctor { get; set; }

        public int SpecialtyID { get; set; }

        public Specialty? Specialty { get; set; }
    }
}