import Appointment from "./Appointment";
import Doctor from "./Doctor";
import Patient from "./Patient";

export default interface MedicalRecord {
  recordID: number;
  patientID: number;
  patient: Patient;
  doctorID: number;
  doctor: Doctor;
  appointmentID: number;
  appointment: Appointment;
  diagnosis: string;
  prescription: string | null;
  notes: string | null;
  followUpDate: string | null;
  createdAt: string;
  previousRecordID: number | null;
  isScheduleFollowUp: boolean;
  isFollowUp: boolean;
}