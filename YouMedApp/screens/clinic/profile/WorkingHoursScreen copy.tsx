import { View, Text, ActivityIndicator } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderSection from 'components/HeaderSection';
import { WorkingHours } from 'types/WorkingHours';
import { AuthContext } from 'contexts/AuthContext';
import { fetchWorkingHours } from 'utils/apiUtils';
import { showDayOfWeek } from 'utils/datetimeUtils';

const WorkingHoursScreen = () => {
  const { user } = useContext(AuthContext);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [user]);

  return (
    <SafeAreaView>
      <HeaderSection title="Working Hours" backBtn />

      {isLoading ? (
        <View className="mt-10 flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-2 text-gray-500">Loading working time...</Text>
        </View>
      ) : (
        <View>
          {workingHours.length > 0 ? (
            <View className="p-4">
              {workingHours.map((item, index) => (
                <View key={index} className="mb-4 rounded-lg bg-white p-4 shadow">
                  <Text className="text-lg font-semibold">{showDayOfWeek(item.dayOfWeek)}</Text>
                  <Text className="text-gray-500">
                    {item.startTime} - {item.endTime}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-500">No working hours available</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default WorkingHoursScreen;
