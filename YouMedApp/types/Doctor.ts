import Clinic from "./Clinic";
import Specialties from "./Specialties";
import User from "./User";

export default interface Doctor {
  doctorID: number;
  introduction: string; 
  experience: number; 
  user: User;
  clinicID: number;
  clinic: Clinic;
  specialties?: Specialties[]; 
  createdAt: string;
}
