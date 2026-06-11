export const mockElderProfile = {
  name: "Abuelito",
  age: 78,
  condition: "Hipertensión y Leve pérdida de memoria",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80", // Premium avatar placeholder
  deviceStatus: "Conectado",
  room: "Sala Principal"
};

export const mockRobotStatus = {
  name: "Qhawaybot V1",
  serialNumber: "QB-2026-9941",
  online: true,
  battery: 85,
  wifi: "Excelente (5 GHz)",
  connectionSpeed: "120 Mbps",
  mode: "Seguimiento Autónomo",
  lastSync: "Hace menos de un minuto",
  firmware: "v4.0.8-prod",
  sensors: {
    lidar: "Activo",
    sonar: "Activo",
    cameras: "3/3 Activas",
    fallDetection: "Monitoreando"
  }
};

export const mockRoutines = [
  {
    id: 1,
    time: "08:30",
    title: "Medicina de la presión",
    desc: "Tomar Losartán (50mg) con abundante agua",
    status: "completed", // completed, pending, missed
    urgency: "high",
    category: "medicina",
    completedAt: "08:34"
  },
  {
    id: 2,
    time: "10:00",
    title: "Caminata matutina",
    desc: "15 minutos de caminata suave por la sala y el pasillo",
    status: "completed",
    urgency: "medium",
    category: "ejercicio",
    completedAt: "10:15"
  },
  {
    id: 3,
    time: "13:00",
    title: "Almuerzo & Vitaminas",
    desc: "Almuerzo bajo en sodio + Complejo B",
    status: "completed",
    urgency: "high",
    category: "alimentacion",
    completedAt: "13:12"
  },
  {
    id: 4,
    time: "14:00",
    title: "Medicina para la circulación",
    desc: "Tomar Aspirina de 81mg",
    status: "pending",
    urgency: "high",
    category: "medicina"
  },
  {
    id: 5,
    time: "17:00",
    title: "Llamada familiar programada",
    desc: "Qhawaybot iniciará una videollamada automática con los hijos",
    status: "pending",
    urgency: "medium",
    category: "social"
  },
  {
    id: 6,
    time: "21:00",
    title: "Medicina de noche",
    desc: "Tomar Atorvastatina (20mg)",
    status: "pending",
    urgency: "high",
    category: "medicina"
  }
];

export const mockSosContacts = [
  {
    id: 1,
    name: "Dr. Roberto Ramos",
    relation: "Médico Cardiólogo",
    phone: "+51 987 654 321",
    available: true,
  },
  {
    id: 2,
    name: "Hijo",
    relation: "Familiar Administrador",
    phone: "+51 912 345 678",
    available: true,
  },
  {
    id: 3,
    name: "Ambulancias Cruz Roja",
    relation: "Servicio de Emergencia",
    phone: "115 / (01) 234-5678",
    available: true,
  }
];

export const mockElderProfiles = [
  {
    id: 1,
    name: "Abuelito",
    age: 78,
    condition: "Hipertensión y Leve pérdida de memoria",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    deviceStatus: "Conectado",
    room: "Sala Principal"
  },
  {
    id: 2,
    name: "Abuelita Rosa",
    age: 82,
    condition: "Diabetes tipo 2 y artritis",
    avatar: "https://images.unsplash.com/photo-1581579438747-104c53d7fbc4?auto=format&fit=crop&w=256&q=80",
    deviceStatus: "Conectado",
    room: "Habitación Principal"
  }
];

export const mockRoutinesByElder = {
  1: mockRoutines,
  2: [
    {
      id: 1,
      time: "07:30",
      title: "Medición de glucosa",
      desc: "Control de glucosa en ayunas con glucómetro digital",
      status: "completed",
      urgency: "high",
      category: "medicina",
      completedAt: "07:35"
    },
    {
      id: 2,
      time: "08:00",
      title: "Desayuno + Metformina",
      desc: "Desayuno bajo en azúcar y Metformina (850mg)",
      status: "completed",
      urgency: "high",
      category: "alimentacion",
      completedAt: "08:10"
    },
    {
      id: 3,
      time: "11:00",
      title: "Ejercicios de movilidad",
      desc: "Estiramientos suaves para manos y rodillas",
      status: "pending",
      urgency: "medium",
      category: "ejercicio"
    },
    {
      id: 4,
      time: "16:00",
      title: "Medición de presión",
      desc: "Control de presión arterial con tensiómetro digital",
      status: "pending",
      urgency: "medium",
      category: "medicina"
    },
    {
      id: 5,
      time: "20:00",
      title: "Cena + Insulina",
      desc: "Cena ligera y aplicación de insulina nocturna",
      status: "pending",
      urgency: "high",
      category: "medicina"
    }
  ]
};

export const mockVitalsByElder = {
  1: {
    heartRate: 72,
    bloodPressure: "128/82",
    spo2: 97,
    temperature: 36.5,
    sleepHours: 6.5,
    steps: 1240,
    lastUpdated: "Hace 5 minutos"
  },
  2: {
    heartRate: 80,
    bloodPressure: "135/88",
    spo2: 96,
    temperature: 36.7,
    sleepHours: 7.2,
    steps: 860,
    lastUpdated: "Hace 12 minutos"
  }
};

export const mockNotifications = [
  {
    id: 1,
    type: "alert",
    title: "Posible caída detectada",
    message: "Qhawaybot detectó un movimiento brusco en el pasillo. Verificación automática en curso.",
    time: "Hace 8 minutos",
    read: false
  },
  {
    id: 2,
    type: "warning",
    title: "Medicamento pendiente",
    message: "La 'Medicina para la circulación' aún no ha sido confirmada (14:00).",
    time: "Hace 25 minutos",
    read: false
  },
  {
    id: 3,
    type: "warning",
    title: "Batería de sensor baja",
    message: "El sensor de la puerta principal tiene 15% de batería restante.",
    time: "Hace 1 hora",
    read: false
  },
  {
    id: 4,
    type: "success",
    title: "Rutina completada",
    message: "'Caminata matutina' finalizada con éxito.",
    time: "Hace 3 horas",
    read: true
  },
  {
    id: 5,
    type: "info",
    title: "Llamada familiar programada",
    message: "Qhawaybot iniciará una videollamada automática a las 17:00.",
    time: "Hace 4 horas",
    read: true
  }
];
export const mockActivityLogs = [
  {
    id: 1,
    time: "14:15",
    type: "info", // info, warning, success, alert
    message: "Qhawaybot detectó movimiento en la Cocina. El usuario está bebiendo agua."
  },
  {
    id: 2,
    time: "13:12",
    type: "success",
    message: "Recordatorio de Almuerzo & Vitaminas completado con éxito."
  },
  {
    id: 3,
    time: "12:05",
    type: "warning",
    message: "Batería baja en el sensor de puerta. Nivel actual: 15%."
  },
  {
    id: 4,
    time: "10:15",
    type: "success",
    message: "Rutina 'Caminata matutina' guiada por Qhawaybot finalizada."
  },
  {
    id: 5,
    time: "09:40",
    type: "info",
    message: "Qhawaybot evitó un obstáculo (silla) en el pasillo central."
  },
  {
    id: 6,
    time: "08:34",
    type: "success",
    message: "Recordatorio de 'Medicina de la presión' confirmado verbalmente."
  }
];
