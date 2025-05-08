export default interface Profile {
    userID: number;
    phoneNumber: string;
    password: string;
    email?: string;
    createdAt: string; 
    patientID: number;
    fullname: string;
    dateOfBirth?: string; 
    gender?: 'M' | 'F' | string;
    homeAddress?: string;
    citizenID?: string;
  }