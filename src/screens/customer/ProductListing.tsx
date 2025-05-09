import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import ProductCard from '../../components/ProductCard';
import Loading from '../../components/ui/Loading';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import { Feather } from '@expo/vector-icons';

const ProductListing = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedMonthlyRent, setEditedMonthlyRent] = useState('');
  const [editedSecurityDeposit, setEditedSecurityDeposit] = useState('');
  const [editedInstallationFee, setEditedInstallationFee] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newMonthlyRent, setNewMonthlyRent] = useState('');
  const [newSecurityDeposit, setNewSecurityDeposit] = useState('');
  const [newInstallationFee, setNewInstallationFee] = useState('');


  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      console.log("Fetched Products (raw):", data);

      // 👇 Normalize field names like `is_active` -> `isActive`
      const normalized = data.map((p) => ({
        ...p,
        isActive: p.isActive ?? p.is_active, // ✅ Fix here
      }));

      setProducts(normalized);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };



  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handlePlaceOrder = (product: Product) => {
    if (!product.isActive) {
      Alert.alert('Not Available', 'This product is currently inactive and cannot be ordered.');
      return;
    }
    navigation.navigate('OrderPlacement', { productId: product.id });
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditedName(product.name);
    setEditedDescription(product.description);
    setEditedMonthlyRent(product.monthlyRent?.toString() || '');
    setEditedSecurityDeposit(product.securityDeposit?.toString() || '');
    setEditedInstallationFee(product.installationFee?.toString() || '');
    setEditModalVisible(true);
  };


   const handleCreateProduct = async () => {
     try {
       const newProduct = {
         name: newName,
         description: newDescription,
         monthlyRent: parseFloat(newMonthlyRent),
         securityDeposit: parseFloat(newSecurityDeposit),
         installationFee: parseFloat(newInstallationFee),
         isActive: true,
       };
       await productService.addProduct(newProduct);
       setAddModalVisible(false);
       fetchProducts();
       setNewName('');
       setNewDescription('');
       setNewMonthlyRent('');
       setNewSecurityDeposit('');
       setNewInstallationFee('');
     } catch (error) {
       Alert.alert('Error', 'Failed to add product.');
     }
   };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await productService.deleteProduct(productId);
      Alert.alert('Deleted', 'Product has been deleted.');
      fetchProducts();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete product.');
    }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      const updated = { ...product, isActive: !product.isActive };
      await productService.toggleProductStatus(product.ID, !product.isActive);
      fetchProducts();
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle product status.');
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    try {
      const updated = {
        ...selectedProduct,
        name: editedName,
        description: editedDescription,
        monthlyRent: parseFloat(editedMonthlyRent),
        securityDeposit: parseFloat(editedSecurityDeposit),
        installationFee: parseFloat(editedInstallationFee),
      };
      await productService.updateProduct(selectedProduct.ID, updated);
      setEditModalVisible(false);
      fetchProducts();
    } catch (error) {
      Alert.alert('Error', 'Failed to update product.');
    }
  };

  const handleAddProduct = () => {
    setAddModalVisible(true);
  };

  const filteredProducts = () => {
    switch (selectedFilter) {
      case 'lowPrice':
        return [...products].sort((a, b) => a.monthlyRent - b.monthlyRent);
      case 'highPrice':
        return [...products].sort((a, b) => b.monthlyRent - a.monthlyRent);
      case 'popular':
        return products;
      default:
        return products;
    }
  };

  const renderFilterOption = (value: string, label: string) => (
    <TouchableOpacity
      style={[styles.filterOption, selectedFilter === value && { backgroundColor: colors.primary }]}
      onPress={() => setSelectedFilter(value)}
    >
      <Text style={[styles.filterText, { color: selectedFilter === value ? colors.primary : colors.text }]}> {label} </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return <Loading />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Water Purifiers</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Choose the best purifier for your home
          </Text>
        </View>
        {isAdmin && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
            <Feather name="plus-circle" size={24} color={colors.primary} />
            <Text style={{ color: colors.primary, marginLeft: 6, fontWeight: '600' }}>Add Product</Text>
          </TouchableOpacity>
        )}
      </View>



      <View style={[styles.filtersContainer, { borderBottomColor: colors.border }]}>
        <View style={styles.filterOptions}>
          {renderFilterOption('all', 'All')}
          {renderFilterOption('lowPrice', 'Low Price')}
          {renderFilterOption('highPrice', 'High Price')}
          {renderFilterOption('popular', 'Popular')}
        </View>
      </View>


      <FlatList
        data={filteredProducts()}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => handlePlaceOrder(item)}
            onEdit={isAdmin ? () => handleEditProduct(item) : undefined}
            onDelete={isAdmin ? () => handleDeleteProduct(item.ID) : undefined}
            onToggleStatus={isAdmin ? () => handleToggleStatus(item) : undefined}
          />
        )}
        keyExtractor={(item, index) => {
          const id = item?.ID ?? item?.id;
          if (!id) {
            console.warn('⚠️ Product missing ID or id:', item);
            return index.toString(); // fallback safe
          }
          return id.toString(); // works whether it's number or string
        }}

        contentContainerStyle={styles.productList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="info" size={50} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No products available</Text>
          </View>
        }
      />



          {/* Edit Product Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Product</Text>
            <TextInput
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Product Name"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            />
            <TextInput
              value={editedDescription}
              onChangeText={setEditedDescription}
              placeholder="Description"
              placeholderTextColor={colors.textSecondary}
              multiline
              style={[styles.input, { color: colors.text, borderColor: colors.border, height: 80 }]}
            />
            <TextInput
              value={editedMonthlyRent}
              onChangeText={setEditedMonthlyRent}
              placeholder="Monthly Rent"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            />
            <TextInput
              value={editedSecurityDeposit}
              onChangeText={setEditedSecurityDeposit}
              placeholder="Security Deposit"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            />
            <TextInput
              value={editedInstallationFee}
              onChangeText={setEditedInstallationFee}
              placeholder="Installation Fee"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            />
            <View style={styles.modalButtons}>
              <Pressable onPress={() => setEditModalVisible(false)} style={styles.modalButton}>
                <Text style={{ color: colors.error }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleUpdateProduct} style={styles.modalButton}>
                <Text style={{ color: colors.primary }}>Update</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Product</Text>

            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Product Name"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            />
            <TextInput
              value={newDescription}
              onChangeText={setNewDescription}
              placeholder="Description"
              placeholderTextColor={colors.textSecondary}
              multiline
              style={[styles.input, { color: colors.text, borderColor: colors.border, height: 80 }]}
            />
            <TextInput
              value={newMonthlyRent}
              onChangeText={setNewMonthlyRent}
              placeholder="Monthly Rent"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            />
            <TextInput
              value={newSecurityDeposit}
              onChangeText={setNewSecurityDeposit}
              placeholder="Security Deposit"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            />
            <TextInput
              value={newInstallationFee}
              onChangeText={setNewInstallationFee}
              placeholder="Installation Fee"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            />

            <View style={styles.modalButtons}>
              <Pressable onPress={() => setAddModalVisible(false)} style={styles.modalButton}>
                <Text style={{ color: colors.error }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleCreateProduct} style={styles.modalButton}>
                <Text style={{ color: colors.primary }}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  filterOptions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  productList: {
    padding: 15,
    paddingBottom: 30,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
});

export default ProductListing;
