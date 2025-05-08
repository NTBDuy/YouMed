import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getBackgroundColor } from 'utils/colorUtils';
import AppointmentClinicalServices from 'types/AppointmentClinicalServices';

type TestResultModalProps = {
  visible: boolean;
  onClose: () => void;
  result?: AppointmentClinicalServices
  userRole?: number;
};

const TestResultModal = ({ visible, onClose, result, userRole } : TestResultModalProps) => {
  if (!result) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/30">
        <View className="h-3/5 rounded-t-xl bg-white">
          <View className="w-full border-b border-gray-200 p-4">
            <Text className="text-center text-lg font-medium">Examination Result</Text>
            <TouchableOpacity className="absolute right-4 top-4" onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            <View className="mb-4">
              <Text className="mb-1 font-bold text-gray-700">Service</Text>
              <Text className="text-gray-600">{result.clinicalService?.name || 'N/A'}</Text>
            </View>

            <View className="mb-4">
              <Text className="mb-1 font-bold text-gray-700">Result Summary</Text>
              <Text className="text-gray-600">{result.resultSummary || 'No summary provided'}</Text>
            </View>

            <View className="mb-4">
              <Text className="mb-1 font-bold text-gray-700">Conclusion</Text>
              <Text className="text-gray-600">{result.conclusion || 'No conclusion provided'}</Text>
            </View>

            <View className="mb-4">
              <Text className="mb-1 font-bold text-gray-700">Recommendations</Text>
              <Text className="text-gray-600">
                {result.recommendations || 'No recommendations provided'}
              </Text>
            </View>

            <TouchableOpacity
              className={`mt-4 rounded-lg bg-${getBackgroundColor(userRole)}-600 py-3`}
              onPress={onClose}>
              <Text className="text-center font-bold text-white">Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default TestResultModal;
