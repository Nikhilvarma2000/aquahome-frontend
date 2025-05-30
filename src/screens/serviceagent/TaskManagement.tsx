import React, { useState, useCallback } from 'react';
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
  TextInput,
  ScrollView
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ServiceRequestCard from '../../components/ServiceRequestCard';
import { ServiceRequest } from '../../types';
import { useFocusEffect } from '@react-navigation/native';
import { agentService } from '../../services/agentService';


const TaskManagement = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState<ServiceRequest[]>([]);
  const [selectedTask, setSelectedTask] = useState<ServiceRequest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [statusUpdateVisible, setStatusUpdateVisible] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'scheduled' | 'completed'>('all');

  // Simulated fetch tasks function
  const fetchTasks = async () => {
    try {
      const response = await agentService.getTasks();
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Failed to load tasks. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const handleTaskPress = (task: ServiceRequest) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleStatusUpdate = (newStatus: 'scheduled' | 'completed') => {
    if (!selectedTask) return;
    
    if (newStatus === 'completed') {
      setStatusUpdateVisible(true);
    } else {
      updateTaskStatus(newStatus);
    }
  };

  const confirmStatusUpdate = () => {
    updateTaskStatus('completed');
    setStatusUpdateVisible(false);
  };

  const updateTaskStatus = async (newStatus: 'scheduled' | 'completed') => {
    if (!selectedTask) return;
    
    setIsUpdating(true);
    try {
      // Simulate API call
      await agentService.updateTaskStatus(selectedTask.id, {
        status: newStatus,
        completion_date: new Date().toISOString(),
        notes: completionNotes
      });
      await fetchTasks(); // 🔁 refresh with fresh server data

      // In a real app, this would be an API call to update the status
      // For this demo, we'll update the local state

      setModalVisible(false);
      setSelectedTask(null);
      setCompletionNotes('');
      Alert.alert('Success', `Task status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      Alert.alert('Error', 'Failed to update task status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleContactCustomer = (task: ServiceRequest) => {
    // In a real app, this would open a phone dialer or messaging interface
    if (task.user?.phone) {
      Alert.alert('Contact Customer', `Calling ${task.user.name} at ${task.user.phone}`);
    } else {
      Alert.alert('Contact Customer', `Email ${task.user?.name} at ${task.user?.email}`);
    }
  };

  const renderTask = ({ item }: { item: ServiceRequest }) => (
    <ServiceRequestCard 
      serviceRequest={item} 
      onPress={() => handleTaskPress(item)}
    />
  );

  const getFilteredTasks = () => {
    if (activeFilter === 'all') return tasks;
    
    if (activeFilter === 'pending') {
      return tasks.filter(task => task.status === 'pending' || task.status === 'assigned');
    }
    
    if (activeFilter === 'scheduled') {
      return tasks.filter(task => task.status === 'scheduled');
    }
    
    if (activeFilter === 'completed') {
      return tasks.filter(task => task.status === 'completed');
    }
    
    return tasks;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filters */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: activeFilter === 'all' ? colors.primary : 'transparent' }
          ]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={{ color: activeFilter === 'all' ? 'white' : colors.text }}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: activeFilter === 'pending' ? colors.primary : 'transparent' }
          ]}
          onPress={() => setActiveFilter('pending')}
        >
          <Text style={{ color: activeFilter === 'pending' ? 'white' : colors.text }}>Pending</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: activeFilter === 'scheduled' ? colors.primary : 'transparent' }
          ]}
          onPress={() => setActiveFilter('scheduled')}
        >
          <Text style={{ color: activeFilter === 'scheduled' ? 'white' : colors.text }}>Scheduled</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: activeFilter === 'completed' ? colors.primary : 'transparent' }
          ]}
          onPress={() => setActiveFilter('completed')}
        >
          <Text style={{ color: activeFilter === 'completed' ? 'white' : colors.text }}>Completed</Text>
        </TouchableOpacity>
      </View>

      {/* Task List */}
      <FlatList
        data={getFilteredTasks()}
        renderItem={renderTask}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.taskList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="clipboard" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Tasks Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {activeFilter === 'all' 
                ? 'You currently have no assigned tasks.' 
                : `No ${activeFilter} tasks found.`}
            </Text>
          </View>
        }
      />

      {/* Task Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Task Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedTask && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.taskTypeContainer}>
                  <View style={[styles.taskTypeBadge, { backgroundColor: `${colors.primary}20` }]}>
                    <Text style={[styles.taskTypeText, { color: colors.primary }]}>
                      {selectedTask.type.charAt(0).toUpperCase() + selectedTask.type.slice(1)}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge, 
                    { 
                      backgroundColor: selectedTask.status === 'completed' 
                        ? `${colors.success}20` 
                        : `${colors.primary}20` 
                    }
                  ]}>
                    <Text style={[
                      styles.statusText, 
                      { 
                        color: selectedTask.status === 'completed' 
                          ? colors.success 
                          : colors.primary 
                      }
                    ]}>
                      {selectedTask.status.charAt(0).toUpperCase() + selectedTask.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Customer Information</Text>
                <Card style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Feather name="user" size={16} color={colors.primary} />
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Name:</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{selectedTask.user?.name}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Feather name="phone" size={16} color={colors.primary} />
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phone:</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{selectedTask.user?.phone || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Feather name="mail" size={16} color={colors.primary} />
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email:</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{selectedTask.user?.email}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Feather name="map-pin" size={16} color={colors.primary} />
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Address:</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {selectedTask.user?.address}, {selectedTask.user?.city}, {selectedTask.user?.state} - {selectedTask.user?.zipCode}
                    </Text>
                  </View>
                </Card>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Task Details</Text>
                <Card style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Feather name="calendar" size={16} color={colors.primary} />
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Scheduled:</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {selectedTask.scheduledDate ? formatDate(selectedTask.scheduledDate) : 'Not scheduled yet'}
                    </Text>
                  </View>
                  
                  {selectedTask.completionDate && (
                    <View style={styles.infoRow}>
                      <Feather name="check-circle" size={16} color={colors.success} />
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Completed:</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>
                        {formatDate(selectedTask.completionDate)}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.infoRow}>
                    <Feather name="file-text" size={16} color={colors.primary} />
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Description:</Text>
                  </View>
                  <Text style={[styles.descriptionText, { color: colors.text }]}>
                    {selectedTask.description}
                  </Text>
                </Card>

                {selectedTask.subscription?.product && (
                  <>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Product Information</Text>
                    <Card style={styles.infoCard}>
                      <View style={styles.infoRow}>
                        <Feather name="package" size={16} color={colors.primary} />
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Model:</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>
                          {selectedTask.subscription.product.name}
                        </Text>
                      </View>
                      
                      <View style={styles.infoRow}>
                        <Feather name="clock" size={16} color={colors.primary} />
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Maintenance:</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>
                          Every {selectedTask.subscription.product.maintenanceFrequency} days
                        </Text>
                      </View>
                    </Card>
                  </>
                )}

                {selectedTask.status === 'completed' && selectedTask.feedback && (
                  <>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Customer Feedback</Text>
                    <Card style={styles.infoCard}>
                      <View style={styles.ratingContainer}>
                        <Text style={[styles.ratingText, { color: colors.text }]}>Rating: </Text>
                        <View style={styles.starsContainer}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Feather
                              key={star}
                              name="star"
                              size={16}
                              color={star <= (selectedTask.rating || 0) ? '#FFC107' : '#E0E0E0'}
                              style={{ marginRight: 2 }}
                            />
                          ))}
                        </View>
                      </View>
                      <Text style={[styles.feedbackText, { color: colors.text }]}>
                        "{selectedTask.feedback}"
                      </Text>
                    </Card>
                  </>
                )}

                <View style={styles.actionButtons}>
                  <Button
                    title="Contact Customer"
                    onPress={() => handleContactCustomer(selectedTask)}
                    variant="outline"
                    style={{ flex: 1, marginRight: 8 }}
                    icon={<Feather name="phone" size={16} color={colors.primary} />}
                  />
                  
                  {selectedTask.status !== 'completed' && (
                    <Button
                      title={selectedTask.status === 'scheduled' ? "Mark Completed" : "Schedule Visit"}
                      onPress={() => handleStatusUpdate(selectedTask.status === 'scheduled' ? 'completed' : 'scheduled')}
                      variant="primary"
                      style={{ flex: 1, marginLeft: 8 }}
                      icon={
                        <Feather 
                          name={selectedTask.status === 'scheduled' ? "check-circle" : "calendar"} 
                          size={16} 
                          color="white" 
                        />
                      }
                    />
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Completion Notes Modal */}
      <Modal
        visible={statusUpdateVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setStatusUpdateVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.completionModalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Completion Notes</Text>
            
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              Please add any notes about the service completed
            </Text>
            
            <TextInput
              style={[
                styles.notesInput,
                { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border
                }
              ]}
              value={completionNotes}
              onChangeText={setCompletionNotes}
              placeholder="Enter service notes here"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setStatusUpdateVisible(false);
                  setCompletionNotes('');
                }}
                variant="outline"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Mark Completed"
                onPress={confirmStatusUpdate}
                style={{ flex: 1, marginLeft: 8 }}
                loading={isUpdating}
                disabled={isUpdating}
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
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F5F5F5',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  taskList: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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
    width: '100%',
    maxHeight: '80%',
    maxWidth: 500,
  },
  completionModalContent: {
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 16,
  },
  taskTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  taskTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
  },
  taskTypeText: {
    fontWeight: '500',
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontWeight: '500',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  infoCard: {
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    marginLeft: 8,
    width: 70,
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
  },
  descriptionText: {
    marginTop: 4,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontWeight: '500',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  feedbackText: {
    fontStyle: 'italic',
    lineHeight: 20,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
  },
});

export default TaskManagement;