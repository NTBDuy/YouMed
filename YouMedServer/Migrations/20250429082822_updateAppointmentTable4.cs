using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YouMedServer.Migrations
{
    /// <inheritdoc />
    public partial class updateAppointmentTable4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.CreateIndex(
                name: "IX_AppointmentClinicalServices_RecordID",
                table: "AppointmentClinicalServices",
                column: "RecordID");

            migrationBuilder.AddForeignKey(
                name: "FK_AppointmentClinicalServices_MedicalRecords_RecordID",
                table: "AppointmentClinicalServices",
                column: "RecordID",
                principalTable: "MedicalRecords",
                principalColumn: "RecordID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppointmentClinicalServices_MedicalRecords_RecordID",
                table: "AppointmentClinicalServices");

            migrationBuilder.DropIndex(
                name: "IX_AppointmentClinicalServices_RecordID",
                table: "AppointmentClinicalServices");

            migrationBuilder.AddColumn<int>(
                name: "MedicalRecordRecordID",
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
    }
}
