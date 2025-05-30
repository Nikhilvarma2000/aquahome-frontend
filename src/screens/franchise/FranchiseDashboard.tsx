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
import { FranchiseDashboardData, Order, Activity } from '../../types';
import { Feather } from '@expo/vector-icons';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import OrderItem from '../../components/OrderItem';
import ServiceRequestCard from '../../components/ServiceRequestCard';
import { franchiseService } from '../../services/franchiseService';

const FranchiseDashboard = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const [dashboardData, setDashboardData] = useState<FranchiseDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

const fetchDashboardData = async () => {
  try {
    console.log("🔁 STARTED fetchDashboardData");
    setLoading(true);

    const data = await franchiseService.getDashboardData();
    console.log("✅ Received Dashboard Data:", data);

    setDashboardData(data);
  } catch (error: any) {
    console.log("❌ Error fetching dashboard:", error.response?.data || error.message);
    Alert.alert("Error", "Failed to fetch dashboard data");
  } finally {
    console.log("🔚 FINALLY reached. Setting loading false");
    setLoading(false);
  }
};


 useEffect(() => {
   console.log("👀 useEffect triggered");
   console.log("🧠 User value:", user);

   if (user?.role === 'franchise_owner') {
     console.log("✅ User is franchise_owner, calling fetchDashboardData()");
     fetchDashboardData();
   } else {
     console.log("❌ User is not franchise_owner or user is null");
   }
 }, [user]);


  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

if (loading) return <Text style={{ padding: 40, fontSize: 20 }}>⏳ Still Loading...</Text>;
if (!dashboardData) return <Text style={{ padding: 40, fontSize: 18 }}>❌ No Data Loaded</Text>;


  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.headerSection}>
        <Text style={[styles.welcomeText, { color: colors.text }]}>Franchise Dashboard</Text>
        <Text style={[styles.subTitle, { color: colors.textSecondary }]}>
          Welcome, {user?.name}
        </Text>
      </View>

      {/* ✅ Franchise Info Card */}
      <Card style={{ backgroundColor: colors.card }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>
          {dashboardData?.franchise?.name}
        </Text>
        <Text style={{ color: colors.textSecondary }}>
          {dashboardData?.franchise?.city}, {dashboardData?.franchise?.state}
        </Text>
        <Text style={{ color: colors.textSecondary }}>
          {dashboardData?.franchise?.address}
        </Text>
        <Text style={{ color: colors.textSecondary }}>
          Phone: {dashboardData?.franchise?.phone}
        </Text>
        <Text style={{ color: colors.textSecondary }}>
          Status: {dashboardData?.franchise?.isActive ? 'Active' : 'Inactive'}
        </Text>
      </Card>

      {/* ✅ Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Feather name="users" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {dashboardData?.stats?.totalCustomers || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Customers</Text>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.success + '20' }]}>
              <Feather name="shopping-bag" size={20} color={colors.success} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {dashboardData?.stats?.totalOrders || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Orders</Text>
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
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Subscriptions</Text>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.warning + '20' }]}>
              <Feather name="tool" size={20} color={colors.warning} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {dashboardData?.stats?.pendingServiceRequests || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending Service</Text>
          </Card>
        </View>
      </View>

      {/* ✅ Action Buttons */}
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

      {/* ✅ Pending Orders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Pending Orders</Text>
          <Button
            title="View All"
            onPress={() => navigation.navigate('ManageOrders' as never)}
            variant="outline"
            size="small"
          />
        </View>

        {dashboardData?.pendingOrders?.length > 0 ? (
          <FlatList
            data={dashboardData.pendingOrders}
            renderItem={({ item }) => (
              <OrderItem
                order={item}
                onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
              />
            )}
            keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
            scrollEnabled={false}
          />
        ) : (
          <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <Feather name="inbox" size={24} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No pending orders
            </Text>
          </Card>
        )}
      </View>

      {/* ✅ Service Requests */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Service Requests</Text>
          <Button
            title="View All"
            onPress={() => navigation.navigate('ManageServices' as never)}
            variant="outline"
            size="small"
          />
        </View>

        {dashboardData?.pendingServiceRequests?.length > 0 ? (
          <FlatList
            data={dashboardData.pendingServiceRequests}
            renderItem={({ item }) => (
              <ServiceRequestCard
                serviceRequest={item}
                onPress={() => navigation.navigate('ServiceRequestDetails', { serviceRequestId: item.id })}
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

      {/* ✅ Recent Activity */}
      {dashboardData?.recentActivity?.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
          <Card style={[styles.activityCard, { backgroundColor: colors.card }]}>
            {dashboardData.recentActivity.map((activity: Activity, index: number) => (
              <View
                key={activity.id}
                style={[
                  styles.activityItem,
                  index < dashboardData.recentActivity.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type, colors) }]}>
                  <Feather name={getActivityIcon(activity.type) as any} size={16} color="#fff" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={[styles.activityTitle, { color: colors.text }]}>{activity.title}</Text>
                  <Text style={[styles.activityDesc, { color: colors.textSecondary }]}>{activity.description}</Text>
                  <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
                    {formatActivityDate(activity.date)}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </View>
      )}
    </ScrollView>
  );
};

const getActivityIcon = (type: string): string => {
  switch (type) {
    case 'order': return 'shopping-bag';
    case 'payment': return 'credit-card';
    case 'service': return 'tool';
    case 'subscription': return 'refresh-cw';
    default: return 'activity';
  }
};

const getActivityColor = (type: string, colors: any): string => {
  switch (type) {
    case 'order': return colors.primary;
    case 'payment': return colors.success;
    case 'service': return colors.warning;
    case 'subscription': return colors.info;
    default: return colors.textSecondary;
  }
};

const formatActivityDate = (dateString: string): string => {
  const now = new Date();
  const activityDate = new Date(dateString);
  const diff = now.getTime() - activityDate.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'Yesterday' : `${days} days ago`;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: { padding: 20, paddingBottom: 10 },
  welcomeText: { fontSize: 24, fontWeight: 'bold' },
  subTitle: { fontSize: 16, marginTop: 4 },
  statsContainer: { padding: 20, paddingTop: 10, paddingBottom: 10 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statCard: { flex: 1, padding: 16, alignItems: 'center', marginHorizontal: 5 },
  statIconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 12, textAlign: 'center' },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  actionButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8, marginHorizontal: 5 },
  actionButtonText: { color: 'white', fontSize: 12, fontWeight: '500', marginTop: 4 },
  section: { padding: 20, paddingTop: 10, paddingBottom: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  emptyCard: { padding: 20, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 12, fontSize: 14, textAlign: 'center' },
  activityCard: { padding: 0, overflow: 'hidden' },
  activityItem: { flexDirection: 'row', padding: 16 },
  activityIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 15, fontWeight: '500', marginBottom: 4 },
  activityDesc: { fontSize: 13, marginBottom: 4 },
  activityTime: { fontSize: 12 },
});

export default FranchiseDashboard;
