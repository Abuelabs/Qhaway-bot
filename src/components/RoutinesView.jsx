import React, { useState } from 'react';
import SearchBar from './ui/SearchBar';
import FilterSelect from './ui/FilterSelect';
import { supabase } from '../lib/supabaseClient';
import DataTable from './ui/DataTable';
import { CalendarRange, Plus, Edit2, Trash2, Clock, Calendar, Check, X, AlertCircle } from 'lucide-react';
import { generateOccurrences, describeRecurrenceRule } from '../utils/recurrence';

const formatDateToDDMMYY = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const yearShort = parts[0].substring(2);
  const month = parts[1];
  const day = parts[2];
  return `${day}/${month}/${yearShort}`;
};

const parseDDMMYYToDateInput = (ddmmyyStr) => {
  if (!ddmmyyStr) return new Date().toISOString().split('T')[0];
  const parts = ddmmyyStr.split('/');
  if (parts.length !== 3) return new Date().toISOString().split('T')[0];
  const day = parts[0];
  const month = parts[1];
  const yearShort = parts[2];
  const yearFull = `20${yearShort}`;
  return `${yearFull}-${month}-${day}`;
};

const WEEKDAY_MAP = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const getWeekdayStr = (d) => {
  return WEEKDAY_MAP[d.getDay()];
};

const getPresetRule = (presetType, startDateStr) => {
  const dateObj = startDateStr ? new Date(startDateStr + 'T00:00:00') : new Date();
  const weekday = getWeekdayStr(dateObj);
  const dayOfMonth = dateObj.getDate();
  
  switch (presetType) {
    case 'once':
      return {
        frequency: 'daily',
        interval: 1,
        end: { type: 'occurrences', value: 1 }
      };
    case 'daily':
      return {
        frequency: 'daily',
        interval: 1,
        end: { type: 'never' }
      };
    case 'weekly':
      return {
        frequency: 'weekly',
        interval: 1,
        byDays: [weekday],
        end: { type: 'never' }
      };
    case 'monthly':
      return {
        frequency: 'monthly',
        interval: 1,
        byMonthDays: [dayOfMonth],
        end: { type: 'never' }
      };
    case 'yearly':
      return {
        frequency: 'yearly',
        interval: 1,
        end: { type: 'never' }
      };
    default:
      return null;
  }
};

const detectPresetType = (rule, startDateStr) => {
  if (!rule) return 'custom';
  const dateObj = startDateStr ? new Date(startDateStr + 'T00:00:00') : new Date();
  const weekday = getWeekdayStr(dateObj);
  const dayOfMonth = dateObj.getDate();

  const freq = rule.frequency;
  const interval = rule.interval || 1;
  const endType = rule.end?.type || 'never';
  const endValue = rule.end?.value;

  if (freq === 'daily' && interval === 1) {
    if (endType === 'occurrences' && Number(endValue) === 1) {
      return 'once';
    }
    if (endType === 'never' && (!rule.byDays || rule.byDays.length === 0)) {
      return 'daily';
    }
  }
  if (freq === 'weekly' && interval === 1 && endType === 'never') {
    if (rule.byDays && rule.byDays.length === 1 && rule.byDays[0] === weekday) {
      return 'weekly';
    }
  }
  if (freq === 'monthly' && interval === 1 && endType === 'never') {
    if (rule.byMonthDays && rule.byMonthDays.length === 1 && rule.byMonthDays[0] === dayOfMonth) {
      return 'monthly';
    }
  }
  if (freq === 'yearly' && interval === 1 && endType === 'never') {
    return 'yearly';
  }
  return 'custom';
};

const getNextOccurrenceDate = (rule, currentStartDateStr) => {
  if (!rule) return null;
  const currentStart = new Date(currentStartDateStr + 'T00:00:00');
  const tomorrow = new Date(currentStart);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const occurrences = generateOccurrences(rule, tomorrow, 1);
  if (occurrences.length > 0) {
    return occurrences[0].toISOString().split('T')[0];
  }
  return null;
};

