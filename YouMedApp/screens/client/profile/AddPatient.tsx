import { useContext, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from 'contexts/AuthContext';
import { ProfileStackParamList } from '../../../types/StackParamList';
import { createPatient } from 'utils/apiUtils';
import HeaderSection from 'components/HeaderSection';
import { formatDate } from 'utils/datetimeUtils';
import DateTimeField from 'components/DateTimeField';
import DateTimePickerModal from 'components/DateTimePickerModal';

type RelationshipType =
  | 'Self'
  | 'Father'
  | 'Mother'
  | 'Child'
  | 'Wife'
  | 'Husband'
  | 'Other'
  | null;

const AddPatient = () => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const { user } = useContext(AuthContext);

  const [fullname, setFullname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [date, setDate] = useState(new Date());
  const [homeAddress, setHomeAddress] = useState('');
  const [citizenID, setCitizenID] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [relationship, setRelationship] = useState<RelationshipType>('Self');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    try {
      if (!user) return;

      if (!fullname || !phoneNumber) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      setIsLoading(true);

      const data = {
        fullname,
        phoneNumber,
        emailAddress,
        dateOfBirth: date.toISOString(),
        gender: gender === 'male' ? 'M' : 'F',
        homeAddress,
        citizenID,
        userID: user.userID,
        relationship: relationship || 'Self',
      };

      const response = await createPatient(data);

      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully');
        navigation.goBack();
      } else {
        const errorData = await response.json();
        Alert.alert('Fail', errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const relationshipOptions: RelationshipType[] = [
    'Self',
    'Father',
    'Mother',
    'Child',
    'Wife',
    'Husband',
    'Other',
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <HeaderSection title="Create new patient" backBtn />

      <ScrollView className="-mb-10 p-4">
        <View className="mb-3">
          <Text className="mb-2">
            Fullname <Text className="text-red-600">*</Text>
          </Text>
          <TextInput
            className="rounded-lg border border-gray-300 bg-white px-4 py-2"
            value={fullname}
            onChangeText={setFullname}
          />
        </View>

        <View className="mb-3">
          <Text className="mb-2">
            Phone number <Text className="text-red-600">*</Text>
          </Text>
          <TextInput
            className="rounded-lg border border-gray-300 bg-white px-4 py-2"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
        </View>

        <View className="mb-3">
          <Text className="mb-2">
            Email Address
          </Text>
          <TextInput
            className="rounded-lg border border-gray-300 bg-white px-4 py-2"
            value={emailAddress}
            onChangeText={setEmailAddress}
            keyboardType='email-address'
          />
        </View>

        {/* Date Selection */}
        <DateTimeField
          label="Date of Birth"
          value={formatDate(date)}
          required={true}
          icon="calendar-outline"
          onPress={() => setShowDatePicker(true)}
        />

        {/* Gender Section */}
        <View className="mb-3">
          <Text className="mb-3 font-medium text-gray-700">
            Gender <Text className="text-red-500">*</Text>
          </Text>
          <View className="flex-row">
            <Pressable
              className={`mr-2 flex-1 flex-row items-center rounded-xl border p-4 ${gender === 'male' ? 'border-blue-500 bg-blue-100' : 'border-gray-300'}`}
              onPress={() => setGender('male')}>
              <View
                className={`mr-3 h-5 w-5 rounded-full border ${gender === 'male' ? 'border-blue-500 bg-blue-600' : 'border-gray-400'}`}>
                {gender === 'male' && <View className="m-auto h-2 w-2 rounded-full bg-white" />}
              </View>
              <Text
                className={`font-medium ${gender === 'male' ? 'text-blue-700' : 'text-gray-700'}`}>
                Male
              </Text>
            </Pressable>

            <Pressable
              className={`ml-2 flex-1 flex-row items-center rounded-xl border p-4 ${gender === 'female' ? 'border-pink-500 bg-pink-50' : 'border-gray-300'}`}
              onPress={() => setGender('female')}>
              <View
                className={`mr-3 h-5 w-5 rounded-full border ${gender === 'female' ? 'border-pink-500 bg-pink-500' : 'border-gray-400'}`}>
                {gender === 'female' && <View className="m-auto h-2 w-2 rounded-full bg-white" />}
              </View>
              <Text
                className={`font-medium ${gender === 'female' ? 'text-pink-700' : 'text-gray-700'}`}>
                Female
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mb-3">
          <Text className="mb-2">Home Address</Text>
          <TextInput
            className="rounded-lg border border-gray-300 bg-white px-4 py-2"
            value={homeAddress}
            onChangeText={setHomeAddress}
          />
        </View>
        <View className="mb-3">
          <Text className="mb-2">Citizen ID</Text>
          <TextInput
            className="rounded-lg border border-gray-300 bg-white px-4 py-2"
            value={citizenID}
            onChangeText={setCitizenID}
          />
        </View>

        {/* Relationship Section */}
        <View className="mb-3">
          <Text className="mb-1 font-medium text-gray-700">Relationship</Text>
          <Text className="mb-3 text-sm text-gray-500">If not selected, default is Self</Text>
          <View className="flex-row flex-wrap justify-between">
            {relationshipOptions.map((rel) => (
              <Pressable
                key={rel}
                className={`mb-2 w-[32%] rounded-xl border p-3 ${
                  relationship === rel ? 'border-blue-500 bg-blue-100' : 'border-gray-300'
                }`}
                onPress={() => setRelationship(relationship === rel ? null : rel)}>
                <Text
                  className={`text-center font-medium ${
                    relationship === rel ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                  {rel}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          className={`mt-2 flex-1 rounded-xl p-3 ${isLoading ? 'bg-blue-300' : 'bg-blue-600'}`}
          onPress={handleAdd}
          disabled={isLoading}>
          <Text className="text-center text-lg font-bold text-white">
            {isLoading ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        visible={showDatePicker}
        value={date}
        mode="date"
        title="Select Date"
        maximumDate={new Date()}
        onClose={() => setShowDatePicker(false)}
        onChange={(newDate) => setDate(newDate)}
      />
    </SafeAreaView>
  );
};

export default AddPatient;
