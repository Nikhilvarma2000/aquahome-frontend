import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import { customerService } from '../../services/customerService';
import { validationService } from '../../services/validationService';
import { Subscription, ServiceRequest as ServiceRequestType } from '../../types';
import { Platform } from 'react-native';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
// import DateTimePicker from '@react-native-community/datetimepicker';

const ServiceRequest = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);

  // Form state
  const [selectedSubscription, setSelectedSubscription] = useState<string>('');
  const [serviceType, setServiceType] = useState<'maintenance' | 'repair' | 'installation' | 'removal'>('maintenance');
  const [description, setDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Errors
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Pre-fill data if passed from another screen
  useEffect(() => {
    if (route.params?.subscriptionId) {
      setSelectedSubscription(route.params.subscriptionId);
    }
    if (route.params?.serviceType) {
      setServiceType(route.params.serviceType);
    }
  }, [route.params]);

  // Fetch subscriptions
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const data = await customerService.getSubscriptions();
        // Filter to only show active subscriptions
        const activeSubscriptions = data.filter(sub => sub.status === 'active');
        setSubscriptions(activeSubscriptions);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        Alert.alert('Error', 'Failed to load your subscriptions. Please try again.');
      } finally {
        setIsLoadingSubscriptions(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!selectedSubscription) {
      newErrors.selectedSubscription = 'Please select a subscription';
    }

    if (!serviceType) {
      newErrors.serviceType = 'Please select a service type';
    }

    if (validationService.isEmpty(description)) {
      newErrors.description = 'Please provide a description of the service needed';
    }

    // Validate that preferred date is in the future
    const currentDate = new Date();
    if (preferredDate < currentDate) {
      newErrors.preferredDate = 'Please select a future date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Format date as ISO string for API
      const formattedDate = preferredDate.toISOString();

      const serviceRequestData: Partial<ServiceRequestType> = {
        subscriptionId: selectedSubscription,
        type: serviceType,
        description,
        scheduledDate: formattedDate,
      };

      await customerService.createServiceRequest(serviceRequestData);
      Alert.alert(
        'Service Request Submitted', 
        'Your service request has been successfully submitted. You will be notified once it has been scheduled.',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.goBack() 
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting service request:', error);
      Alert.alert('Error', 'Failed to submit service request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || preferredDate;
    setShowDatePicker(Platform.OS === 'ios');
    setPreferredDate(currentDate);
    
    // Clear date error if present
    if (errors.preferredDate) {
      setErrors({...errors, preferredDate: ''});
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getServiceTypeDetails = (type: string) => {
    switch (type) {
      case 'maintenance':
        return {
          title: 'Regular Maintenance',
          description: 'Scheduled maintenance service for your water purifier.',
          icon: 'tool'
        };
      case 'repair':
        return {
          title: 'Repair Service',
          description: 'Request a repair for issues with your water purifier.',
          icon: 'settings'
        };
      case 'installation':
        return {
          title: 'Installation',
          description: 'Professional installation of your new water purifier.',
          icon: 'package'
        };
      case 'removal':
        return {
          title: 'Removal',
          description: 'Request for removal of your water purifier.',
          icon: 'trash-2'
        };
      default:
        return {
          title: 'Service',
          description: 'Request a service for your water purifier.',
          icon: 'help-circle'
        };
    }
  };

  // Return a subscription card with product info
  const renderSubscriptionOption = (subscription: Subscription) => {
    return (
      <TouchableOpacity
        key={subscription.id}
        style={[
          styles.subscriptionOption, 
          { 
            borderColor: selectedSubscription === subscription.id ? colors.primary : colors.border,
            backgroundColor: selectedSubscription === subscription.id ? `${colors.primary}10` : colors.card
          }
        ]}
        onPress={() => {
          setSelectedSubscription(subscription.id);
          // Clear error if present
          if (errors.selectedSubscription) {
            setErrors({...errors, selectedSubscription: ''});
          }
        }}
      >
        <View style={styles.radioButton}>
          <View style={[
            styles.radioInner, 
            { opacity: selectedSubscription === subscription.id ? 1 : 0, backgroundColor: colors.primary }
          ]} />
        </View>
        
        <View style={styles.subscriptionDetails}>
          <Text style={[styles.subscriptionTitle, { color: colors.text }]}>
            {subscription.product?.name || 'Water Purifier'}
          </Text>
          <Text style={[styles.subscriptionSubtitle, { color: colors.textSecondary }]}>
            Active since {new Date(subscription.startDate).toLocaleDateString()}
          </Text>
          {subscription.product && (
            <Text style={[styles.subscriptionModel, { color: colors.textSecondary }]}>
              Model: {subscription.product.name}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Request Service</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Fill in the details below to request a service for your water purifier
        </Text>
      </View>

      {/* Select Subscription */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Subscription</Text>
        
        {isLoadingSubscriptions ? (
          <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
        ) : subscriptions.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="alert-circle" size={24} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              You don't have any active subscriptions. Subscribe to a water purifier to request service.
            </Text>
            <Button
              title="View Products"
              onPress={() => navigation.navigate('ProductListing')}
              variant="outline"
              size="small"
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <>
            {subscriptions.map(subscription => renderSubscriptionOption(subscription))}
            {errors.selectedSubscription && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.selectedSubscription}
              </Text>
            )}
          </>
        )}
      </Card>

      {/* Service Type */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Service Type</Text>
        <View style={styles.serviceTypeContainer}>
          {(['maintenance', 'repair', 'installation', 'removal'] as const).map((type) => {
            const typeDetails = getServiceTypeDetails(type);
            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.serviceTypeOption,
                  { 
                    borderColor: serviceType === type ? colors.primary : colors.border,
                    backgroundColor: serviceType === type ? `${colors.primary}10` : colors.card
                  }
                ]}
                onPress={() => {
                  setServiceType(type);
                  // Clear error if present
                  if (errors.serviceType) {
                    setErrors({...errors, serviceType: ''});
                  }
                }}
              >
                <Feather 
                  name={typeDetails.icon as any}
                  size={24}
                  color={serviceType === type ? colors.primary : colors.textSecondary}
                  style={styles.serviceTypeIcon}
                />
                <Text 
                  style={[
                    styles.serviceTypeText, 
                    { 
                      color: serviceType === type ? colors.primary : colors.text,
                      fontWeight: serviceType === type ? '600' : 'normal'
                    }
                  ]}
                >
                  {typeDetails.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.serviceType && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {errors.serviceType}
          </Text>
        )}
      </Card>

      {/* Preferred Date */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferred Date</Text>
        <TouchableOpacity
          style={[
            styles.dateSelector,
            { 
              borderColor: errors.preferredDate ? colors.error : colors.border,
              backgroundColor: colors.card
            }
          ]}
          onPress={() => setShowDatePicker(true)}
        >
          <Feather name="calendar" size={20} color={colors.primary} style={styles.dateIcon} />
          <Text style={[styles.dateText, { color: colors.text }]}>
            {formatDate(preferredDate)}
          </Text>
        </TouchableOpacity>
        {errors.preferredDate && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {errors.preferredDate}
          </Text>
        )}
        <Text style={[styles.dateHelp, { color: colors.textSecondary }]}>
          Our service team will try to accommodate your preferred date but may need to reschedule based on availability.
        </Text>

        {/* {showDatePicker && (
          <DateTimePicker
            value={preferredDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )} */}
      </Card>

      {/* Description */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
        <TextInput
          style={[
            styles.descriptionInput,
            { 
              color: colors.text,
              borderColor: errors.description ? colors.error : colors.border,
              backgroundColor: colors.card
            }
          ]}
          placeholder="Please describe the issue or service needed"
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={(text) => {
            setDescription(text);
            // Clear error if present
            if (errors.description) {
              setErrors({...errors, description: ''});
            }
          }}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        {errors.description && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {errors.description}
          </Text>
        )}
      </Card>

      {/* Submit Button */}
      <Button
        title="Submit Service Request"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading || isLoadingSubscriptions || subscriptions.length === 0}
        style={styles.submitButton}
        fullWidth
      />

      <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
        By submitting this request, you agree to be contacted by our service team to schedule the service.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  loader: {
    marginVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 8,
  },
  emptyButton: {
    marginTop: 8,
  },
  subscriptionOption: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#0288D1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  subscriptionDetails: {
    flex: 1,
  },
  subscriptionTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 2,
  },
  subscriptionSubtitle: {
    fontSize: 12,
    marginBottom: 2,
  },
  subscriptionModel: {
    fontSize: 12,
  },
  serviceTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  serviceTypeOption: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%', // Adjust based on your layout
  },
  serviceTypeIcon: {
    marginBottom: 8,
  },
  serviceTypeText: {
    textAlign: 'center',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    flex: 1,
  },
  dateHelp: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    marginVertical: 16,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ServiceRequest;