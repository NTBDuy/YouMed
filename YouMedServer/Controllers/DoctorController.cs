using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YouMedServer.Models.Entities;
using YouMedServer.Models.DTOs;
using Microsoft.AspNetCore.Identity;
using static YouMedServer.Models.Entities.User;

namespace YouMedServer.Controllers
{

    [Route("api/doctor")]
    [ApiController]
    public class DoctorController : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        private readonly PasswordHasher<User> _passwordHasher;

        public DoctorController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
            _passwordHasher = new PasswordHasher<User>();
        }

        // GET: api/doctor
        // Lấy thông tin bác sĩ dựa theo UserID
        [HttpGet]
        public async Task<IActionResult> GetDoctorByUserID([FromQuery] int userId)
        {
            var doctor = await _dbContext.Doctors.FirstOrDefaultAsync(d => d.UserID == userId);
            if (doctor == null)
                return NotFound(new { message = "Doctor not found." });

            return Ok(doctor);
        }

        // GET: api/doctor/stats
        // Lấy tổng quan số lượng lịch hẹn trong ngày của bác sĩ theo UserID
        [HttpGet("stats")]
        public async Task<IActionResult> GetDoctorStatsForToday([FromQuery] int userId)
        {
            var doctor = await _dbContext.Doctors.FirstOrDefaultAsync(d => d.UserID == userId);
            if (doctor == null)
                return NotFound(new { message = "Doctor not found." });

            var today = DateTime.Today;

            var appointments = await _dbContext.Appointments
                .Where(a => a.DoctorID == doctor.DoctorID && a.AppointmentDate.Date == today)
                .ToListAsync();

            var data = new DoctorStatsDTO
            {
                Upcoming = appointments.Count(a => a.Status == "Scheduled"),
                Completed = appointments.Count(a => a.Status == "Completed"),
                Cancelled = appointments.Count(a => a.Status == "Cancelled"),
                Total = appointments.Count - appointments.Count(a => a.Status == "Pending")
            };

            return Ok(data);
        }

        // GET: api/doctor/appointment?userId={userId}?status={status}
        // Lấy danh sách lịch hẹn của bác sĩ theo trạng thái (Scheduled, Completed, Cancelled)
        [HttpGet("appointments")]
        public async Task<IActionResult> GetUpcomingAppointment([FromQuery] int userId, [FromQuery] string status)
        {
            var doctor = await _dbContext.Doctors.FirstOrDefaultAsync(d => d.UserID == userId);
            if (doctor == null)
                return NotFound(new { message = "Doctor not found." });

            var appointments = await _dbContext.Appointments
                .Include(a => a.Patient)
                .Where(a => a.DoctorID == doctor.DoctorID && a.Status == status)
                .ToListAsync();

            if (appointments == null)
                return NotFound(new { message = "No appointments found for this doctor." });

            return Ok(appointments);
        }

        // GET: api/doctor/schedule
        // Lấy lịch làm việc của bác sĩ
        [HttpGet("schedule")]
        public async Task<IActionResult> GetDoctorSchedule([FromQuery] int userId)
        {
            var doctor = await _dbContext.Doctors.FirstOrDefaultAsync(d => d.UserID == userId);
            if (doctor == null)
                return NotFound(new { message = "Doctor not found." });

            var schedules = await _dbContext.DoctorSchedules
                .Where(s => s.DoctorID == doctor.DoctorID)
                .ToListAsync();

            return Ok(schedules);
        }

        // POST: api/doctor
        // Tạo mới bác sĩ bởi nhân viên phòng khám (ClinicStaff)
        [HttpPost]
        public async Task<IActionResult> CreateNewDoctorByClinicStaff([FromBody] DoctorDTO dto, [FromQuery] int userId)
        {
            if (await _dbContext.Users.AnyAsync(u => u.PhoneNumber == dto.PhoneNumber))
                return BadRequest(new { message = "Phone number already exists." });

            if (await _dbContext.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest(new { message = "Email already exists." });

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            var clinicStaff = await _dbContext.ClinicStaffs.FirstOrDefaultAsync(s => s.UserID == userId);
            if (clinicStaff == null)
                return NotFound(new { message = "This user does not belong to any clinic." });

            var clinic = await _dbContext.Clinics.FindAsync(clinicStaff.ClinicID);
            if (clinic == null)
                return NotFound(new { message = "Clinic not found." });

            var newUser = new User
            {
                PhoneNumber = dto.PhoneNumber,
                Email = dto.Email,
                Fullname = dto.FullName,
                PasswordHash = _passwordHasher.HashPassword(null!, "P@ssword123"),
                // Role = "Doctor",
                Role = UserRole.Doctor,
                CreatedAt = DateTime.Now
            };

            _dbContext.Users.Add(newUser);
            await _dbContext.SaveChangesAsync();

            var doctor = new Doctor
            {
                UserID = newUser.UserID,
                User = newUser,
                Introduction = dto.Introduction,
                Experience = dto.Experience,
                ClinicID = clinic.ClinicID
            };

            _dbContext.Doctors.Add(doctor);

            await _dbContext.SaveChangesAsync();

            foreach (var specialtyId in dto.SpecialtyIDs)
            {
                var specialty = await _dbContext.Specialties.FindAsync(specialtyId);
                if (specialty == null)
                    return NotFound(new { message = $"Specialty with ID {specialtyId} not found." });

                var doctorSpecialty = new DoctorSpecialty
                {
                    DoctorID = doctor.DoctorID,
                    SpecialtyID = specialtyId
                };
                _dbContext.DoctorSpecialties.Add(doctorSpecialty);
            }
            await _dbContext.SaveChangesAsync();
            return Ok(new { message = "Doctor created successfully." });
        }


        // GET: api/doctor/{doctorId}/detail
        // Lấy chi tiết thông tin bác sĩ theo DoctorID (bao gồm User và chuyên khoa)
        [HttpGet("{doctorId}/detail")]
        public async Task<IActionResult> GetDoctorDetailByID(int doctorId)
        {
            var doctor = await _dbContext.Doctors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.DoctorID == doctorId);

            if (doctor == null)
                return NotFound(new { message = "Doctor not found." });


            var specialties = await _dbContext.DoctorSpecialties
                    .Where(cs => cs.DoctorID == doctor.DoctorID)
                    .Include(cs => cs.Specialty)
                    .Select(cs => new SpecialtyDto
                    {
                        SpecialtyID = cs.Specialty!.SpecialtyID,
                        Name = cs.Specialty.Name
                    })
                    .ToListAsync();

            var doctorResponse = new DoctorResponseDTO
            {
                DoctorID = doctor.DoctorID,
                Introduction = doctor.Introduction,
                Experience = doctor.Experience,
                UserID = doctor.UserID,
                User = doctor.User,
                ClinicID = doctor.ClinicID,
                Clinic = doctor.Clinic,
                Specialties = specialties
            };

            return Ok(doctorResponse);
        }

        // PUT: api/doctor/{doctorId}
        // Cập nhật thông tin bác sĩ (User + giới thiệu + kinh nghiệm)
        [HttpPut("{doctorId}")]
        public async Task<IActionResult> UpdateInformation([FromBody] DoctorDTO dto, int doctorId)
        {
            var doctor = await _dbContext.Doctors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.DoctorID == doctorId);

            if (doctor == null)
                return NotFound(new { message = "Doctor not found." });

            doctor.User.Fullname = dto.FullName;
            doctor.User.Email = dto.Email;
            doctor.User.PhoneNumber = dto.PhoneNumber;
            doctor.Introduction = dto.Introduction;
            doctor.Experience = dto.Experience;

            var existingSpecialties = await _dbContext.DoctorSpecialties
                .Where(ds => ds.DoctorID == doctorId)
                .ToListAsync();
            _dbContext.DoctorSpecialties.RemoveRange(existingSpecialties);

            foreach (var specialtyId in dto.SpecialtyIDs)
            {
                var specialty = await _dbContext.Specialties.FindAsync(specialtyId);
                if (specialty == null)
                    return NotFound(new { message = $"Specialty with ID {specialtyId} not found." });

                var doctorSpecialty = new DoctorSpecialty
                {
                    DoctorID = doctor.DoctorID,
                    SpecialtyID = specialtyId
                };
                _dbContext.DoctorSpecialties.Add(doctorSpecialty);
            }
            
            await _dbContext.SaveChangesAsync();
            return Ok();
        }

        // DELETE: api/doctor/{doctorId}
        // Xóa bác sĩ khỏi hệ thống theo DoctorID 
        [HttpDelete("{doctorId}")]
        public async Task<IActionResult> DeleteDoctor(int doctorId)
        {
            var doctor = await _dbContext.Doctors.FindAsync(doctorId);
            if (doctor == null)
                return NotFound(new { message = "Doctor not found." });

            bool hasAppointments = await _dbContext.Appointments.AnyAsync(a => a.DoctorID == doctorId);

            if (hasAppointments)
            {
                doctor.IsDeleted = true;
                await _dbContext.SaveChangesAsync();
                return Ok(new { message = "Doctor marked as deleted due to existing appointments." });
            }

            _dbContext.Doctors.Remove(doctor);
            var user = await _dbContext.Users.FindAsync(doctor.UserID);
            if (user != null)
            {
                _dbContext.Users.Remove(user);
            }
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Doctor deleted successfully." });
        }
    }
}