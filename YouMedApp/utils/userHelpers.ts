/**
 * Hàm lấy chữ cái viết tắt từ họ tên hoặc email
 * @param fullname 
 * @param email 
 * @returns 
 */
export const getUserInitials = (fullname?: string, email?: string): string => {
  if (fullname && fullname.trim() !== '') {
    const words = fullname.trim().split(' ');
    return words.length >= 2
      ? words[0][0].toUpperCase() + words[words.length - 1][0].toUpperCase()
      : words[0][0].toUpperCase();
  }
  return email ? email[0].toUpperCase() : '';
};
 
/**
 * Hàm chuyển mã giới tính thành chữ
 * @param gender 
 * @returns  Male | Female | Other
 */
export const getGenderText = (gender: string): string => {
  return gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : 'Other';
};