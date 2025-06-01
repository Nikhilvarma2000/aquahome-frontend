import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import 'react-native-get-random-values';
import * as Location from 'expo-location';
import axios from 'axios';

import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { useAuth } from './src/hooks/useAuth';
import { ThemeProvider } from './src/context/ThemeContext';
import { LocationProvider } from './src/context/LocationContext';



if (Platform.OS === 'web') {
  if (!window.localStorage) {
    window.localStorage = {
      getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
      setItem: (key, value) => Promise.resolve(window.localStorage.setItem(key, value)),
      removeItem: (key) => Promise.resolve(window.localStorage.removeItem(key)),
    };
  }
}

function MainApp() {
  const { token } = useAuth();

  useEffect(() => {
    const updateLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('❌ Location permission denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        console.log('📍 Location:', latitude, longitude);

        if (token) {
          await axios.post(
            'http://192.168.207.125:5001/api/profile/location',
            { latitude, longitude },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log('✅ Location updated on server');
        }
      } catch (err) {
        console.error('❌ Error updating location:', err);
      }
    };

    updateLocation();
  }, [token]);

  return (
    <>
      <RootNavigator />
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <LocationProvider>
              {/* 🔥 Use MainApp instead of RootNavigator */}
              <MainApp />
              <StatusBar style="auto" />
            </LocationProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