export default function RoutinesView({ elderId, routines = [], setRoutines }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [routineToDelete, setRoutineToDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    time: '08:00',
    description: '',
    urgency: 'medium',
    category: 'medicina',
    recurrenceRule: {
      frequency: 'daily',
      interval: 1,
      end: { type: 'never' }
    }
  });
  
  const [activePreset, setActivePreset] = useState('daily');
  const [errors, setErrors] = useState({});

  const categoryFilterOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'medicina', label: 'Medicina' },
    { value: 'ejercicio', label: 'Ejercicio' },
    { value: 'alimentacion', label: 'Alimentación' },
    { value: 'social', label: 'Social' },
    { value: 'general', label: 'General' }
  ];

  const statusFilterOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'pending', label: 'Faltan por hacer' }
  ];

  // Filtering Logic
  const filteredRoutines = routines.filter(routine => {
    const matchesSearch = 
      routine.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      routine.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = 
      categoryFilter === 'all' || 
      routine.category === categoryFilter;

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'pending' && routine.status === 'pending');

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handle open modal for create
  const handleOpenCreate = () => {
    setSelectedRoutine(null);
    const todayStr = new Date().toISOString().split('T')[0];
    setFormData({
      name: '',
      startDate: todayStr,
      endDate: '',
      time: '08:00',
      description: '',
      urgency: 'medium',
      category: 'medicina',
      recurrenceRule: {
        frequency: 'daily',
        interval: 1,
        end: { type: 'never' }
      }
    });
    setActivePreset('daily');
    setErrors({});
    setIsModalOpen(true);
  };

  // Handle open modal for edit
  const handleOpenEdit = (routine) => {
    setSelectedRoutine(routine);
    
    let startVal = routine.startDate;
    if (!startVal) {
      startVal = routine.days && routine.days.includes('/') ? parseDDMMYYToDateInput(routine.days) : new Date().toISOString().split('T')[0];
    } else if (startVal.includes('/')) {
      startVal = parseDDMMYYToDateInput(startVal);
    }
    
    let endVal = routine.endDate;
    if (endVal && endVal.includes('/')) {
      endVal = parseDDMMYYToDateInput(endVal);
    } else if (!endVal) {
      endVal = '';
    }

    let recRule = routine.recurrenceRule;
    if (!recRule) {
      const rep = routine.repeat;
      if (rep === 'nunca' || rep === false) {
        recRule = {
          frequency: 'daily',
          interval: 1,
          end: { type: 'occurrences', value: 1 }
        };
      } else if (rep === 'diariamente') {
        recRule = {
          frequency: 'daily',
          interval: 1,
          end: { type: 'never' }
        };
      } else if (rep === 'semanalmente') {
        recRule = {
          frequency: 'weekly',
          interval: 1,
          byDays: [getWeekdayStr(new Date(startVal + 'T00:00:00'))],
          end: { type: 'never' }
        };
      } else if (rep === 'mensualmente') {
        recRule = {
          frequency: 'monthly',
          interval: 1,
          byMonthDays: [new Date(startVal + 'T00:00:00').getDate()],
          end: { type: 'never' }
        };
      } else {
        recRule = {
          frequency: 'daily',
          interval: 1,
          end: { type: 'never' }
        };
      }
    }

    setFormData({
      name: routine.name,
      startDate: startVal,
      endDate: endVal,
      time: routine.time,
      description: routine.description,
      urgency: routine.urgency || 'medium',
      category: routine.category || 'medicina',
      recurrenceRule: recRule
    });
    
    const preset = detectPresetType(recRule, startVal);
    setActivePreset(preset);
    
    setErrors({});
    setIsModalOpen(true);
  };

  // State modification handlers for the Recurrence Editor
  const handleStartDateChange = (val) => {
    setFormData(prev => {
      const updated = { ...prev, startDate: val };
      if (activePreset === 'weekly') {
        const dateObj = new Date(val + 'T00:00:00');
        const weekday = getWeekdayStr(dateObj);
        updated.recurrenceRule = {
          ...prev.recurrenceRule,
          byDays: [weekday]
        };
      } else if (activePreset === 'monthly') {
        const dateObj = new Date(val + 'T00:00:00');
        const dayOfMonth = dateObj.getDate();
        updated.recurrenceRule = {
          ...prev.recurrenceRule,
          byMonthDays: [dayOfMonth]
        };
      }
      return updated;
    });
  };

  const handleCustomRuleChange = (field, value) => {
    setFormData(prev => {
      const updatedRule = { ...prev.recurrenceRule };
      
      if (field === 'frequency') {
        updatedRule.frequency = value;
        if (value === 'weekly') {
          const startD = new Date(prev.startDate + 'T00:00:00');
          updatedRule.byDays = [getWeekdayStr(startD)];
          delete updatedRule.byMonthDays;
          delete updatedRule.byWeekdayOfMonth;
        } else if (value === 'monthly') {
          const startD = new Date(prev.startDate + 'T00:00:00');
          updatedRule.byMonthDays = [startD.getDate()];
          delete updatedRule.byDays;
          delete updatedRule.byWeekdayOfMonth;
        } else {
          delete updatedRule.byDays;
          delete updatedRule.byMonthDays;
          delete updatedRule.byWeekdayOfMonth;
        }
      } else if (field === 'interval') {
        updatedRule.interval = value;
      } else if (field === 'end') {
        updatedRule.end = value;
      }

      return {
        ...prev,
        recurrenceRule: updatedRule
      };
    });
  };

  const handleWeeklyDayToggle = (dayId) => {
    setFormData(prev => {
      const currentDays = prev.recurrenceRule?.byDays || [];
      const updatedDays = currentDays.includes(dayId)
        ? currentDays.filter(d => d !== dayId)
        : [...currentDays, dayId];
      
      return {
        ...prev,
        recurrenceRule: {
          ...prev.recurrenceRule,
          byDays: updatedDays
        }
      };
    });
  };

  const handleMonthlyTypeChange = (type) => {
    setFormData(prev => {
      const updatedRule = { ...prev.recurrenceRule };
      const startD = new Date(prev.startDate + 'T00:00:00');
      
      if (type === 'dayOfMonth') {
        updatedRule.byMonthDays = [startD.getDate()];
        delete updatedRule.byWeekdayOfMonth;
      } else {
        const weekday = getWeekdayStr(startD);
        const occurrence = Math.floor((startD.getDate() - 1) / 7) + 1;
        updatedRule.byWeekdayOfMonth = [{ weekday, occurrence }];
        delete updatedRule.byMonthDays;
      }
      
      return {
        ...prev,
        recurrenceRule: updatedRule
      };
    });
  };

  const handleMonthlyDayToggle = (dayNum) => {
    setFormData(prev => {
      const currentMonthDays = prev.recurrenceRule?.byMonthDays || [];
      const updatedMonthDays = currentMonthDays.includes(dayNum)
        ? currentMonthDays.filter(d => d !== dayNum)
        : [...currentMonthDays, dayNum];
        
      return {
        ...prev,
        recurrenceRule: {
          ...prev.recurrenceRule,
          byMonthDays: updatedMonthDays
        }
      };
    });
  };

  const handleRelativeWeekdayChange = (field, value) => {
    setFormData(prev => {
      const currentRel = prev.recurrenceRule?.byWeekdayOfMonth?.[0] || { occurrence: 1, weekday: 'mon' };
      const updatedRel = { ...currentRel, [field]: value };
      
      return {
        ...prev,
        recurrenceRule: {
          ...prev.recurrenceRule,
          byWeekdayOfMonth: [updatedRel]
        }
      };
    });
  };

  const handleEndTypeChange = (typeId) => {
    setFormData(prev => {
      const updatedRule = { ...prev.recurrenceRule };
      
      if (typeId === 'never') {
        updatedRule.end = { type: 'never' };
      } else if (typeId === 'date') {
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 30);
        const defaultStr = defaultDate.toISOString().split('T')[0];
        updatedRule.end = { type: 'date', value: defaultStr };
      } else if (typeId === 'occurrences') {
        updatedRule.end = { type: 'occurrences', value: 10 };
      }
      
      return {
        ...prev,
        recurrenceRule: updatedRule
      };
    });
  };

  const handlePresetClick = (presetId) => {
    setActivePreset(presetId);
    if (presetId !== 'custom') {
      const newRule = getPresetRule(presetId, formData.startDate);
      setFormData(prev => ({
        ...prev,
        recurrenceRule: newRule
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        recurrenceRule: {
          ...prev.recurrenceRule,
          frequency: prev.recurrenceRule?.frequency || 'daily',
          interval: prev.recurrenceRule?.interval || 1,
          end: prev.recurrenceRule?.end || { type: 'never' }
        }
      }));
    }
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la rutina es requerido.';
    }
    if (!formData.time) {
      newErrors.time = 'La hora de la rutina es requerida.';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida.';
    }

    const rule = formData.recurrenceRule;
    if (rule) {
      if (rule.interval === undefined || rule.interval < 1) {
        newErrors.interval = 'El intervalo debe ser mayor o igual a 1.';
      }
      
      if (rule.frequency === 'weekly') {
        if (!rule.byDays || rule.byDays.length === 0) {
          newErrors.byDays = 'Debes seleccionar al menos un día de la semana.';
        }
      }
      
      if (rule.frequency === 'monthly') {
        if ((!rule.byMonthDays || rule.byMonthDays.length === 0) && (!rule.byWeekdayOfMonth || rule.byWeekdayOfMonth.length === 0)) {
          newErrors.monthly = 'Debes configurar el día del mes o el día de la semana relativo.';
        }
      }
      
      if (rule.end?.type === 'date' && !rule.end.value) {
        newErrors.endValue = 'La fecha de finalización es requerida.';
      }
      
      if (rule.end?.type === 'occurrences' && (!rule.end.value || Number(rule.end.value) < 1)) {
        newErrors.endValue = 'La cantidad de veces debe ser mayor o igual a 1.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const startFormatted = formatDateToDDMMYY(formData.startDate);

    const updatedData = {
      name: formData.name,
      time: formData.time,
      description: formData.description,
      urgency: formData.urgency,
      category: formData.category,
      startDate: formData.startDate,
      endDate: formData.endDate || null,
      recurrenceRule: formData.recurrenceRule,
      days: startFormatted, // backwards-compatible date string
      repeat: describeRecurrenceRule(formData.recurrenceRule) // backwards-compatible text
    };

    if (selectedRoutine) {
      // Edit Routine in Supabase
      supabase.from('routines').update({
        name: updatedData.name,
        description: updatedData.description,
        repeat: updatedData.repeat,
        recurrence_rule: updatedData.recurrenceRule,
        start_date: updatedData.startDate,
        end_date: updatedData.endDate,
        time: updatedData.time,
        urgency: updatedData.urgency,
        category: updatedData.category
      }).eq('id', selectedRoutine.id).then(({ error }) => {
        if (error) console.error('Error updating routine in Supabase:', error);
      });

      // Update locally
      setRoutines(prev => prev.map(r => r.id === selectedRoutine.id ? {
        ...r,
        ...updatedData
      } : r));
    } else {
      // Create Routine in Supabase
      const tempId = crypto.randomUUID(); // Temporary local UUID before DB returns it, or just use UUID directly
      supabase.from('routines').insert({
        id: tempId,
        elder_id: elderId,
        name: updatedData.name,
        description: updatedData.description,
        repeat: updatedData.repeat,
        recurrence_rule: updatedData.recurrenceRule,
        start_date: updatedData.startDate,
        end_date: updatedData.endDate,
        time: updatedData.time,
        status: 'pending',
        urgency: updatedData.urgency,
        category: updatedData.category
      }).then(({ error }) => {
        if (error) console.error('Error inserting routine in Supabase:', error);
      });

      // Update locally
      setRoutines(prev => [...prev, {
        id: tempId,
        status: 'pending',
        ...updatedData
      }]);
    }

    setIsModalOpen(false);
  };

  // Delete Routine
  const handleOpenDelete = (routine) => {
    setRoutineToDelete(routine);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (routineToDelete) {
      // Delete in Supabase
      supabase.from('routines').delete().eq('id', routineToDelete.id).then(({ error }) => {
        if (error) console.error('Error deleting routine from Supabase:', error);
      });

      // Delete locally
      setRoutines(prev => prev.filter(r => r.id !== routineToDelete.id));
      setIsDeleteOpen(false);
      setRoutineToDelete(null);
    }
  };

  // Toggle routine complete status
  const handleToggleStatus = (routine) => {
    const nextStatus = routine.status === 'completed' ? 'pending' : 'completed';
    const completedAtVal = nextStatus === 'completed' 
      ? new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false }) 
      : null;

    // Update in Supabase
    supabase.from('routines').update({
      status: nextStatus,
      completed_at: nextStatus === 'completed' ? new Date().toISOString() : null
    }).eq('id', routine.id).then(({ error }) => {
      if (error) console.error('Error toggling routine status in Supabase:', error);
    });

    setRoutines(prev => {
      // 1. Toggle status of current routine
      let nextRoutines = prev.map(r => r.id === routine.id ? {
        ...r,
        status: nextStatus,
        completedAt: completedAtVal
      } : r);

      // 2. If it was completed, check if we need to spawn the next occurrence
      if (nextStatus === 'completed' && routine.recurrenceRule) {
        const nextDate = getNextOccurrenceDate(routine.recurrenceRule, routine.startDate);
        if (nextDate) {
          const alreadyExists = prev.some(r => 
            r.name === routine.name && 
            r.time === routine.time && 
            r.startDate === nextDate
          );
          
          if (!alreadyExists) {
            const nextId = crypto.randomUUID();
            
            // Insert next occurrence in Supabase
            supabase.from('routines').insert({
              id: nextId,
              elder_id: elderId,
              name: routine.name,
              description: routine.description,
              repeat: routine.repeat,
              recurrence_rule: routine.recurrenceRule,
              start_date: nextDate,
              end_date: routine.endDate || null,
              time: routine.time,
              status: 'pending',
              urgency: routine.urgency || 'medium',
              category: routine.category || 'general'
            }).then(({ error }) => {
              if (error) console.error('Error inserting next occurrence in Supabase:', error);
            });

            const startFormatted = formatDateToDDMMYY(nextDate);
            nextRoutines.push({
              id: nextId,
              name: routine.name,
              time: routine.time,
              description: routine.description,
              status: 'pending',
              urgency: routine.urgency || 'medium',
              category: routine.category || 'general',
              startDate: nextDate,
              endDate: routine.endDate || null,
              recurrenceRule: routine.recurrenceRule,
              days: startFormatted,
              repeat: routine.repeat
            });
          }
        }
      }

      return nextRoutines;
    });
  };

  // Columns for the DataTable
  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (value) => (
        <span className="text-slate-400 dark:text-prussian-blue-500 font-mono text-xs select-none">#{value}</span>
      )
    },
    {
      key: 'name',
      label: 'Nombre de Rutina',
      render: (value, row) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const isOverdue = row.startDate && row.startDate < todayStr && row.status !== 'completed';
        return (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleToggleStatus(row)}
              className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
                row.status === 'completed'
                  ? 'bg-red-600 border-red-600 text-white'
                  : isOverdue
                    ? 'border-amber-400 dark:border-amber-600 hover:border-red-500 bg-amber-50 dark:bg-amber-950/20'
                    : 'border-slate-300 dark:border-prussian-blue-600 hover:border-red-500 bg-white dark:bg-prussian-blue-800'
              }`}
              title={row.status === 'completed' ? 'Marcar como activa' : 'Marcar como completada/deshabilitada'}
            >
              {row.status === 'completed' && <X className="w-3.5 h-3.5" />}
            </button>
            <div className="flex flex-col">
              <span className={`font-bold block tracking-tight ${row.status === 'completed' ? 'line-through text-slate-400 dark:text-prussian-blue-500 font-medium' : 'text-slate-900 dark:text-white'}`}>
                {value}
              </span>
              {isOverdue && (
                <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded-sm bg-amber-100 dark:bg-amber-900/50 text-[10px] text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider leading-none w-fit">
                  No Cumplido (Atrasado)
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'category',
      label: 'Categoría',
      render: (value, row) => {
        const isMed = value === 'medicina';
        const isExer = value === 'ejercicio';
        const isFood = value === 'alimentacion';
        const isSocial = value === 'social';
        
        let colorClass = 'bg-slate-100 text-slate-700 dark:bg-prussian-blue-800 dark:text-prussian-blue-300';
        if (isMed) colorClass = 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-wine-950 dark:text-rose-wine-300 dark:border-rose-wine-800';
        else if (isExer) colorClass = 'bg-sky-50 text-sky-700 border border-sky-100 dark:bg-baltic-blue-950 dark:text-baltic-blue-300 dark:border-baltic-blue-800';
        else if (isFood) colorClass = 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-chocolate-950 dark:text-chocolate-300 dark:border-chocolate-800';
        else if (isSocial) colorClass = 'bg-violet-50 text-violet-700 border border-violet-100 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800';

        return (
          <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${colorClass} ${row.status === 'completed' ? 'opacity-60' : ''}`}>
            {value || 'general'}
          </span>
        );
      }
    },
    {
      key: 'recurrenceRule',
      label: 'Recurrencia',
      render: (_, row) => {
        const desc = describeRecurrenceRule(row.recurrenceRule);
        const isOnce = row.recurrenceRule?.end?.type === 'occurrences' && Number(row.recurrenceRule?.end?.value) === 1;
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
            !isOnce 
              ? 'bg-green-50 text-green-700 border-green-100 dark:bg-verdigris-950 dark:text-verdigris-400 dark:border-verdigris-800' 
              : 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-prussian-blue-800 dark:text-prussian-blue-300 dark:border-prussian-blue-700'
          }`}>
            {desc}
          </span>
        );
      }
    },
    {
      key: 'startDate',
      label: 'Fecha Inicio',
      render: (value, row) => {
        const displayVal = row.startDate ? formatDateToDDMMYY(row.startDate) : row.days;
        return (
          <span className="font-semibold text-xs text-slate-700 dark:text-prussian-blue-300">
            {displayVal}
          </span>
        );
      }
    },
    {
      key: 'endDate',
      label: 'Fecha Cierre',
      render: (value, row) => {
        const displayVal = row.endDate ? formatDateToDDMMYY(row.endDate) : (row.recurrenceRule?.end?.type === 'date' && row.recurrenceRule.end.value ? formatDateToDDMMYY(row.recurrenceRule.end.value) : 'Nunca');
        return (
          <span className="font-semibold text-xs text-slate-700 dark:text-prussian-blue-300">
            {displayVal}
          </span>
        );
      }
    },
    {
      key: 'time',
      label: 'Hora',
      render: (value, row) => (
        <span className={`inline-flex items-center gap-1 text-sm font-bold ${row.status === 'completed' ? 'text-slate-400 dark:text-prussian-blue-500' : 'text-slate-900 dark:text-white'}`}>
          <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-baltic-blue-400" />
          {value}
        </span>
      )
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (value, row) => (
        <span className={`text-xs block max-w-xs leading-relaxed ${row.status === 'completed' ? 'text-slate-400 dark:text-prussian-blue-500 font-normal' : 'text-slate-500 dark:text-prussian-blue-300 font-medium'}`}>
          {value || <span className="italic text-slate-300 dark:text-prussian-blue-600">Sin descripción</span>}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-prussian-blue-800 text-slate-500 dark:text-prussian-blue-400 hover:text-blue-600 dark:hover:text-baltic-blue-400 rounded-xl transition cursor-pointer"
            title="Editar Rutina"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-rose-wine-950 text-slate-500 dark:text-prussian-blue-400 hover:text-red-600 dark:hover:text-rose-wine-400 rounded-xl transition cursor-pointer"
            title="Eliminar Rutina"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  let previewOccurrences = [];
  try {
    if (formData.startDate && formData.recurrenceRule) {
      const startD = new Date(formData.startDate + 'T00:00:00');
      previewOccurrences = generateOccurrences(formData.recurrenceRule, startD, 5);
    }
  } catch (err) {
    console.error("Error computing occurrences preview", err);
  }

  const formatOccurDate = (d) => {
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const dayName = dayNames[d.getDay()];
    const day = d.getDate();
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    
    return `${dayName}, ${day} de ${month} de ${year}`;
  };


  return (
    <div className="w-full space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <CalendarRange className="w-6 h-6 text-blue-600 dark:text-baltic-blue-400" />
            Gestión de Rutinas Diarias
          </h2>
          <p className="text-xs text-slate-400 dark:text-prussian-blue-400 mt-0.5">
            Configura las alarmas, medicamentos y recordatorios autónomos que Qhawaybot emitirá.
          </p>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-xs hover:shadow-md hover:-translate-y-0.5 transition duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nueva Rutina
        </button>
      </div>

      {/* Control Panel (Filters and Search) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-prussian-blue-800/40 border border-slate-100 dark:border-prussian-blue-800 p-4 rounded-3xl shadow-xs">
        <SearchBar 
          placeholder="Buscar por nombre o descripción..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <FilterSelect 
            label="Categoría:"
            options={categoryFilterOptions}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
          <FilterSelect 
            label="Estado:"
            options={statusFilterOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable 
        columns={columns} 
        data={filteredRoutines} 
        emptyStateMessage="No se encontraron rutinas registradas."
        getRowClassName={(row) => {
          if (row.startDate && row.status !== 'completed') {
            const todayStr = new Date().toISOString().split('T')[0];
            if (row.startDate < todayStr) {
              return 'bg-amber-50/50 dark:bg-amber-950/20 text-slate-900 dark:text-amber-200 hover:bg-amber-100/40 dark:hover:bg-amber-950/30';
            }
          }
          return '';
        }}
      />

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-prussian-blue-900 border border-slate-100 dark:border-prussian-blue-800 rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-50 dark:bg-prussian-blue-800/40 border-b border-slate-100 dark:border-prussian-blue-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-blue-600 dark:text-baltic-blue-400" />
                {selectedRoutine ? 'Editar Rutina' : 'Nueva Rutina'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 dark:text-prussian-blue-400 hover:text-slate-700 dark:hover:text-white p-1 hover:bg-slate-200/50 dark:hover:bg-prussian-blue-700/50 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm text-slate-600 dark:text-prussian-blue-300 overflow-y-auto flex-1">
              
              {/* Routine Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-prussian-blue-400 uppercase tracking-wider">
                  Nombre de la Rutina *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Medicina de la presión, Caminata, etc."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full bg-white dark:bg-prussian-blue-800 border rounded-2xl px-4 py-2.5 text-slate-800 dark:text-prussian-blue-100 outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 dark:focus:border-baltic-blue-500 transition ${
                    errors.name ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-prussian-blue-700'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs flex items-center gap-1 mt-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Time and Category Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Time */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 dark:text-prussian-blue-400 uppercase tracking-wider">
                    Hora de ejecución *
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className={`w-full bg-white dark:bg-prussian-blue-800 border rounded-2xl px-4 py-2.5 text-slate-800 dark:text-prussian-blue-100 outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 dark:focus:border-baltic-blue-500 transition ${
                        errors.time ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-prussian-blue-700'
                      }`}
                    />
                  </div>
                  {errors.time && (
                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.time}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 dark:text-prussian-blue-400 uppercase tracking-wider">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 rounded-2xl px-4 py-2.5 text-slate-800 dark:text-prussian-blue-100 outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 dark:focus:border-baltic-blue-500 transition cursor-pointer"
                  >
                    <option value="medicina">Medicina</option>
                    <option value="ejercicio">Ejercicio</option>
                    <option value="alimentacion">Alimentación</option>
                    <option value="social">Social</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              {/* Date Range Selection */}
              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 dark:text-prussian-blue-400 uppercase tracking-wider">
                    Fecha de Inicio *
                  </label>
                  <input 
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className={`w-full bg-white dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 rounded-2xl px-4 py-2.5 text-slate-800 dark:text-prussian-blue-100 outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 dark:focus:border-baltic-blue-500 transition ${
                      errors.startDate ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-prussian-blue-700'
                    }`}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.startDate}
                    </p>
                  )}
                </div>

                {/* End Date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 dark:text-prussian-blue-400 uppercase tracking-wider">
                    Fecha de Cierre (Opcional)
                  </label>
                  <input 
                    type="date"
                    value={formData.endDate}
                    min={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-white dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 rounded-2xl px-4 py-2.5 text-slate-800 dark:text-prussian-blue-100 outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 dark:focus:border-baltic-blue-500 transition border-slate-200 dark:border-prussian-blue-700"
                  />
                </div>
              </div>

              {/* Presets Grid Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 dark:text-prussian-blue-400 uppercase tracking-wider">
                  Patrón de Repetición (Presets)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'once', label: 'Una vez' },
                    { id: 'daily', label: 'Diario' },
                    { id: 'weekly', label: 'Semanal' },
                    { id: 'monthly', label: 'Mensual' },
                    { id: 'yearly', label: 'Anual' },
                    { id: 'custom', label: 'Personalizado...' }
                  ].map((preset) => {
                    const isSelected = activePreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handlePresetClick(preset.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'bg-slate-50 dark:bg-prussian-blue-800 border-slate-200 dark:border-prussian-blue-700 text-slate-700 dark:text-prussian-blue-200 hover:bg-slate-100 dark:hover:bg-prussian-blue-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Advanced Custom Section */}
              {activePreset === 'custom' && (
                <div className="bg-slate-50 dark:bg-prussian-blue-900 border border-slate-100 dark:border-prussian-blue-800 rounded-2xl p-4 space-y-4">
                  
                  {/* Frequency Selection & Interval */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Frequency dropdown */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 dark:text-prussian-blue-400 uppercase tracking-wider">
                        Frecuencia
                      </label>
                      <select
                        value={formData.recurrenceRule?.frequency || 'daily'}
                        onChange={(e) => handleCustomRuleChange('frequency', e.target.value)}
                        className="w-full bg-white dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 rounded-xl px-3 py-2 text-slate-800 dark:text-prussian-blue-100 outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition cursor-pointer"
                      >
                        <option value="daily">Diaria</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                        <option value="yearly">Anual</option>
                      </select>
                    </div>

                    {/* Interval field */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 dark:text-prussian-blue-400 uppercase tracking-wider">
                        Repetir cada
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={formData.recurrenceRule?.interval || 1}
                          onChange={(e) => handleCustomRuleChange('interval', parseInt(e.target.value) || 1)}
                          className="w-20 bg-white dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 rounded-xl px-3 py-2 text-slate-800 dark:text-prussian-blue-100 outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition text-center"
                        />
                        <span className="text-xs text-slate-500 dark:text-prussian-blue-300 font-bold uppercase tracking-wide">
                          {formData.recurrenceRule?.frequency === 'daily' && 'días'}
                          {formData.recurrenceRule?.frequency === 'weekly' && 'semanas'}
                          {formData.recurrenceRule?.frequency === 'monthly' && 'meses'}
                          {formData.recurrenceRule?.frequency === 'yearly' && 'años'}
                        </span>
                      </div>
                      {errors.interval && (
                        <p className="text-red-500 text-xs flex items-center gap-1 mt-1 font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.interval}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Weekly sub-options */}
                  {formData.recurrenceRule?.frequency === 'weekly' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 dark:text-prussian-blue-400 uppercase tracking-wider">
                        Repetir los días
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: 'mon', label: 'Lu' },
                          { id: 'tue', label: 'Ma' },
                          { id: 'wed', label: 'Mi' },
                          { id: 'thu', label: 'Ju' },
                          { id: 'fri', label: 'Vi' },
                          { id: 'sat', label: 'Sá' },
                          { id: 'sun', label: 'Do' }
                        ].map((day) => {
                          const isChecked = formData.recurrenceRule?.byDays?.includes(day.id);
                          return (
                            <button
                              key={day.id}
                              type="button"
                              onClick={() => handleWeeklyDayToggle(day.id)}
                              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all border flex items-center justify-center cursor-pointer ${
                                isChecked
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                                  : 'bg-white dark:bg-prussian-blue-800 border-slate-200 dark:border-prussian-blue-700 text-slate-600 dark:text-prussian-blue-200 hover:bg-slate-50'
                              }`}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                      {errors.byDays && (
                        <p className="text-red-500 text-xs flex items-center gap-1 mt-1 font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.byDays}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Monthly sub-options */}
                  {formData.recurrenceRule?.frequency === 'monthly' && (
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-500 dark:text-prussian-blue-400 uppercase tracking-wider">
                        Configuración Mensual
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 dark:text-prussian-blue-300">
                          <input
                            type="radio"
                            name="monthlyType"
                            checked={!formData.recurrenceRule?.byWeekdayOfMonth}
                            onChange={() => handleMonthlyTypeChange('dayOfMonth')}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          Día del mes
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 dark:text-prussian-blue-300">
                          <input
                            type="radio"
                            name="monthlyType"
                            checked={!!formData.recurrenceRule?.byWeekdayOfMonth}
                            onChange={() => handleMonthlyTypeChange('relativeWeekday')}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          Día relativo
                        </label>
                      </div>

                      {!formData.recurrenceRule?.byWeekdayOfMonth ? (
                        <div className="space-y-2">
                          <span className="text-xs text-slate-500 dark:text-prussian-blue-400 block font-semibold">Días del mes:</span>
                          <div className="grid grid-cols-7 gap-1 bg-white dark:bg-prussian-blue-800 p-2 rounded-xl border border-slate-200 dark:border-prussian-blue-700">
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((dayNum) => {
                              const isSelected = formData.recurrenceRule?.byMonthDays?.includes(dayNum);
                              return (
                                <button
                                  key={dayNum}
                                  type="button"
                                  onClick={() => handleMonthlyDayToggle(dayNum)}
                                  className={`w-7 h-7 rounded-lg text-[10px] font-extrabold flex items-center justify-center transition cursor-pointer border ${
                                    isSelected
                                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                                      : 'bg-transparent border-transparent text-slate-600 dark:text-prussian-blue-200 hover:bg-slate-100 dark:hover:bg-prussian-blue-700'
                                  }`}
                                >
                                  {dayNum}
                                </button>
                              );
                            })}
                          </div>
                          {errors.monthly && (
                            <p className="text-red-500 text-xs flex items-center gap-1 mt-1 font-semibold">
                              <AlertCircle className="w-3.5 h-3.5" /> {errors.monthly}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <select
                            value={formData.recurrenceRule?.byWeekdayOfMonth?.[0]?.occurrence || 1}
                            onChange={(e) => handleRelativeWeekdayChange('occurrence', parseInt(e.target.value))}
                            className="flex-1 bg-white dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 rounded-xl px-2.5 py-2 text-xs text-slate-800 dark:text-prussian-blue-100 cursor-pointer"
                          >
                            <option value="1">El 1er</option>
                            <option value="2">El 2do</option>
                            <option value="3">El 3er</option>
                            <option value="4">El 4to</option>
                            <option value="5">El 5to</option>
                          </select>
                          <select
                            value={formData.recurrenceRule?.byWeekdayOfMonth?.[0]?.weekday || 'mon'}
                            onChange={(e) => handleRelativeWeekdayChange('weekday', e.target.value)}
                            className="flex-1 bg-white dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 rounded-xl px-2.5 py-2 text-xs text-slate-800 dark:text-prussian-blue-100 cursor-pointer"
                          >
                            <option value="mon">Lunes</option>
                            <option value="tue">Martes</option>
                            <option value="wed">Miércoles</option>
                            <option value="thu">Jueves</option>
                            <option value="fri">Viernes</option>
                            <option value="sat">Sábado</option>
                            <option value="sun">Domingo</option>
                          </select>
                          <span className="self-center text-xs text-slate-500 dark:text-prussian-blue-400 font-semibold">del mes</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* End conditions */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-prussian-blue-800">
                    <label className="block text-xs font-bold text-slate-500 dark:text-prussian-blue-400 uppercase tracking-wider">
                      Terminar Repetición
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'never', label: 'Nunca' },
                        { id: 'date', label: 'En la fecha' },
                        { id: 'occurrences', label: 'Después de...' }
                      ].map((type) => {
                        const isSelected = formData.recurrenceRule?.end?.type === type.id;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => handleEndTypeChange(type.id)}
                            className={`py-1.5 px-2.5 rounded-lg text-xs font-bold border transition cursor-pointer text-center ${
                              isSelected
                                ? 'bg-slate-700 dark:bg-slate-200 border-slate-700 dark:border-slate-200 text-white dark:text-slate-900 shadow-xs'
                                : 'bg-white dark:bg-prussian-blue-800 border-slate-200 dark:border-prussian-blue-700 text-slate-600 dark:text-prussian-blue-200 hover:bg-slate-50'
                            }`}
                          >
                            {type.label}
                          </button>
                        );
                      })}
                    </div>

                    {formData.recurrenceRule?.end?.type === 'date' && (
                      <div className="space-y-1 mt-2">
                        <input
                          type="date"
                          value={formData.recurrenceRule?.end?.value || ''}
                          min={formData.startDate}
                          onChange={(e) => handleCustomRuleChange('end', { type: 'date', value: e.target.value })}
                          className={`w-full bg-white dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-prussian-blue-100 ${
                            errors.endValue ? 'border-red-500 focus:ring-red-500/20' : ''
                          }`}
                        />
                        {errors.endValue && (
                          <p className="text-red-500 text-xs flex items-center gap-1 mt-1 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.endValue}
                          </p>
                        )}
                      </div>
                    )}

                    {formData.recurrenceRule?.end?.type === 'occurrences' && (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="number"
                          min="1"
                          value={formData.recurrenceRule?.end?.value || ''}
                          placeholder="10"
                          onChange={(e) => handleCustomRuleChange('end', { type: 'occurrences', value: parseInt(e.target.value) || '' })}
                          className={`w-20 bg-white dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-prussian-blue-100 text-center ${
                            errors.endValue ? 'border-red-500 focus:ring-red-500/20' : ''
                          }`}
                        />
                        <span className="text-xs text-slate-500 dark:text-prussian-blue-300 font-bold uppercase tracking-wide">ocurrencias / veces</span>
                        {errors.endValue && (
                          <p className="text-red-500 text-xs flex items-center gap-1 mt-1 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.endValue}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* Occurrences Preview Panel */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-500 dark:text-prussian-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  Próximas 5 Ocurrencias (Vista Previa)
                </label>
                {previewOccurrences.length > 0 ? (
                  <div className="bg-slate-50 dark:bg-prussian-blue-900 border border-slate-100 dark:border-prussian-blue-800 rounded-2xl p-3.5 space-y-1.5 shadow-inner">
                    {previewOccurrences.map((occ, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-prussian-blue-200">
                        <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-baltic-blue-950 text-blue-600 dark:text-baltic-blue-400 flex items-center justify-center text-[10px] font-extrabold select-none">
                          {idx + 1}
                        </div>
                        <span>{formatOccurDate(occ)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-prussian-blue-900 border border-dashed border-slate-200 dark:border-prussian-blue-800 rounded-2xl p-4 text-center text-xs italic text-slate-400">
                    No hay ocurrencias futuras programadas con estas reglas.
                  </div>
                )}
              </div>


              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-prussian-blue-400 uppercase tracking-wider">
                  Descripción / Instrucciones
                </label>
                <textarea
                  placeholder="Detalles de la rutina (ej. Dosis, lugar, detalles adicionales)..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-white dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 rounded-2xl px-4 py-2.5 text-slate-800 dark:text-prussian-blue-100 outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 dark:focus:border-baltic-blue-500 transition resize-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-prussian-blue-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-prussian-blue-800 hover:bg-slate-200 dark:hover:bg-prussian-blue-700 text-slate-600 dark:text-prussian-blue-300 hover:text-slate-800 dark:hover:text-white rounded-2xl text-xs font-bold transition duration-150 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-xs hover:shadow-md transition duration-150 cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-prussian-blue-900 border border-slate-100 dark:border-prussian-blue-800 rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-scale-in p-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2 tracking-tight flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              ¿Confirmar eliminación?
            </h3>
            <p className="text-xs text-slate-500 dark:text-prussian-blue-300 leading-relaxed mb-6">
              ¿Estás seguro de que deseas eliminar la rutina <span className="font-bold text-slate-800 dark:text-white">"{routineToDelete?.name}"</span>? Esta acción no se puede deshacer y Qhawaybot dejará de emitir este recordatorio.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-prussian-blue-800 hover:bg-slate-200 dark:hover:bg-prussian-blue-700 text-slate-600 dark:text-prussian-blue-300 hover:text-slate-800 dark:hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                No, cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
