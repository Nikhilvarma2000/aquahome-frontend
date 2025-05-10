import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { User } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import { adminService } from '@/services/adminService';



// This would be replaced with a real service in production
const customerService = {


  async searchCustomers(query: string): Promise<User[]> {
    // Simulated API call
    const data = await adminService.getAllCustomers(); // ✅ Real API call
    const lowerQuery = query.toLowerCase();
    
    return allCustomers.filter(customer => 
      customer.name.toLowerCase().includes(lowerQuery) ||
      customer.email.toLowerCase().includes(lowerQuery) ||
      customer.phone?.includes(query) ||
      customer.city?.toLowerCase().includes(lowerQuery) ||
      customer.zipCode?.includes(query)
    );
  }
};

const CustomerManagement = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<User[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter options
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  //Edit form for admin
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  
  // Selected customer for actions
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [selectedFilter, customers, searchQuery]);
  
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllCustomers();      // ✅ Real backend call
      setFilteredCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      Alert.alert('Error', 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const lowerQuery = text.toLowerCase();
    const results = customers.filter(customer =>
      customer.name?.toLowerCase().includes(lowerQuery) ||
      customer.email?.toLowerCase().includes(lowerQuery) ||
      customer.phone?.includes(text) ||
      customer.city?.toLowerCase().includes(lowerQuery) ||
      customer.zipCode?.includes(text)
    );

    setFilteredCustomers(results);
  };
  const clearSearch = () => {
    setSearchQuery('');
    setFilteredCustomers(customers);
  };

  
  const applyFilters = () => {
    let results = [...customers];

    // 🔹 Filter first (e.g. active, inactive, recent)
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'recent') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        results = results.filter(customer =>
          new Date(customer.createdAt) >= thirtyDaysAgo
        );
      } else if (selectedFilter === 'active') {
       results = results.filter(customer => customer.activity_status === 'active');
      } else if (selectedFilter === 'inactive') {
        results = results.filter(customer => customer.activity_status === 'inactive');
      }
    }

    // 🔹 Then apply search (on filtered results)
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      results = results.filter(customer =>
        customer.name?.toLowerCase().includes(lowerQuery) ||
        customer.email?.toLowerCase().includes(lowerQuery) ||
        customer.phone?.includes(searchQuery) ||
        customer.city?.toLowerCase().includes(lowerQuery) ||
        customer.zipCode?.includes(searchQuery)
      );
    }

    setFilteredCustomers(results);
  };

  const showActionModal = (customer: User) => {
    setSelectedCustomer(customer);
    setActionModalVisible(true);
  };
  
  const showSendReminder = (customer: User) => {
    setSelectedCustomer(customer);
    setReminderModalVisible(true);
  };
  
  const sendPaymentReminder = () => {
    if (!selectedCustomer) return;
    
    // In a real app, this would call your API
    Alert.alert(
      'Success',
      `Payment reminder sent to ${selectedCustomer.name}`,
      [{ text: 'OK', onPress: () => setReminderModalVisible(false) }]
    );
  };
  
  const renderCustomerItem = ({ item }: { item: User }) => (
    <Card style={[styles.customerCard, { backgroundColor: colors.card }]}>
      <View style={styles.customerHeader}>
        <View style={styles.customerInfo}>
          <Text style={[styles.customerName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.customerEmail, { color: colors.textSecondary }]}>{item.email}</Text>
          {item.phone && (
            <Text style={[styles.customerPhone, { color: colors.textSecondary }]}>{item.phone}</Text>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
          onPress={() => showActionModal(item)}
        >
          <Feather name="more-vertical" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.locationInfo}>
        <Feather name="map-pin" size={14} color={colors.textSecondary} />
        <Text style={[styles.locationText, { color: colors.textSecondary }]}>
          {[item.city, item.state].filter(Boolean).join(', ')} {item.zipCode}
        </Text>
      </View>
      
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      
      <View style={styles.cardActions}>
        <Button
          title="View Details"
          onPress={() => viewCustomerDetails(item)}
          variant="outline"
          size="small"
        />
        
        <Button
          title="Send Reminder"
          onPress={() => showSendReminder(item)}
          variant="outline"
          size="small"
        />
      </View>
    </Card>
  );
  
  if (loading) {
    return <Loading />;
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Customer Management</Text>
        <Button
          title="Add Customer"
          onPress={() => navigation.navigate('AddCustomer' as never)}
          icon={<Feather name="plus" size={18} color="#fff" />}
        />
      </View>
      
      <View style={styles.searchFilterContainer}>
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by name, email, phone..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Feather name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: colors.card, borderColor: colors.border }
          ]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Feather name="filter" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.resultsContainer}>
        <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
          {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'} found
        </Text>
      </View>
      
      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomerItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="users" size={40} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No customers found
            </Text>
            <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />
      
      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filter Customers</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedFilter === 'all' && 
                  { backgroundColor: colors.primary + '20' }
                ]}
                onPress={() => setSelectedFilter('all')}
              >
                <Text style={[
                  styles.filterOptionText, 
                  { color: selectedFilter === 'all' ? colors.primary : colors.text }
                ]}>
                  All Customers
                </Text>
                {selectedFilter === 'all' && (
                  <Feather name="check" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedFilter === 'active' && 
                  { backgroundColor: colors.primary + '20' }
                ]}
                onPress={() => setSelectedFilter('active')}
              >
                <Text style={[
                  styles.filterOptionText, 
                  { color: selectedFilter === 'active' ? colors.primary : colors.text }
                ]}>
                  Active Subscriptions
                </Text>
                {selectedFilter === 'active' && (
                  <Feather name="check" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedFilter === 'inactive' && 
                  { backgroundColor: colors.primary + '20' }
                ]}
                onPress={() => setSelectedFilter('inactive')}
              >
                <Text style={[
                  styles.filterOptionText, 
                  { color: selectedFilter === 'inactive' ? colors.primary : colors.text }
                ]}>
                  Inactive Customers
                </Text>
                {selectedFilter === 'inactive' && (
                  <Feather name="check" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedFilter === 'recent' && 
                  { backgroundColor: colors.primary + '20' }
                ]}
                onPress={() => setSelectedFilter('recent')}
              >
                <Text style={[
                  styles.filterOptionText, 
                  { color: selectedFilter === 'recent' ? colors.primary : colors.text }
                ]}>
                  Recently Added (30 days)
                </Text>
                {selectedFilter === 'recent' && (
                  <Feather name="check" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button
                title="Apply Filter"
                onPress={() => {
                  applyFilters();
                  setFilterModalVisible(false);
                }}
                style={styles.modalButton}
              />
              <Button
                title="Reset"
                onPress={() => {
                  setSelectedFilter('all');
                  setFilterModalVisible(false);
                }}
                variant="outline"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Action Modal */}
      <Modal
        visible={actionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Customer Actions
              </Text>
              <TouchableOpacity onPress={() => setActionModalVisible(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              {selectedCustomer && (
                <View style={styles.selectedCustomerInfo}>
                  <Text style={[styles.selectedCustomerName, { color: colors.text }]}>
                    {selectedCustomer.name}
                  </Text>
                  <Text style={[styles.selectedCustomerEmail, { color: colors.textSecondary }]}>
                    {selectedCustomer.email}
                  </Text>
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.actionItem}
                onPress={() => {
                  setActionModalVisible(false);
                  if (selectedCustomer) viewCustomerDetails(selectedCustomer);
                }}
              >
                <Feather name="user" size={20} color={colors.primary} />
                <Text style={[styles.actionText, { color: colors.text }]}>
                  View Profile
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionItem}
                onPress={() => {
                  setActionModalVisible(false);
                  if (selectedCustomer) {
                    navigation.navigate(
                      'CustomerSubscriptions', 
                      { userId: selectedCustomer.id }
                    );
                  }
                }}
              >
                <Feather name="refresh-cw" size={20} color={colors.info} />
                <Text style={[styles.actionText, { color: colors.text }]}>
                  View Subscriptions
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionItem}
                onPress={() => {
                  setActionModalVisible(false);
                  if (selectedCustomer) {
                    navigation.navigate(
                      'CustomerOrders', 
                      { userId: selectedCustomer.id }
                    );
                  }
                }}
              >
                <Feather name="shopping-bag" size={20} color={colors.success} />
                <Text style={[styles.actionText, { color: colors.text }]}>
                  View Orders
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionItem}
                onPress={() => {
                  setActionModalVisible(false);
                  if (selectedCustomer) {
                    showSendReminder(selectedCustomer);
                  }
                }}
              >
                <Feather name="bell" size={20} color={colors.warning} />
                <Text style={[styles.actionText, { color: colors.text }]}>
                  Send Reminder
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionItem}
                onPress={() => {
                  setActionModalVisible(false);
                  if (selectedCustomer) {
                    navigation.navigate(
                      'EditCustomer', 
                      { userId: selectedCustomer.id }
                    );
                  }
                }}
              >
                <Feather name="edit" size={20} color={colors.primary} />
                <Text style={[styles.actionText, { color: colors.text }]}>
                  Edit Customer
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionItem}>
                <Feather name="trash-2" size={20} color={colors.error} />
                <Text style={[styles.actionText, { color: colors.error }]}>
                  Delete Customer
                </Text>
              </TouchableOpacity>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button
                title="Close"
                onPress={() => setActionModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Send Reminder Modal */}
      <Modal
        visible={reminderModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReminderModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Send Payment Reminder
              </Text>
              <TouchableOpacity onPress={() => setReminderModalVisible(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {selectedCustomer && (
              <View style={styles.reminderContainer}>
                <View style={styles.selectedCustomerInfo}>
                  <Text style={[styles.selectedCustomerName, { color: colors.text }]}>
                    {selectedCustomer.name}
                  </Text>
                  <Text style={[styles.selectedCustomerEmail, { color: colors.textSecondary }]}>
                    {selectedCustomer.email}
                  </Text>
                </View>
                
                <Text style={[styles.reminderText, { color: colors.textSecondary }]}>
                  This will send a payment reminder to the customer for their pending subscription payments. 
                  The reminder will be sent via email and SMS (if available).
                </Text>
                
                <View style={styles.reminderOptions}>
                  <Text style={[styles.reminderOptionLabel, { color: colors.text }]}>
                    Include Late Fee Warning
                  </Text>
                  <TouchableOpacity style={[
                    styles.toggleButton, 
                    { backgroundColor: colors.success }
                  ]}>
                    <Text style={styles.toggleButtonText}>Yes</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.reminderOptions}>
                  <Text style={[styles.reminderOptionLabel, { color: colors.text }]}>
                    Payment Due Days
                  </Text>
                  <View style={[styles.pillSelector, { borderColor: colors.border }]}>
                    <TouchableOpacity style={[
                      styles.pill, 
                      { backgroundColor: colors.primary }
                    ]}>
                      <Text style={styles.pillText}>3 Days</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[
                      styles.pill, 
                      { backgroundColor: colors.background }
                    ]}>
                      <Text style={[styles.pillText, { color: colors.text }]}>7 Days</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[
                      styles.pill, 
                      { backgroundColor: colors.background }
                    ]}>
                      <Text style={[styles.pillText, { color: colors.text }]}>15 Days</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            
            <View style={styles.modalFooter}>
              <Button
                title="Send Reminder"
                onPress={sendPaymentReminder}
                style={styles.modalButton}
              />
              <Button
                title="Cancel"
                onPress={() => setReminderModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
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
  searchFilterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    marginBottom: 16,
  },
  resultCount: {
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 20,
  },
  customerCard: {
    marginBottom: 16,
    padding: 16,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
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
  filterOptions: {
    marginBottom: 20,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  filterOptionText: {
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
  selectedCustomerInfo: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  selectedCustomerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  selectedCustomerEmail: {
    fontSize: 14,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 16,
    marginLeft: 16,
  },
  reminderContainer: {
    marginBottom: 20,
  },
  reminderText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  reminderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reminderOptionLabel: {
    fontSize: 16,
  },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  pillSelector: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default CustomerManagement;