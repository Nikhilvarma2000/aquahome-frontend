import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { ServiceRequest } from '../types';
import Card from './ui/Card';

interface ServiceRequestCardProps {
  serviceRequest: ServiceRequest;
  onPress?: () => void;
}

const ServiceRequestCard: React.FC<ServiceRequestCardProps> = ({ serviceRequest, onPress }) => {
  const { colors } = useTheme();
  
  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Get status color
  const getStatusColor = () => {
    switch (serviceRequest.status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'assigned':
        return colors.info;
      case 'scheduled':
        return colors.primary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };
  
  // Get service type icon
  const getServiceTypeIcon = () => {
    switch (serviceRequest.type) {
      case 'maintenance':
        return 'tool';
      case 'repair':
        return 'settings';
      case 'installation':
        return 'package';
      case 'removal':
        return 'trash-2';
      default:
        return 'help-circle';
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Feather name={getServiceTypeIcon()} size={20} color="#fff" />
          </View>
          
          <View style={styles.headerTextContainer}>
            <Text style={[styles.serviceType, { color: colors.text }]}>
              {serviceRequest.type.charAt(0).toUpperCase() + serviceRequest.type.slice(1)}
            </Text>
            <Text style={[styles.requestId, { color: colors.textSecondary }]}>
              Request #{serviceRequest.id.substring(0, 8)}
            </Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>
              {serviceRequest.status.charAt(0).toUpperCase() + serviceRequest.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <View style={styles.details}>
          <Text numberOfLines={2} style={[styles.description, { color: colors.text }]}>
            {serviceRequest.description}
          </Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Feather name="calendar" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {formatDate(serviceRequest.scheduledDate)}
              </Text>
            </View>
            
            {serviceRequest.status === 'assigned' && serviceRequest.agent && (
              <View style={styles.infoItem}>
                <Feather name="user" size={16} color={colors.textSecondary} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {serviceRequest.agent.name}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            Created: {new Date(serviceRequest.createdAt).toLocaleDateString()}
          </Text>
          <Feather name="chevron-right" size={20} color={colors.textSecondary} />
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
    fontSize: 12,
    marginTop: 2,
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    marginLeft: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  date: {
    fontSize: 12,
  },
});

export default ServiceRequestCard;