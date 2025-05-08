using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YouMedServer.Models.DTOs;
using YouMedServer.Models.Entities;

namespace YouMedServer.Controllers
{
    [Route("api/notification")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public NotificationController(AppDbContext context)
        {
            _dbContext = context;
        }

        // GET: api/notification/count-unread?userId={userId}
        // Đếm số lượng thông báo chưa đọc của người dùng
        [HttpGet("count-unread")]
        public async Task<IActionResult> CountUnread([FromQuery] int userId)
        {
            if (userId <= 0)
            {
                return BadRequest(new { message = "Invalid UserID" });
            }

            var count = await _dbContext.Notifications
                .Where(n => n.UserID == userId && n.Status == "Unread")
                .CountAsync();

            return Ok(new { count });
        }

        // POST: api/notification
        // Thêm mới một thông báo cho người dùng
        [HttpPost]
        public async Task<IActionResult> AddNotification([FromBody] NotificationDTO dto)
        {
            var user = await _dbContext.Users.FindAsync(dto.UserID);
            if (user == null)
                return NotFound(new { message = "User not found!" });

            var newNoti = new Notification
            {
                Title = dto.Title,
                Message = dto.Message,
                UserID = dto.UserID,
                Status = "Unread",
                CreatedAt = DateTime.Now
            };

            _dbContext.Notifications.Add(newNoti);

            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Notification added successfully." });
        }

        // PUT: api/notification/{notificationId}?status={status}
        // Cập nhật trạng thái của một thông báo (Read/Unread) theo NotificationID
        [HttpPut("{notificationId}")]
        public async Task<IActionResult> UpdateStatus(int notificationId, [FromQuery] string status)
        {
            var notifications = await _dbContext.Notifications.FirstOrDefaultAsync(n => n.NotificationID == notificationId);

            if (notifications == null)
                return NotFound(new { message = "No notification found!" });

            notifications.Status = status;

            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Notification status updated successfully" });
        }

        // PUT: api/notification/read-all?userId={userId}
        // Đánh dấu tất cả thông báo của người dùng là "Đã đọc"
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead([FromQuery] int userId)
        {
            if (userId <= 0)
            {
                return BadRequest(new { message = "Invalid user ID" });
            }

            var unreadNotifications = await _dbContext.Notifications
                .Where(n => n.UserID == userId && n.Status == "Unread")
                .ToListAsync();

            if (!unreadNotifications.Any())
            {
                return Ok(new { message = "No unread notifications found" });
            }

            foreach (var notification in unreadNotifications)
            {
                notification.Status = "Read";
            }

            await _dbContext.SaveChangesAsync();

            return Ok(new { message = $"Marked {unreadNotifications.Count} notifications as read" });
        }
    }
}