import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Order, User } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import OrderItem from '../../components/OrderItem';

// This would be replaced with a real service in production
const orderService = {
  async getOrders(): Promise<Order[]> {
    // Simulated API call
    return [];
  },
  
  async filterOrders(status?: string): Promise<Order[]> {
    // Simulated API call
    return [];
  },
  
  async assignOrder(orderId: string, franchiseId: string): Promise<Order> {
    // Simulated API call
    console.log(`Assigning order ${orderId} to franchise ${franchiseId}`);
    return {} as Order;
  },
  
  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    // Simulated API call
    console.log(`Updating order ${orderId} status to ${status}`);
    return {} as Order;
  }
};

const franchiseService = {
  async getFranchises(): Promise<User[]> {
    // Simulated API call
    return [
      {
        id: '1',
        name: 'North Delhi Franchise',
        email: 'northdelhi@aquahome.com',
        role: 'franchise_owner',
        phone: '+91 9876543210',
        address: '123 Business Hub, Sector 4',
        city: 'New Delhi',
        state: 'Delhi',
        zipCode: '110001',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-05-20T14:45:00Z'
      },
      {
        id: '2',
        name: 'South Delhi Franchise',
        email: 'southdelhi@aquahome.com',
        role: 'franchise_owner',
        phone: '+91 9876543211',
        address: '456 Metro Complex, Sector 18',
        city: 'New Delhi',
        state: 'Delhi',
        zipCode: '110016',
        createdAt: '2023-02-10T09:15:00Z',
        updatedAt: '2023-05-25T11:20:00Z'
      },
      {
        id: '3',
        name: 'Noida Franchise',
        email: 'noida@aquahome.com',
        role: 'franchise_owner',
        phone: '+91 9876543212',
        address: '789 Sector 62',
        city: 'Noida',
        state: 'Uttar Pradesh',
        zipCode: '201301',
        createdAt: '2023-03-05T14:20:00Z',
        updatedAt: '2023-05-18T16:30:00Z'
      }
    ];
  }
};

