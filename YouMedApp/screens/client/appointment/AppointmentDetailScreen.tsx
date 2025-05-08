import { useContext, useEffect, useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchAppointmentDetail, updateAppointmentStatus } from 'utils/apiUtils';
import { useNotification } from 'contexts/NotificationContext';
import { notifyAppointmentCancelled } from 'utils/notificationUtils';
import { AuthContext } from 'contexts/AuthContext';
import HeaderSection from 'components/HeaderSection';
import { formatLocaleDateTime } from 'utils/datetimeUtils';
import { Ionicons } from '@expo/vector-icons';
import Appointment from 'types/Appointment';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPhone, faLocationDot } from '@fortawesome/free-solid-svg-icons';

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'Completed';
      case 'Pending':
        return 'Pending';
      case 'Cancelled':
        return 'Cancelled';
      case 'Scheduled':
        return 'Scheduled';
      case 'In Progress':
        return 'In Progress';
    }
  };

  return (
    <View className={`rounded-full px-3 py-1 ${getStatusColor(status).split(' ')[0]}`}>
      <Text className={`text-xs font-medium ${getStatusColor(status).split(' ')[1]}`}>
        {getStatusText(status)}
      </Text>
    </View>
  );
};

const AppointmentInfoItem = ({
  icon,
  label,
  value,
  rightElement,
}: {
  icon: string;
  label: string;
  value: string;
  rightElement?: React.ReactNode;
}) => {
  return (
    <View className="flex-row items-center py-2">
      <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-100">
        <Ionicons name={icon as any} size={18} color="#2563eb" />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-xs text-gray-500">{label}</Text>
        <Text className="text-sm font-medium text-gray-700">{value}</Text>
      </View>
      {rightElement && <View className="ml-auto">{rightElement}</View>}
    </View>
  );
};

const AppointmentDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { appointmentID } = route.params as { appointmentID: number };
  const [appointment, setAppointment] = useState<Appointment>();
  const [loading, setLoading] = useState(true);
  const { refreshUnreadCount } = useNotification();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchAppointmentData();
  }, [appointmentID]);

  const fetchAppointmentData = async () => {
    try {
      setLoading(true);
      const response = await fetchAppointmentDetail(appointmentID);
      if (response.ok) {
        const data = await response.json();
        setAppointment(data);
      } else {
        console.log('Failed to fetch appointment');
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = () => {
    Alert.alert('Cancel Appointment', 'Are you sure you want to cancel this appointment?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await updateAppointmentStatus(appointmentID, 'Cancelled');
            if (response.ok) {
              Alert.alert('Success', 'Appointment cancelled successfully');
              await notifyAppointmentCancelled(user!.userID, refreshUnreadCount);
              fetchAppointmentData();
            } else {
              Alert.alert('Error', 'Unable to cancel the appointment');
            }
          } catch (error) {
            Alert.alert('Error', 'An error occurred while cancelling the appointment');
            console.error(error);
          }
        },
      },
    ]);
  };

  const handleRescheduleAppointment = () => {
    navigation.navigate('Reschedule', { appointmentID });
  };

  const handleViewMedicalRecords = () => {
    navigation.navigate('MedicalRecords', { appointmentID });
  };
  const handleCallPress = () => {
    if (!appointment?.clinic?.phoneNumber) return;

    const phoneNumber = appointment.clinic.phoneNumber;
    const phoneUrl = Platform.OS === 'android' ? `tel:${phoneNumber}` : `telprompt:${phoneNumber}`;
    Linking.openURL(phoneUrl).catch((err) => console.error('Error opening phone dialer:', err));
  };

  const handleMapPress = () => {
    if (!appointment?.clinic?.clinicAddress) return;

    const address = encodeURIComponent(appointment.clinic.clinicAddress);
    const url = Platform.OS === 'ios' ? `maps:0,0?q=${address}` : `geo:0,0?q=${address}`;
    Linking.openURL(url).catch((err) => console.error('Error opening maps:', err));
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  if (!appointment) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Failed to load appointment information</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <HeaderSection
        backBtn
        customTitle={
          <Text className="text-base font-semibold text-white">Appointment Details</Text>
        }
        rightElement={<StatusBadge status={appointment.status} />}
      />

      <ScrollView className="flex-1">
        {/* Main card with appointment info */}
        <View className="m-4 rounded-xl bg-white p-4 shadow-md">
          {/* Appointment date and time */}
          <View className="mb-4 rounded-lg bg-blue-50 p-4">
            <Text className="mb-1 text-sm font-medium text-blue-800">Appointment Time</Text>
            <Text className="text-lg font-bold text-blue-900">
              {formatLocaleDateTime(appointment.appointmentDate)}
            </Text>
          </View>

          {/* Doctor info */}
          <AppointmentInfoItem
            icon="person"
            label="Doctor in charge"
            value={appointment.doctor.user.fullname}
          />

          {/* Clinic info */}
          <AppointmentInfoItem
            icon="medical"
            label="Clinic"
            value={appointment.clinic!.name}
            rightElement={
              <Pressable
                className="flex flex-row items-center rounded-lg bg-blue-500 px-4 py-2 shadow-sm active:bg-blue-600"
                onPress={handleCallPress}>
                <FontAwesomeIcon icon={faPhone} size={14} color="#ffffff" />
                <Text className="ml-2 text-sm font-medium text-white">Call</Text>
              </Pressable>
            }
          />

          {/* Clinic address */}
          <AppointmentInfoItem
            icon="location"
            label="Address"
            value={appointment.clinic!.clinicAddress}
            rightElement={
              <Pressable
                className="flex flex-row items-center rounded-lg bg-blue-500 px-4 py-2 shadow-sm active:bg-blue-600"
                onPress={handleMapPress}>
                <FontAwesomeIcon icon={faLocationDot} size={14} color="#ffffff"/>
                <Text className="ml-2 text-sm font-medium text-white">Map</Text>
              </Pressable>
            }
          />

          {/* Symptom note, if exists */}
          {appointment.symptomNote && (
            <View className="mt-2 rounded-lg bg-gray-50 p-3">
              <Text className="text-xs text-gray-500">Reported Symptoms</Text>
              <Text className="text-sm text-gray-700">{appointment.symptomNote}</Text>
            </View>
          )}
        </View>

        {/* Action buttons */}
        {['Pending', 'Scheduled'].includes(appointment.status) && (
          <View className="mx-4 mb-8 mt-2 flex-row">
            <Pressable
              className="mr-2 flex-1 items-center rounded-lg bg-blue-600 py-4"
              onPress={handleRescheduleAppointment}>
              <Text className="font-medium text-white">Reschedule</Text>
            </Pressable>
            <Pressable
              className="ml-2 flex-1 items-center rounded-lg bg-red-600 py-4"
              onPress={handleCancelAppointment}>
              <Text className="font-medium text-white">Cancel</Text>
            </Pressable>
          </View>
        )}

        {appointment.status === 'Completed' && (
          <View className="mx-4 mb-8 mt-2">
            <Pressable
              className="items-center rounded-lg bg-blue-600 py-4"
              onPress={handleViewMedicalRecords}>
              <Text className="font-medium text-white">View Medical Records</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AppointmentDetailScreen;
