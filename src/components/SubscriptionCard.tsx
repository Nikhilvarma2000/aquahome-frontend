import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Subscription } from '../types';
import Card from './ui/Card';

// {
//   "created_at": "2025-06-01T00:49:08.73918+05:30",
//   "customer_id": 4,
//   "end_date": "2025-07-01T00:49:08.738247+05:30",
//   "franchise_id": 1,
//   "franchise_name": "Kodad",
//   "id": 2,
//   "is_active": true,
//   "monthly_rent": 500,
//   "next_billing_date": "2025-07-01T00:49:08.738247+05:30",
//   "next_service": "2025-09-01T00:49:08.738247+05:30",
//   "order_id": 8,
//   "product_id": 2,
//   "product_image": "https://example.com/product.png",
//   "product_name": "P2",
//   "rental_duration": 1,
//   "start_date": "2025-06-01T00:49:08.738247+05:30",
//   "status": "active",
//   "updated_at": "2025-06-01T00:49:08.73918+05:30"
// }

interface SubscriptionCardProps {
  subscription: {
    created_at: string;
    customer_id: number;
    end_date: string;
    franchise_id: number;
    franchise_name: string;
    id: number;
    is_active: boolean;
    monthly_rent: number;           
    next_billing_date: string;
    next_service: string;
    order_id: number;
    product_id: number;
    product_image: string;
    product_name: string;
    rental_duration: number;
    start_date: string;
    status: string;
    updated_at: string;
  };
    onPress?: () => void;

}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, onPress }) => {
  const { colors } = useTheme();
  
  // Format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Determine status color
  const getStatusColor = () => {
    switch (subscription.status) {
      case 'active':
        return colors.success;
      case 'paused':
        return colors.warning;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.productName, { color: colors.text }]}>
              {subscription.product_name || 'Water Purifier Subscription'}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Feather name="calendar" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              Started: {formatDate(subscription.start_date)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Feather name="refresh-cw" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              Renewal: {formatDate(subscription?.next_billing_date)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Feather name="credit-card" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
               Monthly Fee: ₹{subscription?.monthly_rent?.toFixed(2)}
            </Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <View style={[styles.paymentStatusBadge, { 
            backgroundColor: subscription?.status === 'active' 
              ? colors.success + '20' 
              : subscription?.status === 'paused' 
                ? colors.warning + '20' 
                : colors.error + '20'
          }]}>
            <Text style={[styles.paymentStatusText, { 
              color: subscription?.status === 'active' 
                ? colors.success 
                : subscription?.status === 'paused' 
                  ? colors.warning 
                  : colors.error
            }]}>
              {subscription?.status?.charAt(0).toUpperCase() + subscription?.status?.slice(1)}
            </Text>
          </View>
          
          <Feather 
            name="chevron-right" 
            size={20} 
            color={colors.textSecondary} 
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  details: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 0,
  },
  paymentStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SubscriptionCard;