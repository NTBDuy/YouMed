using YouMedServer.Models.Entities;

namespace YouMedServer.Models.DTOs
{
    public class ClinicResponseDTO
    {
        public int ClinicID { get; set; }
        public required string Name { get; set; }
        public string? ClinicAddress { get; set; }
        public string? Introduction { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTime? CreatedAt { get; set; }
        public List<SpecialtyDto>? Specialties { get; set; }
        public List<ClinicWorkingHours> clinicWorkingHours { get; set; } = new List<ClinicWorkingHours>();
    }
}