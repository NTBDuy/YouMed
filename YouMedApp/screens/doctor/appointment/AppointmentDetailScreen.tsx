import { useContext, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import {
  checkAllServicesCompleted,
  createRecord,
  fetchAppointmentDetail,
  fetchAppointmentRecord,
  fetchRecordIdByAppointment,
  fetchRequestServiceList,
  fetchServices,
  requestService,
  updateAppointmentStatus,
} from 'utils/apiUtils';
import HeaderSection from 'components/HeaderSection';
import { formatDate, formatDatetime } from 'utils/datetimeUtils';
import { getGenderText } from 'utils/userHelpers';
import DateTimeField from 'components/DateTimeField';
import DateTimePickerModal from 'components/DateTimePickerModal';
import TestResultModal from 'components/TestResultModal';
import { AuthContext } from 'contexts/AuthContext';
import { Appointment } from 'types/Appointment';
import { ClinicalServices } from 'types/ClinicalServices';
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
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <View className={`rounded-full px-3 py-1 ${getStatusColor(status).split(' ')[0]}`}>
      <Text className={`text-xs font-medium ${getStatusColor(status).split(' ')[1]}`}>
        {status}
      </Text>
    </View>
  );
};

const AppointmentDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { appointmentID } = route.params as { appointmentID: number };
  const { user } = useContext(AuthContext);
  const [appointment, setAppointment] = useState<Appointment>();
  const [previousRecordID, setPreviousRecordID] = useState<number | null>(null);
  const [services, setServices] = useState<ClinicalServices[]>([]);
  const [loading, setLoading] = useState(true);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedServices, setSelectedServices] = useState<{ id: number; note: string }[]>([]);
  const [appointmentService, setAppointmentService] = useState<AppointmentClinicalServices[]>([]);
  const [selectedResult, setSelectedResult] = useState<AppointmentClinicalServices>();
  const [showResultModal, setShowResultModal] = useState(false);
  const [followUpDate, setFollowUpDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (appointment?.clinicID) {
      getServices(appointment.clinicID);
    }
  }, [appointment?.clinicID]);

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
        if (data.status === 'Completed') {
          const res = await fetchAppointmentRecord(appointmentID);
          if (res.ok) {
            const record = await res.json();
            setDiagnosis(record.diagnosis || '');
            setPrescription(record.prescription || '');
            setNotes(record.notes || '');
          }
        }
        if (data?.relatedAppointmentID) {
          const response = await fetchRecordIdByAppointment(data?.relatedAppointmentID);
          if (response.ok) {
            const data = await response.json();
            setPreviousRecordID(data);
            console.log('Previous Record ID:', data);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServices = async (clinicId: number) => {
    try {
      const response = await fetchServices(clinicId);
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const getServiceList = async (appointmentID: number) => {
    try {
      const response = await fetchRequestServiceList(appointmentID);
      if (response.ok) {
        const data = await response.json();
        setAppointmentService(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleStartExamination = async () => {
    try {
      const response = await updateAppointmentStatus(appointmentID, 'In Progress');
      if (response.ok) {
        Alert.alert('Success', 'Examination has started');
        getData();
      } else {
        Alert.alert('Error', 'Unable to start examination');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred');
    }
  };

  const checkCompletedService = async (appointmentId: number): Promise<boolean> => {
    try {
      const response = await checkAllServicesCompleted(appointmentId);
      if (response.ok) {
        const data = await response.json();
        return data.allCompleted === true;
      }
    } catch (error) {
      console.error('Error checking completed services:', error);
    }
    return false;
  };

  const handleCompleteAppointment = async () => {
    const allServicesCompleted = await checkCompletedService(appointmentID);
    if (!allServicesCompleted) {
      Alert.alert(
        'Error',
        'All requested examinations must be completed before finishing the appointment'
      );
      return;
    }

    if (!diagnosis.trim()) {
      Alert.alert('Error', 'Please enter a diagnosis');
      return;
    }

    try {
      const medicalRecordData = {
        patientID: appointment!.patientID,
        appointmentID,
        doctorID: appointment!.doctorID,
        diagnosis,
        prescription,
        notes,
        followUpDate: followUpDate ? followUpDate.toISOString() : null,
        previousRecordID,
      };

      const recordResponse = await createRecord(medicalRecordData);

      if (!recordResponse.ok) {
        const error = await recordResponse.json();
        Alert.alert('Error', 'Failed to save medical record');
        return;
      }

      const statusResponse = await updateAppointmentStatus(appointmentID, 'Completed');

      if (statusResponse.ok) {
        Alert.alert('Success', 'Appointment completed');
        getData();
      } else {
        Alert.alert('Error', 'Unable to update appointment status');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred');
    }
  };

  const handleViewMedicalHistory = () => {
    if (appointment?.patient?.patientID) {
      navigation.navigate('PatientMedicalHistory', { patientID: appointment.patient.patientID });
    } else {
      Alert.alert('Error', 'Patient information not available');
    }
  };

  const toggleServiceSelection = (serviceId: number) => {
    setSelectedServices((prevSelected) => {
      const exists = prevSelected.find((s) => s.id === serviceId);
      if (exists) {
        return prevSelected.filter((s) => s.id !== serviceId);
      } else {
        return [...prevSelected, { id: serviceId, note: '' }];
      }
    });
  };

  const updateServiceNote = (serviceId: number, newNote: string) => {
    setSelectedServices((prevSelected) =>
      prevSelected.map((s) => (s.id === serviceId ? { ...s, note: newNote } : s))
    );
  };

  const handleSendRequestServices = async () => {
    try {
      const reqData = {
        appointmentID,
        services: selectedServices.map((s) => ({
          clinicalServiceID: s.id,
          note: s.note,
        })),
      };
      const res = await requestService(reqData);
      if (res.ok) {
        Alert.alert('Success', 'Request sent');
        getServiceList(appointmentID);
        getData();
      } else {
        const err = await res.json();
        Alert.alert('Error', 'Request failed');
      }
    } catch (error) {
      console.error('Error', error);
    }
  };

  const handleViewResult = (item: AppointmentClinicalServices) => {
    setSelectedResult(item);
    setShowResultModal(true);
  };

  const handleDateChange = (date: Date) => {
    setFollowUpDate(date);
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
      <SafeAreaView className="flex-1 bg-gray-100">
        <HeaderSection backBtn title="Appointment Detail" />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Unable to load appointment details</Text>
        </View>
      </SafeAreaView>
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

      <ScrollView className="-mb-10 flex-1">
        <View className="px-4 py-2">
          {/* Patient Brief Info */}
          <View className="mb-3 mt-3 rounded-lg bg-white p-4 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-bold text-gray-800">
                  {appointment.patient.fullname}
                </Text>
                <Text className="text-sm text-gray-600">
                  {formatDate(appointment.patient.dateOfBirth)} •{' '}
                  {getGenderText(appointment.patient.gender)}
                </Text>
              </View>
              <TouchableOpacity
                className="rounded-lg bg-blue-500 px-3 py-1"
                onPress={handleViewMedicalHistory}>
                <Text className="text-sm text-white">History</Text>
              </TouchableOpacity>
            </View>
            <View className="mt-2 flex-row">
              <Text className="text-sm font-medium text-gray-500">Appointment: </Text>
              <Text className="text-sm text-gray-600">
                {formatDatetime(appointment.appointmentDate)}
              </Text>
            </View>
            <View className="mt-2 flex-row">
              <Text className="text-sm font-medium text-gray-500">Type: </Text>
              <Text className="text-sm capitalize text-gray-600">
                {appointment.appointmentType == 'NEW_VISIT' ? 'New Visit' : 'Follow-up'}
              </Text>
            </View>
          </View>

          {/* Symptom Note */}
          <View className="mb-3 rounded-lg bg-white p-4 shadow-sm">
            <Text className="mb-2 text-base font-semibold text-gray-800">Symptom Description</Text>
            <Text className="text-gray-700">
              {appointment.symptomNote || 'No symptom provided'}
            </Text>
          </View>

          {/* Paraclinical Examinations */}
          {appointment.status === 'In Progress' && (
            <View className="mb-3 rounded-lg bg-white p-4 shadow-sm">
              <Text className="mb-3 text-base font-semibold text-gray-800">
                Paraclinical Examinations
              </Text>

              {appointment.appointmentService === 'NO REQUEST' ? (
                <>
                  <View className="mb-3">
                    <Text className="mb-2 text-sm font-medium text-gray-700">
                      Select needed examinations:
                    </Text>
                    {services &&
                      services.map((item) => {
                        const isSelected = selectedServices.some(
                          (s) => s.id === item.clinicalServiceID
                        );
                        const serviceNote =
                          selectedServices.find((s) => s.id === item.clinicalServiceID)?.note || '';

                        return (
                          <View
                            key={item.clinicalServiceID}
                            className="mb-2 rounded-lg border border-gray-200">
                            <Pressable
                              onPress={() => toggleServiceSelection(item.clinicalServiceID)}
                              className={`flex-row items-center justify-between rounded-t-lg p-3 ${
                                isSelected ? 'bg-emerald-50' : 'bg-white'
                              }`}>
                              <Text className="font-medium text-gray-800">{item.name}</Text>
                              <View
                                className={`h-5 w-5 rounded-full border ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'} items-center justify-center`}>
                                {isSelected && (
                                  <Text className="text-xs font-bold text-white">✓</Text>
                                )}
                              </View>
                            </Pressable>

                            {isSelected && (
                              <View className="px-3 pb-3 pt-1">
                                <TextInput
                                  className="rounded-md border border-gray-300 bg-gray-50 p-2 text-gray-700"
                                  placeholder="Notes for this examination..."
                                  value={serviceNote}
                                  onChangeText={(text) =>
                                    updateServiceNote(item.clinicalServiceID, text)
                                  }
                                  multiline
                                />
                              </View>
                            )}
                          </View>
                        );
                      })}
                  </View>

                  {selectedServices.length > 0 && (
                    <TouchableOpacity
                      className="self-end rounded-lg bg-emerald-500 px-4 py-2"
                      onPress={handleSendRequestServices}>
                      <Text className="text-sm font-medium text-white">Request Examinations</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <View>
                  {appointmentService.map((item) => (
                    <View key={item.id} className="mb-2 rounded-lg border border-gray-200">
                      <View className="flex-row items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2">
                        <Text className="font-medium text-gray-800">
                          {item.clinicalService?.name}
                        </Text>
                        <StatusBadge status={item.status} />
                      </View>

                      {item.status === 'COMPLETED' && (
                        <View className="p-2">
                          <Text className="text-sm text-gray-600">{item.resultSummary}</Text>
                          <TouchableOpacity
                            className="mt-2 self-start rounded-lg bg-blue-500 px-3 py-1"
                            onPress={() => handleViewResult(item)}>
                            <Text className="text-sm text-white">Details</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Exam Results - Only show when completed and not in progress */}
          {appointment.appointmentService === 'COMPLETED' &&
            appointment.status !== 'In Progress' && (
              <View className="mb-3 rounded-lg bg-white p-4 shadow-sm">
                <Text className="mb-2 text-base font-semibold text-gray-800">
                  Examination Results
                </Text>

                {appointmentService.length > 0 ? (
                  appointmentService.map((item) => (
                    <View key={item.id} className="mb-2 rounded-lg border border-gray-200">
                      <View className="flex-row items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2">
                        <Text className="font-medium text-gray-800">
                          {item.clinicalService?.name}
                        </Text>
                        <StatusBadge status={item.status} />
                      </View>

                      {item.status === 'COMPLETED' && (
                        <View className="p-2">
                          <Text className="text-sm text-gray-600">{item.resultSummary}</Text>
                          <TouchableOpacity
                            className="mt-2 self-start rounded-lg bg-blue-500 px-3 py-1"
                            onPress={() => handleViewResult(item)}>
                            <Text className="text-sm text-white">Details</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))
                ) : (
                  <Text className="italic text-gray-500">No examinations performed</Text>
                )}
              </View>
            )}

          {/* Medical Diagnosis Section */}
          {(appointment.status === 'In Progress' || appointment.status === 'Completed') && (
            <View className="mb-3 rounded-lg bg-white p-4 shadow-sm">
              <Text className="mb-3 text-base font-semibold text-gray-800">
                Diagnosis & Treatment
              </Text>

              <View className="mb-3">
                <Text className="mb-1 text-sm font-medium text-gray-700">Diagnosis</Text>
                <TextInput
                  className="rounded-lg border border-gray-300 p-2"
                  multiline
                  numberOfLines={2}
                  value={diagnosis}
                  onChangeText={setDiagnosis}
                  editable={appointment.status === 'In Progress'}
                  placeholder="Enter diagnosis..."
                />
              </View>

              <View className="mb-3">
                <Text className="mb-1 text-sm font-medium text-gray-700">Prescription</Text>
                <TextInput
                  className="rounded-lg border border-gray-300 p-2"
                  multiline
                  numberOfLines={12}
                  value={prescription}
                  onChangeText={setPrescription}
                  editable={appointment.status === 'In Progress'}
                  placeholder="Enter prescription..."
                />
              </View>

              <View>
                <Text className="mb-1 text-sm font-medium text-gray-700">Notes</Text>
                <TextInput
                  className="rounded-lg border border-gray-300 p-2"
                  multiline
                  numberOfLines={2}
                  value={notes}
                  onChangeText={setNotes}
                  editable={appointment.status === 'In Progress'}
                  placeholder="Additional notes..."
                />
              </View>
            </View>
          )}

          {appointment.status === 'In Progress' && (
            <View className="mb-3 rounded-lg bg-white p-4 shadow-sm">
              <DateTimeField
                label="Follow-up Appointment"
                value={followUpDate ? formatDate(followUpDate) : 'Select date (optional)'}
                icon="calendar-outline"
                onPress={() => setShowDatePicker(true)}
              />

              {followUpDate && (
                <TouchableOpacity
                  className="mt-2 self-end rounded-lg bg-red-100 px-2 py-1"
                  onPress={() => setFollowUpDate(null)}>
                  <Text className="text-xs text-red-600">Remove follow-up</Text>
                </TouchableOpacity>
              )}

              <DateTimePickerModal
                visible={showDatePicker}
                value={followUpDate || new Date()}
                mode="date"
                title="Select Follow-up Date"
                minimumDate={new Date()}
                onClose={() => setShowDatePicker(false)}
                onChange={handleDateChange}
              />
            </View>
          )}

          {/* Action Buttons */}
          {(appointment.status === 'Pending' || appointment.status === 'Scheduled') && (
            <TouchableOpacity
              className="mb-6 rounded-lg bg-emerald-600 py-3"
              onPress={handleStartExamination}>
              <Text className="text-center font-medium text-white">Start Examination</Text>
            </TouchableOpacity>
          )}

          {appointment.status === 'In Progress' && (
            <TouchableOpacity
              className="mb-6 rounded-lg bg-green-600 py-3"
              onPress={handleCompleteAppointment}>
              <Text className="text-center font-medium text-white">Complete Appointment</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Test Result Modal Component */}
      <TestResultModal
        visible={showResultModal && selectedResult !== null}
        onClose={() => setShowResultModal(false)}
        result={selectedResult}
        userRole={user?.role}
      />
    </SafeAreaView>
  );
};

export default AppointmentDetailScreen;
