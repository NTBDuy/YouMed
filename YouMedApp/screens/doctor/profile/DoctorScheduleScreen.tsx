import { View, Text, Switch, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderSection from 'components/HeaderSection';
import DoctorSchedule from 'types/DoctorSchedule';
import { showDayOfWeek, timeOptions } from 'utils/datetimeUtils';
import { Picker } from '@react-native-picker/picker';

const DoctorScheduleScreen = () => {
  const defaultDoctorSchedule: DoctorSchedule[] = [
    {
      scheduleID: 1,
      doctorID: 101,
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      isActive: false,
      isRecurring: true,
      validFrom: '2025-05-01',
      validTo: '2025-12-31',
      createdAt: '2025-05-01T08:00:00Z',
      lastUpdated: '2025-05-01T08:00:00Z',
    },
    {
      scheduleID: 2,
      doctorID: 101,
      dayOfWeek: 2, // Tuesday
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      isActive: false,
      isRecurring: true,
      validFrom: '2025-05-01',
      validTo: '2025-12-31',
      createdAt: '2025-05-01T08:00:00Z',
      lastUpdated: '2025-05-01T08:00:00Z',
    },
    {
      scheduleID: 3,
      doctorID: 101,
      dayOfWeek: 3, // Wednesday
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      isActive: false,
      isRecurring: true,
      validFrom: '2025-05-01',
      validTo: '2025-12-31',
      createdAt: '2025-05-01T08:00:00Z',
      lastUpdated: '2025-05-01T08:00:00Z',
    },
    {
      scheduleID: 4,
      doctorID: 101,
      dayOfWeek: 4, // Thursday
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      isActive: false,
      isRecurring: true,
      validFrom: '2025-05-01',
      validTo: '2025-12-31',
      createdAt: '2025-05-01T08:00:00Z',
      lastUpdated: '2025-05-01T08:00:00Z',
    },
    {
      scheduleID: 5,
      doctorID: 101,
      dayOfWeek: 5, // Friday
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      isActive: false,
      isRecurring: true,
      validFrom: '2025-05-01',
      validTo: '2025-12-31',
      createdAt: '2025-05-01T08:00:00Z',
      lastUpdated: '2025-05-01T08:00:00Z',
    },
    {
      scheduleID: 6,
      doctorID: 101,
      dayOfWeek: 6, // Saturday
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      isActive: false,
      isRecurring: true,
      validFrom: '2025-05-01',
      validTo: '2025-12-31',
      createdAt: '2025-05-01T08:00:00Z',
      lastUpdated: '2025-05-01T08:00:00Z',
    },
    {
      scheduleID: 7,
      doctorID: 101,
      dayOfWeek: 0, // Sunday
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      isActive: false,
      isRecurring: true,
      validFrom: '2025-05-01',
      validTo: '2025-12-31',
      createdAt: '2025-05-01T08:00:00Z',
      lastUpdated: '2025-05-01T08:00:00Z',
    },
  ];

  const [doctorSchedule, setDoctorSchedule] = useState<DoctorSchedule[]>(defaultDoctorSchedule);

  return (
    <SafeAreaView>
      <HeaderSection title="Doctor Schedule" backBtn />
      <ScrollView className="p-4">
        {doctorSchedule.map((day) => (
          <View key={day.dayOfWeek} className="mb-3 rounded-lg border border-gray-200 p-3">
            <View className="flex-row items-center justify-between">
              <View className="w-24 flex-row items-center">
                <Switch
                  className="mr-2"
                  value={day.isActive}
                  // onValueChange={() => toggleDayActive(day.dayOfWeek)}
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
                      // onValueChange={(itemValue) => updateStartTime(day.dayOfWeek, itemValue)}
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
                      // onValueChange={(itemValue) => updateEndTime(day.dayOfWeek, itemValue)}
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default DoctorScheduleScreen;
