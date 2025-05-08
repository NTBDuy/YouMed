import { useFocusEffect, useNavigation } from '@react-navigation/native';
import HeaderSection from 'components/HeaderSection';
import { AuthContext } from 'contexts/AuthContext';
import { useCallback, useContext, useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchRecords } from 'utils/apiUtils';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from 'utils/datetimeUtils';
import MedicalRecord from 'types/MedicalRecord';

const DoctorMedicalRecordScreen = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { user } = useContext(AuthContext);
  const navigation = useNavigation<any>();

  const getRecords = async () => {
    setLoading(true);
    try {
      const res = await fetchRecords(user!.userID);
      if (res.ok) {
        const data = await res.json();
        console.log('TEST - GET PATIENTS: ', data);
        setRecords(data);
        setFilteredRecords(data);
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
      getRecords();
    }, [user])
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredRecords(records);
      return;
    }

    const filtered = records.filter((record) => {
      const fullnameMatch =
        record.patient &&
        record.patient.fullname &&
        record.patient.fullname.toLowerCase().includes(query.toLowerCase());
      return (
        record.recordID.toString().includes(query) ||
        record.appointmentID.toString().includes(query) ||
        record.diagnosis.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
        record.prescription?.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
        record.notes?.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
        fullnameMatch ||
        (record.patient && record.patient.phoneNumber.includes(query))
      );
    });
    setFilteredRecords(filtered);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredRecords(records);
  };

  const onRefresh = () => {
    setRefreshing(true);
    getRecords();
  };

  const renderRecordItem = ({ item }: { item: MedicalRecord }) => (
    <TouchableOpacity
      className="mb-2 mt-2 rounded-lg bg-white p-4 shadow-sm"
      onPress={() => {
        navigation.navigate('RecordDetail' as never, { recordID: item.recordID } as never);
      }}>
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="font-medium text-gray-500">{formatDate(item.createdAt)}</Text>
        {item.isFollowUp ? (
          <View className="rounded-full bg-green-100 px-2 py-1">
            <Text className="text-xs text-green-800">Follow-up Done</Text>
          </View>
        ) : item.isScheduleFollowUp ? (
          <View className="rounded-full bg-blue-100 px-2 py-1">
            <Text className="text-xs text-blue-800">Follow-up Scheduled</Text>
          </View>
        ) : item.followUpDate != null ? (
          <View className="rounded-full bg-amber-100 px-2 py-1">
            <Text className="text-xs text-amber-800">Follow-up Required</Text>
          </View>
        ) : null}
      </View>

      <Text className="mb-1 text-lg font-semibold" numberOfLines={1}>
        {item.diagnosis}
      </Text>

      <View className="mt-2 border-t border-gray-100 pt-2">
        <View className="flex-row items-center">
          <Ionicons name="medkit" size={14} color="#0d9488" />
          <Text className="ml-1 text-sm text-gray-700">{item.patient.fullname || 'Unknown'}</Text>
        </View>

        <View className="mt-1 flex-row items-center">
          <Ionicons name="location" size={14} color="#0d9488" />
          <Text className="ml-1 text-sm text-gray-700">
            {item.appointment?.clinic?.name || 'Unknown Clinic'}
          </Text>
        </View>
      </View>

      <View className="mt-1 flex-row justify-end">
        <Ionicons name="arrow-forward" size={16} color="#0d9488" />
      </View>
    </TouchableOpacity>
  );

  const EmptyListComponent = () => (
    <View className="flex-1 items-center justify-center py-10">
      <Ionicons name="people-outline" size={60} color="#D1D5DB" />
      <Text className="mt-4 text-lg text-gray-500">No records found</Text>
      {searchQuery.length > 0 && (
        <Text className="mt-2 text-gray-400">Try a different search term</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView>
      <HeaderSection
        title="Medical Record List"
        backBtn
        serchSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        placeholder="Search id, diagnosis, name or phone number ..."
        clearSearch={clearSearch}
      />

      {isLoading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-2 text-gray-500">Loading patients...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecords}
          renderItem={renderRecordItem}
          keyExtractor={(item) => item.recordID.toString()}
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

export default DoctorMedicalRecordScreen;
