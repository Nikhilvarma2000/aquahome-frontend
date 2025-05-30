import React, { useState, useEffect } from "react";
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
  Pressable,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { useNavigation } from "@react-navigation/native";
import AdminProductCard from "../../components/ui/AdminProductCard";
import Loading from "../../components/ui/Loading";
import { adminService } from "../../services/adminService";
import { Product } from "../../types";
import { Feather } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';
import { franchiseService } from '@/services/franchiseService';
import { Franchise } from '@/types';


const AdminProductManagement = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [installationFee, setInstallationFee] = useState("");

  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [franchiseId, setFranchiseId] = useState<number | undefined>(undefined); // for form
  const [filterFranchiseId, setFilterFranchiseId] = useState<number | null>(null); // for dropdown

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    image_url: '',
    monthly_rent: '',
    security_deposit: '',
    installation_fee: '',
    available_stock: '',
    specifications: '',
    maintenance_cycle: '',
    is_active: true,
    franchise_id: '', // 🆕 new field
  });



  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllProducts();
      const normalized = data.map((p: any) => ({
        ...p,
        id: p.ID ?? p.id,
      }));
      setProducts(normalized);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch products");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterProductsByFranchise = (id: number) => {
    if (!id) {
      fetchProducts(); // Show all
      return;
    }

    const filtered = products.filter((p) => p.franchise_id === id);
    setProducts(filtered);
  };


  useEffect(() => {
    fetchProducts();
    fetchFranchises();
  }, []);

const fetchFranchises = async () => {
  try {
    const data = await franchiseService.getAllFranchises();

    const normalized = data.map((f: any) => ({
      ...f,
      id: f.ID, // 👈 Normalize to lowercase `id`
    }));

    console.log("✅ Normalized franchises:", normalized);

    setFranchises(normalized);
  } catch (err) {
    console.error("Failed to load franchises", err);
  }
};


  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setMonthlyRent("");
    setSecurityDeposit("");
    setInstallationFee("");
    setSelectedProduct(null);
    setIsEditMode(false);
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await adminService.deleteProduct(id);
      fetchProducts();
    } catch (err) {
      Alert.alert("Error", "Failed to delete product");
    }
  };

 const handleToggleStatus = async (product: Product) => {
   try {
     const updated = await adminService.toggleProductStatus(product.id, !product.is_active);

     //  Live update the toggled product in local state
     const updatedList = products.map(p =>
       p.id === product.id ? { ...p, is_active: updated.is_active } : p
     );

     setProducts(updatedList);
   } catch (err) {
     console.error("Toggle product status error:", err);
     Alert.alert("Error", "Failed to toggle product status");
   }
 };



