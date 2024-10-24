import { PERMISSIONS, RESULTS, request} from 'react-native-permissions'

export const requestLocationPermission = async () => {
    
    try {
      const granted = await request(
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        {
          title: 'Permiso de localización',
          message: 'Necesitas compartir tu ubicación para hacer uso de este aplicativo...',
          buttonNeutral: 'Pregunta luego..',
          buttonNegative: 'Cancelar',
          buttonPositive: 'OK',
        },
      );
      return granted === RESULTS.GRANTED;
    } catch (err) {
      return false;
    }
};
