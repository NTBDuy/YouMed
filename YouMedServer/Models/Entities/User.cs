using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YouMedServer.Models.Entities
{
    public enum UserRole
    {
        Client,
        Doctor,
        Clinic
    }

    public class User
    {
        [Key]
        public int UserID { get; set; }

        [Required]
        public required string PhoneNumber { get; set; }

        [Required]
        public required string PasswordHash { get; set; }

        [Required]
        [MaxLength(255)]
        public required string Fullname { get; set; }

        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        [EnumDataType(typeof(UserRole))]
        public UserRole Role { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
