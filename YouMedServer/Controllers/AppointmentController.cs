using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YouMedServer.Models.DTOs;
using YouMedServer.Models.Entities;

namespace YouMedServer.Controllers
{
    [Route("api/appointment")]
    [ApiController]
    public class AppointmentController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public AppointmentController(AppDbContext context)
        {
            _dbContext = context;
        }

        // GET: api/appointment/{appointmentId}
        // Lấy chi tiết lịch hẹn theo AppointmentID
        [HttpGet("{appointmentId}")]
        public async Task<ActionResult<Appointment>> GetAppointment(int appointmentId)
        {
            var appointment = await _dbContext.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Clinic)
                .Include(a => a.Doctor)
                .Include(a => a.Doctor!.User)
                .FirstOrDefaultAsync(a => a.AppointmentID == appointmentId);

            if (appointment == null)
            {
                return NotFound();
            }

            return appointment;
        }

        // GET: api/appointment/user/{userId}
        // Lấy danh sách tất cả lịch hẹn của người dùng theo UserID
        // [HttpGet("user/{userId}")]
        // public async Task<IActionResult> GetAppointmentsByUserId(int userId)
        // {
        //     var hasAppointments = await _dbContext.Appointments
        //         .AnyAsync(a => a.Patient!.UserID == userId);

        //     if (!hasAppointments)
        //     {
        //         return NotFound(new { message = $"No appointments found for user ID {userId}." });
        //     }

        //     var appointments = await _dbContext.Appointments
        //         .Where(a => a.Patient!.UserID == userId)
        //         .Include(a => a.Clinic)
        //         .Include(a => a.Patient)
        //         .Include(a => a.Doctor)
        //         .Include(a => a.Doctor!.User)
        //         .ToListAsync();

        //     return Ok(appointments);
        // }

        // GET: api/appointment/upcoming/{userId}
        // Lấy danh sách lịch hẹn sắp tới (Scheduled) của người dùng
        // [HttpGet("upcoming/{userId}")]
        // public async Task<IActionResult> GetUpcomingAppointmentsForUser(int userId)
        // {
        //     var patients = await _dbContext.Patients
        //         .Where(p => p.UserID == userId && !p.IsDeleted)
        //         .ToListAsync();

        //     if (!patients.Any())
        //     {
        //         return NotFound(new { message = "No patients found for this UserID." });
        //     }

        //     var appointments = await _dbContext.Appointments
        //         .Where(a => patients.Select(p => p.PatientID).Contains(a.PatientID) && a.Status == "Scheduled")
        //         .Include(a => a.Clinic)
        //         .Include(a => a.Doctor)
        //         .Include(a => a.Doctor!.User)
        //         .ToListAsync();

        //     return Ok(appointments);
        // }

        // GET: api/appointment/doctor/{userId}
        // Lấy danh sách lịch hẹn của bác sĩ theo UserID
        // [HttpGet("doctor/{userId}")]
        // public async Task<IActionResult> GetAppointmentsForDoctor(int userId)
        // {
        //     var doctor = await _dbContext.Doctors.FirstOrDefaultAsync(d => d.UserID == userId);

        //     if (doctor == null)
        //         return NotFound(new { message = "No doctor found for this userId." });

        //     var appointment = await _dbContext.Appointments
        //         .Where(a => a.DoctorID == doctor.DoctorID)
        //         .Include(a => a.Patient)
        //         .Include(a => a.Clinic)
        //         .Include(a => a.Doctor!.User)
        //         .ToListAsync();

        //     return Ok(appointment);
        // }


        // GET: api/appointment/{appointmentId}/record
        // Lấy hồ sơ bệnh án (Medical Record) liên quan đến lịch hẹn theo AppointmentID
        [HttpGet("{appointmentId}/record")]
        public async Task<IActionResult> GetRecordByAppointmentID(int appointmentId)
        {
            var record = await _dbContext.MedicalRecords
                .Include(r => r.Patient)
                .Include(r => r.Doctor)
                    .ThenInclude(d => d!.User)
                .Include(r => r.Appointment)
                    .ThenInclude(a => a!.Clinic)
                .FirstOrDefaultAsync(r => r.AppointmentID == appointmentId);

            if (record == null)
                return NotFound(new { message = "Record not found for appointment id " + appointmentId });

            return Ok(record);
        }

        // GET: api/appointment/{appointmentId}/record/id
        // Lấy RecordID của hồ sơ bệnh án theo AppointmentID
        [HttpGet("{appointmentId}/record/id")]
        public async Task<IActionResult> GetRecordIDByAppointmentID(int appointmentId)
        {
            var record = await _dbContext.MedicalRecords
                .FirstOrDefaultAsync(r => r.AppointmentID == appointmentId);

            if (record == null)
                return NotFound(new { message = "Record not found with appointment id " + appointmentId });

            return Ok(record.RecordID);
        }

        // POST: api/appointment
        // Đặt lịch hẹn mới (Booking Appointment)
        [HttpPost]
        public async Task<IActionResult> BookAppointment([FromBody] BookingDTO dto)
        {
            var patient = await _dbContext.Patients.FindAsync(dto.PatientID);
            if (patient == null)
                return NotFound(new { message = "Patient not found!" });


            var clinic = await _dbContext.Clinics.FindAsync(dto.ClinicID);
            if (clinic == null)
                return NotFound(new { message = "Clinic not found!" });


            var doctor = await _dbContext.Doctors.FindAsync(dto.DoctorID);
            if (doctor == null)
                return NotFound(new { message = "Doctor not found!" });


            var newAppointment = new Appointment
            {
                Patient = patient,
                Clinic = clinic,
                Doctor = doctor,
                AppointmentDate = dto.AppointmentDate,
                Status = "Pending",
                SymptomNote = dto.SymptomNote,
                CreatedAt = DateTime.Now,
                AppointmentType = dto.AppointmentType,
                RelatedAppointmentID = dto.RelatedAppointmentID,
            };

            _dbContext.Appointments.Add(newAppointment);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Appointment booked successfully." });
        }

        // POST: api/appointment/{appointmentId}/service
        // Chỉ định khám cận lâm sàng
        [HttpPost("{appointmentId}/service")]
        public async Task<IActionResult> RequestService(int appointmentId, [FromBody] ServiceDTO dto)
        {
            var appointment = await _dbContext.Appointments.FindAsync(appointmentId);
            if (appointment == null)
                return NotFound(new { message = "Appointment not found!" });

            foreach (var service in dto.Services)
            {
                var newService = new AppointmentClinicalService
                {
                    AppointmentID = dto.AppointmentID,
                    ClinicalServiceID = service.ClinicalServiceID,
                    Note = service.Note,
                    CreatedAt = DateTime.Now,
                    Status = "PENDING",
                };

                _dbContext.AppointmentClinicalServices.Add(newService);
            }

            appointment.AppointmentService = "PENDING";
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Requested services successfully." });
        }

        // GET: api/appointment/service
        // Lấy danh sách mà bác sĩ đã chỉ định khám lâm sàng
        [HttpGet("{appointmentId}/service")]
        public async Task<IActionResult> RequestServiceList(int appointmentId)
        {
            var appointment = await _dbContext.Appointments.FindAsync(appointmentId);
            if (appointment == null)
                return NotFound(new { message = "Appointment not found!" });
            
            var services = await _dbContext.AppointmentClinicalServices
                    .Where(s => s.AppointmentID == appointmentId)
                    .Include(s => s.ClinicalService)
                    .ToListAsync();

            return Ok(services);
        }

        // PUT: api/appointment/service/{serviceId}/status
        // Cập nhật trạng thái của dịch vụ khám cận lâm sàng
        [HttpPut("service/{serviceId}/status")]
        public async Task<IActionResult> UpdateServiceStatus(int serviceId, [FromQuery] string status)
        {
            var service = await _dbContext.AppointmentClinicalServices.FindAsync(serviceId);
            if (service == null)
                return NotFound(new { message = "Service not found!" });

            service.Status = status;
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Service status updated successfully." });
        }

        // PUT: api/appointment/service/{serviceId}
        // Ghi nhận kết quả khám cận lâm sàng
        [HttpPut("service/{serviceId}")]
        public async Task<IActionResult> RecordServiceResult(int serviceId, [FromBody] ServiceResultDTO dto)
        {
            var service = await _dbContext.AppointmentClinicalServices.FindAsync(serviceId);
            if (service == null)
                return NotFound(new { message = "Service not found!" });

            service.ResultSummary = dto.ResultSummary;
            service.Conclusion = dto.Conclusion;
            service.Recommendations = dto.Recommendations;
            service.CompletedAt = DateTime.Now;
            service.Status = "COMPLETED";

            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Service result recorded successfully." });
        }

        // GET: api/appointment/service/check
        // Kiểm tra xem tất cả dịch vụ đã hoàn thành chưa
        [HttpGet("{appointmentId}/service/check")]
        public async Task<IActionResult> CheckAllServicesCompleted(int appointmentId)
        {
            var appointment = await _dbContext.Appointments.FindAsync(appointmentId);
            if (appointment == null)
                return NotFound(new { message = "Appointment not found!" });

            var services = await _dbContext.AppointmentClinicalServices
                .Where(s => s.AppointmentID == appointmentId)
                .ToListAsync();

            bool allCompleted = services.All(s => s.Status == "COMPLETED");

            return Ok(new { allCompleted });
        }

        // PUT: api/appointment/{appointmentId}/reschedule
        // Đặt lại lịch hẹn (Reschedule) theo AppointmentID
        [HttpPut("{appointmentId}/reschedule")]
        public async Task<IActionResult> RescheduleAppointment(int appointmentId, [FromBody] RescheduleDTO dto)
        {
            var appointment = await _dbContext.Appointments.FindAsync(appointmentId);
            if (appointment == null)
                return NotFound(new { message = "Appointment not found." });

            appointment.AppointmentDate = dto.AppointmentDate;
            appointment.Status = "Pending";
            appointment.SymptomNote = dto.SymptomNote;

            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Appointment rescheduled successfully." });
        }

        // PUT: api/appointment/{appointmentId}/status
        // Cập nhật trạng thái của lịch hẹn theo AppointmentID
        [HttpPut("{appointmentId}/status")]
        public async Task<IActionResult> UpdateStatus(int appointmentId, string status)
        {
            var appointment = await _dbContext.Appointments.FindAsync(appointmentId);
            if (appointment == null)
                return NotFound(new { message = "Appointment not found." });

            appointment.Status = status;
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Appointment update status successfully." });
        }
    }
}