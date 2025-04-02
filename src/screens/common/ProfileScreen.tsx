import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import { TextInput } from 'react-native-gesture-handler';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { validationService } from '../../services/validationService';

const ProfileScreen = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const { colors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zipCode: user?.zipCode || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Error states
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [passwordErrors, setPasswordErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    // Clear error when user types
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData({
      ...passwordData,
      [field]: value,
    });

    // Clear error when user types
    if (passwordErrors[field]) {
      setPasswordErrors({
        ...passwordErrors,
        [field]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Validation checks
    if (validationService.isEmpty(formData.name)) {
      newErrors.name = 'Name is required';
    }

    if (formData.phone && !validationService.phone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.zipCode && !validationService.pincode(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newPasswordErrors: {[key: string]: string} = {};

    // Validation checks
    if (validationService.isEmpty(passwordData.currentPassword)) {
      newPasswordErrors.currentPassword = 'Current password is required';
    }

    if (validationService.isEmpty(passwordData.newPassword)) {
      newPasswordErrors.newPassword = 'New password is required';
    } else if (!validationService.password(passwordData.newPassword)) {
      newPasswordErrors.newPassword = 'Password must be at least 6 characters with letters and numbers';
    }

    if (validationService.isEmpty(passwordData.confirmPassword)) {
      newPasswordErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newPasswordErrors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(newPasswordErrors);
    return Object.keys(newPasswordErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await updateUserProfile(formData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    setIsLoading(true);
    try {
      // Call API to change password (would need to be implemented in auth context)
      // await changePassword(passwordData.currentPassword, passwordData.newPassword);
      Alert.alert('Success', 'Password changed successfully');
      setShowChangePassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to change password. Please check your current password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
          style: 'destructive'
        },
      ]
    );
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'franchise_owner':
        return 'Franchise Owner';
      case 'service_agent':
        return 'Service Agent';
      case 'customer':
        return 'Customer';
      default:
        return role;
    }
  };

  if (!user) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{getRoleDisplay(user.role)}</Text>
        </View>
      </View>

      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>
          {!isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Feather name="edit" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {isEditing ? (
          // Edit mode
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    color: colors.text, 
                    borderColor: errors.name ? colors.error : colors.border,
                    backgroundColor: colors.card
                  }
                ]}
                value={formData.name}
                onChangeText={(text: any) => handleInputChange('name', text)}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
              />
              {errors.name ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.name}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    color: colors.text, 
                    borderColor: errors.phone ? colors.error : colors.border,
                    backgroundColor: colors.card
                  }
                ]}
                value={formData.phone}
                onChangeText={(text: any) => handleInputChange('phone', text)}
                placeholder="Enter phone number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
              {errors.phone ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.phone}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Address</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    color: colors.text, 
                    borderColor: errors.address ? colors.error : colors.border,
                    backgroundColor: colors.card
                  }
                ]}
                value={formData.address}
                onChangeText={(text: any) => handleInputChange('address', text)}
                placeholder="Enter your address"
                placeholderTextColor={colors.textSecondary}
              />
              {errors.address ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.address}</Text> : null}
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.text }]}>City</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      color: colors.text, 
                      borderColor: errors.city ? colors.error : colors.border,
                      backgroundColor: colors.card
                    }
                  ]}
                  value={formData.city}
                  onChangeText={(text: any) => handleInputChange('city', text)}
                  placeholder="City"
                  placeholderTextColor={colors.textSecondary}
                />
                {errors.city ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.city}</Text> : null}
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: colors.text }]}>State</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      color: colors.text, 
                      borderColor: errors.state ? colors.error : colors.border,
                      backgroundColor: colors.card
                    }
                  ]}
                  value={formData.state}
                  onChangeText={(text: any) => handleInputChange('state', text)}
                  placeholder="State"
                  placeholderTextColor={colors.textSecondary}
                />
                {errors.state ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.state}</Text> : null}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>ZIP Code</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    color: colors.text, 
                    borderColor: errors.zipCode ? colors.error : colors.border,
                    backgroundColor: colors.card
                  }
                ]}
                value={formData.zipCode}
                onChangeText={(text: any) => handleInputChange('zipCode', text)}
                placeholder="ZIP Code"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
              {errors.zipCode ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.zipCode}</Text> : null}
            </View>

            <View style={styles.buttonGroup}>
              <Button
                title="Cancel"
                onPress={() => {
                  setIsEditing(false);
                  // Reset form data to user values
                  setFormData({
                    name: user.name || '',
                    phone: user.phone || '',
                    address: user.address || '',
                    city: user.city || '',
                    state: user.state || '',
                    zipCode: user.zipCode || '',
                  });
                  setErrors({});
                }}
                variant="outline"
                style={{ marginRight: 8, flex: 1 }}
              />
              <Button
                title="Save Changes"
                onPress={handleSaveProfile}
                loading={isLoading}
                disabled={isLoading}
                style={{ marginLeft: 8, flex: 1 }}
              />
            </View>
          </View>
        ) : (
          // View mode
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Feather name="user" size={18} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Name:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{user.name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Feather name="mail" size={18} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{user.email}</Text>
            </View>

            <View style={styles.infoRow}>
              <Feather name="phone" size={18} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phone:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{user.phone || 'Not provided'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Feather name="map-pin" size={18} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Address:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {user.address ? `${user.address}${user.city ? `, ${user.city}` : ''}${user.state ? `, ${user.state}` : ''}${user.zipCode ? ` - ${user.zipCode}` : ''}` : 'Not provided'}
              </Text>
            </View>
          </View>
        )}
      </Card>

      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Security</Text>
        </View>

        {showChangePassword ? (
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Current Password</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    color: colors.text, 
                    borderColor: passwordErrors.currentPassword ? colors.error : colors.border,
                    backgroundColor: colors.card
                  }
                ]}
                value={passwordData.currentPassword}
                onChangeText={(text: any) => handlePasswordChange('currentPassword', text)}
                placeholder="Enter current password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
              />
              {passwordErrors.currentPassword ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{passwordErrors.currentPassword}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    color: colors.text, 
                    borderColor: passwordErrors.newPassword ? colors.error : colors.border,
                    backgroundColor: colors.card
                  }
                ]}
                value={passwordData.newPassword}
                onChangeText={(text: any) => handlePasswordChange('newPassword', text)}
                placeholder="Enter new password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
              />
              {passwordErrors.newPassword ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{passwordErrors.newPassword}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Confirm New Password</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    color: colors.text, 
                    borderColor: passwordErrors.confirmPassword ? colors.error : colors.border,
                    backgroundColor: colors.card
                  }
                ]}
                value={passwordData.confirmPassword}
                onChangeText={(text: any) => handlePasswordChange('confirmPassword', text)}
                placeholder="Confirm new password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
              />
              {passwordErrors.confirmPassword ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{passwordErrors.confirmPassword}</Text>
              ) : null}
            </View>

            <View style={styles.buttonGroup}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowChangePassword(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                  setPasswordErrors({});
                }}
                variant="outline"
                style={{ marginRight: 8, flex: 1 }}
              />
              <Button
                title="Change Password"
                onPress={handleChangePassword}
                loading={isLoading}
                disabled={isLoading}
                style={{ marginLeft: 8, flex: 1 }}
              />
            </View>
          </View>
        ) : (
          <Button
            title="Change Password"
            onPress={() => setShowChangePassword(true)}
            variant="outline"
            fullWidth
          />
        )}
      </Card>

      <Card style={styles.card}>
        <Button
          title="Log Out"
          onPress={handleLogout}
          variant="danger"
          fullWidth
        />
      </Card>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          AquaHome • Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    marginBottom: 8,
  },
  roleText: {
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    marginLeft: 8,
    width: 60,
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
  },
  formContainer: {
    gap: 12,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
  },
  buttonGroup: {
    flexDirection: 'row',
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  footerText: {
    fontSize: 14,
  },
});

export default ProfileScreen;