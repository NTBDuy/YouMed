import { View, Text, SafeAreaView, Pressable, FlatList } from 'react-native';
import { useCallback, useContext, useState } from 'react';
import HeaderSection from 'components/HeaderSection';
import { AuthContext } from 'contexts/AuthContext';
import { fetchClientPatients } from 'utils/apiUtils';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getUserInitials } from 'utils/userHelpers';
import Patient from 'types/Patient';

const MedicalHistoryScreen = () => {
  const navigation = useNavigation<any>();
  const [patients, setPatients] = useState<Patient[]>([]);
  const { user } = useContext(AuthContext);

  const fetchData = async () => {
    try {
      if (user) {
        const res = await fetchClientPatients(user.userID);
        if (res.ok) {
          const data = await res.json();
          setPatients(data);
        } else {
          console.log('Failed to fetch list of patients!');
        }
      }
    } catch (error) {
      console.log('Error fetching list of patients', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [user])
  );

  const renderPatientItem = ({ item }: { item: Patient }) => (
    <Pressable
      onPress={() => {
        navigation.navigate('PatientRecordList', { patientID: item.patientID });
      }}
      className="active:opacity-80">
      <View className="mb-4 rounded-xl bg-white p-6 shadow-sm shadow-gray-300">
        <View className="flex-row items-start">
          <View className="mr-4 h-14 w-14 items-center justify-center rounded-full bg-blue-600">
            <Text className="text-xl font-semibold text-white">{getUserInitials(item.fullname)}</Text>
          </View>
          <View className="flex-1">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-blue-700">{item.fullname}</Text>
              <View className="rounded-full bg-blue-100 px-3 py-1">
                <Text className="text-xs font-medium text-blue-800">{item.relationship}</Text>
              </View>
            </View>
            <Text className="text-sm text-gray-500">
              DOB: {item.dateOfBirth ? new Date(item.dateOfBirth).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <HeaderSection title="Patient List" backBtn />

      <FlatList
        className="p-4"
        data={patients}
        keyExtractor={(item) => item.patientID.toString()}
        renderItem={renderPatientItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          patients.length === 0
            ? { flex: 1, justifyContent: 'center', alignItems: 'center' }
            : { paddingBottom: 20 }
        }
        ListEmptyComponent={
          <View className="items-center justify-center">
            <Text className="text-lg text-gray-500">No patients found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default MedicalHistoryScreen;
