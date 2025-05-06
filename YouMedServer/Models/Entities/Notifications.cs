using System.ComponentModel.DataAnnotations;

namespace YouMedServer.Models.Entities
{
    public class Notification
    {
        [Key]
        public int NotificationID { get; set; }

        public int UserID { get; set; }

        [Required]
        public string? Title { get; set; }

        public string? Message { get; set; }

        [MaxLength(20)]
        public string? Status { get; set; }

        public DateTime? CreatedAt { get; set; }
    }
}