import { View, Text, ActivityIndicator, Switch, TouchableOpacity, ScrollView } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderSection from 'components/HeaderSection';
import { WorkingHours } from 'types/WorkingHours';
import { AuthContext } from 'contexts/AuthContext';
import { fetchWorkingHours } from 'utils/apiUtils';
import { formatTime, showDayOfWeek } from 'utils/datetimeUtils';
import DateTimePickerModal from 'components/DateTimePickerModal';

const WorkingHoursScreen = () => {
  const { user } = useContext(AuthContext);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [workingDays, setWorkingDays] = useState<{ [key: number]: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Time picker states
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'start' | 'end'>('start');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());

  const workingDaysInitialState = [
    { dayOfWeek: 0, name: 'Sunday' },
    { dayOfWeek: 1, name: 'Monday' },
    { dayOfWeek: 2, name: 'Tuesday' },
    { dayOfWeek: 3, name: 'Wednesday' },
    { dayOfWeek: 4, name: 'Thursday' },
    { dayOfWeek: 5, name: 'Friday' },
    { dayOfWeek: 6, name: 'Saturday' },
  ];

  const getData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchWorkingHours(user!.userID);
      if (res.ok) {
        const data: WorkingHours[] = await res.json();
        setWorkingHours(data);

        const initialDaysState = workingDaysInitialState.reduce(
          (acc, item) => {
            acc[item.dayOfWeek] = data.some(
              (workingDay) => workingDay.dayOfWeek === item.dayOfWeek
            );
            return acc;
          },
          {} as { [key: number]: boolean }
        );
        setWorkingDays(initialDaysState);
      } else {
        setError(`Failed to fetch working hours: ${res.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching working hours:', error);
      setError('An error occurred while fetching working hours.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [user]);

  const toggleDay = async (dayOfWeek: number) => {
    const newState = !workingDays[dayOfWeek];
    
    setWorkingDays((prev) => ({
      ...prev,
      [dayOfWeek]: newState,
    }));

    if (newState) {
      // If turning on, create default working hours for this day
      const defaultStartTime = '09:00';
      const defaultEndTime = '17:00';
      
      const existingDay = workingHours.find(day => day.dayOfWeek === dayOfWeek);
      
      if (existingDay) {
        // Update existing day
        setWorkingHours(prev => 
          prev.map(day => 
            day.dayOfWeek === dayOfWeek 
              ? { ...day, isActive: true } 
              : day
          )
        );
      } else {
        // Create new day
        // setWorkingHours(prev => [
        //   ...prev,
        //   { 
        //     dayOfWeek,
        //     startTime: defaultStartTime,
        //     endTime: defaultEndTime,
        //     isActive: true
        //   }
        // ]);
      }
    } else {
      // If turning off, mark as inactive but keep the times
      setWorkingHours(prev => 
        prev.map(day => 
          day.dayOfWeek === dayOfWeek 
            ? { ...day, isActive: false } 
            : day
        )
      );
    }

    // In a real app, you might want to save this change immediately
    // await saveWorkingHours();
  };

  const openStartTimePicker = (dayOfWeek: number) => {
    // Find this day's data or create default time
    const dayData = workingHours.find(day => day.dayOfWeek === dayOfWeek);
    const timeStr = dayData?.startTime || '09:00';
    
    // Create a Date object from the time string
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    setSelectedTime(date);
    setSelectedDay(dayOfWeek);
    setPickerMode('start');
    setShowTimePicker(true);
  };

  const openEndTimePicker = (dayOfWeek: number) => {
    // Find this day's data or create default time
    const dayData = workingHours.find(day => day.dayOfWeek === dayOfWeek);
    const timeStr = dayData?.endTime || '17:00';
    
    // Create a Date object from the time string
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    setSelectedTime(date);
    setSelectedDay(dayOfWeek);
    setPickerMode('end');
    setShowTimePicker(true);
  };

  const handleTimeChange = (date: Date) => {
    setSelectedTime(date);
  };

  const confirmTimeSelection = () => {
    if (selectedDay === null) return;
    
    const hours = selectedTime.getHours().toString().padStart(2, '0');
    const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    // setWorkingHours(prev => {
    //   const existingDayIndex = prev.findIndex(day => day.dayOfWeek === selectedDay);
      
    //   if (existingDayIndex >= 0) {
    //     // Update existing day
    //     const updatedHours = [...prev];
    //     if (pickerMode === 'start') {
    //       updatedHours[existingDayIndex] = {
    //         ...updatedHours[existingDayIndex],
    //         startTime: timeString
    //       };
    //     } else {
    //       updatedHours[existingDayIndex] = {
    //         ...updatedHours[existingDayIndex],
    //         endTime: timeString
    //       };
    //     }
    //     return updatedHours;
    //   } else {
    //     // Create new day with default times
    //     // const newDay: WorkingHours = {
    //     //   dayOfWeek: selectedDay,
    //     //   startTime: pickerMode === 'start' ? timeString : '09:00',
    //     //   endTime: pickerMode === 'end' ? timeString : '17:00',
    //     //   isActive: true
    //     // };
    //     // return [...prev, newDay];
    //   }
    // });
    
    setShowTimePicker(false);
  };

  const saveWorkingHours = async () => {
    try {
      setIsSaving(true);
      
      // Filter to only include active days
      const activeHours = workingHours.filter(day => workingDays[day.dayOfWeek]);
      
      // Call your API to save working hours
    //   const res = await updateWorkingHours(user!.userID, activeHours);
      
    //   if (!res.ok) {
    //     setError('Failed to save working hours.');
    //   }
    } catch (error) {
      console.error('Error saving working hours:', error);
      setError('An error occurred while saving working hours.');
    } finally {
      setIsSaving(false);
    }
  };

  const getTimeForDay = (dayOfWeek: number, type: 'start' | 'end') => {
    const day = workingHours.find(day => day.dayOfWeek === dayOfWeek);
    return type === 'start' ? day?.startTime || '09:00' : day?.endTime || '17:00';
  };

  return (
    <SafeAreaView className="h-full">
      <HeaderSection title="Working Hours" backBtn />

      {isLoading ? (
        <View className="mt-10 flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-2 text-gray-500">Loading working time...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-500">{error}</Text>
        </View>
      ) : (
        <ScrollView className="p-4 -mb-10">
          {workingDaysInitialState.map((item) => {
            const isActive = workingDays[item.dayOfWeek] || false;
            
            return (
              <View key={item.dayOfWeek} className="mb-4 rounded-lg bg-white px-4 py-3 shadow-sm">
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-semibold">{showDayOfWeek(item.dayOfWeek)}</Text>
                  <Switch
                    value={isActive}
                    onValueChange={() => toggleDay(item.dayOfWeek)}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={isActive ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                  />
                </View>
                
                {isActive && (
                  <View className="mt-2 flex-row items-center justify-between">
                    <TouchableOpacity
                      className="w-2/5 rounded-md bg-gray-100 px-3 py-2"
                      onPress={() => openStartTimePicker(item.dayOfWeek)}
                    >
                      <Text className="text-center">{getTimeForDay(item.dayOfWeek, 'start')}</Text>
                    </TouchableOpacity>
                    
                    <Text className="text-gray-500">to</Text>
                    
                    <TouchableOpacity
                      className="w-2/5 rounded-md bg-gray-100 px-3 py-2"
                      onPress={() => openEndTimePicker(item.dayOfWeek)}
                    >
                      <Text className="text-center">{getTimeForDay(item.dayOfWeek, 'end')}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
          
          <TouchableOpacity
            className="mt-2 mb-4 rounded-lg bg-blue-600 py-3"
            onPress={saveWorkingHours}
            disabled={isSaving}
          >
            <Text className="text-center font-bold text-white">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
      
      {/* Time Picker Modal */}
      <DateTimePickerModal
        visible={showTimePicker}
        value={selectedTime}
        mode="time"
        title={`Select ${pickerMode === 'start' ? 'Start' : 'End'} Time`}
        minuteInterval={15}
        onClose={() => setShowTimePicker(false)}
        onChange={handleTimeChange}
      />
    </SafeAreaView>
  );
};

export default WorkingHoursScreen;