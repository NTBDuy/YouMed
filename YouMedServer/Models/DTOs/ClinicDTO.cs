using YouMedServer.Models.Entities;

namespace YouMedServer.Models.DTOs
{
    public class ClinicDTO
    {
        public int ClinicID { get; set; }
        public required string Name { get; set; }
        public string? ClinicAddress { get; set; }
        public string? Introduction { get; set; }
        public string? PhoneNumber { get; set; }
    }
}