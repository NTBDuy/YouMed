import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { AuthStackParamList } from '../../types/StackParamList';
import { register } from 'utils/apiUtils';
import AuthErrorState from 'types/ErrorState';

const RegisterScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [fullname, setFullname] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [replacePassword, setreplacePassword] = useState<string>('');
  const [errors, setErrors] = useState<AuthErrorState>({});

  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();

  const validateRegisterInput = (
    phoneNumber: string,
    email: string,
    fullname: string,
    password: string,
    replacePassword: string
  ): AuthErrorState => {
    const newErrors: AuthErrorState = {};
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPhone = /^\d{10}$/.test(phoneNumber);
    const isValidPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/.test(
      password
    );

    if (!phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!isValidPhone) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!fullname) {
      newErrors.fullname = 'Fullname is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword) {
      newErrors.password =
        'Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be at least 8 characters long';
    }
    if (!replacePassword) {
      newErrors.replacePassword = 'Confirm password is required';
    } else if (replacePassword !== password) {
      newErrors.replacePassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleRegister = async () => {
    const newErrors = validateRegisterInput(
      phoneNumber,
      email,
      fullname,
      password,
      replacePassword
    );
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      try {
        const registerData = {
          phoneNumber: phoneNumber,
          email: email,
          fullname: fullname,
          password: password,
          replacePassword: replacePassword,
        };

        const response = await register(registerData);

        if (response.ok) {
          Alert.alert('Register Successful', 'Please log in with the account you just created!', [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]);
        } else {
          const errorData = await response.json();
          Alert.alert('Register Failed', errorData.message || 'Invalid information');
        }
      } catch (error) {
        Alert.alert('Error', 'Something went wrong. Please try again later.');
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="absolute left-6 top-6 z-10">
            <Pressable 
             className="absolute left-0 flex-row items-center"
              onPress={() => {
                navigation.goBack();
              }}>
              <FontAwesomeIcon icon={faChevronLeft} size={16} color="#14b8a6" />
              <Text className="ml-1 font-medium text-teal-500">Back</Text>
            </Pressable>
          </View>
          <View className="flex-1 justify-center px-6 py-8">
            <View className="mb-8">
              <Text className="mb-2 text-center text-3xl font-bold">YouMed ID</Text>
              <Text className="text-center text-gray-500">
                Please enter your information to register
              </Text>
            </View>
            <View className="mb-6">
              <TextInput
                className="boder-gray-300 mb-1 rounded-lg border p-4"
                placeholder="0901234567"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
              {errors.phoneNumber && (
                <Text className="ml-1 text-sm text-red-500">{errors.phoneNumber}</Text>
              )}
            </View>
            <View className="mb-6">
              <TextInput
                className="boder-gray-300 mb-1 rounded-lg border p-4"
                placeholder="Input your email"
                value={email}
                onChangeText={setEmail}
              />
              {errors.email && <Text className="ml-1 text-sm text-red-500">{errors.email}</Text>}
            </View>
            <View className="mb-6">
              <TextInput
                className="boder-gray-300 mb-1 rounded-lg border p-4"
                placeholder="Input your fullname"
                value={fullname}
                onChangeText={setFullname}
              />
              {errors.email && <Text className="ml-1 text-sm text-red-500">{errors.fullname}</Text>}
            </View>
            <View className="mb-6">
              <TextInput
                className="boder-gray-300 mb-1 rounded-lg border p-4"
                placeholder="Input your password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              {errors.password && (
                <Text className="ml-1 text-sm text-red-500">{errors.password}</Text>
              )}
            </View>
            <View className="mb-6">
              <TextInput
                className="boder-gray-300 mb-1 rounded-lg border p-4"
                placeholder="Confirm your password"
                secureTextEntry
                value={replacePassword}
                onChangeText={setreplacePassword}
              />
              {errors.replacePassword && (
                <Text className="ml-1 text-sm text-red-500">{errors.replacePassword}</Text>
              )}
            </View>
            <Pressable
              className="mb-4 rounded-lg bg-teal-600 py-4"
              onPress={() => handleRegister()}>
              <Text className="text-center font-bold text-white">Register</Text>
            </Pressable>
            <Pressable className="py-2" onPress={() => navigation.goBack()}>
              <Text className="text-center text-gray-700">
                Already have an account? <Text className="font-bold text-teal-500">Login</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

;
