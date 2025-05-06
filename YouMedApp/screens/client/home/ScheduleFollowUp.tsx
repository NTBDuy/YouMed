import { useContext, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from 'contexts/AuthContext';
import { useNotification } from 'contexts/NotificationContext';
import { createAppointment, updateFollowUpStatus } from 'utils/apiUtils';
import { notifyAppointmentBooked } from 'utils/notificationUtils';
import HeaderSection from 'components/HeaderSection';
import DateTimePickerModal from 'components/DateTimePickerModal';
import DateTimeField from 'components/DateTimeField';
import { formatDate, formatTime } from 'utils/datetimeUtils';
import { getGenderText } from 'utils/userHelpers';
import SectionHeader from 'components/appointment/SectionHeader';
import InfoItem from 'components/appointment/InfoItem';
import { MedicalRecord } from 'types/MedicalRecord';

function ScheduleFollowUp() {
  const route = useRoute();
  const { record } = route.params as { record: MedicalRecord };
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);
  const { refreshUnreadCount } = useNotification();
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [symptomNote, setSymptomNote] = useState(record.appointment.symptomNote || '');

  const handleBooking = async () => {
    try {
      setIsLoading(true);
      const combinedDate = new Date(date);
      combinedDate.setHours(time.getHours(), time.getMinutes());
      const utcDate = new Date(combinedDate.getTime() - combinedDate.getTimezoneOffset() * 60000);

      const appointmentData = {
        patientID: record.patientID,
        clinicID: record.appointment.clinicID,
        doctorID: record.doctorID,
        appointmentDate: utcDate.toISOString(),
        symptomNote: symptomNote,
        appointmentType: 'FOLLOW_UP',
        relatedAppointmentID: record.appointmentID,
      };

      console.log('Booking appointment with data:', appointmentData);

      const response = await createAppointment(appointmentData);

      console.log('Response:', response);

      if (response.ok) {
        if (user) {
          await notifyAppointmentBooked(user.userID, refreshUnreadCount);
        }

        await updateFollowUpStatus(record.recordID);

        Alert.alert('Success', 'Follow-up appointment booked successfully', [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Appointment' }],
              });
              navigation.navigate('Appointment');
            },
          },
        ]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Unable to book follow-up appointment');
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', 'Failed to book follow-up appointment. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <HeaderSection title="Book Follow-up Appointment" backBtn />

      <ScrollView className="-mb-10 flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Clinic Information */}
        <View className="mx-4 mt-4 rounded-xl bg-white p-4 shadow-sm">
          <Text className="text-lg font-bold text-blue-800">{record.appointment.clinic?.name}</Text>
          <View className="mt-3">
            <View className="flex-row items-start">
              <Ionicons name="location-outline" size={18} color="#2563eb" />
              <Text className="ml-2 flex-1 text-sm text-gray-700">
                {record.appointment.clinic?.clinicAddress}
              </Text>
            </View>
            <View className="mt-2 flex-row items-center">
              <Ionicons name="call-outline" size={18} color="#2563eb" />
              <Text className="ml-2 text-sm font-medium text-blue-600">
                {record.appointment.clinic?.phoneNumber}
              </Text>
            </View>
          </View>
        </View>

        {/* Doctor Information */}
        <View className="mx-4 mt-4 rounded-xl bg-white p-4 shadow-sm">
          <SectionHeader title="Doctor Information" icon="medical" color="#2563eb" />
          <InfoItem label="Full Name" value={record.doctor.user.fullname} />
          <InfoItem label="Experience" value={`${record.doctor.experience} years of experience`} />
          <InfoItem label="Contact" value={record.doctor.user.phoneNumber} />
        </View>

        {/* Appointment Scheduling */}
        <View className="mx-4 mt-4 rounded-xl bg-white p-4 shadow-sm">
          <SectionHeader title="Follow-up Time" icon="calendar" color="#2563eb" />

          <DateTimeField
            label="Date"
            value={formatDate(date)}
            required={true}
            icon="calendar-outline"
            onPress={() => setShowDatePicker(true)}
          />

          <DateTimeField
            label="Time"
            value={formatTime(time)}
            required={true}
            icon="time-outline"
            onPress={() => setShowTimePicker(true)}
          />
        </View>

        {/* Symptom Description */}
        <View className="mx-4 mt-4 rounded-xl bg-white p-4 shadow-sm">
          <SectionHeader title="Symptom Description" icon="document-text" color="#2563eb" />

          <TextInput
            className="min-h-32 rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-800"
            placeholder="Please describe your symptoms..."
            multiline={true}
            value={symptomNote}
            onChangeText={setSymptomNote}
            textAlignVertical="top"
          />
        </View>

        {/* Patient Information */}
        <View className="mx-4 mt-4 rounded-xl bg-white p-4 shadow-sm">
          <SectionHeader title="Patient Information" icon="person" color="#2563eb" />
          <InfoItem label="Full Name" value={record.patient.fullname} />
          <InfoItem label="Date of Birth" value={formatDate(record.patient.dateOfBirth)} />
          <InfoItem label="Gender" value={getGenderText(record.patient.gender)} />
          <InfoItem label="ID Number" value={record.patient.citizenID} />
          <InfoItem label="Phone" value={record.patient.phoneNumber || 'No information'} />
        </View>

        {/* Previous Diagnosis */}
        <View className="mx-4 mt-4 rounded-xl bg-white p-4 shadow-sm">
          <SectionHeader title="Previous Appointment Info" icon="clipboard" color="#2563eb" />
          <InfoItem
            label="Appointment Date"
            value={formatDate(record.appointment.appointmentDate)}
          />
          <InfoItem label="Diagnosis" value={record.diagnosis || 'No information'} />
          <InfoItem label="Prescription" value={record?.prescription || 'No information'} />
          <InfoItem label="Notes" value={record.notes || 'No information'} />
        </View>

        {/* Booking Button */}
        <View className="mx-4 mb-8 mt-6">
          <TouchableOpacity
            className={`flex-row items-center justify-center rounded-xl p-4 ${
              isLoading ? 'bg-blue-400' : 'bg-blue-600'
            }`}
            onPress={handleBooking}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="calendar" size={20} color="#FFFFFF" />
            )}
            <Text className="ml-2 text-center text-base font-bold text-white">
              {isLoading ? 'Processing...' : 'Confirm Booking'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        visible={showDatePicker}
        value={date}
        mode="date"
        title="Select Follow-up Date"
        minimumDate={new Date()}
        onClose={() => setShowDatePicker(false)}
        onChange={(newDate) => setDate(newDate)}
      />

      {/* Time Picker Modal */}
      <DateTimePickerModal
        visible={showTimePicker}
        value={time}
        mode="time"
        title="Select Follow-up Time"
        minuteInterval={15}
        onClose={() => setShowTimePicker(false)}
        onChange={(newTime) => setTime(newTime)}
      />
    </SafeAreaView>
  );
}

export default ScheduleFollowUp;
