import { Specialties } from "./Specialties";
import { WorkingHours } from "./WorkingHours";

export interface Clinic {
    clinicID: number;
    name: string;
    clinicAddress: string;
    introduction: string;
    phoneNumber: string;
    createdAt: string; 
    specialties: Specialties[]
    clinicWorkingHours: WorkingHours[]

    // Phát triển sau
    rating?: number;
    distance?: string;
    openingHours?: string;
  }