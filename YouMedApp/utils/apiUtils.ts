const IP_SERVER = '192.168.2.145';
const PORT = '5169';
const API_URL = `http://${IP_SERVER}:${PORT}/api`;

// Hàm truyền dữ liệu
const submitData = async (endpoint?: string, method?: 'POST' | 'PUT' | 'DELETE', data?: any) => {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response;
};

/**
 * AUTHTENTICATION API
 */
// Đăng nhập bằng số điện thoại và mật khẩu
export const login = async (phoneNumber: string, password: string) => {
  return submitData(`auth/login`, 'POST', { phoneNumber, password });
};

// Đăng ký tài khoản mới cho người dùng (Client)
export const register = async (data: any) => {
  return submitData(`auth/register`, 'POST', data);
};

// Cập nhật thông tin người dùng (họ tên, email)
export const updateUser = async (data: any) => {
  return submitData(`auth/user`, 'PUT', data);
};

/**
 * APPOINTMENT API
 */
// Lấy chi tiết lịch hẹn theo AppointmentID
export const fetchAppointmentDetail = async (appointmentId: number) => {
  return fetch(`${API_URL}/appointment/${appointmentId}`);
};

// Lấy hồ sơ bệnh án (Medical Record) liên quan đến lịch hẹn theo AppointmentID
export const fetchAppointmentRecord = async (appointmentId: number) => {
  return fetch(`${API_URL}/appointment/${appointmentId}/record`);
};

// Lấy RecordID của hồ sơ bệnh án theo AppointmentID
export const fetchRecordIdByAppointment = async (appointmentId: number) => {
  return fetch(`${API_URL}/appointment/${appointmentId}/record/id`);
};

// Đặt lịch hẹn mới (Booking Appointment)
export const createAppointment = async (data: any) => {
  return submitData(`appointment`, 'POST', data);
};

// Chỉ định khám lâm sàng
export const requestService = async (appointmentId: number, data: any) => {
  return submitData(`appointment/${appointmentId}/service`, 'POST', data);
};

// Danh sách chỉ định khám lâm sàng
export const fetchRequestServiceList = async (appointmentId: number) => {
  return fetch(`${API_URL}/appointment/${appointmentId}/service`);
};

// Kiểm tra xem tất cả dịch vụ đã hoàn thành chưa
export const checkAllServicesCompleted = async (appointmentId: number) => {
  return fetch(`${API_URL}/appointment/${appointmentId}/service/check`);
};

// Đặt lại lịch hẹn (Reschedule) theo AppointmentID
export const rescheduleAppointment = async (appointmentId: number, data: any) => {
  return submitData(`appointment/${appointmentId}/reschedule`, 'PUT', data);
};

// Cập nhật trạng thái của lịch hẹn theo AppointmentID
export const updateAppointmentStatus = async (appointmentId: number, status: number) => {
  return submitData(`appointment/${appointmentId}/status?status=${status}`, 'PUT');
};

// Cập nhật trạng thái của dịch vụ khám cận lâm sàng
export const updateServiceStatus = async (serviceId: number, status: string) => {
  return submitData(`appointment/service/${serviceId}/status?status=${status}`, 'PUT');
};

// Ghi nhận kết quả dịch vụ khám cận lâm sàng
export const updateServiceResult = async (serviceId: number, data: any) => {
  return submitData(`appointment/service/${serviceId}`, 'PUT', data);
};

/**
 * CLINIC API
 */
// Lấy thông tin phòng khám theo ClinicID
export const fetchClinicDetail = async (clinicId: number) => {
  return fetch(`${API_URL}/clinic/${clinicId}`);
};

// Lấy thông tin chi tiết của phòng khám mà nhân viên đang làm việc
export const fetchClinicInformation = async (userId: number) => {
  return fetch(`${API_URL}/clinic/information?userId=${userId}`);
};

// Lấy tổng quan số lượng lịch hẹn trong ngày của phòng khám theo UserID của nhân viên phòng khám
export const fetchTodayClinicStats = async (userId: number) => {
  return fetch(`${API_URL}/clinic/stats?userId=${userId}`);
};

// Lấy danh sách tất cả phòng khám
export const fetchClinics = async () => {
  return fetch(`${API_URL}/clinics`);
};

// Lấy danh sách bác sĩ theo UserID của nhân viên phòng khám -> Dùng để quản lý bác sĩ của phòng khám đó
export const fetchDoctorsByClinic = async (userId: number) => {
  return fetch(`${API_URL}/clinic/doctors?userId=${userId}`);
};

// Lấy danh sách bác sĩ của phòng khám bằng ClinicID -> Dùng để hiển thị danh sách bác sĩ lúc đặt lịch khám
export const fetchDoctorsByClinicID = async (clinicId: number) => {
  return fetch(`${API_URL}/clinic/${clinicId}/doctors`);
};

// Lấy danh sách các chuyên khoa (Specialties)
export const fetchSpecialties = async () => {
  return fetch(`${API_URL}/clinic/specialties`);
};

// lấy danh sách dịch vụ khám cận lâm sàng của phòng khám
export const fetchServices = async (clinicId: number) => {
  return fetch(`${API_URL}/clinic/${clinicId}/services`);
};

// Cập nhật thông tin phòng khám
export const updateClinicInformation = async (data: any) => {
  return submitData(`clinic/information`, 'PUT', data);
};

// Lấy danh sách giờ làm việc của phòng khám theo ClinicID
export const fetchWorkingHours = async (userId: number) => {
  return fetch(`${API_URL}/clinic/working-hours?userId=${userId}`);
};

// Cập nhật giờ làm việc của phòng khám
export const updateWorkingHours = async (userId: number, data: any) => {
  return submitData(`clinic/working-hours?userId=${userId}`, 'PUT', data);
};

