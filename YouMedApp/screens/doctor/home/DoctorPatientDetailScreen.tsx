import { View, Text, Pressable, Alert } from 'react-native';
import { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderSection from 'components/HeaderSection';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { fetchInsuranceDetail, fetchPatientDetail } from 'utils/apiUtils';
import { formatDate, formatDatetime } from 'utils/datetimeUtils';
import { getGenderText } from 'utils/userHelpers';
import InfoItem from 'components/appointment/InfoItem';
import SectionHeader from 'components/appointment/SectionHeader';
import Patient from 'types/Patient';
import Insurance from 'types/Insuarance';

const DoctorPatientDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { patientID } = route.params as { patientID: number };
  const [patient, setPatient] = useState<Patient>();
  const [insurance, setInsurance] = useState<Insurance>();

  const getPatientInformation = async () => {
    try {
      const response = await fetchPatientDetail(patientID);

      if (response && response.ok) {
        const data = await response.json();
        setPatient(data);
        getPatientInsurance(data.patientID);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
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
    }, [patientID])
  );

  const handleViewMedicalHistory = () => {
    if (patient!.patientID) {
      navigation.navigate('PatientMedicalHistory', { patientID: patient!.patientID });
    } else {
      Alert.alert('Error', 'Patient information not available');
    }
  };

  return (
    <SafeAreaView>
      <HeaderSection backBtn title="Patient Information" />

      <View className="px-4 py-3">
        {patient && (
          <View className="mt-3 rounded-lg bg-white p-4 shadow-sm">
            <SectionHeader title="Patient Information" icon="body" />
            <InfoItem label="Full Name" value={patient!.fullname} />
            <InfoItem label="Date of Birth" value={formatDate(patient?.dateOfBirth)} />
            <InfoItem label="Gender" value={getGenderText(patient!.gender)} />
            <InfoItem label="Address" value={patient!.homeAddress} />
            <InfoItem label="ID Card" value={patient!.citizenID} />
            <InfoItem label="Phone" value={patient?.phoneNumber || 'No Information'} />
            <InfoItem label="Email" value={patient.emailAddress || 'No Information'} />
            <Pressable
              className="mt-2 self-end rounded-lg bg-emerald-500 px-3 py-1"
              onPress={handleViewMedicalHistory}>
              <Text className="text-sm font-medium text-white">View Medical History</Text>
            </Pressable>
          </View>
        )}
        {insurance ? (
          <View className="mt-3 rounded-lg bg-white p-4 shadow-sm">
            <SectionHeader title="Patient Health Insuarance" icon="medical" />
            <InfoItem label="Insuarance ID" value={insurance!.healthInsuranceID} />
            <InfoItem label="Start Date" value={formatDate(insurance.startDate)} />
            <InfoItem label="End Date" value={formatDate(insurance.endDate)} />
            <InfoItem label="Initial Medical Facility" value={insurance.initialMedicalFacility} />
            <InfoItem label="Last Updated" value={formatDatetime(insurance.updatedAt)} />
          </View>
        ) : (
          <View className="mt-3 rounded-lg bg-white p-4 shadow-sm">
            <Text className="text-center text-base text-emerald-800">
              No insurance information available.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default DoctorPatientDetailScreen;
