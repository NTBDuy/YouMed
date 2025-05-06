import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SectionHeader = ({
  title,
  icon,
  color = '#0d9488' 
}: { 
  title: string; 
  icon: string; 
  color?: string; 
}) => (
  <View className="my-2 flex-row items-center">
    <Ionicons name={icon as any} size={18} color={color} />
    <Text className="ml-2 text-base font-bold" style={{ color }}>{title}</Text>
  </View>
);

export default SectionHeader