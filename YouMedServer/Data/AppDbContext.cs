using Microsoft.EntityFrameworkCore;
using YouMedServer.Models.Entities;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }
    public DbSet<User> Users { get; set; }
    public DbSet<Patient> Patients { get; set; }
    public DbSet<Doctor> Doctors { get; set; }
    public DbSet<Clinic> Clinics { get; set; }
    public DbSet<ClinicStaff> ClinicStaffs { get; set; }
    public DbSet<Specialty> Specialties { get; set; }
    public DbSet<ClinicSpecialty> ClinicSpecialties { get; set; }
    public DbSet<DoctorSpecialty> DoctorSpecialties { get; set; }
    public DbSet<HealthInsurance> HealthInsurances { get; set; }
    public DbSet<Appointment> Appointments { get; set; }
    public DbSet<MedicalRecord> MedicalRecords { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<ClinicalService> ClinicalServices { get; set; }
    public DbSet<AppointmentClinicalService> AppointmentClinicalServices { get; set; }
    public DbSet<ClinicWorkingHours> ClinicWorkingHours { get; set; }
    public DbSet<DoctorSchedule> DoctorSchedules { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // USER - PATIENT (1:1)
        modelBuilder.Entity<Patient>()
            .HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserID)  // Use UserID instead of navigating through User.UserID
            .OnDelete(DeleteBehavior.Restrict);

        // USER - DOCTOR (1:1)
        modelBuilder.Entity<Doctor>()
            .HasOne(d => d.User)
            .WithMany()
            .HasForeignKey(d => d.UserID)  // Same here
            .OnDelete(DeleteBehavior.Restrict);

        // USER - CLINIC (1:1)
        // modelBuilder.Entity<Clinic>()
        //     .HasOne<User>()
        //     .WithMany()
        //     .HasForeignKey(c => c.UserID)
        //     .OnDelete(DeleteBehavior.Restrict);

        // USER - CLINIC STAFF (1:N)
        modelBuilder.Entity<ClinicStaff>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(cs => cs.UserID)
            .OnDelete(DeleteBehavior.Restrict);

        // CLINIC STAFF - CLINIC (N:1)
        modelBuilder.Entity<ClinicStaff>()
            .HasOne<Clinic>()
            .WithMany()
            .HasForeignKey(cs => cs.ClinicID)
            .OnDelete(DeleteBehavior.Restrict);

        // DOCTOR - CLINIC (N:1)
        modelBuilder.Entity<Doctor>()
            .HasOne(d => d.Clinic)
            .WithMany()
            .HasForeignKey(d => d.ClinicID)
            .OnDelete(DeleteBehavior.Restrict);

        // HEALTH INSURANCE - PATIENT (N:1)
        modelBuilder.Entity<HealthInsurance>()
            .HasOne<Patient>()
            .WithMany()
            .HasForeignKey(hi => hi.PatientID)
            .OnDelete(DeleteBehavior.Cascade);

        // APPOINTMENT relationships
        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.Patient)
            .WithMany()
            .HasForeignKey(a => a.PatientID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.Clinic)
            .WithMany()
            .HasForeignKey(a => a.ClinicID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.Doctor)
            .WithMany()
            .HasForeignKey(a => a.DoctorID)
            .OnDelete(DeleteBehavior.Restrict);

        // MEDICAL RECORDS
        modelBuilder.Entity<MedicalRecord>()
            .HasOne(m => m.Patient)
            .WithMany()
            .HasForeignKey(m => m.PatientID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MedicalRecord>()
            .HasOne(m => m.Doctor)
            .WithMany()
            .HasForeignKey(m => m.DoctorID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MedicalRecord>()
            .HasOne(m => m.Appointment)
            .WithMany()
            .HasForeignKey(m => m.AppointmentID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MedicalRecord>()
            .HasOne<MedicalRecord>()
            .WithMany()
            .HasForeignKey(m => m.PreviousRecordID)
            .OnDelete(DeleteBehavior.NoAction);

        // NOTIFICATIONS - USER (N:1)
        modelBuilder.Entity<Notification>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(n => n.UserID)
            .OnDelete(DeleteBehavior.Cascade);

        // DOCTOR - SPECIALTY (1:N)
        modelBuilder.Entity<DoctorSpecialty>()
            .HasOne(ds => ds.Doctor)
            .WithMany()
            .HasForeignKey(ds => ds.DoctorID)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DoctorSpecialty>()
            .HasOne(ds => ds.Specialty)
            .WithMany()
            .HasForeignKey(ds => ds.SpecialtyID)
            .OnDelete(DeleteBehavior.Cascade);

        // CLINIC - SPECIALTY (N:N)
        modelBuilder.Entity<ClinicSpecialty>()
            .HasOne(cs => cs.Clinic)
            .WithMany()
            .HasForeignKey(cs => cs.ClinicID)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ClinicSpecialty>()
            .HasOne(cs => cs.Specialty)
            .WithMany()
            .HasForeignKey(cs => cs.SpecialtyID)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AppointmentClinicalService>()
    .HasOne(a => a.MedicalRecord)
    .WithMany()
    .HasForeignKey(a => a.RecordID)
    .OnDelete(DeleteBehavior.Cascade);
    }
}