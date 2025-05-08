import { Pressable, ScrollView, Text, View, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faPhone,
  faLocationDot,
  faCalendarCheck,
  faHospital,
  faClock,
  faCircleInfo,
  faStethoscope,
} from '@fortawesome/free-solid-svg-icons';

import Clinic from 'types/Clinic';
import HeaderSection from 'components/HeaderSection';
import { useEffect, useState } from 'react';
import { fetchClinicDetail } from 'utils/apiUtils';

const ClinicDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const clinic = route.params?.clinic as Clinic | undefined;
  const clinicId = route.params?.clinicId as number | undefined;

  useEffect(() => {
    if (clinicId && !clinic) {
      getClinicById(clinicId);
    } else if (!clinic && !clinicId) {
      setError("No clinic information available");
    }
  }, [clinic, clinicId]);

  const getClinicById = async (clinicId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchClinicDetail(clinicId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch clinic: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.name) {
        throw new Error('Invalid clinic data received');
      }
      
      navigation.setParams({ clinic: data });
    } catch (error) {
      console.error('Error fetching clinic:', error);
      setError(error instanceof Error ? error.message : 'Failed to load clinic details');
    } finally {
      setIsLoading(false);
    }
  };

  const getDayName = (dayOfWeek: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const formatTime = (time: string): string => {
    return time?.substring(0, 5) || '';
  };

  const handleCallPress = () => {
    if (!clinic?.phoneNumber) return;
    
    const phoneNumber = clinic.phoneNumber;
    const phoneUrl = Platform.OS === 'android' ? `tel:${phoneNumber}` : `telprompt:${phoneNumber}`;
    Linking.openURL(phoneUrl).catch(err => console.error('Error opening phone dialer:', err));
  };

  const handleMapPress = () => {
    if (!clinic?.clinicAddress) return;
    
    const address = encodeURIComponent(clinic.clinicAddress);
    const url = Platform.OS === 'ios' ? `maps:0,0?q=${address}` : `geo:0,0?q=${address}`;
    Linking.openURL(url).catch(err => console.error('Error opening maps:', err));
  };

  const handleBookingPress = () => {
    if (!clinic) return;
    navigation.navigate('BookingPage', { clinic });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-700">Loading clinic details...</Text>
      </SafeAreaView>
    );
  }

  if (error || (!clinic && !isLoading)) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-red-500 mb-4">{error || 'No clinic information available'}</Text>
        <Pressable
          className="px-4 py-2 bg-blue-600 rounded-lg"
          onPress={() => navigation.goBack()}>
          <Text className="text-white">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <HeaderSection
        backBtn
        customTitle={
          <View className="flex-1">
            <Text className="text-center text-xl font-bold text-white">{clinic?.name || 'Clinic Details'}</Text>
          </View>
        }
      />

      <ScrollView className="-mb-10 flex-1" showsVerticalScrollIndicator={false}>
        
        <View className="mb-2 bg-white px-4 py-5 shadow-sm">
          <View className="mb-3 flex-row items-center">
            <FontAwesomeIcon icon={faHospital} size={16} color="#3b82f6" />
            <Text className="ml-3 text-lg font-semibold text-gray-800">{clinic?.name}</Text>
          </View>

          {clinic?.clinicAddress && (
            <View className="mb-3 flex-row items-start">
              <FontAwesomeIcon icon={faLocationDot} size={16} color="#3b82f6" />
              <Text className="ml-3 flex-1 text-gray-700">{clinic.clinicAddress}</Text>
            </View>
          )}

          {clinic?.phoneNumber && (
            <View className="flex-row items-center">
              <FontAwesomeIcon icon={faPhone} size={16} color="#3b82f6" />
              <Text className="ml-3 text-gray-700">{clinic.phoneNumber}</Text>
            </View>
          )}
        </View>

        
        <View className="mb-2 flex-row bg-white shadow-sm">
          <Pressable
            className="flex-1 flex-row items-center justify-center py-4"
            onPress={handleCallPress}
            disabled={!clinic?.phoneNumber}>
            <FontAwesomeIcon icon={faPhone} size={16} color={clinic?.phoneNumber ? "#3b82f6" : "#a0aec0"} />
            <Text className={`ml-2 font-medium ${clinic?.phoneNumber ? "text-blue-600" : "text-gray-400"}`}>Call</Text>
          </Pressable>

          <Pressable
            className="flex-1 flex-row items-center justify-center border-l border-r border-gray-200 py-4"
            onPress={handleMapPress}
            disabled={!clinic?.clinicAddress}>
            <FontAwesomeIcon icon={faLocationDot} size={16} color={clinic?.clinicAddress ? "#3b82f6" : "#a0aec0"} />
            <Text className={`ml-2 font-medium ${clinic?.clinicAddress ? "text-blue-600" : "text-gray-400"}`}>Directions</Text>
          </Pressable>

          <Pressable
            className="flex-1 flex-row items-center justify-center py-4"
            onPress={handleBookingPress}>
            <FontAwesomeIcon icon={faCalendarCheck} size={16} color="#3b82f6" />
            <Text className="ml-2 font-medium text-blue-600">Book</Text>
          </Pressable>
        </View>

        
        {clinic?.specialties && clinic.specialties.length > 0 && (
          <View className="mb-2 bg-white px-4 py-5 shadow-sm">
            <View className="mb-3 flex-row items-center">
              <FontAwesomeIcon icon={faStethoscope} size={16} color="#3b82f6" />
              <Text className="ml-3 text-lg font-semibold text-gray-800">Specialties</Text>
            </View>

            <View className="ml-7 flex-row flex-wrap">
              {clinic.specialties.map((specialty) => (
                <View
                  key={specialty.specialtyID}
                  className="mb-2 mr-2 rounded-full bg-blue-50 px-3 py-1">
                  <Text className="text-sm text-blue-700">{specialty.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        
        {clinic?.clinicWorkingHours && clinic.clinicWorkingHours.length > 0 && (
          <View className="mb-2 bg-white px-4 py-5 shadow-sm">
            <View className="mb-3 flex-row items-center">
              <FontAwesomeIcon icon={faClock} size={16} color="#3b82f6" />
              <Text className="ml-3 text-lg font-semibold text-gray-800">Working Hours</Text>
            </View>

            <View className="ml-7">
              {clinic.clinicWorkingHours
                .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                .map((workingHour) => (
                  <View
                    key={workingHour.clinicWorkingHoursID}
                    className="mb-2 flex-row items-center justify-between">
                    <Text
                      className={`text-base ${
                        workingHour.isActive ? 'text-gray-800' : 'text-gray-400'
                      }`}>
                      {getDayName(workingHour.dayOfWeek)}
                    </Text>
                    <Text
                      className={`text-base ${
                        workingHour.isActive ? 'text-gray-800' : 'text-gray-400'
                      }`}>
                      {workingHour.isActive
                        ? `${formatTime(workingHour.startTime)} - ${formatTime(workingHour.endTime)}`
                        : 'Closed'}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        
        {clinic?.introduction && (
          <View className="mb-2 bg-white px-4 py-5 shadow-sm">
            <View className="mb-3 flex-row items-center">
              <FontAwesomeIcon icon={faCircleInfo} size={16} color="#3b82f6" />
              <Text className="ml-3 text-lg font-semibold text-gray-800">Introduction</Text>
            </View>
            <Text className="ml-7 text-base leading-6 text-gray-700">{clinic.introduction}</Text>
          </View>
        )}

        
        <View className="px-4 py-6">
          <Pressable
            className="flex-row items-center justify-center rounded-lg bg-blue-600 px-4 py-4"
            onPress={handleBookingPress}>
            <FontAwesomeIcon icon={faCalendarCheck} size={18} color="#fff" />
            <Text className="ml-2 text-base font-bold text-white">Book Appointment Now</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ClinicDetailScreen;