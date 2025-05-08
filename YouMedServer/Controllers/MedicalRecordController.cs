using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YouMedServer.Models.DTOs;
using YouMedServer.Models.Entities;

namespace YouMedServer.Controllers
{
    [Route("api/record")]
    [ApiController]
    public class MedicalRecordController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public MedicalRecordController(AppDbContext context)
        {
            _dbContext = context;
        }

        // GET: api/record/{recordId}
        // Lấy thông tin chi tiết hồ sơ bệnh án theo RecordID
        [HttpGet("{recordId}")]
        public async Task<IActionResult> GetRecord(int recordId)
        {
            if (recordId <= 0)
            {
                return BadRequest(new { message = "Invalid record ID" });
            }

            var record = await _dbContext.MedicalRecords
                .Include(r => r.Patient)
                .Include(r => r.Doctor)
                    .ThenInclude(d => d!.User)
                .Include(r => r.Appointment)
                    .ThenInclude(a => a!.Clinic)

                .FirstOrDefaultAsync(r => r.RecordID == recordId);

            if (record == null)
                return NotFound(new { message = $"Record not found with ID {recordId}" });

            return Ok(record);
        }

        // GET: api/record/{recordId}/paraclinical
        // Lấy danh sách kết quả dịch vụ cận lâm sàng theo RecordID
        [HttpGet("{recordId}/paraclinical")]
        public async Task<IActionResult> GetParaclinicalServices(int recordId)
        {
            var services = await _dbContext.AppointmentClinicalServices
                .Include(s => s.ClinicalService)
                .Include(s => s.Appointment)
                    .ThenInclude(a => a!.Clinic)
                .Where(s => s.RecordID == recordId)
                .ToListAsync();

            if (services.Count == 0)
                return NotFound(new { message = "No paraclinical services found for this record." });

            return Ok(services);
        }


        // POST: api/record
        // Tạo mới hồ sơ bệnh án (Medical Record)
        [HttpPost]
        public async Task<IActionResult> CreateNewRecord([FromBody] MedicalRecordDTO dto)
        {
            var doctor = await _dbContext.Doctors.FirstOrDefaultAsync(d => d.DoctorID == dto.DoctorID);
            var patient = await _dbContext.Patients.FirstOrDefaultAsync(p => p.PatientID == dto.PatientID);
            var appointment = await _dbContext.Appointments.FirstOrDefaultAsync(a => a.AppointmentID == dto.AppointmentID);

            if (doctor == null || patient == null || appointment == null)
                return NotFound(new
                {
                    message = "One or more required resources were not found.",
                    details = new
                    {
                        DoctorNotFound = doctor == null ? $"Doctor with ID {dto.DoctorID} not found." : "Founded",
                        PatientNotFound = patient == null ? $"Patient with ID {dto.PatientID} not found." : "Founded",
                        AppointmentNotFound = appointment == null ? $"Appointment with ID {dto.AppointmentID} not found." : "Founded"
                    }
                });

            var newRecord = new MedicalRecord
            {
                PatientID = dto.PatientID,
                DoctorID = dto.DoctorID,
                AppointmentID = dto.AppointmentID,
                Diagnosis = dto.Diagnosis,
                Prescription = dto.Prescription,
                Notes = dto.Notes,
                FollowUpDate = dto.FollowUpDate,
                PreviousRecordID = dto.PreviousRecordID,
                CreatedAt = DateTime.Now
            };

            await _dbContext.MedicalRecords.AddAsync(newRecord);
            await _dbContext.SaveChangesAsync();

            var relatedServices = await _dbContext.AppointmentClinicalServices
                .Where(s => s.AppointmentID == dto.AppointmentID && s.Status == "Completed")
                .ToListAsync();

            foreach (var service in relatedServices)
            {
                service.RecordID = newRecord.RecordID;
            }

            

            appointment.AppointmentService = "COMPLETED";

            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Created new record!" });
        }

        // PUT: api/record/{recordId}/FollowUp
        // Cập nhật trạng thái đã lên lịch tái khám của hồ sơ bệnh án
        [HttpPut("{recordId}/followup")]
        public async Task<IActionResult> UpdateRecordFollowUpStatus(int recordId)
        {
            var record = await _dbContext.MedicalRecords.FindAsync(recordId);

            if (record == null)
                return NotFound(new { message = "Record not found." });

            record.IsScheduleFollowUp = !record.IsScheduleFollowUp;

            _dbContext.MedicalRecords.Update(record);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Record follow-up status updated successfully." });
        }
    }
}