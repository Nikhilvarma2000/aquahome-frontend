import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { customerService } from '../../services/customerService';
import { Order } from '../../types';
import Loading from '../../components/ui/Loading';
import { useTheme } from '../../hooks/useTheme';

const OrderDetailsScreen = () => {
  const route = useRoute<any>();
  const { orderId } = route.params;
  const { colors } = useTheme();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const res = await customerService.getOrderById(orderId);
      setOrder(res);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  if (loading) return <Loading />;

  if (!order) {
    return <Text style={{ color: colors.text }}>Order not found</Text>;
  }

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>
        Order #{order.id}
      </Text>
      <Text style={{ color: colors.textSecondary }}>Status: {order.status}</Text>
      <Text style={{ marginTop: 10, color: colors.text }}>
        Shipping Address: {order.shippingAddress}
      </Text>
      <Text style={{ color: colors.text }}>
        Billing Address: {order.billingAddress}
      </Text>
      <Text style={{ marginTop: 10, color: colors.text }}>
        Product: {order.product?.name || 'N/A'}
      </Text>
      <Text style={{ color: colors.text }}>
        Total: ₹{order.totalAmount?.toFixed(2) || '0.00'}
      </Text>
    </ScrollView>
  );
};

export default OrderDetailsScreen;
