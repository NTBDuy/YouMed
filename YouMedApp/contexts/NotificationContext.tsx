import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { countUnread } from 'utils/apiUtils';

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({
  children,
  userID,
}: {
  children: ReactNode;
  userID: number;
}) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await countUnread(userID);
      if (!response.ok) {
        throw new Error('API error');
      }
      const json = await response.json();
      setUnreadCount(json.count ?? 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [userID]);

  const refreshUnreadCount = fetchUnreadCount;

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
