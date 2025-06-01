import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { franchiseService } from '../../services/franchiseService';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

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
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Order, User } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import OrderItem from '../../components/OrderItem';

const OrderManagement = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { user, token } = useAuth();

  console.log("👤 Logged-in user role:", user);

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
  const [agentModalVisible, setAgentModalVisible] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [agents, setAgents] = useState<User[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    fetchOrders();
    fetchFranchises();
    fetchAgents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedFilter, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      let rawData = [];

      if (user?.role === "admin") {
        rawData = await adminService.getAllOrders();
      } else if (user?.role === "franchise_owner") {
        rawData = await franchiseService.getFranchiseOrders(token!, user?.franchise_id!);
      } else {
        console.warn("⚠️ Unknown role, skipping fetch.");
        return;
      }

      if (!Array.isArray(rawData)) {
        console.error('🚨 rawData is not an array:', rawData);
        setOrders([]);
        setFilteredOrders([]);
        return;
      }

      const data = rawData.map((item, index) => {
        const order = item.order || item;
        const orderId = order.id || order.ID || item.ID || `temp-${index}`;

        return {
          id: orderId,
          ...order,
          product: item.product || order.product || {},
          customer: item.customer || order.customer || {},
          franchise: item.franchise || order.franchise || {},
          totalAmount: order.total_initial_amount ?? 0,
        };
      });

      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchFranchises = async () => {
    try {
      const data = await franchiseService.getAllFranchises();
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
        response = await franchiseService.getFranchiseAgents();
      } else {
        console.warn("⚠️ Agent fetch skipped: Unknown role");
        return;
      }

      const normalized = response.data.map((agent: any) => ({
        ...agent,
        id: agent.id || agent.ID,
      }));

      setAgents(normalized);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const applyFilters = () => {
    let filtered = orders;

    switch (selectedFilter) {
      case 'pending':
        filtered = orders.filter(order => order.status === 'pending');
        break;
      case 'recently_delivered':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filtered = orders.filter(order => {
          if (order.status !== 'delivered') return false;
          if (!order.updatedAt) return false;
          const updatedAt = new Date(order.updatedAt);
          return updatedAt >= oneWeekAgo;
        });
        break;
      case 'processing':
        filtered = orders.filter(order => order.status === 'processing');
        break;
      case 'shipped':
        filtered = orders.filter(order => order.status === 'shipped');
        break;
      case 'delivered':
        filtered = orders.filter(order => order.status === 'delivered');
        break;
      case 'cancelled':
        filtered = orders.filter(order => order.status === 'cancelled');
        break;
      case 'confirmed':
        filtered = orders.filter(order => order.status === 'confirmed');
        break;
      default:
        filtered = orders;
    }

    setFilteredOrders(filtered);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  // Quick filter functions for bottom buttons
  const handleViewPending = () => {
    setSelectedFilter('pending');
  };

  const handleViewRecentlyDelivered = () => {
    setSelectedFilter('recently_delivered');
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
      await adminService.assignOrder(selectedOrder.id, selectedFranchiseId);

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

  const handleAssignAgent = async () => {
    if (!selectedOrder || !selectedAgentId) {
      Alert.alert('Error', 'Please select a service agent');
      return;
    }

    try {
      await adminService.assignOrderToAgent(selectedOrder.id, Number(selectedAgentId));

      const updatedOrders = orders.map(order => {
        if (order.id === selectedOrder.id) {
          return { ...order, serviceAgentId: Number(selectedAgentId) };
        }
        return order;
      });

      setOrders(updatedOrders);
      applyFilters();
      Alert.alert('Success', 'Service agent assigned successfully');
      setAgentModalVisible(false);
    } catch (error) {
      console.error('Error assigning service agent:', error);
      Alert.alert('Error', 'Failed to assign service agent');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !selectedStatus) {
      Alert.alert('Error', 'Please select a status');
      return;
    }

    try {
      await adminService.updateOrderStatus(selectedOrder.id, selectedStatus);

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

  const renderOrderItem = ({ item }: { item: Order }) => {
    console.log("🧪 FlatList item:", item);

    return (
      <Card style={styles.orderCard}>
        <OrderItem
          order={item}
          onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
        />
        <View style={styles.orderActions}>

          {
            item.status !== "cancelled" && item.status !== "delivered" && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
                onPress={() => {
                  setSelectedOrder(item);
                  setAgentModalVisible(true);
                }}
              >
                <Feather name="user-plus" size={16} color={colors.primary} />
                <Text style={[styles.actionBtnText, { color: colors.primary }]}>Assign Agent</Text>
              </TouchableOpacity>
            )
          }

          {
            item.status !== "cancelled" && item.status !== "delivered" && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
                onPress={() => {
                  setSelectedOrder(item);
                  console.log("📦 Selected Order:", item);
                  setAssignModalVisible(true);
                }}
              >
                <Feather name="user-plus" size={16} color={colors.primary} />
                <Text style={[styles.actionBtnText, { color: colors.primary }]}>Assign Franchise</Text>
              </TouchableOpacity>
            )
          }


          
        </View>
        <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.success + '15', borderColor: colors.success,marginTop:10}]}
            onPress={() => {
              setSelectedOrder(item);
              setStatusModalVisible(true);
            }}
          >
            <Feather name="edit-3" size={16} color={colors.success} />
            <Text style={[styles.actionBtnText, { color: colors.success }]}>Update Status</Text>
          </TouchableOpacity>
      </Card>
    );
  };

  const FilterTab = ({ title, value, current, count }: { title: string, value: string, current: string, count?: number }) => {
    const isActive = value === current;
    return (
      <TouchableOpacity
        style={[
          styles.filterTab,
          { borderColor: colors.border },
          isActive && [styles.activeFilterTab, {
            borderColor: colors.primary,
            backgroundColor: colors.primary + '10'
          }]
        ]}
        onPress={() => handleFilterChange(value)}
      >
        <Text
          style={[
            styles.filterTabText,
            { color: isActive ? colors.primary : colors.textSecondary }
          ]}
        >
          {title}
        </Text>
        {count !== undefined && count > 0 && (
          <View style={[styles.filterBadge, { backgroundColor: isActive ? colors.primary : colors.textSecondary }]}>
            <Text style={styles.filterBadgeText}>{count}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Calculate counts for each filter
  const getFilterCounts = () => {
    const counts = {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      recently_delivered: (() => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return orders.filter(order => {
          if (order.status !== 'delivered') return false;
          if (!order.updatedAt) return false;
          const updatedAt = new Date(order.updatedAt);
          return updatedAt >= oneWeekAgo;
        }).length;
      })(),
    };
    return counts;
  };

  const filterCounts = getFilterCounts();

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Order Management</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {filteredOrders.length} of {orders.length} orders
          </Text>
        </View>
        <Button
          title="Export"
          onPress={() => Alert.alert('Export', 'Export functionality to be implemented')}
          variant="outline"
          icon={<Feather name="download" size={18} color={colors.primary} />}
          style={styles.exportBtn}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabs}
        >
          <FilterTab title="All Orders" value="all" current={selectedFilter} count={filterCounts.all} />
          <FilterTab title="Pending" value="pending" current={selectedFilter} count={filterCounts.pending} />
          <FilterTab title="Recently Delivered" value="recently_delivered" current={selectedFilter} count={filterCounts.recently_delivered} />
          <FilterTab title="Processing" value="processing" current={selectedFilter} count={filterCounts.processing} />
          <FilterTab title="Shipped" value="shipped" current={selectedFilter} count={filterCounts.shipped} />
          <FilterTab title="Delivered" value="delivered" current={selectedFilter} count={filterCounts.delivered} />
          <FilterTab title="Cancelled" value="cancelled" current={selectedFilter} count={filterCounts.cancelled} />
        </ScrollView>
      </View>

      {/* Active Filter Indicator */}
      {selectedFilter !== 'all' && (
        <View style={[styles.activeFilterIndicator, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
          <Feather name="filter" size={16} color={colors.primary} />
          <Text style={[styles.activeFilterText, { color: colors.primary }]}>
            Showing {selectedFilter.replace('_', ' ')} orders ({filteredOrders.length})
          </Text>
          <TouchableOpacity onPress={() => setSelectedFilter('all')}>
            <Feather name="x" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Order List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item, index) =>
          item?.id !== undefined && item?.id !== null ? item.id.toString() : `order-${index}`
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.textSecondary + '10' }]}>
              <Feather name="package" size={40} color={colors.textSecondary} />
            </View>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No orders found
            </Text>
            <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
              {selectedFilter === 'all'
                ? 'There are no orders in the system yet'
                : `There are no orders with '${selectedFilter.replace('_', ' ')}' status`}
            </Text>
            {selectedFilter !== 'all' && (
              <TouchableOpacity
                style={[styles.clearFilterBtn, { backgroundColor: colors.primary }]}
                onPress={() => setSelectedFilter('all')}
              >
                <Text style={styles.clearFilterBtnText}>View All Orders</Text>
              </TouchableOpacity>
            )}
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
                  Order #{selectedOrder?.id ? String(selectedOrder.id).substring(0, 8) : 'Unknown'}
                </Text>
                <Text style={[styles.orderSummaryText, { color: colors.textSecondary }]}>
                  Customer: {selectedOrder?.customer?.name || 'Unknown'}
                </Text>
                <Text style={[styles.orderSummaryText, { color: colors.textSecondary }]}>
                  Type: {selectedOrder?.order_type || 'Unknown'}
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
        transparent
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

            <Text style={[styles.modalSubtitle, { color: colors.text }]}>Select new status:</Text>
            <ScrollView style={styles.statusListContainer}>
              {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusItem,
                    selectedStatus === status && {
                      backgroundColor: colors.primary + '20',
                    }
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
                    <Feather name="check-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button title="Cancel" onPress={() => setStatusModalVisible(false)} variant="outline" />
              <Button title="Update" onPress={handleUpdateStatus} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Assign to Service Agent Modal */}
      <Modal
        visible={agentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAgentModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Assign Order to Service Agent
              </Text>
              <TouchableOpacity onPress={() => setAgentModalVisible(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.franchiseListContainer}>
              {agents.map((agent) => {
                const agentId = agent.ID ?? agent.id;

                if (!agentId) {
                  console.warn("⚠️ Missing agent ID:", agent);
                  return null;
                }

                return (
                  <TouchableOpacity
                    key={agentId}
                    style={[
                      styles.franchiseItem,
                      selectedAgentId === agentId.toString() && {
                        backgroundColor: colors.primary + '20',
                      },
                    ]}
                    onPress={() => setSelectedAgentId(agentId.toString())}
                  >
                    <View>
                      <Text style={[styles.franchiseName, { color: colors.text }]}>{agent.name}</Text>
                      <Text style={[styles.franchiseLocation, { color: colors.textSecondary }]}>
                        {agent.email} • {agent.phone}
                      </Text>
                    </View>
                    {selectedAgentId === agentId.toString() && (
                      <Feather name="check-circle" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button title="Cancel" onPress={() => setAgentModalVisible(false)} variant="outline" />
              <Button title="Assign Agent" onPress={handleAssignAgent} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Enhanced Bottom Action Buttons */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={[
            styles.quickActionButton,
            { backgroundColor: colors.primary },
            selectedFilter === 'pending' && styles.activeQuickAction
          ]}
          onPress={handleViewPending}
        >
          <View style={styles.quickActionContent}>
            <Feather name="clock" size={20} color="#fff" />
            <View style={styles.quickActionTextContainer}>
              <Text style={styles.quickActionTitle}>Pending Orders</Text>
              <Text style={styles.quickActionCount}>{filterCounts.pending} orders</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickActionButton,
            { backgroundColor: colors.success },
            selectedFilter === 'recently_delivered' && styles.activeQuickAction
          ]}
          onPress={handleViewRecentlyDelivered}
        >
          <View style={styles.quickActionContent}>
            <Feather name="check-circle" size={20} color="#fff" />
            <View style={styles.quickActionTextContainer}>
              <Text style={styles.quickActionTitle}>Recently Delivered</Text>
              <Text style={styles.quickActionCount}>{filterCounts.recently_delivered} orders</Text>
            </View>
          </View>
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
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  exportBtn: {
    paddingHorizontal: 16,
  },
  filterTabsContainer: {
    marginBottom: 16,
    maxHeight: 50,
  },
  filterTabs: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 25,
    borderWidth: 1.5,
    minWidth: 80,
  },
  activeFilterTab: {
    borderWidth: 1.5,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  filterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  activeFilterIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  activeFilterText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    marginRight: 8,
    flex: 1,
  },
  orderCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  listContainer: {
    paddingBottom: 120,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  clearFilterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearFilterBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  orderSummary: {
    marginBottom: 20,
  },
  orderSummaryTitle: {
    fontSize: 18,
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
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  quickActionsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  activeQuickAction: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  quickActionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  quickActionCount: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },
});

export default OrderManagement;