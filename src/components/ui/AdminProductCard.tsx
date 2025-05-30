import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from "@/hooks/useTheme";
import { Product } from '../types';
import Card from "@/components/ui/Card";

interface AdminProductCardProps {
  product: Product;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
}

const AdminProductCard: React.FC<AdminProductCardProps> = ({ product, onEdit, onDelete, onToggleStatus }) => {
  const { colors } = useTheme();
  const isActive = product.is_active ?? product.isActive;

  return (
    <Card style={[styles.card, { backgroundColor: colors.card }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Feather name="package" size={20} color="#fff" />
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={[styles.serviceType, { color: colors.text }]}>{product.name}</Text>
          <Text style={[styles.requestId, { color: colors.textSecondary }]}>₹{product.monthly_rent ?? product.monthlyRent} / month</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.details}>
        <Text numberOfLines={2} style={[styles.description, { color: colors.text }]}>{product.description}</Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>Security: ₹{product.security_deposit ?? product.securityDeposit} | Install: ₹{product.installation_fee ?? product.installationFee}</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.adminButton} onPress={onEdit}>
          <Feather name="edit-2" size={16} color={colors.primary} />
          <Text style={[styles.adminText, { color: colors.primary }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => {
            Alert.alert('Confirm Delete', 'Are you sure you want to delete this product?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', onPress: onDelete, style: 'destructive' },
            ]);
          }}
        >
          <Feather name="trash" size={16} color={colors.error} />
          <Text style={[styles.adminText, { color: colors.error }]}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.adminButton} onPress={onToggleStatus}>
          <Feather
            name={isActive ? 'toggle-left' : 'toggle-right'}
            size={20}
            color={colors.info}
          />
          <Text style={[styles.adminText, { color: colors.info }]}> {isActive ? 'Deactivate' : 'Activate'} </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#60a5fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  serviceType: {
    fontSize: 16,
    fontWeight: '600',
  },
  requestId: {
    fontSize: 13,
    marginTop: 2,
  },
  details: {
    padding: 15,
    gap: 5,
  },
  description: {
    fontSize: 14,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  adminText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default AdminProductCard;
