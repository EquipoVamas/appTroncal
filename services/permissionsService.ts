import { Alert, Linking } from 'react-native'
import { PERMISSIONS, RESULTS, request, requestMultiple, checkMultiple, openSettings, check} from 'react-native-permissions'
import { sleep } from './backgroundTask'

type PermissionStatusMap = {
    [key: string]: boolean;
};  

const permissions = [
    PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
    PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    PERMISSIONS.ANDROID.ACCESS_MEDIA_LOCATION,
    PERMISSIONS.ANDROID.CAMERA,
    PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
    PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
];

export const checkPermissions = async (): Promise<PermissionStatusMap> => {
    try {
        const statuses = await checkMultiple(permissions);
        return {
            ACCESS_BACKGROUND_LOCATION: statuses[PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION] === RESULTS.GRANTED,
            ACCESS_COARSE_LOCATION: statuses[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] === RESULTS.GRANTED,
            ACCESS_FINE_LOCATION: statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED,
            ACCESS_MEDIA_LOCATION: statuses[PERMISSIONS.ANDROID.ACCESS_MEDIA_LOCATION] === RESULTS.GRANTED,
            CAMERA: statuses[PERMISSIONS.ANDROID.CAMERA] === RESULTS.GRANTED,
            READ_MEDIA_IMAGES: statuses[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] === RESULTS.GRANTED,
            POST_NOTIFICATIONS: statuses[PERMISSIONS.ANDROID.POST_NOTIFICATIONS] === RESULTS.GRANTED
        };
    } catch (err) {
        return {
            ACCESS_BACKGROUND_LOCATION: false,
            ACCESS_COARSE_LOCATION: false,
            ACCESS_FINE_LOCATION: false,
            ACCESS_MEDIA_LOCATION: false,
            CAMERA: false,
            READ_MEDIA_IMAGES: false,
            POST_NOTIFICATIONS: false
        };
    }
};

export const requestPermissions = async (): Promise<PermissionStatusMap> => {
    try {
        const granted = await requestMultiple(permissions);
        return {
            ACCESS_BACKGROUND_LOCATION: granted[PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION] === RESULTS.GRANTED,
            ACCESS_COARSE_LOCATION: granted[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] === RESULTS.GRANTED,
            ACCESS_FINE_LOCATION: granted[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED,
            ACCESS_MEDIA_LOCATION: granted[PERMISSIONS.ANDROID.ACCESS_MEDIA_LOCATION] === RESULTS.GRANTED,
            CAMERA: granted[PERMISSIONS.ANDROID.CAMERA] === RESULTS.GRANTED,
            READ_MEDIA_IMAGES: granted[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] === RESULTS.GRANTED,
            POST_NOTIFICATIONS: granted[PERMISSIONS.ANDROID.POST_NOTIFICATIONS] === RESULTS.GRANTED
        }
    } catch (err) {
        return {
            ACCESS_BACKGROUND_LOCATION: false,
            ACCESS_COARSE_LOCATION: false,
            ACCESS_FINE_LOCATION: false,
            ACCESS_MEDIA_LOCATION: false,
            CAMERA: false,
            READ_MEDIA_IMAGES: false,
            POST_NOTIFICATIONS: false
        }
    }
};

export const requestOneByOne = async () => {

    for (const perm of permissions) {
        await request(perm);
    }

    sleep(1000);

    for (const perm of permissions) {
        var status = await check(perm);
        if(status == "denied" || status == "blocked"){
            await request(perm);
        }
    }
}

export const checkOneByOne = async () => {
    for (const perm of permissions) {
        var status = await check(perm);
        if(status == "denied"){
            verifyExplainPermissions();
            break;
        }
    }
}

export const verifyExplainPermissions = () => {
    Alert.alert(
        'Permisos necesarios',
        'Esta aplicación necesita los siguientes permisos para funcionar correctamente: Localización, Cámara, Notificaciones y Almacenamiento.',
        [
            { text: 'Cancelar', style: 'cancel', onPress: () => verifyExplainPermissions() },
            { text: 'Aceptar', onPress: () => requestOneByOne() },
        ],
    );
}

export const explainPermissions = (): Promise<void> => {
    return new Promise((resolve) => {
        Alert.alert(
            'Permisos necesarios',
            'Esta aplicación necesita los siguientes permisos para funcionar correctamente: Localización, Cámara y Almacenamiento.',
            [
                { text: 'Cancelar', style: 'cancel', onPress: () => resolve() },
                { text: 'Aceptar', onPress: () => resolve() },
            ],
        );
    });
};

export const requestAndCheckPermissions = async () => {

    const initialStatuses = await checkPermissions();
    const permissionsToRequest = permissions.filter(permission => {
        const key = permission.split('.').pop()!;
        return !initialStatuses[key];
    });

    if (permissionsToRequest.length > 0) {
        
        await explainPermissions();

        const grantedStatuses = await requestPermissions();

        const finalStatuses = permissionsToRequest.map(permission => {
            const key = permission.split('.').pop()!;
            return grantedStatuses[key];
        });

        if (finalStatuses.includes(false)) {
            Alert.alert(
                'Permisos necesarios',
                'Algunos permisos no fueron concedidos. Por favor, habilítalos manualmente en la configuración del dispositivo.',
                [
                    { text: 'Abrir Configuración', onPress: () => openSettings() },
                    { text: 'Cancelar', style: 'cancel' },
                ],
            );
            return false;
        }else{
            return true;
        }

    }else{
        return true;
    }
};