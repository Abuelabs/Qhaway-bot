"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.procesarAlertaSOS = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const app_1 = require("firebase-admin/app");
const firestore_2 = require("firebase-admin/firestore");
const messaging_1 = require("firebase-admin/messaging");
// Inicializar SDK de Administración de Firebase
(0, app_1.initializeApp)();
const db = (0, firestore_2.getFirestore)();
/**
 * Cloud Function v2 que procesa alertas de emergencia en Firestore y envía notificaciones FCM.
 */
exports.procesarAlertaSOS = (0, firestore_1.onDocumentCreated)({
    document: "emergencias/{emergenciaId}",
    region: "us-central1"
}, async (event) => {
    const emergenciaId = event.params.emergenciaId;
    const snap = event.data;
    if (!snap) {
        logger.error(`[SOS-${emergenciaId}] El evento no contiene datos.`);
        return;
    }
    const data = snap.data();
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
            logger.warn(`[SOS-${emergenciaId}] ADVERTENCIA: No existe un documento de tokens registrado para el paciente ${id_paciente}.`);
            // Ejecutar inmediatamente el sistema redundante (Twilio Call)
            await ejecutarLlamadaRedundanteTwilio(id_paciente, tipoEmergencia, emergenciaId);
            return;
        }
        const docData = patientTokensDoc.data();
        const tokens = docData && Array.isArray(docData.tokens)
            ? docData.tokens.filter((t) => typeof t === "string")
            : [];
        // 3. Manejo de caso sin tokens registrados (Familiar sin App o Desconectado)
        if (tokens.length === 0) {
            logger.warn(`[SOS-${emergenciaId}] ADVERTENCIA: El documento del paciente ${id_paciente} existe pero no tiene tokens FCM en la lista.`);
            // Ejecutar inmediatamente el sistema redundante (Twilio Call)
            await ejecutarLlamadaRedundanteTwilio(id_paciente, tipoEmergencia, emergenciaId);
            return;
        }
        // 4. Construcción del Payload para la Alerta Crítica (FCM)
        const payload = {
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
        const response = await (0, messaging_1.getMessaging)().sendEachForMulticast(payload);
        logger.info(`[SOS-${emergenciaId}] FCM completado. Éxitos: ${response.successCount}, Fallidos: ${response.failureCount}`);
        // Limpieza preventiva de tokens inválidos o desactualizados
        if (response.failureCount > 0) {
            const tokensABorrar = [];
            response.responses.forEach((res, idx) => {
                if (!res.success && res.error) {
                    const code = res.error.code;
                    if (code === "messaging/invalid-registration-token" ||
                        code === "messaging/registration-token-not-registered") {
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
    }
    catch (err) {
        logger.error(`[SOS-${emergenciaId}] Error general procesando la alerta:`, err);
    }
});
/**
 * Función auxiliar para remover tokens que han expirado o han sido desinstalados.
 */
async function removerTokensInvalidos(id_paciente, tokensAEliminar) {
    try {
        const docRef = db.collection("fcm_tokens").doc(id_paciente);
        const doc = await docRef.get();
        if (doc.exists) {
            const currentTokens = doc.data()?.tokens || [];
            const updatedTokens = currentTokens.filter((t) => !tokensAEliminar.includes(t));
            await docRef.update({ tokens: updatedTokens });
            logger.info(`[Tokens] Se limpiaron ${tokensAEliminar.length} tokens para el paciente ${id_paciente}.`);
        }
    }
    catch (error) {
        logger.error("Error al limpiar tokens obsoletos de la base de datos:", error);
    }
}
/**
 * Simulación de llamada telefónica usando Twilio Voice API como canal de respaldo físico.
 */
async function ejecutarLlamadaRedundanteTwilio(id_paciente, tipo, emergenciaId) {
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
//# sourceMappingURL=index.js.map