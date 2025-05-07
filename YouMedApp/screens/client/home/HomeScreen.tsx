import { useCallback, useContext, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarCheck, faClock } from '@fortawesome/free-regular-svg-icons';
import {
  faFileMedical,
  faLocationDot,
  faMagnifyingGlass,
  faPhone,
  faStar,
  faUserDoctor,
  faBell,
} from '@fortawesome/free-solid-svg-icons';

import { AuthContext } from 'contexts/AuthContext';
import { HomeStackParamList } from '../../../types/StackParamList';
import { fetchClinics, fetchClientUpcomingAppointments } from 'utils/apiUtils';
import { getUserInitials, isOpenNow } from 'utils/userHelpers';
import { showTodayOrTomorrow } from 'utils/datetimeUtils';
import { Appointment } from 'types/Appointment';
import { Clinic } from 'types/Clinic';

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<HomeStackParamList>>();
  const { user } = useContext(AuthContext);
  const [upcomingData, setUpcomingData] = useState<Appointment[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);

  const getUpcoming = async () => {
    try {
      const res = await fetchClientUpcomingAppointments(user!.userID);
      if (res.ok) {
        const data = await res.json();
        setUpcomingData(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getClinicList = async () => {
    try {
      const response = await fetchClinics();

      if (response.ok) {
        const data = await response.json();
        const enhancedData = data.map((clinic: Clinic) => ({
          ...clinic,
          rating: (Math.random() * 2 + 3).toFixed(1),
          distance: `${(Math.random() * 5).toFixed(1)} km`,
          // openingHours: Math.random() > 0.2 ? 'Open now' : 'Closed',
        }));
        setClinics(enhancedData);
      } else {
        console.log('Failed to fetch clinic list');
      }
    } catch (error) {
      console.error('Error fetching clinic list:', error);
    }
  };

  const handlePress = () => {
    Alert.alert('', 'Coming Soon!');
  };

  useFocusEffect(
    useCallback(() => {
      getUpcoming();
      getClinicList();
    }, [user])
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="-mt-20 rounded-b-3xl bg-blue-600 px-5 pb-8 pt-20 shadow-md">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Pressable
              className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-500"
              onPress={() => navigation.navigate('Profile')}>
              <Text className="text-base font-semibold text-white">
                {getUserInitials(user!.fullname)}
              </Text>
            </Pressable>
            <View>
              <Text className="text-sm text-blue-100">Hello,</Text>
              <Text className="text-base font-bold text-white">
                {user?.fullname && user.fullname.trim() !== '' ? user.fullname : user?.email}
              </Text>
            </View>
          </View>
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-blue-500"
            onPress={() => {
              navigation.navigate('Notification');
            }}>
            <FontAwesomeIcon icon={faBell} size={18} color="white" />
          </Pressable>
        </View>
      </View>

      {/* Search Bar */}
      <View className="mx-5 -mt-5 overflow-hidden rounded-xl bg-white px-4 py-3 shadow">
        <Pressable
          className="flex-row items-center"
          onPress={() => {
            navigation.navigate('ClinicPage');
          }}>
          <FontAwesomeIcon icon={faMagnifyingGlass} size={16} color="#64748b" />
          <Text className="ml-2 flex-1 text-gray-400">Search for clinics or specialty ... </Text>
        </Pressable>
      </View>

      <ScrollView className="-mb-10 flex-1" showsVerticalScrollIndicator={false}>
        {/* Upcoming Appointment */}
        {upcomingData.length > 0 && (
          <View className="mx-5 mt-4">
            <Text className="mb-2 text-lg font-bold text-gray-800">Upcoming Appointments</Text>
            {upcomingData.slice(0, 2).map((appointment) => (
              <Pressable
                key={appointment.appointmentID}
                className="mb-2 overflow-hidden rounded-xl bg-blue-50 shadow"
                onPress={() =>
                  navigation.navigate('Detail', { appointmentID: appointment.appointmentID })
                }>
                <View className="flex-row border-l-4 border-blue-600 bg-white p-4">
                  <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <FontAwesomeIcon icon={faUserDoctor} size={20} color="#2563eb" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-lg font-bold text-gray-800">
                        {appointment.doctor?.user.fullname || 'No Information'}
                      </Text>
                      <View className="rounded-full bg-blue-100 px-3 py-1">
                        <Text className="text-xs font-medium text-blue-700">
                          {showTodayOrTomorrow(appointment.appointmentDate)}
                        </Text>
                      </View>
                    </View>
                    <View className="mt-2 flex-row items-center">
                      <FontAwesomeIcon icon={faLocationDot} size={12} color="#64748b" />
                      <Text className="ml-1 text-xs text-gray-500">{appointment.clinic?.name}</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View className="mx-5 mt-4">
          <Text className="mb-3 text-lg font-bold text-gray-800">Quick Actions</Text>
          <View className="flex-row justify-between">
            <Pressable
              className="w-1/4 items-center"
              onPress={() => {
                navigation.navigate('ClinicPage');
              }}>
              <View className="mb-2 h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
                <FontAwesomeIcon icon={faCalendarCheck} size={24} color="#2563eb" />
              </View>
              <Text className="text-center text-xs font-medium text-gray-700">
                Book Appointment
              </Text>
            </Pressable>
            <Pressable
              className="w-1/4 items-center"
              onPress={() => {
                handlePress();
              }}>
              <View className="mb-2 h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
                <FontAwesomeIcon icon={faLocationDot} size={24} color="#2563eb" />
              </View>
              <Text className="text-center text-xs font-medium text-gray-700">Nearby Clinics</Text>
            </Pressable>
            <Pressable
              className="w-1/4 items-center"
              onPress={() => {
                navigation.navigate('MedicalHistory');
              }}>
              <View className="mb-2 h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
                <FontAwesomeIcon icon={faFileMedical} size={24} color="#f59e0b" />
              </View>
              <Text className="text-center text-xs font-medium text-gray-700">Medical Records</Text>
            </Pressable>
            <Pressable
              className="w-1/4 items-center"
              onPress={() => {
                handlePress();
              }}>
              <View className="mb-2 h-16 w-16 items-center justify-center rounded-2xl bg-rose-100">
                <FontAwesomeIcon icon={faPhone} size={24} color="#f43f5e" />
              </View>
              <Text className="text-center text-xs font-medium text-gray-700">Emergency</Text>
            </Pressable>
          </View>
        </View>

        {/* Popular Clinics */}
        <View className="mt-6">
          <View className="mb-1 flex-row items-center justify-between px-5">
            <Text className="text-lg font-bold text-gray-800">Popular Clinics</Text>
            <Pressable
              onPress={() => {
                navigation.navigate('ClinicPage');
              }}>
              <Text className="font-medium text-blue-600">See All</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 5, paddingVertical: 10 }}>
            {clinics.slice(0, 4).map((clinic) => (
              <Pressable
                key={clinic.clinicID}
                className="mr-4 w-64 overflow-hidden rounded-xl bg-white shadow"
                onPress={() => navigation.navigate('ClinicDetails', { clinic: clinic })}>
                <View className="h-32 w-full bg-gray-200">
                  {/* Image placeholder */}
                  <View className="h-full w-full items-center justify-center">
                    <Text className="font-medium text-gray-400">{clinic.name}</Text>
                  </View>
                </View>
                <View className="p-3">
                  <Text className="text-base font-bold text-gray-800">{clinic.name}</Text>
                  <View className="mb-2 mt-1 flex-row items-center">
                    <FontAwesomeIcon icon={faStar} size={12} color="#facc15" />
                    <Text className="ml-1 text-xs font-medium text-gray-700">
                      {clinic.rating} ({clinic.rating})
                    </Text>
                    <View className="mx-2 h-1 w-1 rounded-full bg-gray-300" />
                    <Text className="text-xs text-gray-500">{clinic.distance}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <FontAwesomeIcon icon={faLocationDot} size={12} color="#64748b" />
                    <Text className="ml-1 flex-1 text-xs text-gray-500" numberOfLines={1}>
                      {clinic.clinicAddress}
                    </Text>
                  </View>
                  <View className="mt-1 flex-row items-center">
                    <FontAwesomeIcon icon={faClock} size={12} color="#64748b" />
                    <Text className="ml-1 text-xs text-gray-500">{isOpenNow(clinic.clinicWorkingHours) ? 'Open now' : 'Closed'}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
