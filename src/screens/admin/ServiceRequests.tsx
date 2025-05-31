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
  Image,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { adminService } from '@/services/adminService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';

type Order = {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  delivery_date: string;
  created_at: string;
  product_name: string;
  product_image: string;
  status: string;
  total_amount: number;
};

const ServiceRequests = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const [requests, setRequests] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      const response = await adminService.getServiceRequests(); // Replace with your actual service
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

  const openRequestDetails = (request: Order) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toDateString();
  };

  const renderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity onPress={() => openRequestDetails(item)} style={[styles.card, { backgroundColor: colors.card }]}>
      <Image source={{ uri: item.product_image }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={[styles.productName, { color: colors.text }]}>{item.product_name}</Text>
        <Text style={[styles.customerName, { color: colors.textSecondary }]}>Customer: {item.customer_name}</Text>
        <Text style={[styles.status, { color: colors.textSecondary }]}>Status: {item.status}</Text>
        <Text style={[styles.amount, { color: colors.text }]}>₹{item.total_amount}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Orders</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Manage all customer orders</Text>
      </View>

      {loading ? (
        <Loading />
      ) : requests.length === 0 ? (
        <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
          <Feather name="inbox" size={24} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No orders found</Text>
        </Card>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Order Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedRequest && (
              <View style={styles.modalBody}>
                <Image source={{ uri: selectedRequest.product_image }} style={styles.modalImage} />
                <Text style={[styles.modalText, { color: colors.text }]}>
                  Product: {selectedRequest.product_name}
                </Text>
                <Text style={[styles.modalText, { color: colors.text }]}>
                  Customer: {selectedRequest.customer_name}
                </Text>
                <Text style={[styles.modalText, { color: colors.text }]}>
                  Address: {selectedRequest.delivery_address}
                </Text>
                <Text style={[styles.modalText, { color: colors.text }]}>
                  Status: {selectedRequest.status}
                </Text>
                <Text style={[styles.modalText, { color: colors.text }]}>
                  Total: ₹{selectedRequest.total_amount}
                </Text>
                <Text style={[styles.modalText, { color: colors.text }]}>
                  Ordered At: {formatDate(selectedRequest.created_at)}
                </Text>

                <TextInput
                  value={completionNotes}
                  onChangeText={setCompletionNotes}
                  placeholder="Add completion notes..."
                  placeholderTextColor={colors.textSecondary}
                  style={[
                    styles.notesInput,
                    { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
                  ]}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <Button title="Mark as Completed" onPress={updateRequest} style={{ marginTop: 20 }} />
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
  card: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 1,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerName: {
    fontSize: 13,
    marginTop: 4,
  },
  status: {
    fontSize: 13,
    marginTop: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
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
  modalText: {
    fontSize: 14,
    marginBottom: 4,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginTop: 12,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 12,
  },
});

export default ServiceRequests;
