import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchAppointmentDetail, rescheduleAppointment } from 'utils/apiUtils';
import { formatDate, formatTime } from 'utils/datetimeUtils';
import { useNotification } from 'contexts/NotificationContext';
import { AuthContext } from 'contexts/AuthContext';
import { notifyAppointmentReScheduled } from 'utils/notificationUtils';
import HeaderSection from 'components/HeaderSection';
import DateTimeField from 'components/DateTimeField';
import DateTimePickerModal from 'components/DateTimePickerModal';
import Appointment from 'types/Appointment';

const RescheduleScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { appointmentID } = route.params as { appointmentID: number };

  const { refreshUnreadCount } = useNotification();

  const { user } = useContext(AuthContext);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [symptomNote, setSymptomNote] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(true);

  useEffect(() => {
    getData();
  }, [appointmentID]);

  const getData = async () => {
    try {
      setIsFetching(true);
      const res = await fetchAppointmentDetail(appointmentID);
      if (res.ok) {
        const data = await res.json();
        setAppointment(data);
        setSymptomNote(data.symptomNote);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleReschedule = async () => {
    try {
      setIsLoading(true);
      const combinedDate = new Date(date);
      combinedDate.setHours(time.getHours(), time.getMinutes());

      const utcDate = new Date(combinedDate.getTime() - combinedDate.getTimezoneOffset() * 60000);
      const appointmentData = {
        appointmentID: appointmentID,
        appointmentDate: utcDate.toISOString(),
        symptomNote: symptomNote,
      };

      const response = await rescheduleAppointment(appointmentID, appointmentData);
      if (response.ok) {
        await notifyAppointmentReScheduled(user!.userID, refreshUnreadCount);
        Alert.alert('Success', 'Appointment rescheduled successfully', [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Appointment' }],
              });
            },
          },
        ]);
      } else {
        throw new Error('Failed to reschedule appointment');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-100">
        <ActivityIndicator size="large" color="#0d9488" />
        <Text className="mt-4 text-gray-600">Loading appointment details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <HeaderSection title="Reschedule Appointment" backBtn />

      {appointment && (
        <ScrollView className="-mb-10 p-4">
          {/* Clinic Information */}
          <View className="mb-3">
            <Text className="text-2xl font-bold text-blue-800">{appointment.clinic!!.name}</Text>
            <View className="mt-4">
              <View className="flex-row items-start">
                <Text className="mr-2 text-gray-500">Address:</Text>
                <Text className="flex-1 text-gray-700">{appointment.clinic!.clinicAddress}</Text>
              </View>
              <View className="mt-3 flex-row items-start">
                <Text className="mr-2 text-gray-500">Phone:</Text>
                <Text className="font-medium text-blue-600">{appointment.clinic!.phoneNumber}</Text>
              </View>
            </View>
          </View>

          {/* Current Datetime */}
          <View className="mb-3 rounded-lg bg-blue-100 p-4">
            <Text className="font-medium text-blue-800">Current Appointment:</Text>
            <Text className="mt-1 text-gray-700">
              {appointment?.appointmentDate
                ? new Date(appointment.appointmentDate).toLocaleString()
                : 'N/A'}
            </Text>
          </View>

          {/* Date Selection */}
          <DateTimeField
            label="Date"
            value={formatDate(date)}
            required={true}
            icon="calendar-outline"
            onPress={() => setShowDatePicker(true)}
          />

          {/* Time Selection */}
          <DateTimeField
            label="Time"
            value={formatTime(time)}
            required={true}
            icon="time-outline"
            onPress={() => setShowTimePicker(true)}
          />

          {/* Symptom Description */}
          <View className="mb-3">
            <Text className="mb-2 font-medium text-gray-700">
              Symptom Description <Text className="text-red-600">*</Text>
            </Text>
            <TextInput
              className="min-h-32 rounded-lg border border-gray-300 bg-white px-4 py-2"
              placeholder="Please describe your symptoms..."
              multiline={true}
              value={symptomNote}
              onChangeText={setSymptomNote}
              textAlignVertical="top"
            />
          </View>

          {/* Button Action */}
          <View className="py-6">
            <Pressable
              className={`rounded-xl p-3 ${isLoading ? 'bg-blue-300' : 'bg-blue-600'}`}
              onPress={handleReschedule}
              disabled={isLoading}>
              <Text className="text-center text-lg font-bold text-white">
                {isLoading ? 'Processing...' : 'Confirm Reschedule'}
              </Text>
            </Pressable>
          </View>

          <View className="mb-6 rounded-lg bg-yellow-50 p-4">
            <Text className="text-sm text-gray-700">
              <Text className="font-bold">Note:</Text> After rescheduling, the clinic will confirm
              and may contact you to adjust the time if necessary.
            </Text>
          </View>
        </ScrollView>
      )}

      {/* Date Picker Modal */}
      <DateTimePickerModal
        visible={showDatePicker}
        value={date}
        mode="date"
        title="Select Date"
        minimumDate={new Date()}
        onClose={() => setShowDatePicker(false)}
        onChange={(newDate) => setDate(newDate)}
      />

      {/* Time Picker Modal */}
      <DateTimePickerModal
        visible={showTimePicker}
        value={time}
        mode="time"
        title="Select Time"
        minuteInterval={15}
        onClose={() => setShowTimePicker(false)}
        onChange={(newTime) => setTime(newTime)}
      />
    </SafeAreaView>
  );
};

export default RescheduleScreen;
