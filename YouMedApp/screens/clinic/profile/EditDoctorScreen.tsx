import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderSection from 'components/HeaderSection';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheck, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { fetchSpecialties, updateDoctor } from 'utils/apiUtils';
import { Specialties } from 'types/Specialties';
import { Doctor } from 'types/Doctor';

const EditDoctorScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();

  const { doctor } = route.params as { doctor: Doctor };

  const [fullname, setFullname] = useState(doctor.user.fullname);
  const [phoneNumber, setPhoneNumber] = useState(doctor.user.phoneNumber);
  const [emailAddress, setEmailAddress] = useState(doctor.user.email);
  const [introduction, setIntroduction] = useState(doctor.introduction);
  const [experience, setExperience] = useState(doctor.experience.toString());
  const [isLoading, setIsLoading] = useState(false);

  const [specialties, setSpecialties] = useState<Specialties[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [specialtiesData, setSpecialtiesData] = useState<Specialties[]>([]);
  const [isLoadingSpecialties, setLoadingSpecialties] = useState(false);

  const getSpecialtiesData = async () => {
    try {
      setLoadingSpecialties(true);
      const response = await fetchSpecialties();
      if (response.ok) {
        const data = await response.json();
        setSpecialtiesData(data);
      }
    } catch (error) {
      console.error('Error fetching specialties:', error);
      setLoadingSpecialties(false);
      Alert.alert('Error', 'Failed to load specialties');
    } finally {
      setLoadingSpecialties(false);
    }
  };

  useEffect(() => {
    if (doctor.specialties) {
      setSpecialties(doctor.specialties);
    }
    getSpecialtiesData();
  }, [doctor]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const res = await updateDoctor(
        {
          fullname,
          phoneNumber,
          email: emailAddress,
          introduction,
          experience,
          specialtyIDs: specialties.map((s) => s.specialtyID),
        },
        doctor.doctorID
      );

      if (res.ok) {
        Alert.alert('Success', 'Profile updated successfully');
        navigation.goBack();
      } else {
        const errorData = await res.json();
        Alert.alert('Fail', errorData.message || 'Failed to update');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  // Component hiển thị từng tag chuyên khoa đã chọn
  const SpecialtyTag = ({ specialty, onRemove }: any) => (
    <View className="mb-2 mr-2 flex-row items-center rounded-full bg-cyan-100 px-3 py-1">
      <Text className="mr-1 text-cyan-700">{specialty.name}</Text>
      <TouchableOpacity onPress={() => onRemove(specialty.specialtyID)}>
        <FontAwesomeIcon icon={faTimes} size={12} color="#0e7490" />
      </TouchableOpacity>
    </View>
  );

  const handleRemoveSpecialty = (specialtyId: any) => {
    setSpecialties(specialties.filter((item) => item.specialtyID !== specialtyId));
  };

  const handleAddSpecialty = (specialty: any) => {
    const isAlreadyAdded = specialties.some((item) => item.specialtyID === specialty.specialtyID);
    if (!isAlreadyAdded) {
      setSpecialties([...specialties, specialty]);
    }
  };

  return (
    <SafeAreaView>
      <HeaderSection
        customTitle={
          <Text className="text-xl font-bold text-white">Edit Doctor #{doctor.doctorID}</Text>
        }
        backBtn
      />

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
          <Text className="mb-2">Email Address</Text>
          <TextInput
            className="rounded-lg border border-gray-300 bg-white px-4 py-2"
            value={emailAddress}
            onChangeText={setEmailAddress}
            keyboardType="email-address"
          />
        </View>

        {/* Phần chọn chuyên khoa */}
        <View className="mb-3">
          <Text className="mb-2">Specialties</Text>

          <View className="mb-2 flex-row flex-wrap">
            {specialties.map((specialty) => (
              <SpecialtyTag
                key={specialty.specialtyID}
                specialty={specialty}
                onRemove={handleRemoveSpecialty}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="flex-row items-center justify-center rounded-lg border border-cyan-500 bg-white p-2">
            <FontAwesomeIcon icon={faPlus} size={14} color="#0891b2" />
            <Text className="ml-2 text-cyan-600">Add specialty</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-3">
          <Text className="mb-2">Introduction</Text>
          <TextInput
            className="rounded-lg border border-gray-300 bg-white px-4 py-2"
            value={introduction}
            onChangeText={setIntroduction}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View className="mb-3">
          <Text className="mb-2">Experience</Text>
          <TextInput
            className="rounded-lg border border-gray-300 bg-white px-4 py-2"
            value={experience.toString()}
            onChangeText={setExperience}
            keyboardType="phone-pad"
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
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/30">
          <View className="h-96 rounded-t-xl bg-white p-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold">Select Specialties</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesomeIcon icon={faTimes} size={20} color="#000" />
              </TouchableOpacity>
            </View>

            {isLoadingSpecialties ? (
              <ActivityIndicator size="large" color="#0891b2" />
            ) : (
              <FlatList
                data={specialtiesData}
                keyExtractor={(item) => item.specialtyID.toString()}
                renderItem={({ item }) => {
                  const isSelected = specialties.some((s) => s.specialtyID === item.specialtyID);
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        if (isSelected) {
                          handleRemoveSpecialty(item.specialtyID);
                        } else {
                          handleAddSpecialty(item);
                        }
                      }}
                      className={`flex-row items-center justify-between border-b border-gray-200 p-3 ${
                        isSelected ? 'bg-cyan-50' : ''
                      }`}>
                      <Text>{item.name}</Text>
                      {isSelected && <FontAwesomeIcon icon={faCheck} size={16} color="#0891b2" />}
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="mb-6 mt-4 items-center rounded-lg bg-cyan-600 p-3">
              <Text className="font-bold text-white">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default EditDoctorScreen;
