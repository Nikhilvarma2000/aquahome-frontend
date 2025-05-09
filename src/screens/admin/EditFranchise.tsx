// import React, { useEffect, useState } from 'react';
// import { View, Text, TextInput, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
// import { useTheme } from '@/hooks/useTheme';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { adminService } from '@/services/adminService';
// import Button from '@/components/ui/Button';
//
// const EditFranchise = () => {
//   const { colors } = useTheme();
//   const navigation = useNavigation<any>();
//   const route = useRoute<any>();
//   const { id } = route.params;
//
//   const [franchise, setFranchise] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//
//   useEffect(() => {
//     fetchFranchiseDetails();
//   }, []);
//
//   const fetchFranchiseDetails = async () => {
//     try {
//       const data = await adminService.getFranchiseById(id);
//       setFranchise(data);
//     } catch (error) {
//       console.error('Error fetching franchise', error);
//       Alert.alert('Error', 'Failed to load franchise details');
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   const handleUpdateFranchise = async () => {
//     try {
//       await adminService.updateFranchise(id, franchise);
//       Alert.alert('Success', 'Franchise updated successfully');
//       navigation.goBack();
//     } catch (error) {
//       console.error('Update franchise error:', error);
//       Alert.alert('Error', 'Failed to update franchise');
//     }
//   };
//
//   const handleChange = (field: string, value: any) => {
//     setFranchise({ ...franchise, [field]: value });
//   };
//
//   if (loading || !franchise) {
//     return <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading...</Text>;
//   }
//
//   return (
//     <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
//       <Text style={[styles.label, { color: colors.text }]}>Name</Text>
//       <TextInput
//         style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
//         value={franchise.name}
//         onChangeText={(text) => handleChange('name', text)}
//         placeholder="Enter Franchise Name"
//       />
//
//       <Text style={[styles.label, { color: colors.text }]}>Email</Text>
//       <TextInput
//         style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
//         value={franchise.email}
//         onChangeText={(text) => handleChange('email', text)}
//         placeholder="Enter Email"
//       />
//
//       <Text style={[styles.label, { color: colors.text }]}>Phone</Text>
//       <TextInput
//         style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
//         value={franchise.phone}
//         onChangeText={(text) => handleChange('phone', text)}
//         placeholder="Enter Phone"
//       />
//
//       <Text style={[styles.label, { color: colors.text }]}>Address</Text>
//       <TextInput
//         style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
//         value={franchise.address}
//         onChangeText={(text) => handleChange('address', text)}
//         placeholder="Enter Address"
//       />
//
//       <Text style={[styles.label, { color: colors.text }]}>City</Text>
//       <TextInput
//         style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
//         value={franchise.city}
//         onChangeText={(text) => handleChange('city', text)}
//         placeholder="Enter City"
//       />
//
//       <Text style={[styles.label, { color: colors.text }]}>State</Text>
//       <TextInput
//         style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
//         value={franchise.state}
//         onChangeText={(text) => handleChange('state', text)}
//         placeholder="Enter State"
//       />
//
//       <Text style={[styles.label, { color: colors.text }]}>Zip Code</Text>
//       <TextInput
//         style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
//         value={franchise.zip_code}
//         onChangeText={(text) => handleChange('zip_code', text)}
//         placeholder="Enter Zip Code"
//       />
//
//       <Text style={[styles.label, { color: colors.text }]}>Coverage Radius (KM)</Text>
//       <TextInput
//         style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
//         value={String(franchise.coverage_radius || '')}
//         keyboardType="numeric"
//         onChangeText={(text) => handleChange('coverage_radius', parseFloat(text))}
//         placeholder="Enter Coverage Radius"
//       />
//
//       <Text style={[styles.label, { color: colors.text }]}>Service Area</Text>
//       <TextInput
//         style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
//         value={franchise.service_area}
//         onChangeText={(text) => handleChange('service_area', text)}
//         placeholder="Enter Service Area"
//       />
//
//       <View style={styles.switchRow}>
//         <Text style={[styles.label, { color: colors.text }]}>Active</Text>
//         <Switch
//           value={franchise.is_active}
//           onValueChange={(val) => handleChange('is_active', val)}
//         />
//       </View>
//
//       <Button title="Update Franchise" onPress={handleUpdateFranchise} style={styles.button} />
//     </ScrollView>
//   );
// };
//
// export default EditFranchise;
//
// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16 },
//   label: { fontSize: 16, marginTop: 16 },
//   input: { padding: 12, borderRadius: 8, marginTop: 8, fontSize: 16 },
//   button: { marginTop: 30 },
//   switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }
// });
