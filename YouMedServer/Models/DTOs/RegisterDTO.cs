namespace YouMedServer.Models.DTOs
{
    public class RegisterDTO
    {
        public required string PhoneNumber { get; set; }
        public required string Email { get; set; }
        public required string Fullname { get; set; }
        public required string Password { get; set; }
        public required string ReplacePassword { get; set; }
    }
}