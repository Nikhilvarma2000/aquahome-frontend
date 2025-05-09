import React, { useState, useEffect } from 'react';
import MapView, { Polygon, Marker, LatLng } from 'react-native-maps';
import Modal from 'react-native-modal'; // If using this modal library
import * as Location from 'expo-location';
import { Platform } from 'react-native';




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
import { franchiseService } from '../../services/franchiseService';  //adjust path
import { Picker } from '@react-native-picker/picker';
import { Franchise } from '@/types';
import { TextInput } from 'react-native-gesture-handler';

const FranchiseDashboard = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  
  const [dashboardData, setDashboardData] = useState<FranchiseDashboardData | null>(null);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [franchiseList, setFranchiseList] = useState<Franchise[]>([]);
  const [editingFranchise, setEditingFranchise] = useState<any>(null);
  const [polygonPoints, setPolygonPoints] = useState<LatLng[]>([]);
  const [showPolygonModal, setShowPolygonModal] = useState(false);

  // Removed unused states: franchises and selectedFranchise
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);


   const [newFranchise, setNewFranchise] = useState({
     name: '',
     phone: '',
     email: '',
     city: '',
     state: '',
     zip_code: '',
     address: '',
     area_polygon: '',
   });

   //  Add fetchFranchises here
    const fetchFranchises = async () => {
      try {
        const data = await franchiseService.getAllFranchises(); {/*you must define this in franchiseService*/}
        setFranchiseList(data);
      } catch (error) {
        console.error('Error fetching franchises:', error);
        Alert.alert('Error', 'Failed to load franchises');
      }
    };

  useEffect(() => {
    fetchDashboardData();
    if (user?.role === 'admin') {
      fetchFranchises();
    }
  }, []);


  const fetchDashboardData = async (franchiseId?: string) => {
    try {
      setLoading(true);

         console.log("📤 Fetching dashboard for franchiseId:", franchiseId);


      const data = await franchiseService.getDashboardData(franchiseId);
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

  const handleDeleteFranchise = async (franchiseId: number) => {
    try {
      await franchiseService.deleteFranchise(franchiseId);   //Ensure this method exists in franchiseService
      Alert.alert("Success", "Franchise deleted successfully");
      fetchFranchises(); // Refresh list
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Failed to delete franchise");
    }
  };
  
  const handleUpdateFranchise = async () => {
    if (!editingFranchise?.id) {
      Alert.alert("Error", "Invalid franchise selected");
      return;
    }
  
    try {
      const payload = {
        name: editingFranchise.name,
        phone: editingFranchise.phone,
        area_polygon: editingFranchise.area_polygon,
        address: editingFranchise.address || "",
        city: editingFranchise.city || "",
        state: editingFranchise.state || "",
        zip_code: editingFranchise.zip_code || "",
        email: editingFranchise.email || ""
      };
  
      await franchiseService.updateFranchise(editingFranchise.id, payload);
      Alert.alert("Success", "Franchise updated successfully");
      setShowEditModal(false);
      fetchFranchises(); // Refresh list
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update franchise");
    }
  };
  
  
  const toggleFranchiseStatus = async (id: number, newStatus: boolean) => {
    try {
      await franchiseService.toggleFranchiseStatus(id, newStatus);
      Alert.alert('Success', `Franchise ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchFranchises();
    } catch (err) {
      Alert.alert('Error', 'Failed to update status');
      console.error(err);
    }
  };
  
// useEffect(() => {
//     fetchDashboardData();
//   }, []);
  
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
  {showEditModal && editingFranchise && (
  <Modal
    visible={true}
    transparent
    animationType="slide"
    onRequestClose={() => setShowEditModal(false)}
  >
    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <View style={{ backgroundColor: 'white', margin: 20, borderRadius: 10, padding: 20 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Edit Franchise</Text>

        <TextInput
          value={editingFranchise.name}
          onChangeText={(text) => setEditingFranchise({ ...editingFranchise, name: text })}
          style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
          placeholder="Franchise Name"
        />

        <TextInput
          value={editingFranchise.phone}
          onChangeText={(text) => setEditingFranchise({ ...editingFranchise, phone: text })}
          style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
          placeholder="Phone Number"
        />

        <TextInput
          value={editingFranchise.area_polygon}
          onChangeText={(text) => setEditingFranchise({ ...editingFranchise, area_polygon: text })}
          style={{ borderWidth: 1, padding: 10, height: 100 }}
          multiline
          placeholder="Area Polygon (GeoJSON)"
        />
       <Button title="Draw Polygon on Map" onPress={() => setShowPolygonModal(true)} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Button title="Cancel" onPress={() => setShowEditModal(false)} />
          <Button title="Save" onPress={handleUpdateFranchise} />
        </View>
      </View>
    </View>
  </Modal>
)}

{showPolygonModal && (
  <Modal isVisible={true}>
    <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', margin: 10 }}>Draw Area Polygon</Text>

      {Platform.OS === 'web' ? (
        <Text style={{ padding: 20, textAlign: 'center' }}>
          Map drawing is not supported on web. Please use a mobile device.
        </Text>
      ) : (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: 17.385044,
            longitude: 78.486671,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onPress={(e) => {
            setPolygonPoints([...polygonPoints, e.nativeEvent.coordinate]);
          }}
        >
          {polygonPoints.length > 2 && (
            <Polygon
              coordinates={polygonPoints}
              strokeColor="#000"
              fillColor="rgba(0,200,0,0.3)"
              strokeWidth={2}
            />
          )}
          {polygonPoints.map((point, idx) => (
            <Marker key={idx} coordinate={point} />
          ))}
        </MapView>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
        <Button title="Clear" onPress={() => setPolygonPoints([])} />
        <Button
          title="Save Polygon"
          onPress={() => {
            const geojson = {
              type: "Polygon",
              coordinates: [[...polygonPoints.map(p => [p.longitude, p.latitude]), [polygonPoints[0]?.longitude, polygonPoints[0]?.latitude]]]
            };
            setEditingFranchise({
              ...editingFranchise,
              area_polygon: JSON.stringify(geojson),
            });
            setShowPolygonModal(false);
          }}
        />
      </View>
    </View>
  </Modal>
)}

  {showAddModal && (
    <Modal
      isVisible={true}
      onBackdropPress={() => setShowAddModal(false)}
    >
      <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Add New Franchise</Text>

        <TextInput placeholder="Name" style={styles.input} value={newFranchise.name} onChangeText={(text) => setNewFranchise({ ...newFranchise, name: text })} />
        <TextInput placeholder="Phone" style={styles.input} value={newFranchise.phone} onChangeText={(text) => setNewFranchise({ ...newFranchise, phone: text })} />
        <TextInput placeholder="Email" style={styles.input} value={newFranchise.email} onChangeText={(text) => setNewFranchise({ ...newFranchise, email: text })} />
        <TextInput placeholder="City" style={styles.input} value={newFranchise.city} onChangeText={(text) => setNewFranchise({ ...newFranchise, city: text })} />
        <TextInput placeholder="State" style={styles.input} value={newFranchise.state} onChangeText={(text) => setNewFranchise({ ...newFranchise, state: text })} />
        <TextInput placeholder="Zip Code" style={styles.input} value={newFranchise.zip_code} onChangeText={(text) => setNewFranchise({ ...newFranchise, zip_code: text })} />
        <TextInput placeholder="Address" style={styles.input} value={newFranchise.address} onChangeText={(text) => setNewFranchise({ ...newFranchise, address: text })} />
        <Button title="Save" onPress={async () => {
          try {
            await franchiseService.createFranchise(newFranchise);
            Alert.alert('Success', 'Franchise created');
            setShowAddModal(false);
            setNewFranchise({
              name: '', phone: '', email: '', city: '', state: '', zip_code: '', address: '', area_polygon: ''
            });
            fetchFranchises();
          } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to create franchise');
          }
        }} />
      </View>
    </Modal>
  )}



      {/* Header section */}
      <View style={styles.headerSection}>
        <Text style={[styles.welcomeText, { color: colors.text }]}>
          Franchise Dashboard
        </Text>
        <Text style={[styles.subTitle, { color: colors.textSecondary }]}>
          {dashboardData?.franchise?.name || 'Your Franchise'}
        </Text>
      </View>
     {/*Only for admin*/}
      {user?.role === 'admin' && (
        <View style={{ marginHorizontal: 20, marginBottom: 10 }}>
          <Text style={{ color: colors.text, marginBottom: 5 }}>
            Select Franchise:
          </Text>
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 8,
              borderColor: colors.border,
              borderWidth: 1,
            }}
          >
           <Picker
             selectedValue={selectedFranchiseId}
             onValueChange={(value) => {
               // Only call if value is valid (number or non-empty)
               if (!value || value === 'undefined') return;

               setSelectedFranchiseId(value);
               fetchDashboardData(value);
             }}
           >
             <Picker.Item label="-- Select --" value={null} /> {/* ✅ null is better than undefined here */}
             {franchiseList.map((f, idx) => (
               <Picker.Item key={f.id || idx} label={f.name || `Franchise ${idx + 1}`} value={String(f.id)} />
             ))}
           </Picker>

          </View>
        </View>
      )}

  
        {/* Welcome message */}

      
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

      {user?.role === 'admin' && (
  <View style={{ marginTop: 10, marginHorizontal: 20 }}>

    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Manage Franchises</Text>
      <TouchableOpacity onPress={() => setShowAddModal(true)}>
        <Feather name="plus-circle" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>

    {franchiseList.length === 0 ? (
      <Text style={{ color: colors.textSecondary }}>No franchises found.</Text>
    ) : (
      franchiseList.map((f) => (

         <Card key={f.id || `franchise-${Math.random()}`}>
           <Text style={{ color: colors.textSecondary }}>
             {f.city}, {f.state}
           </Text>
           <Text style={{ color: colors.textSecondary }}>
             Phone: {f.phone}
           </Text>
           <Text style={{ color: colors.textSecondary }}>
             Status: {f.isActive ? 'Active' : 'Inactive'}
           </Text>

           <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'space-between' }}>
             <Button
               title="Edit"
               size="small"
               onPress={() => {
                 setSelectedFranchiseId(String(f.id));
                 setEditingFranchise({
                   ...f,
                   id: Number(f.id),
                 });
                 setShowEditModal(true);
               }}
             />
             <Button
               title="Delete"
               size="small"
               variant="danger"
               onPress={handleUpdateFranchise}
             />
             <Button
               title={f.isActive ? 'Deactivate' : 'Activate'}
               size="small"
               variant="outline"
               onPress={() => toggleFranchiseStatus(Number(f.id), !f.isActive)}
             />
           </View>
         </Card>


               ))
    )}
  </View>
)}

      
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