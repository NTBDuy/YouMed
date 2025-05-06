import { Appointment } from "./Appointment";
import { ClinicalServices } from "./ClinicalServices";

export interface AppointmentClinicalServices {
  id: number;
  appointmentID: number;
  appointment?: Appointment;
  clinicalServiceID: number;
  clinicalService?: ClinicalServices;
  note?: string | null;
  createdAt?: string | null;
  completedAt?: string | null;
  resultSummary?: string | null;
  referenceValues?: string | null;
  conclusion?: string | null;
  recommendations?: string | null;
  status: string;
}
