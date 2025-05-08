import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderSection from 'components/HeaderSection';
import { useCallback, useContext, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fetchPatients } from 'utils/apiUtils';
import { AuthContext } from 'contexts/AuthContext';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import Fontisto from '@expo/vector-icons/Fontisto';
import { getUserInitials } from 'utils/userHelpers';
import Patient from 'types/Patient';

const PatientListScreen = () => {
  const navigation = useNavigation<any>();

  const { user } = useContext(AuthContext);

  const [isLoading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getData = async () => {
    try {
      setLoading(true);
      const res = await fetchPatients(user!.userID);
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
        setFilteredPatients(data);
      }
    } catch (error) {
      console.error('Error to fetching patients', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getData();
    }, [user])
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredPatients(patients);
      return;
    }

    const filtered = patients.filter((patient) => {
      return (
        patient.patientID.toString().includes(query) ||
        (patient.fullname && 
          patient.fullname.toLowerCase().includes(query.toLowerCase())) ||
        (patient.phoneNumber && 
          patient.phoneNumber.includes(query)) ||
        (patient.emailAddress && 
          patient.emailAddress.toLowerCase().includes(query.toLowerCase())) ||
        (patient.homeAddress && 
          patient.homeAddress.toLowerCase().includes(query.toLowerCase()))
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
    getData();
  };

  const renderPatientItem = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      className="mb-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
      onPress={() => navigation.navigate('PatientDetails', { patientID: item.patientID })}>
      <View className="flex-row items-center">
        <View className="mr-4 h-16 w-16 items-center justify-center rounded-full bg-cyan-600">
          <Text className="text-xl font-semibold text-white">{getUserInitials(item.fullname)}</Text>
        </View>

        <View className="flex-1">
          <View className="mb-1 flex-row items-center">
            <Fontisto name="person" size={16} color="#000" />
            <Text className="ml-2 text-lg font-bold text-gray-800">{item.fullname}</Text>
          </View>

          <View className="mb-1 flex-row items-center">
            <FontAwesome name="phone" size={16} color="#4b5563" />
            <Text className="ml-2 text-gray-600">{item.phoneNumber || 'Not updated'}</Text>
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
    <SafeAreaView>
      <HeaderSection
        title="Patient Management"
        backBtn
        serchSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        placeholder="Search by name, ID, phone number or email..."
        clearSearch={clearSearch}
      />
      {isLoading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-2 text-gray-500">Loading patients...</Text>
        </View>
      ) : (
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
      )}
    </SafeAreaView>
  );
};

export default PatientListScreen;