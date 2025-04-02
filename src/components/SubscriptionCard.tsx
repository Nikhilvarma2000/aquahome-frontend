import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Subscription } from '../types';
import Card from './ui/Card';

interface SubscriptionCardProps {
  subscription: Subscription;
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
              {subscription.product?.name || 'Water Purifier Subscription'}
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
              Started: {formatDate(subscription.startDate)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Feather name="refresh-cw" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              Renewal: {formatDate(subscription.renewalDate)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Feather name="credit-card" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              Monthly Fee: ₹{subscription.monthlyFee.toFixed(2)}
            </Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <View style={[styles.paymentStatusBadge, { 
            backgroundColor: subscription.paymentStatus === 'paid' 
              ? colors.success + '20' 
              : subscription.paymentStatus === 'pending' 
                ? colors.warning + '20' 
                : colors.error + '20'
          }]}>
            <Text style={[styles.paymentStatusText, { 
              color: subscription.paymentStatus === 'paid' 
                ? colors.success 
                : subscription.paymentStatus === 'pending' 
                  ? colors.warning 
                  : colors.error
            }]}>
              {subscription.paymentStatus.charAt(0).toUpperCase() + subscription.paymentStatus.slice(1)}
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