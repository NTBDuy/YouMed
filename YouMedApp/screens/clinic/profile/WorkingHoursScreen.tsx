import HeaderSection from 'components/HeaderSection';
import { useContext, useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import WorkingHours from 'types/WorkingHours';
import { showDayOfWeek, timeOptions } from 'utils/datetimeUtils';
import { AuthContext } from 'contexts/AuthContext';
import { fetchWorkingHours, updateWorkingHours } from 'utils/apiUtils';

const WorkingHoursScreen = () => {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultWorkingHours: WorkingHours[] = [
    { dayOfWeek: 0, isActive: false, startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 1, isActive: false, startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 2, isActive: false, startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 3, isActive: false, startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 4, isActive: false, startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 5, isActive: false, startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 6, isActive: false, startTime: '09:00', endTime: '17:00' },
  ];
  
  const [workingDays, setWorkingDays] = useState<WorkingHours[]>(defaultWorkingHours);

  const formatTimeForPicker = (timeString: string) => {
    if (!timeString) return '09:00';
    if (/^\d{2}:\d{2}$/.test(timeString)) return timeString;
    return timeString.substring(0, 5);
  };

  const toggleDayActive = (dayOfWeek: number) => {
    setWorkingDays(
      workingDays.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, isActive: !day.isActive } : day
      )
    );
  };

  const updateStartTime = (dayOfWeek: number, time: string) => {
    setWorkingDays(
      workingDays.map((day) => 
        day.dayOfWeek === dayOfWeek ? { ...day, startTime: time } : day
      )
    );
  };

  const updateEndTime = (dayOfWeek: number, time: string) => {
    setWorkingDays(
      workingDays.map((day) => 
        day.dayOfWeek === dayOfWeek ? { ...day, endTime: time } : day
      )
    );
  };

  const validateWorkingHours = () => {
    for (const day of workingDays) {
      if (day.isActive) {
        const startMinutes = 
          parseInt(day.startTime.split(':')[0]) * 60 + parseInt(day.startTime.split(':')[1]);
        const endMinutes = 
          parseInt(day.endTime.split(':')[0]) * 60 + parseInt(day.endTime.split(':')[1]);
        
        if (startMinutes >= endMinutes) {
          Alert.alert(
            "Invalid Time Selection", 
            `For ${showDayOfWeek(day.dayOfWeek)}, end time must be after start time.`
          );
          return false;
        }
      }
    }
    return true;
  };

  const saveWorkingHours = async () => {
    if (!validateWorkingHours()) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      if (!user || !user.userID) {
        setError('User information is missing');
        return;
      }
      
      const dataToSave = workingDays.map(day => ({
        clinicID: day.clinicID,
        dayOfWeek: day.dayOfWeek,
        startTime: day.startTime + ':00',
        endTime: day.endTime + ':00',
        isActive: day.isActive
      }));
      
      const response = await updateWorkingHours(user.userID, dataToSave);
      
      if (response.ok) {
        Alert.alert("Success", "Working hours updated successfully");
      } else {
        const errorData = await response.json();
        setError(`Failed to update: ${errorData.message || response.statusText}`);
        Alert.alert("Error", "Failed to update working hours");
      }
    } catch (err) {
      console.error('Error saving working hours:', err);
      setError('An error occurred while saving working hours');
      Alert.alert("Error", "An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const getData = async () => {
    if (!user || !user.userID) {
      setError('User information is missing');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetchWorkingHours(user.userID);
      
      if (res.ok) {
        const data = await res.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const formattedData = data.map(item => ({
            dayOfWeek: item.dayOfWeek,
            isActive: item.isActive,
            startTime: formatTimeForPicker(item.startTime),
            endTime: formatTimeForPicker(item.endTime)
          }));
          
          formattedData.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
          
          setWorkingDays(formattedData);
          console.log('Fetched and formatted working hours:', formattedData);
        } else {
          console.log('No working hours data found, using defaults');
          setWorkingDays(defaultWorkingHours);
        }
      } else {
        setError(`Failed to fetch working hours: ${res.statusText}`);
        console.error('API error:', res.status, res.statusText);
      }
    } catch (error) {
      console.error('Error fetching working hours:', error);
      setError('An error occurred while fetching working hours.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getData();
    }
  }, [user]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <HeaderSection title="Working Hours" backBtn />
      {isLoading ? (
        <View className="mt-10 flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-2 text-gray-500">Loading working time...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-500">{error}</Text>
          <TouchableOpacity 
            onPress={getData} 
            className="mt-4 rounded-md bg-blue-500 px-4 py-2">
            <Text className="text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="p-4">
          {workingDays.map((day) => (
            <View key={day.dayOfWeek} className="mb-3 rounded-lg border border-gray-200 p-3">
              <View className="flex-row items-center justify-between">
                <View className="w-24 flex-row items-center">
                  <Switch
                    className="mr-2"
                    value={day.isActive}
                    onValueChange={() => toggleDayActive(day.dayOfWeek)}
                    trackColor={{ false: '#d1d5db', true: '#0891b2' }}
                    thumbColor={day.isActive ? '#fff' : '#f4f3f4'}
                  />
                  <Text className="text-base font-semibold">{showDayOfWeek(day.dayOfWeek)}</Text>
                </View>

                {!day.isActive ? (
                  <View className="flex-1 items-end justify-center pr-4">
                    <Text className="text-sm text-gray-500">Not working this day</Text>
                  </View>
                ) : (
                  <View className="flex-1 flex-row items-center justify-end">
                    <View className="h-10 w-28 justify-center overflow-hidden rounded">
                      <Picker
                        selectedValue={day.startTime}
                        onValueChange={(itemValue) => updateStartTime(day.dayOfWeek, itemValue)}
                        style={{ height: 40, width: '100%' }}
                        itemStyle={{ height: '100%', fontSize: 14 }}>
                        {timeOptions.map((time) => (
                          <Picker.Item key={`start-${time}`} label={time} value={time} />
                        ))}
                      </Picker>
                    </View>

                    <View className="px-1">
                      <Text className="text-sm font-medium text-gray-600">to</Text>
                    </View>

                    <View className="h-10 w-28 justify-center overflow-hidden rounded">
                      <Picker
                        selectedValue={day.endTime}
                        onValueChange={(itemValue) => updateEndTime(day.dayOfWeek, itemValue)}
                        style={{ height: 40, width: '100%' }}
                        itemStyle={{ height: '100%', fontSize: 14 }}>
                        {timeOptions.map((time) => (
                          <Picker.Item key={`end-${time}`} label={time} value={time} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                )}
              </View>
            </View>
          ))}

          <TouchableOpacity
            onPress={saveWorkingHours}
            disabled={isSaving}
            className={`mb-10 rounded-md px-6 py-3 ${isSaving ? 'bg-gray-400' : 'bg-cyan-600'}`}>
            {isSaving ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#ffffff" />
                <Text className="ml-2 text-center font-bold text-white">Saving...</Text>
              </View>
            ) : (
              <Text className="text-center font-bold text-white">Save Working Hours</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default WorkingHoursScreen;
