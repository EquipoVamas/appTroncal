import Geolocation from '@react-native-community/geolocation';
import { Location } from '../interfaces/location';

export const getCurrentLocation = async ( ) : Promise<Location> => {
  return new Promise ( ( resolve, reject ) => {
    Geolocation.getCurrentPosition( (info) => {
      resolve ( {
        latitude: info.coords.latitude,
        longitude: info.coords.longitude,
      })
    }, ( error ) => {
      reject( error );
    },{
      enableHighAccuracy: true
    })
  })
}

export const getDistance = (latitudeFrom: number, longitudeFrom: number, latitudeTo: number, longitudeTo: number, unit: string = 'M'): string => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(latitudeTo - latitudeFrom);
  const dLon = toRad(longitudeTo - longitudeFrom);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(latitudeFrom)) * Math.cos(toRad(latitudeTo)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceInKm = R * c;
  const distanceInMiles = distanceInKm * 0.621371;

  if (unit.toUpperCase() === 'K') {
    return `${distanceInKm.toFixed(2)} km`;
  } else if (unit.toUpperCase() === 'N') {
    return `${(distanceInMiles * 0.8684).toFixed(2)} nm`;
  } else if (unit.toUpperCase() === 'M') {
    return `${(distanceInKm * 1000).toFixed(2)} m`;
  } else {
    return `${distanceInMiles.toFixed(2)} mi`;
  }
};

export function generateRandomCode(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }

  return code;
}

export function filtrarDatos (obj : any) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => value !== null)
  );
}