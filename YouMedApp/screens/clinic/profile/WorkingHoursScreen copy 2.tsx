import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderSection from 'components/HeaderSection';
import { WorkingHours } from 'types/WorkingHours';
import { AuthContext } from 'contexts/AuthContext';
import { fetchWorkingHours } from 'utils/apiUtils';
import { showDayOfWeek } from 'utils/datetimeUtils';
// import { Pencil, Trash2, Plus, X, Save, Clock } from 'lucide-react';

// Danh sách các ngày trong tuần
const DAYS_OF_WEEK = [
  { label: 'Thứ hai', value: 1 },
  { label: 'Thứ ba', value: 2 },
  { label: 'Thứ tư', value: 3 },
  { label: 'Thứ năm', value: 4 },
  { label: 'Thứ sáu', value: 5 },
  { label: 'Thứ bảy', value: 6 },
  { label: 'Chủ nhật', value: 0 },
];

const WorkingHoursScreen = () => {
  const { user } = useContext(AuthContext);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // State cho modal tùy chỉnh
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentWorkingHour, setCurrentWorkingHour] = useState<WorkingHours | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [daySelectVisible, setDaySelectVisible] = useState(false);

  // Lấy dữ liệu giờ làm việc
  const getData = async () => {
    try {
      setIsLoading(true);
      const res = await fetchWorkingHours(user!.userID);
      if (res.ok) {
        const data = await res.json();
        setWorkingHours(data);
      }
    } catch (error) {
      console.error('Error fetching working hours:', error);
      Alert.alert('Lỗi', 'Không thể lấy dữ liệu giờ làm việc. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [user]);

  // Mở modal thêm mới
  const handleAddNew = () => {
    setEditMode(false);
    setCurrentWorkingHour(null);
    setSelectedDay(1);
    setStartTime('08:00');
    setEndTime('17:00');
    setModalVisible(true);
  };

  // Mở modal chỉnh sửa
  const handleEdit = (item: WorkingHours) => {
    setEditMode(true);
    setCurrentWorkingHour(item);
    setSelectedDay(item.dayOfWeek);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setModalVisible(true);
  };

  // Xử lý xóa giờ làm việc
  const handleDelete = async (item: WorkingHours) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa thời gian làm việc này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
        //   onPress: async () => {
        //     try {
        //       setIsSaving(true);
        //       const res = await deleteWorkingHour(item.clinicWorkingTimeID);
        //       if (res.ok) {
        //         // Cập nhật lại danh sách sau khi xóa
        //         setWorkingHours(workingHours.filter(wh => wh.clinicWorkingTimeID !== item.clinicWorkingTimeID));
        //         Alert.alert('Thành công', 'Đã xóa thời gian làm việc.');
        //       } else {
        //         Alert.alert('Lỗi', 'Không thể xóa thời gian làm việc. Vui lòng thử lại.');
        //       }
        //     } catch (error) {
        //       console.error('Error deleting working hour:', error);
        //       Alert.alert('Lỗi', 'Đã xảy ra lỗi khi xóa thời gian làm việc.');
        //     } finally {
        //       setIsSaving(false);
        //     }
        //   }
        }
      ]
    );
  };

  // Xử lý lưu giờ làm việc
  const handleSave = async () => {
    // Kiểm tra dữ liệu đầu vào
    if (!startTime || !endTime) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thời gian bắt đầu và kết thúc.');
      return;
    }

    try {
      setIsSaving(true);
      
      if (editMode && currentWorkingHour) {
        // Cập nhật giờ làm việc hiện có
        const updatedHour = {
          ...currentWorkingHour,
          dayOfWeek: selectedDay,
          startTime: startTime,
          endTime: endTime
        };
        
        // const res = await updateWorkingHour(updatedHour);
        // if (res.ok) {
        //   // Cập nhật danh sách
        //   setWorkingHours(workingHours.map(wh => 
        //     wh.clinicWorkingTimeID === currentWorkingHour.clinicWorkingTimeID ? updatedHour : wh
        //   ));
        //   Alert.alert('Thành công', 'Đã cập nhật thời gian làm việc');
        //   setModalVisible(false);
        // } else {
        //   Alert.alert('Lỗi', 'Không thể cập nhật thời gian làm việc. Vui lòng thử lại.');
        // }
      } else {
        // Thêm giờ làm việc mới
        const newWorkingHour = {
          clinicID: user!.userID, // Giả sử userID và clinicID là như nhau
          dayOfWeek: selectedDay,
          startTime: startTime,
          endTime: endTime
        };
        
        // const res = await addWorkingHour(newWorkingHour);
        // if (res.ok) {
        //   const data = await res.json();
        //   // Thêm vào danh sách
        //   setWorkingHours([...workingHours, data]);
        //   Alert.alert('Thành công', 'Đã thêm thời gian làm việc mới');
        //   setModalVisible(false);
        // } else {
        //   Alert.alert('Lỗi', 'Không thể thêm thời gian làm việc. Vui lòng thử lại.');
        // }
      }
    } catch (error) {
      console.error('Error saving working hour:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi lưu thời gian làm việc.');
    } finally {
      setIsSaving(false);
    }
  };

  // Kiểm tra xem ngày đã tồn tại chưa (cho trường hợp thêm mới)
  const isDayExists = (day: number) => {
    if (editMode && currentWorkingHour && currentWorkingHour.dayOfWeek === day) {
      return false; // Cho phép sửa ngày hiện tại
    }
    return workingHours.some(wh => wh.dayOfWeek === day);
  };

  // Modal chọn ngày trong tuần
  const renderDaySelector = () => (
    <Modal
      visible={daySelectVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setDaySelectVisible(false)}
    >
      <View className="flex-1 justify-end bg-black bg-opacity-50">
        <View className="bg-white rounded-t-xl p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold">Chọn ngày</Text>
            <TouchableOpacity onPress={() => setDaySelectVisible(false)}>
              {/* <X size={24} color="#000" /> */}
            </TouchableOpacity>
          </View>
          
          <ScrollView className="max-h-80">
            {DAYS_OF_WEEK.map((day) => (
              <TouchableOpacity
                key={day.value}
                onPress={() => {
                  if (!isDayExists(day.value) || (editMode && currentWorkingHour?.dayOfWeek === day.value)) {
                    setSelectedDay(day.value);
                    setDaySelectVisible(false);
                  } else {
                    Alert.alert('Ngày đã tồn tại', 'Ngày này đã có lịch làm việc. Vui lòng chọn ngày khác hoặc chỉnh sửa lịch hiện có.');
                  }
                }}
                className={`p-4 border-b border-gray-200 ${selectedDay === day.value ? 'bg-blue-50' : ''}`}
              >
                <Text className={`text-base ${selectedDay === day.value ? 'font-bold text-blue-500' : ''}`}>
                  {day.label} {isDayExists(day.value) && day.value !== currentWorkingHour?.dayOfWeek ? '(Đã tồn tại)' : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <HeaderSection title="Giờ làm việc phòng khám" backBtn />

      {isLoading ? (
        <View className="mt-10 flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-2 text-gray-500">Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <View className="flex-1">
          <ScrollView className="flex-1 p-4">
            {workingHours.length > 0 ? (
              workingHours
                .sort((a, b) => {
                  // Sắp xếp theo thứ tự ngày trong tuần, với 0 (Chủ nhật) ở cuối
                  const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
                  const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
                  return dayA - dayB;
                })
                .map((item) => (
                  <View key={item.clinicWorkingTimeID} className="mb-4 rounded-lg bg-white p-4 shadow">
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text className="text-lg font-semibold">{showDayOfWeek(item.dayOfWeek)}</Text>
                        <View className="flex-row items-center mt-1">
                          {/* <Clock size={16} color="#6B7280" /> */}
                          <Text className="text-gray-500 ml-1">
                            {item.startTime} - {item.endTime}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row">
                        <TouchableOpacity 
                          onPress={() => handleEdit(item)}
                          className="p-2 mr-2 rounded-full bg-blue-50"
                        >
                          {/* <Pencil size={18} color="#3B82F6" /> */}
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => handleDelete(item)}
                          className="p-2 rounded-full bg-red-50"
                        >
                          {/* <Trash2 size={18} color="#EF4444" /> */}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
            ) : (
              <View className="flex-1 items-center justify-center mt-10">
                <Text className="text-gray-500 mb-4">Chưa có thông tin giờ làm việc</Text>
                <Text className="text-gray-400 text-center px-8">
                  Thêm giờ làm việc của phòng khám để khách hàng có thể biết khi nào có thể đặt lịch khám
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Nút thêm mới */}
          <View className="p-4">
            <TouchableOpacity
              onPress={handleAddNew}
              className="bg-blue-500 p-4 rounded-lg flex-row justify-center items-center"
            >
              {/* <Plus size={20} color="#FFF" /> */}
              <Text className="text-white font-semibold ml-2">Thêm giờ làm việc mới</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal thêm/sửa giờ làm việc */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">
                {editMode ? 'Chỉnh sửa giờ làm việc' : 'Thêm giờ làm việc mới'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                {/* <X size={24} color="#000" /> */}
              </TouchableOpacity>
            </View>

            {/* Chọn ngày */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Ngày trong tuần:</Text>
              <TouchableOpacity
                onPress={() => setDaySelectVisible(true)}
                className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
              >
                <Text>{DAYS_OF_WEEK.find(day => day.value === selectedDay)?.label || 'Chọn ngày'}</Text>
                <Text className="text-gray-500">▼</Text>
              </TouchableOpacity>
            </View>

            {/* Giờ bắt đầu */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Giờ bắt đầu:</Text>
              <TextInput
                value={startTime}
                onChangeText={setStartTime}
                placeholder="08:00"
                keyboardType="default"
                className="border border-gray-300 rounded-lg p-3"
              />
              <Text className="text-gray-500 text-xs mt-1">Định dạng: HH:MM (ví dụ: 08:00, 14:30)</Text>
            </View>

            {/* Giờ kết thúc */}
            <View className="mb-6">
              <Text className="text-gray-700 mb-2">Giờ kết thúc:</Text>
              <TextInput
                value={endTime}
                onChangeText={setEndTime}
                placeholder="17:00"
                keyboardType="default"
                className="border border-gray-300 rounded-lg p-3"
              />
              <Text className="text-gray-500 text-xs mt-1">Định dạng: HH:MM (ví dụ: 17:00, 21:30)</Text>
            </View>

            {/* Nút lưu */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              className={`p-4 rounded-lg flex-row justify-center items-center ${isSaving ? 'bg-gray-400' : 'bg-blue-500'}`}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  {/* <Save size={20} color="#FFF" /> */}
                  <Text className="text-white font-semibold ml-2">
                    {editMode ? 'Cập nhật' : 'Thêm mới'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal chọn ngày */}
      {renderDaySelector()}
    </SafeAreaView>
  );
};

export default WorkingHoursScreen;