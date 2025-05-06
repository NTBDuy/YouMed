import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type DateTimeFieldProps = {
  label: string;
  value: string;
  required?: boolean;
  icon: any;
  onPress: () => void;
};

const DateTimeField = ({ label, value, required = false, icon, onPress }: DateTimeFieldProps) => {
  return (
    <View className="mb-4">
      <Text className="mb-2 font-medium text-gray-700">
        {label} {required && <Text className="text-red-600">*</Text>}
      </Text>
      <Pressable
        onPress={onPress}
        className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
        <Text className="text-gray-800">{value}</Text>
        <Ionicons name={icon} size={20} color="#4B5563" />
      </Pressable>
    </View>
  );
};

export default DateTimeField;
