using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YouMedServer.Models.Entities;

namespace YouMedServer.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public UserController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // GET: api/user/{userId}/patients
        // Lấy danh sách bệnh nhân 
        [HttpGet("{userId}/patients")]
        public async Task<IActionResult> GetPatientsByScope(
            int userId)
        {
            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found with id = ", userId });

            switch (user.Role)
            {
                case UserRole.Clinic:
                    var clinicPatients = await GetClinicPatientsAsync(userId);
                    return Ok(clinicPatients);
                case UserRole.Doctor:
                    var doctorPatients = await GetDoctorPatientsAsync(userId);
                    return Ok(doctorPatients);
                case UserRole.Client:
                    var clientPatients = await GetClientPatientsAsync(userId);
                    return Ok(clientPatients);
                default:
                    return BadRequest(new { message = "Invalid scope." });
            }
        }

        // GET: api/user/{userId}/notification
        // Lấy danh sách thông báo của người dùng theo UserID, sắp xếp mới nhất trước
        [HttpGet("{userId}/notifications")]
        public async Task<IActionResult> GetNotificationByUserID(int userId)
        {
            if (userId <= 0)
            {
                return BadRequest(new { message = "Invalid user ID" });
            }

            var notifications = await _dbContext.Notifications
                .Where(n => n.UserID == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            if (notifications.Count == 0)
                return NotFound(new { message = "No notifications found for the specified user." });

            return Ok(notifications);
        }

        private async Task<List<Patient>> GetClinicPatientsAsync(int userId)
        {
            var clinicStaff = await _dbContext.ClinicStaffs
                .FirstOrDefaultAsync(s => s.UserID == userId);

            if (clinicStaff == null)
            {
                return new List<Patient>();
            }

            var clinicPatients = await _dbContext.Patients
                .Join(_dbContext.Appointments,
                    p => p.PatientID,
                    a => a.PatientID,
                    (p, a) => new { p, a })
                .Where(x => x.a.ClinicID == clinicStaff.ClinicID && !x.p.IsDeleted)
                .Select(x => x.p)
                .Distinct()
                .ToListAsync();

            return clinicPatients;
        }

        private async Task<List<Patient>> GetDoctorPatientsAsync(int userId)
        {
            var doctor = await _dbContext.Doctors
                .FirstOrDefaultAsync(d => d.UserID == userId);

            if (doctor == null)
            {
                return new List<Patient>();
            }

            var doctorPatients = await _dbContext.Patients
                .Join(_dbContext.Appointments,
                    p => p.PatientID,
                    a => a.PatientID,
                    (p, a) => new { p, a })
                .Where(x => x.a.DoctorID == doctor.DoctorID && !x.p.IsDeleted)
                .Select(x => x.p)
                .Distinct()
                .ToListAsync();

            return doctorPatients;
        }
        private async Task<List<Patient>> GetClientPatientsAsync(int userId)
        {
            var clientPatients = await _dbContext.Patients
                .Where(p => p.UserID == userId && !p.IsDeleted)
                .ToListAsync();

            return clientPatients;
        }
    }
}