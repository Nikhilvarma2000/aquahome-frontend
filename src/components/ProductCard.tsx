import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { Product } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, onEdit, onDelete, onToggleStatus }) => {
  const { colors } = useTheme();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  return (
    <Card style={[styles.card, { backgroundColor: colors.card }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Feather name="package" size={20} color="#fff" />
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={[styles.serviceType, { color: colors.text }]}>
            {product.name}
          </Text>
          <Text style={[styles.requestId, { color: colors.textSecondary }]}>
            ₹{product.monthlyRent}/month
          </Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.details}>
        <Text numberOfLines={2} style={[styles.description, { color: colors.text }]}>
          {product.description}
        </Text>

        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Security: ₹{product.securityDeposit} | Install: ₹{product.installationFee}
        </Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          {product.isActive ? 'Status: Active' : 'Status: Inactive'}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {isAdmin ? (
          <>
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
                name={product.isActive ? 'toggle-left' : 'toggle-right'}
                size={20}
                color={colors.info}
              />
              <Text style={[styles.adminText, { color: colors.info }]}>
                {product.isActive ? 'Deactivate' : 'Activate'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <Button
            title={product.isActive ? 'Order Now' : 'Unavailable'}
            onPress={product.isActive ? onPress : undefined}
            disabled={!product.isActive}
            style={{
              opacity: product.isActive ? 1 : 0.5,
              flex: 1,
            }}
          />
        )}
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

export default ProductCard;























// import React from 'react'; //previous code
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { Feather } from '@expo/vector-icons';
// import { useTheme } from '../hooks/useTheme';
// import { Product } from '../types';
// import Card from './ui/Card';
//
// interface ProductCardProps {
//     product: Product;
//     onPress?: () => void;
// }
//
// const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
//     const { colors } = useTheme();
//
//     return (
//       <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
//         <Card style={[styles.card, { backgroundColor: colors.card }]}>
//           <View style={styles.header}>
//             <View style={styles.iconContainer}>
//               <Feather name={'something 1' as any} size={20} color="#fff" />
//             </View>
//
//             <View style={styles.headerTextContainer}>
//               <Text style={[styles.serviceType, { color: colors.text }]}>
//                 Something 2
//               </Text>
//               <Text style={[styles.requestId, { color: colors.textSecondary }]}>
//                 Something 3
//               </Text>
//             </View>
//
//             {/* <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
//               <Text style={styles.statusText}>
//                 Something 4
//               </Text>
//             </View> */}
//           </View>
//
//           <View style={styles.details}>
//             <Text numberOfLines={2} style={[styles.description, { color: colors.text }]}>
//               Something 5
//             </Text>
//
//             <View style={styles.infoRow}>
//               <View style={styles.infoItem}>
//                 <Feather name="calendar" size={16} color={colors.textSecondary} />
//                 <Text style={[styles.infoText, { color: colors.textSecondary }]}>
//                   Something 6
//                 </Text>
//               </View>
//
//               {/* {serviceRequest.status === 'assigned' && serviceRequest.agent && (
//                 <View style={styles.infoItem}>
//                   <Feather name="user" size={16} color={colors.textSecondary} />
//                   <Text style={[styles.infoText, { color: colors.textSecondary }]}>
//                     {serviceRequest.agent.name}
//                   </Text>
//                 </View>
//               )} */}
//             </View>
//           </View>
//
//           <View style={styles.footer}>
//             {/* <Text style={[styles.date, { color: colors.textSecondary }]}>
//               Created: {new Date(serviceRequest.createdAt).toLocaleDateString()}
//             </Text> */}
//             <Feather name="chevron-right" size={20} color={colors.textSecondary} />
//           </View>
//         </Card>
//       </TouchableOpacity>
//     );
//   };
//
//   const styles = StyleSheet.create({
//     card: {
//       padding: 0,
//       overflow: 'hidden',
//       marginBottom: 10,
//     },
//     header: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       padding: 15,
//       borderBottomWidth: 1,
//       borderBottomColor: 'rgba(0,0,0,0.05)',
//     },
//     iconContainer: {
//       width: 36,
//       height: 36,
//       borderRadius: 18,
//       backgroundColor: '#60a5fa',
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//     headerTextContainer: {
//       flex: 1,
//       marginLeft: 12,
//     },
//     serviceType: {
//       fontSize: 16,
//       fontWeight: '600',
//     },
//     requestId: {
//       fontSize: 12,
//       marginTop: 2,
//     },
//     statusBadge: {
//       paddingHorizontal: 8,
//       paddingVertical: 4,
//       borderRadius: 12,
//       marginLeft: 8,
//     },
//     statusText: {
//       color: 'white',
//       fontSize: 12,
//       fontWeight: '600',
//     },
//     details: {
//       padding: 15,
//       borderBottomWidth: 1,
//       borderBottomColor: 'rgba(0,0,0,0.05)',
//     },
//     description: {
//       fontSize: 14,
//       marginBottom: 12,
//     },
//     infoRow: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//     },
//     infoItem: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },
//     infoText: {
//       fontSize: 14,
//       marginLeft: 6,
//     },
//     footer: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       padding: 15,
//     },
//     date: {
//       fontSize: 12,
//     },
//   });
//
// export default ProductCard;