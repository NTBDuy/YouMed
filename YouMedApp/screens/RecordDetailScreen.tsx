import { useNavigation, useRoute } from '@react-navigation/native';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderSection from 'components/HeaderSection';
import { fetchRecordDetail, fetchAppointmentRecord, fetchRecordParaclinical } from 'utils/apiUtils';
import { useContext, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatDatetime } from 'utils/datetimeUtils';
import { getIconColor } from 'utils/colorUtils';
import { AuthContext } from 'contexts/AuthContext';
import TestResultModal from 'components/TestResultModal';
import AppointmentClinicalServices from 'types/AppointmentClinicalServices';
import MedicalRecord from 'types/MedicalRecord';

const RecordDetailScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);
  const route = useRoute();
  const { recordID } = route.params as { recordID?: number };
  const { appointmentID } = route.params as { appointmentID?: number };
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [paraclinicalResult, setParaclinicalResult] = useState<AppointmentClinicalServices[]>([]);
  const [selectedResult, setSelectedResult] = useState<AppointmentClinicalServices | undefined>();
  const [showResultModal, setShowResultModal] = useState(false);

  const isDoctor = user?.role === 'Doctor';
  const isPatient = user?.role === 'Client';

  const fetchRecordByID = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetchRecordDetail(id);

      if (response.ok) {
        const data = await response.json();
        setRecord(data);
        return data;
      } else {
        console.error('Response not OK:', response.status, response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error fetching medical record detail:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordByAppointment = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetchAppointmentRecord(id);

      if (response.ok) {
        const data = await response.json();
        setRecord(data);
        return data;
      } else {
        console.error('Response not OK:', response.status, response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error fetching medical record detail:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchParaclinicalResult = async (id: number) => {
    try {
      const response = await fetchRecordParaclinical(id);
      if (response.ok) {
        const data = await response.json();
        setParaclinicalResult(data);
      }
    } catch (error) {
      console.error('Error fetching paraclinical results:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      let fetchedRecord = null;
      
      if (recordID) {
        fetchedRecord = await fetchRecordByID(recordID);
        if (fetchedRecord) {
          fetchParaclinicalResult(recordID);
        }
      } else if (appointmentID) {
        fetchedRecord = await fetchRecordByAppointment(appointmentID);
        if (fetchedRecord && fetchedRecord.recordID) {
          fetchParaclinicalResult(fetchedRecord.recordID);
        }
      }
    };
    
    fetchData();
  }, [recordID, appointmentID]);

  const handleScheduleFollowUp = () => {
    navigation.navigate('ScheduleFollowUp', {
      record,
    });
  };

  const InfoItem = ({ label, value, icon }: { label: string; value: string; icon: any }) => (
    <View className="mb-3">
      <Text className="mb-1 text-sm text-gray-500">{label}</Text>
      <View className="flex-row items-center">
        <Ionicons name={icon} size={16} color={getIconColor(user?.role)} />
        <Text className="ml-2 text-base">{value}</Text>
      </View>
    </View>
  );

  const Section = ({
    title,
    children,
    actionButton = null,
  }: {
    title: string;
    children: React.ReactNode;
    actionButton?: React.ReactNode | null;
  }) => (
    <View className="mb-5">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-gray-800">{title}</Text>
        {actionButton}
      </View>
      <View className="rounded-lg bg-white p-4 shadow-sm">{children}</View>
    </View>
  );

  const Tag = ({ text, color }: { text: string; color: string }) => (
    <View className={`rounded-full bg-${color}-100 px-3 py-1`}>
      <Text className={`text-xs font-medium text-${color}-800`}>{text}</Text>
    </View>
  );

  const ActionButton = ({
    icon,
    label,
    onPress,
    color,
  }: {
    icon: any;
    label: string;
    onPress: () => void;
    color: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center justify-center rounded-lg bg-${color}-500 px-4 py-2`}>
      <Ionicons name={icon} size={16} color="#FFFFFF" />
      <Text className="ml-2 text-sm font-medium text-white">{label}</Text>
    </TouchableOpacity>
  );

  if (!loading && !record) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <HeaderSection
          customTitle={<Text className="text-base font-bold text-white">Record Detail</Text>}
          backBtn
        />
        <View className="flex-1 items-center justify-center p-4">
          <Ionicons name="alert-circle-outline" size={64} color="#d1d5db" />
          <Text className="mt-4 text-center text-gray-500">
            Record not found or could not be loaded.{'\n'}
            Please try again later.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleViewResult = (item: AppointmentClinicalServices) => {
    setSelectedResult(item);
    setShowResultModal(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <HeaderSection
        customTitle={
          <Text className="text-base font-bold text-white">
            Record #{record?.recordID || (recordID || 'Loading...')}
          </Text>
        }
        backBtn
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={getIconColor(user?.role)} />
        </View>
      ) : (
        <View className="flex-1">
          {/* Main Content Area */}
          <ScrollView className="-mb-10 flex-1 px-4 py-3" showsVerticalScrollIndicator={false}>
            {/* Overview Section - Most Important Information First */}
            <View className="mb-5 rounded-lg bg-white p-4 shadow-sm">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm font-medium text-gray-500">
                  {formatDate(record?.createdAt)}
                </Text>
                <View className="flex-row items-center space-x-2">
                  {record?.isFollowUp ? (
                    <Tag text="Follow-up Done" color="green" />
                  ) : record?.isScheduleFollowUp ? (
                    <Tag text="Follow-up Scheduled" color="blue" />
                  ) : record?.followUpDate ? (
                    <Tag text="Follow-up Required" color="amber" />
                  ) : null}
                </View>
              </View>
              <Text className="text-xl font-bold text-gray-800">{record?.diagnosis}</Text>
            </View>

            {/* Treatment Plan Section */}
            <Section title="Treatment Plan">
              {record?.prescription ? (
                <View className="mb-3">
                  <Text className="mb-1 text-sm text-gray-500">Prescription</Text>
                  <View className="rounded-md bg-blue-50 p-3">
                    <Text className="text-base text-gray-800">{record.prescription}</Text>
                  </View>
                </View>
              ) : (
                <Text className="text-gray-600">No prescription provided</Text>
              )}

              {record?.notes && (
                <View className="mb-3">
                  <Text className="mb-1 text-sm text-gray-500">Instructions</Text>
                  <Text className="text-base text-gray-800">{record.notes}</Text>
                </View>
              )}

              {record?.followUpDate && (
                <View className="mt-3">
                  <Text className="mb-1 text-sm text-gray-500">Follow-up Date</Text>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="calendar" size={16} color={getIconColor(user?.role)} />
                      <Text className="ml-2 text-base">{formatDate(record.followUpDate)}</Text>
                    </View>

                    {isPatient && !record.isScheduleFollowUp && (
                      <ActionButton
                        icon="calendar"
                        label="Schedule"
                        onPress={handleScheduleFollowUp}
                        color="blue"
                      />
                    )}
                  </View>
                </View>
              )}
            </Section>

            {/* Symptoms and Health Metrics */}
            <Section title="Symptoms & Vital Signs">
              <View className="mb-3">
                <Text className="mb-1 text-sm text-gray-500">Symptoms</Text>
                <Text className="text-base text-gray-800">
                  {record?.appointment?.symptomNote || 'No symptoms recorded'}
                </Text>
              </View>
            </Section>

            {/* Test Results Section */}
            {paraclinicalResult && paraclinicalResult.length > 0 && (
              <Section title="Test Results">
                {paraclinicalResult.map((test, index) => (
                  <TouchableOpacity
                    key={index}
                    className="mb-2 rounded-md border border-gray-200 p-3"
                    onPress={() => handleViewResult(test)}>
                    <View className="flex-row items-center justify-between">
                      <Text className="font-medium">{test.clinicalService?.name}</Text>
                      <Ionicons name="chevron-forward" size={16} color={getIconColor(user?.role)} />
                    </View>
                    <Text className="text-sm text-gray-500">{formatDate(test.completedAt)}</Text>
                  </TouchableOpacity>
                ))}
              </Section>
            )}

            {/* Appointment Information */}
            <Section title="Appointment Information">
              <InfoItem
                label="Date & Time"
                value={formatDatetime(record?.appointment?.appointmentDate)}
                icon="calendar"
              />
              <InfoItem
                label="Type"
                value={
                  record?.appointment?.appointmentType === 'NEW_VISIT'
                    ? 'New Visit'
                    : 'Follow-up Visit'
                }
                icon="clipboard"
              />
            </Section>

            {/* Healthcare Provider */}
            <Section title="Healthcare Provider">
              <InfoItem
                label="Doctor"
                value={`Dr. ${record?.doctor?.user?.fullname || 'Unknown'}`}
                icon="medkit"
              />
              <InfoItem
                label="Clinic"
                value={record?.appointment?.clinic?.name || 'Unknown Clinic'}
                icon="business"
              />
              <InfoItem
                label="Phone"
                value={record?.appointment?.clinic?.phoneNumber || 'Not available'}
                icon="call"
              />
            </Section>

            {/* Patient Information - Kept at bottom as reference */}
            <Section title="Patient Information">
              <InfoItem
                label="Patient Name"
                value={record?.patient?.fullname || 'Unknown'}
                icon="person"
              />
              <InfoItem
                label="Date of Birth"
                value={formatDate(record?.patient?.dateOfBirth)}
                icon="calendar"
              />
              <InfoItem
                label="Gender"
                value={
                  record?.patient?.gender === 'M'
                    ? 'Male'
                    : record?.patient?.gender === 'F'
                      ? 'Female'
                      : record?.patient?.gender || 'Not specified'
                }
                icon="male-female"
              />
              <InfoItem
                label="Phone"
                value={record?.patient?.phoneNumber || 'Not provided'}
                icon="call"
              />
            </Section>

            {/* Action Buttons */}
            <View className="mb-6 mt-4 flex-row justify-center space-x-4">
              {record?.followUpDate && isPatient && !record.isScheduleFollowUp && (
                <TouchableOpacity
                  className="flex-1 items-center rounded-lg bg-blue-500 py-3"
                  onPress={handleScheduleFollowUp}>
                  <Text className="font-medium text-white">Schedule Follow-up</Text>
                </TouchableOpacity>
              )}
            </View>

            <View className="h-6" />
          </ScrollView>
        </View>
      )}

      {/* Test Result Modal Component */}
      <TestResultModal
        visible={showResultModal && !!selectedResult}
        onClose={() => setShowResultModal(false)}
        result={selectedResult}
        userRole={user?.role}
      />
    </SafeAreaView>
  );
};

export default RecordDetailScreen;