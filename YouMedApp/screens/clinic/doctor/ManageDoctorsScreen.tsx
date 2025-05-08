import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderSection from 'components/HeaderSection';
import { useCallback, useContext, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fetchDoctorsByClinic } from 'utils/apiUtils';
import { AuthContext } from 'contexts/AuthContext';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import Fontisto from '@expo/vector-icons/Fontisto';
import { getUserInitials } from 'utils/userHelpers';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Doctor } from 'types/Doctor';

const ManageDoctorsScreen = () => {
  const navigation = useNavigation<any>();

  const { user } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getData = async () => {
    try {
      setIsLoading(true);
      const res = await fetchDoctorsByClinic(user!.userID);
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
        setFilteredDoctors(data);
      }
    } catch (error) {
      console.error('Error to fetching doctors', error);
    } finally {
      setIsLoading(false);
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
      setFilteredDoctors(doctors);
      return;
    }

    const filtered = doctors.filter((doctor) => {
      const specialtyMatch = doctor.specialties && doctor.specialties.some(specialty => 
        specialty.name.toLowerCase().includes(query.toLowerCase())
      );
      
      return (
        doctor.doctorID.toString().includes(query) ||
        (doctor.user.fullname && 
          doctor.user.fullname.toLowerCase().includes(query.toLowerCase())) ||
        (doctor.user.phoneNumber && 
          doctor.user.phoneNumber.includes(query)) ||
        (doctor.user.email && 
          doctor.user.email.toLowerCase().includes(query.toLowerCase())) ||
        (doctor.experience && 
          doctor.experience.toString().includes(query)) ||
        specialtyMatch
      );
    });
    setFilteredDoctors(filtered);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredDoctors(doctors);
  };

  const onRefresh = () => {
    setRefreshing(true);
    getData();
  };

  const renderDoctorItem = ({ item }: { item: Doctor }) => (
    <TouchableOpacity
      className="mb-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
      onPress={() => navigation.navigate('DoctorDetail', { doctorID: item.doctorID })}>
      <View className="flex-row items-center">
        <View className="mr-4 h-16 w-16 items-center justify-center rounded-full bg-cyan-600">
          <Text className="text-xl font-semibold text-white">
            {getUserInitials(item.user.fullname)}
          </Text>
        </View>

        <View className="flex-1">
          <View className="mb-1 flex-row items-center">
            <Fontisto name="doctor" size={16} color="#000" />
            <Text className="ml-2 text-lg font-bold text-gray-800">{item.user.fullname}</Text>
          </View>

          <View className="mb-1 flex-row items-center">
            <FontAwesome name="phone" size={16} color="#4b5563" />
            <Text className="ml-2 text-gray-600">{item.user.phoneNumber || 'Not updated'}</Text>
          </View>

          <View className="mt-2 flex-row items-center">
            <FontAwesome6 name="briefcase-medical" size={14} color="#4b5563" />
            <Text className="ml-2 text-gray-600">{item.experience} years experience</Text>

            {item.specialties && item.specialties.length > 0 && (
              <View className="ml-2 rounded-full bg-cyan-50 px-2 py-0.5">
                <Text className="text-xs text-cyan-700">{item.specialties[0].name}</Text>
              </View>
            )}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const EmptyListComponent = () => (
    <View className="flex-1 items-center justify-center py-10">
      <Ionicons name="medkit-outline" size={60} color="#D1D5DB" />
      <Text className="mt-4 text-lg text-gray-500">No doctors found</Text>
      {searchQuery.length > 0 && (
        <Text className="mt-2 text-gray-400">Try a different search term</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView>
      <HeaderSection
        title="Doctor Management"
        backBtn
        serchSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        placeholder="Search by name, specialty, experience..."
        clearSearch={clearSearch}
        rightElement={
          <Pressable onPress={() => navigation.navigate('AddDoctor')}>
            <FontAwesomeIcon icon={faUserPlus} size={18} color="#FFFFFF" />
          </Pressable>
        }
      />

      {isLoading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-2 text-gray-500">Loading doctors...</Text>
        </View>
      ) : (
        <View className="mx-4 my-4">
          <FlatList
            data={filteredDoctors}
            renderItem={renderDoctorItem}
            keyExtractor={(item) => item.doctorID.toString()}
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

export default ManageDoctorsScreen;