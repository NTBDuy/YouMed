import { Text, View, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faCalendarAlt,
  faMapMarkerAlt,
  faUserAlt,
  faCircle,
  faUserDoctor,
  faSort,
  faSortDown,
  faSortUp,
} from '@fortawesome/free-solid-svg-icons';
import { useCallback, useContext, useState } from 'react';
import { AuthContext } from 'contexts/AuthContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fetchAppointments } from 'utils/apiUtils';
import { TabView, TabBar } from 'react-native-tab-view';
import HeaderSection from 'components/HeaderSection';
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

const AppointmentScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);
  const [historyData, setHistoryData] = useState<Appointment[]>([]);
  const [incomingData, setIncomingData] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Sort state
  const [currentIncomingSort, setCurrentIncomingSort] = useState(SORT_OPTIONS.DATE_DESC);
  const [currentHistorySort, setCurrentHistorySort] = useState(SORT_OPTIONS.DATE_DESC);
  const [showSortOptions, setShowSortOptions] = useState(false);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'incoming', title: 'Incoming' },
    { key: 'history', title: 'History' },
  ]);

  const initialLayout = { width: Dimensions.get('window').width };

  const fetchData = async () => {
    try {
      if (!user) {
        return;
      }
      setIsLoading(true);

      const response = await fetchAppointments(user.userID);

      if (response.ok) {
        const resp = await response.json();

        const historyAppointments = resp.filter((appointment: Appointment) => {
          const status = appointment.status.toLowerCase();
          return status === 'completed' || status === 'cancelled';
        });

        const incomingAppointments = resp.filter((appointment: Appointment) => {
          const status = appointment.status.toLowerCase();
          return status === 'pending' || status === 'scheduled' || status === 'in progress';
        });

        // Apply initial sorting
        setHistoryData(sortAppointments(historyAppointments, currentHistorySort));
        setIncomingData(sortAppointments(incomingAppointments, currentIncomingSort));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
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

  // Handle sorting change
  const handleSortChange = (sortType: string) => {
    setShowSortOptions(false);
    
    if (index === 0) { // Incoming tab
      setCurrentIncomingSort(sortType);
      setIncomingData(sortAppointments(incomingData, sortType));
    } else { // History tab
      setCurrentHistorySort(sortType);
      setHistoryData(sortAppointments(historyData, sortType));
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderLoading = () => (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
  
  const getStatusConfig = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'scheduled':
        return { textColor: 'text-blue-600', bgColor: 'bg-blue-100', iconColor: '#0d9488' };
      case 'completed':
        return { textColor: 'text-green-600', bgColor: 'bg-green-100', iconColor: '#10b981' };
      case 'cancelled':
        return { textColor: 'text-red-600', bgColor: 'bg-red-100', iconColor: '#ef4444' };
      case 'pending':
        return { textColor: 'text-yellow-600', bgColor: 'bg-yellow-100', iconColor: '#fbbf24' };
      case 'in progress':
        return { textColor: 'text-blue-600', bgColor: 'bg-blue-100', iconColor: '#3b82f6' };
      default:
        return { textColor: 'text-gray-600', bgColor: 'bg-gray-100', iconColor: '#6b7280' };
    }
  };

  const renderAppointmentItem = ({ item }: { item: Appointment }) => {
    const statusConfig = getStatusConfig(item.status);
    return (
      <TouchableOpacity
        className="mb-4 overflow-hidden rounded-xl bg-white shadow-md"
        onPress={() => navigation.navigate('Detail', { appointmentID: item.appointmentID })}>
        {/* Status indicator strip at the top */}
        <View className={`h-1 w-full ${statusConfig.bgColor}`} />

        <View className="p-4">
          {/* Header with ID and Status */}
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
              <View className="flex-row items-center rounded-full bg-indigo-100 px-3 py-1">
                <Text className="text-xs font-medium text-indigo-600">
                  {item.appointmentType === 'NEW_VISIT' ? 'New' : 'Follow-up'}
                </Text>
              </View>
            </View>
          </View>

          {/* Appointment Info Grid */}
          <View className="space-y-2">
            {/* Date/Time */}
            <View className="flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <FontAwesomeIcon icon={faCalendarAlt} size={14} color="#0d9488" />
              </View>
              <Text className="ml-3 flex-1 text-sm text-gray-700">
                {formatLocaleDateTime(item.appointmentDate)}
              </Text>
            </View>

            {/* Clinic */}
            <View className="flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                <FontAwesomeIcon icon={faMapMarkerAlt} size={14} color="#f59e0b" />
              </View>
              <Text className="ml-3 flex-1 text-sm text-gray-700">{item.clinic!.name}</Text>
            </View>

            {/* Doctor */}
            <View className="flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <FontAwesomeIcon icon={faUserDoctor} size={14} color="#10b981" />
              </View>
              <Text className="ml-3 flex-1 text-sm text-gray-700">{item.doctor.user.fullname}</Text>
            </View>

            {/* Patient */}
            <View className="flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                <FontAwesomeIcon icon={faUserAlt} size={14} color="#8b5cf6" />
              </View>
              <Text className="ml-3 flex-1 text-sm text-gray-700">{item.patient.fullname}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View className="flex-1 items-center justify-center">
      <Text className="text-lg text-gray-500">No appointments found</Text>
    </View>
  );

  // Render sort dropdown menu
  const renderSortOptions = () => {
    const currentSort = index === 0 ? currentIncomingSort : currentHistorySort;
    
    return (
      <View className="absolute right-4 top-14 z-10 rounded-lg bg-white p-2 shadow-lg">
        <TouchableOpacity 
          className={`flex-row items-center p-3 ${currentSort === SORT_OPTIONS.DATE_DESC ? 'bg-blue-50' : ''}`}
          onPress={() => handleSortChange(SORT_OPTIONS.DATE_DESC)}>
          <FontAwesomeIcon icon={faSortDown} size={16} color="#2563eb" />
          <Text className="ml-2 text-gray-800">Latest first</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-row items-center p-3 ${currentSort === SORT_OPTIONS.DATE_ASC ? 'bg-blue-50' : ''}`}
          onPress={() => handleSortChange(SORT_OPTIONS.DATE_ASC)}>
          <FontAwesomeIcon icon={faSortUp} size={16} color="#2563eb" />
          <Text className="ml-2 text-gray-800">Earliest first</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-row items-center p-3 ${currentSort === SORT_OPTIONS.STATUS ? 'bg-blue-50' : ''}`}
          onPress={() => handleSortChange(SORT_OPTIONS.STATUS)}>
          <FontAwesomeIcon icon={faSort} size={16} color="#2563eb" />
          <Text className="ml-2 text-gray-800">By status</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-row items-center p-3 ${currentSort === SORT_OPTIONS.TYPE_NEW ? 'bg-blue-50' : ''}`}
          onPress={() => handleSortChange(SORT_OPTIONS.TYPE_NEW)}>
          <FontAwesomeIcon icon={faSort} size={16} color="#2563eb" />
          <Text className="ml-2 text-gray-800">New visits first</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-row items-center p-3 ${currentSort === SORT_OPTIONS.TYPE_FOLLOW ? 'bg-blue-50' : ''}`}
          onPress={() => handleSortChange(SORT_OPTIONS.TYPE_FOLLOW)}>
          <FontAwesomeIcon icon={faSort} size={16} color="#2563eb" />
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
      {/* <Text className="ml-2 text-white">Sort</Text> */}
    </TouchableOpacity>
  );

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: '#2563eb' }}
      style={{
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
      labelStyle={{ color: '#000', fontWeight: 'bold' }}
      activeColor="#2563eb"
      inactiveColor="#6b7280"
    />
  );

  const renderScene = ({ route }: { route: { key: string } }) => {
    if (isLoading && !refreshing) return renderLoading();

    switch (route.key) {
      case 'incoming':
        return (
          <View className="flex-1 px-4 pt-4">
            {incomingData.length > 0 ? (
              <FlatList
                data={incomingData}
                renderItem={renderAppointmentItem}
                keyExtractor={(item) => item.appointmentID.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 16 }}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
              />
            ) : (
              renderEmptyList()
            )}
          </View>
        );
      case 'history':
        return (
          <View className="flex-1 px-4 pt-4">
            {historyData.length > 0 ? (
              <FlatList
                data={historyData}
                renderItem={renderAppointmentItem}
                keyExtractor={(item) => item.appointmentID.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 16 }}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
              />
            ) : (
              renderEmptyList()
            )}
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
        title="Appointment"
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

export default AppointmentScreen;