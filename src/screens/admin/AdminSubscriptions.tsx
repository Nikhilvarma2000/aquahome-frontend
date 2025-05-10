
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { adminService } from '@/services/adminService';
import Loading from '@/components/ui/Loading';
import Card from '@/components/ui/Card';
import { Picker } from '@react-native-picker/picker';      // You must have this component or replace it with Picker
import { User, Subscription } from '@/types';

const AdminSubscriptions = () => {
  const { colors } = useTheme();
  const [customers, setCustomers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await adminService.getAllCustomers();

      // Normalize backend's capital "ID" to lowercase "id"
      const mapped = data.map((c) => ({
        ...c,
        id: c.ID, // 👈 fix here
      }));

      console.log("📦 Final Mapped Customers:", mapped);

      // Filter only valid entries
      setCustomers(mapped.filter(c => c?.id && c?.name));
    } catch (error) {
      Alert.alert("Error", "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };


  const loadSubscriptions = async (customerId: string) => {
    setRefreshing(true);
    try {
      const data = await adminService.getSubscriptionsByCustomer(customerId);
      setSubscriptions(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load subscriptions.");
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    if (selectedCustomerId) {
      await loadSubscriptions(selectedCustomerId);
    }
  };

  const renderItem = ({ item }: { item: Subscription }) => (
    <Card style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>{item.product_name}</Text>
      <Text style={{ color: colors.textSecondary }}>
        Status: {item.status}
      </Text>
      <Text style={{ color: colors.textSecondary }}>
        From: {new Date(item.start_date).toDateString()} → {new Date(item.end_date).toDateString()}
      </Text>
    </Card>
  );

  if (loading) return <Loading />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.label, { color: colors.text }]}>Select Customer</Text>
      <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, marginBottom: 16 }}>
        <Picker
          selectedValue={selectedCustomerId}
          onValueChange={(value) => {
            if (value) {
              setSelectedCustomerId(value);
              loadSubscriptions(value);
            }
          }}
          style={{
            color: colors.text,
            backgroundColor: colors.card,
            padding: 12,
          }}
        >
          <Picker.Item label="Select a customer" value="" />
          {customers.map((c, index) => (
            c?.id && c?.name ? (
              <Picker.Item key={c.id.toString()} label={c.name} value={c.id.toString()} />
            ) : null
          ))}
        </Picker>
      </View>

      <FlatList
        data={subscriptions}
        keyExtractor={(item, index) => (item?.id ? item.id.toString() : index.toString())}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
            No subscriptions found.
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    marginBottom: 10,
    padding: 15,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});

export default AdminSubscriptions;
