import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";
import { CustomerDashboardData, Activity } from "../../types";
import { Feather } from "@expo/vector-icons";
import { customerService } from "../../services/customerService";
import Loading from "../../components/ui/Loading";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import SubscriptionCard from "../../components/SubscriptionCard";
import OrderItem from "../../components/OrderItem";
import ServiceRequestCard from "../../components/ServiceRequestCard";
import { useNavigation } from "@react-navigation/native";

const CustomerDashboard = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  // const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // const fetchDashboardData = async () => {
  //   try {
  //     setLoading(true);
  //     const data = await customerService.getDashboardData();
  //     setDashboardData(data);
  //   } catch (error) {
  //     console.error("Error fetching dashboard data:", error);
  //     Alert.alert("Error", "Failed to load dashboard data");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const onRefresh = async () => {
  //   setRefreshing(true);
  //   // await fetchDashboardData();
  //   setRefreshing(false);
  // };

  // useEffect(() => {
  //   // fetchDashboardData();
  // }, []);

  // if (loading) {
  //   return <Loading />;
  // }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} /** onRefresh={onRefresh} */ />
      }
    >
      {/* Welcome Section */}
      <View style={styles.headerSection}>
        <Text style={[styles.welcomeText, { color: colors.text }]}>
          Welcome, {user?.name || "Customer"}
        </Text>
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>

      {/* Active Subscriptions Section */}
      {/* <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Active Subscriptions
          </Text>
          <Button
            title="View All"
            onPress={() => navigation.navigate('SubscriptionManagement' as never)}
            variant="outline"
            size="small"
          />
        </View>
        
        {dashboardData?.activeSubscriptions && dashboardData.activeSubscriptions.length > 0 ? (
          <FlatList
            data={dashboardData.activeSubscriptions}
            renderItem={({ item }) => (
              <SubscriptionCard 
                subscription={item} 
                onPress={() => 
                  navigation.navigate(
                    'SubscriptionDetails', 
                    { subscriptionId: item.id }
                  )
                }
              />
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <Feather name="info" size={24} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              You have no active subscriptions
            </Text>
            <Button
              title="Explore Products"
              onPress={() => navigation.navigate('ProductListing' as never)}
              size="small"
              style={styles.exploreButton}
            />
          </Card>
        )}
      </View> */}

      {/* Pending Orders Section */}
      {/* <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Orders
          </Text>
          <Button
            title="View All"
            onPress={() => navigation.navigate('Orders' as never)}
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
            <Feather name="shopping-bag" size={24} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              You have no recent orders
            </Text>
            <Button
              title="Place New Order"
              onPress={() => navigation.navigate('ProductListing' as never)}
              size="small"
              style={styles.exploreButton}
            />
          </Card>
        )}
      </View> */}

      {/* Service Requests Section */}
      {/* <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Service Requests
          </Text>
          <Button
            title="View All"
            onPress={() => navigation.navigate('ServiceRequests' as never)}
            variant="outline"
            size="small"
          />
        </View>
        
        {dashboardData?.activeServiceRequests && dashboardData.activeServiceRequests.length > 0 ? (
          <FlatList
            data={dashboardData.activeServiceRequests}
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
              You have no active service requests
            </Text>
            <Button
              title="Request Service"
              onPress={() => navigation.navigate('ServiceRequest' as never)}
              size="small"
              style={styles.exploreButton}
            />
          </Card>
        )}
      </View> */}

      {/* Recent Activity Section */}
      {/* {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 && (
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
      )} */}

      {/* <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Need help? Contact our support team
        </Text>
        <Button
          title="Contact Support"
          onPress={() => navigation.navigate('Support' as never)}
          variant="outline"
          size="small"
          style={styles.supportButton}
        />
      </View> */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("OrdersListing" as never)}
        >
          <Feather name="shopping-cart" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Manage Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.success }]}
          onPress={() => navigation.navigate("FranchiseDashboard" as never)}
        >
          <Feather name="home" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Manage Service Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.warning }]}
          onPress={() => navigation.navigate("AdminSubscriptions" as never)}
        >
          <Feather name="repeat" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Manage Subscriptions</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Helper functions
const getActivityIcon = (type: string): string => {
  switch (type) {
    case "order":
      return "shopping-bag";
    case "payment":
      return "credit-card";
    case "service":
      return "tool";
    case "subscription":
      return "refresh-cw";
    default:
      return "activity";
  }
};

const getActivityColor = (type: string, colors: any): string => {
  switch (type) {
    case "order":
      return colors.primary;
    case "payment":
      return colors.success;
    case "service":
      return colors.warning;
    case "subscription":
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
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return activityDate.toLocaleDateString();
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  headerSection: {
    padding: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyCard: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 14,
    textAlign: "center",
  },
  exploreButton: {
    minWidth: 150,
  },
  activityCard: {
    padding: 0,
    overflow: "hidden",
  },
  activityItem: {
    flexDirection: "row",
    padding: 16,
  },
  activityBorder: {
    borderBottomWidth: 1,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "500",
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
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    marginBottom: 12,
  },
  supportButton: {
    minWidth: 180,
  },
  quickActions: {
    flexDirection: "column",
    flexWrap: "wrap",
    width: "100%",
    alignContent: "center",
    paddingHorizontal: 15,
    marginTop: 25,
    marginBottom: 25,
  },
  actionButton: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 25,
    borderRadius: 8,
    marginBottom: 15,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
  },
});

export default CustomerDashboard;
