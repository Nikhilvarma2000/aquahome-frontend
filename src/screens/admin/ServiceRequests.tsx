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
  Modal,
  TextInput,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { adminService } from '@/services/adminService';
import { ServiceRequest } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import ServiceRequestCard from '../../components/ServiceRequestCard';

const ServiceRequests = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      const response = await adminService.getServiceRequests();
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching service requests:', error);
      Alert.alert('Error', 'Failed to load service requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServiceRequests();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchServiceRequests();
  };

  const openRequestDetails = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  const updateRequest = async () => {
    try {
      if (!selectedRequest) return;
      await adminService.updateServiceRequest(selectedRequest.id, {
        notes: completionNotes,
        status: 'completed',
      });
      Alert.alert('Success', 'Request marked as completed');
      setModalVisible(false);
      setCompletionNotes('');
      fetchServiceRequests();
    } catch (error) {
      Alert.alert('Error', 'Failed to update request');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Service Requests</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Manage all service tasks</Text>
      </View>

      {loading ? (
        <Loading />
      ) : requests.length === 0 ? (
        <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
          <Feather name="inbox" size={24} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No service requests found</Text>
        </Card>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ServiceRequestCard serviceRequest={item} onPress={() => openRequestDetails(item)} />
          )}
          contentContainerStyle={{ padding: 16 }}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Service Request Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedRequest && (
              <View style={styles.modalBody}>
                <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Customer:</Text>
                <Text style={[styles.modalText, { color: colors.text }]}>{selectedRequest.customerName}</Text>
                <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Service Type:</Text>
                <Text style={[styles.modalText, { color: colors.text }]}>{selectedRequest.type}</Text>
                <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Status:</Text>
                <Text style={[styles.modalText, { color: colors.text }]}>{selectedRequest.status}</Text>
                <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Description:</Text>
                <Text style={[styles.modalText, { color: colors.text }]}>{selectedRequest.description}</Text>

                <Text style={[styles.modalLabel, { color: colors.textSecondary, marginTop: 12 }]}>Notes:</Text>
                <TextInput
                  value={completionNotes}
                  onChangeText={setCompletionNotes}
                  placeholder="Add notes..."
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.notesInput, {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  }]}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <Button
                  title="Mark as Completed"
                  onPress={updateRequest}
                  style={{ marginTop: 20 }}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginHorizontal: 16,
    borderRadius: 10,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 10,
    padding: 20,
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
  modalBody: {
    gap: 10,
  },
  modalLabel: {
    fontWeight: '600',
    fontSize: 13,
  },
  modalText: {
    fontSize: 14,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
});

export default ServiceRequests;