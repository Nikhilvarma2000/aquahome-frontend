import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../hooks/useAuth";
import { Order, Product } from "../types";
import Card from "./ui/Card";
import Button from "./ui/Button";

interface OrderCardProps {
  order: Order;
  onViewDetails: () => void;
  onCancel: () => void;
}

const OrderCard = ({ order, onViewDetails, onCancel }: OrderCardProps) => {
  const { colors } = useTheme();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  return (
    <Card style={[styles.card, { backgroundColor: colors.card }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Feather name="package" size={20} color="#fff" />
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={[styles.serviceType, { color: colors.text }]}>
            {order.id}
          </Text>
          <Text style={[styles.requestId, { color: colors.textSecondary }]}>
            ₹{order.totalAmount}/month
          </Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.details}>
        <Text
          numberOfLines={2}
          style={[styles.description, { color: colors.text }]}
        >
          Address: {order.deliveryAddress}
        </Text>

        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Status: {order.status}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {/* {isAdmin ? (
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
        ) : ( */}
        <Button
          title="View Details"
          onPress={onViewDetails}
          style={{
            opacity: 1,
            flex: 1,
          }}
        />
        {/* )} */}
      </View>
      <View style={styles.footer}>
        <Button
          title={
            order.status === "cancelled" ? "Order cancelled" : "Cancel Order"
          }
          onPress={onCancel}
          disabled={order.status === "cancelled"}
          style={{
            backgroundColor:
              order.status === "cancelled" ? colors.card : colors.error,
            opacity: 1,
            flex: 1,
          }}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: "hidden",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#60a5fa",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  serviceType: {
    fontSize: 16,
    fontWeight: "600",
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
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  adminButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  adminText: {
    fontSize: 13,
    fontWeight: "500",
  },
});

export default OrderCard;
