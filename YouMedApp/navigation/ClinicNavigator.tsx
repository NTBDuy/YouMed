import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNotification } from 'contexts/NotificationContext';

import ClinicHomeScreen from 'screens/clinic/home/ClinicHomeScreen';
import ClinicAppointmentScreen from 'screens/clinic/appointment/ClinicAppointmentScreen';
import AppointmentDetailScreen from 'screens/clinic/appointment/AppointmentDetailScreen';
import ManageDoctorsScreen from 'screens/clinic/doctor/ManageDoctorsScreen';
import DoctorDetailScreen from 'screens/clinic/doctor/DoctorDetailScreen';
import AddDoctorScreen from 'screens/clinic/doctor/AddDoctorScreen';
import EditDoctorScreen from 'screens/clinic/doctor/EditDoctorScreen';
import NotificationScreen from 'screens/NotificationScreen';
import ClinicProfileScreen from 'screens/clinic/profile/ClinicProfileScreen';
import UpdateUserInformationScreen from 'screens/UpdateUserInformationScreen'
import MedicalHistoryScreen from 'screens/MedicalHistoryScreen';
import RecordDetailScreen from 'screens/RecordDetailScreen';
import PatientListScreen from 'screens/clinic/patient/PatientListScreen';
import PatientDetailScreen from 'screens/PatientDetailScreen';
import MedicalRecordScreen from 'screens/clinic/home/MedicalRecordScreen';
import ClinicInformationScreen from 'screens/clinic/profile/ClinicInformationScreen';
import WorkingHoursScreen from 'screens/clinic/profile/WorkingHoursScreen';

const ClinicTab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const AppointmentStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const NotificationStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="ClinicHome" component={ClinicHomeScreen} />
      <HomeStack.Screen name='ManageDoctors' component={ManageDoctorsScreen} />
      <HomeStack.Screen name="DoctorDetail" component={DoctorDetailScreen} />
      <HomeStack.Screen name="EditDoctor" component={EditDoctorScreen} />
      <HomeStack.Screen name="AddDoctor" component={AddDoctorScreen} />
      <HomeStack.Screen name="MedicalRecord" component={MedicalRecordScreen} />
      <HomeStack.Screen name="RecordDetail" component={RecordDetailScreen} />
      <HomeStack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
    </HomeStack.Navigator>
  );
}

function AppointmentStackScreen() {
  return (
    <AppointmentStack.Navigator screenOptions={{ headerShown: false }}>
      <AppointmentStack.Screen name="ClinicAppointments" component={ClinicAppointmentScreen} />
      <AppointmentStack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
      <AppointmentStack.Screen name="PatientDetail" component={PatientDetailScreen} />
      <AppointmentStack.Screen name="MedicalHistory" component={MedicalHistoryScreen} />
      <AppointmentStack.Screen name="RecordDetail" component={RecordDetailScreen} />
    </AppointmentStack.Navigator>
  );
}

function ProfileStackScreen({ setIsLoggedIn }: { setIsLoggedIn: (value: boolean) => void }) {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile">
        {() => <ClinicProfileScreen setIsLoggedIn={setIsLoggedIn} />}
      </ProfileStack.Screen>
      <ProfileStack.Screen name="UpdateInformation" component={UpdateUserInformationScreen} />
      <ProfileStack.Screen name="ManageDoctors" component={ManageDoctorsScreen} />
      <ProfileStack.Screen name="DoctorDetail" component={DoctorDetailScreen} />
      <ProfileStack.Screen name="EditDoctor" component={EditDoctorScreen} />
      <ProfileStack.Screen name="AddDoctor" component={AddDoctorScreen} />
      <ProfileStack.Screen name="ManagePatients" component={PatientListScreen} />
      <ProfileStack.Screen name="PatientDetails" component={PatientDetailScreen} />
      <ProfileStack.Screen name="PatientMedicalHistory" component={MedicalHistoryScreen} />
      <ProfileStack.Screen name="RecordDetail" component={RecordDetailScreen} />
      <ProfileStack.Screen name='ClinicInformation' component={ClinicInformationScreen}/>
      <ProfileStack.Screen name='WorkingHours' component={WorkingHoursScreen}/>
    </ProfileStack.Navigator>
  );
}

function NotificationStackScreen() {
  return (
    <NotificationStack.Navigator screenOptions={{ headerShown: false }}>
      <NotificationStack.Screen name="NotificationPage" component={NotificationScreen} />
    </NotificationStack.Navigator>
  );
}

export default function ClinicNavigator({
  setIsLoggedIn,
}: {
  setIsLoggedIn: (value: boolean) => void;
}) {
  const { unreadCount } = useNotification();

  return (
    <ClinicTab.Navigator
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
                      ? 'business'
                      : 'business-outline'
                    : 'help';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0891b2',
        tabBarInactiveTintColor: 'gray',
        tabBarIconStyle: {
          marginBottom: 4,
          marginTop: 8,
        },
      })}>
      <ClinicTab.Screen name="Home" component={HomeStackScreen} />
      <ClinicTab.Screen name="Appointments" component={AppointmentStackScreen} />
      <ClinicTab.Screen
        name="Notifications"
        component={NotificationStackScreen}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <ClinicTab.Screen name="Profile">
        {() => <ProfileStackScreen setIsLoggedIn={setIsLoggedIn} />}
      </ClinicTab.Screen>
    </ClinicTab.Navigator>
  );
}
