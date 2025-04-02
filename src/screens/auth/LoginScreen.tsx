import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { validateEmail, validatePassword } from '../../utils/validation';
import { LoginParams } from '../../types';

const LoginScreen = () => {
  const { colors } = useTheme();
  const { login } = useAuth();
  const navigation = useNavigation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const handleLogin = async () => {
    // Reset errors
    setErrors({ email: '', password: '' });
    
    // Validate fields
    let isValid = true;
    
    if (!validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email' }));
      isValid = false;
    }
    
    if (!validatePassword(password)) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      isValid = false;
    }
    
    if (!isValid) return;
    
    // Proceed with login
    setIsLoading(true);
    
    try {
      await login({ email, password });
      // No need to navigate, the AuthContext will handle it
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'An error occurred during login. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register' as never);
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
        <View style={styles.logoContainer}>
          <Text style={[styles.logoText, { color: colors.primary }]}>AquaHome</Text>
          <Text style={[styles.tagline, { color: colors.text }]}>Pure Water, Smart Living</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Login</Text>
          
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
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            error={errors.password}
          />
          
          <Button
            title="Login"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginButton}
          />
          
          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, { color: colors.text }]}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={[styles.registerLink, { color: colors.primary }]}>
                Register
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
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 16,
    marginTop: 5,
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loginButton: {
    marginTop: 20,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    marginRight: 5,
  },
  registerLink: {
    fontWeight: 'bold',
  },
});

export default LoginScreen;
