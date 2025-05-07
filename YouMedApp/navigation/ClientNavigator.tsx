import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from 'contexts/NotificationContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from 'screens/client/home/HomeScreen';
import ClinicScreen from 'screens/client/home/ClinicScreen';
import ClinicDetail from 'screens/client/home/ClinicDetail';
import BookingScreen from 'screens/client/home/BookingScreen';
import AppointmentScreen from 'screens/client/appointment/AppointmentScreen';
import AppointmentDetailScreen from 'screens/client/appointment/AppointmentDetail';
import RescheduleScreen from 'screens/client/appointment/RescheduleScreen';
import NotificationScreen from 'screens/NotificationScreen';
import PatientDetail from 'screens/client/profile/PatientDetail';
import EditPatient from 'screens/client/profile/EditPatient';
import AddPatient from 'screens/client/profile/AddPatient';
import UpdateInsurance from 'screens/client/profile/UpdateInsurance';
import AddHealthInsurance from 'screens/client/profile/AddInsurance';
import MedicalHistoryScreen from 'screens/client/profile/MedicalHistoryScreen';
import PatientScreen from 'screens/client/profile/PatientScreen';
import ProfileScreen from 'screens/client/profile/ProfileScreen';
import UpdateInformation from 'screens/client/profile/UpdateInformation';
import MedicalHistoryPatient from 'screens/MedicalHistoryScreen';
import RecordDetailScreen from 'screens/RecordDetailScreen';
import ScheduleFollowUp from 'screens/client/home/ScheduleFollowUp';
import NearbyClinic from 'screens/client/home/NearbyClinic';

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
      <HomeStack.Screen name="ClinicDetails" component={ClinicDetail} />
      <HomeStack.Screen name="BookingPage" component={BookingScreen} />
      <HomeStack.Screen name="ScheduleFollowUp" component={ScheduleFollowUp} />
      <ProfileStack.Screen name="AddPatient" component={AddPatient} />
      <AppointmentStack.Screen name="Detail" component={AppointmentDetailScreen} />
      <ProfileStack.Screen name="MedicalHistory" component={MedicalHistoryScreen} />
      <ProfileStack.Screen name="PatientRecordList" component={MedicalHistoryPatient} />
      <ProfileStack.Screen name="RecordDetail" component={RecordDetailScreen} />
      <AppointmentStack.Screen name="Reschedule" component={RescheduleScreen} />
      <HomeStack.Screen name="NearbyClinic" component={NearbyClinic} />
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
      <AppointmentStack.Screen name="ScheduleFollowUp" component={ScheduleFollowUp} />
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
      <ProfileStack.Screen name="PatientDetail" component={PatientDetail} />
      <ProfileStack.Screen name="EditPatient" component={EditPatient} />
      <ProfileStack.Screen name="AddPatient" component={AddPatient} />
      <ProfileStack.Screen name="UpdateInsurance" component={UpdateInsurance} />
      <ProfileStack.Screen name="AddInsurance" component={AddHealthInsurance} />
      <ProfileStack.Screen name="MedicalHistory" component={MedicalHistoryScreen} />
      <ProfileStack.Screen name="PatientRecordList" component={MedicalHistoryPatient} />
      <ProfileStack.Screen name="RecordDetail" component={RecordDetailScreen} />
      <ProfileStack.Screen name="ScheduleFollowUp" component={ScheduleFollowUp} />
      <ProfileStack.Screen name="PatientScreen" component={PatientScreen} />
      <ProfileStack.Screen name="UpdateInformation" component={UpdateInformation} />
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
