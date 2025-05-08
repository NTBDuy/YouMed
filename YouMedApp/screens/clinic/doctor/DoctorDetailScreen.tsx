import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderSection from 'components/HeaderSection';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { deleteDoctor, fetchDoctorDetail } from 'utils/apiUtils';
import { formatDatetime } from 'utils/datetimeUtils';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUserPen, faUserXmark } from '@fortawesome/free-solid-svg-icons';
import Doctor from 'types/Doctor';

const InfoSection = ({ label, value, icon }: { label: string; value: string; icon: any }) => (
  <View className="mb-3">
    <Text className="mb-1 text-sm text-gray-500">{label}</Text>
    <View className="flex-row items-center">
      <Ionicons name={icon} size={16} color="#0891b2" />
      <Text className="ml-2 text-base">{value}</Text>
    </View>
  </View>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View className="mb-6">
    <Text className="mb-2 text-lg font-semibold text-gray-800">{title}</Text>
    <View className="rounded-lg bg-white p-4 shadow-sm">{children}</View>
  </View>
);

const DoctorDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();

  const { doctorID } = route.params as { doctorID: number };

  const [isLoading, setLoading] = useState(false);
  const [isLoadingDelete, setLoadingDelete] = useState(false);
  const [doctor, setDoctor] = useState<Doctor>();

  const getDoctorDetail = async () => {
    setLoading(true);
    try {
      const res = await fetchDoctorDetail(doctorID);
      if (res.ok) {
        const data = await res.json();
        setDoctor(data);
      }
    } catch (error) {
      console.error('Error to fetching data: ', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      const res = await deleteDoctor(doctorID);
      if (res.ok) {
        Alert.alert('Success', 'Doctor deleted successfully');
        navigation.goBack();
      } else {
        const errorData = await res.json();
        Alert.alert('Fail', errorData.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error to deleting data: ', error);
    } finally {
      setLoadingDelete(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getDoctorDetail();
    }, [doctorID])
  );

  return (
    <SafeAreaView>
      <HeaderSection
        customTitle={<Text className="text-xl font-bold text-white">Doctor ID #{doctorID}</Text>}
        backBtn
        rightElement={
          <Pressable onPress={() => navigation.navigate('EditDoctor', { doctor })}>
            <FontAwesomeIcon icon={faUserPen} size={18} color="#FFFFFF" />
          </Pressable>
        }
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-2 text-gray-500">Loading doctor...</Text>
        </View>
      ) : (
        <View className="mx-4 -mt-4">
          <Section title="">
            <InfoSection
              label="Doctor Name"
              value={doctor?.user.fullname || 'No Information'}
              icon="person"
            />
            <InfoSection
              label="Phone Number"
              value={doctor?.user.phoneNumber || 'Not provided'}
              icon="call"
            />
            <InfoSection
              label="Email Address"
              value={doctor?.user.email || 'Not provided'}
              icon="mail"
            />
            <InfoSection
              label="Introduction"
              value={doctor?.introduction || 'Not provided'}
              icon="information-circle"
            />
            <InfoSection
              label="Experience"
              value={doctor?.experience.toString() || 'Not provided'}
              icon="briefcase"
            />
            <InfoSection
              label="Created At"
              value={formatDatetime(doctor?.user.createdAt)}
              icon="timer-sharp"
            />
             <InfoSection
              label="Specialties"
              value={doctor?.specialties?.map((item) => item.name).join(', ') || 'Not provided'}
              icon="medkit-sharp"
            />
          </Section>

          <TouchableOpacity
            onPress={handleDelete}
            disabled={isLoading}
            className={`mb-6 flex-row items-center justify-center rounded-lg p-4 ${
              isLoadingDelete ? 'bg-red-400' : 'bg-red-500'
            }`}>
            {isLoadingDelete ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <FontAwesomeIcon icon={faUserXmark} size={16} color="#FFFFFF" />
                <Text className="ml-2 font-bold text-white">Remove Doctor</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default DoctorDetailScreen;

const styles = StyleSheet.create({});
