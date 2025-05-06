namespace YouMedServer.Models.DTOs
{
    public class UserDTO
    {
        public int UserID { get; set; }
        public required string Fullname { get; set; }
        public required string Email { get; set; }
    }
}