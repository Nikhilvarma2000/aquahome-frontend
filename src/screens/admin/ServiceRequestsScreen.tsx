import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Animated,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { ServiceRequest, User } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import { adminService } from '../../services/adminService';
import { franchiseService } from '../../services/franchiseService';
import { useAuth } from '../../hooks/useAuth';
import api from '@/services/api';

const ServiceRequestsScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { user, token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected request for actions
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [franchises, setFranchises] = useState<User[]>([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>('');
  const [agentModalVisible, setAgentModalVisible] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [agents, setAgents] = useState<User[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  useEffect(() => {
    fetchServiceRequests();
    // fetchFranchises();
    fetchAgents();
  }, [refresh]);

  useEffect(() => {
    applyFilters();
  }, [selectedFilter, searchQuery, requests]);

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      let data;

      if (user?.role === 'admin') {
        data = await adminService.getServiceRequests();
        console.log("🚀 ~ fetchServiceRequests ~ data:", data)
      } else if (user?.role === 'franchise_owner') {
        // Filter requests by franchise if needed
        data = await adminService.getServiceRequests();
        // console.log("🚀 ~ fetchServiceRequests ~ allRequests:", allRequests)
        // data = allRequests.filter(req => req.franchiseId === parseInt(user.id));
      } else {
        console.warn('⚠️ Unknown role, skipping fetch.');
        return;
      }

      if (!Array.isArray(data)) {
        console.error('🚨 Data is not an array:', data);
        setRequests([]);
        setFilteredRequests([]);
        return;
      }

      setRequests(data);
      setFilteredRequests(data);
    } catch (error) {
      console.error('❌ Error fetching service requests:', error);
      Alert.alert('Error', 'Failed to load service requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFranchises = async () => {
    try {
      const data = await adminService.getAllFranchises();
      setFranchises(data);
    } catch (error) {
      console.error('Error fetching franchises:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      let response;
      if (user?.role === "admin") {
        response = await api.get("/admin/users/role/service_agent");
      } else if (user?.role === "franchise_owner") {
        response = await franchiseService.getFranchiseAgents(token);
      } else {
        console.warn("⚠️ Agent fetch skipped: Unknown role");
        return;
      }

      const normalized = response.map((agent: any) => ({
        ...agent,
        id: agent.id || agent.ID,
      }));

      setAgents(normalized);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const applyFilters = () => {
    let result = [...requests];

    // Apply status filter
    if (selectedFilter !== 'all') {
      result = result.filter(request => request.status === selectedFilter);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(request =>
        request.customer_name?.toLowerCase().includes(query) ||
        request.product_name?.toLowerCase().includes(query) ||
        request?.id?.toString().includes(query)
      );
    }

    setFilteredRequests(result);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchServiceRequests();
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest || !selectedStatus) return;

    try {
      const updatedRequest = await adminService.updateServiceRequestStatus(selectedRequest.id, selectedStatus);

      // Update local state
      const updatedRequests = requests.map(req =>
        req.id === selectedRequest.id ? { ...req, ...updatedRequest } : req
      );

      setRequests(updatedRequests);
      setStatusModalVisible(false);

      Alert.alert('Success', 'Status updated successfully');
      setRefresh(!refresh);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  // const handleAssignToFranchise = async () => {
  //   if (!selectedRequest || !selectedFranchiseId) return;

  //   try {
  //     const updatedRequest = await adminService.updateServiceRequest(selectedRequest.id, {
  //       franchiseId: parseInt(selectedFranchiseId)
  //     });

  //     // Update local state
  //     const updatedRequests = requests.map(req => 
  //       req.id === selectedRequest.id 
  //         ? { 
  //             ...req, 
  //             ...updatedRequest,
  //             franchiseId: parseInt(selectedFranchiseId)
  //           } 
  //         : req
  //     );

  //     setRequests(updatedRequests);
  //     setAssignModalVisible(false);
  //     Alert.alert('Success', 'Assigned to franchise successfully');
  //   } catch (error) {
  //     console.error('Error assigning to franchise:', error);
  //     Alert.alert('Error', 'Failed to assign to franchise');
  //   }
  // };

  const handleAssignToAgent = async () => {
    if (!selectedRequest || !selectedAgentId) return;

    try {
      const updatedRequest = await adminService.updateServiceRequest(selectedRequest.id, parseInt(selectedAgentId));

      // Update local state
      const updatedRequests = requests.map(req =>
        req.id === selectedRequest.id
          ? {
            ...req,
            ...updatedRequest,
            agentId: selectedAgentId,
            agent: agents.find(a => a.id === selectedAgentId)
          }
          : req
      );

      setRequests(updatedRequests);
      setAgentModalVisible(false);
   
      Alert.alert('Success', 'Assigned to agent successfully');
      setRefresh(!refresh);
    } catch (error) {
      console.error('Error assigning to agent:', error);
      Alert.alert('Error', 'Failed to assign to agent');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'in_progress':
        return '#2196f3';
      case 'assigned':
        return '#9c27b0';
      case 'cancelled':
        return '#f44336';
      case 'pending':
      default:
        return '#ff9800';
    }
  };

  const renderItem = ({ item }: { item: ServiceRequest }) => (
    <Card style={[styles.card, { borderLeftWidth: 4, borderLeftColor: getStatusColor(item.status) }]}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={[styles.requestId, { color: colors.primary }]}>
            Request #{item.id}
          </Text>
          <Text style={[styles.customerName, { color: colors.text }]}>
            {item.user?.name || 'Customer'}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Feather name="tool" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.text }]}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
        </View>
        {item.scheduledDate && (
          <View style={styles.detailRow}>
            <Feather name="clock" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.text }]}>
              {new Date(item.scheduledDate).toLocaleString()}
            </Text>
          </View>
        )}
        {item.franchiseId && (
          <View style={styles.detailRow}>
            <Feather name="home" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.text }]}>
              Franchise ID: {item.franchiseId}
            </Text>
          </View>
        )}
        {item.agent && (
          <View style={styles.detailRow}>
            <Feather name="user" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.text }]}>
              {item.agent.name}
            </Text>
          </View>
        )}
      </View>

      {/* customer */}

      <View>
        <Text style={[styles.customerName, { color: colors.text }]}>
          Customer Name: {item.customer_name || 'N/A'}
        </Text>
        <Text style={[styles.customerName, { color: colors.text }]}>
          Customer Phone: {item.customer_phone || 'N/A'}
        </Text>
      </View>

      <View>
        <Text style={[styles.customerName, { color: colors.text }]}>
          Service Agent Name: {item.service_agent_name || 'N/A'}
        </Text>

      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: colors.primary }]}
          onPress={() => {
            setSelectedRequest(item);
            setSelectedStatus(item.status);
            setStatusModalVisible(true);
          }}
        >
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>
            Update Status
          </Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={[styles.actionButton, { borderColor: colors.primary }]}
          onPress={() => {
            setSelectedRequest(item);
            setSelectedFranchiseId(item.franchiseId?.toString() || '');
            setAssignModalVisible(true);
          }}
        >
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>
            Assign Franchise
          </Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={[styles.actionButton, { borderColor: colors.primary }]}
          onPress={() => {
            setSelectedRequest(item);
            setSelectedAgentId(item.agentId?.toString() || '');
            setAgentModalVisible(true);
          }}
        >
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>
            Assign Agent
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading && !refreshing) {
    return <Loading />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Service Requests</Text>
      </View> */}

      {/* Search and Filter */}
      <View style={[styles.searchContainer, { borderColor: colors.border }]}>
        <View style={[styles.searchInputContainer, {
          borderColor: isSearchFocused ? colors.primary : colors.border,
          backgroundColor: colors.card
        }]}>
          <Feather name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            placeholder="Search requests..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {['all', 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && { backgroundColor: colors.primary },
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  { color: selectedFilter === filter ? '#fff' : colors.text },
                ]}
              >
                {filter.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Requests List */}
      <FlatList
        data={filteredRequests}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={50} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No service requests found
            </Text>
          </View>
        }
      />

      {/* Status Update Modal */}
      <Modal
        visible={statusModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.card,
                transform: [{ translateY: fadeAnim }]
              }
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Update Status
            </Text>

            <View style={styles.statusOptionsContainer}>
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.statusOption,
                    selectedStatus === option.value && {
                      backgroundColor: colors.primary + '20',
                      borderColor: colors.primary,
                    },
                    { borderColor: colors.border }
                  ]}
                  onPress={() => setSelectedStatus(option.value)}
                >
                  <View style={[
                    styles.statusRadio,
                    selectedStatus === option.value && {
                      borderColor: colors.primary,
                      backgroundColor: colors.primary,
                    }
                  ]}>
                    {selectedStatus === option.value && (
                      <Feather name="check" size={14} color="#fff" />
                    )}
                  </View>
                  <Text style={[styles.statusOptionText, { color: colors.text }]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setStatusModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
                textStyle={{ color: colors.text }}
              />
              <Button
                title="Update"
                onPress={handleUpdateStatus}
                style={styles.modalButton}
                disabled={!selectedStatus || selectedStatus === selectedRequest?.status}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>


      {/* Assign to Agent Modal */}
      <Modal
        visible={agentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAgentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Assign to Agent
            </Text>

            <View style={styles.pickerContainer}>
              <Text style={[styles.pickerLabel, { color: colors.text }]}>
                Select Agent
              </Text>
              <View style={[styles.picker, { borderColor: colors.border }]}>
                <Picker
                  selectedValue={selectedAgentId}
                  onValueChange={(itemValue: string) => setSelectedAgentId(itemValue)}
                  style={[styles.picker, { color: colors.text }]}
                  itemStyle={{ color: colors.text }}
                >
                  <Picker.Item label="Select an agent..." value="" />
                  {agents.map((agent) => (
                    <Picker.Item
                      key={agent.id}
                      label={agent.name}
                      value={agent.id.toString()}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setAgentModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
                textStyle={{ color: colors.text }}
              />
              <Button
                title="Assign"
                onPress={handleAssignToAgent}
                style={styles.modalButton}
                disabled={!selectedAgentId}
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  filterContainer: {
    paddingVertical: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  requestId: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  detailsContainer: {
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginHorizontal: -4,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    margin: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  statusOptionsContainer: {
    marginBottom: 24,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  statusRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusOptionText: {
    fontSize: 16,
  },
  pickerContainer: {
    marginBottom: 24,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default ServiceRequestsScreen;
