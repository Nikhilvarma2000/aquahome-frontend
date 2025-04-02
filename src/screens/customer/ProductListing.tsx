import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity
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
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
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

  const handlePlaceOrder = (productId: number) => {
    navigation.navigate('OrderPlacement', { productId });
  };

  // Filter products by price range
  const filteredProducts = () => {
    switch (selectedFilter) {
      case 'lowPrice':
        return [...products].sort((a, b) => a.rentalPrice - b.rentalPrice);
      case 'highPrice':
        return [...products].sort((a, b) => b.rentalPrice - a.rentalPrice);
      case 'popular':
        // In a real app, you might filter by popularity metrics
        return products;
      default:
        return products;
    }
  };

  const renderFilterOption = (value: string, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterOption,
        selectedFilter === value && { backgroundColor: colors.primary }
      ]}
      onPress={() => setSelectedFilter(value)}
    >
      <Text
        style={[
          styles.filterText,
          { color: selectedFilter === value ? colors.primary : colors.text }
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
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Water Purifiers</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Choose the best purifier for your home
        </Text>
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
            onPress={() => handlePlaceOrder(item.id as any)}
          />
        )}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.productList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
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
});

export default ProductListing;
