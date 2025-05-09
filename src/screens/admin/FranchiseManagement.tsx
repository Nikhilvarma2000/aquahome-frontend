// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
// import { adminService } from '@/services/adminService';
// import { Franchise } from '@/types';
// import { Feather } from '@expo/vector-icons';
// import { useTheme } from '@/hooks/useTheme';
// import { useNavigation } from '@react-navigation/native';
//
// const FranchiseManagement = () => {
//   const [franchises, setFranchises] = useState<Franchise[]>([]);
//   const [loading, setLoading] = useState(true);
//   const { colors } = useTheme();
//   const navigation = useNavigation<any>();
//
//   useEffect(() => {
//     const unsubscribe = navigation.addListener('focus', () => {
//       fetchFranchises(); // ✅ refresh on screen focus
//     });
//
//     return unsubscribe;
//   }, [navigation]);
//
//   const fetchFranchises = async () => {
//     try {
//       setLoading(true);
//       const data = await adminService.getAllFranchises();
//       setFranchises(data);
//     } catch (error) {
//       console.error('Failed to load franchises', error);
//       Alert.alert('Error', 'Failed to load franchises');
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   const handleEdit = (franchiseId: string) => {
//     navigation.navigate('EditFranchise', { id: franchiseId });
//   };
//
//   const handleDelete = async (franchiseId: string) => {
//     try {
//       Alert.alert(
//         'Confirm Delete',
//         'Are you sure you want to delete this franchise?',
//         [
//           { text: 'Cancel', style: 'cancel' },
//           {
//             text: 'Delete',
//             style: 'destructive',
//             onPress: async () => {
//               await adminService.deleteFranchise(franchiseId);
//               fetchFranchises();
//             },
//           },
//         ]
//       );
//     } catch (error) {
//       console.error('Delete error:', error);
//       Alert.alert('Error', 'Failed to delete franchise');
//     }
//   };
//
//   const handleToggleStatus = async (franchiseId: string, active: boolean) => {
//     try {
//       const newStatus = active ? 'active' : 'inactive';
//       await adminService.updateFranchiseStatus(franchiseId, newStatus);
//       fetchFranchises();
//     } catch (error) {
//       console.error('Status toggle error:', error);
//       Alert.alert('Error', 'Failed to update status');
//     }
//   };
//
//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color={colors.primary} />
//       </View>
//     );
//   }
//
//   return (
//     <View style={styles.container}>
//       {/* Add Franchise Button */}
//       <TouchableOpacity
//         style={[styles.addButton, { backgroundColor: colors.primary }]}
//         onPress={() => navigation.navigate("AddFranchise")}
//       >
//         <Text style={styles.addButtonText}>+ Add Franchise</Text>
//       </TouchableOpacity>
//
//       <FlatList
//         data={franchises}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => (
//           <View style={[styles.card, { backgroundColor: colors.card }]}>
//             <View style={styles.cardHeader}>
//               <Text style={[styles.title, { color: colors.text }]}>{item.name}</Text>
//               <Switch
//                 value={item.is_active}
//                 onValueChange={(value) => handleToggleStatus(item.id, value)}
//               />
//             </View>
//
//             <Text style={{ color: colors.textSecondary }}>Status: {item.status}</Text>
//
//             <View style={styles.actions}>
//               <TouchableOpacity style={styles.iconButton} onPress={() => handleEdit(item.id)}>
//                 <Feather name="edit" size={20} color={colors.primary} />
//               </TouchableOpacity>
//
//               <TouchableOpacity style={styles.iconButton} onPress={() => handleDelete(item.id)}>
//                 <Feather name="trash" size={20} color="red" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//         ListEmptyComponent={
//           <Text style={{ textAlign: 'center', marginTop: 20, color: colors.textSecondary }}>
//             No franchises available
//           </Text>
//         }
//       />
//     </View>
//   );
// };
//
// export default FranchiseManagement;
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   card: {
//     padding: 16,
//     marginBottom: 10,
//     borderRadius: 8,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   actions: {
//     flexDirection: 'row',
//     marginTop: 8,
//   },
//   iconButton: {
//     marginHorizontal: 10,
//   },
//   addButton: {
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//     alignItems: 'center',
//   },
//   addButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });
