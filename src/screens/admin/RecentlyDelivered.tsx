// import React from "react";
// import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
// import { useNavigation } from "@react-navigation/native";
//
// const dummyDeliveredOrders = [
//   { id: "1", productName: "Water Purifier A", deliveryDate: "2024-04-20" },
//   { id: "2", productName: "Water Purifier B", deliveryDate: "2024-04-22" },
//   { id: "3", productName: "Water Softener C", deliveryDate: "2024-04-25" },
// ];
//
// const RecentlyDelivered = () => {
//   const navigation = useNavigation();
//
//   const renderItem = ({ item }: { item: typeof dummyDeliveredOrders[0] }) => (
//     <View style={styles.card}>
//       <Text style={styles.productName}>{item.productName}</Text>
//       <Text style={styles.dateText}>Delivered on: {item.deliveryDate}</Text>
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
//         <Text style={styles.headerTitle}>Recently Delivered</Text>
//       </View>
//
//       {/* Delivered Orders List */}
//       <FlatList
//         data={dummyDeliveredOrders}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={styles.listContainer}
//       />
//     </View>
//   );
// };
//
// export default RecentlyDelivered;
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F8FAFC",
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
// });
