export enum UserRole {
  Client = 0,
  Doctor = 1,
  Clinic = 2,
}

export default interface User {
  userID: number;
  phoneNumber: string;
  fullname: string;
  password: string;
  email?: string;
  createdAt: string; 
  role: UserRole;
}