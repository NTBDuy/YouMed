using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YouMedServer.Models.Entities;
using YouMedServer.Models.DTOs;

namespace YouMedServer.Controllers
{

    [Route("api/clinic")]
    [ApiController]
    public class ClinicController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public ClinicController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // GET: api/clinic/stats/{userId}
        // Lấy tổng quan số lượng lịch hẹn trong ngày của phòng khám theo UserID của nhân viên phòng khám
        [HttpGet("stats/{userId}")]
        public async Task<IActionResult> GetClinicStatsForToday(int userId)
        {
            var (clinic, error) = await GetClinicFromUserId(userId);
            if (error != null)
                return error;

            var today = DateTime.Today;

            var appointments = await _dbContext.Appointments
                .Where(a => a.ClinicID == clinic!.ClinicID && a.AppointmentDate.Date == today)
                .ToListAsync();

            var data = new ClinicStatsDTO
            {
                TodayAppointments = appointments.Count,
                CompletedAppointments = appointments.Count(a => a.Status == "Completed"),
                PendingAppointments = appointments.Count(a => a.Status == "Pending"),
                ScheduledAppointments = appointments.Count(a => a.Status == "Scheduled")
            };

            return Ok(data);
        }

        // GET: api/clinic/information/{userId}
        // Lấy thông tin chi tiết của phòng khám mà nhân viên đang làm việc
        [HttpGet("information/{userId}")]
        public async Task<IActionResult> GetClinicInformation(int userId)
        {
            var (clinic, error) = await GetClinicFromUserId(userId);
            if (error != null)
                return error;

            return Ok(clinic);
        }

        // GET: api/clinic/list
        // Lấy danh sách tất cả phòng khám
        [HttpGet("list")]
        public async Task<IActionResult> GetClinics()
        {
            var clinics = await _dbContext.Clinics.ToListAsync();

            var clinicResponses = new List<ClinicResponseDTO>();

            foreach (var clinic in clinics)
            {
                var specialties = await _dbContext.ClinicSpecialties
                    .Where(cs => cs.ClinicID == clinic.ClinicID)
                    .Include(cs => cs.Specialty)
                    .Select(cs => new SpecialtyDto
                    {
                        SpecialtyID = cs.Specialty!.SpecialtyID,
                        Name = cs.Specialty.Name
                    })
                    .ToListAsync();

                var workingHours = await _dbContext.ClinicWorkingHours
                    .Where(wh => wh.ClinicID == clinic.ClinicID)
                    .ToListAsync();

                clinicResponses.Add(new ClinicResponseDTO
                {
                    ClinicID = clinic.ClinicID,
                    Name = clinic.Name,
                    ClinicAddress = clinic.ClinicAddress,
                    Introduction = clinic.Introduction,
                    PhoneNumber = clinic.PhoneNumber,
                    CreatedAt = clinic.CreatedAt,
                    Specialties = specialties,
                    clinicWorkingHours = workingHours
                });
            }

            return Ok(clinicResponses);
        }


        // GET: api/clinic/specialty
        // Lấy danh sách các chuyên khoa (Specialties)
        [HttpGet("specialty")]
        public async Task<IActionResult> GetSpecialites()
        {
            var specialtyNames = await _dbContext.Specialties.ToListAsync();

            return Ok(specialtyNames);
        }

        // GET: api/clinic/{clinicId}/doctors
        // Lấy danh sách bác sĩ theo ClinicID
        [HttpGet("{clinicId}/doctors")]
        public async Task<IActionResult> GetDoctorsByClinicId(int clinicId)
        {
            var hasDoctors = await _dbContext.Doctors.AnyAsync(d => d.ClinicID == clinicId);
            if (!hasDoctors)
                return NotFound(new { message = "No doctors found." });

            var doctors = await _dbContext.Doctors
                .Where(a => a.ClinicID == clinicId && !a.IsDeleted)
                .Include(a => a.User)
                .Include(a => a.Clinic)
                .ToListAsync();

            var doctorResponses = new List<DoctorResponseDTO>();

            foreach (var doctor in doctors)
            {
                var specialties = await _dbContext.DoctorSpecialties
                    .Where(cs => cs.DoctorID == doctor.DoctorID)
                    .Include(cs => cs.Specialty)
                    .Select(cs => new SpecialtyDto
                    {
                        SpecialtyID = cs.Specialty!.SpecialtyID,
                        Name = cs.Specialty.Name
                    })
                    .ToListAsync();

                doctorResponses.Add(new DoctorResponseDTO
                {
                    DoctorID = doctor.DoctorID,
                    Introduction = doctor.Introduction,
                    Experience = doctor.Experience,
                    UserID = doctor.UserID,
                    User = doctor.User,
                    ClinicID = doctor.ClinicID,
                    Clinic = doctor.Clinic,
                    Specialties = specialties
                });
            }

            return Ok(doctorResponses);
        }

