#!/usr/bin/env python3
import json
import urllib.request
import urllib.error
import time
from datetime import datetime

# ==============================================================================
# CONFIGURACIÓN DEL DISPOSITIVO
# ==============================================================================
ID_PACIENTE = "test_123"
PROJECT_ID = "elderbot-sos-hotpath"

# Entornos de Ejecución
# Para desarrollo local (Emulador):
LOCAL_URL = f"http://localhost:8080/v1/projects/{PROJECT_ID}/databases/(default)/documents/emergencias"
# Para producción (API Real de Google Cloud):
PROD_URL = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/emergencias"

# Cambiar a False en producción
USE_EMULATOR = True 

# Token de autenticación (Opcional/Requerido para producción)
# En producción, se debe obtener un token de identidad de Firebase Auth o adjuntar un Header de autorización
BEARER_TOKEN = "YOUR_FIREBASE_ID_TOKEN" 

def disparar_sos(tipo_emergencia="caida"):
    """
    Envía una alerta de emergencia SOS de forma inmediata a la base de datos
    de Firestore utilizando la API REST de Firestore para máxima velocidad (< 500ms).
    Evita cargar librerías pesadas como gRPC o el SDK de Google Cloud.
    """
    url = LOCAL_URL if USE_EMULATOR else PROD_URL
    print(f"[IoT-ElderBot] Iniciando envío de alerta SOS [{tipo_emergencia.upper()}] a Firestore...")
    
    start_time = time.time()
    
    # Obtener marca de tiempo en formato ISO 8601 UTC
    timestamp_str = datetime.utcnow().isoformat() + "Z"
    
    # Formatear el payload al estándar REST de Firestore (Declaración explícita de tipos)
    payload = {
        "fields": {
            "id_paciente": {"stringValue": ID_PACIENTE},
            "tipo": {"stringValue": tipo_emergencia},
            "timestamp": {"stringValue": timestamp_str}
        }
    }
    
    data_bytes = json.dumps(payload).encode('utf-8')
    
    # Configurar los headers HTTP
    headers = {
        "Content-Type": "application/json",
        "Content-Length": str(len(data_bytes))
    }
    
    # En producción es necesario añadir la cabecera de autenticación
    if not USE_EMULATOR and BEARER_TOKEN and BEARER_TOKEN != "YOUR_FIREBASE_ID_TOKEN":
        headers["Authorization"] = f"Bearer {BEARER_TOKEN}"
        
    req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
    
    try:
        # Enviar petición y recibir respuesta
        with urllib.request.urlopen(req, timeout=3.0) as response:
            res_body = response.read().decode('utf-8')
            elapsed_time = (time.time() - start_time) * 1000
            
            print("[IoT-ElderBot] ¡ALERTA SOS ENVIADA EXITOSAMENTE!")
            print(f"[IoT-ElderBot] Latencia de red: {elapsed_time:.2f} ms")
            
            res_json = json.loads(res_body)
            # El ID asignado por Firestore se encuentra al final de la ruta del documento
            doc_name = res_json.get("name", "")
            emergencia_id = doc_name.split("/")[-1] if doc_name else "Desconocido"
            print(f"[IoT-ElderBot] Emergencia ID asignado: {emergencia_id}")
            return True
            
    except urllib.error.HTTPError as e:
        elapsed_time = (time.time() - start_time) * 1000
        print(f"[IoT-ElderBot] ERROR HTTP ({e.code}) tras {elapsed_time:.2f} ms")
        print(e.read().decode('utf-8'))
        return False
    except urllib.error.URLError as e:
        elapsed_time = (time.time() - start_time) * 1000
        print(f"[IoT-ElderBot] ERROR DE RED/CONEXIÓN tras {elapsed_time:.2f} ms")
        print(f"Detalle: {e.reason}")
        return False
    except Exception as e:
        print(f"[IoT-ElderBot] Error inesperado: {str(e)}")
        return False

if __name__ == "__main__":
    # Simulación de gatillo físico (ej. al presionar botón SOS)
    disparar_sos("caida")
