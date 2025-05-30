import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import Card from '../../components/ui/Card';

// Mock notification data structure
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  timestamp: string;
}

const NotificationsScreen = () => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Simulated fetch notifications function
  const fetchNotifications = async () => {
    // This would be replaced with an actual API call
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample notifications - in a real app, this would come from an API
      const notificationsData: Notification[] = [
        {
          id: '1',
          title: 'Service Request Confirmed',
          message: 'Your service request #SR123 has been confirmed and a technician will visit on 12th April.',
          type: 'success',
          isRead: false,
          timestamp: '2023-04-08T10:30:00Z',
        },
        {
          id: '2',
          title: 'Subscription Renewed',
          message: 'Your subscription for Aqua Pure Filter has been automatically renewed for another month.',
          type: 'info',
          isRead: true,
          timestamp: '2023-04-05T09:45:00Z',
        },
        {
          id: '3',
          title: 'Maintenance Due',
          message: 'Your water purifier is due for maintenance in the next 5 days. Please schedule a service visit.',
          type: 'warning',
          isRead: false,
          timestamp: '2023-04-04T14:20:00Z',
        },
        {
          id: '4',
          title: 'Payment Successful',
          message: 'Payment of ₹1,200 for your monthly subscription has been processed successfully.',
          type: 'success',
          isRead: true,
          timestamp: '2023-04-01T11:15:00Z',
        },
        {
          id: '5',
          title: 'Filter Change Reminder',
          message: 'Your water purifier filter is due for replacement. Book a service appointment soon.',
          type: 'warning',
          isRead: true,
          timestamp: '2023-03-28T16:40:00Z',
        },
      ];
      
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'info':
        return <Feather name="info" size={24} color="#0288D1" />;
      case 'success':
        return <Feather name="check-circle" size={24} color="#2E7D32" />;
      case 'warning':
        return <Feather name="alert-triangle" size={24} color="#ED6C02" />;
      case 'error':
        return <Feather name="alert-octagon" size={24} color="#D32F2F" />;
      default:
        return <Feather name="bell" size={24} color="#0288D1" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      // Yesterday
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      // This week
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `${days[date.getDay()]} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      // Older
      return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem, 
        { backgroundColor: item.isRead ? colors.background : colors.card }
      ]}
      onPress={() => markAsRead(item.id)}
    >
      <Card style={styles.notificationCard}>
        <View style={styles.notificationHeader}>
          <View style={styles.iconContainer}>
            {getIconForType(item.type)}
          </View>
          <View style={styles.notificationContent}>
            <Text style={[styles.notificationTitle, { color: colors.text }]}>
              {item.title}
              {!item.isRead && <View style={styles.unreadDot} />}
            </Text>
            <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
        </View>
        <Text style={[styles.notificationMessage, { color: colors.text }]}>
          {item.message}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading notifications...</Text>
      </View>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity 
            style={styles.markAllReadButton} 
            onPress={markAllAsRead}
          >
            <Text style={[styles.markAllReadText, { color: colors.primary }]}>
              Mark all as read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="bell-off" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Notifications</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            You don't have any notifications at the moment.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  markAllReadButton: {
    padding: 8,
  },
  markAllReadText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  notificationItem: {
    marginBottom: 8,
    borderRadius: 8,
  },
  notificationCard: {
    padding: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0288D1',
    marginLeft: 8,
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default NotificationsScreen;