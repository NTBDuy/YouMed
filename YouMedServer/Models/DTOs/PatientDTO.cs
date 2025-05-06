namespace YouMedServer.Models.DTOs
{
    public class PatientDTO
    {
        public required string Fullname { get; set; }
        public required string PhoneNumber { get; set; }
        public string? EmailAddress { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public char? Gender { get; set; }
        public string? HomeAddress { get; set; }
        public string? CitizenID { get; set; }
        public string? Relationship { get; set; }
        public int UserID { get; set; }
    }
}