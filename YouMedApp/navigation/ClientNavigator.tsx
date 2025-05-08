import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from 'contexts/NotificationContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from 'screens/client/home/HomeScreen';
import ClinicScreen from 'screens/client/home/ClinicScreen';
import ClinicDetailScreen from 'screens/client/home/ClinicDetailScreen';
import BookingScreen from 'screens/client/home/BookingScreen';
import AppointmentScreen from 'screens/client/appointment/AppointmentScreen';
import AppointmentDetailScreen from 'screens/client/appointment/AppointmentDetailScreen';
import RescheduleScreen from 'screens/client/appointment/RescheduleScreen';
import NotificationScreen from 'screens/NotificationScreen';
import PatientDetailScreen from 'screens/client/profile/PatientDetailScreen';
import EditPatientScreen from 'screens/client/profile/EditPatientScreen';
import AddPatientScreen from 'screens/client/profile/AddPatientScreen';
import UpdateInsuranceScreen from 'screens/client/profile/UpdateInsuranceScreen';
import AddInsuranceScreen from 'screens/client/profile/AddInsuranceScreen';
import MedicalHistoryScreen from 'screens/client/profile/MedicalHistoryScreen';
import PatientScreen from 'screens/client/profile/PatientScreen';
import ProfileScreen from 'screens/client/profile/ProfileScreen';
import UpdateUserInformationScreen from 'screens/UpdateUserInformationScreen'
import MedicalHistoryPatient from 'screens/MedicalHistoryScreen';
import RecordDetailScreen from 'screens/RecordDetailScreen';
import ScheduleFollowUpScreen from 'screens/client/home/ScheduleFollowUpScreen';
import NearbyClinicScreen from 'screens/client/home/NearbyClinicScreen';

const MainStack = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const AppointmentStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const NotificationStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Homepage" component={HomeScreen} />
      <HomeStack.Screen name="ClinicPage" component={ClinicScreen} />
      <HomeStack.Screen name="ClinicDetails" component={ClinicDetailScreen} />
      <HomeStack.Screen name="BookingPage" component={BookingScreen} />
      <HomeStack.Screen name="ScheduleFollowUp" component={ScheduleFollowUpScreen} />
      <HomeStack.Screen name="AddPatient" component={AddPatientScreen} />
      <HomeStack.Screen name="Detail" component={AppointmentDetailScreen} />
      <HomeStack.Screen name="MedicalHistory" component={MedicalHistoryScreen} />
      <HomeStack.Screen name="PatientRecordList" component={MedicalHistoryPatient} />
      <HomeStack.Screen name="RecordDetail" component={RecordDetailScreen} />
      <HomeStack.Screen name="Reschedule" component={RescheduleScreen} />
      <HomeStack.Screen name="NearbyClinic" component={NearbyClinicScreen} />
    </HomeStack.Navigator>
  );
}

function AppointmentStackScreen() {
  return (
    <AppointmentStack.Navigator screenOptions={{ headerShown: false }}>
      <AppointmentStack.Screen name="AppointmentPage" component={AppointmentScreen} />
      <AppointmentStack.Screen name="Detail" component={AppointmentDetailScreen} />
      <AppointmentStack.Screen name="Reschedule" component={RescheduleScreen} />
      <AppointmentStack.Screen name="MedicalRecords" component={RecordDetailScreen} />
      <AppointmentStack.Screen name="ScheduleFollowUp" component={ScheduleFollowUpScreen} />
    </AppointmentStack.Navigator>
  );
}

function NotificationStackScreen() {
  return (
    <NotificationStack.Navigator screenOptions={{ headerShown: false }}>
      <NotificationStack.Screen name="NotificationPage" component={NotificationScreen} />
    </NotificationStack.Navigator>
  );
}

function ProfileStackScreen({ setIsLoggedIn }: { setIsLoggedIn: (value: boolean) => void }) {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile">
        {() => <ProfileScreen setIsLoggedIn={setIsLoggedIn} />}
      </ProfileStack.Screen>
      <ProfileStack.Screen name="PatientDetail" component={PatientDetailScreen} />
      <ProfileStack.Screen name="EditPatient" component={EditPatientScreen} />
      <ProfileStack.Screen name="AddPatient" component={AddPatientScreen} />
      <ProfileStack.Screen name="UpdateInsurance" component={UpdateInsuranceScreen} />
      <ProfileStack.Screen name="AddInsurance" component={AddInsuranceScreen} />
      <ProfileStack.Screen name="MedicalHistory" component={MedicalHistoryScreen} />
      <ProfileStack.Screen name="PatientRecordList" component={MedicalHistoryPatient} />
      <ProfileStack.Screen name="RecordDetail" component={RecordDetailScreen} />
      <ProfileStack.Screen name="ScheduleFollowUp" component={ScheduleFollowUpScreen} />
      <ProfileStack.Screen name="PatientScreen" component={PatientScreen} />
      <ProfileStack.Screen name="UpdateInformation" component={UpdateUserInformationScreen} />
    </ProfileStack.Navigator>
  );
}

export default function ClientNavigator({
  setIsLoggedIn,
}: {
  setIsLoggedIn: (value: boolean) => void;
}) {
  const { unreadCount } = useNotification();

  return (
    <MainStack.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const iconName =
            route.name === 'Home'
              ? focused
                ? 'home'
                : 'home-outline'
              : route.name === 'Appointment'
                ? focused
                  ? 'calendar'
                  : 'calendar-outline'
                : route.name === 'Notification'
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
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
        tabBarIconStyle: {
          marginBottom: 4,
          marginTop: 8,
        },
      })}>
      <MainStack.Screen name="Home" component={HomeStackScreen} />
      <MainStack.Screen name="Appointment" component={AppointmentStackScreen} />
      <MainStack.Screen
        name="Notification"
        component={NotificationStackScreen}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <MainStack.Screen name="Profile">
        {() => <ProfileStackScreen setIsLoggedIn={setIsLoggedIn} />}
      </MainStack.Screen>
    </MainStack.Navigator>
  );
}