console.log("Selected Franchise ID:", franchiseId);

  const handleSubmit = async () => {
    if (typeof franchiseId !== 'number' || franchiseId <= 0) {
      Alert.alert("Select Franchise", "Please select a valid franchise before submitting.");
      return;
    }


    try {
      const payload = {
        name,
        description,
        image_url: "https://example.com/product.png",
        monthly_rent: parseFloat(monthlyRent),
        security_deposit: parseFloat(securityDeposit),
        installation_fee: parseFloat(installationFee),
        available_stock: 100,
        specifications: "Basic RO setup",
        maintenance_cycle: 90,
        is_active: true,
        franchise_id: franchiseId, // ✅ this must be included
      };

      if (isEditMode && selectedProduct) {
        await adminService.updateProduct(selectedProduct.id, payload);
      } else {
        await adminService.addProduct(payload);
      }

      setModalVisible(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      Alert.alert("Error", isEditMode ? "Failed to update product" : "Failed to add product");
    }
  };


  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setName(product.name);
    setDescription(product.description);
    setMonthlyRent(String(product.monthly_rent));
    setSecurityDeposit(String(product.security_deposit));
    setInstallationFee(String(product.installation_fee));
   setFranchiseId(typeof product.franchise_id === 'number' ? product.franchise_id : 0);
    setIsEditMode(true);
    setModalVisible(true);
  };

  const renderProductModal = () => (
    <Modal visible={modalVisible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}> {isEditMode ? "Edit" : "Add"} Product</Text>
          <TextInput
            placeholder="Name"
            value={name}
            onChangeText={setName}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholderTextColor={colors.textSecondary}
          />
          <TextInput
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholderTextColor={colors.textSecondary}
          />
          <TextInput
            placeholder="Monthly Rent"
            value={monthlyRent}
            onChangeText={setMonthlyRent}
            keyboardType="numeric"
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholderTextColor={colors.textSecondary}
          />
          <TextInput
            placeholder="Security Deposit"
            value={securityDeposit}
            onChangeText={setSecurityDeposit}
            keyboardType="numeric"
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholderTextColor={colors.textSecondary}
          />
          <TextInput
            placeholder="Installation Fee"
            value={installationFee}
            onChangeText={setInstallationFee}
            keyboardType="numeric"
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={{ marginBottom: 5, color: colors.text }}>Select Franchise</Text>
          console.log("Franchise list in dropdown:", franchises);
          <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 5, marginBottom: 12 }}>
           <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 5, marginBottom: 12 }}>
             <Picker
               selectedValue={franchiseId ?? 0}
               onValueChange={(itemValue, itemIndex) => {
                 const parsed = Number(itemValue);
                 console.log("🔄 Picker Changed to:", parsed);
                 if (parsed > 0) {
                   setFranchiseId(parsed);
                 } else {
                   setFranchiseId(undefined);
                 }
               }}
             >
               <Picker.Item label="-- Select Franchise --" value={0} />
               {franchises.map((f) => (
                 <Picker.Item key={f.id.toString()} label={f.name} value={f.id} />
               ))}
             </Picker>
           </View>


          </View>
          <View style={styles.modalButtons}>
            <Pressable onPress={() => { setModalVisible(false); resetForm(); }}>
              <Text style={{ color: colors.error }}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSubmit}>
              <Text style={{ color: colors.primary }}>{isEditMode ? "Update" : "Add"}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
     {/* 🔍 Filter Dropdown (outside row) */}
     <Text style={{ color: colors.text, marginBottom: 6 }}>Filter by Franchise:</Text>
     <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 5, marginBottom: 12 }}>
       <Picker
         selectedValue={filterFranchiseId ?? 0}
         onValueChange={(value) => {
           const selected = Number(value);
           setFilterFranchiseId(selected > 0 ? selected : null);
           if (selected > 0) {
             filterProductsByFranchise(selected); // ✅ this is important
           } else {
             fetchProducts(); // If 0, reset to show all
           }
         }}
       >
         <Picker.Item label="-- Select Franchise --" value={0} />
         {franchises.map((f) => (
           <Picker.Item key={f.id} label={f.name} value={f.id} />
         ))}
       </Picker>


     </View>

     {/* 🧾 Title + Button (inside row) */}
     <View style={styles.headerRow}>
       <Text style={[styles.title, { color: colors.text }]}>Manage Products</Text>
       <TouchableOpacity
         style={styles.addBtn}
         onPress={() => {
           resetForm();
           setModalVisible(true);
         }}
       >
         <Feather name="plus" size={16} color="#fff" />
         <Text style={styles.addBtnText}>Add Product</Text>
       </TouchableOpacity>
     </View>


      <FlatList
        data={products}
        keyExtractor={(item, index) => {
          if (!item?.id) {
            console.warn("⚠️ Product missing ID:", item);
            return index.toString();
          }
          return item.id.toString();
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <AdminProductCard
            product={item}
            onDelete={() => handleDeleteProduct(item.id)}
            onToggleStatus={() => handleToggleStatus(item)}
            onEdit={() => handleEdit(item)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      {renderProductModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  addBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});

export default AdminProductManagement;
