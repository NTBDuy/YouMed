import Clinic from "./Clinic";

export default interface ClinicalServices {
  clinicalServiceID: number;
  name: string;
  description: string;
  serviceType: string;
  price: number;
  clinicID: string;
  clinic: Clinic;
  isActive: boolean
}
