import Specialties from "./Specialties";
import WorkingHours from "./WorkingHours";

export default interface Clinic {
    clinicID: number;
    name: string;
    clinicAddress: string;
    introduction: string;
    phoneNumber: string;
    createdAt: string; 
    specialties: Specialties[]
    clinicWorkingHours: WorkingHours[]
    latitude: number; 
    longitude: number; 
    rating?: number;
    distance?: string;
    openingHours?: string;
  }