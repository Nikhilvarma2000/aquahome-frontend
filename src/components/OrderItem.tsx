import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Order } from '../types';
import Card from './ui/Card';

interface OrderItemProps {
  order: Order;
  onPress?: () => void;
}

const OrderItem: React.FC<OrderItemProps> = ({ order, onPress }) => {
  const { colors } = useTheme();
  
  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Get status color
  const getStatusColor = () => {
    switch (order.status) {
      case 'confirmed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'processing':
        return colors.info;
      case 'shipped':
        return colors.primary;
      case 'delivered':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={[styles.orderNumber, { color: colors.textSecondary }]}>
              Order #{order?.id ? `#${order.id.toString().substring(0, 8)}` : 'Order ID N/A'}
            </Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>
               {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
            </Text>
          </View>
        </View>
        
        <View style={styles.productDetails}>
          {order.product?.imageUrl ? (
            <Image 
              source={{ uri: order.product.imageUrl }} 
              style={styles.productImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: colors.border }]}>
              <Feather name="box" size={24} color={colors.textSecondary} />
            </View>
          )}
          
          <View style={styles.productInfo}>
            <Text style={[styles.productName, { color: colors.text }]}>
              {order.product?.name || 'Water Purifier'}
            </Text>
            <Text style={[styles.orderType, { color: colors.textSecondary }]}>
              {order.orderType === 'purchase' ? 'Purchase' : 'Rental'}
            </Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Total:</Text>
            <Text style={[styles.price, { color: colors.text }]}>
              ₹{typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : '0.00'}
            </Text>
          </View>
          
          <View style={styles.deliveryInfo}>
            <Feather name="truck" size={14} color={colors.textSecondary} />
            <Text style={[styles.deliveryText, { color: colors.textSecondary }]}>
              {order.deliveryDate ? `Delivery: ${formatDate(order.deliveryDate)}` : 'Delivery pending'}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  productDetails: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  placeholderImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  orderType: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    marginRight: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    fontSize: 12,
    marginLeft: 5,
  },
});

export default OrderItem;