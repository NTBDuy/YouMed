import { format } from 'date-fns';

type DateInput = Date | string | number | null | undefined;

/**
 * Định dạng ngày thành DD/MM/YYYY
 */
export const formatDate = (input: DateInput): string => {
  if (!input) return '';

  const date = new Date(input);
  if (isNaN(date.getTime())) return '';

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Định dạng thời gian thành HH:MM
 */
export const formatTime = (input: DateInput): string => {
  if (!input) return '';

  const date = new Date(input);
  if (isNaN(date.getTime())) return '';

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
};

/**
 * Định dạng ngày và thời gian thành HH:MM - DD/MM/YYYY
 */
export const formatDatetime = (input: DateInput): string => {
  if (!input) return '';

  const date = new Date(input);
  if (isNaN(date.getTime())) return '';

  const time = formatTime(date);
  const dateFormatted = formatDate(date);

  return `${time} - ${dateFormatted}`;
};

/**
 * Định dạng ngày và giờ theo định dạng ngôn ngữ địa phương
 * Trả về ngày theo định dạng: DD MMM YYYY, HH:MM AM/PM (ví dụ: "25 Thg 1 2025, 02:30 PM")
 */
export const formatLocaleDateTime = (input: DateInput, locale = 'en-US'): string => {
  if (!input) return '';

  const date = new Date(input);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Tạo biến ngày hôm nay và ngày mai
const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

/**
 * Hàm hiển thị "Today", "Tomorrow" hoặc ngày cụ thể
 * @param date
 * @returns Today | Tomorrow | "Monday, Apr 28"
 */
export const showTodayOrTomorrow = (date: string) => {
  const appointmentDate = new Date(date);

  if (format(appointmentDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
    return 'Today';
  } else if (format(appointmentDate, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
    return 'Tomorrow';
  } else {
    return format(appointmentDate, 'EEEE, MMM dd'); // Ví dụ:
  }
};

/**
 * Hàm hiển thị thứ ngày trong tuần
 * @param number
 * @returns "Monday", "Tuesday", ...
 */
export const showDayOfWeek = (number: number) => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return daysOfWeek[number];
};

/**
 * Hàm lấy thời gian trong ngày
 */
export const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const hours = Math.floor(index / 2).toString().padStart(2, '0');
  const minutes = (index % 2 === 0 ? '00' : '30');
  return `${hours}:${minutes}`;
});