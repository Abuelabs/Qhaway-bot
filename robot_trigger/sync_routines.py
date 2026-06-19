#!/usr/bin/env python3
import json
import urllib.request
import urllib.parse
import urllib.error
import os
from datetime import datetime

# ==============================================================================
# CONFIGURACIÓN DEL ROBOT Y SUPABASE
# ==============================================================================
# Se priorizan las variables de entorno, con fallbacks a los valores del proyecto.
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://tmysyykrnaloliyuuucp.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "sb_publishable_d2KmRddNdMINU4RkbqBglA_mmlwd92-")
ELDER_ID = os.environ.get("ELDER_ID", "a1a8c3d7-4b96-4db0-9b4e-7b70bc90471c") # ID del adulto mayor asignado al robot

def format_time_12h(time_str):
    """
    Convierte un string de hora en formato de 24h (HH:MM) a 12h (hh:mm AM/PM).
    Si el formato es inválido o no contiene dos puntos, devuelve el string original.
    """
    try:
        dt = datetime.strptime(time_str, "%H:%M")
        return dt.strftime("%I:%M %p")
    except ValueError:
        return time_str

def sync_routines():
    """
    Descarga la agenda de rutinas del paciente (elder_id) desde la API REST
    de Supabase utilizando únicamente la librería estándar de Python.
    """
    if not SUPABASE_URL or not SUPABASE_KEY or SUPABASE_KEY == "your-supabase-anon-key-here":
        print("[IoT-ElderBot] [ERROR] Credenciales de Supabase no configuradas.")
        print("[IoT-ElderBot] Por favor define las variables SUPABASE_URL y SUPABASE_KEY.")
        return False

    print(f"[IoT-ElderBot] Sincronizando rutinas para (elder_id): {ELDER_ID}...")

    # Filtro eq para elder_id según el estándar de PostgREST en Supabase
    query_params = urllib.parse.urlencode({
        "elder_id": f"eq.{ELDER_ID}"
    })
    
    url = f"{SUPABASE_URL}/rest/v1/routines?{query_params}"

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    req = urllib.request.Request(url, headers=headers, method="GET")

    try:
        with urllib.request.urlopen(req, timeout=6.0) as response:
            res_body = response.read().decode('utf-8')
            routines = json.loads(res_body)
            
            if not isinstance(routines, list):
                print("[IoT-ElderBot] [ERROR] Formato de respuesta inesperado de Supabase.")
                return False

            print(f"[IoT-ElderBot] Sincronización exitosa. Descargadas {len(routines)} rutinas.")
            
            # Programador de Alarmas (Mock)
            print("\n==================================================")
            print("         CRONOGRAMA DE ALARMAS PROGRAMADAS        ")
            print("==================================================")
            
            if len(routines) == 0:
                print("   No hay rutinas programadas para este elder_id. ")
            else:
                # Ordenar las rutinas cronológicamente por hora ("HH:MM")
                sorted_routines = sorted(routines, key=lambda x: x.get("time", "00:00"))
                
                for index, r in enumerate(sorted_routines, 1):
                    name = r.get("name", "Rutina sin nombre")
                    raw_time = r.get("time", "00:00")
                    time_12h = format_time_12h(raw_time)
                    description = r.get("description", "")
                    category = r.get("category", "general")
                    
                    desc_str = f" - {description}" if description else ""
                    print(f"[{time_12h}] - Alarma programada para: {name} ({category.upper()}){desc_str}")
            
            print("==================================================\n")
            return True

    except urllib.error.HTTPError as e:
        print(f"[IoT-ElderBot] [ERROR] Error HTTP ({e.code}) al sincronizar:")
        try:
            print(e.read().decode('utf-8'))
        except Exception:
            pass
        return False
    except urllib.error.URLError as e:
        print(f"[IoT-ElderBot] [ERROR] Error de red/conexión: {e.reason}")
        return False
    except Exception as e:
        print(f"[IoT-ElderBot] [ERROR] Error inesperado: {str(e)}")
        return False

if __name__ == "__main__":
    sync_routines()
