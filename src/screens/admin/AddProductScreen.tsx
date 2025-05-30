// // src/screens/admin/AddProductScreen.tsx
//
// import React, { useState } from 'react';
// import { View, Text, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
// import Button from '../../components/ui/Button';
// import { useTheme } from '../../hooks/useTheme';
// import { adminService } from '../../services/adminService';
//
// const AddProductScreen = () => {
//   const { colors } = useTheme();
//
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     image_url: '',
//     monthly_rent: '',
//     security_deposit: '',
//     installation_fee: '',
//     available_stock: '',
//     specifications: '',
//     maintenance_cycle: '',
//   });
//
//   const [loading, setLoading] = useState(false);
//
//   const handleChange = (field: string, value: string) => {
//     setFormData({ ...formData, [field]: value });
//   };
//
//   const handleSubmit = async () => {
//     // Basic validation
//     if (!formData.name || !formData.description || !formData.monthly_rent || !formData.security_deposit || !formData.installation_fee || !formData.available_stock) {
//       Alert.alert('Validation Error', 'Please fill all required fields');
//       return;
//     }
//
//     setLoading(true);
//
//     try {
//       const payload = {
//         ...formData,
//         monthly_rent: parseFloat(formData.monthly_rent),
//         security_deposit: parseFloat(formData.security_deposit),
//         installation_fee: parseFloat(formData.installation_fee),
//         available_stock: parseInt(formData.available_stock),
//         maintenance_cycle: formData.maintenance_cycle ? parseInt(formData.maintenance_cycle) : 90, // Default
//         is_active: true,
//       };
//
//       await adminService.addProduct(payload);
//       Alert.alert('Success', 'Product added successfully!');
//
//       // Reset form
//       setFormData({
//         name: '',
//         description: '',
//         image_url: '',
//         monthly_rent: '',
//         security_deposit: '',
//         installation_fee: '',
//         available_stock: '',
//         specifications: '',
//         maintenance_cycle: '',
//       });
//
//     } catch (error) {
//       console.error(error);
//       Alert.alert('Error', 'Failed to add product');
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   return (
//     <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
//       <View style={styles.formGroup}>
//         <Text style={[styles.label, { color: colors.text }]}>Product Name*</Text>
//         <TextInput
//           style={[styles.input, { borderColor: colors.border, color: colors.text }]}
//           value={formData.name}
//           onChangeText={(text) => handleChange('name', text)}
//           placeholder="Enter product name"
//           placeholderTextColor={colors.textSecondary}
//         />
//       </View>
//
//       <View style={styles.formGroup}>
//         <Text style={[styles.label, { color: colors.text }]}>Description*</Text>
//         <TextInput
//           style={[styles.input, { borderColor: colors.border, color: colors.text }]}
//           value={formData.description}
//           onChangeText={(text) => handleChange('description', text)}
//           placeholder="Enter description"
//           placeholderTextColor={colors.textSecondary}
//           multiline
//         />
//       </View>
//
//       <View style={styles.formGroup}>
//         <Text style={[styles.label, { color: colors.text }]}>Monthly Rent (₹)*</Text>
//         <TextInput
//           style={[styles.input, { borderColor: colors.border, color: colors.text }]}
//           value={formData.monthly_rent}
//           onChangeText={(text) => handleChange('monthly_rent', text)}
//           keyboardType="numeric"
//           placeholder="Enter monthly rent"
//           placeholderTextColor={colors.textSecondary}
//         />
//       </View>
//
//       <View style={styles.formGroup}>
//         <Text style={[styles.label, { color: colors.text }]}>Security Deposit (₹)*</Text>
//         <TextInput
//           style={[styles.input, { borderColor: colors.border, color: colors.text }]}
//           value={formData.security_deposit}
//           onChangeText={(text) => handleChange('security_deposit', text)}
//           keyboardType="numeric"
//           placeholder="Enter security deposit"
//           placeholderTextColor={colors.textSecondary}
//         />
//       </View>
//
//       <View style={styles.formGroup}>
//         <Text style={[styles.label, { color: colors.text }]}>Installation Fee (₹)*</Text>
//         <TextInput
//           style={[styles.input, { borderColor: colors.border, color: colors.text }]}
//           value={formData.installation_fee}
//           onChangeText={(text) => handleChange('installation_fee', text)}
//           keyboardType="numeric"
//           placeholder="Enter installation fee"
//           placeholderTextColor={colors.textSecondary}
//         />
//       </View>
//
//       <View style={styles.formGroup}>
//         <Text style={[styles.label, { color: colors.text }]}>Available Stock*</Text>
//         <TextInput
//           style={[styles.input, { borderColor: colors.border, color: colors.text }]}
//           value={formData.available_stock}
//           onChangeText={(text) => handleChange('available_stock', text)}
//           keyboardType="numeric"
//           placeholder="Enter stock quantity"
//           placeholderTextColor={colors.textSecondary}
//         />
//       </View>
//
//       <View style={styles.formGroup}>
//         <Text style={[styles.label, { color: colors.text }]}>Image URL (optional)</Text>
//         <TextInput
//           style={[styles.input, { borderColor: colors.border, color: colors.text }]}
//           value={formData.image_url}
//           onChangeText={(text) => handleChange('image_url', text)}
//           placeholder="Enter image URL"
//           placeholderTextColor={colors.textSecondary}
//         />
//       </View>
//
//       <View style={styles.formGroup}>
//         <Text style={[styles.label, { color: colors.text }]}>Specifications (optional)</Text>
//         <TextInput
//           style={[styles.input, { borderColor: colors.border, color: colors.text }]}
//           value={formData.specifications}
//           onChangeText={(text) => handleChange('specifications', text)}
//           placeholder="Enter specifications"
//           placeholderTextColor={colors.textSecondary}
//           multiline
//         />
//       </View>
//
//       <View style={styles.formGroup}>
//         <Text style={[styles.label, { color: colors.text }]}>Maintenance Cycle (days, optional)</Text>
//         <TextInput
//           style={[styles.input, { borderColor: colors.border, color: colors.text }]}
//           value={formData.maintenance_cycle}
//           onChangeText={(text) => handleChange('maintenance_cycle', text)}
//           keyboardType="numeric"
//           placeholder="Default 90 if empty"
//           placeholderTextColor={colors.textSecondary}
//         />
//       </View>
//
//       <Button
//         title={loading ? 'Adding...' : 'Add Product'}
//         onPress={handleSubmit}
//         loading={loading}
//         fullWidth
//       />
//     </ScrollView>
//   );
// };
//
// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//   },
//   formGroup: {
//     marginBottom: 16,
//   },
//   label: {
//     marginBottom: 4,
//     fontWeight: '600',
//   },
//   input: {
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     fontSize: 16,
//   },
// });
//
// export default AddProductScreen;
