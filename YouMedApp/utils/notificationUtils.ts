import { createNotification } from 'utils/apiUtils';

// Định nghĩa các loại thông báo
export enum NotificationType {
  APPOINTMENT_BOOKED = 'Appointment Booked', // Đặt lịch hẹn thành công
  APPOINTMENT_CANCELLED = 'Appointment Cancelled', // Hủy lịch hẹn
  APPOINTMENT_RESCHEDULED = 'Appointment ReScheduled', // Đặt lại lịch hẹn
  REMINDER = 'Reminder', // Nhắc nhở
  GENERAL = 'General Notification', // Thông báo chung
}

/**
 * Hàm gửi thông báo
 * @param userID 
 * @param type 
 * @param message 
 * @param onSuccess 
 */
export const sendNotification = async (
  userID: number,
  type: NotificationType,
  message: string,
  onSuccess?: () => void
) => {
  try {
    const notificationData = {
      title: type,
      userID: userID,
      message: message,
    };

    const res = await createNotification(notificationData);

    if (res.ok) {
      console.log(`Gửi thông báo ${type} thành công.`);
      if (onSuccess) onSuccess(); 
    } else {
      const errorData = await res.json();
      console.error(`Gửi thông báo ${type} thất bại:`, errorData.message);
    }
  } catch (error) {
    console.error('Lỗi gửi thông báo:', error);
  }
};

/**
 * Gửi thông báo khi đặt lịch thành công
 * @param userID 
 * @param onSuccess 
 */
export const notifyAppointmentBooked = async (userID: number, onSuccess?: () => void) => {
  const message = `Yêu cầu đặt lịch của bạn đã được ghi nhận. Phòng khám sẽ liên hệ nếu có thay đổi.`;
  await sendNotification(userID, NotificationType.APPOINTMENT_BOOKED, message, onSuccess);
};

/**
 * Gửi thông báo khi hủy lịch
 * @param userID 
 * @param onSuccess 
 */
export const notifyAppointmentCancelled = async (userID: number, onSuccess?: () => void) => {
  const message = `Lịch hẹn của bạn đã bị hủy. Vui lòng liên hệ phòng khám để được hỗ trợ thêm.`;
  await sendNotification(userID, NotificationType.APPOINTMENT_CANCELLED, message, onSuccess);
};

/**
 * Gửi thông báo khi đặt lại lịch
 * @param userID 
 * @param onSuccess 
 */
export const notifyAppointmentReScheduled = async (userID: number, onSuccess?: () => void) => {
  const message = `Lịch hẹn của bạn đã được sắp xếp lại. Vui lòng kiểm tra thông tin mới.`;
  await sendNotification(userID, NotificationType.APPOINTMENT_RESCHEDULED, message, onSuccess);
};

/**
 * Gửi thông báo nhắc nhở lịch hẹn
 * @param userID 
 * @param onSuccess 
 */
export const notifyReminder = async (userID: number, onSuccess?: () => void) => {
  const message = `Đây là lời nhắc về lịch hẹn sắp tới của bạn. Vui lòng đến đúng giờ.`;
  await sendNotification(userID, NotificationType.REMINDER, message, onSuccess);
};

/**
 * Gửi thông báo chung với nội dung tùy chỉnh
 * @param userID 
 * @param message 
 * @param onSuccess 
 */
export const notifyGeneral = async (userID: number, message: string, onSuccess?: () => void) => {
  await sendNotification(userID, NotificationType.GENERAL, message, onSuccess);
};
