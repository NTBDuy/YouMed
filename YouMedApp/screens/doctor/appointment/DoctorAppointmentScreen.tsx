import { Text, View, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faCalendarAlt,
  faMapMarkerAlt,
  faUserAlt,
  faCircle,
  faHospital,
  faNotesMedical,
  faSort,
  faSortDown,
  faSortUp,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { useCallback, useContext, useState } from 'react';

import { AuthContext } from 'contexts/AuthContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { TabView, TabBar } from 'react-native-tab-view';
import HeaderSection from 'components/HeaderSection';
import { fetchDoctorAppointments } from 'utils/apiUtils';
import { formatLocaleDateTime } from 'utils/datetimeUtils';
import Appointment from 'types/Appointment';

// Define sort types
const SORT_OPTIONS = {
  DATE_ASC: 'date_asc',
  DATE_DESC: 'date_desc',
  STATUS: 'status',
  TYPE_NEW: 'type_new',
  TYPE_FOLLOW: 'type_follow',
};

const DoctorAppointmentScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);
  const [todayData, setTodayData] = useState<Appointment[]>([]);
  const [upcomingData, setUpcomingData] = useState<Appointment[]>([]);
  const [historyData, setHistoryData] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sort state
  const [currentTodaySort, setCurrentTodaySort] = useState(SORT_OPTIONS.DATE_DESC);
  const [currentUpcomingSort, setCurrentUpcomingSort] = useState(SORT_OPTIONS.DATE_ASC);
  const [currentHistorySort, setCurrentHistorySort] = useState(SORT_OPTIONS.DATE_DESC);
  const [showSortOptions, setShowSortOptions] = useState(false);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'today', title: 'Today' },
    { key: 'upcoming', title: 'Upcoming' },
    { key: 'history', title: 'History' },
  ]);

  const initialLayout = { width: Dimensions.get('window').width };

  const fetchData = async () => {
    try {
      if (!user) return;
      setIsLoading(true);
      
      const response = await fetchDoctorAppointments(user.userID);
      if (response.ok) {
        const resp = await response.json();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayAppointments = resp.filter((appointment: Appointment) => {
          const appointmentDate = new Date(appointment.appointmentDate);
          appointmentDate.setHours(0, 0, 0, 0);
          return (
            (appointment.status === 'Scheduled' ||
              appointment.status === 'In Progress') &&
            appointmentDate.getTime() === today.getTime()
          );
        });

        const upcomingAppointments = resp.filter((appointment: Appointment) => {
          const appointmentDate = new Date(appointment.appointmentDate);
          appointmentDate.setHours(0, 0, 0, 0);
          return (
            (appointment.status === 'Scheduled' ||
              appointment.status === 'In Progress') &&
            appointmentDate.getTime() > today.getTime()
          );
        });

        const historyAppointments = resp.filter(
          (appointment: Appointment) =>
            appointment.status === 'Completed' || appointment.status === 'Cancelled'
        );

        // Apply initial sorting
        setTodayData(sortAppointments(todayAppointments, currentTodaySort));
        setUpcomingData(sortAppointments(upcomingAppointments, currentUpcomingSort));
        setHistoryData(sortAppointments(historyAppointments, currentHistorySort));
      }
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Sort appointments based on sortType
  const sortAppointments = (appointments: Appointment[], sortType: string) => {
    const sortedData = [...appointments];
    
    switch (sortType) {
      case SORT_OPTIONS.DATE_ASC:
        return sortedData.sort((a, b) => 
          new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
        );
      case SORT_OPTIONS.DATE_DESC:
        return sortedData.sort((a, b) => 
          new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
        );
      case SORT_OPTIONS.STATUS:
        return sortedData.sort((a, b) => a.status.localeCompare(b.status));
      case SORT_OPTIONS.TYPE_NEW:
        return sortedData.sort((a, b) => {
          if (a.appointmentType === 'NEW_VISIT' && b.appointmentType !== 'NEW_VISIT') return -1;
          if (a.appointmentType !== 'NEW_VISIT' && b.appointmentType === 'NEW_VISIT') return 1;
          return 0;
        });
      case SORT_OPTIONS.TYPE_FOLLOW:
        return sortedData.sort((a, b) => {
          if (a.appointmentType === 'FOLLOW_UP' && b.appointmentType !== 'FOLLOW_UP') return -1;
          if (a.appointmentType !== 'FOLLOW_UP' && b.appointmentType === 'FOLLOW_UP') return 1;
          return 0;
        });
      default:
        return sortedData;
    }
  };

  // Filter appointments based on search query
  const filterAppointments = (appointments: Appointment[]) => {
    if (!searchQuery.trim()) return appointments;

    return appointments.filter((appointment) => {
      const patientName = appointment.patient.fullname.toLowerCase();
      const clinicName = appointment.clinic?.name.toLowerCase() || '';
      const appointmentId = appointment.appointmentID.toString();
      const query = searchQuery.toLowerCase();

      return (
        patientName.includes(query) || 
        clinicName.includes(query) || 
        appointmentId.includes(query)
      );
    });
  };

  // Handle sorting change
  const handleSortChange = (sortType: string) => {
    setShowSortOptions(false);
    
    switch (index) {
      case 0: // Today tab
        setCurrentTodaySort(sortType);
        setTodayData(sortAppointments(todayData, sortType));
        break;
      case 1: // Upcoming tab
        setCurrentUpcomingSort(sortType);
        setUpcomingData(sortAppointments(upcomingData, sortType));
        break;
      case 2: // History tab
        setCurrentHistorySort(sortType);
        setHistoryData(sortAppointments(historyData, sortType));
        break;
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderLoading = () => (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#059669" />
    </View>
  );

  const getStatusConfig = (status: string) => {
    const statusLower = status;
    switch (statusLower) {
      case 'Scheduled':
        return { textColor: 'text-emerald-600', bgColor: 'bg-emerald-100', iconColor: '#0d9488' };
      case 'Completed':
        return { textColor: 'text-green-600', bgColor: 'bg-green-100', iconColor: '#10b981' };
      case 'Cancelled':
        return { textColor: 'text-red-600', bgColor: 'bg-red-100', iconColor: '#ef4444' };
      case 'In Progress':
        return { textColor: 'text-orange-600', bgColor: 'bg-orange-100', iconColor: '#ea580c' };
      default:
        return { textColor: 'text-gray-600', bgColor: 'bg-gray-100', iconColor: '#6b7280' };
    }
  };

  const handleAppointmentPress = (item: Appointment) => {
    navigation.navigate('AppointmentDetail', {
      appointmentID: item.appointmentID,
    });
  };

  const renderAppointmentItem = ({ item }: { item: Appointment }) => {
    const statusConfig = getStatusConfig(item.status);
    return (
      <TouchableOpacity
        className="mb-4 overflow-hidden rounded-xl bg-white shadow-md"
        onPress={() => handleAppointmentPress(item)}>
        <View className={`h-1 w-full ${statusConfig.bgColor}`} />

        <View className="p-4">
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-lg font-bold text-gray-800">#{item.appointmentID}</Text>
            </View>
            <View className="flex-row items-center space-x-2">
              <View
                className={`flex-row items-center rounded-full ${statusConfig.bgColor} px-3 py-1`}>
                <FontAwesomeIcon icon={faCircle} size={8} color={statusConfig.iconColor} />
                <Text className={`ml-1 text-xs font-medium ${statusConfig.textColor}`}>
                  {item.status}
                </Text>
              </View>
              
              {/* Appointment Type Badge */}
              {item.appointmentType && (
                <View className="flex-row items-center rounded-full bg-indigo-100 px-3 py-1">
                  <Text className="text-xs font-medium text-indigo-600">
                    {item.appointmentType === 'NEW_VISIT' ? 'New' : 'Follow-up'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View className="space-y-2">
            <View className="flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                <FontAwesomeIcon icon={faCalendarAlt} size={14} color="#0d9488" />
              </View>
              <Text className="ml-3 flex-1 text-sm text-gray-700">
                {formatLocaleDateTime(item.appointmentDate)}
              </Text>
            </View>

            <View className="flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                <FontAwesomeIcon icon={faHospital} size={14} color="#f59e0b" />
              </View>
              <Text className="ml-3 flex-1 text-sm text-gray-700">{item.clinic!.name}</Text>
            </View>

            <View className="flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                <FontAwesomeIcon icon={faUserAlt} size={14} color="#8b5cf6" />
              </View>
              <Text className="ml-3 flex-1 text-sm text-gray-700">{item.patient.fullname}</Text>
            </View>

            <View className="flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <FontAwesomeIcon icon={faNotesMedical} size={14} color="#3b82f6" />
              </View>
              <Text className="ml-3 flex-1 text-sm italic text-gray-700">
                {item.symptomNote || 'No symptom provided'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="text-center text-lg text-gray-500">
        No appointments found in this category
      </Text>
    </View>
  );

  // Render search bar component
  const renderSearchBar = () => (
    <View className="mb-2 bg-white px-4 py-2">
      <View className="flex-row items-center rounded-lg bg-gray-100 px-3 py-2">
        <FontAwesomeIcon icon={faSearch} size={16} color="#6b7280" />
        <TextInput
          className="ml-2 flex-1 text-gray-800"
          placeholder="Search by patient name or clinic..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={'#6b7280'}
        />
        {searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text className="font-medium text-gray-500">Clear</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Render sort dropdown menu
  const renderSortOptions = () => {
    let currentSort;
    switch (index) {
      case 0:
        currentSort = currentTodaySort;
        break;
      case 1:
        currentSort = currentUpcomingSort;
        break;
      case 2:
        currentSort = currentHistorySort;
        break;
      default:
        currentSort = currentTodaySort;
    }
    
    return (
      <View className="absolute right-4 top-14 z-10 rounded-lg bg-white p-2 shadow-lg">
        <TouchableOpacity 
          className={`flex-row items-center p-3 ${currentSort === SORT_OPTIONS.DATE_DESC ? 'bg-emerald-50' : ''}`}
          onPress={() => handleSortChange(SORT_OPTIONS.DATE_DESC)}>
          <FontAwesomeIcon icon={faSortDown} size={16} color="#059669" />
          <Text className="ml-2 text-gray-800">Latest first</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-row items-center p-3 ${currentSort === SORT_OPTIONS.DATE_ASC ? 'bg-emerald-50' : ''}`}
          onPress={() => handleSortChange(SORT_OPTIONS.DATE_ASC)}>
          <FontAwesomeIcon icon={faSortUp} size={16} color="#059669" />
          <Text className="ml-2 text-gray-800">Earliest first</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-row items-center p-3 ${currentSort === SORT_OPTIONS.STATUS ? 'bg-emerald-50' : ''}`}
          onPress={() => handleSortChange(SORT_OPTIONS.STATUS)}>
          <FontAwesomeIcon icon={faSort} size={16} color="#059669" />
          <Text className="ml-2 text-gray-800">By status</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-row items-center p-3 ${currentSort === SORT_OPTIONS.TYPE_NEW ? 'bg-emerald-50' : ''}`}
          onPress={() => handleSortChange(SORT_OPTIONS.TYPE_NEW)}>
          <FontAwesomeIcon icon={faSort} size={16} color="#059669" />
          <Text className="ml-2 text-gray-800">New visits first</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-row items-center p-3 ${currentSort === SORT_OPTIONS.TYPE_FOLLOW ? 'bg-emerald-50' : ''}`}
          onPress={() => handleSortChange(SORT_OPTIONS.TYPE_FOLLOW)}>
          <FontAwesomeIcon icon={faSort} size={16} color="#059669" />
          <Text className="ml-2 text-gray-800">Follow-ups first</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSortButton = () => (
    <TouchableOpacity
      className="flex-row items-center px-3 py-2 shadow-sm"
      onPress={() => setShowSortOptions(!showSortOptions)}>
      <FontAwesomeIcon icon={faSort} size={16} color="#fff" />
    </TouchableOpacity>
  );

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: '#059669' }}
      style={{
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
      labelStyle={{ color: '#000', fontWeight: 'bold' }}
      activeColor="#059669"
      inactiveColor="#6b7280"
    />
  );

  const renderScene = ({ route }: { route: { key: string } }) => {
    if (isLoading && !refreshing) return renderLoading();
    
    switch (route.key) {
      case 'today':
        return (
          <View className="flex-1">
            {renderSearchBar()}
            <View className="flex-1 px-4">
              {filterAppointments(todayData).length > 0 ? (
                <FlatList
                  data={filterAppointments(todayData)}
                  renderItem={renderAppointmentItem}
                  keyExtractor={(item) => item.appointmentID.toString()}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 16, paddingTop: 8 }}
                  refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                  }
                />
              ) : (
                renderEmptyList()
              )}
            </View>
          </View>
        );
      case 'upcoming':
        return (
          <View className="flex-1">
            {renderSearchBar()}
            <View className="flex-1 px-4">
              {filterAppointments(upcomingData).length > 0 ? (
                <FlatList
                  data={filterAppointments(upcomingData)}
                  renderItem={renderAppointmentItem}
                  keyExtractor={(item) => item.appointmentID.toString()}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 16, paddingTop: 8 }}
                  refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                  }
                />
              ) : (
                renderEmptyList()
              )}
            </View>
          </View>
        );
      case 'history':
        return (
          <View className="flex-1">
            {renderSearchBar()}
            <View className="flex-1 px-4">
              {filterAppointments(historyData).length > 0 ? (
                <FlatList
                  data={filterAppointments(historyData)}
                  renderItem={renderAppointmentItem}
                  keyExtractor={(item) => item.appointmentID.toString()}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 16, paddingTop: 8 }}
                  refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                  }
                />
              ) : (
                renderEmptyList()
              )}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [user])
  );

  return (
    <SafeAreaView className="-mb-10 flex-1 bg-slate-100">
      <HeaderSection 
        title="My Appointments" 
        rightElement={renderSortButton()}
      />

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={renderTabBar}
      />
      
      {/* Sorting dropdown */}
      {showSortOptions && renderSortOptions()}
    </SafeAreaView>
  );
};

export default DoctorAppointmentScreen;