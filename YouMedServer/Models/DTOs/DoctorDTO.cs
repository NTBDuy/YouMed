namespace YouMedServer.Models.DTOs
{
    public class DoctorDTO
    {
        public required string FullName { get; set; }
        public required string PhoneNumber { get; set; }
        public required string Email { get; set; }
        public required string Introduction { get; set; }
        public required int Experience { get; set; }
        public List<int> SpecialtyIDs { get; set; } = new List<int>();
    }
}