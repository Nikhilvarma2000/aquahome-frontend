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
import { ServiceRequest } from '../../types';
import { useFocusEffect } from '@react-navigation/native';
import { agentService } from '../../services/agentService';

const ServiceLogs = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completedServices, setCompletedServices] = useState<ServiceRequest[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceRequest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'month' | 'week'>('all');

  // Simulated fetch completed services function
  const fetchCompletedServices = async () => {
    try {
      const response = await agentService.getLogs();
      const data = response.data.filter(task => task.status === 'completed');
      setCompletedServices(data);
    } catch (error) {
      console.error('Error fetching service logs:', error);
      Alert.alert('Error', 'Failed to load service logs. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };


  // Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchCompletedServices();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCompletedServices();
  };

  const handleServicePress = (service: ServiceRequest) => {
    setSelectedService(service);
    setModalVisible(true);
  };

  const getFilteredServices = () => {
    let filtered = [...completedServices];
    
    // Apply date filter
    if (dateFilter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(service => 
        new Date(service.completionDate as string) >= oneWeekAgo
      );
    } else if (dateFilter === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filtered = filtered.filter(service => 
        new Date(service.completionDate as string) >= oneMonthAgo
      );
    }
    
    // Apply search text filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(service => 
        service.user?.name.toLowerCase().includes(searchLower) ||
        service.user?.address?.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower) ||
        service.type.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return 'tool';
      case 'repair':
        return 'settings';
      case 'installation':
        return 'package';
      case 'removal':
        return 'trash-2';
      default:
        return 'help-circle';
    }
  };

  const renderServiceItem = ({ item }: { item: ServiceRequest }) => (
    <TouchableOpacity 
      onPress={() => handleServicePress(item)}
      style={[styles.serviceItem, { backgroundColor: colors.card }]}
    >
      <View style={styles.serviceHeader}>
        <View style={styles.serviceIconContainer}>
          <Feather name={getServiceTypeIcon(item.type) as any} size={20} color={colors.primary} />
        </View>
        <View style={styles.serviceInfo}>
          <Text style={[styles.serviceType, { color: colors.text }]}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
          <Text style={[styles.customerName, { color: colors.textSecondary }]}>
            {item.user?.name}
          </Text>
        </View>
        <Text style={[styles.serviceDate, { color: colors.textSecondary }]}>
          {formatDate(item.completionDate as string)}
        </Text>
      </View>
      <View style={styles.serviceDescription}>
        <Text style={[styles.descriptionText, { color: colors.text }]} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <View style={styles.serviceFooter}>
        <View style={styles.ratingContainer}>
          {item.rating && (
            <>
              <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>Rating: </Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Feather
                    key={star}
                    name="star"
                    size={14}
                    color={star <= item.rating! ? '#FFC107' : '#E0E0E0'}
                    style={{ marginRight: 2 }}
                  />
                ))}
              </View>
            </>
          )}
        </View>
        <Feather name="chevron-right" size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading service logs...</Text>
      </View>
    );
  }

  const filteredServices = getFilteredServices();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search and Filter Section */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: `${colors.text}10`, borderColor: colors.border }]}>
          <Feather name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by customer, type, or description"
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Feather name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: dateFilter === 'all' ? colors.primary : 'transparent' }
            ]}
            onPress={() => setDateFilter('all')}
          >
            <Text style={{ color: dateFilter === 'all' ? 'white' : colors.text }}>All Time</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: dateFilter === 'month' ? colors.primary : 'transparent' }
            ]}
            onPress={() => setDateFilter('month')}
          >
            <Text style={{ color: dateFilter === 'month' ? 'white' : colors.text }}>Last Month</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: dateFilter === 'week' ? colors.primary : 'transparent' }
            ]}
            onPress={() => setDateFilter('week')}
          >
            <Text style={{ color: dateFilter === 'week' ? 'white' : colors.text }}>Last Week</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Service Logs List */}
      <FlatList
        data={filteredServices}
        renderItem={renderServiceItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
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
            <Feather name="file-text" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Service Logs Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {searchText.length > 0 
                ? 'No results match your search criteria'
                : dateFilter !== 'all'
                  ? `No service logs found for the selected time period`
                  : 'No completed services found'
              }
            </Text>
          </View>
        }
        ListHeaderComponent={
          filteredServices.length > 0 ? (
            <View style={styles.listHeader}>
              <Text style={[styles.resultCount, { color: colors.text }]}>
                {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
              </Text>
            </View>
          ) : null
        }
      />

      {/* Service Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Service Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedService && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.serviceTypeContainer}>
                  <View style={[styles.serviceTypeBadge, { backgroundColor: `${colors.primary}20` }]}>
                    <Text style={[styles.serviceTypeText, { color: colors.primary }]}>
                      {selectedService.type.charAt(0).toUpperCase() + selectedService.type.slice(1)}
                    </Text>
                  </View>
                  <View style={[styles.completedBadge, { backgroundColor: `${colors.success}20` }]}>
                    <Text style={[styles.completedText, { color: colors.success }]}>Completed</Text>
                  </View>
                </View>

                <Card style={styles.detailsCard}>
                  <View style={styles.detailRow}>
                    <Feather name="calendar" size={16} color={colors.primary} />
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Completed:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {formatDate(selectedService.completionDate as string)}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Feather name="user" size={16} color={colors.primary} />
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Customer:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {selectedService.user?.name}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Feather name="map-pin" size={16} color={colors.primary} />
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Location:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {selectedService.user?.city}, {selectedService.user?.state}
                    </Text>
                  </View>
                </Card>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Service Description</Text>
                <Card style={styles.descriptionCard}>
                  <Text style={[styles.descriptionContent, { color: colors.text }]}>
                    {selectedService.description}
                  </Text>
                </Card>

                {selectedService.feedback && (
                  <>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Customer Feedback</Text>
                    <Card style={styles.feedbackCard}>
                      <View style={styles.ratingRow}>
                        <Text style={[styles.ratingTitle, { color: colors.textSecondary }]}>Rating:</Text>
                        <View style={styles.starsRow}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Feather
                              key={star}
                              name="star"
                              size={16}
                              color={star <= (selectedService.rating || 0) ? '#FFC107' : '#E0E0E0'}
                              style={{ marginRight: 3 }}
                            />
                          ))}
                        </View>
                      </View>
                      <Text style={[styles.feedbackContent, { color: colors.text }]}>
                        "{selectedService.feedback}"
                      </Text>
                    </Card>
                  </>
                )}

                <Button
                  title="Contact Customer"
                  onPress={() => {
                    setModalVisible(false);
                    // In a real app, this would open a phone dialer or messaging interface
                    if (selectedService.user?.phone) {
                      Alert.alert('Contact Customer', `Calling ${selectedService.user.name} at ${selectedService.user.phone}`);
                    } else {
                      Alert.alert('Contact Customer', `Email ${selectedService.user?.name} at ${selectedService.user?.email}`);
                    }
                  }}
                  variant="outline"
                  style={styles.contactButton}
                  icon={<Feather name="phone" size={16} color={colors.primary} />}
                />
              </ScrollView>
            )}
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
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 80,
  },
  listContainer: {
    padding: 16,
  },
  listHeader: {
    marginBottom: 12,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  serviceItem: {
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceIconContainer: {
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  customerName: {
    fontSize: 14,
  },
  serviceDate: {
    fontSize: 12,
  },
  serviceDescription: {
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 12,
    marginRight: 4,
  },
  starsContainer: {
    flexDirection: 'row',
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
    maxWidth: '70%',
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
  serviceTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  serviceTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
  },
  serviceTypeText: {
    fontWeight: '500',
    fontSize: 14,
  },
  completedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  completedText: {
    fontWeight: '500',
    fontSize: 14,
  },
  detailsCard: {
    padding: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    marginLeft: 8,
    width: 80,
    fontWeight: '500',
  },
  detailValue: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  descriptionCard: {
    padding: 12,
    marginBottom: 16,
  },
  descriptionContent: {
    lineHeight: 20,
  },
  feedbackCard: {
    padding: 12,
    marginBottom: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingTitle: {
    fontWeight: '500',
    marginRight: 8,
  },
  starsRow: {
    flexDirection: 'row',
  },
  feedbackContent: {
    fontStyle: 'italic',
    lineHeight: 20,
  },
  contactButton: {
    marginBottom: 24,
  },
});

export default ServiceLogs;