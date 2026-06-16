import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging, MulticastMessage } from "firebase-admin/messaging";

// Inicializar SDK de Administración de Firebase
initializeApp();
const db = getFirestore();

interface EmergenciaData {
  id_paciente?: string;
  tipo?: string;
  timestamp?: any;
}

/**
 * Cloud Function v2 que procesa alertas de emergencia en Firestore y envía notificaciones FCM.
 */
export const procesarAlertaSOS = onDocumentCreated(
  {
    document: "emergencias/{emergenciaId}",
    region: "us-central1"
  },
  async (event) => {
    const emergenciaId = event.params.emergenciaId;
    const snap = event.data;

    if (!snap) {
      logger.error(`[SOS-${emergenciaId}] El evento no contiene datos.`);
      return;
    }

    const data = snap.data() as EmergenciaData;
    logger.info(`[SOS-${emergenciaId}] Nueva alerta detectada:`, data);

    const { id_paciente, tipo } = data;

    // 1. Validaciones iniciales de integridad
    if (!id_paciente) {
      logger.error(`[SOS-${emergenciaId}] Error crítico: id_paciente no especificado en el documento.`);
      return;
    }

    const tipoEmergencia = tipo || "Desconocido";

    try {
      // 2. Obtención de tokens FCM asociados al paciente (Opción A - Documento por paciente)
      logger.info(`[SOS-${emergenciaId}] Buscando tokens FCM para el paciente: ${id_paciente}`);
      
      const patientTokensDoc = await db.collection("fcm_tokens").doc(id_paciente).get();
      
      if (!patientTokensDoc.exists) {
        logger.warn(
          `[SOS-${emergenciaId}] ADVERTENCIA: No existe un documento de tokens registrado para el paciente ${id_paciente}.`
        );
        // Ejecutar inmediatamente el sistema redundante (Twilio Call)
        await ejecutarLlamadaRedundanteTwilio(id_paciente, tipoEmergencia, emergenciaId);
        return;
      }

      const docData = patientTokensDoc.data();
      const tokens: string[] = docData && Array.isArray(docData.tokens) 
        ? docData.tokens.filter((t: any) => typeof t === "string") 
        : [];

      // 3. Manejo de caso sin tokens registrados (Familiar sin App o Desconectado)
      if (tokens.length === 0) {
        logger.warn(
          `[SOS-${emergenciaId}] ADVERTENCIA: El documento del paciente ${id_paciente} existe pero no tiene tokens FCM en la lista.`
        );
        // Ejecutar inmediatamente el sistema redundante (Twilio Call)
        await ejecutarLlamadaRedundanteTwilio(id_paciente, tipoEmergencia, emergenciaId);
        return;
      }

      // 4. Construcción del Payload para la Alerta Crítica (FCM)
      const payload: MulticastMessage = {
        tokens: Array.from(new Set(tokens)), // Eliminar duplicados
        notification: {
          title: "🚨 ¡ALERTA SOS! 🚨",
          body: `ElderBot ha detectado una emergencia: [${tipoEmergencia.toUpperCase()}]`,
        },
        data: {
          emergenciaId: emergenciaId,
          id_paciente: id_paciente,
          tipo: tipoEmergencia,
          click_action: "FLUTTER_NOTIFICATION_CLICK"
        },
        // Configuración para que suene con volumen máximo e ignore "No molestar" en iOS
        apns: {
          payload: {
            aps: {
              sound: {
                critical: true,
                name: "default",
                volume: 1.0,
              },
              badge: 1,
            },
          },
        },
        // Configuración para Android High Priority y canal de alertas críticas
        android: {
          priority: "high",
          notification: {
            sound: "default",
            channelId: "critical_alerts",
            priority: "high",
            visibility: "public"
          },
        },
      };

      // 5. Enviar mensajes en lote a través de FCM
      logger.info(`[SOS-${emergenciaId}] Enviando notificación FCM a ${payload.tokens.length} dispositivo(s).`);
      const response = await getMessaging().sendEachForMulticast(payload);
      
      logger.info(
        `[SOS-${emergenciaId}] FCM completado. Éxitos: ${response.successCount}, Fallidos: ${response.failureCount}`
      );

      // Limpieza preventiva de tokens inválidos o desactualizados
      if (response.failureCount > 0) {
        const tokensABorrar: string[] = [];
        response.responses.forEach((res, idx) => {
          if (!res.success && res.error) {
            const code = res.error.code;
            if (
              code === "messaging/invalid-registration-token" ||
              code === "messaging/registration-token-not-registered"
            ) {
              tokensABorrar.push(payload.tokens[idx]);
            }
          }
        });
        
        if (tokensABorrar.length > 0) {
          logger.info(`[SOS-${emergenciaId}] Limpiando ${tokensABorrar.length} tokens inválidos en la BD.`);
          await removerTokensInvalidos(id_paciente, tokensABorrar);
        }
      }

      // 6. Activar la llamada de voz redundante por seguridad
      await ejecutarLlamadaRedundanteTwilio(id_paciente, tipoEmergencia, emergenciaId);

    } catch (err: any) {
      logger.error(`[SOS-${emergenciaId}] Error general procesando la alerta:`, err);
    }
  }
);

/**
 * Función auxiliar para remover tokens que han expirado o han sido desinstalados.
 */
async function removerTokensInvalidos(id_paciente: string, tokensAEliminar: string[]) {
  try {
    const docRef = db.collection("fcm_tokens").doc(id_paciente);
    const doc = await docRef.get();
    if (doc.exists) {
      const currentTokens: string[] = doc.data()?.tokens || [];
      const updatedTokens = currentTokens.filter((t) => !tokensAEliminar.includes(t));
      await docRef.update({ tokens: updatedTokens });
      logger.info(`[Tokens] Se limpiaron ${tokensAEliminar.length} tokens para el paciente ${id_paciente}.`);
    }
  } catch (error) {
    logger.error("Error al limpiar tokens obsoletos de la base de datos:", error);
  }
}

/**
 * Simulación de llamada telefónica usando Twilio Voice API como canal de respaldo físico.
 */
async function ejecutarLlamadaRedundanteTwilio(id_paciente: string, tipo: string, emergenciaId: string) {
  logger.info(`[Redundancia-SOS-${emergenciaId}] Iniciando canal de voz de respaldo...`);
  
  console.log(`
  =========================================
  TWILIO VOICE OUTBOUND CALL (MOCK/PROD)
  =========================================
  Fecha/Hora: ${new Date().toISOString()}
  Destinatario: [Buscando teléfono de contacto de emergencia para el paciente ${id_paciente}]
  Mensaje de Voz Generado: "Atención. Esta es una llamada de emergencia de ElderBot. Su familiar ha registrado una alerta crítica de tipo ${tipo}. Por favor ingrese a la aplicación o comuníquese inmediatamente."
  API POST URL: https://api.twilio.com/2010-04-01/Accounts/[AccountSid]/Calls.json
  Payload: {
    To: "+51987654321", 
    From: "+1234567890", 
    Url: "https://handler.twilio.com/twiml/EH123456789..." 
  }
  =========================================
  `);
}
