import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHospital, faMapPin, faStar, faClock } from '@fortawesome/free-solid-svg-icons';

import { fetchClinics, fetchSpecialties } from 'utils/apiUtils';
import HeaderSection from 'components/HeaderSection';
import { Clinic } from 'types/Clinic';
import { Specialties } from 'types/Specialties';

const ClinicScreen = () => {
  const navigation = useNavigation<any>();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');

  const getClinicList = async () => {
    try {
      setIsLoading(true);
      const response = await fetchClinics();

      if (response.ok) {
        const data = await response.json();
        const enhancedData = data.map((clinic: Clinic) => ({
          ...clinic,
          rating: (Math.random() * 2 + 3).toFixed(1),
          distance: `${(Math.random() * 5).toFixed(1)} km`,
          openingHours: Math.random() > 0.2 ? 'Open now' : 'Closed',
        }));
        setClinics(enhancedData);
        setFilteredClinics(enhancedData);
      } else {
        console.log('Failed to fetch clinic list');
      }
    } catch (error) {
      console.error('Error fetching clinic list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getClinicList();
    setRefreshing(false);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterClinics(text, activeFilter);
  };

  const clearSearch = () => {
    setSearchQuery('');
    filterClinics('', activeFilter);
  };

  const filterClinics = (query: string, filterType: string) => {
    let filtered = clinics;

    if (query) {
      filtered = filtered.filter(
        (clinic) =>
          clinic.name.toLowerCase().includes(query.toLowerCase()) ||
          clinic.clinicAddress.toLowerCase().includes(query.toLowerCase()) ||
          clinic.specialties.some((specialty) =>
            specialty.name.toLowerCase().includes(query.toLowerCase())
          )
      );
    }

    if (filterType !== 'All') {
      filtered = filtered.filter((clinic) =>
        clinic.specialties.some((specialty) => specialty.name === filterType)
      );
    }

    setFilteredClinics(filtered);
  };

  const getSpecialtyList = async () => {
    try {
      const response = await fetchSpecialties();
      if (response.ok) {
        const data = await response.json();
        setFilterOptions(['All', ...data.map((item: Specialties) => item.name)]);
      }
    } catch (error) {
      console.error('Error fetching specialty list:', error);
    }
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    filterClinics(searchQuery, filter);
  };

  useEffect(() => {
    getClinicList();
    getSpecialtyList();
  }, []);

  const renderClinicItem = ({ item }: { item: Clinic }) => (
    <Pressable
      className="mx-4 mb-4 overflow-hidden rounded-xl bg-white shadow-sm"
      style={{ elevation: 2 }}
      onPress={() => navigation.navigate('ClinicDetails', { clinic: item })}>
      <View className="h-32 bg-gray-400">
        {/* <Image
          source={{
            uri: `https://source.unsplash.com/featured/?hospital,clinic,medical&sig=${item.clinicID}`,
          }}
          className="h-full w-full"
          resizeMode="cover"
        /> */}
        {/* Image placeholder */}
        <View className="h-full w-full items-center justify-center">
          <Text className="font-medium text-gray-800">{item.name}</Text>
        </View>
        <View className="absolute right-2 top-2 flex-row items-center rounded-full bg-white/90 px-2 py-1">
          <FontAwesomeIcon icon={faStar} size={12} color="#FFCC00" />
          <Text className="ml-1 text-xs font-bold">{item.rating}</Text>
        </View>
      </View>

      <View className="p-4">
        <Text className="mb-1 text-lg font-bold text-gray-800">{item.name}</Text>

        <View className="mb-2 flex-row items-center">
          <FontAwesomeIcon icon={faMapPin} size={12} color="#6b7280" />
          <Text className="ml-1 flex-1 text-xs text-gray-600">{item.clinicAddress}</Text>
          <Text className="text-xs font-medium text-blue-600">{item.distance}</Text>
        </View>

        <View className="mb-3 flex-row items-center">
          <FontAwesomeIcon
            icon={faClock}
            size={12}
            color={item.openingHours === 'Open now' ? '#10b981' : '#ef4444'}
          />
          <Text
            className={`ml-1 text-xs ${item.openingHours === 'Open now' ? 'text-green-500' : 'text-red-500'} font-medium`}>
            {item.openingHours}
          </Text>
        </View>

        {item.specialties.length > 0 && (
          <View className="flex-row flex-wrap">
            {item.specialties.slice(0, 3).map((specialty, index) => (
              <View key={index} className="mb-1 mr-2 rounded-full bg-blue-50 px-3 py-1">
                <Text className="text-xs font-medium text-blue-700">{specialty.name}</Text>
              </View>
            ))}
            {item.specialties.length > 3 && (
              <View className="rounded-full bg-gray-100 px-2 py-1">
                <Text className="text-xs text-gray-500">+{item.specialties.length - 3}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <HeaderSection
        backBtn
        title="Find Clinics"
        serchSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        placeholder="Search clinics or specialties ..."
        clearSearch={clearSearch}
      />

      <View className="py-4">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterOptions}
          keyExtractor={(item) => item}
          contentContainerClassName="px-4"
          className="mb-2"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleFilterChange(item)}
              className={`mr-2 rounded-full px-4 py-2 ${activeFilter === item ? 'bg-blue-600' : 'bg-gray-100'}`}>
              <Text
                className={`text-sm font-medium ${activeFilter === item ? 'text-white' : 'text-gray-600'}`}>
                {item}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {isLoading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0d9488" />
          <Text className="mt-4 text-gray-600">Loading clinics...</Text>
        </View>
      ) : (
        <View className="-mb-10">
          <FlatList
            data={filteredClinics}
            keyExtractor={(item) => item.clinicID.toString()}
            renderItem={renderClinicItem}
            contentContainerClassName="pb-6"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#2563eb']}
                tintColor="#2563eb"
              />
            }
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center p-8">
                <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                  <FontAwesomeIcon icon={faHospital} size={36} color="#9ca3af" />
                </View>
                <Text className="mb-2 text-xl font-medium text-gray-700">
                  {searchQuery ? 'No Matching Clinics' : 'No Clinics Found'}
                </Text>
                <Text className="text-center text-gray-500">
                  {searchQuery
                    ? 'Try different search terms or clear search'
                    : 'Pull down to refresh and try again'}
                </Text>
              </View>
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default ClinicScreen;
