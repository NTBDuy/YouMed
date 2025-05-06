import { View, Text, TouchableOpacity, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useContext } from 'react';
import { AuthContext } from 'contexts/AuthContext';
import { getBackgroundColor } from 'utils/colorUtils';

type DateTimePickerModalProps = {
  visible: boolean;
  value: Date;
  mode: 'date' | 'time';
  title: string;
  minimumDate?: Date;
  maximumDate?: Date;
  minuteInterval?: any;
  onClose: () => void;
  onChange: (date: Date) => void;
};

const DateTimePickerModal = ({
  visible,
  value,
  mode,
  title,
  minimumDate,
  maximumDate,
  minuteInterval,
  onClose,
  onChange,
}: DateTimePickerModalProps) => {
  const handleChange = (_: any, selectedValue: Date | undefined) => {
    if (selectedValue) {
      onChange(selectedValue);
    }
  };

  const { user } = useContext(AuthContext);

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/30">
        <View className="items-center rounded-t-xl bg-white">
          <View className="w-full border-b border-gray-200 p-4">
            <Text className="text-center text-lg font-medium">{title}</Text>
          </View>
          <DateTimePicker
            value={value}
            mode={mode}
            display="spinner"
            onChange={handleChange}
            style={{ height: 200 }}
            minimumDate={minimumDate}
            minuteInterval={minuteInterval}
            maximumDate={maximumDate}
            textColor="black"
          />
          <View className="mb-10 w-full flex-row items-center justify-between p-4">
            <TouchableOpacity
              className="rounded-lg border border-gray-300 px-6 py-3"
              onPress={onClose}>
              <Text className="font-medium text-gray-700">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity className={`rounded-lg bg-${getBackgroundColor(user?.role)}-600 px-6 py-3`} onPress={onClose}>
              <Text className="font-bold text-white">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DateTimePickerModal;
