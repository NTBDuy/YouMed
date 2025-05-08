import { Pressable, Text, View } from 'react-native';
import { useContext } from 'react';
import { AuthContext } from 'contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { getUserInitials } from 'utils/userHelpers';
import { getBackgroundColor } from 'utils/colorUtils';

const ProfileCard = () => {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation<any>();

  return (
    <View className="mx-4 -mt-10 mb-2 rounded-full bg-white p-4 shadow">
      <View className="flex-row items-center">
        <View className={`mr-4 h-16 w-16 items-center justify-center rounded-full bg-${getBackgroundColor(user!.role)}-500`}>
          <Text className="text-xl font-bold text-white">
            {getUserInitials(user?.fullname, user?.email)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800">
            {user?.role == 2 ? 'Dr. ' : ''}
            {user?.fullname && user.fullname.trim() !== '' ? user.fullname : user?.email}
          </Text>
          <Text className="text-gray-500">
            {user?.phoneNumber || (user?.email && `${user.email.substring(0, 5)}...`)}
          </Text>
        </View>
        <Pressable
          className={`rounded-full bg-${getBackgroundColor(user!.role)}-100 px-3 py-1`}
          onPress={() => {
            navigation.navigate('UpdateInformation');
          }}>
          <Text className={`text-sm font-medium text-${getBackgroundColor(user!.role)}-700`}>Edit</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ProfileCard;
