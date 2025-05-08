using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YouMedServer.Models.DTOs;
using YouMedServer.Models.Entities;

namespace YouMedServer.Controllers
{
    [Route("api/patient")]
    [ApiController]
    public class PatientController : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        public PatientController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // GET: api/patient/{patientId}
        // Lấy thông tin chi tiết bệnh nhân theo PatientID
        [HttpGet("{patientId}")]
        public async Task<IActionResult> GetPatientsById(int patientId)
        {
            var patients = await _dbContext.Patients
                .FirstOrDefaultAsync(p => p.PatientID == patientId);

            if (patients == null)
                return NotFound(new { message = "Patient not found for this User!" });

            return Ok(patients);
        }

        // POST: api/patient
        // Thêm bệnh nhân mới vào hệ thống
        [HttpPost]
        public async Task<IActionResult> AddPatient([FromBody] PatientDTO dto)
        {
            var user = await _dbContext.Users.FindAsync(dto.UserID);
            if (user == null)
                return BadRequest(new { message = "User not found." });

            var existingSelfPatient = await _dbContext.Patients
                .FirstOrDefaultAsync(p => p.Relationship == "Self" && p.UserID == dto.UserID);

            if (existingSelfPatient != null && dto.Relationship == "Self")
                return BadRequest(new { message = "User already has a self relationship." });

            var newPatient = new Patient
            {
                Fullname = dto.Fullname,
                PhoneNumber = dto.PhoneNumber,
                EmailAddress = dto.EmailAddress,
                DateOfBirth = dto.DateOfBirth,
                Gender = dto.Gender,
                HomeAddress = dto.HomeAddress,
                CitizenID = dto.CitizenID,
                Relationship = dto.Relationship,
                User = user
            };

            _dbContext.Patients.Add(newPatient);
            await _dbContext.SaveChangesAsync();
            return Ok(new { message = "Patient added successfully." });
        }

        

        // PUT: api/patient/{patientId}
        // Cập nhật thông tin bệnh nhân theo PatientID
        [HttpPut("{patientId}")]
        public async Task<IActionResult> UpdatePatient(int patientId, [FromBody] PatientDTO dto)
        {
            var patient = await _dbContext.Patients.FindAsync(patientId);
            if (patient == null)
                return NotFound(new { message = "Patient not found!" });

            if (dto.Relationship == "Self")
            {
                var existingSelfPatient = await _dbContext.Patients
                    .FirstOrDefaultAsync(p => p.UserID == dto.UserID && p.Relationship == "Self");

                if (existingSelfPatient != null)
                    return BadRequest(new { message = "User already has a self relationship." });
            }

            patient.Fullname = dto.Fullname;
            patient.PhoneNumber = dto.PhoneNumber;
            patient.EmailAddress = dto.EmailAddress;
            patient.DateOfBirth = dto.DateOfBirth;
            patient.Gender = dto.Gender;
            patient.HomeAddress = dto.HomeAddress;
            patient.CitizenID = dto.CitizenID;
            patient.Relationship = dto.Relationship;

            await _dbContext.SaveChangesAsync();
            return Ok(new { message = "Profile updated successfully." });
        }

        // DELETE: api/patient/{patientId}
        // Xóa bệnh nhân theo PatientID
        [HttpDelete("{patientId}")]
        public async Task<IActionResult> DeletePatient(int patientId)
        {
            var patient = await _dbContext.Patients.FindAsync(patientId);
            if (patient == null)
                return NotFound(new { message = "Patient not found." });

            bool hasAppointments = await _dbContext.Appointments.AnyAsync(e => e.PatientID == patientId);

            if (hasAppointments)
            {
                patient.IsDeleted = true;
                await _dbContext.SaveChangesAsync();
                return Ok(new { message = "Patient marked as deleted due to existing appointments." });
            }

            _dbContext.Patients.Remove(patient);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Patient deleted successfully." });
        }
    }
}