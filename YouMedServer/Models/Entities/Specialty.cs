using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace YouMedServer.Models.Entities
{
    public class Specialty
    {
        [Key]
        public int SpecialtyID { get; set; }

        [Required]
        public required string Name { get; set; }
    }
}