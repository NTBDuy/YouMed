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
        public async Task<IActionResult> GetPatientsByRoles(
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
                    return BadRequest(new { message = "Invalid role." });
            }
        }

        // GET: api/user/{userId}/records
        // Lấy danh sách hồ sơ bệnh án 
        [HttpGet("{userId}/records")]
        public async Task<IActionResult> GetRecordsByRoles(int userId)
        {
            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found with id = ", userId });

            switch (user.Role)
            {
                case UserRole.Doctor:
                    var doctorRecords = await GetDoctorRecordsAsync(userId);
                    return Ok(doctorRecords);
                case UserRole.Clinic:
                    var clinicRecords = await GetClinicRecordsAsync(userId);
                    return Ok(clinicRecords);
                default:
                    return BadRequest(new { message = "Invalid role." });
            }

        }

        // GET: api/user/{userId}/appointments
        // Lấy danh sách lịch hẹn
        [HttpGet("{userId}/appointments")]
        public async Task<IActionResult> GetAppointmentsByRoles(int userId, [FromQuery] string? status = null)
        {
            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found with id = ", userId });

            switch (user.Role)
            {
                case UserRole.Client:
                    var clientAppointments = await GetClientAppointmentsAsync(userId, status);
                    return Ok(clientAppointments);
                case UserRole.Doctor:
                    var doctorAppointments = await GetDoctorAppointmentsAsync(userId, status);
                    return Ok(doctorAppointments);
                case UserRole.Clinic:
                    var clinicAppointments = await GetClinicAppointmentsAsync(userId);
                    return Ok(clinicAppointments);
                default:
                    return BadRequest(new { message = "Invalid role." });
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

        private async Task<List<MedicalRecord>> GetDoctorRecordsAsync(int userId)
        {
            var doctor = await _dbContext.Doctors.FirstOrDefaultAsync(d => d.UserID == userId);
            if (doctor == null)
                return [];

            var records = await _dbContext.MedicalRecords
                .Include(a => a.Patient)
                .Include(a => a.Appointment)
                .Include(a => a.Appointment!.Clinic)
                .Where(a => a.DoctorID == doctor.DoctorID)
                .ToListAsync();

            return records;
        }

        private async Task<List<MedicalRecord>> GetClinicRecordsAsync(int userId)
        {
            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return [];

            var clinicStaff = await _dbContext.ClinicStaffs.FirstOrDefaultAsync(s => s.UserID == userId);
            if (clinicStaff == null)
                return [];

            var clinic = await _dbContext.Clinics.FindAsync(clinicStaff.ClinicID);
            if (clinic == null)
                return [];

            var records = await _dbContext.MedicalRecords
                .Include(a => a.Patient)
                .Include(a => a.Appointment)
                .Include(a => a.Appointment!.Clinic)
                .Where(a => a.Appointment!.ClinicID == clinic!.ClinicID)
                .ToListAsync();

            return records;
        }

        private async Task<List<Appointment>> GetClientAppointmentsAsync(int userId, string? status)
        {
            var patients = await _dbContext.Patients
                .Where(p => p.UserID == userId && !p.IsDeleted)
                .ToListAsync();

            if (patients.Count == 0)
                return [];

            var patientIds = patients.Select(p => p.PatientID);

            var query = _dbContext.Appointments
                .Where(a => patientIds.Contains(a.PatientID));

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(a => a.Status == status);
            }

            var appointments = await query
                .Include(a => a.Clinic)
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Include(a => a.Doctor!.User)
                .ToListAsync();

            return appointments;
        }

        private async Task<List<Appointment>> GetDoctorAppointmentsAsync(int userId, string? status = null)
        {
            var doctor = await _dbContext.Doctors.FirstOrDefaultAsync(d => d.UserID == userId);

            if (doctor == null)
                return [];

             var query = _dbContext.Appointments
                .Where(a => a.DoctorID == doctor.DoctorID);

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(a => a.Status == status);
            }

            var appointments = await query
                .Include(a => a.Clinic)
                .Include(a => a.Patient)
                .Include(a => a.Clinic)
                .Include(a => a.Doctor)
                .ThenInclude(d => d!.User)
                .ToListAsync();

            return appointments;
        }
        private async Task<List<Appointment>> GetClinicAppointmentsAsync(int userId)
        {
            var clinicStaff = await _dbContext.ClinicStaffs
                .FirstOrDefaultAsync(s => s.UserID == userId);

            if (clinicStaff == null)
                return [];
                
            var appointments = await _dbContext.Appointments
                .Where(a => a.ClinicID == clinicStaff.ClinicID)
                .Include(a => a.Clinic)
                .Include(a => a.Patient)
                .Include(a => a.Clinic)
                .Include(a => a.Doctor)
                .ThenInclude(d => d!.User)
                .ToListAsync();

            return appointments;
        }
    }
}