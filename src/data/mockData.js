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
