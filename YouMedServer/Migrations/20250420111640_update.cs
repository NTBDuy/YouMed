using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YouMedServer.Migrations
{
    /// <inheritdoc />
    public partial class update : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Doctors_Clinics_ClinicID1",
                table: "Doctors");

            migrationBuilder.DropIndex(
                name: "IX_Doctors_ClinicID1",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "ClinicID1",
                table: "Doctors");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Appointments",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ClinicID1",
                table: "Doctors",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Appointments",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.CreateIndex(
                name: "IX_Doctors_ClinicID1",
                table: "Doctors",
                column: "ClinicID1");

            migrationBuilder.AddForeignKey(
                name: "FK_Doctors_Clinics_ClinicID1",
                table: "Doctors",
                column: "ClinicID1",
                principalTable: "Clinics",
                principalColumn: "ClinicID");
        }
    }
}
