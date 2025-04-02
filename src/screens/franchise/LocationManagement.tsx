import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import { useNavigation } from '@react-navigation/native';

// This would be replaced with a real service in production
const locationService = {
  async getServiceAreas() {
    // Simulated API call
    return [
      {
        id: '1',
        name: 'North Delhi',
        zipCodes: ['110001', '110002', '110003'],
        customerCount: 24,
        active: true,
      },
      {
        id: '2',
        name: 'South Delhi',
        zipCodes: ['110020', '110021', '110022', '110023'],
        customerCount: 38,
        active: true,
      },
      {
        id: '3',
        name: 'East Delhi',
        zipCodes: ['110030', '110031', '110032'],
        customerCount: 17,
        active: true,
      },
    ];
  },
  
  async addServiceArea(areaData: any) {
    // Simulated API call
    console.log('Adding service area:', areaData);
    return {
      id: Math.random().toString(36).substring(7),
      ...areaData,
      customerCount: 0,
      active: true,
    };
  },
  
  async updateServiceArea(id: string, areaData: any) {
    // Simulated API call
    console.log('Updating service area:', id, areaData);
    return {
      id,
      ...areaData,
    };
  },
  
  async removeServiceArea(id: string) {
    // Simulated API call
    console.log('Removing service area:', id);
    return { success: true };
  },
};

interface ServiceArea {
  id: string;
  name: string;
  zipCodes: string[];
  customerCount: number;
  active: boolean;
}

