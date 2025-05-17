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
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { useNavigation } from "@react-navigation/native";
import ProductCard from "../../components/ProductCard";
import Loading from "../../components/ui/Loading";
import { productService } from "../../services/productService";
import { Order, Product } from "../../types";
import { Feather } from "@expo/vector-icons";
import { customerService } from "@/services/customerService";
import OrderCard from "@/components/OrderCard";

const OrdersLiting = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [orders, setOrders] = useState<Order[]>([]);
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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const orders = await customerService.getOrders();
      setOrders(orders);
    } catch (error) {
      Alert.alert("Error", "Failed to load products");
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleViewOrder = (order: Order) => {
    navigation.navigate("OrderDetails", { order: order });
  };

  const handleCancelOrder = (order: Order) => {
    try {
      customerService.cancelOrder(order.id);
      order.status = "cancelled";
      onRefresh();
    } catch (error) {
      console.error("Cancel order error:", error);
      throw error;
    }
  };

  // const handleToggleStatus = async (order: Order) => {
  //   try {
  //     const updated = { ...order };
  //     await productService.toggleProductStatus(order.id);
  //     fetchOrders();
  //   } catch (error) {
  //     Alert.alert("Error", "Failed to toggle product status.");
  //   }
  // };

  const filteredOrders = () => {
    switch (selectedFilter) {
      case "delivered":
        return [...orders].filter((order) => order.status === "delivered");
      case "pending":
        return [...orders].filter((order) => order.status === "pending");
      case "cancelled":
        return [...orders].filter((order) => order.status === "cancelled");
      default:
        return orders;
    }
  };

  const renderFilterOption = (value: string, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterOption,
        selectedFilter === value && { backgroundColor: colors.primary },
      ]}
      onPress={() => setSelectedFilter(value)}
    >
      <Text
        style={[
          styles.filterText,
          { color: selectedFilter === value ? colors.background : colors.text },
        ]}
      >
        {" "}
        {label}{" "}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return <Loading />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[styles.filtersContainer, { borderBottomColor: colors.border }]}
      >
        <View style={styles.filterOptions}>
          {renderFilterOption("all", "All")}
          {renderFilterOption("delivered", "Delivered")}
          {renderFilterOption("pending", "Pending")}
          {renderFilterOption("cancelled", "Cancelled")}
        </View>
      </View>

      <FlatList
        data={filteredOrders()}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onViewDetails={() => handleViewOrder(item)}
            onCancel={() => handleCancelOrder(item)}
          />
        )}
        keyExtractor={(item, index) => {
          const id = item?.id ?? item?.id;
          if (!id) {
            console.warn("⚠️ Product missing ID or id:", item);
            return index.toString(); // fallback safe
          }
          return id.toString(); // works whether it's number or string
        }}
        contentContainerStyle={styles.productList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="info" size={50} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No Orders available
            </Text>
          </View>
        }
      />

      {/* Edit Product Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Edit Product
            </Text>
            <TextInput
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Product Name"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border },
              ]}
            />
            <TextInput
              value={editedDescription}
              onChangeText={setEditedDescription}
              placeholder="Description"
              placeholderTextColor={colors.textSecondary}
              multiline
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border, height: 80 },
              ]}
            />
            <TextInput
              value={editedMonthlyRent}
              onChangeText={setEditedMonthlyRent}
              placeholder="Monthly Rent"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border },
              ]}
            />
            <TextInput
              value={editedSecurityDeposit}
              onChangeText={setEditedSecurityDeposit}
              placeholder="Security Deposit"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border },
              ]}
            />
            <TextInput
              value={editedInstallationFee}
              onChangeText={setEditedInstallationFee}
              placeholder="Installation Fee"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border },
              ]}
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setEditModalVisible(false)}
                style={styles.modalButton}
              >
                <Text style={{ color: colors.error }}>Cancel</Text>
              </Pressable>
              {/* <Pressable
                onPress={handleUpdateProduct}
                style={styles.modalButton}
              >
                <Text style={{ color: colors.primary }}>Update</Text>
              </Pressable> */}
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Add Product
            </Text>

            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Product Name"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border },
              ]}
            />
            <TextInput
              value={newDescription}
              onChangeText={setNewDescription}
              placeholder="Description"
              placeholderTextColor={colors.textSecondary}
              multiline
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border, height: 80 },
              ]}
            />
            <TextInput
              value={newMonthlyRent}
              onChangeText={setNewMonthlyRent}
              placeholder="Monthly Rent"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border },
              ]}
            />
            <TextInput
              value={newSecurityDeposit}
              onChangeText={setNewSecurityDeposit}
              placeholder="Security Deposit"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border },
              ]}
            />
            <TextInput
              value={newInstallationFee}
              onChangeText={setNewInstallationFee}
              placeholder="Installation Fee"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border },
              ]}
            />

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setAddModalVisible(false)}
                style={styles.modalButton}
              >
                <Text style={{ color: colors.error }}>Cancel</Text>
              </Pressable>
              {/* <Pressable
                onPress={handleCreateProduct}
                style={styles.modalButton}
              >
                <Text style={{ color: colors.primary }}>Add</Text>
              </Pressable> */}
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
    padding: 20,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  filterOptions: {
    flexDirection: "row",
    marginTop: 10,
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  productList: {
    padding: 15,
    paddingBottom: 30,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
});

export default OrdersLiting;
