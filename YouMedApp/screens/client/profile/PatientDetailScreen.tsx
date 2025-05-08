import { useCallback, useContext, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, NavigationProp, useRoute } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

import {
  faAddressCard,
  faNotesMedical,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from 'contexts/AuthContext';
import { ProfileStackParamList } from '../../../types/StackParamList';
import { deletePatient, fetchInsuranceDetail, fetchPatientDetail } from 'utils/apiUtils';
import { formatDate, formatDatetime } from 'utils/datetimeUtils';
import HeaderSection from 'components/HeaderSection';
import Patient from 'types/Patient';
import Insurance from 'types/Insuarance';

const PatientDetailScreen = () => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const { user } = useContext(AuthContext);
  const [patient, setPatient] = useState<Patient>();
  const [insurance, setInsurance] = useState<Insurance>();

  const route = useRoute();
  const { patientID } = route.params as { patientID: number };

  const getPatientInformation = async () => {
    try {
      const response = await fetchPatientDetail(patientID);

      if (response && response.ok) {
        const data = await response.json();
        setPatient(data);
        getPatientInsurance(data.patientID);
      }
    } catch (error) {
      console.error('Error fetching patient detail:', error);
    }
  };

  const getPatientInsurance = async (id: number) => {
    try {
      if (!id) {
        console.log('No valid patient ID provided for insurance fetch');
        return;
      }

      const response = await fetchInsuranceDetail(id);

      if (response && response.ok) {
        const data = await response.json();
        setInsurance(data);
      } else {
      }
    } catch (error) {
      console.error('Error fetching insurance:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getPatientInformation();
    }, [user, patientID])
  );

  const handleDelete = async () => {
    try {
      const res = await deletePatient(patientID);
      if (res.ok) {
        Alert.alert('Success', 'Patient deleted successfully');
        navigation.goBack();
      } else {
        const errorData = await res.json();
        console.error('Error data: ', errorData.message);
        Alert.alert('Fail', errorData.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error to deleting data: ', error);
    } finally {
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <HeaderSection
        customTitle={
          <View>
            {patient?.relationship === 'Self' ? (
              <Text className="text-xl font-bold text-white">Your patient profile</Text>
            ) : (
              <Text className="text-xl font-bold text-white">Your relative's profile</Text>
            )}
          </View>
        }
        backBtn={true}
        rightElement={
          <Pressable
            onPress={() =>
              Alert.alert('Warning', 'Are you sure you want to remove this patient?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Remove',
                  style: 'destructive',
                  onPress: () => {
                    handleDelete();
                  },
                },
              ])
            }>
            <FontAwesomeIcon icon={faTrashCan} size={18} color="#fff" />
          </Pressable>
        }
      />

      <ScrollView className="flex-1">
        <View className="space-y-6 p-4">
          {patient ? (
            <View className="mb-4 rounded-xl bg-white p-5 shadow-sm">
              <View className="mb-5 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="rounded-full bg-blue-100 p-2">
                    <FontAwesomeIcon icon={faAddressCard} size={20} color="#2563eb" />
                  </View>
                  <Text className="ms-3 text-lg font-bold text-blue-600">Patient Information</Text>
                </View>
                <Pressable
                  className="rounded-full bg-blue-600 px-5 py-2"
                  onPress={() => {
                    navigation.navigate('EditPatient', { patientID: patient.patientID });
                  }}>
                  <Text className="font-medium text-white">Edit</Text>
                </Pressable>
              </View>

              <View className="space-y-4">
                <View className="flex-row justify-between border-b border-gray-100 py-1">
                  <Text className="w-1/3 font-medium text-gray-500">Full Name</Text>
                  <Text className="w-2/3 flex-wrap text-right font-medium text-gray-800">
                    {patient?.fullname || 'Not updated'}
                  </Text>
                </View>

                <View className="flex-row justify-between border-b border-gray-100 py-1">
                  <Text className="w-1/3 font-medium text-gray-500">Date of Birth</Text>
                  <Text className="w-2/3 flex-wrap text-right font-medium text-gray-800">
                    {formatDate(patient?.dateOfBirth) || 'Not updated'}
                  </Text>
                </View>

                <View className="flex-row justify-between border-b border-gray-100 py-1">
                  <Text className="w-1/3 font-medium text-gray-500">Phone Number</Text>
                  <Text className="w-2/3 flex-wrap text-right font-medium text-gray-800">
                    {patient?.phoneNumber || 'Not updated'}
                  </Text>
                </View>

                <View className="flex-row justify-between border-b border-gray-100 py-1">
                  <Text className="w-1/3 font-medium text-gray-500">Email Address</Text>
                  <Text className="w-2/3 flex-wrap text-right font-medium text-gray-800">
                    {patient?.emailAddress || 'Not updated'}
                  </Text>
                </View>

                <View className="flex-row justify-between border-b border-gray-100 py-1">
                  <Text className="w-1/3 font-medium text-gray-500">Gender</Text>
                  <Text className="w-2/3 flex-wrap text-right font-medium text-gray-800">
                    {patient?.gender === 'M'
                      ? 'Male'
                      : patient?.gender === 'F'
                        ? 'Female'
                        : 'Not updated'}
                  </Text>
                </View>

                <View className="flex-row justify-between border-b border-gray-100 py-1">
                  <Text className="w-1/3 font-medium text-gray-500">Home Address</Text>
                  <Text className="w-2/3 flex-wrap text-right font-medium text-gray-800">
                    {patient?.homeAddress || 'Not updated'}
                  </Text>
                </View>

                <View className="flex-row justify-between py-1">
                  <Text className="w-1/3 font-medium text-gray-500">Citizen ID</Text>
                  <Text className="w-2/3 flex-wrap text-right font-medium text-gray-800">
                    {patient?.citizenID || 'Not updated'}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="mb-4 rounded-xl bg-white p-5 shadow-sm">
              <View className="mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="rounded-full bg-blue-100 p-2">
                    <FontAwesomeIcon icon={faAddressCard} size={20} color="#2563eb" />
                  </View>
                  <Text className="ms-3 text-lg font-bold text-blue-600">User Information</Text>
                </View>
                <Pressable
                  className="rounded-full bg-blue-600 px-5 py-2"
                  onPress={() => {
                    navigation.navigate('AddPatient');
                  }}>
                  <Text className="font-medium text-white">Add</Text>
                </Pressable>
              </View>
              <View className="mt-2 rounded-lg bg-gray-50 py-6">
                <Text className="text-center text-gray-500">
                  No profile information available. Add your details to complete your profile.
                </Text>
              </View>
            </View>
          )}

          {patient && (
            <View>
              {insurance ? (
                <View className="mb-4 rounded-xl bg-white p-5 shadow-sm">
                  <View className="mb-5 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="rounded-full bg-blue-100 p-2">
                        <FontAwesomeIcon icon={faNotesMedical} size={20} color="#2563eb" />
                      </View>
                      <Text className="ms-3 text-lg font-bold text-blue-600">
                        Insurance Information
                      </Text>
                    </View>
                    <Pressable
                      className="rounded-full bg-blue-600 px-5 py-2"
                      onPress={() => {
                        navigation.navigate('UpdateInsurance', { patientID: patient.patientID });
                      }}>
                      <Text className="font-medium text-white">Update</Text>
                    </Pressable>
                  </View>

                  <View className="space-y-4">
                    <View className="flex-row justify-between border-b border-gray-100 py-1">
                      <Text className="w-2/5 font-medium text-gray-500">Health Insurance ID</Text>
                      <Text className="w-3/5 flex-wrap text-right font-medium text-gray-800">
                        {insurance?.healthInsuranceID || 'Not updated'}
                      </Text>
                    </View>

                    <View className="flex-row justify-between border-b border-gray-100 py-1">
                      <Text className="w-1/3 font-medium text-gray-500">Start Date</Text>
                      <Text className="w-2/3 flex-wrap text-right font-medium text-gray-800">
                        {formatDate(insurance?.startDate || '') || 'Not updated'}
                      </Text>
                    </View>

                    <View className="flex-row justify-between border-b border-gray-100 py-1">
                      <Text className="w-1/3 font-medium text-gray-500">End Date</Text>
                      <Text className="w-2/3 flex-wrap text-right font-medium text-gray-800">
                        {formatDate(insurance?.endDate || '') || 'Not updated'}
                      </Text>
                    </View>

                    <View className="flex-row justify-between border-b border-gray-100 py-1">
                      <Text className="w-2/5 font-medium text-gray-500">
                        Initial Medical Facility
                      </Text>
                      <Text className="w-3/5 flex-wrap text-right font-medium text-gray-800">
                        {insurance?.initialMedicalFacility || 'Not updated'}
                      </Text>
                    </View>

                    <View className="flex-row justify-between py-1">
                      <Text className="w-1/3 font-medium text-gray-500">Last Updated</Text>
                      <Text className="w-2/3 flex-wrap text-right font-medium text-gray-800">
                        {formatDatetime(insurance?.updatedAt || '') || 'Not updated'}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View className="mb-4 rounded-xl bg-white p-5 shadow-sm">
                  <View className="mb-4 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="rounded-full bg-blue-100 p-2">
                        <FontAwesomeIcon icon={faNotesMedical} size={20} color="#2563eb" />
                      </View>
                      <Text className="ms-3 text-lg font-bold text-blue-600">
                        Insurance Information
                      </Text>
                    </View>
                    <Pressable
                      className="rounded-full bg-blue-600 px-5 py-2"
                      onPress={() => {
                        navigation.navigate('AddInsurance', { patientID: patient?.patientID });
                      }}>
                      <Text className="font-medium text-white">Add</Text>
                    </Pressable>
                  </View>
                  <View className="mt-2 rounded-lg bg-gray-50 py-6">
                    <Text className="text-center text-gray-500">
                      No insurance information available. Add your insurance details to access
                      healthcare benefits.
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PatientDetailScreen;
