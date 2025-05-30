import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { authService } from '../services/authService';

interface LocationContextType {
  latitude: number | null;
  longitude: number | null;
  refreshLocation: () => void;
}

const LocationContext = createContext<LocationContextType>({
  latitude: null,
  longitude: null,
  refreshLocation: () => {},
});

export const useLocation = () => useContext(LocationContext);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use this feature');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude;
      const lon = location.coords.longitude;
      setLatitude(lat);
      setLongitude(lon);

      // Update in backend
      await authService.updateLocation(lat, lon);
    } catch (error) {
      console.error('Failed to fetch location:', error);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ latitude, longitude, refreshLocation: fetchLocation }}>
      {children}
    </LocationContext.Provider>
  );
};
