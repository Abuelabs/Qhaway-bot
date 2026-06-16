# **Documento de Arquitectura Técnica: Plataforma Digital**

## **1\. Visión General del Sistema** 

La plataforma está diseñada bajo una **arquitectura basada en eventos y sincronización en tiempo real**. El sistema se compone de tres nodos principales:

1. **El Dispositivo IoT (Robot Físico):** Ejecuta comandos, recopila audio/datos de sensores y se comunica con la nube.  
2. **El Cerebro Central (Nube/BaaS):** Centraliza la lógica de negocio, almacena los datos y orquesta las comunicaciones.  
3. **Las Interfaces de Cliente (Web/App):** Paneles administrativos para que los familiares configuren el robot y reciban alertas.

## **2\. Servidor y Base de Datos (BaaS \- Backend as a Service) ✅**

Para minimizar tiempos de desarrollo y costos de mantenimiento de servidores, la infraestructura base utilizará un BaaS.

* **Tecnología Recomendada:** **Google Firebase** (por su robustez en notificaciones push y tiempo real) o **Supabase** (si se prefiere una base de datos relacional PostgreSQL con capacidades de tiempo real).

### **2.1. Base de Datos en Tiempo Real (Realtime Database / Firestore) ✅**

La base de datos debe reflejar los cambios instantáneamente en el robot y la app. Las colecciones/tablas principales serán:

* **Usuarios (Familiares):** Perfiles de los administradores.  
* **Pacientes (Adultos Mayores):** Perfiles de los abuelos, incluyendo preferencias médicas (tipos de sangre, alergias).  
* **Dispositivos (Robots):** Estado del robot en tiempo real (batería, conexión WiFi, última vez activo).  
* **Configuraciones Dispositivo:** Contactos de emergencia, nivel de volumen, palabras de activación.  
* **Eventos y Alarmas:** Registro de horarios de medicinas, citas médicas y un log histórico de acciones (ej. "Pastilla tomada a las 8:05 AM").  
* **Logs de Emergencia (SOS):** Registro inmutable de activaciones de pánico.

## **3\. Seguridad y Autenticación** 

Dado que se maneja información sensible (salud, ubicación de emergencias), la seguridad es prioritaria.

### **3.1. Autenticación de Usuarios (App/Web)** 

* **Identity Provider (IdP):** Autenticación mediante Firebase Auth / Supabase Auth.  
* **Métodos:** Acceso simplificado vía Google, Apple ID o correo/contraseña.  
* **RBAC (Role-Based Access Control):** Solo los usuarios designados como "Administradores" de un robot específico pueden modificar sus alarmas.

### **3.2. Autenticación del IoT (El Robot)**

* **Emparejamiento (Pairing):** El robot utilizará una conexión Bluetooth temporal de bajo consumo (BLE) con la App del familiar para recibir las credenciales del WiFi y un **Token de Dispositivo único** (API Key cifrada).  
* **Conexión Segura:** Toda comunicación entre el robot y la nube debe realizarse a través de protocolos seguros (MQTT sobre TLS o HTTPS).

### **3.3. Privacidad de Datos**

* El robot **no grabará audio 24/7 en la nube**. El procesamiento de la palabra de activación (Wake-word, ej. *"Hey Robot"*) y de palabras clave de auxilio se hará **localmente en el hardware** (Edge AI). Solo se enviará audio a la nube cuando el robot sea activado.

## **4\. Backend y APIs (Lógica de Negocio Central)** 

Aunque el BaaS maneja la base de datos, se requerirá una capa de código en la nube (Serverless) para operaciones complejas.

### **4.1. Funciones Serverless (Cloud Functions / AWS Lambda)**

Se ejecutarán scripts en la nube que reaccionan a eventos en la base de datos:

* **Motor de Notificaciones:** Si el robot escribe en la base de datos status: SOS, una función en la nube se dispara automáticamente y envía una Notificación Push urgente a todos los familiares.  
* **Llamadas Telefónicas Automáticas (Integración Twilio):** Si los familiares no abren la notificación SOS en 3 minutos, una Cloud Function ejecutará la API de Twilio para hacer una llamada telefónica real (PSTN) a los servicios de emergencia o al familiar, reproduciendo un mensaje de voz automatizado con la ubicación.  
* **Procesamiento de LLM (Inteligencia Artificial):** Cuando el abuelo hace una pregunta compleja, el robot envía el texto a una Cloud Function. Esta función consulta a una API de IA (como OpenAI GPT-4 o Google Gemini), procesa la respuesta para que sea corta y amigable, y se la devuelve al robot para que la lea.

