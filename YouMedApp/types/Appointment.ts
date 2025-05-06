import { Clinic } from "./Clinic";
import { Doctor } from "./Doctor";
import { Patient } from "./Patient";

export interface Appointment {
  appointmentID: number;
  patientID: number;
  patient: Patient;
  clinicID: number;
  clinic: Clinic | null;
  doctorID: number;
  doctor: Doctor;
  appointmentDate: string;
  status: string;
  symptomNote: string;
  createdAt: string;
  appointmentType: string;
  appointmentService: string;
  relatedAppointmentID: number
}