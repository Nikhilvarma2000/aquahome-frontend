import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { customerService } from "../../services/customerService";
import { Order } from "../../types";
import Loading from "../../components/ui/Loading";
import { useTheme } from "../../hooks/useTheme";
import Button from "@/components/ui/Button";

const RequestDetailsScreen = () => {
  const route = useRoute<any>();
  const { colors } = useTheme();

  var [order, setOrder] = useState<Order>(route.params.order);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      customerService.getOrderById(order.id).then((res) => {
        setOrder(res);
        console.log("order: ", order);
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (order: Order) => {
    try {
      await customerService.cancelOrder(order.id);
      fetchOrder();
    } catch (error) {
      console.error("Cancel order error:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (!order.id || typeof order.id !== "number") {
      Alert.alert("Invalid Order ID");
      setLoading(false);
      return;
    }
    fetchOrder();
  }, []);

  if (loading) return <Loading />;

  if (!order) {
    return <Text style={{ color: colors.text }}>Order not found</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={[styles.orderId, { color: colors.text }]}>
          Order #{order.id}
        </Text>
        <Text style={[styles.status, { color: colors.textSecondary }]}>
          Status: {order.status}
        </Text>
        <Text style={[styles.address, { color: colors.text }]}>
          Shipping Address: {order.deliveryAddress}
        </Text>
        <Text style={[styles.product, { color: colors.text }]}>
          Product: {order.productId || "N/A"}
        </Text>
        <Text style={[styles.total, { color: colors.text }]}>
          Total: ₹{order.totalAmount?.toFixed(2) || "0.00"}
        </Text>
      </View>
      <View style={styles.footer}>
        <Button
          title={
            order.status === "cancelled" ? "Order Cancelled" : "Cancel Order"
          }
          disabled={order.status === "cancelled"}
          onPress={() => handleCancelOrder(order)}
          style={{
            backgroundColor:
              order.status === "cancelled" ? colors.card : colors.error,
            opacity: 1,
            flex: 1,
          }}
        />
        {/* )} */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f4f4f4",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  orderId: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  status: {
    fontSize: 16,
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    marginTop: 10,
  },
  product: {
    fontSize: 16,
    marginTop: 10,
  },
  total: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
});

export default RequestDetailsScreen;
