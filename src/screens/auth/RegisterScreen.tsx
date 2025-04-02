import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Picker } from '@react-native-picker/picker';
import { validateEmail, validatePassword, validateName, validatePhone } from '../../utils/validation';
import { RegisterParams } from '../../types';
import validationService from '@/services/validationService';

const RegisterScreen = () => {
  const { colors } = useTheme();
  const { register } = useAuth();
  const navigation = useNavigation();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<string>('customer');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: ''
  });

  const handleRegister = async () => {
    // Reset errors
    setErrors({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      address: ''
    });
    
    // Validate fields
    let isValid = true;
    if (!validateName(name)) {
      setErrors(prev => ({ ...prev, name: 'Please enter a valid name' }));
      isValid = false;
    }
    
    if (!validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email' }));
      isValid = false;
    }
    
    if (!validatePhone(phone)) {
      setErrors(prev => ({ ...prev, phone: 'Please enter a valid phone number' }));
      isValid = false;
    }
    
    if (!validatePassword(password)) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      isValid = false;
    }
    
    if (password !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      isValid = false;
    }
    
    if (address.trim() === '') {
      setErrors(prev => ({ ...prev, address: 'Address is required' }));
      isValid = false;
    }
    
    if (!isValid) return;
    
    // Proceed with registration
    setIsLoading(true);
    
    try {
      const registerData: RegisterParams = {
        name,
        email,
        phone,
        password,
        role,
        address
      };
      
      await register(registerData);
      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.message || 'An error occurred during registration. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
        
        <View style={styles.formContainer}>
          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            error={errors.name}
          />
          
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          
          <Input
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            error={errors.phone}
          />
          
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            secureTextEntry
            error={errors.password}
          />
          
          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            secureTextEntry
            error={errors.confirmPassword}
          />
          
          <View style={styles.pickerContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Role</Text>
            <View style={[styles.picker, { borderColor: colors.border }]}>
              <Picker
                selectedValue={role}
                onValueChange={(itemValue) => setRole(itemValue)}
                style={{ color: colors.text }}
              >
                <Picker.Item label="Customer" value="customer" />
                <Picker.Item label="Franchise Owner" value="franchise_owner" />
                <Picker.Item label="Service Agent" value="service_agent" />
              </Picker>
            </View>
          </View>
          
          <Input
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your address"
            multiline
            numberOfLines={3}
            error={errors.address}
          />
          
          <Button
            title="Register"
            onPress={handleRegister}
            loading={isLoading}
            style={styles.registerButton}
          />
          
          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: colors.text }]}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  picker: {
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  registerButton: {
    marginTop: 20,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  loginText: {
    marginRight: 5,
  },
  loginLink: {
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