const LocationManagement = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  
  const [loading, setLoading] = useState(true);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingArea, setEditingArea] = useState<ServiceArea | null>(null);
  
  // Form state
  const [areaName, setAreaName] = useState('');
  const [zipCodesInput, setZipCodesInput] = useState('');
  
  useEffect(() => {
    fetchServiceAreas();
  }, []);
  
  const fetchServiceAreas = async () => {
    try {
      setLoading(true);
      const data = await locationService.getServiceAreas();
      setServiceAreas(data);
    } catch (error) {
      console.error('Error fetching service areas:', error);
      Alert.alert('Error', 'Failed to load service areas');
    } finally {
      setLoading(false);
    }
  };
  
  const openAddModal = () => {
    setEditingArea(null);
    setAreaName('');
    setZipCodesInput('');
    setModalVisible(true);
  };
  
  const openEditModal = (area: ServiceArea) => {
    setEditingArea(area);
    setAreaName(area.name);
    setZipCodesInput(area.zipCodes.join(', '));
    setModalVisible(true);
  };
  
  const handleSubmit = async () => {
    if (!areaName.trim()) {
      Alert.alert('Error', 'Please enter an area name');
      return;
    }
    
    const zipCodes = zipCodesInput
      .split(',')
      .map(zip => zip.trim())
      .filter(zip => zip.length > 0);
    
    if (zipCodes.length === 0) {
      Alert.alert('Error', 'Please enter at least one ZIP code');
      return;
    }
    
    try {
      if (editingArea) {
        // Update existing area
        const updatedArea = await locationService.updateServiceArea(editingArea.id, {
          name: areaName,
          zipCodes,
          active: editingArea.active,
          customerCount: editingArea.customerCount,
        });
        
        setServiceAreas(prev => 
          prev.map(area => area.id === editingArea.id ? updatedArea : area)
        );
        
        Alert.alert('Success', 'Service area updated successfully');
      } else {
        // Add new area
        const newArea = await locationService.addServiceArea({
          name: areaName,
          zipCodes,
        });
        
        setServiceAreas(prev => [...prev, newArea]);
        Alert.alert('Success', 'Service area added successfully');
      }
      
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving service area:', error);
      Alert.alert('Error', 'Failed to save service area');
    }
  };
  
  const handleRemoveArea = (area: ServiceArea) => {
    Alert.alert(
      'Confirm Removal',
      `Are you sure you want to remove ${area.name} from your service areas? This will not affect existing customers.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await locationService.removeServiceArea(area.id);
              setServiceAreas(prev => prev.filter(a => a.id !== area.id));
              Alert.alert('Success', 'Service area removed successfully');
            } catch (error) {
              console.error('Error removing service area:', error);
              Alert.alert('Error', 'Failed to remove service area');
            }
          },
        },
      ]
    );
  };
  
  const toggleAreaStatus = async (area: ServiceArea) => {
    try {
      const updatedArea = await locationService.updateServiceArea(area.id, {
        ...area,
        active: !area.active,
      });
      
      setServiceAreas(prev => 
        prev.map(a => a.id === area.id ? updatedArea : a)
      );
      
      Alert.alert(
        'Success', 
        `Service area ${updatedArea.active ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error) {
      console.error('Error updating service area status:', error);
      Alert.alert('Error', 'Failed to update service area status');
    }
  };
  
  if (loading) {
    return <Loading />;
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Service Area Management
        </Text>
        <Button
          title="Add New Area"
          onPress={openAddModal}
          icon={<Feather name="plus" size={18} color="white" />}
        />
      </View>
      
      <FlatList
        data={serviceAreas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={[styles.areaCard, { backgroundColor: colors.card }]}>
            <View style={styles.areaCardHeader}>
              <View style={styles.areaInfo}>
                <Text style={[styles.areaName, { color: colors.text }]}>
                  {item.name}
                </Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: item.active ? colors.success + '20' : colors.error + '20' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: item.active ? colors.success : colors.error }
                  ]}>
                    {item.active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                  onPress={() => openEditModal(item)}
                >
                  <Feather name="edit-2" size={16} color={colors.primary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: item.active ? colors.error + '20' : colors.success + '20' }]}
                  onPress={() => toggleAreaStatus(item)}
                >
                  <Feather 
                    name={item.active ? 'x' : 'check'} 
                    size={16} 
                    color={item.active ? colors.error : colors.success} 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
                  onPress={() => handleRemoveArea(item)}
                >
                  <Feather name="trash-2" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.areaDetails}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  ZIP Codes:
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {item.zipCodes.join(', ')}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Customers:
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {item.customerCount}
                </Text>
              </View>
            </View>
            
            <View style={styles.cardFooter}>
              <Button
                title="View Customers"
                onPress={() => navigation.navigate(
                  'CustomerList', 
                  { areaId: item.id }
                )}
                variant="outline"
                size="small"
              />
              
              <Button
                title="View Map"
                onPress={() => navigation.navigate(
                  'ServiceAreaMap', 
                  { areaId: item.id }
                )}
                variant="outline"
                size="small"
              />
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <Feather name="map-pin" size={40} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No service areas defined yet
            </Text>
            <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
              Add your first service area to start managing customers in that region
            </Text>
            <Button
              title="Add Service Area"
              onPress={openAddModal}
              style={styles.emptyButton}
            />
          </Card>
        }
      />
      
      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingArea ? 'Edit Service Area' : 'Add New Service Area'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalForm}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Area Name*
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="e.g. North District"
                placeholderTextColor={colors.textSecondary}
                value={areaName}
                onChangeText={setAreaName}
              />
              
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                ZIP Codes* (comma separated)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                    textAlignVertical: 'top',
                  },
                ]}
                placeholder="e.g. 110001, 110002, 110003"
                placeholderTextColor={colors.textSecondary}
                value={zipCodesInput}
                onChangeText={setZipCodesInput}
                multiline
                numberOfLines={3}
              />
              
              <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                The app will automatically assign customers to your franchise based on these ZIP codes.
              </Text>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title={editingArea ? 'Update' : 'Add'}
                onPress={handleSubmit}
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
  areaCard: {
    marginBottom: 16,
    padding: 16,
  },
  areaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  areaInfo: {
    flex: 1,
  },
  areaName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  areaDetails: {
    marginTop: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emptyButton: {
    minWidth: 200,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  modalForm: {
    maxHeight: 300,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    minHeight: 48,
  },
  helperText: {
    fontSize: 12,
    marginBottom: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  modalButton: {
    minWidth: 100,
    marginLeft: 12,
  },
});

export default LocationManagement;