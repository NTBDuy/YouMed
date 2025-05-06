import {
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

const ForgotScreen = () => {
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
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
              <Text className="mb-2 text-center font-bold text-zinc-700">
                Forgot your password?
              </Text>
              <Text className="text-center text-gray-500">
                To confirm, enter your phone number and email.
              </Text>
            </View>
            <View className="mb-6">
              <TextInput
                className="boder-gray-300 mb-1 rounded-lg border p-4"
                placeholder="0901234567"
                keyboardType="phone-pad"
                // value={phoneNumber}
                // onChangeText={setPhoneNumber}
              />
              {/* {errors.phoneNumber && (
            <Text className="ml-1 text-sm text-red-500">{errors.phoneNumber}</Text>
          )} */}
            </View>
            <View className="mb-6">
              <TextInput
                className="boder-gray-300 mb-1 rounded-lg border p-4"
                placeholder="Input your email"
                // value={email}
                // onChangeText={setEmail}
              />
              {/* {errors.email && <Text className="ml-1 text-sm text-red-500">{errors.email}</Text>} */}
            </View>
            <Pressable className="mb-4 rounded-lg bg-teal-600 py-4">
              <Text className="text-center font-bold text-white">Continue</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotScreen;

;
