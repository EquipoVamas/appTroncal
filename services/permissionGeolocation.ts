import { Platform, Linking } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';

// Función principal para verificar y solicitar permisos y activar la ubicación
export const ensureLocationPermissionAndStatus = async () => {
  // 1. Verificar y solicitar permisos de ubicación
  const hasPermission = await checkLocationPermission();
  if (!hasPermission) {
    const permissionGranted = await requestLocationPermission();
    if (!permissionGranted) {
      console.warn("Permiso de ubicación denegado");
      return false;
    }
  }

  // 2. Verificar si la ubicación (GPS) está activa
  const isLocationEnabled = await checkIfLocationIsEnabled();
  if (!isLocationEnabled) {
    console.warn("GPS inactivo, redirigiendo a configuración.");
    openLocationSettings();
    return false;
  }

  console.log("Permiso de ubicación concedido y GPS activo");
  return true;
};

// Función para verificar si ya tiene el permiso de ubicación
const checkLocationPermission = async () => {
  const permission =
    Platform.OS === 'android'
      ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

  try {
    const result = await check(permission);
    return result === RESULTS.GRANTED;
  } catch (error) {
    console.warn("Error al verificar el permiso de ubicación:", error);
    return false;
  }
};

// Función para solicitar el permiso de ubicación
const requestLocationPermission = async () => {
  const permission =
    Platform.OS === 'android'
      ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

  try {
    const result = await request(permission);
    return result === RESULTS.GRANTED;
  } catch (error) {
    console.warn("Error al solicitar el permiso de ubicación:", error);
    return false;
  }
};

// Función para verificar si la ubicación (GPS) está activa
const checkIfLocationIsEnabled = () => {
  return new Promise((resolve) => {
    Geolocation.getCurrentPosition(
      (position) => resolve(true), // GPS activo
      (error) => {
        console.warn("GPS inactivo:", error.message);
        resolve(false); // GPS inactivo
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  });
};

// Función para abrir la configuración de ubicación si el GPS está inactivo
const openLocationSettings = () => {
  if (Platform.OS === 'android') {
    Linking.openSettings();
  } else {
    console.warn("Para activar el GPS, ve a Configuración > Privacidad > Localización en iOS.");
  }
};
