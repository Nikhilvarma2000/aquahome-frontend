import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  StatusBar,
  Dimensions,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { useNavigation } from "@react-navigation/native";
import ProductCard from "../../components/ProductCard";
import Loading from "../../components/ui/Loading";
import { productService } from "../../services/productService";
import { Order, Product, ServiceRequest } from "../../types";
import { Feather } from "@expo/vector-icons";
import { customerService } from "@/services/customerService";
import OrderCard from "@/components/OrderCard";
import RequestCard from "@/components/RequestCard";

const { width: screenWidth } = Dimensions.get('window');

const RequestsListing = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedMonthlyRent, setEditedMonthlyRent] = useState("");
  const [editedSecurityDeposit, setEditedSecurityDeposit] = useState("");
  const [editedInstallationFee, setEditedInstallationFee] = useState("");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newMonthlyRent, setNewMonthlyRent] = useState("");
  const [newSecurityDeposit, setNewSecurityDeposit] = useState("");
  const [newInstallationFee, setNewInstallationFee] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const requests = await customerService.getServiceRequests();
      console.log("requests: ", requests);
      setRequests(requests);
    } catch (error) {
      Alert.alert("Error", "Failed to load service requests");
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleViewOrder = (request: ServiceRequest) => {
    navigation.navigate("RequestDetails", { request: request });
  };

  const handleCancelRequest = async (request: ServiceRequest) => {
    try {
      Alert.alert(
        "Cancel Request",
        "Are you sure you want to cancel this service request?",
        [
          { text: "No", style: "cancel" },
          {
            text: "Yes",
            style: "destructive",
            onPress: async () => {
              await customerService.cancelServiceRequest(request.id);
              onRefresh();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Cancel request error:", error);
      Alert.alert("Error", "Failed to cancel request");
    }
  };

  const filteredRequests = () => {
    switch (selectedFilter) {
      case "completed":
        return [...requests].filter(
          (request) => request.status === "completed"
        );
      case "pending":
        return [...requests].filter((request) => request.status === "pending");
      case "cancelled":
        return [...requests].filter((request) => request.status === "cancelled");
      default:
        return requests;
    }
  };

  const getFilterCount = (filter: string) => {
    if (filter === "all") return requests.length;
    return requests.filter(request => request.status === filter).length;
  };

  const renderFilterOption = (value: string, label: string) => {
    const count = getFilterCount(value);
    const isSelected = selectedFilter === value;
    
    return (
      <TouchableOpacity
        style={[
          styles.filterOption,
          {
            backgroundColor: isSelected ? colors.primary : colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isSelected ? 0.15 : 0.05,
            shadowRadius: 4,
            elevation: isSelected ? 4 : 2,
          }
        ]}
        onPress={() => setSelectedFilter(value)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.filterText,
            { 
              color: isSelected ? colors.background : colors.text,
              fontWeight: isSelected ? '600' : '500'
            },
          ]}
        >
          {label}
        </Text>
        {count > 0 && (
          <View
            style={[
              styles.filterBadge,
              {
                backgroundColor: isSelected ? colors.background : colors.primary,
              }
            ]}
          >
            <Text
              style={[
                styles.filterBadgeText,
                {
                  color: isSelected ? colors.primary : colors.background,
                }
              ]}
            >
              {count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return <Loading />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={colors.background === '#ffffff' ? 'dark-content' : 'light-content'}
      />
      
      {/* Header */}
      <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Service Requests
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Manage your service requests
          </Text>
        </View>
        {requests.length > 0 && (
          <View style={[styles.headerStats, { backgroundColor: colors.card }]}>
            <Text style={[styles.statsNumber, { color: colors.primary }]}>
              {requests.length}
            </Text>
            <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>
              Total
            </Text>
          </View>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filtersContainer, { backgroundColor: colors.background }]}>
        <View style={styles.filterOptions}>
          {renderFilterOption("all", "All")}
          {renderFilterOption("pending", "Pending")}
          {renderFilterOption("completed", "Completed")}
          {renderFilterOption("cancelled", "Cancelled")}
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={filteredRequests()}
        renderItem={({ item, index }) => (
          <View style={[
            styles.cardWrapper,
            { 
              marginTop: index === 0 ? 8 : 4,
              marginBottom: index === filteredRequests().length - 1 ? 20 : 4
            }
          ]}>
            <RequestCard
              request={item}
              onViewDetails={() => handleViewOrder(item)}
              onCancel={() => handleCancelRequest(item)}
            />
          </View>
        )}
        keyExtractor={(item, index) => {
          const id = item?.id;
          if (!id) {
            console.warn("⚠️ Request missing ID:", item);
            return index.toString();
          }
          return id.toString();
        }}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.card }]}>
              <Feather name="clipboard" size={40} color={colors.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Requests Found
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {selectedFilter === "all" 
                ? "You haven't made any service requests yet"
                : `No ${selectedFilter} requests available`
              }
            </Text>
            {selectedFilter !== "all" && (
              <TouchableOpacity
                style={[styles.clearFilterButton, { borderColor: colors.primary }]}
                onPress={() => setSelectedFilter("all")}
              >
                <Text style={[styles.clearFilterText, { color: colors.primary }]}>
                  View All Requests
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Edit Product
              </Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={[styles.closeButton, { backgroundColor: colors.background }]}
              >
                <Feather name="x" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Product Name</Text>
              <TextInput
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter product name"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
              <TextInput
                value={editedDescription}
                onChangeText={setEditedDescription}
                placeholder="Enter description"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              />
            </View>

            <View style={styles.priceRow}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Monthly Rent</Text>
                <TextInput
                  value={editedMonthlyRent}
                  onChangeText={setEditedMonthlyRent}
                  placeholder="₹0"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                />
              </View>
              
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Security Deposit</Text>
                <TextInput
                  value={editedSecurityDeposit}
                  onChangeText={setEditedSecurityDeposit}
                  placeholder="₹0"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Installation Fee</Text>
              <TextInput
                value={editedInstallationFee}
                onChangeText={setEditedInstallationFee}
                placeholder="₹0"
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
              >
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                // onPress={handleUpdateProduct}
                style={[styles.modalButton, styles.updateButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.updateButtonText, { color: colors.background }]}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Add Product
              </Text>
              <TouchableOpacity
                onPress={() => setAddModalVisible(false)}
                style={[styles.closeButton, { backgroundColor: colors.background }]}
              >
                <Feather name="x" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Product Name</Text>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="Enter product name"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
              <TextInput
                value={newDescription}
                onChangeText={setNewDescription}
                placeholder="Enter description"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              />
            </View>

            <View style={styles.priceRow}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Monthly Rent</Text>
                <TextInput
                  value={newMonthlyRent}
                  onChangeText={setNewMonthlyRent}
                  placeholder="₹0"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                />
              </View>
              
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Security Deposit</Text>
                <TextInput
                  value={newSecurityDeposit}
                  onChangeText={setNewSecurityDeposit}
                  placeholder="₹0"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Installation Fee</Text>
              <TextInput
                value={newInstallationFee}
                onChangeText={setNewInstallationFee}
                placeholder="₹0"
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setAddModalVisible(false)}
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
              >
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                // onPress={handleCreateProduct}
                style={[styles.modalButton, styles.addButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.addButtonText, { color: colors.background }]}>Add Product</Text>
              </TouchableOpacity>
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
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "400",
  },
  headerStats: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 60,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: "700",
  },
  statsLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    minHeight: 44,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  filterBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: "center",
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  listContainer: {
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  cardWrapper: {
    marginHorizontal: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  clearFilterButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 25,
  },
  clearFilterText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    padding: 24,
    borderRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 48,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  updateButton: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default RequestsListing;