### **4.2. Protocolos de Comunicación**

* **WebSockets / MQTT:** Para la comunicación constante, ligera y bidireccional entre el Robot y la Nube.  
* **REST APIs:** Para que la Web y la App hagan configuraciones que no requieren conexión en tiempo real constante (ej. subir una foto de perfil, actualizar un número de teléfono).

## **5\. Capa Frontend (Interfaces de Usuario)**

### **5.1. Panel Administrativo (Web App) ✅**

* **Propósito:** Configuración inicial cómoda desde una computadora (cargar historiales médicos, listas de pastillas largas, agregar música).  
* **Tecnología:** **React.js** o **Vue.js**, alojado en servicios de despliegue rápido como Vercel o Netlify.

### **5.2. Aplicación Móvil (App Híbrida)**

* **Propósito:** Notificaciones de emergencia críticas, configuración rápida Bluetooth, monitoreo en tiempo real del estado del abuelo.  
* **Tecnología:** **Flutter** o **React Native**. Esto permite escribir el código una sola vez y exportar aplicaciones nativas tanto para Android (Google Play) como para iOS (App Store).  
* **Funciones Críticas:** Manejo de Notificaciones Push con prioridad máxima (Critical Alerts) para saltarse los modos "No molestar" del teléfono en caso de un SOS.

## **6\. Capa IoT (Desarrollo del Robot Físico)**

* **Sistema Operativo:** Basado en Linux (si se usa Raspberry Pi) o un RTOS (Real-Time Operating System) si se usa un microcontrolador como ESP32 para abaratar costos.  
* **Lenguaje Principal:** Python o C++.  
* **Componentes de Software Local:**  
  * *Motor de Reconocimiento de Voz Local (Edge):* Por ejemplo, Porcupine o Snowboy, para detectar comandos básicos sin internet.  
  * *Cliente MQTT:* Para mantener el "latido" (heartbeat) continuo con el servidor.  
  * *Controlador de Hardware (GPIO):* Scripts para encender los LEDs, hacer sonar el altavoz y leer el botón físico de pánico.

**Sugerencia para el equipo técnico:** Este documento define la arquitectura general. El siguiente paso técnico sería crear un **Diagrama de Arquitectura de Software** (un esquema visual de cómo se conectan estas cajas) o definir el esquema JSON exacto de cómo se guardará una alarma en la base de datos. ¿Deseas que profundicemos en alguno de esos puntos más técnicos?

# 

# 

# 

# 

# 

# 

# **Enfoque Top-Down (Frontend-First)**

## **Metodología: Desarrollo Guiado por la Interfaz (UI-Driven)**

El desarrollo comenzará desde la capa más alta de abstracción (lo que ve y toca el usuario/familiar) y descenderá gradualmente hasta la infraestructura de datos. Esto asegura que la base de datos se moldee para servir a la interfaz, y no al revés.

### **Fase 1: Definición de Vistas Principales (Pantallas) ✅**

Antes de programar, definimos qué pantallas necesita la Plataforma Web y la App Móvil para satisfacer los casos de uso.

* **Pantalla de Inicio (Dashboard):** Vista rápida del estado del Robot y alertas urgentes.  
* **Pantalla de Rutinas/Medicinas:** Gestor visual para agregar horas, nombres de pastillas y frecuencias.  
* **Pantalla de Contactos (Red SOS):** Lista ordenada de a quién llamar en caso de emergencia.

### **Fase 2: Contratos de Datos (Mock JSON) ✅**

Una vez definidas las pantallas, establecemos cómo debe verse la información que las alimenta. Creamos archivos JSON estáticos (Mock Data) que actúan como "contratos" temporales. El Frontend consumirá estos JSONs como si fueran la base de datos real.

### **Fase 3: Construcción de la Interfaz (Prototipado en Código) ✅**

Desarrollo de los componentes visuales (en React/Flutter) utilizando el Mock Data. Aquí probamos la navegación, los formularios y la usabilidad sin necesidad de tener un servidor encendido.

### **Fase 4: Descenso al Backend (Base de Datos) ✅**

Una vez que el frontend funciona perfectamente con datos falsos, analizamos la estructura de esos JSONs y diseñamos las colecciones reales en Firebase/Supabase para que coincidan exactamente con lo que la interfaz ya está esperando consumir.  
