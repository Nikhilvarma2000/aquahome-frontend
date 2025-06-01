import React, { useState, useEffect } from "react";
import RazorpayCheckout from 'react-native-razorpay';
import  api from '../../services/api'; // adjust path if needed
import { useAuth } from "../../hooks/useAuth";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Product, Order } from "../../types";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Loading from "../../components/ui/Loading";
import { Feather } from "@expo/vector-icons";
import { customerService } from "../../services/customerService";
import { productService } from "../../services/productService";



type OrderPlacementParams = {
  productId: string;
  orderType: "purchase" | "rental";
};

const OrderPlacement = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
   const { user } = useAuth();
  const route =
    useRoute<RouteProp<Record<string, OrderPlacementParams>, string>>();

  const { productId, orderType } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

useEffect(() => {
  const fetchProductDetails = async () => {
    try {
      setLoading(true);

      const data = await productService.getProductById(Number(productId));
      console.log("Fetched product: ", data);

      setProduct({
        id: data.ID,
        name: data.name,
        description: data.description,
        price: data.monthly_rent || 0,
        rentalPrice: data.monthly_rent || 0,
        installationCharge: data.installation_fee || 0,
        maintenanceFrequency: data.maintenance_cycle || 0,
        imageUrl: data.image_url || "",
        features: data.features ? data.features.split(",") : [],
        specifications: {
          capacity: data.specifications || "N/A",
          dimensions: "N/A",
          powerConsumption: "N/A",
          filterLifespan: "N/A",
        },
        inStock: data.is_active,
        createdAt: data.CreatedAt,
        updatedAt: data.UpdatedAt,
      });

    } catch (error) {
      Alert.alert("Error", "Failed to load product details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  fetchProductDetails(); // ✅ Call the async function here
}, [productId]);

//       } catch (error) {
//         Alert.alert("Error", "Failed to load product details");
//         console.error(error);
//       } finally {
//         setLoading(false);
//       }
//     };
//
//     fetchProductDetails();
//   }, [productId]);

  const calculateTotal = () => {
    if (!product) return 0;

    if (orderType === "purchase") {
      return product.price + product.installationCharge;
    } else {
      // For rental, first month's rent + installation + security deposit (if any)
      // Assuming a security deposit equal to 2 months of rental
      return (
        product.rentalPrice +
        product.installationCharge +
        product.rentalPrice * 2
      );
    }
  };



  const handlePlaceOrder = async () => {
    if (!product) return;

    if (!deliveryAddress.trim()) {
      Alert.alert("Error", "Please enter a delivery address");
      return;
    }

    try {
      setSubmitting(true);

  //     // 1. Place the order
      const orderData = {
        product_id: Number(product.id),
       franchise_id: user?.franchise_id || 1,
        shipping_address: deliveryAddress,
        billing_address: deliveryAddress,
        rental_duration: orderType === "rental" ? 6 : 1,
        notes: specialInstructions || "",
      };

  //       console.log("Sending order:", orderData);



  //     const placedOrderResponse = await customerService.placeOrder(orderData);
  //     console.log("💡 Full Order Response:", placedOrderResponse);

  //  const order = placedOrderResponse?.order;

  //  if (!order || !order.ID) {
  //    console.error("🚨 Order ID missing in response:", placedOrderResponse);
  //    Alert.alert("Order Failed", "No valid order received from server.");
  //    return;
  //  }

  //  const aquahomeOrderId = order.ID;
  //  console.log("✅ Final Order ID passed to Razorpay:", aquahomeOrderId);
      // 2. Generate Razorpay Order
      const paymentRes = await api.post('/payments/generate-order', orderData);

      const { razorpay_order_id, amount, currency, key,aquahome_order_id } = paymentRes.data;

      // 3. Open Razorpay checkout
      const options = {
        description: 'AQUA_HOME Order Payment',
        image: 'https://your-logo-url.com/logo.png', // optional
        currency: currency,
        key: key,
        amount: amount * 100, // amount in paise
        order_id: razorpay_order_id,
        name: 'AquaHome',
        prefill: {
          email: user?.email ?? '',
          contact: user?.phone ?? '',
          name: user?.name ?? ''
        },
        theme: { color: '#00AEEF' }
      };

      RazorpayCheckout.open(options).then(async (paymentResult) => {
        // 4. Verify payment
        const verifyPayload = {
          payment_id: paymentResult.razorpay_payment_id,
          order_id: paymentResult.razorpay_order_id,
          signature: paymentResult.razorpay_signature,
          aquahome_order_id: aquahome_order_id
        };

        const verifyRes = await api.post('/payments/verify', verifyPayload);

        if (verifyRes.data.success) {
          Alert.alert("✅ Payment Successful", "Order confirmed!", [
            {
              text: "View Orders",
              onPress: () => navigation.navigate("OrdersListing" as never),
            },
          ]);
        } else {
          Alert.alert("⚠️ Verification Failed", "Payment could not be verified.");
        }
      }).catch((err) => {
        console.warn("Payment cancelled or failed", err);
        Alert.alert("❌ Payment Cancelled", "Your payment was not completed.");
      });

    } catch (err) {
      console.error("Order error:", err);
      Alert.alert("Sorry ❌", "Failed to place order or start payment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Product not found
        </Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Card style={[styles.productCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.productName, { color: colors.text }]}>
          {product.name}
        </Text>
        <Text
          style={[styles.productDescription, { color: colors.textSecondary }]}
        >
          {product.description}
        </Text>

        <View style={styles.orderTypeContainer}>
          <Text style={[styles.orderTypeLabel, { color: colors.text }]}>
            Order Type:
          </Text>
          <View
            style={[
              styles.orderTypeBadge,
              {
                backgroundColor:
                  orderType === "purchase" ? colors.primary : colors.info,
              },
            ]}
          >
            <Text style={styles.orderTypeText}>
              {orderType === "purchase" ? "Purchase" : "Rental"}
            </Text>
          </View>
        </View>
      </Card>

      <Card style={[styles.detailsCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Delivery Information
        </Text>

        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Delivery Address*
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
          placeholder="Enter your full delivery address"
          placeholderTextColor={colors.textSecondary}
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          multiline
          numberOfLines={3}
        />

        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Preferred Delivery Date
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
          placeholder="YYYY-MM-DD (Optional)"
          placeholderTextColor={colors.textSecondary}
          value={preferredDate}
          onChangeText={setPreferredDate}
        />

        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Special Instructions
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
          placeholder="Any special instructions for delivery (Optional)"
          placeholderTextColor={colors.textSecondary}
          value={specialInstructions}
          onChangeText={setSpecialInstructions}
          multiline
          numberOfLines={2}
        />
      </Card>

      <Card style={[styles.summaryCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Order Summary
        </Text>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            {orderType === "purchase" ? "Product Price" : "Monthly Rental"}
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            ₹
            {orderType === "purchase"
              ? product.price.toFixed(2)
              : product.rentalPrice.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Installation Charges
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            ₹{product.installationCharge.toFixed(2)}
          </Text>
        </View>

        {orderType === "rental" && (
          <View style={styles.summaryRow}>
            <Text
              style={[styles.summaryLabel, { color: colors.textSecondary }]}
            >
              Security Deposit (Refundable)
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              ₹{(product.rentalPrice * 2).toFixed(2)}
            </Text>
          </View>
        )}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.summaryRow}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>
            Total Amount
          </Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>
            ₹{calculateTotal().toFixed(2)}
          </Text>
        </View>

        {orderType === "rental" && (
          <Text style={[styles.rentalNote, { color: colors.textSecondary }]}>
            *After initial payment, monthly rental of ₹
            {product.rentalPrice.toFixed(2)} will be charged
          </Text>
        )}
      </Card>

      <View style={styles.actionButtons}>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.backButton}
        />
        <Button
          title={submitting ? "Processing..." : "Place Order"}
          onPress={handlePlaceOrder}
          loading={submitting}
          disabled={submitting || !deliveryAddress.trim()}
          style={styles.orderButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  productCard: {
    marginBottom: 16,
    padding: 16,
  },
  productName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  orderTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  orderTypeLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 10,
  },
  orderTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  orderTypeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  detailsCard: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  summaryCard: {
    marginBottom: 24,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  rentalNote: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  backButton: {
    flex: 1,
    marginRight: 8,
  },
  orderButton: {
    flex: 2,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
});

export default OrderPlacement;
