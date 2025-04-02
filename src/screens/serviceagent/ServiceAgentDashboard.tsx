import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { Feather } from '@expo/vector-icons';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ServiceRequestCard from '../../components/ServiceRequestCard';
import { ServiceAgentDashboardData, ServiceRequest } from '../../types';
import { useFocusEffect } from '@react-navigation/native';

const ServiceAgentDashboard = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<ServiceAgentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Simulated fetch dashboard data function
  const fetchDashboardData = async () => {
    // This would be replaced with an actual API call
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample data - in a real app, this would come from an API
      const data: ServiceAgentDashboardData = {
        assignedTasks: [
          {
            id: '1',
            userId: 'cust1',
            subscriptionId: 'sub1',
            franchiseId: 'fran1',
            agentId: user?.id,
            type: 'maintenance',
            status: 'assigned',
            description: 'Regular 3-month maintenance for RO purifier',
            scheduledDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
              id: 'cust1',
              name: 'Rahul Sharma',
              email: 'rahul.sharma@example.com',
              role: 'customer',
              phone: '9876543210',
              address: '123 Main Street, Apartment 4B',
              city: 'Mumbai',
              state: 'Maharashtra',
              zipCode: '400001',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          },
          {
            id: '2',
            userId: 'cust2',
            subscriptionId: 'sub2',
            franchiseId: 'fran1',
            agentId: user?.id,
            type: 'repair',
            status: 'scheduled',
            description: 'Water leakage from the bottom of the purifier',
            scheduledDate: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days later
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
              id: 'cust2',
              name: 'Priya Patel',
              email: 'priya.patel@example.com',
              role: 'customer',
              phone: '8765432109',
              address: '456 Park Avenue',
              city: 'Pune',
              state: 'Maharashtra',
              zipCode: '411001',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          }
        ],
        completedTasks: [
          {
            id: '3',
            userId: 'cust3',
            subscriptionId: 'sub3',
            franchiseId: 'fran1',
            agentId: user?.id,
            type: 'installation',
            status: 'completed',
            description: 'New RO+UV purifier installation',
            scheduledDate: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            completionDate: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
              id: 'cust3',
              name: 'Amit Singh',
              email: 'amit.singh@example.com',
              role: 'customer',
              phone: '7654321098',
              address: '789 Lake View Road',
              city: 'Bangalore',
              state: 'Karnataka',
              zipCode: '560001',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          }
        ],
        upcomingSchedule: [
          {
            id: '4',
            userId: 'cust4',
            subscriptionId: 'sub4',
            franchiseId: 'fran1',
            agentId: user?.id,
            type: 'maintenance',
            status: 'assigned',
            description: 'Filter replacement',
            scheduledDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days later
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
              id: 'cust4',
              name: 'Meera Joshi',
              email: 'meera.joshi@example.com',
              role: 'customer',
              phone: '6543210987',
              address: '101 Riverside Apartments',
              city: 'Delhi',
              state: 'Delhi',
              zipCode: '110001',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          }
        ],
        stats: {
          pendingTasks: 5,
          completedTasks: 12,
          totalCustomers: 8
        }
      };
      
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const navigateToTaskDetails = (serviceRequest: ServiceRequest) => {
    // Navigate to task details screen
    // This would be implemented in a real app
    console.log('Navigate to task details:', serviceRequest.id);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA000'; // Amber
      case 'assigned':
        return '#0288D1'; // Blue
      case 'scheduled':
        return '#7B1FA2'; // Purple
      case 'completed':
        return '#388E3C'; // Green
      case 'cancelled':
        return '#D32F2F'; // Red
      default:
        return '#757575'; // Grey
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>
            Hello, {user?.name?.split(' ')[0] || 'Agent'}
          </Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {dashboardData?.stats?.pendingTasks || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending Tasks</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.success }]}>
            {dashboardData?.stats?.completedTasks || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {dashboardData?.stats?.totalCustomers || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Customers</Text>
        </Card>
      </View>

      {/* Today's Tasks Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Tasks</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TaskManagement')}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        {dashboardData?.assignedTasks?.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Feather name="calendar" size={24} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No tasks assigned for today
            </Text>
          </Card>
        ) : (
          dashboardData?.assignedTasks?.map((task) => (
            <ServiceRequestCard 
              key={task.id} 
              serviceRequest={task} 
              onPress={() => navigateToTaskDetails(task)}
            />
          ))
        )}
      </View>

      {/* Upcoming Schedule Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Schedule</Text>
        </View>

        <Card style={styles.scheduleCard}>
          {dashboardData?.upcomingSchedule?.length === 0 ? (
            <View style={styles.emptySchedule}>
              <Feather name="calendar" size={24} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No upcoming tasks scheduled
              </Text>
            </View>
          ) : (
            dashboardData?.upcomingSchedule?.map((task) => (
              <TouchableOpacity 
                key={task.id}
                style={styles.scheduleItem}
                onPress={() => navigateToTaskDetails(task)}
              >
                <View style={[styles.scheduleIconContainer, { backgroundColor: `${getStatusColor(task.status)}20` }]}>
                  <Feather name={getServiceTypeIcon(task.type) as any} size={18} color={getStatusColor(task.status)} />
                </View>
                <View style={styles.scheduleDetails}>
                  <Text style={[styles.scheduleTitle, { color: colors.text }]}>
                    {task.type.charAt(0).toUpperCase() + task.type.slice(1)} - {task.user?.name}
                  </Text>
                  <Text style={[styles.scheduleAddress, { color: colors.textSecondary }]} numberOfLines={1}>
                    {task.user?.address}, {task.user?.city}
                  </Text>
                </View>
                <Text style={[styles.scheduleDate, { color: colors.primary }]}>
                  {formatDate(task.scheduledDate as string)}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </Card>
      </View>

      {/* Recent Completions Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recently Completed</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ServiceLogs')}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        {dashboardData?.completedTasks?.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Feather name="check-circle" size={24} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No recently completed tasks
            </Text>
          </Card>
        ) : (
          dashboardData?.completedTasks?.map((task) => (
            <Card key={task.id} style={styles.completedCard}>
              <View style={styles.completedHeader}>
                <View style={styles.completedIconContainer}>
                  <Feather name="check-circle" size={18} color={colors.success} />
                </View>
                <Text style={[styles.completedTitle, { color: colors.text }]}>
                  {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                </Text>
                <Text style={[styles.completedDate, { color: colors.textSecondary }]}>
                  {formatDate(task.completionDate as string)}
                </Text>
              </View>
              <View style={styles.completedDetails}>
                <Text style={[styles.completedCustomer, { color: colors.text }]}>
                  Customer: {task.user?.name}
                </Text>
                <Text style={[styles.completedDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                  {task.description}
                </Text>
              </View>
            </Card>
          ))
        )}
      </View>

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="View All Tasks"
          onPress={() => navigation.navigate('TaskManagement')}
          fullWidth
        />
      </View>
    </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
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
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  scheduleCard: {
    padding: 0,
    overflow: 'hidden',
  },
  emptySchedule: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  scheduleIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scheduleDetails: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  scheduleAddress: {
    fontSize: 12,
  },
  scheduleDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  completedCard: {
    marginBottom: 8,
    padding: 12,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  completedIconContainer: {
    marginRight: 8,
  },
  completedTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  completedDate: {
    fontSize: 12,
  },
  completedDetails: {
    marginLeft: 26,
  },
  completedCustomer: {
    fontSize: 14,
    marginBottom: 4,
  },
  completedDescription: {
    fontSize: 12,
  },
  buttonContainer: {
    padding: 16,
    marginBottom: 20,
  },
});

export default ServiceAgentDashboard;