import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNotification } from 'contexts/NotificationContext';

import DoctorHomeScreen from 'screens/doctor/home/DoctorHomeScreen';
import DoctorProfileScreen from 'screens/doctor/profile/DoctorProfileScreen';
import DoctorAppointmentScreen from 'screens/doctor/appointment/DoctorAppointmentScreen';
import AppointmentDetailScreen from 'screens/doctor/appointment/AppointmentDetailScreen';
import RescheduleAppointmentScreen from 'screens/doctor/RescheduleAppointmentScreen';
import NotificationScreen from 'screens/NotificationScreen';
import UpdateDoctorInformation from 'screens/doctor/profile/UpdateInformation';
import MedicalHistoryScreen from 'screens/MedicalHistoryScreen';
import RecordDetailScreen from 'screens/RecordDetailScreen';
import DoctorPatientScreen from 'screens/doctor/home/DoctorPatientScreen';
import DoctorMedicalRecordScreen from 'screens/doctor/home/DoctorMedicalRecordScreen';
import DoctorPatientDetailScreen from 'screens/doctor/home/DoctorPatientDetailScreen';

const DoctorTab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const AppointmentStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const NotificationStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="DoctorHome" component={DoctorHomeScreen} />
      <HomeStack.Screen name="Patients" component={DoctorPatientScreen} />
      <HomeStack.Screen name="PatientDetail" component={DoctorPatientDetailScreen} />
      <HomeStack.Screen name="Records" component={DoctorMedicalRecordScreen} />
      <HomeStack.Screen name="RecordDetail" component={RecordDetailScreen} />
      <HomeStack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
      <HomeStack.Screen name="PatientMedicalHistory" component={MedicalHistoryScreen} />
    </HomeStack.Navigator>
  );
}

function AppointmentStackScreen() {
  return (
    <AppointmentStack.Navigator screenOptions={{ headerShown: false }}>
      <AppointmentStack.Screen name="Appointments" component={DoctorAppointmentScreen} />
      <AppointmentStack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
      <AppointmentStack.Screen
        name="RescheduleAppointment"
        component={RescheduleAppointmentScreen}
      />
      <AppointmentStack.Screen name="PatientMedicalHistory" component={MedicalHistoryScreen} />
      <AppointmentStack.Screen name="RecordDetail" component={RecordDetailScreen} />
      </AppointmentStack.Navigator>
  );
}

function ProfileStackScreen({ setIsLoggedIn }: { setIsLoggedIn: (value: boolean) => void }) {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile">
        {() => <DoctorProfileScreen setIsLoggedIn={setIsLoggedIn} />}
      </ProfileStack.Screen>
      <ProfileStack.Screen name='UpdateInformation' component={UpdateDoctorInformation}/>
    </ProfileStack.Navigator>
  );
}

function NotificationStackScreen() {
  return (
    <NotificationStack.Navigator screenOptions={{ headerShown: false }}>
      <NotificationStack.Screen name="Notification" component={NotificationScreen} />
    </NotificationStack.Navigator>
  );
}

export default function DoctorNavigator({
  setIsLoggedIn,
}: {
  setIsLoggedIn: (value: boolean) => void;
}) {
  const { unreadCount } = useNotification();

  return (
    <DoctorTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const iconName =
            route.name === 'Home'
              ? focused
                ? 'home'
                : 'home-outline'
              : route.name === 'Appointments'
                ? focused
                  ? 'calendar'
                  : 'calendar-outline'
                : route.name === 'Notifications'
                  ? focused
                    ? 'notifications'
                    : 'notifications-outline'
                  : route.name === 'Profile'
                    ? focused
                      ? 'person'
                      : 'person-outline'
                    : 'help';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: 'gray',
        tabBarIconStyle: {
          marginBottom: 4,
          marginTop: 8,
        },
      })}>
      <DoctorTab.Screen name="Home" component={HomeStackScreen} />
      <DoctorTab.Screen name="Appointments" component={AppointmentStackScreen} />
      <DoctorTab.Screen
        name="Notifications"
        component={NotificationStackScreen}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <DoctorTab.Screen name="Profile">{() => <ProfileStackScreen setIsLoggedIn={setIsLoggedIn}/>}</DoctorTab.Screen>
    </DoctorTab.Navigator>
  );
}
