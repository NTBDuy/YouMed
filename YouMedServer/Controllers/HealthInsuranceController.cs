using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YouMedServer.Models.Entities;
using YouMedServer.Models.DTOs;
using Microsoft.AspNetCore.Identity;

namespace YouMedServer.Controllers
{
    [Route("api/insurance")]
    [ApiController]
    public class HealthInsuranceController : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        public HealthInsuranceController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // GET: api/insurance/{patientId}
        // Lấy thông tin bảo hiểm y tế theo PatientID
        [HttpGet("{patientId}")]
        public async Task<IActionResult> GetInsuranceByPatinetID(int patientId)
        {
            var insurance = await _dbContext.HealthInsurances
                .FirstOrDefaultAsync(i => i.PatientID == patientId);

            if (insurance == null)
                return NotFound(new { message = "Insurance not found." });

            return Ok(insurance);
        }

        // POST: api/insurance
        // Thêm mới thông tin bảo hiểm y tế cho bệnh nhân
        [HttpPost]
        public async Task<IActionResult> AddInsurance([FromBody] InsuranceDTO dto)
        {
            var patient = await _dbContext.Patients.FindAsync(dto.PatientID);
            if (patient == null)
                return BadRequest(new { message = "Patient not found." });

            var newinsurance = new HealthInsurance
            {
                HealthInsuranceID = dto.HealthInsuranceID,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                InitialMedicalFacility = dto.InitialMedicalFacility,
                UpdatedAt = DateTime.Now,
                PatientID = dto.PatientID
            };

            _dbContext.HealthInsurances.Add(newinsurance);
            await _dbContext.SaveChangesAsync();
            return Ok(new { message = "Insurance added successfully." });
        }

        // PUT: api/insurance
        // Cập nhật thông tin bảo hiểm y tế cho bệnh nhân
        [HttpPut]
        public async Task<IActionResult> UpdateInsurance([FromBody] InsuranceDTO dto)
        {
            var insurance = await _dbContext.HealthInsurances
                .FirstOrDefaultAsync(i => i.PatientID == dto.PatientID);

            if (insurance == null)
                return NotFound(new { message = "Insurance not found for this patient." });

            _dbContext.HealthInsurances.Remove(insurance);
            await _dbContext.SaveChangesAsync();

            var newInsurance = new HealthInsurance
            {
                HealthInsuranceID = dto.HealthInsuranceID,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                InitialMedicalFacility = dto.InitialMedicalFacility,
                UpdatedAt = DateTime.Now,
                PatientID = dto.PatientID
            };

            _dbContext.HealthInsurances.Add(newInsurance);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Insurance updated successfully." });
        }
    }
}