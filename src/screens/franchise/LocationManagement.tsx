import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';
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
  Dimensions,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import { useNavigation } from '@react-navigation/native';
import { franchiseService } from '@/services/franchiseService';

const { width } = Dimensions.get('window');

interface BackendServiceArea {
  ID: number;
  name: string;
  zip_codes: string[];
  is_active: boolean;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string;
  franchises?: any;
}

interface ServiceArea {
  id: string;
  name: string;
  zipCodes: string[];
  customerCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const LocationManagement = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingArea, setEditingArea] = useState<ServiceArea | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [areaName, setAreaName] = useState('');
  const [zipCodesInput, setZipCodesInput] = useState('');

  // Transform backend data to frontend format
  const transformBackendData = (backendData: BackendServiceArea[]): ServiceArea[] => {
    return backendData
      .filter(item => item && !item.DeletedAt) // Filter out deleted items
      .map(item => ({
        id: item.ID.toString(),
        name: item.name || 'Unnamed Area',
        zipCodes: item.zip_codes || [],
        customerCount: 0, // This might need to come from another API call
        active: item.is_active ?? false,
        createdAt: item.CreatedAt,
        updatedAt: item.UpdatedAt,
      }));
  };

  useEffect(() => {
    fetchServiceAreas();
  }, []);

  const fetchServiceAreas = async () => {
    try {
      setLoading(true);
      const data = await franchiseService.getFranchiseLocations();
      console.log("🚀 ~ fetchServiceAreas ~ raw data:", data);
      
      const transformedData = transformBackendData(data);
      console.log("🚀 ~ fetchServiceAreas ~ transformed data:", transformedData);
      
      setServiceAreas(transformedData);
    } catch (error) {
      console.error('Error fetching service areas:', error);
      Alert.alert('Error', 'Failed to load service areas. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchServiceAreas();
    setRefreshing(false);
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

  const validateZipCodes = (zipCodes: string[]): boolean => {
    const zipCodeRegex = /^\d{5,6}$/; // 5-6 digit zip codes
    return zipCodes.every(zip => zipCodeRegex.test(zip));
  };

  const handleSubmit = async () => {
    if (!areaName.trim()) {
      Alert.alert('Validation Error', 'Please enter an area name');
      return;
    }

    const zipCodes = zipCodesInput
      .split(',')
      .map(zip => zip.trim())
      .filter(zip => zip.length > 0);

    if (zipCodes.length === 0) {
      Alert.alert('Validation Error', 'Please enter at least one ZIP code');
      return;
    }

    if (!validateZipCodes(zipCodes)) {
      Alert.alert('Validation Error', 'Please enter valid ZIP codes (5-6 digits)');
      return;
    }

    try {
      setLoading(true);
      
      if (editingArea) {
    
        const updatedArea = await franchiseService.updateFranchiseLocation(editingArea.id, {
          name: areaName,
          zip_codes: zipCodes, 
          is_active: editingArea.active, 
        });

        // Transform the response and update state
        const transformedArea = transformBackendData([updatedArea])[0];
        setServiceAreas(prev =>
          prev.map(area => (area.id === editingArea.id ? transformedArea : area))
        );
        Alert.alert('Success', 'Service area updated successfully');
      } else {
       
        
        const newArea = await franchiseService.addFranchiseLocation({
          name: areaName,
          zip_codes: zipCodes, // Use backend field name
        });

        // Transform the response and update state
        const transformedArea = transformBackendData([newArea])[0];
        setServiceAreas(prev => [...prev, transformedArea]);
        Alert.alert('Success', 'Service area added successfully');
      }
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving service area:', error);
      Alert.alert('Error', 'Failed to save service area. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveArea = (area: ServiceArea) => {
    Alert.alert(
      'Confirm Removal',
      `Are you sure you want to remove "${area.name}" from your service areas? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await franchiseService.deleteFranchiseLocation(area.id);
              setServiceAreas(prev => prev.filter(a => a.id !== area.id));
              Alert.alert('Success', 'Service area removed successfully');
            } catch (error) {
              console.error('Error removing service area:', error);
              Alert.alert('Error', 'Failed to remove service area. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const toggleAreaStatus = async (area: ServiceArea) => {
    try {
      setLoading(true);
      const updatedArea = await franchiseService.updateFranchiseLocation(area.id, {
        name: area.name,
        zip_codes: area.zipCodes,
        is_active: !area.active, 
      });

      // Transform the response and update state
      const transformedArea = transformBackendData([updatedArea])[0];
      setServiceAreas(prev =>
        prev.map(a => (a.id === area.id ? transformedArea : a))
      );

      Alert.alert(
        'Success',
        `Service area ${transformedArea.active ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error) {
      console.error('Error updating service area status:', error);
      Alert.alert('Error', 'Failed to update service area status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderServiceAreaCard = ({ item }: { item: ServiceArea }) => (
    <Card style={[styles.areaCard, { backgroundColor: colors.card }]}>
      <View style={styles.areaCardHeader}>
        <View style={styles.areaInfo}>
          <Text style={[styles.areaName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { 
                backgroundColor: item.active 
                  ? colors.success + '20' 
                  : colors.error + '20' 
              },
            ]}
          >
            <Feather 
              name={item.active ? 'check-circle' : 'pause-circle'} 
              size={12} 
              color={item.active ? colors.success : colors.error}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.statusText,
                { color: item.active ? colors.success : colors.error },
              ]}
            >
              {item.active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary + '15' }]}
            onPress={() => openEditModal(item)}
            activeOpacity={0.7}
          >
            <Feather name="edit-2" size={16} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: item.active 
                  ? colors.warning + '15' 
                  : colors.success + '15',
              },
            ]}
            onPress={() => toggleAreaStatus(item)}
            activeOpacity={0.7}
          >
            <Feather
              name={item.active ? 'pause' : 'play'}
              size={16}
              color={item.active ? colors.warning : colors.success}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error + '15' }]}
            onPress={() => handleRemoveArea(item)}
            activeOpacity={0.7}
          >
            <Feather name="trash-2" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.areaDetails}>
        <View style={styles.detailRow}>
          <Feather name="map-pin" size={14} color={colors.textSecondary} />
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>ZIP Codes:</Text>
        </View>
        <Text style={[styles.detailValue, { color: colors.text }]}>
          {item.zipCodes.length > 0 ? item.zipCodes.join(', ') : 'No ZIP codes'}
        </Text>

        {/* <View style={[styles.detailRow, { marginTop: 8 }]}>
          <Feather name="users" size={14} color={colors.textSecondary} />
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Customers:</Text>
        </View>
        <Text style={[styles.detailValue, { color: colors.text }]}>
          {item.customerCount || 0}
        </Text> */}

        <View style={[styles.detailRow, { marginTop: 8 }]}>
          <Feather name="calendar" size={14} color={colors.textSecondary} />
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Created:</Text>
        </View>
        <Text style={[styles.detailValue, { color: colors.text }]}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <Button
          title="View Customers"
          onPress={() => navigation.navigate('CustomerList', { areaId: item.id })}
          variant="outline"
          size="small"
          style={styles.footerButton}
        />

        <Button
          title="View on Map"
          onPress={() => navigation.navigate('ServiceAreaMap', { areaId: item.id })}
          variant="outline"
          size="small"
          style={styles.footerButton}
        />
      </View>
    </Card>
  );

  if (loading && serviceAreas.length === 0) {
    return <Loading />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Service Areas</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Manage your franchise locations
          </Text>
        </View>
        <Button
          title="Add Area"
          onPress={openAddModal}
          icon={<Feather name="plus" size={18} color="white" />}
          style={styles.addButton}
        />
      </View>

      <FlatList
        data={serviceAreas}
        keyExtractor={(item) => item.id}
        renderItem={renderServiceAreaCard}
        onRefresh={onRefresh}
        refreshing={refreshing}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '10' }]}>
              <Feather name="map-pin" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No service areas yet
            </Text>
            <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
              Create your first service area to start managing customers in specific regions
            </Text>
            <Button 
              title="Create Service Area" 
              onPress={openAddModal} 
              style={styles.emptyButton}
              icon={<Feather name="plus" size={18} color="white" />}
            />
          </Card>
        }
      />

      {/* Add/Edit Modal */}
      <Modal 
        visible={modalVisible} 
        transparent 
        animationType="slide" 
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingArea ? 'Edit Service Area' : 'Add New Service Area'}
              </Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Area Name <Text style={{ color: colors.error }}>*</Text>
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
                  placeholder="e.g. North District, Downtown Area"
                  placeholderTextColor={colors.textSecondary}
                  value={areaName}
                  onChangeText={setAreaName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  ZIP Codes <Text style={{ color: colors.error }}>*</Text>
                </Text>
                <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
                  Enter ZIP codes separated by commas
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="e.g. 508204, 508206, 500008"
                  placeholderTextColor={colors.textSecondary}
                  value={zipCodesInput}
                  onChangeText={setZipCodesInput}
                  multiline
                  numberOfLines={3}
                  keyboardType="numeric"
                />
              </View>

              {zipCodesInput.trim() && (
                <View style={[styles.previewCard, { backgroundColor: colors.background }]}>
                  <Text style={[styles.previewTitle, { color: colors.text }]}>
                    Preview
                  </Text>
                  <Text style={[styles.previewText, { color: colors.textSecondary }]}>
                    Area: <Text style={{ color: colors.text, fontWeight: '600' }}>
                      {areaName || 'Unnamed Area'}
                    </Text>
                  </Text>
                  <Text style={[styles.previewText, { color: colors.textSecondary }]}>
                    ZIP Codes: <Text style={{ color: colors.text, fontWeight: '600' }}>
                      {zipCodesInput.split(',').map(zip => zip.trim()).filter(zip => zip).join(', ')}
                    </Text>
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title={editingArea ? 'Update Area' : 'Create Area'}
                onPress={handleSubmit}
                style={styles.modalButton}
                disabled={!areaName.trim() || !zipCodesInput.trim()}
              />
            </View>
          </View>
        </View>
      </Modal>

      {loading && (
        <View style={styles.loadingOverlay}>
          <Loading />
        </View>
      )}
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
  },
  addButton: {
    minWidth: 100,
  },
  listContainer: {
    paddingBottom: 20,
  },
  areaCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  areaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  areaInfo: {
    flex: 1,
    marginRight: 12,
  },
  areaName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  areaDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  detailValue: {
    fontSize: 14,
    marginLeft: 20,
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  footerButton: {
    flex: 0.48,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  emptyButton: {
    minWidth: 180,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalForm: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  inputHint: {
    fontSize: 12,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 52,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  previewCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 13,
    marginBottom: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 0.48,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LocationManagement;