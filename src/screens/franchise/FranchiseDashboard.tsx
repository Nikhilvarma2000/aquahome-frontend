import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  Alert,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { FranchiseDashboardData, Order, Subscription, ServiceRequest, Activity } from '../../types';
import { Feather } from '@expo/vector-icons';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import OrderItem from '../../components/OrderItem';
import ServiceRequestCard from '../../components/ServiceRequestCard';
import SubscriptionCard from '../../components/SubscriptionCard';
import { useNavigation } from '@react-navigation/native';

// This would be a real service calling your API
const franchiseService = {
  async getDashboardData(): Promise<FranchiseDashboardData> {
    // In a real app, this would call your API
    return {
      stats: {
        totalCustomers: 42,
        totalOrders: 156,
        activeSubscriptions: 38,
        pendingServiceRequests: 7
      },
      pendingOrders: [],
      activeSubscriptions: [],
      pendingServiceRequests: [],
      recentActivity: []
    };
  }
};

const FranchiseDashboard = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  
  const [dashboardData, setDashboardData] = useState<FranchiseDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await franchiseService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching franchise dashboard data:', error);
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
      {/* Header section */}
      <View style={styles.headerSection}>
        <Text style={[styles.welcomeText, { color: colors.text }]}>
          Franchise Dashboard
        </Text>
        <Text style={[styles.subTitle, { color: colors.textSecondary }]}>
          {dashboardData?.franchise?.name || 'Your Franchise'}
        </Text>
      </View>
      
      {/* Stats cards section */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Feather name="users" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {dashboardData?.stats?.totalCustomers || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Customers
            </Text>
          </Card>
          
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.success + '20' }]}>
              <Feather name="shopping-bag" size={20} color={colors.success} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {dashboardData?.stats?.totalOrders || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Orders
            </Text>
          </Card>
        </View>
        
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.info + '20' }]}>
              <Feather name="refresh-cw" size={20} color={colors.info} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {dashboardData?.stats?.activeSubscriptions || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Active Subscriptions
            </Text>
          </Card>
          
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.warning + '20' }]}>
              <Feather name="tool" size={20} color={colors.warning} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {dashboardData?.stats?.pendingServiceRequests || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Pending Service
            </Text>
          </Card>
        </View>
      </View>
      
      {/* Action buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('ManageOrders' as never)}
        >
          <Feather name="package" size={24} color="white" />
          <Text style={styles.actionButtonText}>Manage Orders</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.info }]}
          onPress={() => navigation.navigate('ManageServices' as never)}
        >
          <Feather name="tool" size={24} color="white" />
          <Text style={styles.actionButtonText}>Service Requests</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.success }]}
          onPress={() => navigation.navigate('ManageLocations' as never)}
        >
          <Feather name="map-pin" size={24} color="white" />
          <Text style={styles.actionButtonText}>Manage Locations</Text>
        </TouchableOpacity>
      </View>
      
      {/* Pending Orders Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Pending Orders
          </Text>
          <Button
            title="View All"
            onPress={() => navigation.navigate('ManageOrders' as never)}
            variant="outline"
            size="small"
          />
        </View>
        
        {dashboardData?.pendingOrders && dashboardData.pendingOrders.length > 0 ? (
          <FlatList
            data={dashboardData.pendingOrders}
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
              No pending orders at the moment
            </Text>
          </Card>
        )}
      </View>
      
      {/* Service Requests Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Service Requests
          </Text>
          <Button
            title="View All"
            onPress={() => navigation.navigate('ManageServices' as never)}
            variant="outline"
            size="small"
          />
        </View>
        
        {dashboardData?.pendingServiceRequests && dashboardData.pendingServiceRequests.length > 0 ? (
          <FlatList
            data={dashboardData.pendingServiceRequests}
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
              No pending service requests
            </Text>
          </Card>
        )}
      </View>
      
      {/* Recent Activity Section */}
      {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Activity
          </Text>
          <Card style={[styles.activityCard, { backgroundColor: colors.card }]}>
            {dashboardData.recentActivity.map((activity: Activity, index: number) => (
              <View 
                key={activity.id} 
                style={[
                  styles.activityItem, 
                  index < dashboardData.recentActivity!.length - 1 && 
                  [styles.activityBorder, { borderBottomColor: colors.border }]
                ]}
              >
                <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type, colors) }]}>
                  <Feather 
                    name={getActivityIcon(activity.type) as any} 
                    size={16} 
                    color="#fff" 
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={[styles.activityTitle, { color: colors.text }]}>
                    {activity.title}
                  </Text>
                  <Text style={[styles.activityDesc, { color: colors.textSecondary }]}>
                    {activity.description}
                  </Text>
                  <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
                    {formatActivityDate(activity.date)}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </View>
      ) : null}
      
      <View style={styles.footer}>
        <Button
          title="Manage Team"
          onPress={() => navigation.navigate('ManageTeam' as never)}
          variant="outline"
          style={styles.footerButton}
        />
        <Button
          title="View Service Area"
          onPress={() => navigation.navigate('ServiceArea' as never)}
          variant="outline"
          style={styles.footerButton}
        />
      </View>
    </ScrollView>
  );
};

// Helper functions (same as in CustomerDashboard)
const getActivityIcon = (type: string): string => {
  switch (type) {
    case 'order':
      return 'shopping-bag';
    case 'payment':
      return 'credit-card';
    case 'service':
      return 'tool';
    case 'subscription':
      return 'refresh-cw';
    default:
      return 'activity';
  }
};

const getActivityColor = (type: string, colors: any): string => {
  switch (type) {
    case 'order':
      return colors.primary;
    case 'payment':
      return colors.success;
    case 'service':
      return colors.warning;
    case 'subscription':
      return colors.info;
    default:
      return colors.textSecondary;
  }
};

const formatActivityDate = (dateString: string): string => {
  const now = new Date();
  const activityDate = new Date(dateString);
  const diffTime = Math.abs(now.getTime() - activityDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const hours = Math.floor(diffTime / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diffTime / (1000 * 60));
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return activityDate.toLocaleDateString();
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    padding: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subTitle: {
    fontSize: 16,
    marginTop: 4,
  },
  statsContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  section: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  activityCard: {
    padding: 0,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    padding: 16,
  },
  activityBorder: {
    borderBottomWidth: 1,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityDesc: {
    fontSize: 13,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default FranchiseDashboard;