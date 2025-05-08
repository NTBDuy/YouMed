import React from 'react';
import { View, Text } from 'react-native';
import { AppointmentStatus } from 'types/Appointment';

interface StatusBadgeProps {
  status: number;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: number) => {
    switch (status) {
      case 3:
        return 'bg-green-100 text-green-800';
      case 2:
        return 'bg-orange-100 text-orange-800';
      case 0:
        return 'bg-yellow-100 text-yellow-800';
      case 4:
        return 'bg-red-100 text-red-800';
      case 1:
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const [bgColor, textColor] = getStatusColor(status).split(' ');

  return (
    <View className={`rounded-full px-3 py-1 ${bgColor}`}>
      <Text className={`text-xs font-medium ${textColor}`}>
        {AppointmentStatus[status]}
      </Text>
    </View>
  );
};

export default StatusBadge;
