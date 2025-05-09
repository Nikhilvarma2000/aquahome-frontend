// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, StyleSheet, ScrollView, Switch, Alert, FlatList, TouchableOpacity, Image } from 'react-native';
// import Button from '../../components/ui/Button';
// import { useTheme } from '../../hooks/useTheme';
// import api from '../../services/api'; // Axios instance
//
// const ProductManagement = () => {
//   const { colors } = useTheme();
//
//   const [products, setProducts] = useState([]);
//   const [isAddingProduct, setIsAddingProduct] = useState(false);
//   const [selectedProductId, setSelectedProductId] = useState(null);
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
//     is_active: true,
//   });
//   const [loading, setLoading] = useState(false);
//
//   const fetchProducts = async () => {
//     try {
//       const response = await api.get('/products?admin=true');
//       setProducts(response.data);
//     } catch (error) {
//       console.error('Fetch products error:', error.response?.data || error.message);
//     }
//   };
//
//   useEffect(() => {
//     fetchProducts();
//   }, []);
//
//   const handleChange = (field: string, value: string | boolean) => {
//     setFormData({
//       ...formData,
//       [field]: value,
//     });
//   };
//
//   const handleEdit = (product: any) => {
//     setFormData({
//       name: product.name,
//       description: product.description,
//       image_url: product.image_url,
//       monthly_rent: product.monthly_rent.toString(),
//       security_deposit: product.security_deposit.toString(),
//       installation_fee: product.installation_fee.toString(),
//       available_stock: product.available_stock.toString(),
//       specifications: product.specifications,
//       maintenance_cycle: product.maintenance_cycle?.toString() || '',
//       is_active: product.is_active,
//     });
//     setSelectedProductId(product.id);
//     setIsAddingProduct(true);
//   };
//
//   const handleDelete = (id: number) => {
//     Alert.alert(
//       'Confirm Delete',
//       'Are you sure you want to delete this product?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               const res = await api.delete(`/admin/products/${id}`);
//               if (res.status === 200 || res.status === 204) {
//                 Alert.alert('Success', 'Product deleted successfully');
//                 fetchProducts(); // Refresh list
//               } else {
//                 Alert.alert('Error', 'Failed to delete product');
//               }
//             } catch (error) {
//               console.error('Delete product error:', error.response?.data || error.message);
//               Alert.alert('Error', 'Failed to delete product');
//             }
//           }
//         }
//       ]
//     );
//   };
//
//  const handleToggleActive = async (id: number, newStatus: boolean) => {
//    try {
//      // Find the product details from existing products list
//      const product = products.find((p) => p.id === id);
//
//      if (!product) {
//        Alert.alert('Error', 'Product not found');
//        return;
//      }
//
//      // Create full updated product payload
//      const payload = {
//        ...product,
//        is_active: newStatus, // only is_active changed
//      };
//
//      const response = await api.put(`/admin/products/${id}`, payload);
//
//      if (response.status === 200) {
//        fetchProducts();
//        Alert.alert('Success', `Product ${newStatus ? 'activated' : 'deactivated'} successfully`);
//      } else {
//        Alert.alert('Error', 'Failed to update product status');
//      }
//    } catch (error) {
//      console.error('Update product status error:', error.response?.data || error.message);
//      Alert.alert('Error', 'Failed to update product status');
//    }
//  };
//
//
//   const handleSubmit = async () => {
//     if (!formData.name || !formData.description || !formData.monthly_rent || !formData.security_deposit || !formData.installation_fee || !formData.available_stock) {
//       Alert.alert('Validation', 'Please fill all required fields.');
//       return;
//     }
//
//     const payload = {
//       ...formData,
//       monthly_rent: parseFloat(formData.monthly_rent),
//       security_deposit: parseFloat(formData.security_deposit),
//       installation_fee: parseFloat(formData.installation_fee),
//       available_stock: parseInt(formData.available_stock),
//       maintenance_cycle: formData.maintenance_cycle ? parseInt(formData.maintenance_cycle) : 90,
//     };
//
//     setLoading(true);
//     try {
//       if (selectedProductId) {
//         await api.put(`/admin/products/${selectedProductId}`, payload);
//         Alert.alert('Success', 'Product updated successfully');
//       } else {
//         await api.post('/admin/products', payload);
//         Alert.alert('Success', 'Product added successfully');
//       }
//
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
//         is_active: true,
//       });
//       setSelectedProductId(null);
//       setIsAddingProduct(false);
//       fetchProducts();
//     } catch (error) {
//       console.error('Product save error:', error.response?.data || error.message);
//       Alert.alert('Error', 'Failed to save product');
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   if (isAddingProduct) {
//     return (
//       <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
//         <Text style={[styles.header, { color: colors.text }]}>
//           {selectedProductId ? 'Edit Product' : 'Add New Product'}
//         </Text>
//
//         {/* Form Inputs */}
//         {[
//           { label: 'Product Name *', key: 'name' },
//           { label: 'Description *', key: 'description' },
//           { label: 'Image URL', key: 'image_url' },
//           { label: 'Monthly Rent *', key: 'monthly_rent', numeric: true },
//           { label: 'Security Deposit *', key: 'security_deposit', numeric: true },
//           { label: 'Installation Fee *', key: 'installation_fee', numeric: true },
//           { label: 'Available Stock *', key: 'available_stock', numeric: true },
//           { label: 'Specifications', key: 'specifications' },
//           { label: 'Maintenance Cycle (days)', key: 'maintenance_cycle', numeric: true },
//         ].map(({ label, key, numeric }) => (
//           <View style={styles.formGroup} key={key}>
//             <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
//             <TextInput
//               style={[styles.input, { color: colors.text, borderColor: colors.border }]}
//               placeholder={`Enter ${label}`}
//               placeholderTextColor={colors.textSecondary}
//               value={formData[key]}
//               onChangeText={(text) => handleChange(key, text)}
//               keyboardType={numeric ? 'numeric' : 'default'}
//             />
//           </View>
//         ))}
//
//         <View style={[styles.formGroup, { flexDirection: 'row', alignItems: 'center' }]}>
//           <Text style={[styles.label, { color: colors.text, marginRight: 10 }]}>Is Active</Text>
//           <Switch
//             value={formData.is_active}
//             onValueChange={(value) => handleChange('is_active', value)}
//             thumbColor={colors.primary}
//           />
//         </View>
//
//         <Button
//           title={selectedProductId ? 'Update Product' : 'Save Product'}
//           onPress={handleSubmit}
//           loading={loading}
//           fullWidth
//           style={{ marginTop: 20 }}
//         />
//         <Button
//           title="Cancel"
//           onPress={() => {
//             setIsAddingProduct(false);
//             setSelectedProductId(null);
//           }}
//           variant="outline"
//           fullWidth
//           style={{ marginTop: 10 }}
//         />
//       </ScrollView>
//     );
//   }
//
//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <Button
//         title="➕ Add New Product"
//         onPress={() => {
//           setFormData({
//             name: '',
//             description: '',
//             image_url: '',
//             monthly_rent: '',
//             security_deposit: '',
//             installation_fee: '',
//             available_stock: '',
//             specifications: '',
//             maintenance_cycle: '',
//             is_active: true,
//           });
//           setSelectedProductId(null);
//           setIsAddingProduct(true);
//         }}
//         style={{ marginVertical: 16 }}
//         fullWidth
//       />
//
//       <FlatList
//         data={products}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => (
//           <View style={[styles.productCard, { backgroundColor: colors.card }]}>
//
//             {item.image_url ? (
//               <Image
//                 source={{ uri: item.image_url }}
//                 style={styles.productImage}
//                 resizeMode="cover"
//               />
//             ) : null}
//
//             <Text style={[styles.productName, { color: colors.text }]}>{item.name}</Text>
//             <Text style={[styles.productPrice, { color: colors.text }]}>₹ {item.monthly_rent} / month</Text>
//             <Text style={[styles.productDescription, { color: colors.textSecondary }]}>{item.description}</Text>
//
//             {/* Edit and Delete Buttons */}
//             <View style={{ flexDirection: 'row', marginTop: 10 }}>
//               <TouchableOpacity
//                 style={[styles.actionButton, { backgroundColor: '#007bff' }]}
//                 onPress={() => handleEdit(item)}
//               >
//                 <Text style={styles.buttonText}>Edit</Text>
//               </TouchableOpacity>
//
//               <TouchableOpacity
//                 style={[styles.actionButton, { backgroundColor: '#dc3545', marginLeft: 10 }]}
//                 onPress={() => handleDelete(item.id)}
//               >
//                 <Text style={styles.buttonText}>Delete</Text>
//               </TouchableOpacity>
//             </View>
//
//             {/* Active/Inactive Switch */}
//             <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
//               <Text style={{ color: colors.text, marginRight: 10 }}>
//                 {item.is_active ? "Active" : "Inactive"}
//               </Text>
//               <Switch
//                 value={item.is_active}
//                 onValueChange={(value) => handleToggleActive(item.id, value)}
//                 thumbColor={colors.primary}
//               />
//             </View>
//
//           </View>
//         )}
//       />
//     </View>
//   );
// };
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   formGroup: {
//     marginBottom: 16,
//   },
//   label: {
//     fontSize: 14,
//     marginBottom: 6,
//   },
//   input: {
//     borderWidth: 1,
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//   },
//   productCard: {
//     padding: 16,
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   productImage: {
//     width: '100%',
//     height: 180,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   productName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   productPrice: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginTop: 4,
//   },
//   productDescription: {
//     fontSize: 14,
//     marginTop: 4,
//   },
//   actionButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   buttonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
// });
//
// export default ProductManagement;
