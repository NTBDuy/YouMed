import { User } from "./User";

export interface Patient {
  patientID: number;
  fullname: string;
  phoneNumber: string;
  emailAddress: string;
  dateOfBirth: string; 
  gender: 'M' | 'F' | string;
  homeAddress: string;
  citizenID: string;
  userID: number;
  relationship: string;
  user?: User; 
}