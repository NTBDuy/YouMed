import { Pressable, Text, View } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { IconDefinition, faChevronRight } from '@fortawesome/free-solid-svg-icons';

type MenuItemProps = {
  icon: IconDefinition;
  title: string;
  color?: string;
  onPress: () => void;
  showDivider?: boolean;
};

const MenuItem = ({
  icon,
  title,
  color = '#64748b',
  onPress,
  showDivider = true,
}: MenuItemProps) => {
  const getBgColorClass = (): string => {
    if (color === '#64748b') return 'bg-gray-100';
    if (color === '#3b82f6') return 'bg-blue-100';
    if (color === '#8b5cf6') return 'bg-purple-100';
    if (color === '#ef4444') return 'bg-red-100';
    if (color === '#6366f1') return 'bg-indigo-100';
    if (color === '#14b8a6') return 'bg-teal-100';
    if (color === '#14b8a6') return 'bg-teal-100';
    if (color === '#f59e0b') return 'bg-amber-100';
    if (color === '#10b981') return 'bg-green-100';
    return 'bg-gray-100';
  };

  return (
    <>
      <Pressable className="flex-row items-center justify-between py-4" onPress={onPress}>
        <View className="flex-row items-center">
          <View
            className={`h-9 w-9 items-center justify-center rounded-full ${getBgColorClass()}`}>
            <FontAwesomeIcon icon={icon} size={18} color={color} />
          </View>
          <Text className="ml-3 text-base text-gray-800">{title}</Text>
        </View>
        <FontAwesomeIcon icon={faChevronRight} size={14} color="#94a3b8" />
      </Pressable>
      {showDivider && <View className="h-px w-full bg-gray-100" />}
    </>
  );
};

export default MenuItem;
