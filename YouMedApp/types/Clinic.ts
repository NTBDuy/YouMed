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
    latitude: number; // Thêm thuộc tính latitude
    longitude: number; // Thêm thuộc tính longitude

    rating?: number;
    distance?: string;
    openingHours?: string;
  }