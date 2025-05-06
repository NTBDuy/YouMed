import { ScrollView, Text, View, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  faHeart,
  faFileContract,
  faSignOut,
  faFolder,
  faClockRotateLeft,
  faCreditCard,
  faBell,
  faShieldHalved,
  faUserCircle,
} from '@fortawesome/free-solid-svg-icons';

import MenuItem from 'components/profile/MenuItem';
import Section from 'components/profile/Section';
import ProfileCard from 'components/profile/ProfileCard';
import { AuthContext } from 'contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

const ProfileScreen = ({ setIsLoggedIn }: { setIsLoggedIn: (value: boolean) => void }) => {
  const navigation = useNavigation<any>();
  const { setUser } = useContext(AuthContext);

  const handlePress = () => {
    Alert.alert('', 'Coming Soon!');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <View className="-mt-20 rounded-b-3xl bg-blue-600 px-4 pb-4 pt-28 shadow-md" />
      
      <ProfileCard />

      <ScrollView className="-mb-10 flex-1" showsVerticalScrollIndicator={false}>
        {/* Patient management */}
        <Section className="mx-4 mt-4">
          <Text className="mb-1 mt-4 text-base font-bold text-gray-800">Patient Management</Text>
          <MenuItem
            icon={faFolder}
            title="Patient Profile List"
            color="#3b82f6"
            onPress={() => {
              {
                navigation.navigate('PatientScreen');
              }
            }}
          />
          <MenuItem
            icon={faClockRotateLeft}
            title="Medical History"
            color="#8b5cf6"
            onPress={() => {
              navigation.navigate('MedicalHistory');
            }}
          />
          <MenuItem
            icon={faHeart}
            title="Favorites List"
            color="#ef4444"
            onPress={handlePress}
            showDivider={false}
          />
        </Section>

        {/* Account Settings */}
        <Section className="mx-4">
          <Text className="mb-1 mt-4 text-base font-bold text-gray-800">Account Settings</Text>
          <MenuItem
            icon={faUserCircle}
            title="Update User Information"
            onPress={() => {
              navigation.navigate('UpdateInformation');
            }}
          />
          <MenuItem icon={faBell} title="Notifications" onPress={handlePress} />
          <MenuItem
            icon={faCreditCard}
            title="Payment Methods"
            onPress={handlePress}
            showDivider={false}
          />
        </Section>

        {/* More */}
        <Section className="mx-4">
          <Text className="mb-1 mt-4 text-base font-bold text-gray-800">More</Text>
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

        {/* Sign Out */}
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

export default ProfileScreen;
