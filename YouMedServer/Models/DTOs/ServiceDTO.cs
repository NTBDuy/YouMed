namespace YouMedServer.Models.DTOs
{
    public class ServiceDTO
    {
        public int AppointmentID { get; set; }
        public required List<ServiceRequestItemDTO> Services { get; set; }
    }
}