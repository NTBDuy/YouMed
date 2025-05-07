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
  faArrowLeft,
  faStethoscope,
} from '@fortawesome/free-solid-svg-icons';

import { Clinic } from 'types/Clinic';
import HeaderSection from 'components/HeaderSection';
import { isOpenNow } from 'utils/userHelpers';

const ClinicDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { clinic } = route.params as { clinic: Clinic };

  const getDayName = (dayOfWeek: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const formatTime = (time: string): string => {
    return time.substring(0, 5);
  };

  const handleCallPress = () => {
    const phoneNumber = clinic.phoneNumber;
    const phoneUrl = Platform.OS === 'android' ? `tel:${phoneNumber}` : `telprompt:${phoneNumber}`;
    Linking.openURL(phoneUrl);
  };

  const handleMapPress = () => {
    const address = encodeURIComponent(clinic.clinicAddress);
    const url = Platform.OS === 'ios' ? `maps:0,0?q=${address}` : `geo:0,0?q=${address}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <HeaderSection
        backBtn
        customTitle={
          <View className="flex-1">
            <Text className="text-center text-xl font-bold text-white">{clinic.name}</Text>
          </View>
        }
      />

      <ScrollView className="-mb-10 flex-1" showsVerticalScrollIndicator={false}>
        {/* Clinic Info */}
        <View className="mb-2 bg-white px-4 py-5 shadow-sm">
          <View className="mb-3 flex-row items-center">
            <FontAwesomeIcon icon={faHospital} size={16} color="#3b82f6" />
            <Text className="ml-3 text-lg font-semibold text-gray-800">{clinic.name}</Text>
          </View>

          <View className="mb-3 flex-row items-start">
            <FontAwesomeIcon icon={faLocationDot} size={16} color="#3b82f6" />
            <Text className="ml-3 flex-1 text-gray-700">{clinic.clinicAddress}</Text>
          </View>

          <View className="flex-row items-center">
            <FontAwesomeIcon icon={faPhone} size={16} color="#3b82f6" />
            <Text className="ml-3 text-gray-700">{clinic.phoneNumber}</Text>
          </View>
        </View>

        {/* Quick Action Buttons */}
        <View className="mb-2 flex-row bg-white shadow-sm">
          <Pressable
            className="flex-1 flex-row items-center justify-center py-4"
            onPress={handleCallPress}>
            <FontAwesomeIcon icon={faPhone} size={16} color="#3b82f6" />
            <Text className="ml-2 font-medium text-blue-600">Call</Text>
          </Pressable>

          <Pressable
            className="flex-1 flex-row items-center justify-center border-l border-r border-gray-200 py-4"
            onPress={handleMapPress}>
            <FontAwesomeIcon icon={faLocationDot} size={16} color="#3b82f6" />
            <Text className="ml-2 font-medium text-blue-600">Directions</Text>
          </Pressable>

          <Pressable
            className="flex-1 flex-row items-center justify-center py-4"
            onPress={() => navigation.navigate('BookingPage', { clinic: clinic })}>
            <FontAwesomeIcon icon={faCalendarCheck} size={16} color="#3b82f6" />
            <Text className="ml-2 font-medium text-blue-600">Book</Text>
          </Pressable>
        </View>

        {/* Specialties */}
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

        {/* Working Hours */}
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

        {/* Introduction */}
        <View className="mb-2 bg-white px-4 py-5 shadow-sm">
          <View className="mb-3 flex-row items-center">
            <FontAwesomeIcon icon={faCircleInfo} size={16} color="#3b82f6" />
            <Text className="ml-3 text-lg font-semibold text-gray-800">Introduction</Text>
          </View>
          <Text className="ml-7 text-base leading-6 text-gray-700">{clinic.introduction}</Text>
        </View>

        {/* Book Appointment */}
        <View className="px-4 py-6">
          <Pressable
            className="flex-row items-center justify-center rounded-lg bg-blue-600 px-4 py-4"
            onPress={() => navigation.navigate('BookingPage', { clinic: clinic })}>
            <FontAwesomeIcon icon={faCalendarCheck} size={18} color="#fff" />
            <Text className="ml-2 text-base font-bold text-white">Book Appointment Now</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ClinicDetailScreen;
