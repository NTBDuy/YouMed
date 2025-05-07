import { ScrollView, Text, View, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  faFileContract,
  faSignOut,
  faUserMd,
  faCreditCard,
  faBell,
  faShieldHalved,
  faBuildingUser,
  faGear,
  faChartLine,
  faCalendarDays,
  faUsers,
  faLocationDot,
  faClock,
  faImage
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { AuthContext } from 'contexts/AuthContext';
import Section from 'components/profile/Section';
import MenuItem from 'components/profile/MenuItem';
import ProfileCard from 'components/profile/ProfileCard';

const ClinicProfileScreen = ({ setIsLoggedIn }: { setIsLoggedIn: (value: boolean) => void }) => {
  const navigation = useNavigation<any>();
  const { setUser, user } = useContext(AuthContext);

  const handlePress = () => {
    Alert.alert('', 'Coming Soon!');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <View className="-mt-20 rounded-b-3xl bg-cyan-600 px-4 pb-4 pt-28 shadow-md" />

      <ProfileCard />

      <ScrollView className="-mb-10 flex-1" showsVerticalScrollIndicator={false}>
        <Section className="mx-4 mt-4">
          <Text className="mb-1 mt-4 text-base font-bold text-gray-800">Clinic Management</Text>
          <MenuItem
            icon={faUserMd}
            title="Manage Doctors"
            color="#3b82f6"
            onPress={() => {
              navigation.navigate('ManageDoctors');
            }}
          />
          <MenuItem
            icon={faUsers}
            title="Manage Patients"
            color="#8b5cf6"
            onPress={() => {
              navigation.navigate('ManagePatients');
            }}
          />
          <MenuItem
            icon={faCalendarDays}
            title="Appointment Schedule"
            color="#14b8a6"
            onPress={() => {
              // navigation.navigate('ClinicCalendar');
              handlePress();
            }}
          />
          <MenuItem
            icon={faChartLine}
            title="Analytics & Reports"
            color="#f59e0b"
            onPress={() => {
              // navigation.navigate('Analytics');
              handlePress();
            }}
            showDivider={false}
          />
        </Section>

        <Section className="mx-4">
          <Text className="mb-1 mt-4 text-base font-bold text-gray-800">Clinic Settings</Text>
          <MenuItem
            icon={faBuildingUser}
            title="Clinic Information"
            color="#10b981"
            onPress={() => {
              navigation.navigate('ClinicInformation');
            }}
          />
          <MenuItem
            icon={faClock}
            title="Working Hours"
            color="#ef4444"
            onPress={() => {
              navigation.navigate('WorkingHours');
            }}
          />
          <MenuItem
            icon={faImage}
            title="Media & Branding"
            color="#6366f1"
            onPress={handlePress}
          />
          <MenuItem
            icon={faCreditCard}
            title="Payment Settings"
            color="#64748b"
            onPress={handlePress}
            showDivider={false}
          />
        </Section>

        <Section className="mx-4">
          <Text className="mb-1 mt-4 text-base font-bold text-gray-800">Notifications</Text>
          <MenuItem
            icon={faBell}
            title="Notification Settings"
            color="#64748b"
            onPress={handlePress}
            showDivider={false}
          />
        </Section>

        <Section className="mx-4">
          <Text className="mb-1 mt-4 text-base font-bold text-gray-800">More</Text>
          <MenuItem
            icon={faGear}
            title="App Settings"
            color="#64748b"
            onPress={handlePress}
          />
          <MenuItem
            icon={faFileContract}
            title="Terms and Conditions"
            color="#6366f1"
            onPress={handlePress}
          />
          <MenuItem
            icon={faShieldHalved}
            title="Privacy Policy"
            color="#14b8a6"
            onPress={handlePress}
            showDivider={false}
          />
        </Section>

        <Section className="mx-4 mb-6">
          <Pressable
            className="flex-row items-center justify-center py-4"
            onPress={() =>
              Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Sign Out',
                  style: 'destructive',
                  onPress: () => {
                    setUser(null);
                    setIsLoggedIn(false);
                  },
                },
              ])
            }>
            <View className="h-9 w-9 items-center justify-center rounded-full bg-red-100">
              <FontAwesomeIcon icon={faSignOut} size={18} color="#ef4444" />
            </View>
            <Text className="ml-3 font-medium text-red-500">Sign Out</Text>
          </Pressable>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ClinicProfileScreen;