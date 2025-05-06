import { SafeAreaView, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useCallback, useContext, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from 'contexts/AuthContext';
import { useNotification } from 'contexts/NotificationContext';
import { fetchNotifications, updateStatus } from 'utils/apiUtils';
import { formatDatetime } from 'utils/datetimeUtils';
import HeaderSection from 'components/HeaderSection';
import { getBackgroundColor } from 'utils/colorUtils';
import { Notifications } from 'types/Notification';

const NotificationScreen = () => {
  const { user } = useContext(AuthContext);
  const [notification, setNotification] = useState<Notifications[]>([]);
  const { refreshUnreadCount } = useNotification();

  const fetchData = async () => {
    try {
      const res = await fetchNotifications(user!.userID);
      if (res.ok) {
        const data = await res.json();
        setNotification(data);
        refreshUnreadCount();
      }
    } catch (error) {
      console.log('Error fetching notifications ', error);
    }
  };

  const handleUpdateStatus = async (notificationID: number, status: string) => {
    if (status === 'Unread') {
      try {
        const res = await updateStatus(notificationID, 'Read');
        if (res.ok) {
          await res.json();
          fetchData();
        } else {
          console.log('Failed to update status!');
        }
      } catch (error) {
        console.log('Error to update status ', error);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [user])
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <HeaderSection title="Notification" />
      <NotificationList data={notification} onPressItem={handleUpdateStatus} />
    </SafeAreaView>
  );
};

const NotificationList = ({
  data,
  onPressItem,
}: {
  data: Notifications[];
  onPressItem: (notificationID: number, status: string) => void;
}) => {
  return (
    <FlatList
      className="mt-2"
      style={{ flex: 1 }}
      data={data}
      keyExtractor={(item) => item.notificationID.toString()}
      renderItem={({ item }) => <NotificationItem item={item} onPress={onPressItem} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={
        data.length === 0 ? { flex: 1, justifyContent: 'center', alignItems: 'center' } : undefined
      }
      ListEmptyComponent={
        <View>
          <Text className="text-center text-lg text-gray-500">No notification found</Text>
        </View>
      }
    />
  );
};

const NotificationItem = ({
  item,
  onPress,
}: {
  item: Notifications;
  onPress: (notificationID: number, status: string) => void;
}) => {
  const { user } = useContext(AuthContext);
  return (
    <TouchableOpacity
      className="mx-4 my-2 rounded-lg bg-white p-4 shadow-sm"
      activeOpacity={0.7}
      onPress={() => onPress(item.notificationID, item.status)}>
      <View className="flex-row items-start">
        {item.status === 'Unread' && (
          <View
            className={`mt-1.5 h-2 w-2 rounded-full bg-${getBackgroundColor(user!.role)}-600`}
          />
        )}
        <View className={`flex-1 ${item.status === 'Unread' ? 'ml-2' : ''}`}>
          <Text
            className={`text-base ${
              item.status === 'Unread'
                ? `font-bold text-${getBackgroundColor(user!.role)}-800`
                : 'font-medium text-gray-800'
            }`}>
            {item.title}
          </Text>
          <Text className="mt-1 text-sm text-gray-600">{item.message}</Text>
          <Text className="mt-2 text-xs text-gray-400">{formatDatetime(item.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationScreen;
