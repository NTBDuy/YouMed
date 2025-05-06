export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Forgot: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  PatientDetail: any;
  EditPatient: any;
  AddPatient: undefined;
  UpdateInsurance: any;
  AddInsurance: any;
  Record: undefined;
  PatientScreen: undefined;
};

export type HomeStackParamList = {
  Homepage: undefined;
  ClinicPage: undefined;
  ClinicDetails: any;
  BookingPage: number;
  Profile: undefined;
  Notification: undefined;
  Detail: any;
  MedicalHistory: undefined;
};

export type AppointmentStackParamList = {
  Appointment: undefined;
  AppointmentDetail: undefined;
  Reschedule: number;
  MedicalRecords: number;
};

export type DoctorStackParamList = {
  Profile: undefined,
  Notifications: undefined,
  PatientSearch: undefined,
  Schedule: undefined,
  Patients: undefined,
  Records: undefined,
  PatientDetail: any,
  Appointments: undefined
  AppointmentDetail: any
}