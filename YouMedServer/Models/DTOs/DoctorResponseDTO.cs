using YouMedServer.Models.Entities;

namespace YouMedServer.Models.DTOs
{
    public class DoctorResponseDTO
    {
        public int DoctorID { get; set; }

        public string? Introduction { get; set; }

        public int? Experience { get; set; }

        public int UserID { get; set; }

        public required User User { get; set; }

        public int ClinicID { get; set; }

        public Clinic? Clinic { get; set; }
        public List<SpecialtyDto>? Specialties { get; set; }
    }
}