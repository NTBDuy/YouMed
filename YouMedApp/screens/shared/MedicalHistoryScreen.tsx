import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderSection from 'components/HeaderSection';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchRecordsByPatient } from 'utils/apiUtils';
import { useContext, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from 'utils/datetimeUtils';
import { AuthContext } from 'contexts/AuthContext';
import { getIconColor } from 'utils/colorUtils';
import MedicalRecord from 'types/MedicalRecord';

const MedicalHistoryScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const { patientID } = route.params as { patientID: number };

  const fetchRecords = async () => {
    try {
      setLoading(true);

      const response = await fetchRecordsByPatient(patientID);

      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error('Error fetching medical records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientID) {
      fetchRecords();
    }
  }, [patientID]);

  const renderRecordItem = ({ item }: { item: MedicalRecord }) => (
    <TouchableOpacity
      className="mb-3 mt-3 rounded-lg bg-white p-4 shadow-sm"
      onPress={() => {
        navigation.navigate('RecordDetail' as never, { recordID: item.recordID } as never);
      }}>
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="font-medium text-gray-500">{formatDate(item.createdAt)}</Text>
        {item.isFollowUp ? (
          <View className="rounded-full bg-green-100 px-2 py-1">
            <Text className="text-xs text-green-800">Follow-up Done</Text>
          </View>
        ) : item.isScheduleFollowUp ? (
          <View className="rounded-full bg-blue-100 px-2 py-1">
            <Text className="text-xs text-blue-800">Follow-up Scheduled</Text>
          </View>
        ) : item.followUpDate != null ? (
          <View className="rounded-full bg-amber-100 px-2 py-1">
            <Text className="text-xs text-amber-800">Follow-up Required</Text>
          </View>
        ) : null}
      </View>

      <Text className="mb-1 text-lg font-semibold" numberOfLines={1}>
        {item.diagnosis}
      </Text>

      <View className="mt-2 border-t border-gray-100 pt-2">
        <View className="flex-row items-center">
          <Ionicons name="medkit" size={14} color={getIconColor(user?.role)} />
          <Text className="ml-1 text-sm text-gray-700">
            Dr. {item.doctor?.user?.fullname || 'Unknown'}
          </Text>
        </View>

        <View className="mt-1 flex-row items-center">
          <Ionicons name="location" size={14} color={getIconColor(user?.role)} />
          <Text className="ml-1 text-sm text-gray-700">
            {item.appointment?.clinic?.name || 'Unknown Clinic'}
          </Text>
        </View>
      </View>

      <View className="mt-1 flex-row justify-end">
        <Ionicons name="arrow-forward" size={16} color={getIconColor(user?.role)} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <HeaderSection title="Medical History" backBtn />

      <View className="-mb-10 flex-1 px-4">
        {loading ? (
          <ActivityIndicator
            size="large"
            color={getIconColor(user?.role)}
            className="flex-1 justify-center"
          />
        ) : (
          <>
            {records.length > 0 ? (
              <FlatList
                data={records}
                renderItem={renderRecordItem}
                keyExtractor={(item) => item.recordID.toString()}
                showsVerticalScrollIndicator={false}
                // ListHeaderComponent={renderStatistics}
                ListEmptyComponent={
                  <View className="flex-1 items-center justify-center py-10">
                    <Text className="text-gray-500">No records match your search</Text>
                  </View>
                }
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
                <Text className="mt-4 text-center text-gray-500">
                  No medical records found.{'\n'}
                  {user?.role == 1 && <>Your history will appear here after visits.</>}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default MedicalHistoryScreen;
