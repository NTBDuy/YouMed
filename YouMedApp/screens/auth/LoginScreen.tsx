import { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../../contexts/AuthContext';
import { AuthStackParamList } from '../../types/StackParamList';
import { login } from 'utils/apiUtils';
import { AuthErrorState } from 'types/ErrorState';

type LoginScreenProps = {
  setIsLoggedIn: (value: boolean) => void;
};

type QuickLoginRole = {
  title: string;
  phoneNumber: string;
  password: string;
};

const quickLoginRoles: QuickLoginRole[] = [
  { title: 'User', phoneNumber: '0901234567', password: 'P@ssword123' },
  { title: 'Doctor', phoneNumber: '0901111111', password: 'P@ssword123' },
  { title: 'Clinic', phoneNumber: '0906666666', password: 'P@ssword123' },
];

const LoginScreen = ({ setIsLoggedIn }: LoginScreenProps) => {
  const { setUser } = useContext(AuthContext);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<AuthErrorState>({});
  const [activeRole, setActiveRole] = useState<string>('');
  const [isLoading, setLoading] = useState(false);

  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();

  const validateLoginInput = (phoneNumber: string, password: string): AuthErrorState => {
    const newErrors: AuthErrorState = {};
    const isValidPhone = /^\d{10}$/.test(phoneNumber);
    const isValidPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/.test(
      password
    );

    if (!phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!isValidPhone) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword) {
      newErrors.password =
        'Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be at least 8 characters long';
    }
    return newErrors;
  };

  const handleLogin = async () => {
    const newErrors = validateLoginInput(phoneNumber, password);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);
        const response = await login(phoneNumber, password);

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsLoggedIn(true);
        } else {
          const errorData = await response.json();
          Alert.alert('Login Failed', errorData.message || 'Invalid phone number or password');
        }
      } catch (error) {
        Alert.alert('Error', 'Something went wrong. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleQuickLogin = (role: QuickLoginRole) => {
    setPhoneNumber(role.phoneNumber);
    setPassword(role.password);
    setActiveRole(role.title);
  };

  useFocusEffect(
    useCallback(() => {
      setPhoneNumber('');
      setPassword('');
      setActiveRole('');
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center px-6 py-8">
            <View className="mb-8">
              <Text className="mb-2 text-center text-3xl font-bold">YouMed ID</Text>
              <Text className="text-center text-gray-500">Enter your login information</Text>
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
            <View className="mb-4">
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
            <Pressable
              className="mb-6"
              onPress={() => {
                navigation.navigate('Forgot');
              }}>
              <Text className="text-right text-teal-500">Forgot Password?</Text>
            </Pressable>
            <TouchableOpacity
              onPress={() => handleLogin()}
              disabled={isLoading}
              className={`mb-4 rounded-lg py-4 ${isLoading ? `bg-teal-400` : `bg-teal-600`}`}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-center font-bold text-white">Login</Text>
              )}
            </TouchableOpacity>

            {/* <TouchableOpacity
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
                      </TouchableOpacity> */}

            <Pressable
              className="py-2"
              onPress={() => {
                navigation.navigate('Register');
              }}>
              <Text className="text-center text-gray-700">
                Don't have an account? <Text className="font-bold text-teal-500">Register</Text>
              </Text>
            </Pressable>

            <View className="mt-6 rounded-2xl border px-4 py-2">
              <Text className="mb-4">Developer Tool - Quick Login</Text>
              <View className="mb-2 flex-row justify-between">
                {quickLoginRoles.map((role, index) => (
                  <Pressable
                    key={index}
                    className={`mx-1 flex-1 rounded-lg px-4 py-3 ${
                      activeRole === role.title ? 'bg-teal-300' : 'bg-teal-100'
                    }`}
                    onPress={() => handleQuickLogin(role)}>
                    <Text className="text-center font-medium text-teal-800">{role.title}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
