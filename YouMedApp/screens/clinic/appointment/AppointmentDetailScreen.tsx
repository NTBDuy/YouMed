import { useContext, useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import {
  fetchAppointmentDetail,
  rescheduleAppointment,
  updateAppointmentStatus,
  fetchRequestServiceList,
  updateServiceStatus,
  updateServiceResult,
} from 'utils/apiUtils';
import { useNotification } from 'contexts/NotificationContext';
import { AuthContext } from 'contexts/AuthContext';

import HeaderSection from 'components/HeaderSection';
import InfoItem from 'components/appointment/InfoItem';
import SectionHeader from 'components/appointment/SectionHeader';
import DateTimeField from 'components/DateTimeField';
import DateTimePickerModal from 'components/DateTimePickerModal';

import { formatDate, formatDatetime, formatTime } from 'utils/datetimeUtils';
import { notifyAppointmentCancelled, notifyAppointmentReScheduled } from 'utils/notificationUtils';
import { getGenderText } from 'utils/userHelpers';
import { Appointment } from 'types/Appointment';
import { AppointmentClinicalServices } from 'types/AppointmentClinicalServices';

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-orange-100 text-orange-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Scheduled':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const [bg, text] = getStatusColor(status).split(' ');

  return (
    <View className={`rounded-full px-3 py-1 ${bg}`}>
      <Text className={`text-xs font-medium ${text}`}>{status}</Text>
    </View>
  );
};

const AppointmentDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { appointmentID } = route.params as { appointmentID: number };
  const { user } = useContext(AuthContext);
  const { refreshUnreadCount } = useNotification();

  const [appointment, setAppointment] = useState<Appointment>();
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  // Các state cho phần xử lý yêu cầu xét nghiệm
  const [appointmentServices, setAppointmentServices] = useState<AppointmentClinicalServices[]>([]);
  const [selectedService, setSelectedService] = useState<AppointmentClinicalServices | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultSummary, setResultSummary] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [recommendations, setRecommendations] = useState('');

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (appointmentID) {
      getServiceList(appointmentID);
    }
  }, [appointmentID]);

  const getData = async () => {
    try {
      setLoading(true);
      const response = await fetchAppointmentDetail(appointmentID);
      if (response.ok) {
        const data = await response.json();
        setAppointment(data);
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy danh sách yêu cầu xét nghiệm
  const getServiceList = async (appointmentID: number) => {
    try {
      const response = await fetchRequestServiceList(appointmentID);
      if (response.ok) {
        const data = await response.json();
        setAppointmentServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  // Hàm bắt đầu xét nghiệm
  const handleStartService = async (service: AppointmentClinicalServices) => {
    try {
      const response = await updateServiceStatus(service.id, 'IN PROGRESS');
      console.log('Service status updated:', response);
      if (response.ok) {
        Alert.alert('Success', 'Examination started');
        getServiceList(appointmentID);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not start examination');
    }
  };

  // Hàm mở modal nhập kết quả xét nghiệm
  const handleOpenResultInput = (service: AppointmentClinicalServices) => {
    setSelectedService(service);
    setResultSummary('');
    setConclusion('');
    setRecommendations('');
    setShowResultModal(true);
  };

  // Hàm lưu kết quả xét nghiệm
  const handleSubmitResult = async () => {
    if (!selectedService || !resultSummary) {
      Alert.alert('Error', 'Summary result is required');
      return;
    }

    try {
      const resultData = {
        resultSummary,
        conclusion,
        recommendations,
      };

      const response = await updateServiceResult(selectedService.id, resultData);
      if (response.ok) {
        // Gửi thông báo đến bác sĩ
        // await notifyServiceCompleted(appointment!.doctorID, refreshUnreadCount);
        Alert.alert('Success', 'Result submitted successfully');
        setShowResultModal(false);
        getServiceList(appointmentID);
      } else {
        Alert.alert('Error', 'Failed to submit result');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred');
    }
  };

  const handleCallPatient = () => {
    const phone = appointment?.patient?.phoneNumber;
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleConfirmAppointment = async () => {
    try {
      const response = await updateAppointmentStatus(appointmentID, 'Scheduled');
      if (response.ok) {
        Alert.alert('Confirmed', 'Appointment confirmed successfully');
        getData();
      }
    } catch (error) {
      Alert.alert('Error', 'Could not confirm appointment');
    }
  };

  const handleCancelAppointment = async () => {
    try {
      const response = await updateAppointmentStatus(appointmentID, 'Cancelled');
      if (response.ok) {
        await notifyAppointmentCancelled(appointment!.patient.userID, refreshUnreadCount);
        Alert.alert('Cancelled', 'Appointment cancelled successfully');
        getData();
      }
    } catch (error) {
      Alert.alert('Error', 'Could not cancel appointment');
    }
  };

  const handleRescheduleAppointment = async () => {
    try {
      const newDateTime = new Date(date);
      newDateTime.setHours(time.getHours(), time.getMinutes());

      const utcDateTime = new Date(newDateTime.getTime() - newDateTime.getTimezoneOffset() * 60000);
      const response = await rescheduleAppointment(appointmentID, {
        appointmentDate: utcDateTime.toISOString(),
        symptomNote: appointment?.symptomNote,
      });

      if (response.ok) {
        await notifyAppointmentReScheduled(appointment!.patient.userID, refreshUnreadCount);
        Alert.alert('Rescheduled', 'Appointment rescheduled successfully');
        getData();
      }
    } catch (error) {
      Alert.alert('Error', 'Could not reschedule appointment');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!appointment) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Appointment not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <HeaderSection
        backBtn
        customTitle={
          <Text className="text-base font-bold text-white">Appointment #{appointmentID}</Text>
        }
        rightElement={<StatusBadge status={appointment.status} />}
      />
      <ScrollView className="-mb-10 flex-1 p-4">
        <View className="rounded-lg bg-white p-4 shadow-sm">
          <SectionHeader title="Patient Information" icon="body" color="#0891b2" />
          <InfoItem label="Full Name" value={appointment.patient.fullname} />
          <InfoItem label="DOB" value={formatDate(appointment.patient.dateOfBirth)} />
          <InfoItem label="Gender" value={getGenderText(appointment.patient.gender)} />
          <InfoItem label="Phone" value={appointment.patient.phoneNumber} />
          <InfoItem label="Address" value={appointment.patient.homeAddress} />
          <InfoItem label="ID Card" value={appointment.patient.citizenID} />

          <Pressable className="mt-4 rounded-lg bg-pink-600 p-3" onPress={handleCallPatient}>
            <Text className="text-center font-medium text-white">Call Patient</Text>
          </Pressable>
        </View>

        <View className="mt-4 rounded-lg bg-white p-4 shadow-sm">
          <SectionHeader title="Appointment Time" icon="calendar" color="#0891b2" />
          <InfoItem label="Scheduled Time" value={formatDatetime(appointment.appointmentDate)} />

          {(appointment.status === 'Pending' || appointment.status === 'Scheduled') && (
            <View className="mt-4">
              <DateTimeField
                label="New Date"
                value={formatDate(date)}
                icon="calendar-outline"
                onPress={() => setShowDatePicker(true)}
              />
              <DateTimeField
                label="Time"
                value={formatTime(time)}
                icon="time-outline"
                onPress={() => setShowTimePicker(true)}
              />
              <Pressable
                className="mt-4 rounded-lg bg-cyan-600 p-3"
                onPress={handleRescheduleAppointment}>
                <Text className="text-center font-medium text-white">Reschedule</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View className="mt-4 rounded-lg bg-white p-4 shadow-sm">
          <SectionHeader title="Symptoms" icon="fitness" color="#0891b2" />
          <Text className="mt-2 text-gray-700">
            {appointment.symptomNote || 'No symptoms provided'}
          </Text>
        </View>

        <View className="mt-4 rounded-lg bg-white p-4 shadow-sm">
          <SectionHeader title="Doctor Information" icon="medkit" color="#0891b2" />
          <InfoItem label="Doctor" value={appointment.doctor?.user.fullname || 'Not Assigned'} />
        </View>


        {appointment.status === 'In Progress' && (
          <View className="mt-4 rounded-lg bg-white p-4 shadow-sm">
            <SectionHeader title="Requested Examinations" icon="flask" color="#0891b2" />

            {appointmentServices.length === 0 ? (
              <Text className="mt-2 italic text-gray-500">No examinations requested</Text>
            ) : (
              appointmentServices.map((service) => (
                <View key={service.id} className="mb-3 rounded-lg border border-gray-200">
                  <View className="flex-row items-center justify-between border-b border-gray-200 bg-gray-50 p-3">
                    <Text className="font-medium text-gray-800">
                      {service.clinicalService?.name}
                    </Text>
                    <StatusBadge status={service.status} />
                  </View>

                  <View className="p-3">
                    <Text className="mb-2 text-sm text-gray-500">
                      <Text className="font-medium">Note: </Text>
                      {service.note || 'No specific notes'}
                    </Text>

                    {service.status === 'PENDING' && (
                      <Pressable
                        className="self-end rounded-lg bg-orange-500 px-3 py-2"
                        onPress={() => handleStartService(service)}>
                        <Text className="text-sm font-medium text-white">Start Examination</Text>
                      </Pressable>
                    )}

                    {service.status === 'IN PROGRESS' && (
                      <Pressable
                        className="self-end rounded-lg bg-green-500 px-3 py-2"
                        onPress={() => handleOpenResultInput(service)}>
                        <Text className="text-sm font-medium text-white">Submit Result</Text>
                      </Pressable>
                    )}

                    {service.status === 'COMPLETED' && (
                      <View>
                        <Text className="font-medium text-gray-700">Result Summary:</Text>
                        <Text className="mb-2 text-gray-600">{service.resultSummary}</Text>

                        {service.conclusion && (
                          <>
                            <Text className="font-medium text-gray-700">Conclusion:</Text>
                            <Text className="mb-2 text-gray-600">{service.conclusion}</Text>
                          </>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Hiển thị kết quả xét nghiệm cho các trạng thái khác */}
        {appointment.status !== 'In Progress' && appointment.appointmentService === 'COMPLETED' && (
          <View className="mt-4 rounded-lg bg-white p-4 shadow-sm">
            <SectionHeader title="Examination Results" icon="flask" color="#0891b2" />

            {appointmentServices.length === 0 ? (
              <Text className="mt-2 italic text-gray-500">No examinations were performed</Text>
            ) : (
              appointmentServices.map((service) => (
                <View key={service.id} className="mb-3 rounded-lg border border-gray-200">
                  <View className="flex-row items-center justify-between border-b border-gray-200 bg-gray-50 p-3">
                    <Text className="font-medium text-gray-800">
                      {service.clinicalService?.name}
                    </Text>
                    <StatusBadge status={service.status} />
                  </View>

                  {service.status === 'COMPLETED' && (
                    <View className="p-3">
                      <Text className="font-medium text-gray-700">Result Summary:</Text>
                      <Text className="mb-2 text-gray-600">{service.resultSummary}</Text>

                      {service.conclusion && (
                        <>
                          <Text className="font-medium text-gray-700">Conclusion:</Text>
                          <Text className="mb-2 text-gray-600">{service.conclusion}</Text>
                        </>
                      )}
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {appointment.status === 'Pending' && (
          <View className="my-6 flex-row justify-between">
            <Pressable
              className="w-[48%] rounded-lg bg-blue-600 p-3"
              onPress={handleConfirmAppointment}>
              <Text className="text-center font-medium text-white">Confirm</Text>
            </Pressable>
            <Pressable
              className="flex-end w-[48%] rounded-lg bg-red-600 p-3"
              onPress={handleCancelAppointment}>
              <Text className="text-center font-medium text-white">Cancel</Text>
            </Pressable>
          </View>
        )}

        {appointment.status === 'Scheduled' && (
          <View className="my-6 flex-row justify-between">
            <Pressable
              className="flex-end w-[98%] rounded-lg bg-red-600 p-3"
              onPress={handleCancelAppointment}>
              <Text className="text-center font-medium text-white">Cancel</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Modal nhập kết quả xét nghiệm */}
      <Modal
        visible={showResultModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowResultModal(false)}>
        <View className="flex-1 justify-end bg-black/30">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? -32 : 0}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
              keyboardShouldPersistTaps="handled">
              <View className="rounded-t-xl bg-white">
                  <View className="p-6">
                    <Text className="mb-4 text-lg font-semibold text-gray-800">
                      Enter Examination Results
                    </Text>

                    <View className="space-y-4">
                      <View>
                        <Text className="mb-1 text-sm font-medium text-gray-700">
                          Result Summary (Required)
                        </Text>
                        <TextInput
                          className="rounded-lg border border-gray-300 p-3 text-sm"
                          placeholder="Enter brief summary of results"
                          value={resultSummary}
                          onChangeText={setResultSummary}
                        />
                      </View>

                      <View>
                        <Text className="mb-1 text-sm font-medium text-gray-700">
                        Conclusion
                        </Text>
                        <TextInput
                          className="rounded-lg border border-gray-300 p-3 text-sm"
                          placeholder="Enter conclusion"
                          value={conclusion}
                          onChangeText={setConclusion}
                          multiline
                          numberOfLines={4}
                        />
                      </View>

                      <View>
                        <Text className="mb-1 text-sm font-medium text-gray-700">Recommendations</Text>
                        <TextInput
                          className="rounded-lg border border-gray-300 p-3 text-sm"
                          placeholder="Recommendations"
                          value={recommendations}
                          onChangeText={setRecommendations}
                          multiline
                          numberOfLines={2}
                        />
                      </View>
                    </View>

                    <View className="mb-10 mt-6 flex-row justify-between">
                      <Pressable
                        className="rounded-lg border border-gray-300 px-6 py-3"
                        onPress={() => setShowResultModal(false)}>
                        <Text className="text-sm font-medium text-gray-700">Cancel</Text>
                      </Pressable>
                      <Pressable
                        className="rounded-lg bg-blue-600 px-6 py-3"
                        onPress={handleSubmitResult}>
                        <Text className="text-sm font-bold text-white">Submit</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <DateTimePickerModal
        visible={showDatePicker}
        value={date}
        mode="date"
        minimumDate={new Date()}
        title="Select Date"
        onClose={() => setShowDatePicker(false)}
        onChange={(newDate) => setDate(newDate)}
      />
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

export default AppointmentDetailScreen;
