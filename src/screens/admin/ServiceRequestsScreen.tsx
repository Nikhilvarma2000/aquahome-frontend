import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { adminService } from "../../services/adminService";
import { ServiceRequest } from "../../types";
import Card from "../../components/ui/Card";

const ServiceRequestsScreen = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await adminService.getServiceRequests();
        setRequests(data);
      } catch (error) {
        console.error("Error fetching service requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const renderItem = ({ item }: { item: ServiceRequest }) => (
    <Card style={styles.card}>
      <Text style={styles.title}>
        {item.customer?.first_name} {item.customer?.last_name}
      </Text>
      <Text>Type: {item.type}</Text>
      <Text>Status: {item.status}</Text>
      <Text>Created: {new Date(item.created_at).toLocaleString()}</Text>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>All Service Requests</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
});

export default ServiceRequestsScreen;
