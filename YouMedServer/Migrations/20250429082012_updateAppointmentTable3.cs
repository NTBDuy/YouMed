using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YouMedServer.Migrations
{
    /// <inheritdoc />
    public partial class updateAppointmentTable3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MedicalRecordRecordID",
                table: "AppointmentClinicalServices",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RecordID",
                table: "AppointmentClinicalServices",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppointmentClinicalServices_MedicalRecordRecordID",
                table: "AppointmentClinicalServices",
                column: "MedicalRecordRecordID");

            migrationBuilder.AddForeignKey(
                name: "FK_AppointmentClinicalServices_MedicalRecords_MedicalRecordRecordID",
                table: "AppointmentClinicalServices",
                column: "MedicalRecordRecordID",
                principalTable: "MedicalRecords",
                principalColumn: "RecordID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppointmentClinicalServices_MedicalRecords_MedicalRecordRecordID",
                table: "AppointmentClinicalServices");

            migrationBuilder.DropIndex(
                name: "IX_AppointmentClinicalServices_MedicalRecordRecordID",
                table: "AppointmentClinicalServices");

            migrationBuilder.DropColumn(
                name: "MedicalRecordRecordID",
                table: "AppointmentClinicalServices");

            migrationBuilder.DropColumn(
                name: "RecordID",
                table: "AppointmentClinicalServices");
        }
    }
}
