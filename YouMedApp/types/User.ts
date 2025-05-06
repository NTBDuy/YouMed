export interface User {
    userID: number;
    phoneNumber: string;
    fullname: string;
    password: string;
    email?: string;
    createdAt: string; 
    role: 'Client' | 'Clinic' | 'Doctor';
  }