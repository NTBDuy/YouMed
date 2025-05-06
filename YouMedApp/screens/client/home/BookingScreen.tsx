import {
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useCallback, useContext, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from 'contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { createAppointment, fetchDoctorsByClinicID, fetchClientPatients } from 'utils/apiUtils';
import { useNotification } from 'contexts/NotificationContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUserDoctor, faUser } from '@fortawesome/free-solid-svg-icons';
import { notifyAppointmentBooked } from 'utils/notificationUtils';
import HeaderSection from 'components/HeaderSection';
import { formatDate, formatTime } from 'utils/datetimeUtils';
import { getGenderText } from 'utils/userHelpers';
import DateTimePickerModal from 'components/DateTimePickerModal';
import DateTimeField from 'components/DateTimeField';
import { Clinic } from 'types/Clinic';
import { Doctor } from 'types/Doctor';
import { Patient } from 'types/Patient';

const BookingScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { refreshUnreadCount } = useNotification();

  const { user } = useContext(AuthContext);
  const { clinic } = route.params as { clinic: Clinic };

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [symptomNote, setSymptomNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDoctorDetails, setShowDoctorDetails] = useState(false);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDoctors, setIsFetchingDoctors] = useState(false);
  const [isFetchingPatients, setIsFetchingPatients] = useState(false);

  const fetchDoctors = async () => {
    try {
      setIsFetchingDoctors(true);
      const res = await fetchDoctorsByClinicID(clinic.clinicID);
      if (res.ok) {
        const data = await res.json();
        console.log('Fetched doctor data:', data);
        setDoctors(data);
        if (data.length > 0) {
          setSelectedDoctor(data[0]);
        }
      } else {
        console.log('Failed to fetch doctors');
        Alert.alert('Error', 'Failed to load doctors. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      Alert.alert('Error', 'Failed to load doctors. Please try again later.');
    } finally {
      setIsFetchingDoctors(false);
    }
  };

  const fetchPatients = async () => {
    try {
      setIsFetchingPatients(true);
      const res = await fetchClientPatients(user!.userID);
      if (res.ok) {
        const data = await res.json();
        console.log('Fetched patient data:', data);
        setPatients(data);
        if (data.length > 0) {
          setSelectedPatient(data[0]);
        }
      } else {
        console.log('Failed to fetch patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsFetchingPatients(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedDoctor) {
      Alert.alert('Notification', 'Please select a doctor');
      return;
    }

    if (!selectedPatient) {
      Alert.alert('Notification', 'Please select a patient');
      return;
    }

    try {
      setIsLoading(true);
      const combinedDate = new Date(date);
      combinedDate.setHours(time.getHours(), time.getMinutes());
      const utcDate = new Date(combinedDate.getTime() - combinedDate.getTimezoneOffset() * 60000);
      const appointmentData = {
        patientID: selectedPatient.patientID,
        clinicID: clinic.clinicID,
        doctorID: selectedDoctor.doctorID,
        appointmentDate: utcDate.toISOString(),
        symptomNote: symptomNote,
        AppointmentType : "NEW_VISIT"
      };

      const response = await createAppointment(appointmentData);

      if (response.ok) {
        await notifyAppointmentBooked(user!.userID, refreshUnreadCount);
        Alert.alert('Success', 'Appointment booked successfully', [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Homepage' }],
              });
              navigation.navigate('Appointment');
            },
          },
        ]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', 'Could not book the appointment. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDoctors();
      fetchPatients();
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <HeaderSection title="Book Appointment" backBtn />

      <ScrollView className="-mb-10 p-4" contentContainerClassName="pb-10">
        {/* Clinic Information */}
        <View className="mb-5 rounded-lg bg-white p-4 shadow-sm">
          <Text className="text-2xl font-bold text-blue-800">{clinic.name}</Text>
          <View className="mt-4">
            <View className="flex-row items-start">
              <Ionicons name="location-outline" size={18} color="#6B7280" />
              <Text className="ml-2 flex-1 text-gray-700">{clinic.clinicAddress}</Text>
            </View>
            <View className="mt-3 flex-row items-start">
              <Ionicons name="call-outline" size={18} color="#6B7280" />
              <Text className="ml-2 font-medium text-blue-600">{clinic.phoneNumber}</Text>
            </View>
            {clinic.specialties.length > 0 && (
              <View className="mt-3">
                <Text className="mb-2 font-medium text-gray-600">Specialties:</Text>
                <View className="flex-row flex-wrap">
                  {clinic.specialties.map((specialty, index) => (
                    <View
                      key={index}
                      className="mb-1 mr-2 rounded-lg border border-blue-100 bg-blue-100 px-3 py-1">
                      <Text className="text-xs font-medium text-blue-700">{specialty.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Patient Selection */}
        <View className="mb-5">
          <Text className="mb-2 font-medium text-gray-700">
            Select Patient <Text className="text-red-600">*</Text>
          </Text>

          {isFetchingPatients ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="mt-2 text-gray-600">Loading patients...</Text>
            </View>
          ) : patients.length === 0 ? (
            <View className="rounded-lg border border-gray-300 bg-white p-4">
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('AddPatient');
                }}>
                <Text className="text-center text-gray-500">
                  No patients available. <Text className="text-blue-600">Create here!</Text>
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
              {patients.map((patient, index) => (
                <TouchableOpacity
                  key={patient.patientID}
                  className={`mr-3 w-36 items-center rounded-lg border p-3 ${
                    selectedPatient?.patientID === patient.patientID
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-gray-200 bg-white'
                  }`}
                  onPress={() => setSelectedPatient(patient)}>
                  <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                    <FontAwesomeIcon icon={faUser} size={18} color="white" />
                  </View>
                  <Text className="text-center font-medium text-gray-800">{patient.fullname}</Text>
                  <Text className="text-center text-xs text-gray-500">
                    {patient.relationship || 'Self'}
                  </Text>
                  {selectedPatient?.patientID === patient.patientID && (
                    <TouchableOpacity
                      className="mt-2 rounded-lg bg-blue-100 py-1"
                      onPress={() => setShowPatientDetails(true)}>
                      <Text className="text-center text-xs font-medium text-blue-700">
                        View Profile
                      </Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Doctor Selection */}
        <View className="mb-5">
          <Text className="mb-2 font-medium text-gray-700">
            Select Doctor <Text className="text-red-600">*</Text>
          </Text>

          {isFetchingDoctors ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="mt-2 text-gray-600">Loading doctors...</Text>
            </View>
          ) : doctors.length === 0 ? (
            <View className="rounded-lg border border-gray-300 bg-white p-4">
              <Text className="text-center text-gray-500">No doctors available at this clinic</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
              {doctors.map((doctor, index) => (
                <TouchableOpacity
                  key={doctor.doctorID}
                  className={`mr-3 w-36 items-center rounded-lg border p-3 ${
                    selectedDoctor?.doctorID === doctor.doctorID
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-gray-200 bg-white'
                  }`}
                  onPress={() => setSelectedDoctor(doctor)}>
                  <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                    <FontAwesomeIcon icon={faUserDoctor} size={18} color="white" />
                  </View>
                  <Text className="text-center font-medium text-gray-800">
                    {doctor.user.fullname}
                  </Text>
                  {selectedDoctor?.doctorID === doctor.doctorID && (
                    <TouchableOpacity
                      className="mt-2 rounded-lg bg-blue-100 py-1"
                      onPress={() => setShowDoctorDetails(true)}>
                      <Text className="text-center text-xs font-medium text-blue-700">
                        View Profile
                      </Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
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
        <View className="mb-5">
          <Text className="mb-2 font-medium text-gray-700">Symptom Description</Text>
          <TextInput
            className="min-h-32 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800"
            placeholder="Please describe your symptoms..."
            multiline={true}
            value={symptomNote}
            onChangeText={setSymptomNote}
            textAlignVertical="top"
          />
        </View>

        {/* Booking Button */}
        <View className="mb-4">
          <TouchableOpacity
            className={`rounded-xl p-4 ${isLoading ? 'bg-blue-300' : 'bg-blue-600'}`}
            onPress={handleBooking}
            disabled={isLoading || !selectedDoctor || !selectedPatient}>
            <Text className="text-center text-lg font-bold text-white">
              {isLoading ? 'Processing...' : 'Confirm Appointment'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Note */}
        <View className="mb-6 rounded-lg bg-yellow-50 p-4">
          <Text className="text-sm text-gray-700">
            <Text className="font-bold">Note:</Text> After booking, the clinic will confirm and may
            contact you to adjust the time if necessary.
          </Text>
        </View>
      </ScrollView>

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

      {/* Doctor Details Modal */}
      <Modal
        visible={showDoctorDetails && selectedDoctor !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDoctorDetails(false)}>
        <View className="flex-1 justify-end bg-black/30">
          <View className="h-3/4 rounded-t-xl bg-white">
            <View className="w-full border-b border-gray-200 p-4">
              <Text className="text-center text-lg font-medium">Doctor Profile</Text>
              <TouchableOpacity
                className="absolute right-4 top-4"
                onPress={() => setShowDoctorDetails(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedDoctor && (
              <ScrollView className="flex-1 p-4">
                <View className="mb-2 items-center">
                  <View className="mb-2 h-32 w-32 items-center justify-center rounded-full bg-blue-500">
                    <FontAwesomeIcon icon={faUserDoctor} size={32} color="white" />
                  </View>
                  <Text className="mt-3 text-xl font-bold">{selectedDoctor.user.fullname}</Text>
                </View>

                {selectedDoctor.introduction && (
                  <View className="mb-4">
                    <Text className="mb-1 font-bold text-gray-700">Introduction</Text>
                    <Text className="text-gray-600">{selectedDoctor.introduction}</Text>
                  </View>
                )}

                {selectedDoctor.experience && (
                  <View className="mb-4">
                    <Text className="mb-1 font-bold text-gray-700">Experience</Text>
                    <Text className="text-gray-600">{selectedDoctor.experience} years</Text>
                  </View>
                )}

                {selectedDoctor.user.email && (
                  <View className="mb-4">
                    <Text className="mb-1 font-bold text-gray-700">Email</Text>
                    <Text className="text-gray-600">{selectedDoctor.user.email}</Text>
                  </View>
                )}

                {selectedDoctor.user.phoneNumber && (
                  <View className="mb-4">
                    <Text className="mb-1 font-bold text-gray-700">Phone number</Text>
                    <Text className="text-gray-600">{selectedDoctor.user.phoneNumber}</Text>
                  </View>
                )}

                {selectedDoctor.specialties && (
                  <View className="mb-4">
                    <Text className="mb-1 font-bold text-gray-700">Specialties</Text>
                    {selectedDoctor.specialties.map((specialty, index) => (
                      <Text key={index} className="text-gray-600">
                        {specialty.name}
                      </Text>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  className="mt-4 rounded-lg bg-blue-600 py-3"
                  onPress={() => setShowDoctorDetails(false)}>
                  <Text className="text-center font-bold text-white">Select This Doctor</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Patient Details Modal */}
      <Modal
        visible={showPatientDetails && selectedPatient !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPatientDetails(false)}>
        <View className="flex-1 justify-end bg-black/30">
          <View className="h-2/3 rounded-t-xl bg-white">
            <View className="w-full border-b border-gray-200 p-4">
              <Text className="text-center text-lg font-medium">Patient Profile</Text>
              <TouchableOpacity
                className="absolute right-4 top-4"
                onPress={() => setShowPatientDetails(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedPatient && (
              <ScrollView className="flex-1 p-4">
                <View className="mb-4 items-center">
                  <View className="mb-2 h-32 w-32 items-center justify-center rounded-full bg-blue-500">
                    <FontAwesomeIcon icon={faUser} size={32} color="white" />
                  </View>
                  <Text className="mt-3 text-xl font-bold">{selectedPatient.fullname}</Text>
                  <Text className="text-gray-500">{selectedPatient.relationship || 'Self'}</Text>
                </View>

                {selectedPatient.user?.email && (
                  <View className="mb-4">
                    <Text className="mb-1 font-bold text-gray-700">Email</Text>
                    <Text className="text-gray-600">{selectedPatient.user.email}</Text>
                  </View>
                )}

                {selectedPatient.user?.phoneNumber && (
                  <View className="mb-4">
                    <Text className="mb-1 font-bold text-gray-700">Phone number</Text>
                    <Text className="text-gray-600">{selectedPatient.user.phoneNumber}</Text>
                  </View>
                )}

                {selectedPatient.dateOfBirth && (
                  <View className="mb-4">
                    <Text className="mb-1 font-bold text-gray-700">Date of Birth</Text>
                    <Text className="text-gray-600">
                      {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}
                    </Text>
                  </View>
                )}

                {selectedPatient.gender && (
                  <View className="mb-4">
                    <Text className="mb-1 font-bold text-gray-700">Gender</Text>
                    <Text className="text-gray-600">{getGenderText(selectedPatient.gender)}</Text>
                  </View>
                )}

                <TouchableOpacity
                  className="mt-4 rounded-lg bg-blue-600 py-3"
                  onPress={() => setShowPatientDetails(false)}>
                  <Text className="text-center font-bold text-white">Select This Patient</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default BookingScreen;
