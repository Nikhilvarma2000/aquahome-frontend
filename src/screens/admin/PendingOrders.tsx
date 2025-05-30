// import React from "react";
// import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
// import { useNavigation } from "@react-navigation/native";
//
// const dummyPendingOrders = [
//   { id: "1", productName: "Water Purifier X", orderDate: "2024-04-26" },
//   { id: "2", productName: "Water Softener Y", orderDate: "2024-04-27" },
//   { id: "3", productName: "Filter Cartridge Z", orderDate: "2024-04-28" },
// ];
//
// const PendingOrders = () => {
//   const navigation = useNavigation();
//
//   const renderItem = ({ item }: { item: typeof dummyPendingOrders[0] }) => (
//     <View style={styles.card}>
//       <Text style={styles.productName}>{item.productName}</Text>
//       <Text style={styles.dateText}>Ordered on: {item.orderDate}</Text>
//       <Text style={styles.pendingStatus}>Status: Pending</Text>
//     </View>
//   );
//
//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Pressable onPress={() => navigation.goBack()}>
//           <Text style={styles.backButton}>← Back</Text>
//         </Pressable>
//         <Text style={styles.headerTitle}>Pending Orders</Text>
//       </View>
//
//       {/* Pending Orders List */}
//       <FlatList
//         data={dummyPendingOrders}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={styles.listContainer}
//       />
//     </View>
//   );
// };
//
// export default PendingOrders;
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F1F5F9",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingTop: 50,
//     paddingHorizontal: 20,
//     paddingBottom: 10,
//     backgroundColor: "white",
//     elevation: 4,
//   },
//   backButton: {
//     fontSize: 18,
//     color: "#1D4ED8",
//     marginRight: 10,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#0F172A",
//   },
//   listContainer: {
//     padding: 20,
//   },
//   card: {
//     backgroundColor: "white",
//     padding: 20,
//     marginBottom: 15,
//     borderRadius: 12,
//     elevation: 3,
//   },
//   productName: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#1E293B",
//   },
//   dateText: {
//     marginTop: 5,
//     fontSize: 14,
//     color: "#64748B",
//   },
//   pendingStatus: {
//     marginTop: 8,
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#F59E0B",
//   },
// });
