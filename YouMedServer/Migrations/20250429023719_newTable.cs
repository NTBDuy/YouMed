using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YouMedServer.Migrations
{
    /// <inheritdoc />
    public partial class newTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClinicalServices",
                columns: table => new
                {
                    ClinicalServiceID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ServiceType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ClinicID = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClinicalServices", x => x.ClinicalServiceID);
                    table.ForeignKey(
                        name: "FK_ClinicalServices_Clinics_ClinicID",
                        column: x => x.ClinicID,
                        principalTable: "Clinics",
                        principalColumn: "ClinicID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AppointmentClinicalServices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AppointmentID = table.Column<int>(type: "int", nullable: false),
                    ClinicalServiceID = table.Column<int>(type: "int", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ScheduledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppointmentClinicalServices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppointmentClinicalServices_Appointments_AppointmentID",
                        column: x => x.AppointmentID,
                        principalTable: "Appointments",
                        principalColumn: "AppointmentID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppointmentClinicalServices_ClinicalServices_ClinicalServiceID",
                        column: x => x.ClinicalServiceID,
                        principalTable: "ClinicalServices",
                        principalColumn: "ClinicalServiceID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppointmentClinicalServices_AppointmentID",
                table: "AppointmentClinicalServices",
                column: "AppointmentID");

            migrationBuilder.CreateIndex(
                name: "IX_AppointmentClinicalServices_ClinicalServiceID",
                table: "AppointmentClinicalServices",
                column: "ClinicalServiceID");

            migrationBuilder.CreateIndex(
                name: "IX_ClinicalServices_ClinicID",
                table: "ClinicalServices",
                column: "ClinicID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppointmentClinicalServices");

            migrationBuilder.DropTable(
                name: "ClinicalServices");
        }
    }
}
