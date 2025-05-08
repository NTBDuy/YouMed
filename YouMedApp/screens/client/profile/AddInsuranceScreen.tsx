import { useContext, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp, useRoute } from '@react-navigation/native';

import { AuthContext } from 'contexts/AuthContext';
import { ProfileStackParamList } from '../../../types/StackParamList';
import { createInsurance } from 'utils/apiUtils';
import { formatDate } from 'utils/datetimeUtils';

import HeaderSection from 'components/HeaderSection';
import DateTimeField from 'components/DateTimeField';
import DateTimePickerModal from 'components/DateTimePickerModal';

const AddInsuranceScreen = () => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const { user } = useContext(AuthContext);
  const route = useRoute();
  const { patientID } = route.params as { patientID: number };

  const [healthInsuranceID, setHealthInsuranceID] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [initialMedicalFacility, setInitialMedicalFacility] = useState<string>('');

  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [activeDateField, setActiveDateField] = useState<'start' | 'end'>('start');
  const [isLoading, setIsLoading] = useState(false);

  const parseDate = (dateString: string | undefined): Date => {
    if (!dateString) return new Date();
    return new Date(dateString);
  };

  const openDatePicker = (fieldType: 'start' | 'end') => {
    setActiveDateField(fieldType);
    setIsDatePickerVisible(true);
  };

  const handleDateChange = (selectedDate: Date) => {
    const dateString = selectedDate.toISOString();
    if (activeDateField === 'start') {
      setStartDate(dateString);
    } else {
      setEndDate(dateString);
    }
  };

  const handleAdd = async () => {
    try {
      if (!user) {
        Alert.alert('Error', 'User is not authenticated');
        return;
      }

      if (!healthInsuranceID || !startDate || !endDate) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      setIsLoading(true);

      const data = {
        healthInsuranceID,
        patientID,
        startDate,
        endDate,
        initialMedicalFacility,
        updatedAt: new Date().toISOString(),
      };

      const response = await createInsurance(data);

      if (response.ok) {
        Alert.alert('Success', 'Insurance information added successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to add insurance information');
      }
    } catch (error: any) {
      console.error('Error adding insurance data:', error);
      Alert.alert('Error', error?.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <HeaderSection title="Health Insurance Information" backBtn />
      <ScrollView className="p-4">
        <View className="mb-3">
          <Text className="mb-2">Health Insurance ID</Text>
          <TextInput
            className="rounded-lg border border-gray-300 bg-white px-4 py-2"
            value={healthInsuranceID}
            onChangeText={setHealthInsuranceID}
          />
        </View>

        <DateTimeField
          label="Start Date"
          value={formatDate(startDate)}
          required={true}
          icon="calendar-outline"
          onPress={() => openDatePicker('start')}
        />

        <DateTimeField
          label="End Date"
          value={formatDate(endDate)}
          required={true}
          icon="calendar-outline"
          onPress={() => openDatePicker('end')}
        />

        <View className="mb-3">
          <Text className="mb-2">Initial Medical Facility</Text>
          <TextInput
            className="rounded-lg border border-gray-300 bg-white px-4 py-2"
            value={initialMedicalFacility}
            onChangeText={setInitialMedicalFacility}
          />
        </View>

        <Pressable
          className={`mt-2 flex-1 rounded-xl p-3 ${isLoading ? 'bg-blue-300' : 'bg-blue-600'}`}
          onPress={handleAdd}
          disabled={isLoading}>
          <Text className="text-center text-lg font-bold text-white">
            {isLoading ? 'Adding...' : 'Add'}
          </Text>
        </Pressable>
      </ScrollView>

      <DateTimePickerModal
        visible={isDatePickerVisible}
        value={parseDate(activeDateField === 'start' ? startDate : endDate)}
        mode="date"
        title={`Select ${activeDateField === 'start' ? 'Start' : 'End'} Date`}
        onClose={() => setIsDatePickerVisible(false)}
        onChange={handleDateChange}
        minimumDate={
          activeDateField === 'end' && startDate
            ? parseDate(startDate)
            : new Date(new Date().setFullYear(new Date().getFullYear() - 5))
        }
        maximumDate={
          activeDateField === 'start' && endDate
            ? parseDate(endDate)
            : new Date(new Date().setFullYear(new Date().getFullYear() + 5))
        }
      />
    </SafeAreaView>
  );
};

export default AddInsuranceScreen;
