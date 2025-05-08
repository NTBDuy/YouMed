import { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser, faEnvelope, faPhone, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { ProfileStackParamList } from 'types/StackParamList';
import { AuthContext } from 'contexts/AuthContext';
import { updateUser } from 'utils/apiUtils';
import HeaderSection from 'components/HeaderSection';
import { getBackgroundColor, getIconColor } from 'utils/colorUtils';

const UpdateUserInformationScreen = () => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const { user, setUser } = useContext(AuthContext);

  const [fullname, setFullname] = useState(user?.fullname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ fullname: '', email: '' });

  useEffect(() => {
    if (user) {
      setFullname(user.fullname || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phoneNumber || '');
    }
  }, [user]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const newErrors = { fullname: '', email: '' };
    let isValid = true;

    if (!fullname.trim()) {
      newErrors.fullname = 'Name is required';
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      setIsLoading(true);
      const res = await updateUser({ userID: user!.userID, fullname, email });
      if (res.ok) {
        const newUser = { ...user!, fullname, email };
        setUser(newUser);
        Alert.alert('Success', 'Your information has been updated successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
      console.error('Update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <HeaderSection title="Update Information" backBtn />

      <ScrollView>
        <View className="p-4">
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800">
              Update your profile information
            </Text>
            <Text className="text-gray-600">
              You can change your name and email address. Phone number cannot be modified.
            </Text>
          </View>

          {/* Full Name */}
          <View className="mb-6">
            <View className="mb-2 flex-row items-center">
              <FontAwesomeIcon icon={faUser} size={16} color={getIconColor(user!.role)} />
              <Text className="ml-2 font-medium text-gray-700">Full Name</Text>
            </View>
            <TextInput
              value={fullname}
              onChangeText={setFullname}
              placeholder="Enter your full name"
              className="rounded-lg border border-gray-300 bg-white p-3"
            />
            {errors.fullname ? (
              <Text className="mt-1 text-xs text-red-500">{errors.fullname}</Text>
            ) : null}
          </View>

          {/* Email */}
          <View className="mb-6">
            <View className="mb-2 flex-row items-center">
              <FontAwesomeIcon icon={faEnvelope} size={16} color={getIconColor(user!.role)} />
              <Text className="ml-2 font-medium text-gray-700">Email Address</Text>
            </View>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              className="rounded-lg border border-gray-300 bg-white p-3"
            />
            {errors.email ? (
              <Text className="mt-1 text-xs text-red-500">{errors.email}</Text>
            ) : null}
          </View>

          {/* Phone (disabled) */}
          <View className="mb-8">
            <View className="mb-2 flex-row items-center">
              <FontAwesomeIcon icon={faPhone} size={16} color={getIconColor(user!.role)} />
              <Text className="ml-2 font-medium text-gray-700">Phone Number</Text>
              <Text className="ml-2 text-xs text-gray-500">(Cannot be changed)</Text>
            </View>
            <TextInput
              value={phoneNumber}
              editable={false}
              className="rounded-lg border border-gray-200 bg-gray-100 p-3 text-gray-500"
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className={`mb-6 flex-row items-center justify-center rounded-lg p-4 ${
              isLoading ? `bg-${getBackgroundColor(user!.role)}-400` : `bg-${getBackgroundColor(user!.role)}-600`
            }`}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <FontAwesomeIcon icon={faCheck} size={16} color="#FFFFFF" />
                <Text className="ml-2 font-bold text-white">Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UpdateUserInformationScreen;
