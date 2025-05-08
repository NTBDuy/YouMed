import { useCallback, useContext, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarCheck, faClock } from '@fortawesome/free-regular-svg-icons';
import {
  faUserInjured,
  faMagnifyingGlass,
  faClipboardList,
  faBell,
  faHeartPulse,
  faFileWaveform,
  faUserGroup,
} from '@fortawesome/free-solid-svg-icons';

import { AuthContext } from 'contexts/AuthContext';
import { DoctorStackParamList } from '../../../types/StackParamList';
import { getGenderText, getUserInitials } from 'utils/userHelpers';
import {  fetchAppointmentsByDoctor, fetchPatients, fetchTodayDoctorStats } from 'utils/apiUtils';
import { formatLocaleDateTime, showTodayOrTomorrow } from 'utils/datetimeUtils';
import Appointment from 'types/Appointment';
import Patient from 'types/Patient';

const DoctorHomeScreen = () => {
  const navigation = useNavigation<NavigationProp<DoctorStackParamList>>();
  const { user } = useContext(AuthContext);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [inProgressAppointments, setInProgressAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [todayStats, setTodayStats] = useState({
    total: 0,
    completed: 0,
    upcoming: 0,
    cancelled: 0,
  });

  const getOverview = async () => {
    try {
      const res = await fetchTodayDoctorStats(user!.userID);
      if (res.ok) {
        const data = await res.json();
        setTodayStats(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getUpcomingAppointments = async () => {
    try {
      const res = await fetchAppointmentsByDoctor(user!.userID, 'Scheduled');
      if (res.ok) {
        const data = await res.json();
        setUpcomingAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
    }
  };

  const getInProgressAppointments = async () => {
    try {
      const res = await fetchAppointmentsByDoctor(user!.userID, 'In Progress');
      if (res.ok) {
        const data = await res.json();
        setInProgressAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
    }
  };

  const getRecentPatients = async () => {
    try {
      const response = await fetchPatients(user!.userID);
      // const response = await fetchDoctorPatients(user!.userID);
      if (response.ok) {
        const data = await response.json();

        const enhancedData = data.map((patient: Patient) => ({
          ...patient,
          lastVisit: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
          condition: ['Hypertension', 'Diabetes', 'Asthma', 'Arthritis', 'Regular Check-up'][
            Math.floor(Math.random() * 5)
          ],
        }));
        setPatients(enhancedData);
      } else {
        console.log('Failed to fetch patient list');
      }
    } catch (error) {
      console.error('Error fetching patient list:', error);
    }
  };

  const handlePress = () => {
    Alert.alert('', 'Coming Soon!');
  };

  useFocusEffect(
    useCallback(() => {
      getOverview();
      getUpcomingAppointments();
      getInProgressAppointments();
      getRecentPatients();
    }, [user])
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="-mt-20 rounded-b-3xl bg-emerald-600 px-5 pb-8 pt-20 shadow-md">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Pressable
              className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-emerald-500"
              onPress={() => navigation.navigate('Profile')}>
              <Text className="text-base font-semibold text-white">
                {getUserInitials(user!.fullname)}
              </Text>
            </Pressable>
            <View>
              <Text className="text-sm text-emerald-100">Welcome back,</Text>
              <Text className="text-base font-bold text-white">
                Dr. {user?.fullname && user.fullname.trim() !== '' ? user.fullname : user?.email}
              </Text>
            </View>
          </View>
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-emerald-500"
            onPress={() => {
              navigation.navigate('Notifications');
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
            navigation.navigate('Records');
          }}>
          <FontAwesomeIcon icon={faMagnifyingGlass} size={16} color="#64748b" />
          <Text className="ml-2 flex-1 text-gray-400">Search for medical records...</Text>
        </Pressable>
      </View>

      <ScrollView className="-mb-10 flex-1" showsVerticalScrollIndicator={false}>
        {/* Today's Statistics */}
        <View className="mx-5 mt-4">
          <Text className="mb-2 text-lg font-bold text-gray-800">Today's Overview</Text>
          <View className="flex-row justify-between">
            <View className="w-[48%] rounded-xl bg-white p-3 shadow">
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-emerald-600">{todayStats.upcoming}</Text>
                <View className="h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <FontAwesomeIcon icon={faCalendarCheck} size={18} color="#0d9488" />
                </View>
              </View>
              <Text className="mt-1 text-sm text-gray-600">Upcoming</Text>
            </View>
            <View className="w-[48%] rounded-xl bg-white p-3 shadow">
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-green-600">{todayStats.completed}</Text>
                <View className="h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <FontAwesomeIcon icon={faClipboardList} size={18} color="#22c55e" />
                </View>
              </View>
              <Text className="mt-1 text-sm text-gray-600">Completed</Text>
            </View>
          </View>
          <View className="mt-2 flex-row justify-between">
            <View className="w-[48%] rounded-xl bg-white p-3 shadow">
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-red-600">{todayStats.cancelled}</Text>
                <View className="h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <FontAwesomeIcon icon={faClock} size={18} color="#ef4444" />
                </View>
              </View>
              <Text className="mt-1 text-sm text-gray-600">Cancelled</Text>
            </View>
            <View className="w-[48%] rounded-xl bg-white p-3 shadow">
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-gray-700">{todayStats.total}</Text>
                <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <FontAwesomeIcon icon={faUserGroup} size={18} color="#4b5563" />
                </View>
              </View>
              <Text className="mt-1 text-sm text-gray-600">Total</Text>
            </View>
          </View>
        </View>

        {inProgressAppointments.length > 0 && (
          <View className="mx-5 mt-6">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-800">In Progress</Text>
              {inProgressAppointments.length > 3 && (
                <Pressable onPress={() => navigation.navigate('Appointments')}>
                  <Text className="font-medium text-emerald-600">See All</Text>
                </Pressable>
              )}
            </View>

            <View className="overflow-hidden rounded-xl bg-white shadow">
              {inProgressAppointments.slice(0, 3).map((appointment) => (
                <Pressable
                  key={appointment.appointmentID}
                  className="border-b border-gray-100 last:border-b-0"
                  onPress={() =>
                    navigation.navigate('AppointmentDetail', {
                      appointmentID: appointment.appointmentID,
                    })
                  }>
                  <View className="flex-row p-4">
                    <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                      <FontAwesomeIcon icon={faUserInjured} size={20} color="#f97316" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base font-bold text-gray-800">
                          {appointment.patient.fullname || 'No Information'}
                        </Text>
                        <View className="rounded-full bg-orange-100 px-3 py-1">
                          <Text className="text-xs font-medium text-orange-700">In Progress</Text>
                        </View>
                      </View>
                      <Text className="text-sm text-gray-600">
                        {appointment.appointmentType || 'Regular Check-up'}
                      </Text>
                      <View className="mt-1 flex-row items-center">
                        <FontAwesomeIcon icon={faClock} size={12} color="#64748b" />
                        <Text className="ml-1 text-xs text-gray-500">
                          {formatLocaleDateTime(appointment.appointmentDate)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {upcomingAppointments.length > 0 && (
          <View className="mx-5 mt-6">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-800">Next Appointments</Text>
              {upcomingAppointments.length > 3 && (
                <Pressable onPress={() => navigation.navigate('Appointments')}>
                  <Text className="font-medium text-emerald-600">See All</Text>
                </Pressable>
              )}
            </View>

            <View className="overflow-hidden rounded-xl bg-white shadow">
              {upcomingAppointments.slice(0, 3).map((appointment, index) => (
                <Pressable
                  key={appointment.appointmentID}
                  className="border-b border-gray-100 last:border-b-0"
                  onPress={() =>
                    navigation.navigate('AppointmentDetail', {
                      appointmentID: appointment.appointmentID,
                    })
                  }>
                  <View className="flex-row p-4">
                    <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                      <FontAwesomeIcon icon={faCalendarCheck} size={20} color="#0d9488" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base font-bold text-gray-800">
                          {appointment.patient.fullname || 'No Information'}
                        </Text>
                        <View className="rounded-full bg-emerald-100 px-3 py-1">
                          <Text className="text-xs font-medium text-emerald-700">
                            {showTodayOrTomorrow(appointment.appointmentDate)}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-sm text-gray-600">
                        {appointment.appointmentType || 'Regular Check-up'}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View className="mx-5 mt-4">
          <Text className="mb-3 text-lg font-bold text-gray-800">Quick Actions</Text>
          <View className="flex-row justify-between">
            <Pressable
              className="w-1/4 items-center"
              onPress={() => {
                navigation.navigate('Appointments');
              }}>
              <View className="mb-2 h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
                <FontAwesomeIcon icon={faCalendarCheck} size={24} color="#0d9488" />
              </View>
              <Text className="text-center text-xs font-medium text-gray-700">My Schedule</Text>
            </Pressable>
            <Pressable
              className="w-1/4 items-center"
              onPress={() => {
                navigation.navigate('Patients');
              }}>
              <View className="mb-2 h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
                <FontAwesomeIcon icon={faUserGroup} size={24} color="#0d9488" />
              </View>
              <Text className="text-center text-xs font-medium text-gray-700">My Patients</Text>
            </Pressable>
            <Pressable
              className="w-1/4 items-center"
              onPress={() => {
                navigation.navigate('Records');
              }}>
              <View className="mb-2 h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
                <FontAwesomeIcon icon={faFileWaveform} size={24} color="#f59e0b" />
              </View>
              <Text className="text-center text-xs font-medium text-gray-700">Medical Records</Text>
            </Pressable>
            <Pressable
              className="w-1/4 items-center"
              onPress={() => {
                handlePress();
              }}>
              <View className="mb-2 h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
                <FontAwesomeIcon icon={faHeartPulse} size={24} color="#ef4444" />
              </View>
              <Text className="text-center text-xs font-medium text-gray-700">Emergency</Text>
            </Pressable>
          </View>
        </View>

        {/* Recent Patients */}
        <View className="mt-6">
          <View className="mb-1 flex-row items-center justify-between px-5">
            <Text className="text-lg font-bold text-gray-800">Recent Patients</Text>
            <Pressable
              onPress={() => {
                navigation.navigate('Patients');
              }}>
              <Text className="font-medium text-emerald-600">See All</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 5, paddingVertical: 10 }}>
            {patients.slice(0, 5).map((patient) => (
              <Pressable
                key={patient.patientID}
                className="mr-4 w-64 overflow-hidden rounded-xl bg-white shadow"
                onPress={() =>
                  navigation.navigate('PatientDetail', { patientID: patient.patientID })
                }>
                <View className="p-4">
                  <View className="flex-row items-center">
                    <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                      <Text className="text-base font-medium text-gray-600">
                        {getUserInitials(patient.fullname)}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-gray-800">{patient.fullname}</Text>
                      <View className="flex-row items-center">
                        <Text className="text-xs text-gray-500">
                          {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}{' '}
                          years
                        </Text>
                        <View className="mx-2 h-1 w-1 rounded-full bg-gray-300" />
                        <Text className="text-xs text-gray-500">
                          {getGenderText(patient.gender)}
                        </Text>
                      </View>
                    </View>
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

export default DoctorHomeScreen;
