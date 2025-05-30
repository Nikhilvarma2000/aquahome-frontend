import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { customerService } from "../../services/customerService";
import { Order } from "../../types";
import Loading from "../../components/ui/Loading";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";
import Button from "@/components/ui/Button";
import { ScrollView } from "react-native";

const OrderDetailsScreen = () => {
  const route = useRoute<any>();
  const { colors } = useTheme();
  const { user } = useAuth();

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
              await customerService.cancelOrder(order.id);
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
        <Text style={[styles.address, { color: colors.text }]}>Shipping Address: {order.deliveryAddress}</Text>
        <Text style={[styles.address, { color: colors.text }]}>Billing Address: {order.billingAddress}</Text>
        <Text style={[styles.product, { color: colors.text }]}>Product: {order.productName || 'N/A'}</Text>
        <Text style={[styles.total, { color: colors.text }]}>Monthly Rent: ₹{order.monthlyRent}</Text>
        <Text style={[styles.total, { color: colors.text }]}>Deposit: ₹{order.securityDeposit}</Text>
        <Text style={[styles.total, { color: colors.text }]}>Installation Fee: ₹{order.installationFee}</Text>
        <Text style={[styles.total, { color: colors.text }]}>Total: ₹{order.totalAmount?.toFixed(2)}</Text>
        <Text style={[styles.total, { color: colors.text }]}>
          Assigned Agent: {(order.serviceAgentName && order.serviceAgentPhone)
            ? `${order.serviceAgentName} (${order.serviceAgentPhone})`
            : 'Not Assigned'}
        </Text>
      </View>

      {isCancellable && (
        <View style={styles.footer}>
          <Button
            title="Cancel Order"
            onPress={() => handleCancelOrder(order)}
            style={{ backgroundColor: colors.error, flex: 1 }}
          />
        </View>
      )}
    </ScrollView>
  );
 };

const styles = StyleSheet.create({
 container: {
   flexGrow: 1,
   padding: 1,
   justifyContent: "space-between",
   backgroundColor: "#f4f4f4",
 },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 30,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 20,
  },
  orderId: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  status: {
    fontSize: 18,
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
    flexDirection: "column",
    paddingHorizontal: 15,
    paddingBottom: 40, // Increased for spacing below
    paddingTop: 10,
    backgroundColor: "#f4f4f4",
  },

});

export default OrderDetailsScreen;
