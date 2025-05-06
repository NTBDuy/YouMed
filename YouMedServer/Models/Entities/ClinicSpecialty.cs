using System.ComponentModel.DataAnnotations;

namespace YouMedServer.Models.Entities
{
    public class ClinicSpecialty
    {
        [Key]
        public int ID { get; set; }

        public int ClinicID { get; set; }

        public Clinic? Clinic { get; set; }
        public int SpecialtyID { get; set; }
        public Specialty? Specialty { get; set;}
    }
}