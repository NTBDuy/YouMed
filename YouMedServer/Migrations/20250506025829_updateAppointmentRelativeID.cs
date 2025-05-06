using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YouMedServer.Migrations
{
    /// <inheritdoc />
    public partial class updateAppointmentRelativeID : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "RelatedAppointmentID",
                table: "Appointments",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "RelatedAppointmentID",
                table: "Appointments",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
