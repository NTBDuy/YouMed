import { useCallback, useContext, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarCheck, faClock } from '@fortawesome/free-regular-svg-icons';
import {
  faMagnifyingGlass,
  faBell,
  faUserDoctor,
  faFileCircleCheck,
  faUsers,
  faChartLine,
  faCheck,
  faUserPlus,
  faCalendarDays,
} from '@fortawesome/free-solid-svg-icons';

import { AuthContext } from 'contexts/AuthContext';
import { getUserInitials } from 'utils/userHelpers';
import { fetchAppointmentsByClinic, fetchTodayClinicStats } from 'utils/apiUtils';
import Appointment from 'types/Appointment';

const ClinicHomeScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    scheduledAppointments: 0,
  });

  const getClinicStats = async () => {
    try {
      const res = await fetchTodayClinicStats(user!.userID);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching clinic stats:', error);
    }
  };

  const getTodaysAppointments = async () => {
    try {
      const res = await fetchAppointmentsByClinic(user!.userID, 'today');
      if (res.ok) {
        const data = await res.json();
        setTodaysAppointments(data);
      }
    } catch (error) {
      console.error("Error fetching today's appointments:", error);
    }
  };

  const getStatusConfig = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'scheduled':
        return { textColor: 'text-cyan-600', bgColor: 'bg-cyan-100', iconColor: '#0d9488' };
      case 'completed':
        return { textColor: 'text-green-600', bgColor: 'bg-green-100', iconColor: '#10b981' };
      case 'cancelled':
        return { textColor: 'text-red-600', bgColor: 'bg-red-100', iconColor: '#ef4444' };
      case 'pending':
        return { textColor: 'text-yellow-600', bgColor: 'bg-yellow-100', iconColor: '#fbbf24' };
      case 'in progress':
        return { textColor: 'text-blue-600', bgColor: 'bg-blue-100', iconColor: '#3b82f6' };
      default:
        return { textColor: 'text-gray-600', bgColor: 'bg-gray-100', iconColor: '#6b7280' };
    }
  };

  const handlePress = () => {
    Alert.alert('', 'Coming Soon!');
  };

  useFocusEffect(
    useCallback(() => {
      getClinicStats();
      getTodaysAppointments();
    }, [user])
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="-mt-20 rounded-b-3xl bg-cyan-600 px-5 pb-8 pt-20 shadow-md">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Pressable
              className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-cyan-500"
              onPress={() => navigation.navigate('Profile')}>
              <Text className="text-base font-semibold text-white">
                {getUserInitials(user!.fullname)}
              </Text>
            </Pressable>
            <View>
              <Text className="text-sm text-cyan-100">Welcome,</Text>
              <Text className="text-base font-bold text-white">
                {user?.fullname || 'Clinic Administrator'}
              </Text>
            </View>
          </View>
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-cyan-500"
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
            handlePress()
            // navigation.navigate('AppointmentSearch');
          }}>
          <FontAwesomeIcon icon={faMagnifyingGlass} size={16} color="#64748b" />
          <Text className="ml-2 flex-1 text-gray-400">Search for appointments or patients...</Text>
        </Pressable>
      </View>

      <ScrollView className="-mb-10 flex-1" showsVerticalScrollIndicator={false}>
        {/* Today's Statistics */}
        <View className="mx-5 mt-4">
          <Text className="mb-2 text-lg font-bold text-gray-800">Today's Overview</Text>
          <View className="flex-row justify-between">
            <View className="w-[48%] rounded-xl bg-white p-3 shadow">
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-blue-600">{stats.todayAppointments}</Text>
                <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <FontAwesomeIcon icon={faCalendarCheck} size={18} color="#2563eb" />
                </View>
              </View>
              <Text className="mt-1 text-sm text-gray-600">Today's Appointments</Text>
            </View>
            <View className="w-[48%] rounded-xl bg-white p-3 shadow">
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-green-600">
                  {stats.completedAppointments.toLocaleString()}
                </Text>
                <View className="h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <FontAwesomeIcon icon={faCheck} size={18} color="#16a34a" />
                </View>
              </View>
              <Text className="mt-1 text-sm text-gray-600">Completed</Text>
            </View>
          </View>
          <View className="mt-2 flex-row justify-between">
            <View className="w-[48%] rounded-xl bg-white p-3 shadow">
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-orange-600">
                  {stats.pendingAppointments}
                </Text>
                <View className="h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                  <FontAwesomeIcon icon={faUsers} size={18} color="#ea580c" />
                </View>
              </View>
              <Text className="mt-1 text-sm text-gray-600">Pending </Text>
            </View>
            <View className="w-[48%] rounded-xl bg-white p-3 shadow">
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-purple-600">
                  {stats.scheduledAppointments}
                </Text>
                <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <FontAwesomeIcon icon={faUserPlus} size={18} color="#9333ea" />
                </View>
              </View>
              <Text className="mt-1 text-sm text-gray-600">Scheduled </Text>
            </View>
          </View>
        </View>

        {/* Today's Appointments */}
        {todaysAppointments.length > 0 && (
          <View className="mx-5 mt-6">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-800">Today's Appointments</Text>
              {todaysAppointments.length > 3 && (
                <Pressable onPress={() => navigation.navigate('Appointments')}>
                  <Text className="font-medium text-cyan-600">See All</Text>
                </Pressable>
              )}
            </View>

            <View className="overflow-hidden rounded-xl bg-white shadow">
              {todaysAppointments.slice(0, 3).map((appointment) => (
                <Pressable
                  key={appointment.appointmentID}
                  className="border-b border-gray-100 last:border-b-0"
                  onPress={() =>
                    navigation.navigate('AppointmentDetail', {
                      appointmentID: appointment.appointmentID,
                    })
                  }>
                  <View className="flex-row p-4">
                    <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-cyan-100">
                      <FontAwesomeIcon icon={faCalendarCheck} size={20} color="#0d9488" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base font-bold text-gray-800">
                          {appointment.patient?.fullname || 'No Information'}
                        </Text>
                        <View
                          className={`rounded-full ${getStatusConfig(appointment.status).bgColor} px-3 py-1`}>
                          <Text
                            className={`text-xs font-medium ${getStatusConfig(appointment.status).textColor}`}>
                            {appointment.status}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-sm text-gray-600">
                        Dr. {appointment.doctor?.user?.fullname || 'Not Assigned'}
                      </Text>
                      <View className="mt-1 flex-row items-center">
                        <FontAwesomeIcon icon={faClock} size={12} color="#64748b" />
                        <Text className="ml-1 text-xs text-gray-500">
                          {appointment.appointmentType || 'Regular Check-up'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View className="mx-5 mt-6">
          <Text className="mb-3 text-lg font-bold text-gray-800">Quick Actions</Text>
          <View className="flex-row justify-between">
            <Pressable
              className="w-1/4 items-center"
              onPress={() => {
                handlePress()
                // navigation.navigate('AppointmentScheduler');
              }}>
              <View className="mb-2 h-16 w-16 items-center justify-center rounded-2xl bg-cyan-100">
                <FontAwesomeIcon icon={faCalendarDays} size={24} color="#0d9488" />
              </View>
              <Text className="text-center text-xs font-medium text-gray-700">New Appointment</Text>
            </Pressable>
            <Pressable
              className="w-1/4 items-center"
              onPress={() => {
                navigation.navigate('ManageDoctors');
              }}>
              <View className="mb-2 h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
                <FontAwesomeIcon icon={faUserDoctor} size={24} color="#2563eb" />
              </View>
              <Text className="text-center text-xs font-medium text-gray-700">Doctor</Text>
            </Pressable>
            <Pressable
              className="w-1/4 items-center"
              onPress={() => {
                navigation.navigate('MedicalRecord');
              }}>
              <View className="mb-2 h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
                <FontAwesomeIcon icon={faFileCircleCheck} size={24} color="#f59e0b" />
              </View>
              <Text className="text-center text-xs font-medium text-gray-700">Patient Records</Text>
            </Pressable>
            <Pressable
              className="w-1/4 items-center"
              onPress={() => {
                handlePress()
                // navigation.navigate('Analytics');
              }}>
              <View className="mb-2 h-16 w-16 items-center justify-center rounded-2xl bg-purple-100">
                <FontAwesomeIcon icon={faChartLine} size={24} color="#9333ea" />
              </View>
              <Text className="text-center text-xs font-medium text-gray-700">Analytics</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ClinicHomeScreen;
