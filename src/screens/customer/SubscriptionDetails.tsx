import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { customerService } from '../../services/customerService';
import { useTheme } from '../../hooks/useTheme';
import { Feather } from '@expo/vector-icons';

const SubscriptionDetails = () => {
  const { colors } = useTheme();
  const route = useRoute<RouteProp<any>>();
  const { id } = route.params as { id: string };

  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    try {
      const data = await customerService.getSubscriptionById(id);
      setSubscription(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load subscription details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {subscription.product_name}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        ₹{subscription.monthly_rent.toFixed(2)} per month
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Service History</Text>
      {subscription.service_history?.length > 0 ? (
        subscription.service_history.map((item: any) => (
          <Text key={item.id} style={{ color: colors.textSecondary }}>
            • {item.date?.split('T')[0]} - {item.type} ({item.status})
          </Text>
        ))
      ) : (
        <Text style={{ color: colors.textSecondary }}>No service history.</Text>
      )}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment History</Text>
      {subscription.payment_history?.length > 0 ? (
        subscription.payment_history.map((item: any) => (
          <Text key={item.id} style={{ color: colors.textSecondary }}>
            • ₹{item.amount} on {item.date?.split('T')[0]} ({item.status})
          </Text>
        ))
      ) : (
        <Text style={{ color: colors.textSecondary }}>No payments found.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 24, marginBottom: 8 },
});

export default SubscriptionDetails;
