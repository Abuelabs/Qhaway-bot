#!/usr/bin/env python3
from google.adk.agents import Agent

# ==============================================================================
# DEFINICIÓN DE HERRAMIENTAS (SKILLS / TOOLS)
# ==============================================================================

def consultar_rutina_paciente(elder_id: str) -> str:
    """
    Consulta y devuelve las rutinas médicas y medicamentos programados para un paciente.
    Usa esta herramienta cuando el usuario pregunte por sus medicinas, recordatorios o tareas.

    Args:
        elder_id (str): El identificador único (UUID) del paciente adulto mayor.

    Returns:
        str: Un texto con la lista de medicamentos y horas programadas.
    """
    # Nota: Por ahora es un mock de datos que simula la respuesta de la base de datos (Supabase)
    print(f"[Skill - Tool] Executing consultar_rutina_paciente for elder_id: {elder_id}")
    return "El paciente tiene programado tomar Losartán de 50mg a las 08:00 AM y Paracetamol de 500mg a las 08:00 PM."


# ==============================================================================
# CONFIGURACIÓN Y PROMPT DEL AGENTE
# ==============================================================================

# Instrucciones del sistema optimizadas para voz (TTS) y trato empático a adultos mayores
system_instructions = (
    "Eres ElderBot, un asistente y robot físico de compañía para adultos mayores en su hogar. "
    "Tu tono al hablar debe ser extremadamente cariñoso, empático, paciente y respetuoso. "
    "REGLA DE FORMATO OBLIGATORIA: Responde siempre en un máximo de dos oraciones. "
    "Escribe únicamente en texto plano. Está estrictamente prohibido usar formato markdown, "
    "negritas (asteriscos), listas, viñetas, guiones, enumeraciones, caracteres especiales o emojis, "
    "ya que tus respuestas serán leídas en voz alta por un sintetizador de voz (TTS) del robot."
)

# Instanciación oficial del agente ElderBot
# Definimos 'root_agent' para que el cargador CLI/Web de Google ADK lo descubra automáticamente
root_agent = Agent(
    name="elderbot_brain",
    model="gemini-2.5-flash", # Modelo recomendado por su baja latencia y alta eficiencia
    instruction=system_instructions,
    tools=[consultar_rutina_paciente]
)