        // GET: api/clinic/doctor/{userId}
        // Lấy danh sách bác sĩ theo UserID của nhân viên phòng khám
        [HttpGet("doctor/{userId}")]
        public async Task<IActionResult> GetDoctorsByClinicStaffUser(int userId)
        {
            var (clinic, error) = await GetClinicFromUserId(userId);
            if (error != null)
                return error;

            var doctors = await _dbContext.Doctors
                .Include(d => d.User)
                .Where(d => d.ClinicID == clinic!.ClinicID && !d.IsDeleted)
                .ToListAsync();

            if (doctors.Count == 0)
                return NotFound(new { message = "The clinic doesn't have any doctors!" });

            var doctorResponses = new List<DoctorResponseDTO>();

            foreach (var doctor in doctors)
            {
                var specialties = await _dbContext.DoctorSpecialties
                    .Where(cs => cs.DoctorID == doctor.DoctorID)
                    .Include(cs => cs.Specialty)
                    .Select(cs => new SpecialtyDto
                    {
                        SpecialtyID = cs.Specialty!.SpecialtyID,
                        Name = cs.Specialty.Name
                    })
                    .ToListAsync();

                doctorResponses.Add(new DoctorResponseDTO
                {
                    DoctorID = doctor.DoctorID,
                    Introduction = doctor.Introduction,
                    Experience = doctor.Experience,
                    UserID = doctor.UserID,
                    User = doctor.User,
                    ClinicID = doctor.ClinicID,
                    Clinic = doctor.Clinic,
                    Specialties = specialties
                });
            }

            return Ok(doctorResponses);
        }

        // GET: api/clinic/records/{userId}
        // Lấy danh sách hồ sơ bệnh án của phòng khám theo UserID của nhân viên phòng khám
        [HttpGet("records/{userId}")]
        public async Task<IActionResult> GetRecordsByClinicStaffUser(int userId)
        {
            var (clinic, error) = await GetClinicFromUserId(userId);
            if (error != null)
                return error;

            var records = await _dbContext.MedicalRecords
                .Include(a => a.Patient)
                .Include(a => a.Appointment)
                .Include(a => a.Appointment!.Clinic)
                .Where(a => a.Appointment!.ClinicID == clinic!.ClinicID)
                .ToListAsync();

            if (records.Count == 0)
                return NotFound(new { message = "No records found for this clinic." });

            return Ok(records);
        }

        // GET: api/appointment/services
        // lấy danh sách dịch vụ khám cận lâm sàng của phòng khám
        [HttpGet("{clinicId}/services")]
        public async Task<IActionResult> GetClinicalServices(int clinicId)
        {
            var clinic = await _dbContext.Clinics.FindAsync(clinicId);
            if (clinic == null)
                return NotFound(new { message = "Could not find any clinic with ID = " + clinicId});
            
            var services = await _dbContext.ClinicalServices
                    .Where(s => s.ClinicID == clinicId)
                    .ToListAsync();

            if (services.Count == 0)
                return NotFound(new { message = "This clinic doesn't have any services!" });

            return Ok(services);
        }

        // PUT: api/clinic/information
        // Cập nhật thông tin phòng khám
        [HttpPut("information")]
        public async Task<IActionResult> UpdateClinicInformation([FromBody] ClinicDTO dto)
        {
            var clinic = await _dbContext.Clinics.FindAsync(dto.ClinicID);
            if (clinic == null)
                return NotFound(new { message = "Clinic not found." });

            clinic.Name = dto.Name;
            clinic.ClinicAddress = dto.ClinicAddress;
            clinic.Introduction = dto.Introduction;
            clinic.PhoneNumber = dto.PhoneNumber;

            await _dbContext.SaveChangesAsync();
            return Ok(new { message = "Clinic updated succesfully!" });
        }

        private async Task<(Clinic? clinic, IActionResult? error)> GetClinicFromUserId(int userId)
        {
            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return (null, NotFound(new { message = "User not found." }));

            var clinicStaff = await _dbContext.ClinicStaffs.FirstOrDefaultAsync(s => s.UserID == userId);
            if (clinicStaff == null)
                return (null, NotFound(new { message = "This user does not belong to any clinic." }));

            var clinic = await _dbContext.Clinics.FindAsync(clinicStaff.ClinicID);
            if (clinic == null)
                return (null, NotFound(new { message = "Clinic not found." }));

            return (clinic, null);
        }

        // GET: api/clinic/user/{userId}/working-hours
        // Lấy danh sách giờ làm việc của phòng khám theo UserID của nhân viên phòng khám
        [HttpGet("user/{userId}/working-hours")]
        public async Task<IActionResult> GetWorkingHours(int userId)
        {
            var (clinic, error) = await GetClinicFromUserId(userId);
            if (error != null)
                return NotFound(new { message = "Clinic not found." });

            var workingHours = await _dbContext.ClinicWorkingHours
                .Where(wh => wh.ClinicID == clinic!.ClinicID)
                .ToListAsync();

            return Ok(workingHours);
        }

        // PUT: api/clinic/user/{userId}/working-hours
        // Cập nhật giờ làm việc của phòng khám theo UserID của nhân viên phòng khám
        [HttpPut("user/{userId}/working-hours")]
        public async Task<IActionResult> UpdateWorkingHours(int userId, [FromBody] List<ClinicWorkingHourDTO> workingHoursDto)
        {
            var (clinic, error) = await GetClinicFromUserId(userId);
            if (error != null)
                return NotFound(new { message = "Clinic not found." });

            var existingWorkingHours = await _dbContext.ClinicWorkingHours
                .Where(wh => wh.ClinicID == clinic!.ClinicID)
                .ToListAsync();

            _dbContext.ClinicWorkingHours.RemoveRange(existingWorkingHours);

            var newWorkingHours = workingHoursDto.Select(dto => new ClinicWorkingHours
            {
                ClinicID = clinic!.ClinicID,
                DayOfWeek = dto.DayOfWeek,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                IsActive = dto.IsActive,
                LastUpdated = DateTime.UtcNow
            }).ToList();

            await _dbContext.ClinicWorkingHours.AddRangeAsync(newWorkingHours);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Working hours updated successfully!" });
        }
    }
}