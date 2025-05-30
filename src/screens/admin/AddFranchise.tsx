// import React, { useState } from 'react';
// import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
// import { useTheme } from '@/hooks/useTheme';
// import { adminService } from '@/services/adminService';
// import { useNavigation } from '@react-navigation/native';
//
// const AddFranchise = () => {
//   const { colors } = useTheme();
//   const navigation = useNavigation<any>();
//
//   const [form, setForm] = useState({
//     name: '',
//     phone: '',
//     email: '',
//     address: '',
//     city: '',
//     state: '',
//     zip_code: '',
//     status: 'active',
//     approval_state: 'approved',
//   });
//
//   const handleChange = (key: string, value: string) => {
//     setForm((prev) => ({ ...prev, [key]: value }));
//   };
//
//   const handleSubmit = async () => {
//     const { name, phone, email } = form;
//
//     if (!name || !phone || !email) {
//       Alert.alert('Validation Error', 'Name, Phone, and Email are required');
//       return;
//     }
//
//     try {
//       await adminService.addFranchise(form);
//       Alert.alert('Success', 'Franchise added successfully');
//
//       // ✅ Navigate back and refresh the list
//       navigation.navigate('FranchiseManagement', { refresh: true });
//     } catch (error) {
//       console.error('Add Franchise Error:', error);
//       Alert.alert('Error', 'Failed to add franchise');
//     }
//   };
//
//   return (
//     <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
//       <Text style={[styles.heading, { color: colors.text }]}>Add New Franchise</Text>
//
//       {[
//         { label: 'Franchise Name', key: 'name', keyboardType: 'default' },
//         { label: 'Phone', key: 'phone', keyboardType: 'phone-pad' },
//         { label: 'Email', key: 'email', keyboardType: 'email-address' },
//         { label: 'Address', key: 'address', keyboardType: 'default' },
//         { label: 'City', key: 'city', keyboardType: 'default' },
//         { label: 'State', key: 'state', keyboardType: 'default' },
//         { label: 'Zip Code', key: 'zip_code', keyboardType: 'number-pad' },
//       ].map(({ label, key, keyboardType }) => (
//         <View key={key} style={styles.field}>
//           <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
//           <TextInput
//             style={[styles.input, { borderColor: colors.border, color: colors.text }]}
//             placeholder={label}
//             placeholderTextColor={colors.textSecondary}
//             keyboardType={keyboardType as any}
//             onChangeText={(value) => handleChange(key, value)}
//             value={form[key as keyof typeof form]}
//           />
//         </View>
//       ))}
//
//       <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
//         <Text style={styles.submitText}>Submit</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };
//
// export default AddFranchise;
//
// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     flexGrow: 1,
//   },
//   heading: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   field: {
//     marginBottom: 12,
//   },
//   label: {
//     marginBottom: 4,
//     fontWeight: '600',
//   },
//   input: {
//     borderWidth: 1,
//     borderRadius: 8,
//     padding: 10,
//   },
//   submitButton: {
//     padding: 14,
//     alignItems: 'center',
//     borderRadius: 8,
//     marginTop: 20,
//   },
//   submitText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
// });
