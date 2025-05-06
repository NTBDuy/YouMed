using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YouMedServer.Migrations
{
    /// <inheritdoc />
    public partial class updateRecordIsFollowUp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsFollowUp",
                table: "MedicalRecords",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsFollowUp",
                table: "MedicalRecords");
        }
    }
}
