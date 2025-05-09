import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { AdminDashboardData, Order, User, ServiceRequest } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import OrderItem from '../../components/OrderItem';
import ServiceRequestCard from '../../components/ServiceRequestCard';
import { adminService } from '@/services/adminService';


const AdminDashboard = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const formatRevenue = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN');
  };
  
  if (loading) {
    return <Loading />;
  }
  
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Admin Dashboard
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>
      
      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { backgroundColor: colors.card, borderLeftColor: colors.primary }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {dashboardData?.stats?.totalCustomers || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Customers
            </Text>
          </Card>
          
          <Card style={[styles.statCard, { backgroundColor: colors.card, borderLeftColor: colors.success }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {dashboardData?.stats?.totalOrders || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Orders
            </Text>
          </Card>
        </View>
        
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { backgroundColor: colors.card, borderLeftColor: colors.info }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatRevenue(dashboardData?.stats?.totalRevenue || 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Revenue
            </Text>
          </Card>
          
          <Card style={[styles.statCard, { backgroundColor: colors.card, borderLeftColor: colors.warning }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {dashboardData?.stats?.activeSubscriptions || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Active Subscriptions
            </Text>
          </Card>
        </View>
        
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { backgroundColor: colors.card, borderLeftColor: colors.error }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {dashboardData?.stats?.pendingServiceRequests || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Pending Service
            </Text>
          </Card>
          
          <Card style={[styles.statCard, { backgroundColor: colors.card, borderLeftColor: '#9c27b0' }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {dashboardData?.stats?.franchiseApplications || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Franchise Applications
            </Text>
          </Card>
        </View>
      </View>
      
      {/* Quick Action Buttons */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('OrderManagement' as never)}
        >
          <Feather name="shopping-cart" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Manage Orders</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.info }]}
          onPress={() => navigation.navigate('CustomerManagement' as never)}
        >
          <Feather name="users" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Manage Customers</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.success }]}
          onPress={() => navigation.navigate('FranchiseDashboard' as never)}
        >
          <Feather name="home" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Manage Franchises</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.warning }]}
          onPress={() => navigation.navigate('ProductListing' as never)}
        >
          <Feather name="package" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Manage Products</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.info }]}
          onPress={() => navigation.navigate('AdminSubscriptions' as never)}
        >
          <Feather name="repeat" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Manage Subscriptions</Text>
        </TouchableOpacity>

      </View>


      
      {/* Recent Orders Section*/}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Orders
          </Text>
          <Button
            title="View All"
            onPress={() => navigation.navigate('OrderManagement' as never)}
            variant="outline"
            size="small"
          />
        </View>

        {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 ? (
          <FlatList
            data={dashboardData.recentOrders.slice(0, 3)}
            renderItem={({ item }) => (
              <OrderItem
                order={item}
                onPress={() =>
                  navigation.navigate(
                    'OrderDetails',
                    { orderId: item.id }
                  )
                }
              />
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <Feather name="inbox" size={24} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No recent orders
            </Text>
          </Card>
        )}
      </View>

      // Recent Customers Section
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Customers
          </Text>
          <Button
            title="View All"
            onPress={() => navigation.navigate('CustomerManagement' as never)}
            variant="outline"
            size="small"
          />
        </View>
        
        {dashboardData?.recentCustomers && dashboardData.recentCustomers.length > 0 ? (
          <FlatList
            data={dashboardData.recentCustomers.slice(0, 4)}
            renderItem={({ item }) => (
              <CustomerListItem 
                customer={item} 
                onPress={() => 
                  navigation.navigate(
                    'CustomerDetails', 
                    { userId: item.id }
                  )
                }
                colors={colors}
              />
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <Feather name="users" size={24} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No recent customers
            </Text>
          </Card>
        )}
      </View>
      
      // Service Requests Section
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Service Requests
          </Text>
          <Button
            title="View All"
            onPress={() => navigation.navigate('ServiceRequestManagement' as never)}
            variant="outline"
            size="small"
          />
        </View>
        
        {dashboardData?.recentServiceRequests && dashboardData.recentServiceRequests.length > 0 ? (
          <FlatList
            data={dashboardData.recentServiceRequests.slice(0, 3)}
            renderItem={({ item }) => (
              <ServiceRequestCard 
                serviceRequest={item} 
                onPress={() => 
                  navigation.navigate(
                    'ServiceRequestDetails', 
                    { serviceRequestId: item.id }
                  )
                }
              />
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <Feather name="tool" size={24} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No recent service requests
            </Text>
          </Card>
        )}
      </View> */}
      
      {/* Footer Action Buttons */}
      <View style={styles.footerActions}>
        <Button
          title="Generate Reports"
          onPress={() => {
            // navigation.navigate('ReportGeneration' as never)
            Alert.alert('Report', 'Report functionality to be implemented')
          }}
          variant="primary"
          style={styles.footerButton}
          icon={<Feather name="bar-chart-2" size={16} color="#fff" />}
        />
        
        <Button
          title="System Settings"
          onPress={() => navigation.navigate('SystemSettings' as never)}
          variant="outline"
          style={styles.footerButton}
          icon={<Feather name="settings" size={16} color={colors.primary} />}
        />
      </View>
    </ScrollView>
  );
};

// Customer list item component
// interface CustomerListItemProps {
//   customer: User;
//   onPress: () => void;
//   colors: any;
// }

// const CustomerListItem: React.FC<CustomerListItemProps> = ({ customer, onPress, colors }) => {
//   return (
//     <TouchableOpacity 
//       onPress={onPress}
//       style={[styles.customerItem, { backgroundColor: colors.card }]}
//     >
//       <View style={[styles.customerAvatar, { backgroundColor: colors.primary + '20' }]}>
//         <Text style={[styles.avatarText, { color: colors.primary }]}>
//           {customer.name.charAt(0).toUpperCase()}
//         </Text>
//       </View>
      
//       <View style={styles.customerInfo}>
//         <Text style={[styles.customerName, { color: colors.text }]}>
//           {customer.name}
//         </Text>
//         <Text style={[styles.customerEmail, { color: colors.textSecondary }]}>
//           {customer.email}
//         </Text>
//       </View>
      
//       <Feather name="chevron-right" size={20} color={colors.textSecondary} />
//     </TouchableOpacity>
//   );
// };

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  statsGrid: {
    padding: 10,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    padding: 20,
    marginHorizontal: 5,
    borderLeftWidth: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  actionButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  section: {
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 14,
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginBottom: 30,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default AdminDashboard;