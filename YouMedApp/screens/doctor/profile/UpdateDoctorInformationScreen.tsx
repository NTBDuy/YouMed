import React, { useContext, useEffect, useState } from 'react';
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
import {
  faUserDoctor,
  faEnvelope,
  faBookMedical,
  faBriefcase,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { ProfileStackParamList } from 'types/StackParamList';
import { AuthContext } from 'contexts/AuthContext';
import { fetchDoctorByUserID, updateDoctor } from 'utils/apiUtils';
import HeaderSection from 'components/HeaderSection';

const UpdateDoctorInformationScreen = () => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const { user, setUser } = useContext(AuthContext);

  const [doctorID, setDoctorID] = useState(0);
  const [fullname, setFullname] = useState(user?.fullname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [introduction, setIntroduction] = useState('');
  const [experience, setExperience] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    fullname: '',
    email: '',
    introduction: '',
    experience: '',
  });

  const getData = async () => {
    try {
      const res = await fetchDoctorByUserID(user!.userID);
      if (res.ok) {
        const data = await res.json();
        console.log('DOCTOR INFORMATION ', data);
        setIntroduction(data.introduction);
        setExperience(data.experience);
        setDoctorID(data.doctorID);
      } else {
        console.log('Failed to fetch doctor information!');
      }
    } catch (error) {
      console.log('Error fetching doctor information', error);
    }
  };

  useEffect(() => {
    if (user) {
      getData();
      setFullname(user.fullname || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const newErrors = {
      fullname: '',
      email: '',
      introduction: '',
      experience: '',
    };
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

    if (!introduction.trim()) {
      newErrors.introduction = 'Introduction is required';
      isValid = false;
    }

    if (!experience) {
      newErrors.experience = 'Experience is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      setIsLoading(true);
      const res = await updateDoctor({
        fullname,
        phoneNumber : user?.phoneNumber,
        email,
        introduction,
        experience,
      }, doctorID);

      if (res.ok) {
        const newUser = {
          ...user!,
          fullname,
          email,
        };
        setUser(newUser);
        Alert.alert('Success', 'Your information has been updated successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to update doctor profile');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update doctor profile');
      console.error('Update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <HeaderSection title="Update Doctor Information" backBtn />

      <ScrollView>
        <View className="p-4">
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800">
              Update your doctor profile information
            </Text>
            <Text className="text-gray-600">
              You can change your name, email address, introduction and years of experience.
            </Text>
          </View>

          {/* Full Name */}
          <View className="mb-6">
            <View className="mb-2 flex-row items-center">
              <FontAwesomeIcon icon={faUserDoctor} size={16} color="#0F766E" />
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
              <FontAwesomeIcon icon={faEnvelope} size={16} color="#0F766E" />
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

          {/* Introduction */}
          <View className="mb-6">
            <View className="mb-2 flex-row items-center">
              <FontAwesomeIcon icon={faBookMedical} size={16} color="#0F766E" />
              <Text className="ml-2 font-medium text-gray-700">Introduction</Text>
            </View>
            <TextInput
              value={introduction}
              onChangeText={setIntroduction}
              placeholder="Brief introduction about yourself"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="rounded-lg border border-gray-300 bg-white p-3"
            />
            {errors.introduction ? (
              <Text className="mt-1 text-xs text-red-500">{errors.introduction}</Text>
            ) : null}
          </View>

          {/* Experience */}
          <View className="mb-8">
            <View className="mb-2 flex-row items-center">
              <FontAwesomeIcon icon={faBriefcase} size={16} color="#0F766E" />
              <Text className="ml-2 font-medium text-gray-700">Experience (in years)</Text>
            </View>
            <TextInput
              value={experience.toString()}
              onChangeText={(text) => setExperience(Number(text))}
              placeholder="e.g. 3"
              keyboardType="numeric"
              className="rounded-lg border border-gray-300 bg-white p-3"
            />
            {errors.experience ? (
              <Text className="mt-1 text-xs text-red-500">{errors.experience}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className={`mb-6 flex-row items-center justify-center rounded-lg p-4 ${
              isLoading ? 'bg-emerald-400' : 'bg-emerald-600'
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

export default UpdateDoctorInformationScreen;