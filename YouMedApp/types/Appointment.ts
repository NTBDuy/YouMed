import Clinic from "./Clinic";
import Doctor from "./Doctor";
import Patient from "./Patient";

export default interface Appointment {
  appointmentID: number;
  patientID: number;
  patient: Patient;
  clinicID: number;
  clinic: Clinic | null;
  doctorID: number;
  doctor: Doctor;
  appointmentDate: string;
  status: AppointmentStatus;
  symptomNote: string;
  createdAt: string;
  appointmentType: string;
  appointmentService: string;
  relatedAppointmentID: number
}

export enum AppointmentStatus {
  Pending = 0,
  Scheduled = 1,
  InProgress = 2,
  Completed = 3,
  Cancelled = 4,
}