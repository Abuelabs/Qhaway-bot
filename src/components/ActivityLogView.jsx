import React, { useState } from 'react';
import { History, Info, CheckCircle2, AlertTriangle, Siren, Clock } from 'lucide-react';
import FilterSelect from './ui/FilterSelect';
import DataTable from './ui/DataTable';
import { useLanguage } from '../context/LanguageContext';

const typeStyles = {
  info: {
    icon: Info,
    badge: 'bg-blue-50 dark:bg-baltic-blue-950 text-blue-600 dark:text-baltic-blue-400',
  },
  success: {
    icon: CheckCircle2,
    badge: 'bg-green-50 dark:bg-verdigris-950 text-green-600 dark:text-verdigris-400',
  },
  warning: {
    icon: AlertTriangle,
    badge: 'bg-yellow-50 dark:bg-chocolate-950 text-yellow-600 dark:text-chocolate-400',
  },
  alert: {
    icon: Siren,
    badge: 'bg-red-50 dark:bg-rose-wine-950 text-red-600 dark:text-rose-wine-400',
  },
};

const getDynamicLogs = () => {
  const today = new Date();
  
  const formatDateStr = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const subtractHours = (d, h) => {
    const copy = new Date(d);
    copy.setTime(copy.getTime() - h * 60 * 60 * 1000);
    return copy;
  };
  
  const subtractDays = (d, days) => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() - days);
    return copy;
  };

  const logs = [
    {
      id: 1,
      timestamp: subtractHours(today, 0.5), // 30 mins ago (ultima hora)
      type: "info",
      message: "Qhawaybot detectó movimiento en la Cocina. El usuario está bebiendo agua."
    },
    {
      id: 2,
      timestamp: subtractHours(today, 1.5), // 1.5 hours ago (hoy)
      type: "success",
      message: "Recordatorio de Almuerzo & Vitaminas completado con éxito."
    },
    {
      id: 3,
      timestamp: subtractHours(today, 4), // 4 hours ago (hoy)
      type: "warning",
      message: "Batería baja en el sensor de puerta. Nivel actual: 15%."
    },
    {
      id: 4,
      timestamp: subtractDays(today, 1), // 1 day ago (ayer)
      type: "success",
      message: "Rutina 'Caminata matutina' guiada por Qhawaybot finalizada."
    },
    {
      id: 5,
      timestamp: subtractDays(today, 3), // 3 days ago (esta semana)
      type: "info",
      message: "Qhawaybot evitó un obstáculo (silla) en el pasillo central."
    },
    {
      id: 6,
      timestamp: subtractDays(today, 8), // 8 days ago (este mes)
      type: "success",
      message: "Recordatorio de 'Medicina de la presión' confirmado verbalmente."
    },
    {
      id: 7,
      timestamp: subtractDays(today, 15), // 15 days ago (este mes)
      type: "alert",
      message: "Alerta SOS: Caída detectada en el baño. Los cuidadores fueron notificados."
    }
  ];
  
  return logs.map(log => {
    const dateStr = formatDateStr(log.timestamp);
    const parts = dateStr.split('-');
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0].substring(2)}`; // DD/MM/YY
    const formattedTime = log.timestamp.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    return {
      ...log,
      date: formattedDate,
      dateRaw: dateStr,
      time: formattedTime
    };
  });
};

export default function ActivityLogView() {
  const { t } = useLanguage();
  const [timeFilter, setTimeFilter] = useState('all');
  const [logs] = useState(getDynamicLogs);

  const filterOptions = [
    { value: 'all', label: 'Todas las actividades' },
    { value: 'last-hour', label: 'Última hora' },
    { value: 'today', label: 'Hoy' },
    { value: 'yesterday', label: 'Ayer' },
    { value: 'this-week', label: 'Esta semana' },
    { value: 'this-month', label: 'Este mes' }
  ];

  const filteredLogs = logs.filter(log => {
    const today = new Date();
    const diffMs = today - log.timestamp;
    
    if (timeFilter === 'last-hour') {
      return diffMs <= 3600000 && diffMs >= 0;
    }
    
    const formatDateStr = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const todayStr = formatDateStr(today);
    
    if (timeFilter === 'today') {
      return log.dateRaw === todayStr;
    }
    
    if (timeFilter === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return log.dateRaw === formatDateStr(yesterday);
    }
    
    if (timeFilter === 'this-week') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoReset = new Date(sevenDaysAgo.getFullYear(), sevenDaysAgo.getMonth(), sevenDaysAgo.getDate());
      return log.timestamp >= sevenDaysAgoReset;
    }
    
    if (timeFilter === 'this-month') {
      return log.timestamp.getMonth() === today.getMonth() && 
             log.timestamp.getFullYear() === today.getFullYear();
    }
    
    return true;
  });

  const columns = [
    {
      key: 'date',
      label: 'Fecha',
      render: (value) => (
        <span className="font-semibold text-slate-700 dark:text-prussian-blue-300 text-xs">
          {value}
        </span>
      )
    },
    {
      key: 'time',
      label: 'Hora',
      render: (value) => (
        <span className="font-bold text-slate-900 dark:text-white text-xs inline-flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          {value}
        </span>
      )
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (value) => {
        const style = typeStyles[value] || typeStyles.info;
        const Icon = style.icon;
        
        let typeLabel = 'Info';
        if (value === 'success') typeLabel = 'Éxito';
        else if (value === 'warning') typeLabel = 'Advertencia';
        else if (value === 'alert') typeLabel = 'Alerta';

        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${style.badge}`}>
            <Icon className="w-3 h-3" />
            {typeLabel}
          </span>
        );
      }
    },
    {
      key: 'message',
      label: 'Mensaje de Actividad',
      render: (value) => (
        <span className="text-xs text-slate-700 dark:text-prussian-blue-200 block max-w-lg leading-relaxed font-semibold">
          {value}
        </span>
      )
    }
  ];

  return (
    <div className="w-full space-y-6">

      {/* View Title & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <History className="w-6 h-6 text-blue-600 dark:text-baltic-blue-400" />
            {t('activity.title')}
          </h2>
          <p className="text-xs text-slate-400 dark:text-prussian-blue-400 mt-0.5">
            {t('activity.subtitle')}
          </p>
        </div>
        <div className="self-end sm:self-center">
          <FilterSelect
            label="Tiempo:"
            options={filterOptions}
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            slim={true}
          />
        </div>
      </div>

      {/* Activities Data Table */}
      <DataTable
        columns={columns}
        data={filteredLogs}
        emptyStateMessage="No se encontraron registros de actividad para este período."
      />

    </div>
  );
}
