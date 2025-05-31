import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { agentService } from '../../services/agentService';
import { Order } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import { Feather } from '@expo/vector-icons';

const AgentOrdersScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await agentService.getOrders();
      console.log("Orders:", response.data);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !selectedStatus) return;

    try {
      await agentService.updateOrderStatus(selectedOrder.id.toString(), { 
        status: selectedStatus 
      });
      
      // Update the local state
      const updatedOrders = orders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: selectedStatus } 
          : order
      );
      
      setOrders(updatedOrders);
      setStatusModalVisible(false);
      setSelectedOrder(null);
      setSelectedStatus('');
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <Card style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={[styles.orderId, { color: colors.primary }]}>
          Order #{item.id}
        </Text>
        <View 
          style={[
            styles.statusBadge, 
            { 
              backgroundColor: getStatusColor(item.status),
              borderColor: colors.border
            }
          ]}
        >
          <Text style={styles.statusText}>
            {item?.status.charAt(0).toUpperCase() + item?.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.orderDetails}>
        <Text style={styles.text}>
          <Text style={styles.label}>Customer: </Text>
          {item?.customer_name || 'N/A'}({item?.customer_phone})
        </Text>
        
        <Text style={styles.text}>
          <Text style={styles.label}>Amount: </Text>
          ₹{item?.total_amount?.toFixed(2)}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.label}>Delivery Date: </Text>
          {new Date(item?.delivery_date).toLocaleDateString()}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.label}>Delivery Address: </Text>
          {item?.delivery_address}
        </Text>
      </View>
      
      <View style={styles.actionButtons}>
        <Button 
          title="Update Status" 
          onPress={() => {
            setSelectedOrder(item);
            setSelectedStatus(item.status);
            setStatusModalVisible(true);
          }}
          style={styles.updateButton}
          textStyle={styles.buttonText}
        />
      </View>
    </Card>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#4caf50';
      case 'shipped':
        return '#2196f3';
      case 'processing':
        return '#ff9800';
      case 'confirmed':
        return '#9c27b0';
      case 'pending':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  if (loading && !refreshing) {
    return <Loading />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Orders</Text>
      </View>
      
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="package" size={48} color={colors.text} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No orders assigned to you yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
      
      {/* Status Update Modal */}
      <Modal
        visible={statusModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Update Order Status
            </Text>
            
            <Text style={[styles.modalText, { color: colors.text }]}>
              Order #{selectedOrder?.id}
            </Text>
            
            <View style={styles.statusOptions}>
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.statusOption,
                    selectedStatus === option.value && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                    { borderColor: colors.border }
                  ]}
                  onPress={() => setSelectedStatus(option.value)}
                >
                  <Text 
                    style={[
                      styles.statusOptionText,
                      selectedStatus === option.value && styles.selectedStatusText
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setStatusModalVisible(false)}
                style={[styles.modalButton, { borderColor: colors.border }]}
                textStyle={[styles.modalButtonText, { color: colors.text }]}
                variant="outline"
              />
              <Button
                title="Update"
                onPress={handleUpdateStatus}
                style={styles.modalButton}
                textStyle={styles.modalButtonText}
                disabled={!selectedStatus || selectedStatus === selectedOrder?.status}
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
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  orderCard: {
    marginBottom: 16,
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  orderDetails: {
    marginBottom: 12,
  },
  text: {
    marginBottom: 4,
    fontSize: 14,
  },
  label: {
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  updateButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  statusOptions: {
    marginBottom: 24,
  },
  statusOption: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusOptionText: {
    fontSize: 14,
    textAlign: 'center',
  },
  selectedStatusText: {
    color: '#fff',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default AgentOrdersScreen;
