using System.ComponentModel.DataAnnotations;

namespace YouMedServer.Models.Entities
{
    public class ClinicStaff
    {
        [Key]
        public int ClinicStaffID { get; set; }

        public int UserID { get; set; }

        public int ClinicID { get; set; }

        [Required]
        [MaxLength(20)]
        public required string Role { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}