const OrderManagement = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // Selected order for actions
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [franchises, setFranchises] = useState<User[]>([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
  useEffect(() => {
    fetchOrders();
    fetchFranchises();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [selectedFilter, orders]);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrders();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchFranchises = async () => {
    try {
      const data = await franchiseService.getFranchises();
      setFranchises(data);
    } catch (error) {
      console.error('Error fetching franchises:', error);
    }
  };
  
  const applyFilters = () => {
    if (selectedFilter === 'all') {
      setFilteredOrders(orders);
      return;
    }
    
    const filtered = orders.filter(order => order.status === selectedFilter);
    setFilteredOrders(filtered);
  };
  
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };
  
  const handleShowAssignModal = (order: Order) => {
    setSelectedOrder(order);
    setSelectedFranchiseId('');
    setAssignModalVisible(true);
  };
  
  const handleShowStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setSelectedStatus(order.status);
    setStatusModalVisible(true);
  };
  
  const handleAssignOrder = async () => {
    if (!selectedOrder || !selectedFranchiseId) {
      Alert.alert('Error', 'Please select a franchise');
      return;
    }
    
    try {
      await orderService.assignOrder(selectedOrder.id, selectedFranchiseId);
      
      // Update local state
      const updatedOrders = orders.map(order => {
        if (order.id === selectedOrder.id) {
          return { ...order, franchiseId: selectedFranchiseId };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      applyFilters();
      
      Alert.alert('Success', 'Order assigned successfully');
      setAssignModalVisible(false);
    } catch (error) {
      console.error('Error assigning order:', error);
      Alert.alert('Error', 'Failed to assign order');
    }
  };
  
  const handleUpdateStatus = async () => {
    if (!selectedOrder || !selectedStatus) {
      Alert.alert('Error', 'Please select a status');
      return;
    }
    
    try {
      await orderService.updateOrderStatus(selectedOrder.id, selectedStatus);
      
      // Update local state
      const updatedOrders = orders.map(order => {
        if (order.id === selectedOrder.id) {
          return { ...order, status: selectedStatus };
        }
        return order;
      });
      
      setOrders(updatedOrders as any);
      applyFilters();
      
      Alert.alert('Success', 'Order status updated successfully');
      setStatusModalVisible(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };
  
  const renderOrderItem = ({ item }: { item: Order }) => (
    <OrderItem
      order={item}
      onPress={() => navigation.navigate(
        'OrderDetails', 
        { orderId: item.id }
      )}
    />
  );
  
  const FilterTab = ({ title, value, current }: { title: string, value: string, current: string }) => (
    <TouchableOpacity
      style={[
        styles.filterTab,
        value === current && [styles.activeFilterTab, { borderColor: colors.primary }]
      ]}
      onPress={() => handleFilterChange(value)}
    >
      <Text
        style={[
          styles.filterTabText,
          { color: value === current ? colors.primary : colors.textSecondary }
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
  
  if (loading) {
    return <Loading />;
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Order Management</Text>
        <Button
          title="Export Data"
          onPress={() => Alert.alert('Export', 'Export functionality to be implemented')}
          variant="outline"
          icon={<Feather name="download" size={18} color={colors.primary} />}
        />
      </View>
      
      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterTabsContainer}
        contentContainerStyle={styles.filterTabs}
      >
        <FilterTab title="All Orders" value="all" current={selectedFilter} />
        <FilterTab title="Pending" value="pending" current={selectedFilter} />
        <FilterTab title="Confirmed" value="confirmed" current={selectedFilter} />
        <FilterTab title="Processing" value="processing" current={selectedFilter} />
        <FilterTab title="Shipped" value="shipped" current={selectedFilter} />
        <FilterTab title="Delivered" value="delivered" current={selectedFilter} />
        <FilterTab title="Cancelled" value="cancelled" current={selectedFilter} />
      </ScrollView>
      
      {/* Order List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="package" size={50} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No orders found
            </Text>
            <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
              {selectedFilter === 'all' 
                ? 'There are no orders in the system yet' 
                : `There are no orders with '${selectedFilter}' status`}
            </Text>
          </View>
        }
      />
      
      {/* Assign Franchise Modal */}
      <Modal
        visible={assignModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAssignModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Assign Order to Franchise
              </Text>
              <TouchableOpacity onPress={() => setAssignModalVisible(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {selectedOrder && (
              <View style={styles.orderSummary}>
                <Text style={[styles.orderSummaryTitle, { color: colors.text }]}>
                  Order #{selectedOrder.id.substring(0, 8)}
                </Text>
                <Text style={[styles.orderSummaryText, { color: colors.textSecondary }]}>
                  Customer: {selectedOrder.user?.name || 'Unknown'}
                </Text>
                <Text style={[styles.orderSummaryText, { color: colors.textSecondary }]}>
                  Type: {selectedOrder.orderType.charAt(0).toUpperCase() + selectedOrder.orderType.slice(1)}
                </Text>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              </View>
            )}
            
            <Text style={[styles.modalSubtitle, { color: colors.text }]}>
              Select a franchise to assign this order:
            </Text>
            
            <ScrollView style={styles.franchiseListContainer}>
              {franchises.map(franchise => (
                <TouchableOpacity 
                  key={franchise.id}
                  style={[
                    styles.franchiseItem,
                    selectedFranchiseId === franchise.id && 
                    { backgroundColor: colors.primary + '20' }
                  ]}
                  onPress={() => setSelectedFranchiseId(franchise.id)}
                >
                  <View>
                    <Text style={[styles.franchiseName, { color: colors.text }]}>
                      {franchise.name}
                    </Text>
                    <Text style={[styles.franchiseLocation, { color: colors.textSecondary }]}>
                      {franchise.city}, {franchise.state}
                    </Text>
                  </View>
                  
                  {selectedFranchiseId === franchise.id && (
                    <Feather name="check-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                onPress={() => setAssignModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Assign Order"
                onPress={handleAssignOrder}
                disabled={!selectedFranchiseId}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Update Status Modal */}
      <Modal
        visible={statusModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Update Order Status
              </Text>
              <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {selectedOrder && (
              <View style={styles.orderSummary}>
                <Text style={[styles.orderSummaryTitle, { color: colors.text }]}>
                  Order #{selectedOrder.id.substring(0, 8)}
                </Text>
                <Text style={[styles.orderSummaryText, { color: colors.textSecondary }]}>
                  Customer: {selectedOrder.user?.name || 'Unknown'}
                </Text>
                <Text style={[styles.orderSummaryText, { color: colors.textSecondary }]}>
                  Current Status: {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </Text>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              </View>
            )}
            
            <Text style={[styles.modalSubtitle, { color: colors.text }]}>
              Select a new status:
            </Text>
            
            <ScrollView style={styles.statusListContainer}>
              {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                <TouchableOpacity 
                  key={status}
                  style={[
                    styles.statusItem,
                    selectedStatus === status && 
                    { backgroundColor: colors.primary + '20' }
                  ]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <Text style={[
                    styles.statusName, 
                    { color: selectedStatus === status ? colors.primary : colors.text }
                  ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                  
                  {selectedStatus === status && (
                    <Feather name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                onPress={() => setStatusModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Update Status"
                onPress={handleUpdateStatus}
                disabled={!selectedStatus || selectedOrder?.status === selectedStatus}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Bottom Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('PendingOrders' as never)}
        >
          <Feather name="clock" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>View Pending</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.success }]}
          onPress={() => navigation.navigate('RecentlyDelivered' as never)}
        >
          <Feather name="check-circle" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Recently Delivered</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterTabsContainer: {
    marginBottom: 16,
  },
  filterTabs: {
    paddingRight: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeFilterTab: {
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 100, // Space for bottom action buttons
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  orderSummary: {
    marginBottom: 16,
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  orderSummaryText: {
    fontSize: 14,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  franchiseListContainer: {
    maxHeight: 300,
    marginBottom: 16,
  },
  franchiseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  franchiseName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  franchiseLocation: {
    fontSize: 14,
  },
  statusListContainer: {
    maxHeight: 200,
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusName: {
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default OrderManagement;