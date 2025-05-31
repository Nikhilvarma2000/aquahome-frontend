import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { customerService } from "../../services/customerService";
import { useTheme } from "../../hooks/useTheme";
import Loading from "../../components/ui/Loading";
import Button from "@/components/ui/Button";

interface Request {
  completion_time: string | null;
  created_at: string;
  customer_email: string;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  description: string;
  feedback: string;
  franchise_id: number;
  franchise_name: string;
  id: number;
  product_id: number;
  product_name: string;
  rating: number | null;
  scheduled_time: string;
  service_agent_id: number | null;
  service_agent_name: string;
  status: string;
  subscription_id: number;
  type: string;
  updated_at: string;
}

const RequestDetailsScreen = () => {
  const route = useRoute<any>();
  const { colors } = useTheme();

  const [order, setOrder] = useState<Request>(route.params.request);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const res = await customerService.getRequestById(order.id);
      setOrder(res);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      if (!order?.id || typeof order.id !== "number") {
        Alert.alert("Invalid Order", "Order ID is missing or invalid.");
        return;
      }

      await customerService.cancelOrder(order.id);
      await fetchOrder();
      Alert.alert("Cancelled", "Order cancelled successfully.");
    } catch (error) {
      console.error("Cancel order error:", error);
      Alert.alert("Error", "Failed to cancel order");
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
          Request #{order.id}
        </Text>
        <Text style={[styles.status, { color: colors.textSecondary }]}>
          Status: {order.status}
        </Text>
        <Text style={[styles.product, { color: colors.text }]}>
          Type: {order.type}
        </Text>
        <Text style={[styles.product, { color: colors.text }]}>
          Product: {order.product_name || "N/A"}
        </Text>
        <Text style={[styles.product, { color: colors.text }]}>
          Scheduled Time: {new Date(order.scheduled_time).toLocaleString()}
        </Text>
        <Text style={[styles.product, { color: colors.text }]}>
          Customer: {order.customer_name} ({order.customer_phone})
        </Text>
        <Text style={[styles.product, { color: colors.text }]}>
          Email: {order.customer_email}
        </Text>
        {/* <Text style={[styles.product, { color: colors.text }]}>
          Franchise: {order.franchise_name}
        </Text> */}
        <Text style={[styles.product, { color: colors.text }]}>
          Description: {order.description}
        </Text>
        {order.feedback ? (
          <Text style={[styles.product, { color: colors.text }]}>
            Feedback: {order.feedback}
          </Text>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Button
          title={order.status === "cancelled" ? "Order Cancelled" : "Cancel Order"}
          disabled={order.status === "cancelled"}
          onPress={handleCancelOrder}
          style={{
            backgroundColor:
              order.status === "cancelled" ? colors.card : colors.error,
            opacity: 1,
            flex: 1,
          }}
        />
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
  product: {
    fontSize: 16,
    marginTop: 8,
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
