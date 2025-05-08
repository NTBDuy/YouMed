import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faCalendarAlt,
  faUserAlt,
  faCircle,
  faUserDoctor,
  faSearch,
  faClipboardList,
  faSort,
  faSortDown,
  faSortUp,
} from '@fortawesome/free-solid-svg-icons';
import { useCallback, useContext, useState } from 'react';
import { AuthContext } from 'contexts/AuthContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fetchAppointmentsByClinic } from 'utils/apiUtils';
import { TabView, TabBar } from 'react-native-tab-view';
import HeaderSection from 'components/HeaderSection';
import { formatLocaleDateTime } from 'utils/datetimeUtils';
import Appointment from 'types/Appointment';

// Define sort types
const SORT_OPTIONS = {
  DATE_ASC: 'date_asc',
  DATE_DESC: 'date_desc',
  STATUS: 'status',
  PATIENT_NAME: 'patient_name',
  DOCTOR_NAME: 'doctor_name',
};

const ClinicAppointmentScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);
  const [activeData, setActiveData] = useState<Appointment[]>([]);
  const [pendingData, setPendingData] = useState<Appointment[]>([]);
  const [historyData, setHistoryData] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Sort state
  const [currentPendingSort, setCurrentPendingSort] = useState(SORT_OPTIONS.DATE_DESC);
  const [currentActiveSort, setCurrentActiveSort] = useState(SORT_OPTIONS.DATE_ASC);
  const [currentHistorySort, setCurrentHistorySort] = useState(SORT_OPTIONS.DATE_DESC);
  const [showSortOptions, setShowSortOptions] = useState(false);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'pending', title: 'Pending' },
    { key: 'active', title: 'Active' },
    { key: 'history', title: 'History' },
  ]);

  const initialLayout = { width: Dimensions.get('window').width };

  const fetchData = async () => {
    try {
      if (!user) return;
      const response = await fetchAppointmentsByClinic(user.userID, 'all');
      if (response.ok) {
        const resp = await response.json();
        console.log('Fetched clinic appointments data:', resp);

        const activeAppointments = resp.filter(
          (appointment: Appointment) =>
            appointment.status.toLowerCase() === 'scheduled' ||
            appointment.status.toLowerCase() === 'in progress'
        );

        const pendingAppointments = resp.filter(
          (appointment: Appointment) => appointment.status.toLowerCase() === 'pending'
        );

        const historyAppointments = resp.filter(
          (appointment: Appointment) =>
            appointment.status.toLowerCase() === 'completed' ||
            appointment.status.toLowerCase() === 'cancelled'
        );

        // Apply initial sorting
        setActiveData(sortAppointments(activeAppointments, currentActiveSort));
        setPendingData(sortAppointments(pendingAppointments, currentPendingSort));
        setHistoryData(sortAppointments(historyAppointments, currentHistorySort));
      }
    } catch (error) {
      console.error('Error fetching clinic appointments:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Sort appointments based on sortType
  const sortAppointments = (appointments: Appointment[], sortType: string) => {
    const sortedData = [...appointments];

    switch (sortType) {
      case SORT_OPTIONS.DATE_ASC:
        return sortedData.sort(
          (a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
        );
      case SORT_OPTIONS.DATE_DESC:
        return sortedData.sort(
          (a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
        );
      case SORT_OPTIONS.STATUS:
        return sortedData.sort((a, b) => a.status.localeCompare(b.status));
      case SORT_OPTIONS.PATIENT_NAME:
        return sortedData.sort((a, b) => a.patient.fullname.localeCompare(b.patient.fullname));
      case SORT_OPTIONS.DOCTOR_NAME:
        return sortedData.sort((a, b) =>
          a.doctor.user.fullname.localeCompare(b.doctor.user.fullname)
        );
      default:
        return sortedData;
    }
  };

  // Handle sorting change
  const handleSortChange = (sortType: string) => {
    setShowSortOptions(false);

    switch (index) {
      case 0: // Pending tab
        setCurrentPendingSort(sortType);
        setPendingData(sortAppointments(pendingData, sortType));
        break;
      case 1: // Active tab
        setCurrentActiveSort(sortType);
        setActiveData(sortAppointments(activeData, sortType));
        break;
      case 2: // History tab
        setCurrentHistorySort(sortType);
        setHistoryData(sortAppointments(historyData, sortType));
        break;
    }
  };

  const getStatusConfig = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'scheduled':
        return { textColor: 'text-cyan-600', bgColor: 'bg-cyan-100', iconColor: '#0d9488' };
      case 'in progress':
        return { textColor: 'text-orange-600', bgColor: 'bg-orange-100', iconColor: '#ea580c' };
      case 'completed':
        return { textColor: 'text-green-600', bgColor: 'bg-green-100', iconColor: '#10b981' };
      case 'cancelled':
        return { textColor: 'text-red-600', bgColor: 'bg-red-100', iconColor: '#ef4444' };
      case 'pending':
        return { textColor: 'text-yellow-600', bgColor: 'bg-yellow-100', iconColor: '#fbbf24' };
      default:
        return { textColor: 'text-gray-600', bgColor: 'bg-gray-100', iconColor: '#6b7280' };
    }
  };

  const filterAppointments = (appointments: Appointment[]) => {
    if (!searchQuery.trim()) return appointments;

    return appointments.filter((appointment) => {
      const patientName = appointment.patient.fullname.toLowerCase();
      const doctorName = appointment.doctor.user.fullname.toLowerCase();
      const appointmentId = appointment.appointmentID.toString();
      const query = searchQuery.toLowerCase();

      return (
        patientName.includes(query) || doctorName.includes(query) || appointmentId.includes(query)
      );
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
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
        {/* Status indicator strip at the top */}
        <View className={`h-1 w-full ${statusConfig.bgColor}`} />

        <View className="p-4">
          {/* Header with ID and Status */}
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-lg font-bold text-gray-800">#{item.appointmentID}</Text>
            </View>
            <View
              className={`flex-row items-center rounded-full ${statusConfig.bgColor} px-3 py-1`}>
              <FontAwesomeIcon icon={faCircle} size={8} color={statusConfig.iconColor} />
              <Text className={`ml-1 text-xs font-medium ${statusConfig.textColor}`}>
                {item.status}
              </Text>
            </View>
          </View>

          {/* Appointment Info Grid */}
          <View className="space-y-2">
            {/* Date/Time */}
            <View className="flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-cyan-100">
                <FontAwesomeIcon icon={faCalendarAlt} size={14} color="#0d9488" />
              </View>
              <Text className="ml-3 flex-1 text-sm text-gray-700">
                {formatLocaleDateTime(item.appointmentDate)}
              </Text>
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

            {/* Service Type */}
            <View className="flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <FontAwesomeIcon icon={faClipboardList} size={14} color="#3b82f6" />
              </View>
              <Text className="ml-3 flex-1 text-sm text-gray-700">
                {item.appointmentType || 'NEW VISIT'}
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

  // Render sort dropdown menu
  const renderSortOptions = () => {
    let currentSort;
    switch (index) {
      case 0:
        currentSort = currentPendingSort;
        break;
      case 1:
        currentSort = currentActiveSort;
        break;
      case 2:
        currentSort = currentHistorySort;
        break;
      default:
        currentSort = currentPendingSort;
    }

    return (
      <View className="absolute right-4 top-14 z-10 rounded-lg bg-white p-2 shadow-lg">
        <TouchableOpacity
          className={`flex-row items-center p-3 ${currentSort === SORT_OPTIONS.DATE_DESC ? 'bg-cyan-50' : ''}`}
          onPress={() => handleSortChange(SORT_OPTIONS.DATE_DESC)}>
          <FontAwesomeIcon icon={faSortDown} size={16} color="#0891b2" />
          <Text className="ml-2 text-gray-800">Latest first</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-row items-center p-3 ${currentSort === SORT_OPTIONS.DATE_ASC ? 'bg-cyan-50' : ''}`}
          onPress={() => handleSortChange(SORT_OPTIONS.DATE_ASC)}>
          <FontAwesomeIcon icon={faSortUp} size={16} color="#0891b2" />
          <Text className="ml-2 text-gray-800">Earliest first</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-row items-center p-3 ${currentSort === SORT_OPTIONS.STATUS ? 'bg-cyan-50' : ''}`}
          onPress={() => handleSortChange(SORT_OPTIONS.STATUS)}>
          <FontAwesomeIcon icon={faSort} size={16} color="#0891b2" />
          <Text className="ml-2 text-gray-800">By status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-row items-center p-3 ${currentSort === SORT_OPTIONS.PATIENT_NAME ? 'bg-cyan-50' : ''}`}
          onPress={() => handleSortChange(SORT_OPTIONS.PATIENT_NAME)}>
          <FontAwesomeIcon icon={faUserAlt} size={16} color="#0891b2" />
          <Text className="ml-2 text-gray-800">By patient name</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-row items-center p-3 ${currentSort === SORT_OPTIONS.DOCTOR_NAME ? 'bg-cyan-50' : ''}`}
          onPress={() => handleSortChange(SORT_OPTIONS.DOCTOR_NAME)}>
          <FontAwesomeIcon icon={faUserDoctor} size={16} color="#0891b2" />
          <Text className="ml-2 text-gray-800">By doctor name</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSortButton = () => (
    <TouchableOpacity
      className="flex-row items-center px-3 py-2"
      onPress={() => setShowSortOptions(!showSortOptions)}>
      <FontAwesomeIcon icon={faSort} size={16} color="#fff" />
    </TouchableOpacity>
  );

  const renderSearchBar = () => (
    <View className="mb-2 bg-white px-4 py-2">
      <View className="flex-row items-center rounded-lg bg-gray-100 px-3 py-2">
        <FontAwesomeIcon icon={faSearch} size={16} color="#6b7280" />
        <TextInput
          className="ml-2 flex-1 text-gray-800"
          placeholder="Search by patient or doctor name..."
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

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: '#0891b2' }}
      style={{
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
      labelStyle={{ color: '#000', fontWeight: 'bold' }}
      activeColor="#0891b2"
      inactiveColor="#6b7280"
    />
  );

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'pending':
        return (
          <View className="flex-1">
            {renderSearchBar()}
            <View className="flex-1 px-4">
              {filterAppointments(pendingData).length > 0 ? (
                <FlatList
                  data={filterAppointments(pendingData)}
                  renderItem={renderAppointmentItem}
                  keyExtractor={(item) => item.appointmentID.toString()}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 16, paddingTop: 8 }}
                  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                />
              ) : (
                renderEmptyList()
              )}
            </View>
          </View>
        );
      case 'active':
        return (
          <View className="flex-1">
            {renderSearchBar()}
            <View className="flex-1 px-4">
              {filterAppointments(activeData).length > 0 ? (
                <FlatList
                  data={filterAppointments(activeData)}
                  renderItem={renderAppointmentItem}
                  keyExtractor={(item) => item.appointmentID.toString()}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 16, paddingTop: 8 }}
                  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
                  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
      <HeaderSection title="Clinic Appointments" rightElement={renderSortButton()} />

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

export default ClinicAppointmentScreen;
