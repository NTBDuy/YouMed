using System.ComponentModel.DataAnnotations;

namespace YouMedServer.Models.Entities
{
    public class ClinicalService
    {
        [Key]
        public int ClinicalServiceID { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty; 
        // Ví dụ: "Xét nghiệm máu", "X-quang phổi", "Siêu âm bụng"

        [MaxLength(500)]
        public string? Description { get; set; } 
        // Mô tả thêm (ví dụ: "Xét nghiệm tổng quát các chỉ số máu")

        [MaxLength(50)]
        public string? ServiceType { get; set; } 
        // Phân loại: "Xét nghiệm", "Chẩn đoán hình ảnh", "Khác"...

        public decimal? Price { get; set; } 
        // Giá dịch vụ (nếu cần tính phí)

        public int ClinicID { get; set; } 
        // Gắn với phòng khám cụ thể (nếu mỗi phòng khám có dịch vụ riêng)

        public Clinic? Clinic { get; set; }

        public bool IsActive { get; set; } = true;
        // Đánh dấu dịch vụ còn sử dụng hay đã ngưng
    }
}