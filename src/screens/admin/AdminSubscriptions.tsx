// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, StyleSheet, Alert, RefreshControl } from 'react-native';
// import { useTheme } from '@/hooks/useTheme';
// import { useAuth } from '@/hooks/useAuth';
// import api from '@/services/api';
// import Loading from '@/components/ui/Loading';
// import Card from '@/components/ui/Card';
//
// const AdminSubscriptions = () => {
//   const { colors } = useTheme();
//   const { token } = useAuth();
//   const [subscriptions, setSubscriptions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//
//   const fetchSubscriptions = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get('/admin/subscriptions', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setSubscriptions(res.data);
//     } catch (error) {
//       console.error('Failed to fetch subscriptions:', error);
//       Alert.alert('Error', 'Unable to fetch subscriptions');
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   useEffect(() => {
//     fetchSubscriptions();
//   }, []);
//
//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchSubscriptions();
//     setRefreshing(false);
//   };
//
//   if (loading) return <Loading />;
//
//   const renderItem = ({ item }) => (
//     <Card style={[styles.card, { backgroundColor: colors.card }]}>
//       <Text style={[styles.title, { color: colors.text }]}>{item.product_name}</Text>
//       <Text style={{ color: colors.textSecondary }}>
//         Customer: {item.customer_id} | Status: {item.status}
//       </Text>
//       <Text style={{ color: colors.textSecondary }}>
//         From: {new Date(item.start_date).toDateString()} → {new Date(item.end_date).toDateString()}
//       </Text>
//     </Card>
//   );
//
//   return (
//     <FlatList
//       style={[styles.container, { backgroundColor: colors.background }]}
//       data={subscriptions}
//       keyExtractor={(item) => item.id.toString()}
//       renderItem={renderItem}
//       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//       ListEmptyComponent={
//         <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
//           No subscriptions found.
//         </Text>
//       }
//     />
//   );
// };
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 15,
//   },
//   card: {
//     marginBottom: 10,
//     padding: 15,
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 4,
//   },
// });
//
// export default AdminSubscriptions;
