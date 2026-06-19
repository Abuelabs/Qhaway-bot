#!/usr/bin/env python3
import json
import urllib.request
import urllib.error

PROJECT_ID = "elderbot-sos-hotpath"
ID_PACIENTE = "test_123"

# URL para el documento en el Emulador local de Firestore (usando PATCH para crear por ID)
URL = f"http://localhost:8080/v1/projects/{PROJECT_ID}/databases/(default)/documents/fcm_tokens/{ID_PACIENTE}"

def setup_mock_tokens():
    print(f"[Setup-Tokens] Registrando tokens mock en el emulador para el paciente {ID_PACIENTE}...")
    
    # Payload con formato REST de Firestore para un array de strings
    payload = {
        "fields": {
            "tokens": {
                "arrayValue": {
                    "values": [
                        {"stringValue": "familiar_token_fcm_iphone_12"},
                        {"stringValue": "familiar_token_fcm_android_pixel"}
                    ]
                }
            }
        }
    }
    
    data_bytes = json.dumps(payload).encode('utf-8')
    
    req = urllib.request.Request(URL, data=data_bytes, headers={"Content-Type": "application/json"}, method="PATCH")
    
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            print("[Setup-Tokens] ¡Tokens mock registrados exitosamente en fcm_tokens/test_123!")
            print(res_body)
            return True
    except urllib.error.HTTPError as e:
        print(f"[Setup-Tokens] Error HTTP: {e.code}")
        print(e.read().decode('utf-8'))
        return False
    except Exception as e:
        print(f"[Setup-Tokens] Error: {str(e)}")
        return False

if __name__ == "__main__":
    setup_mock_tokens()
