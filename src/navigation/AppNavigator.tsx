import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Feather } from '@expo/vector-icons';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import CustomerManagement from '../screens/admin/CustomerManagement';
import OrderManagement from '../screens/admin/OrderManagement';

// Franchise Screens
import FranchiseDashboard from '../screens/franchise/FranchiseDashboard';
import LocationManagement from '../screens/franchise/LocationManagement';

// Customer Screens
import CustomerDashboard from '../screens/customer/CustomerDashboard';
import ProductListing from '../screens/customer/ProductListing';
import OrderPlacement from '../screens/customer/OrderPlacement';
import SubscriptionManagement from '../screens/customer/SubscriptionManagement';
import ServiceRequest from '../screens/customer/ServiceRequest';

// Service Agent Screens
import ServiceAgentDashboard from '../screens/serviceagent/ServiceAgentDashboard';
import TaskManagement from '../screens/serviceagent/TaskManagement';
import ServiceLogs from '../screens/serviceagent/ServiceLogs';

// Common Screens
import ProfileScreen from '../screens/common/ProfileScreen';
import NotificationsScreen from '../screens/common/NotificationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Admin Tab Navigator
const AdminTabNavigator = () => {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text
      }}
    >
      <Tab.Screen 
        name="AdminDashboard" 
        component={AdminDashboard} 
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="CustomerManagement" 
        component={CustomerManagement} 
        options={{
          title: 'Customers',
          tabBarIcon: ({ color, size }) => <Feather name="users" size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="OrderManagement" 
        component={OrderManagement} 
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => <Feather name="shopping-bag" size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="AdminProfile" 
        component={ProfileScreen} 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
};

// Franchise Tab Navigator
const FranchiseTabNavigator = () => {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text
      }}
    >
      <Tab.Screen 
        name="FranchiseDashboard" 
        component={FranchiseDashboard} 
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="LocationManagement" 
        component={LocationManagement} 
        options={{
          title: 'Location',
          tabBarIcon: ({ color, size }) => <Feather name="map-pin" size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="FranchiseOrders" 
        component={OrderManagement} 
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => <Feather name="shopping-bag" size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="FranchiseProfile" 
        component={ProfileScreen} 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
};

// Customer Tab Navigator
const CustomerTabNavigator = () => {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text
      }}
    >
      <Tab.Screen 
        name="CustomerDashboard" 
        component={CustomerDashboard} 
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="ProductListing" 
        component={ProductListing} 
        options={{
          title: 'Products',
          tabBarIcon: ({ color, size }) => <Feather name="shopping-cart" size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="SubscriptionManagement"
        component={SubscriptionManagement as any} 
        options={{
          title: 'Subscriptions',
          tabBarIcon: ({ color, size }) => <Feather name="calendar" size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="CustomerProfile" 
        component={ProfileScreen} 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
};

// Service Agent Tab Navigator
const ServiceAgentTabNavigator = () => {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text
      }}
    >
      <Tab.Screen 
        name="ServiceAgentDashboard" 
        component={ServiceAgentDashboard} 
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="TaskManagement" 
        component={TaskManagement} 
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => <Feather name="clipboard" size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="ServiceLogs" 
        component={ServiceLogs} 
        options={{
          title: 'Service Logs',
          tabBarIcon: ({ color, size }) => <Feather name="file-text" size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="AgentProfile" 
        component={ProfileScreen} 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
};

// Customer Stack Navigator (for screens that shouldn't be in tabs)
const CustomerStackNavigator = () => {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen 
        name="CustomerTabs" 
        component={CustomerTabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="OrderPlacement" 
        component={OrderPlacement} 
        options={{ title: 'Place Order' }}
      />
      <Stack.Screen 
        name="ServiceRequest" 
        component={ServiceRequest} 
        options={{ title: 'Request Service' }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ title: 'Notifications' }}
      />
    </Stack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { user } = useAuth();
  
  // Render different tab navigators based on user role
  if (!user) return null;
  
  switch (user.role) {
    case 'admin':
      return <AdminTabNavigator />;
    case 'franchise_owner':
      return <FranchiseTabNavigator />;
    case 'service_agent':
      return <ServiceAgentTabNavigator />;
    case 'customer':
      return <CustomerStackNavigator />;
    default:
      return <CustomerStackNavigator />;
  }
};

export default AppNavigator;
