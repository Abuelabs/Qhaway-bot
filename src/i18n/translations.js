export const translations = {
  es: {
    nav: {
      admin: 'Admin',
      role: 'Administrador',
      openProfile: 'Abrir perfil',
      notifications: 'Notificaciones',
    },
    notificationsPanel: {
      title: 'Notificaciones',
      markAllRead: 'Marcar todo como leído',
    },
    profile: {
      title: 'Mi Perfil',
      changePhoto: 'Toca el ícono para cambiar tu foto',
      name: 'Nombre',
      namePlaceholder: 'Tu nombre',
      birthdate: 'Fecha de nacimiento',
      appearance: 'Apariencia',
      darkTheme: 'Tema Oscuro',
      lightTheme: 'Tema Claro',
      language: 'Idioma',
      notifications: 'Notificaciones',
      sosAlerts: 'Alertas SOS',
      sosAlertsDesc: 'Avisos inmediatos de emergencia o caídas',
      dailySummary: 'Resumen diario',
      dailySummaryDesc: 'Reporte diario de rutinas y actividad',
      sounds: 'Sonidos de notificación',
      soundsDesc: 'Reproducir un sonido al recibir alertas',
      security: 'Seguridad · PIN de acceso',
      currentPin: 'PIN actual',
      newPin: 'Nuevo PIN',
      confirmPin: 'Confirmar nuevo PIN',
      updatePin: 'Actualizar PIN',
      showPin: 'Mostrar PIN',
      hidePin: 'Ocultar PIN',
      pinFillAll: 'Completa los tres campos para actualizar tu PIN.',
      pinTooShort: 'El nuevo PIN debe tener al menos 4 dígitos.',
      pinMismatch: 'El nuevo PIN y su confirmación no coinciden.',
      pinSuccess: 'PIN actualizado correctamente.',
      save: 'Guardar cambios',
      logout: 'Cerrar sesión',
    },
    dashboard: {
      caringFor: 'Estamos cuidando a',
      subtitle: 'Selecciona un panel a continuación para gestionar los servicios de Qhawaybot.',
      back: 'Volver al Panel Principal',
      cards: {
        rutinas: { title: 'Rutinas', desc: 'Configura tareas, medicamentos y actividades programadas.' },
        contactos: { title: 'Contactos', desc: 'Monitorea números telefónicos y prioridades de alerta SOS.' },
        mensajes: { title: 'Mensajes', desc: 'Envía audios y comunicados de voz directamente al altavoz.' },
        biblioteca: { title: 'Biblioteca', desc: 'Sube audiolibros, lecturas y música de estimulación cognitiva.' },
        robot: { title: 'Estado del Robot', desc: 'Batería, conectividad, sensores y modo actual de Qhawaybot.' },
        salud: { title: 'Salud', desc: 'Revisa los signos vitales registrados por los sensores.' },
        actividad: { title: 'Actividad', desc: 'Historial de eventos y acciones detectadas por Qhawaybot.' },
      },
      placeholders: {
        rutinas: { title: 'Gestión de Rutinas', desc: 'Esta sección está vacía. Pronto podrás programar medicamentos y actividades.' },
        mensajes: { title: 'Mensajería y TTS', desc: 'Esta sección está vacía. Aquí podrás transmitir mensajes de voz.' },
        biblioteca: { title: 'Biblioteca Digital', desc: 'Esta sección está vacía. Próximamente gestionarás audiolibros y música.' },
      },
    },
    contacts: {
      title: 'Contactos de Emergencia SOS',
      subtitle: 'Canales de comunicación priorizados y notificaciones enlazadas a Qhawaybot.',
      activeAlerts: 'Canales de Alerta Activos',
      searchPlaceholder: 'Buscar por nombre o parentesco...',
      filterLabel: 'Filtrar:',
      filters: {
        all: 'Todos los estados',
        disponible: 'Disponible',
        ocupado: 'En llamada / Ocupado',
        'no-disponible': 'No disponible',
      },
      columns: {
        contact: 'Contacto',
        phone: 'Teléfono / Canal',
        status: 'Estado de Conexión',
        priority: 'Prioridad de SOS',
      },
      status: {
        disponible: 'Disponible',
        ocupado: 'Ocupado',
        'no-disponible': 'No Disponible',
      },
      empty: 'No se encontraron contactos que coincidan con la búsqueda.',
    },
    robot: {
      title: 'Estado del Robot',
      online: 'En línea',
      offline: 'Desconectado',
      battery: 'Batería',
      wifi: 'Conexión WiFi',
      mode: 'Modo actual',
      lastSync: 'Última sincronización',
      firmware: 'Firmware',
      sensorsTitle: 'Sensores y Percepción',
      sensors: {
        lidar: 'LIDAR',
        sonar: 'Sonar',
        cameras: 'Cámaras',
        fallDetection: 'Detección de caídas',
      },
    },
    health: {
      title: 'Salud y Bienestar',
      subtitle: 'Signos vitales de {name} registrados por Qhawaybot · Actualizado {time}',
      defaultName: 'tu familiar',
      heartRate: 'Ritmo Cardíaco',
      bloodPressure: 'Presión Arterial',
      spo2: 'Oxígeno en Sangre',
      temperature: 'Temperatura',
      sleep: 'Sueño (anoche)',
      steps: 'Pasos hoy',
      disclaimer: 'Estos datos son referenciales y provienen de los sensores integrados de Qhawaybot. No reemplazan una evaluación médica profesional.',
    },
    activity: {
      title: 'Historial de Actividad',
      subtitle: 'Registro reciente de eventos detectados y acciones de Qhawaybot.',
    },
  },
  en: {
    nav: {
      admin: 'Admin',
      role: 'Administrator',
      openProfile: 'Open profile',
      notifications: 'Notifications',
    },
    notificationsPanel: {
      title: 'Notifications',
      markAllRead: 'Mark all as read',
    },
    profile: {
      title: 'My Profile',
      changePhoto: 'Tap the icon to change your photo',
      name: 'Name',
      namePlaceholder: 'Your name',
      birthdate: 'Date of birth',
      appearance: 'Appearance',
      darkTheme: 'Dark Theme',
      lightTheme: 'Light Theme',
      language: 'Language',
      notifications: 'Notifications',
      sosAlerts: 'SOS Alerts',
      sosAlertsDesc: 'Immediate emergency or fall alerts',
      dailySummary: 'Daily summary',
      dailySummaryDesc: 'Daily report of routines and activity',
      sounds: 'Notification sounds',
      soundsDesc: 'Play a sound when alerts are received',
      security: 'Security · Access PIN',
      currentPin: 'Current PIN',
      newPin: 'New PIN',
      confirmPin: 'Confirm new PIN',
      updatePin: 'Update PIN',
      showPin: 'Show PIN',
      hidePin: 'Hide PIN',
      pinFillAll: 'Fill in all three fields to update your PIN.',
      pinTooShort: 'The new PIN must be at least 4 digits.',
      pinMismatch: 'The new PIN and its confirmation do not match.',
      pinSuccess: 'PIN updated successfully.',
      save: 'Save changes',
      logout: 'Log out',
    },
    dashboard: {
      caringFor: 'We are caring for',
      subtitle: 'Select a panel below to manage Qhawaybot services.',
      back: 'Back to Main Panel',
      cards: {
        rutinas: { title: 'Routines', desc: 'Set up tasks, medications and scheduled activities.' },
        contactos: { title: 'Contacts', desc: 'Monitor phone numbers and SOS alert priorities.' },
        mensajes: { title: 'Messages', desc: 'Send audio and voice messages directly to the speaker.' },
        biblioteca: { title: 'Library', desc: 'Upload audiobooks, readings and cognitive stimulation music.' },
        robot: { title: 'Robot Status', desc: "Battery, connectivity, sensors and Qhawaybot's current mode." },
        salud: { title: 'Health', desc: 'Check the vital signs recorded by the sensors.' },
        actividad: { title: 'Activity', desc: 'History of events and actions detected by Qhawaybot.' },
      },
      placeholders: {
        rutinas: { title: 'Routine Management', desc: 'This section is empty. Soon you will be able to schedule medications and activities.' },
        mensajes: { title: 'Messaging & TTS', desc: 'This section is empty. Here you will be able to broadcast voice messages.' },
        biblioteca: { title: 'Digital Library', desc: 'This section is empty. Soon you will manage audiobooks and music.' },
      },
    },
    contacts: {
      title: 'SOS Emergency Contacts',
      subtitle: 'Prioritized communication channels and notifications linked to Qhawaybot.',
      activeAlerts: 'Active Alert Channels',
      searchPlaceholder: 'Search by name or relationship...',
      filterLabel: 'Filter:',
      filters: {
        all: 'All statuses',
        disponible: 'Available',
        ocupado: 'On call / Busy',
        'no-disponible': 'Unavailable',
      },
      columns: {
        contact: 'Contact',
        phone: 'Phone / Channel',
        status: 'Connection Status',
        priority: 'SOS Priority',
      },
      status: {
        disponible: 'Available',
        ocupado: 'Busy',
        'no-disponible': 'Unavailable',
      },
      empty: 'No contacts found matching your search.',
    },
    robot: {
      title: 'Robot Status',
      online: 'Online',
      offline: 'Offline',
      battery: 'Battery',
      wifi: 'WiFi Connection',
      mode: 'Current mode',
      lastSync: 'Last sync',
      firmware: 'Firmware',
      sensorsTitle: 'Sensors & Perception',
      sensors: {
        lidar: 'LIDAR',
        sonar: 'Sonar',
        cameras: 'Cameras',
        fallDetection: 'Fall detection',
      },
    },
    health: {
      title: 'Health & Wellness',
      subtitle: "Vital signs for {name} recorded by Qhawaybot · Updated {time}",
      defaultName: 'your loved one',
      heartRate: 'Heart Rate',
      bloodPressure: 'Blood Pressure',
      spo2: 'Blood Oxygen',
      temperature: 'Temperature',
      sleep: 'Sleep (last night)',
      steps: 'Steps today',
      disclaimer: "This data is for reference only and comes from Qhawaybot's built-in sensors. It does not replace a professional medical evaluation.",
    },
    activity: {
      title: 'Activity History',
      subtitle: 'Recent log of events detected and actions taken by Qhawaybot.',
    },
  },
};

export function getTranslator(language) {
  const dict = translations[language] || translations.es;
  const fallback = translations.es;

  return function t(path, vars) {
    const segments = path.split('.');

    let value = segments.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), dict);
    if (value === undefined) {
      value = segments.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), fallback);
    }
    if (value === undefined) return path;

    if (vars) {
      return Object.entries(vars).reduce(
        (str, [key, val]) => str.replace(new RegExp(`{${key}}`, 'g'), val),
        value
      );
    }

    return value;
  };
}
