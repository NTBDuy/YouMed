using System.ComponentModel.DataAnnotations;

namespace YouMedServer.Models.Entities
{
    public class ClinicWorkingHours
    {
        [Key]
        public int ClinicWorkingHoursID { get; set; }

        [Required]
        public int ClinicID { get; set; }

        [Required]
        public DayOfWeek DayOfWeek { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        [Required]
        public bool IsActive { get; set; } = true;

        [Required]
        public DateTime LastUpdated { get; set; } = DateTime.Now;
    }
}