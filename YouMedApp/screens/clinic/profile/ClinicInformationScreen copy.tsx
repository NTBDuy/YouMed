import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useCallback, useContext, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderSection from 'components/HeaderSection';
import { AuthContext } from 'contexts/AuthContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fetchClinicInformation, updateClinicInformation } from 'utils/apiUtils';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faLocationDot,
  faCheck,
  faPhone,
  faHouseChimneyMedical,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { Clinic } from 'types/Clinic';

const ClinicInformationScreen = () => {
  const navigation = useNavigation<any>();

  const { user } = useContext(AuthContext);

  const [clinic, setClinic] = useState<Clinic>();
  const [isLoading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const getData = async () => {
    try {
      setLoading(true);
      const res = await fetchClinicInformation(user!.userID);
      if (res.ok) {
        const data = await res.json();
        setClinic(data);
        setName(data.name);
        setClinicAddress(data.clinicAddress);
        setIntroduction(data.introduction);
        setPhoneNumber(data.phoneNumber);
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const data = {
        clinicID: clinic?.clinicID,
        name,
        clinicAddress,
        introduction,
        phoneNumber,
      };
      const res = await updateClinicInformation(data);
      if (res.ok) {
        Alert.alert('Success', 'Your information has been updated successfully');
        navigation.goBack();
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getData();
    }, [user])
  );

  return (
    <SafeAreaView>
      <HeaderSection title="Clinic Information" backBtn />

      <ScrollView>
        <View className="p-4">
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800">Update information</Text>
            <Text className="text-gray-600">
              Manage your clinic's profile information visible to patients.
            </Text>
          </View>

          <View className="mb-6">
            <View className="mb-2 flex-row items-center">
              <FontAwesomeIcon icon={faHouseChimneyMedical} size={16} color="#0891b2" />
              <Text className="ml-2 font-medium text-gray-700">Clinic Name</Text>
            </View>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your clinic name"
              className="rounded-lg border border-gray-300 bg-white p-3"
            />
          </View>

          <View className="mb-6">
            <View className="mb-2 flex-row items-center">
              <FontAwesomeIcon icon={faLocationDot} size={16} color="#0891b2" />
              <Text className="ml-2 font-medium text-gray-700">Clinic Address</Text>
            </View>
            <TextInput
              value={clinicAddress}
              onChangeText={setClinicAddress}
              placeholder="Enter your clinic address"
              autoCapitalize="none"
              className="rounded-lg border border-gray-300 bg-white p-3"
            />
          </View>

          <View className="mb-6">
            <View className="mb-2 flex-row items-center">
              <FontAwesomeIcon icon={faCircleExclamation} size={16} color="#0891b2" />
              <Text className="ml-2 font-medium text-gray-700">Introduction</Text>
            </View>
            <TextInput
              value={introduction}
              onChangeText={setIntroduction}
              placeholder="Enter clinic introduction"
              multiline
              numberOfLines={20}
              textAlignVertical="top"
              className="rounded-lg border border-gray-300 bg-white p-3"
            />
          </View>

          <View className="mb-8">
            <View className="mb-2 flex-row items-center">
              <FontAwesomeIcon icon={faPhone} size={16} color="#0891b2" />
              <Text className="ml-2 font-medium text-gray-700">Phone Number</Text>
            </View>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              className="rounded-lg border border-gray-300 bg-white p-3"
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className={`mb-6 flex-row items-center justify-center rounded-lg p-4 ${
              isLoading ? 'bg-cyan-400' : 'bg-cyan-600'
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

export default ClinicInformationScreen;
