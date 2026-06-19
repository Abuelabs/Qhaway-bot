import os
from google.adk import Agent

# ==========================================
# 1. DEFINICIÓN DE HERRAMIENTAS (SKILLS)
# ==========================================

def consultar_rutina_paciente(elder_id: str) -> str:
    """
    Consulta la base de datos de rutinas médicas para un paciente específico.
    Utiliza esta herramienta SIEMPRE que el usuario pregunte por sus medicamentos, 
    pastillas, horarios de medicación o pregunte qué debe hacer hoy.

    Args:
        elder_id: El identificador único del adulto mayor (ej. "paciente_123").

    Returns:
        str: La rutina médica programada en formato de texto.
    """
    # [AQUÍ IRÁ LA CONEXIÓN REAL A SUPABASE EN EL FUTURO]
    # Por ahora, usamos un Mock (datos falsos) para probar que Gemini llama a la función.
    
    print(f"\n[DEBUG ADK] 🔍 Ejecutando Tool: Consultando Supabase para ID: {elder_id}...\n")
    
    return "El paciente debe tomar Losartán de 50mg a las 8:00 AM junto con su desayuno."


# ==========================================
# 2. PERSONALIDAD Y REGLAS (SYSTEM PROMPT)
# ==========================================

INSTRUCCIONES_QHAWAYBOT = """
Eres Qhawaybot, un robot físico de asistencia y compañía para adultos mayores.
Tu tono debe ser extremadamente cálido, empático, paciente y muy respetuoso.

REGLAS ESTRICTAS DE FORMATO Y COMPORTAMIENTO:
1. Tus respuestas deben ser EXTREMADAMENTE BREVES, máximo 2 oraciones.
2. Responde SIEMPRE en texto plano.
3. NUNCA uses formato markdown, ni asteriscos, ni negritas, ni viñetas, ni emojis. Tus respuestas serán procesadas por un sintetizador de voz y leídas en voz alta.
4. Si te preguntan por medicamentos, asume que el ID del paciente es "paciente_123" y usa tu herramienta de consulta.
"""


# ==========================================
# 3. INSTANCIACIÓN DEL AGENTE
# ==========================================

root_agent = Agent(
    name="Qhawaybot",
    model="gemini-2.5-flash", # Modelo ultrarrápido ideal para respuestas de voz
    instruction=INSTRUCCIONES_QHAWAYBOT,
    tools=[consultar_rutina_paciente] # Le entregamos nuestras funciones al LLM
)


# ==========================================
# 4. ENTORNO DE PRUEBA LOCAL (OPCIONAL)
# ==========================================
# Este bloque permite correr el script directo en la terminal para pruebas rápidas
if __name__ == "__main__":
    # Asegúrate de tener exportada tu variable GEMINI_API_KEY en tu terminal
    if not os.getenv("GEMINI_API_KEY") and not os.getenv("GOOGLE_API_KEY"):
        print("⚠️ ALERTA: No se encontró la API Key. Por favor exporta GEMINI_API_KEY.")
    
    print("🤖 Iniciando Qhawaybot ADK... (Escribe 'salir' para terminar)")
    print("-" * 50)
    
    while True:
        mensaje_abuelo = input("👴 Abuelo: ")
        
        if mensaje_abuelo.lower() in ["salir", "exit", "quit"]:
            print("Apagando Qhawaybot...")
            break
            
        # El ADK maneja el historial de memoria automáticamente detrás de escena
        respuesta = elder_bot.invoke(mensaje_abuelo)
        
        print(f"🤖 Qhawaybot: {respuesta.text}")
        print("-" * 50)