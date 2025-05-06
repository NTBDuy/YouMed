import { Clinic } from "./Clinic";

export interface ClinicalServices {
  clinicalServiceID: number;
  name: string;
  description: string;
  serviceType: string;
  price: number;
  clinicID: string;
  clinic: Clinic;
  isActive: boolean
}
