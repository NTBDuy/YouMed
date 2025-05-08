import { useFocusEffect, useNavigation } from '@react-navigation/native';
import HeaderSection from 'components/HeaderSection';
import { AuthContext } from 'contexts/AuthContext';
import { useCallback, useContext, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchDoctorPatients } from 'utils/apiUtils';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from 'utils/datetimeUtils';
import Patient from 'types/Patient';

const DoctorPatientScreen = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { user } = useContext(AuthContext);
  const navigation = useNavigation<any>();

  const getPatients = async () => {
    setLoading(true);
    try {
      const res = await fetchDoctorPatients(user!.userID);
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
        setFilteredPatients(data);
      }
    } catch (error) {
      console.error('Error to fetching data: ', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getPatients();
    }, [user])
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredPatients(patients);
      return;
    }

    const filtered = patients.filter((patient) => {
      const emailMatch =
        patient.emailAddress && patient.emailAddress.toLowerCase().includes(query.toLowerCase());

      return (
        patient.fullname.toLowerCase().includes(query.toLowerCase()) ||
        patient.phoneNumber.includes(query) ||
        emailMatch
      );
    });
    setFilteredPatients(filtered);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredPatients(patients);
  };

  const onRefresh = () => {
    setRefreshing(true);
    getPatients();
  };

  const renderPatientItem = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      className="mb-2 rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
      onPress={() =>  navigation.navigate('PatientDetail', { patientID: item.patientID })}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800">{item.fullname}</Text>
          <Text className="mt-1 text-gray-600">Phone: {item.phoneNumber || 'Not updated'}</Text>
          <View className="mt-1 flex-row">
            <Text className="text-gray-600">DOB: {formatDate(item.dateOfBirth)}</Text>
            <Text className="ml-4 text-gray-600">
              Gender: {item.gender === 'M' ? 'Male' : item.gender === 'F' ? 'Female' : item.gender}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const EmptyListComponent = () => (
    <View className="flex-1 items-center justify-center py-10">
      <Ionicons name="people-outline" size={60} color="#D1D5DB" />
      <Text className="mt-4 text-lg text-gray-500">No patients found</Text>
      {searchQuery.length > 0 && (
        <Text className="mt-2 text-gray-400">Try a different search term</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <HeaderSection
        title="My Patients"
        backBtn
        serchSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        placeholder="Search name, email or phone number ..."
        clearSearch={clearSearch}
      />

      {isLoading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-2 text-gray-500">Loading patients...</Text>
        </View>
      ) : (
        <View>
          <FlatList
            data={filteredPatients}
            renderItem={renderPatientItem}
            keyExtractor={(item) => item.patientID.toString()}
            contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={EmptyListComponent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default DoctorPatientScreen;
