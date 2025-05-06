using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YouMedServer.Models.Entities
{
    public class Patient
    {
        [Key]
        public int PatientID { get; set; }

        [Required]
        [MaxLength(255)]
        public required string Fullname { get; set; }
        [Required]
        public required string PhoneNumber { get; set; }
        public string? EmailAddress { get; set; }

        public DateTime? DateOfBirth { get; set; }

        [MaxLength(1)]
        public Char? Gender { get; set; }

        [MaxLength(255)]
        public string? HomeAddress { get; set; }

        [MaxLength(20)]
        public string? CitizenID { get; set; }
        
        public string? Relationship { get; set; }

        public int UserID { get; set; }
        public User? User { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}