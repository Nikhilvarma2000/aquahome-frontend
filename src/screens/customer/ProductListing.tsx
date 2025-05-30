import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { useNavigation } from "@react-navigation/native";
import ProductCard from "../../components/ProductCard";
import Loading from "../../components/ui/Loading";
import { productService } from "../../services/productService";
import { customerService } from "../../services/customerService";
import { Product, User } from "../../types";
import { Feather } from "@expo/vector-icons";

const ProductListing = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [zipInput, setZipInput] = useState("");
  const [showZipModal, setShowZipModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const fetchUserAndProducts = async () => {
    try {
      setLoading(true);
      const userData = await customerService.getUser();
      setUser(userData);

      if (!userData.zip_code) {
        setShowZipModal(true);
        return;
      }

      const data = await productService.getCustomerProducts();
      const normalized = data.map((p) => ({
        ...p,
        id: p.ID ?? p.id,
        inStock: p.is_active ?? false,
      }));

      setProducts(normalized);
    } catch (error) {
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserAndProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserAndProducts();
  };

  const handlePlaceOrder = (product: Product) => {
    if (!product.inStock) {
      Alert.alert("Not Available", "This product is currently inactive.");
      return;
    }
    navigation.navigate("OrderPlacement", { productId: product.id });
  };

  const handleZipSubmit = async () => {
    if (!zipInput) {
      Alert.alert("ZIP Required", "Please enter your ZIP code.");
      return;
    }

    try {
      await customerService.updateProfile({ zip_code: zipInput });
      setShowZipModal(false);
      fetchUserAndProducts(); // re-fetch with new ZIP
    } catch (err) {
      Alert.alert("Error", "Failed to save ZIP.");
    }
  };

  const filteredProducts = () => {
    switch (selectedFilter) {
      case "lowPrice":
        return [...products].sort((a, b) => a.monthly_rent - b.monthly_rent);
      case "highPrice":
        return [...products].sort((a, b) => b.monthly_rent - a.monthly_rent);
      default:
        return products;
    }
  };

  const renderFilterOption = (value: string, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterOption,
        selectedFilter === value && { backgroundColor: colors.primary },
      ]}
      onPress={() => setSelectedFilter(value)}
    >
      <Text
        style={[
          styles.filterText,
          { color: selectedFilter === value ? "#fff" : colors.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return <Loading />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Modal visible={showZipModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Your ZIP Code</Text>
            <TextInput
              value={zipInput}
              onChangeText={setZipInput}
              placeholder="e.g. 508204"
              keyboardType="number-pad"
              style={styles.zipInput}
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleZipSubmit}>
              <Text style={{ color: "#fff" }}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.headerContainer}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Water Purifiers</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Choose the best purifier for your home
          </Text>
        </View>
      </View>

      <View style={[styles.filtersContainer, { borderBottomColor: colors.border }]}>
        <View style={styles.filterOptions}>
          {renderFilterOption("all", "All")}
          {renderFilterOption("lowPrice", "Low Price")}
          {renderFilterOption("highPrice", "High Price")}
        </View>
      </View>

      <FlatList
        data={filteredProducts()}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => handlePlaceOrder(item)}
            showPrice
            showOutOfStock={!item.inStock}
            hideOrderButton={!item.inStock}
          />
        )}
        keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
        contentContainerStyle={styles.productList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="info" size={50} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No products available
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    padding: 20,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 5 },
  headerSubtitle: { fontSize: 14 },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  filterOptions: {
    flexDirection: "row",
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
    fontWeight: "500",
  },
  productList: {
    padding: 15,
    paddingBottom: 30,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  zipInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
});

export default ProductListing;
