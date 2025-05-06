using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YouMedServer.Migrations
{
    /// <inheritdoc />
    public partial class init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Clinics",
                columns: table => new
                {
                    ClinicID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ClinicAddress = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Introduction = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clinics", x => x.ClinicID);
                });

            migrationBuilder.CreateTable(
                name: "Specialties",
                columns: table => new
                {
                    SpecialtyID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Specialties", x => x.SpecialtyID);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Fullname = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserID);
                });

            migrationBuilder.CreateTable(
                name: "ClinicSpecialties",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClinicID = table.Column<int>(type: "int", nullable: false),
                    SpecialtyID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClinicSpecialties", x => x.ID);
                    table.ForeignKey(
                        name: "FK_ClinicSpecialties_Clinics_ClinicID",
                        column: x => x.ClinicID,
                        principalTable: "Clinics",
                        principalColumn: "ClinicID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClinicSpecialties_Specialties_SpecialtyID",
                        column: x => x.SpecialtyID,
                        principalTable: "Specialties",
                        principalColumn: "SpecialtyID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClinicStaffs",
                columns: table => new
                {
                    ClinicStaffID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    ClinicID = table.Column<int>(type: "int", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClinicStaffs", x => x.ClinicStaffID);
                    table.ForeignKey(
                        name: "FK_ClinicStaffs_Clinics_ClinicID",
                        column: x => x.ClinicID,
                        principalTable: "Clinics",
                        principalColumn: "ClinicID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClinicStaffs_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Doctors",
                columns: table => new
                {
                    DoctorID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Introduction = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Experience = table.Column<int>(type: "int", nullable: true),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    ClinicID = table.Column<int>(type: "int", nullable: false),
                    ClinicID1 = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Doctors", x => x.DoctorID);
                    table.ForeignKey(
                        name: "FK_Doctors_Clinics_ClinicID",
                        column: x => x.ClinicID,
                        principalTable: "Clinics",
                        principalColumn: "ClinicID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Doctors_Clinics_ClinicID1",
                        column: x => x.ClinicID1,
                        principalTable: "Clinics",
                        principalColumn: "ClinicID");
                    table.ForeignKey(
                        name: "FK_Doctors_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    NotificationID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.NotificationID);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Patients",
                columns: table => new
                {
                    PatientID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Fullname = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Gender = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: true),
                    HomeAddress = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CitizenID = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    UserID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Patients", x => x.PatientID);
                    table.ForeignKey(
                        name: "FK_Patients_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DoctorSpecialties",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DoctorID = table.Column<int>(type: "int", nullable: false),
                    SpecialtyID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoctorSpecialties", x => x.ID);
                    table.ForeignKey(
                        name: "FK_DoctorSpecialties_Doctors_DoctorID",
                        column: x => x.DoctorID,
                        principalTable: "Doctors",
                        principalColumn: "DoctorID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DoctorSpecialties_Specialties_SpecialtyID",
                        column: x => x.SpecialtyID,
                        principalTable: "Specialties",
                        principalColumn: "SpecialtyID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Appointments",
                columns: table => new
                {
                    AppointmentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PatientID = table.Column<int>(type: "int", nullable: false),
                    ClinicID = table.Column<int>(type: "int", nullable: false),
                    DoctorID = table.Column<int>(type: "int", nullable: false),
                    AppointmentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    SymptomNote = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AppointmentType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Appointments", x => x.AppointmentID);
                    table.ForeignKey(
                        name: "FK_Appointments_Clinics_ClinicID",
                        column: x => x.ClinicID,
                        principalTable: "Clinics",
                        principalColumn: "ClinicID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Appointments_Doctors_DoctorID",
                        column: x => x.DoctorID,
                        principalTable: "Doctors",
                        principalColumn: "DoctorID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Appointments_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HealthInsurances",
                columns: table => new
                {
                    HealthInsuranceID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PatientID = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InitialMedicalFacility = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthInsurances", x => x.HealthInsuranceID);
                    table.ForeignKey(
                        name: "FK_HealthInsurances_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MedicalRecords",
                columns: table => new
                {
                    RecordID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PatientID = table.Column<int>(type: "int", nullable: false),
                    DoctorID = table.Column<int>(type: "int", nullable: false),
                    AppointmentID = table.Column<int>(type: "int", nullable: false),
                    Diagnosis = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Prescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FollowUpDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PreviousRecordID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalRecords", x => x.RecordID);
                    table.ForeignKey(
                        name: "FK_MedicalRecords_Appointments_AppointmentID",
                        column: x => x.AppointmentID,
                        principalTable: "Appointments",
                        principalColumn: "AppointmentID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MedicalRecords_Doctors_DoctorID",
                        column: x => x.DoctorID,
                        principalTable: "Doctors",
                        principalColumn: "DoctorID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MedicalRecords_MedicalRecords_PreviousRecordID",
                        column: x => x.PreviousRecordID,
                        principalTable: "MedicalRecords",
                        principalColumn: "RecordID");
                    table.ForeignKey(
                        name: "FK_MedicalRecords_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_ClinicID",
                table: "Appointments",
                column: "ClinicID");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_DoctorID",
                table: "Appointments",
                column: "DoctorID");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_PatientID",
                table: "Appointments",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_ClinicSpecialties_ClinicID",
                table: "ClinicSpecialties",
                column: "ClinicID");

            migrationBuilder.CreateIndex(
                name: "IX_ClinicSpecialties_SpecialtyID",
                table: "ClinicSpecialties",
                column: "SpecialtyID");

            migrationBuilder.CreateIndex(
                name: "IX_ClinicStaffs_ClinicID",
                table: "ClinicStaffs",
                column: "ClinicID");

            migrationBuilder.CreateIndex(
                name: "IX_ClinicStaffs_UserID",
                table: "ClinicStaffs",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Doctors_ClinicID",
                table: "Doctors",
                column: "ClinicID");

            migrationBuilder.CreateIndex(
                name: "IX_Doctors_ClinicID1",
                table: "Doctors",
                column: "ClinicID1");

            migrationBuilder.CreateIndex(
                name: "IX_Doctors_UserID",
                table: "Doctors",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorSpecialties_DoctorID",
                table: "DoctorSpecialties",
                column: "DoctorID");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorSpecialties_SpecialtyID",
                table: "DoctorSpecialties",
                column: "SpecialtyID");

            migrationBuilder.CreateIndex(
                name: "IX_HealthInsurances_PatientID",
                table: "HealthInsurances",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalRecords_AppointmentID",
                table: "MedicalRecords",
                column: "AppointmentID");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalRecords_DoctorID",
                table: "MedicalRecords",
                column: "DoctorID");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalRecords_PatientID",
                table: "MedicalRecords",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalRecords_PreviousRecordID",
                table: "MedicalRecords",
                column: "PreviousRecordID");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserID",
                table: "Notifications",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Patients_UserID",
                table: "Patients",
                column: "UserID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClinicSpecialties");

            migrationBuilder.DropTable(
                name: "ClinicStaffs");

            migrationBuilder.DropTable(
                name: "DoctorSpecialties");

            migrationBuilder.DropTable(
                name: "HealthInsurances");

            migrationBuilder.DropTable(
                name: "MedicalRecords");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "Specialties");

            migrationBuilder.DropTable(
                name: "Appointments");

            migrationBuilder.DropTable(
                name: "Doctors");

            migrationBuilder.DropTable(
                name: "Patients");

            migrationBuilder.DropTable(
                name: "Clinics");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
