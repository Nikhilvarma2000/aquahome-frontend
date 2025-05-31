import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { customerService } from "../../services/customerService";
import { Order } from "../../types";
import Loading from "../../components/ui/Loading";
import { useTheme } from "../../hooks/useTheme";
// import { useAuth } from "../../hooks/useAuth";
import { useAuth } from '../../hooks/useAuth';
import Button from "@/components/ui/Button";
import { ScrollView } from "react-native";

const OrderDetailsScreen = () => {
  const route = useRoute<any>();
  const { colors } = useTheme();
  const { user, token } = useAuth();

  const rawId = route.params?.orderId;
  console.log("🧭 Raw Order ID param:", rawId);

  const orderId = typeof rawId === "number" ? rawId : Number(rawId);
  console.log("🧭 Parsed Order ID:", orderId);


  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      //         console.log("📦 Trying to fetch order with ID:", orderId);
      const res = await customerService.getOrderById(orderId);
      console.log("🧾 API Raw Order Response:", res); // 👈 log full raw response

      const normalizedOrder = {
        ...res,
        id: res.id ?? res.ID ?? orderId,
        productId: res.product_id ?? res.productId,
        deliveryAddress: res.shipping_address ?? res.deliveryAddress,
        billingAddress: res.billing_address ?? res.billingAddress,
        productName: res.product_name ?? res.productName,
        monthlyRent: res.monthly_rent ?? res.monthlyRent,
        securityDeposit: res.security_deposit ?? res.securityDeposit,
        installationFee: res.installation_fee ?? res.installationFee,
        totalAmount: res.total_initial_amount ?? res.totalAmount,
        serviceAgentName: res.service_agent_name ?? '',
        serviceAgentPhone: res.service_agent_phone ?? '',
        status: res.status ?? "pending",
        customerName: res.customer_name ?? '',
        customerPhone: res.customer_phone ?? '',
        customerEmail: res.customer_email ?? '',
      };

      setOrder(normalizedOrder);
      //           console.log("Normalized Order:", normalizedOrder);
    } catch (err) {
      console.error("Order fetch error:", err);
      Alert.alert("Error", "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId || isNaN(orderId)) {
      Alert.alert("Invalid Order ID");
      setLoading(false);
      return;
    }
    fetchOrder();
  }, []);

  const isCancellable = order?.status !== "cancelled";

  const handleCancelOrder = (order: Order) => {
    if (!order.id || typeof order.id !== "number") {
      console.warn("⚠️ Invalid order ID:", order);
      return;
    }

    Alert.alert(
      "Confirm",
      "Are you sure you want to cancel this order?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Canceling order with ID:", order.id);
              console.log("Token:", token);
              await customerService.cancelOrder(order.id, token);
              Alert.alert("Success", "Order cancelled successfully");
              fetchOrder();
            } catch (error) {
              console.error("Cancel order error:", error);
              Alert.alert("Error", "Failed to cancel order");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) return <Loading />;

  if (!order) {
    return <Text style={{ color: colors.text }}>Order not found</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={[styles.orderId, { color: colors.text }]}>Order #{order.id}</Text>
        <Text style={[styles.status, { color: colors.textSecondary }]}>Status: {order.status}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Addresses</Text>
          <Text style={[styles.text, { color: colors.text }]}>Shipping: {order.deliveryAddress}</Text>
          <Text style={[styles.text, { color: colors.text }]}>Billing: {order.billingAddress}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Product Details</Text>
          <Text style={[styles.text, { color: colors.text }]}>Product: {order.productName || 'N/A'}</Text>
          <Text style={[styles.text, { color: colors.text }]}>Monthly Rent: ₹{order.monthlyRent}</Text>
          <Text style={[styles.text, { color: colors.text }]}>Deposit: ₹{order.securityDeposit}</Text>
          <Text style={[styles.text, { color: colors.text }]}>Installation Fee: ₹{order.installationFee}</Text>
          <Text style={[styles.text, { color: colors.text }]}>Total: ₹{order.totalAmount?.toFixed(2)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Customer</Text>
          <Text style={[styles.text, { color: colors.text }]}>Name: {order.customerName || 'N/A'}</Text>
          <Text style={[styles.text, { color: colors.text }]}>Phone: {order.customerPhone || 'N/A'}</Text>
          <Text style={[styles.text, { color: colors.text }]}>Email: {order.customerEmail || 'N/A'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Service Agent</Text>
          <Text style={[styles.text, { color: colors.text }]}>
            {(order.serviceAgentName && order.serviceAgentPhone)
              ? `${order.serviceAgentName} (${order.serviceAgentPhone})`
              : 'Not Assigned'}
          </Text>
        </View>
      </View>

      {isCancellable && (
        <View style={styles.footer}>
          <Button
            title="Cancel Order"
            onPress={() => handleCancelOrder(order)}
            style={{ backgroundColor: colors.error, paddingVertical: 14 }}
          />
        </View>
      )}
    </ScrollView>
  );

};

export default OrderDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f4f4f4",
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 5,
  },
  orderId: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  status: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  section: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#555",
  },
  text: {
    fontSize: 15,
    marginBottom: 4,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 10,
  },
});