/**
 * MEDICAL RECORDS API
 */
// Lấy thông tin chi tiết hồ sơ bệnh án bằng RecordID
export const fetchRecordDetail = async (recordId: number) => {
  return fetch(`${API_URL}/record/${recordId}`);
};

// Tạo hồ sơ bệnh án mới
export const createRecord = async (data: any) => {
  return submitData(`record`, 'POST', data);
};

// Lấy danh sách kết quả dịch vụ cận lâm sàng theo RecordID
export const fetchRecordParaclinical = async (recordId: number) => {
  return fetch(`${API_URL}/record/${recordId}/paraclinical`);
};

// Cập nhật trạng thái đã lên lịch tái khám của hồ sơ bệnh án
export const updateFollowUpStatus = async (recordId: number) => {
  return submitData(`record/${recordId}/followup`, 'PUT');
};

/**
 * PATIENT API
 */
// Lấy thông tin hồ sơ bệnh nhân bằng PatientID
export const fetchPatientDetail = async (patientId: number) => {
  return fetch(`${API_URL}/patient/${patientId}`);
};

// Lấy lịch sử hồ sơ bệnh án bằng PatientID
export const fetchRecordsByPatient = async (patientId: number) => {
  return fetch(`${API_URL}/patient/${patientId}/records`);
};

// Lấy thông tin bảo hiểm y tế bằng PatientID
export const fetchInsuranceDetail = async (patientId: number) => {
  return fetch(`${API_URL}/patient/${patientId}/insurances`);
};

// Thêm hồ sơ bệnh nhân mới vào hệ thống
export const createPatient = async (data: any) => {
  return submitData(`patient`, 'POST', data);
};

// Cập nhật hồ sơ bệnh nhân theo PatientID
export const updatePatient = async (patientId: number, data: any) => {
  return submitData(`patient/${patientId}`, 'PUT', data);
};

// Xóa bệnh nhân theo PatientID
export const deletePatient = async (patientId: number) => {
  return submitData(`patient/${patientId}`, 'DELETE');
};

/**
 * HEALTH INSUARANCE API
 */
// Thêm mới thông tin bảo hiểm y tế cho bệnh nhân
export const createInsurance = async (data: any) => {
  return submitData(`insurance`, 'POST', data);
};

// Cập nhật thông tin bảo hiểm y tế cho bệnh nhân
export const updateInsurance = async (data: any) => {
  return submitData(`insurance`, 'PUT', data);
};

/**
 * NOTIFICATION API
 */
// Đếm số lượng thông báo chưa đọc của người dùng
export const countUnread = (userId: number) => {
  return fetch(`${API_URL}/notification/count-unread?userId=${userId}`);
};

// Cập nhật trạng thái của một thông báo (Read/Unread) theo NotificationID
export const updateStatus = async (notificationID: number, status: string) => {
  return submitData(`notification/${notificationID}?status=${status}`, 'PUT');
};

// Thêm mới một thông báo cho người dùng
export const createNotification = async (data: any) => {
  return submitData(`notification`, 'POST', data);
};

/**
 * DOCTOR API
 */
// Lấy thông tin bác sĩ dựa theo UserID
export const fetchDoctorByUserID = async (userId: number) => {
  return fetch(`${API_URL}/doctor?userId=${userId}`);
};

// Lấy chi tiết thông tin bác sĩ theo DoctorID (bao gồm User và chuyên khoa)
export const fetchDoctorDetail = async (doctorID: number) => {
  return fetch(`${API_URL}/doctor/${doctorID}/detail`);
};

// Lấy tổng quan số lượng lịch hẹn trong ngày của bác sĩ theo UserID
export const fetchTodayDoctorStats = async (userId: number) => {
  return fetch(`${API_URL}/doctor/stats?userId=${userId}`);
};

// Lấy danh sách lịch hẹn của bác sĩ theo trạng thái (Scheduled, Completed, Cancelled)
export const fetchAppointmentsByDoctor = async (userId: number, status: string) => {
  return fetch(`${API_URL}/doctor/appointments?userId=${userId}&status=${status}`);
};

// Tạo mới bác sĩ bởi nhân viên phòng khám (ClinicStaff)
export const createDoctor = async (data: any, userId: number) => {
  return submitData(`doctor?userId=${userId}`, 'POST', data);
};

// Cập nhật thông tin bác sĩ (User + giới thiệu + kinh nghiệm)
export const updateDoctor = async (data: any, doctorID: number) => {
  return submitData(`doctor/${doctorID}`, 'PUT', data);
};

// Xóa bác sĩ khỏi hệ thống theo DoctorID
export const deleteDoctor = async (doctorID: number) => {
  return submitData(`doctor/${doctorID}`, 'DELETE');
};

/**
 * USER API
 */
// Lấy danh sách bệnh nhân theo UserID
export const fetchPatients = async (userId: number) => {
  return fetch(`${API_URL}/user/${userId}/patients`);
};

// Lấy danh sách thông báo của người dùng theo UserID, sắp xếp mới nhất trước
export const fetchNotifications = async (userId: number) => {
  return fetch(`${API_URL}/user/${userId}/notifications`);
};

// Lấy danh sách hồ sơ bệnh án theo UserID
export const fetchRecords = async (userId: number) => {
  return fetch(`${API_URL}/user/${userId}/records`);
};

// Lấy danh sách tất cả lịch hẹn của người dùng theo UserID -
export const fetchAppointments = async (userId: number, status?: string) => {
  const url = status
    ? `${API_URL}/user/${userId}/appointments?status=${status}`
    : `${API_URL}/user/${userId}/appointments`;
  return fetch(url);
};
