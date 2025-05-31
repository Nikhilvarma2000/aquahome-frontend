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
  ScrollView,
  Dimensions
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useFocusEffect } from '@react-navigation/native';
import { agentService } from '../../services/agentService';

const { width } = Dimensions.get('window');

// Updated interface to match actual backend response
interface ServiceTask {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  description: string;
  feedback: string;
  franchise_id: number;
  franchise_name: string;
  product_id: number;
  product_name: string;
  rating: number | null;
  scheduled_time: string;
  service_agent_id: number;
  service_agent_name: string;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  subscription_id: number;
  type: 'maintenance' | 'repair' | 'installation' | 'inspection';
  completion_time: string | null;
  created_at: string;
  updated_at: string;
}

const TaskManagement = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState<ServiceTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<ServiceTask | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [statusUpdateVisible, setStatusUpdateVisible] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'scheduled' | 'in_progress' | 'completed'>('all');

  const fetchTasks = async () => {
    try {
      const response = await agentService.getTasks();
      // Handle both array response and object with data property
      const tasksData = Array.isArray(response) ? response : response.data || [];
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Failed to load tasks. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const handleTaskPress = (task: ServiceTask) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleStatusUpdate = (newStatus: 'scheduled' | 'in_progress' | 'completed' | 'cancelled') => {
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

  const updateTaskStatus = async (newStatus: 'scheduled' | 'in_progress' | 'completed' | 'cancelled') => {
    if (!selectedTask) return;

    setIsUpdating(true);
    try {
      await agentService.updateTaskStatus(selectedTask.id, {
        status: newStatus,
        completion_time: newStatus === 'completed' ? new Date().toISOString() : null,
        feedback: completionNotes
      });

      await fetchTasks();
      setModalVisible(false);
      setSelectedTask(null);
      setCompletionNotes('');
      Alert.alert('Success', `Task status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      Alert.alert('Error', 'Failed to update task status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleContactCustomer = (task: ServiceTask) => {
    if (task.customer_phone) {
      Alert.alert(
        'Contact Customer',
        `Choose contact method for ${task.customer_name}`,
        [
          { text: 'Call', onPress: () => Alert.alert('Calling', `Calling ${task.customer_phone}`) },
          { text: 'Email', onPress: () => Alert.alert('Email', `Emailing ${task.customer_email}`) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'scheduled': return '#007AFF';
      case 'in_progress': return '#5856D6';
      case 'completed': return '#34C759';
      case 'cancelled': return '#FF3B30';
      default: return colors.primary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'clock';
      case 'scheduled': return 'calendar';
      case 'in_progress': return 'play-circle';
      case 'completed': return 'check-circle';
      case 'cancelled': return 'x-circle';
      default: return 'help-circle';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return 'tool';
      case 'repair': return 'wrench';
      case 'installation': return 'package';
      case 'inspection': return 'search';
      default: return 'clipboard';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'maintenance': return '#FF9500';
      case 'repair': return '#FF3B30';
      case 'installation': return '#34C759';
      case 'inspection': return '#007AFF';
      default: return colors.primary;
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const renderTaskCard = ({ item }: { item: ServiceTask }) => {
    const scheduledDateTime = formatDateTime(item.scheduled_time);

    return (
      <TouchableOpacity onPress={() => handleTaskPress(item)}>
        <Card style={[styles.taskCard, { borderLeftColor: getStatusColor(item.status) }]}>
          <View style={styles.taskHeader}>
            <View style={styles.taskInfo}>
              <View style={{
                
              }}>
                <View style={[{ backgroundColor: `${getTypeColor(item.type)}20`, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }]}>
                  <Feather
                    name={getTypeIcon(item.type)}
                    size={12}
                    color={getTypeColor(item.type)}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[ { color: getTypeColor(item.type) }]}>
                    {item.type.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.taskId, { color: colors.textSecondary }]}>
                  #{item.id}
                </Text>
              </View>
              <Text style={[styles.customerName, { color: colors.text }]}>
                {item.customer_name}
              </Text>
              <Text style={[styles.productName, { color: colors.textSecondary }]}>
                {item.product_name}
              </Text>
            </View>
            <View style={[ { backgroundColor: `${getStatusColor(item.status)}20`,flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4  }]}>
              <Feather
                name={getStatusIcon(item.status)}
                size={12}
                color={getStatusColor(item.status)}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.taskDetails}>
            <View style={styles.detailRow}>
              <Feather name="calendar" size={14} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {scheduledDateTime.date} at {scheduledDateTime.time}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Feather name="map-pin" size={14} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {item.franchise_name}
              </Text>
            </View>

            {item.description && (
              <View style={styles.detailRow}>
                <Feather name="file-text" size={14} color={colors.textSecondary} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.taskActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: `${colors.primary}15` }]}
              onPress={() => handleContactCustomer(item)}
            >
              <Feather name="phone" size={16} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>Contact</Text>
            </TouchableOpacity>

            {item.status !== 'completed' && item.status !== 'cancelled' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: `${getNextStatusColor(item.status)}15` }]}
                onPress={() => {
                  setSelectedTask(item);
                  setModalVisible(true);
                }}
              >
                <Feather
                  name={getNextStatusIcon(item.status)}
                  size={16}
                  color={getNextStatusColor(item.status)}
                />
                <Text style={[styles.actionButtonText, { color: getNextStatusColor(item.status) }]}>
                  {getNextStatusText(item.status)}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const getNextStatusColor = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return getStatusColor('scheduled');
      case 'scheduled': return getStatusColor('in_progress');
      case 'in_progress': return getStatusColor('completed');
      default: return colors.primary;
    }
  };

  const getNextStatusIcon = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'calendar';
      case 'scheduled': return 'play-circle';
      case 'in_progress': return 'check-circle';
      default: return 'arrow-right';
    }
  };

  const getNextStatusText = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'Schedule';
      case 'scheduled': return 'Start';
      case 'in_progress': return 'Complete';
      default: return 'Update';
    }
  };

  const getFilteredTasks = () => {
    if (activeFilter === 'all') return tasks;
    return tasks.filter(task => task.status === activeFilter);
  };

  const getTaskCounts = () => {
    return {
      all: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      scheduled: tasks.filter(t => t.status === 'scheduled').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
    };
  };

  const taskCounts = getTaskCounts();

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
      {/* Enhanced Header with Stats */}
      <View style={[styles.headerContainer, { backgroundColor: colors.card }]}>
        {/* <Text style={[styles.headerTitle, { color: colors.text }]}>Service Tasks</Text> */}

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{taskCounts.all}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: getStatusColor('pending') }]}>{taskCounts.pending}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: getStatusColor('in_progress') }]}>{taskCounts.in_progress}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: getStatusColor('completed') }]}>{taskCounts.completed}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Done</Text>
          </View>
        </View>
      </View>

      {/* Improved Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollContainer}
        contentContainerStyle={styles.filterContainer}
      >
        {[
          { key: 'all', label: 'All Tasks', count: taskCounts.all },
          { key: 'pending', label: 'Pending', count: taskCounts.pending },
          { key: 'scheduled', label: 'Scheduled', count: taskCounts.scheduled },
          { key: 'in_progress', label: 'In Progress', count: taskCounts.in_progress },
          { key: 'completed', label: 'Completed', count: taskCounts.completed }
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              {
                backgroundColor: activeFilter === filter.key ? colors.primary : 'transparent',
                borderColor: colors.primary
              }
            ]}
            onPress={() => setActiveFilter(filter.key as any)}
          >
            <Text style={[
              styles.filterTabText,
              { color: activeFilter === filter.key ? 'white' : colors.primary }
            ]}>
              {filter.label}
            </Text>
            {filter.count > 0 && (
              <View style={[
                styles.filterBadge,
                { backgroundColor: activeFilter === filter.key ? 'rgba(255,255,255,0.3)' : colors.primary }
              ]}>
                <Text style={[
                  styles.filterBadgeText,
                  { color: 'white' }
                ]}>
                  {filter.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Task List */}
      <FlatList
        data={getFilteredTasks()}
        renderItem={renderTaskCard}
        keyExtractor={item => item.id.toString()}
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
                : `No ${activeFilter.replace('_', ' ')} tasks found.`}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Enhanced Task Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Task Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedTask && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Status & Type Header */}
                <View style={styles.statusTypeHeader}>
                  <View style={[styles.statusHeader, { backgroundColor: `${getStatusColor(selectedTask.status)}10` }]}>
                    <Feather
                      name={getStatusIcon(selectedTask.status)}
                      size={20}
                      color={getStatusColor(selectedTask.status)}
                    />
                    <Text style={[styles.statusHeaderText, { color: getStatusColor(selectedTask.status) }]}>
                      {selectedTask.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>

                  <View style={[styles.statusHeader, { backgroundColor: `${getTypeColor(selectedTask.type)}10`, }]}>
                    <Feather
                      name={getTypeIcon(selectedTask.type)}
                      size={20}
                      color={getTypeColor(selectedTask.type)}
                    />
                    <Text style={[styles.statusHeaderText, { color: getTypeColor(selectedTask.type) }]}>
                      {selectedTask.type.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Customer Information */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Customer Information</Text>
                  <Card style={styles.infoCard}>
                    <View style={styles.infoRow}>
                      <Feather name="user" size={18} color={colors.primary} />
                      <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Name</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>{selectedTask.customer_name}</Text>
                      </View>
                    </View>

                    <View style={styles.infoRow}>
                      <Feather name="phone" size={18} color={colors.primary} />
                      <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phone</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>{selectedTask.customer_phone}</Text>
                      </View>
                    </View>

                    <View style={styles.infoRow}>
                      <Feather name="mail" size={18} color={colors.primary} />
                      <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>{selectedTask.customer_email}</Text>
                      </View>
                    </View>
                  </Card>
                </View>

                {/* Service Information */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Service Information</Text>
                  <Card style={styles.infoCard}>
                    <View style={styles.infoRow}>
                      <Feather name="package" size={18} color={colors.primary} />
                      <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Product</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>{selectedTask.product_name}</Text>
                      </View>
                    </View>

                    <View style={styles.infoRow}>
                      <Feather name="map-pin" size={18} color={colors.primary} />
                      <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Location</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>{selectedTask.franchise_name}</Text>
                      </View>
                    </View>

                    <View style={styles.infoRow}>
                      <Feather name="calendar" size={18} color={colors.primary} />
                      <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Scheduled Time</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>
                          {new Date(selectedTask.scheduled_time).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </View>
                    </View>

                    {selectedTask.description && (
                      <View style={styles.infoRow}>
                        <Feather name="file-text" size={18} color={colors.primary} />
                        <View style={styles.infoContent}>
                          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Description</Text>
                          <Text style={[styles.infoValue, { color: colors.text }]}>{selectedTask.description}</Text>
                        </View>
                      </View>
                    )}

                    {selectedTask.completion_time && (
                      <View style={styles.infoRow}>
                        <Feather name="check-circle" size={18} color={getStatusColor('completed')} />
                        <View style={styles.infoContent}>
                          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Completed Time</Text>
                          <Text style={[styles.infoValue, { color: colors.text }]}>
                            {new Date(selectedTask.completion_time).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </View>
                      </View>
                    )}
                  </Card>
                </View>

                {/* Feedback Section */}
                {selectedTask.status === 'completed' && (selectedTask.feedback || selectedTask.rating) && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Customer Feedback</Text>
                    <Card style={styles.infoCard}>
                      {selectedTask.rating && (
                        <View style={styles.ratingContainer}>
                          <Text style={[styles.ratingText, { color: colors.text }]}>Rating: </Text>
                          <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Feather
                                key={star}
                                name="star"
                                size={16}
                                color={star <= selectedTask.rating! ? '#FFC107' : '#E0E0E0'}
                                style={{ marginRight: 2 }}
                              />
                            ))}
                          </View>
                        </View>
                      )}
                      {selectedTask.feedback && (
                        <Text style={[styles.feedbackText, { color: colors.text }]}>
                          "{selectedTask.feedback}"
                        </Text>
                      )}
                    </Card>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <Button
                    title="Contact Customer"
                    onPress={() => handleContactCustomer(selectedTask)}
                    variant="outline"
                    style={styles.modalActionButton}
                    icon={<Feather name="phone" size={16} color={colors.primary} />}
                  />

                  {selectedTask.status === 'pending' && (
                    <Button
                      title="Schedule Task"
                      onPress={() => handleStatusUpdate('scheduled')}
                      style={[styles.modalActionButton, { backgroundColor: getStatusColor('scheduled') }]}
                      icon={<Feather name="calendar" size={16} color="white" />}
                    />
                  )}

                  {selectedTask.status === 'scheduled' && (
                    <Button
                      title="Start Task"
                      onPress={() => handleStatusUpdate('in_progress')}
                      style={[styles.modalActionButton, { backgroundColor: getStatusColor('in_progress') }]}
                      icon={<Feather name="play-circle" size={16} color="white" />}
                    />
                  )}

                  {selectedTask.status === 'in_progress' && (
                    <Button
                      title="Complete Task"
                      onPress={() => handleStatusUpdate('completed')}
                      style={[styles.modalActionButton, { backgroundColor: getStatusColor('completed') }]}
                      icon={<Feather name="check-circle" size={16} color="white" />}
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>Task Completion</Text>

            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              Please add any notes about the completed service
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
              placeholder="Enter service completion notes (optional)"
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
                style={{ flex: 1, marginLeft: 8, backgroundColor: getStatusColor('completed') }}
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
  headerContainer: {
    padding: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  filterScrollContainer: {
    maxHeight: 50,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterTab: {

    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    flexDirection: 'row',

  },
  filterTabText: {
    fontWeight: '500',
    fontSize: 14,
  },
  filterBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskList: {
    padding: 16,
    paddingTop: 8,
  },
  taskCard: {
    marginBottom: 12,
    borderLeftWidth: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  productName: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: 'center',
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    width: '100%',
    maxHeight: '85%',
    maxWidth: 500,
  },
  completionModalContent: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoCard: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    lineHeight: 22,
  },
  modalActions: {
    gap: 12,
    marginTop: 8,
  },
  modalActionButton: {
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 22,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
  },
});

export default TaskManagement;