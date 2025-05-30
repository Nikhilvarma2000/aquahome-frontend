import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Product } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const { colors } = useTheme();
  const isActive = product.is_active ?? product.isActive;

  const specifications = product.specifications?.split(',') ?? [];

  return (
    <Card style={[styles.card, { backgroundColor: colors.card }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Feather name="package" size={20} color="#fff" />
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={[styles.serviceType, { color: colors.text }]}>{product.name}</Text>
          <Text style={[styles.requestId, { color: colors.textSecondary }]}>
            ₹{product.monthly_rent ?? product.monthlyRent} / month
          </Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.details}>
        <Text numberOfLines={2} style={[styles.description, { color: colors.text }]}>
          {product.description}
        </Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Security: ₹{product.security_deposit ?? product.securityDeposit} | Install: ₹{product.installation_fee ?? product.installationFee}
        </Text>

        {/* Franchise Name */}
        {product.franchise?.name && (
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Provided by: {product.franchise.name}
          </Text>
        )}

        {/* Tags */}
        {specifications.length > 0 && (
          <View style={styles.tagContainer}>
            {specifications.map((tag, idx) => (
              <View key={idx} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag.trim()}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title={isActive ? 'Order Now' : 'Unavailable'}
          onPress={isActive ? onPress : undefined}
          disabled={!isActive}
          style={{ opacity: isActive ? 1 : 0.5, flex: 1 }}
        />
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
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  tagChip: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#111827',
  },
  footer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
});

export default ProductCard;
