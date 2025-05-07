/**
 * Định nghĩa kiểu dữ liệu cho vị trí
 */
export type LocationData = {
    latitude: number;
    longitude: number;
  } | null;
  
  /**
   * Hàm tính khoảng cách giữa 2 địa điểm theo km
   * @param clinicLat Vĩ độ của phòng khám
   * @param clinicLon Kinh độ của phòng khám
   * @param userLocation Vị trí người dùng (có thể null)
   * @returns Khoảng cách tính bằng km (null nếu không có vị trí người dùng)
   */
  export const calculateDistance = (
    clinicLat: number, 
    clinicLon: number, 
    userLocation: LocationData
  ): number | null => {
    if (!userLocation) return null;
    
    const toRad = (value: number) => (value * Math.PI) / 180;
  
    const R = 6371; // Bán kính Trái Đất theo km
    const dLat = toRad(clinicLat - userLocation.latitude);
    const dLon = toRad(clinicLon - userLocation.longitude);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(userLocation.latitude)) *
        Math.cos(toRad(clinicLat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
  
    return Math.round(distance * 10) / 10; // Làm tròn 1 chữ số thập phân
  };
  
  /**
   * Hàm lấy vị trí người dùng hiện tại
   * @param Location Thư viện expo-location đã import
   * @returns Đối tượng LocationData hoặc null nếu không lấy được vị trí
   */
  export const getUserLocation = async (Location: any): Promise<LocationData> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return null;
      }
  
      const loc = await Location.getCurrentPositionAsync({});
      return {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting user location:', error);
      return null;
    }
  };