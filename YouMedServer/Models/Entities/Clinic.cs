using System.ComponentModel.DataAnnotations;
namespace YouMedServer.Models.Entities
{
    public class Clinic
    {
        [Key]
        public int ClinicID { get; set; }

        [Required]
        [MaxLength(255)]
        public required string Name { get; set; }

        [MaxLength(255)]
        public string? ClinicAddress { get; set; }

        public string? Introduction { get; set; }

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}