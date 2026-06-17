import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, arrayUnion } from 'firebase/firestore';

// Configuración de Firebase Client Web SDK (reemplazar con las del proyecto en producción)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "elderbot-sos-hotpath.firebaseapp.com",
  projectId: "elderbot-sos-hotpath",
  storageBucket: "elderbot-sos-hotpath.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Configurar comportamiento por defecto de notificaciones recibidas en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Registra el dispositivo móvil en Expo Notifications y obtiene el token.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  if (Platform.OS === 'android') {
    // Registrar el canal crítico con máxima importancia para notificaciones de emergencia
    await Notifications.setNotificationChannelAsync('critical_alerts', {
      name: 'Alertas Críticas SOS',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF0000',
      sound: 'default', // Para usar el sonido crítico por defecto
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('¡Fallo al obtener permiso para notificaciones push!');
      return null;
    }

    // Obtener token (Expo Push Token o FCM Token según configuración)
    try {
      const tokenData = await Notifications.getDevicePushTokenAsync();
      token = tokenData.data;
    } catch (e) {
      // Fallback a Expo Push Token en caso de usar emulador sin Google Play Services
      const expoTokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'YOUR_EXPO_PROJECT_ID', // Reemplazar con el ID del proyecto de Expo
      });
      token = expoTokenData.data;
    }
  } else {
    console.log('Se debe usar un dispositivo físico para recibir notificaciones Push reales.');
  }

  return token;
}

/**
 * Guarda el token FCM/Expo en el documento del paciente correspondiente (Opción A) en Firestore.
 * 
 * @param idPaciente El identificador del adulto mayor a cuidar.
 * @param token El token push del dispositivo del familiar.
 */
export async function registerTokenInFirestore(idPaciente: string, token: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'fcm_tokens', idPaciente);
    
    // Inserta o actualiza el documento agregando el token a la lista mediante arrayUnion
    // Esto previene duplicados y asegura que no borremos tokens de otros familiares
    await setDoc(docRef, {
      tokens: arrayUnion(token),
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    
    console.log(`[FCM-Service] Token registrado con éxito en Firestore para el paciente: ${idPaciente}`);
    return true;
  } catch (error) {
    console.error('Error al guardar el token push en Firestore:', error);
    return false;
  }
}
