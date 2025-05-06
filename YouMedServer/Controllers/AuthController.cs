using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YouMedServer.Models.Entities;
using YouMedServer.Models.DTOs;
using Microsoft.AspNetCore.Identity;

namespace YouMedServer.Controllers
{

    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        private readonly PasswordHasher<User> _passwordHasher;

        public AuthController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
            _passwordHasher = new PasswordHasher<User>();
        }

        // POST: api/auth/register
        // Đăng ký tài khoản mới cho người dùng (Client)
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO dto)
        {
            var existingUser = await _dbContext.Users
                .Where(u => u.PhoneNumber == dto.PhoneNumber || u.Email == dto.Email)
                .FirstOrDefaultAsync();

            if (existingUser != null)
            {
                if (existingUser.PhoneNumber == dto.PhoneNumber)
                    return BadRequest(new { message = "Phone number already exists." });

                if (existingUser.Email == dto.Email)
                    return BadRequest(new { message = "Email already exists." });
            }

            var user = new User
            {
                PhoneNumber = dto.PhoneNumber,
                Email = dto.Email,
                Fullname = dto.Fullname,
                PasswordHash = _passwordHasher.HashPassword(null!, dto.Password),
                Role = "Client",
                CreatedAt = DateTime.Now
            };

            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();
            return Ok(new { message = "User registered successfully." });
        }

        // POST: api/auth/login
        // Đăng nhập bằng số điện thoại và mật khẩu
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO dto)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.PhoneNumber == dto.PhoneNumber);

            if (user == null)
                return Unauthorized(new { message = "Invalid credentials." });


            var passwordVerificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
            if (passwordVerificationResult == PasswordVerificationResult.Failed)
                return Unauthorized(new { message = "Invalid credentials." });


            return Ok(new
            {
                user = new
                {
                    user.UserID,
                    user.PhoneNumber,
                    user.Email,
                    user.Role,
                    user.Fullname
                }
            });
        }

        // PUT: api/auth/user
        // Cập nhật thông tin người dùng (họ tên, email)
        [HttpPut("user")]
        public async Task<IActionResult> UpdateUserInformation([FromBody] UserDTO dto)
        {
            var user = await _dbContext.Users.FindAsync(dto.UserID);
            if (user == null)
                return NotFound(new { message = "User not found!" });

            user.Fullname = dto.Fullname;
            user.Email = dto.Email;

            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Update user information successfully!" });
        }
    }
}