import { Specialties } from "./Specialties";

export interface Clinic {
    clinicID: number;
    name: string;
    clinicAddress: string;
    introduction: string;
    phoneNumber: string;
    createdAt: string; 
    specialties: Specialties[]

    // Phát triển sau
    rating?: number;
    distance?: string;
    openingHours?: string;
  }