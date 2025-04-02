import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import { customerService } from '../../services/customerService';
import { Subscription } from '../../types';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SubscriptionCard from '../../components/SubscriptionCard';

const SubscriptionManagement = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pauseModalVisible, setPauseModalVisible] = useState(false);
  const [resumeDate, setResumeDate] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const data = await customerService.getSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      Alert.alert('Error', 'Failed to load subscriptions. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchSubscriptions();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSubscriptions();
  };

  const handleViewSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    // Navigation to subscription details would be here
  };

  const handlePauseSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setPauseModalVisible(true);
  };

  const handleResumeSubscription = async (subscription: Subscription) => {
    setActionLoading(true);
    try {
      await customerService.resumeSubscription(subscription.id);
      Alert.alert('Success', 'Your subscription has been resumed.');
      fetchSubscriptions();
    } catch (error) {
      console.error('Error resuming subscription:', error);
      Alert.alert('Error', 'Failed to resume subscription. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmPauseSubscription = async () => {
    if (!selectedSubscription) return;
    
    setActionLoading(true);
    try {
      await customerService.pauseSubscription(selectedSubscription.id, resumeDate || undefined);
      Alert.alert('Success', 'Your subscription has been paused.');
      setPauseModalVisible(false);
      setResumeDate('');
      fetchSubscriptions();
    } catch (error) {
      console.error('Error pausing subscription:', error);
      Alert.alert('Error', 'Failed to pause subscription. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = (subscription: Subscription) => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel this subscription? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await customerService.cancelSubscription(subscription.id);
              Alert.alert('Success', 'Your subscription has been cancelled.');
              fetchSubscriptions();
            } catch (error) {
              console.error('Error cancelling subscription:', error);
              Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: Subscription }) => (
    <SubscriptionCard 
      subscription={item} 
      onPress={() => handleViewSubscription(item)}
    />
  );

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading subscriptions...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {subscriptions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="package" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Active Subscriptions</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            You don't have any active subscriptions. Browse our products to start a subscription.
          </Text>
          <Button
            title="Browse Products"
            onPress={() => navigation.navigate('ProductListing')}
            style={styles.browseButton}
          />
        </View>
      ) : (
        <FlatList
          data={subscriptions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Your Subscriptions</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Manage all your water purifier subscriptions
              </Text>
            </View>
          }
        />
      )}

      {/* Pause Subscription Modal */}
      <Modal
        visible={pauseModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPauseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Pause Subscription</Text>
            
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              You can pause your subscription temporarily. You won't be billed during the pause period.
            </Text>
            
            <Text style={[styles.inputLabel, { color: colors.text }]}>Resume Date (Optional)</Text>
            <TextInput
              style={[
                styles.dateInput,
                { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border
                }
              ]}
              value={resumeDate}
              onChangeText={setResumeDate}
              placeholder="YYYY-MM-DD (Optional)"
              placeholderTextColor={colors.textSecondary}
            />
            
            <Text style={[styles.noteText, { color: colors.textSecondary }]}>
              If no date is specified, your subscription will remain paused until you manually resume it.
            </Text>
            
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setPauseModalVisible(false);
                  setResumeDate('');
                }}
                variant="outline"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Pause Subscription"
                onPress={confirmPauseSubscription}
                style={{ flex: 1, marginLeft: 8 }}
                loading={actionLoading}
                disabled={actionLoading}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  browseButton: {
    minWidth: 200,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 24,
  },
  modalContent: {
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  inputLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 12,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
  },
});

export default SubscriptionManagement;