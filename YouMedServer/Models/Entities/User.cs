using System.ComponentModel.DataAnnotations;

namespace YouMedServer.Models.Entities
{
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
        public required string Email { get; set; }

        [MaxLength(10)]
        [Required]
        public required string Role { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}