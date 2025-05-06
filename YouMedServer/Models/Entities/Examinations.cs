using System.ComponentModel.DataAnnotations;

namespace YouMedServer.Models.Entities
{
    public class Examinations
    {
        [Key]
        public int ExaminationID { get; set; }
    }
}