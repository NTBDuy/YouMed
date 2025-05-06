import { View, Text } from 'react-native';

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row border-b border-gray-100 py-2">
    <Text className="w-1/3 text-sm text-gray-500">{label}</Text>
    <Text className="flex-1 text-sm font-medium text-gray-800">{value}</Text>
  </View>
);

export default InfoItem