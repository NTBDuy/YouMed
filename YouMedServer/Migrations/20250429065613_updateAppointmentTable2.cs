using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YouMedServer.Migrations
{
    /// <inheritdoc />
    public partial class updateAppointmentTable2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ScheduledAt",
                table: "AppointmentClinicalServices",
                newName: "CreatedAt");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "AppointmentClinicalServices",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "AppointmentClinicalServices",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Conclusion",
                table: "AppointmentClinicalServices",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Recommendations",
                table: "AppointmentClinicalServices",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResultSummary",
                table: "AppointmentClinicalServices",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "AppointmentClinicalServices");

            migrationBuilder.DropColumn(
                name: "Conclusion",
                table: "AppointmentClinicalServices");

            migrationBuilder.DropColumn(
                name: "Recommendations",
                table: "AppointmentClinicalServices");

            migrationBuilder.DropColumn(
                name: "ResultSummary",
                table: "AppointmentClinicalServices");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "AppointmentClinicalServices",
                newName: "ScheduledAt");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "AppointmentClinicalServices",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);
        }
    }
}
