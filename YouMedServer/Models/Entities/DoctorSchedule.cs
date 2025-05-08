using System.ComponentModel.DataAnnotations;

namespace YouMedServer.Models.Entities
{
    public class DoctorSchedule
    {
        [Key]
        public int ScheduleID { get; set; }

        [Required]
        public int DoctorID { get; set; }

        [Required]
        public DayOfWeek DayOfWeek { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        [Required]
        public int SlotDuration { get; set; } 

        [Required]
        public bool IsActive { get; set; } = true;

        public bool IsRecurring { get; set; } = false;

        public DateTime ValidFrom { get; set; }

        public DateTime ValidTo { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Required]
        public DateTime LastUpdated { get; set; } = DateTime.Now;
    }
}