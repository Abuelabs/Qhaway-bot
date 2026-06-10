import React, { useState } from 'react';
import SearchBar from './ui/SearchBar';
import FilterSelect from './ui/FilterSelect';
import DataTable from './ui/DataTable';
import { CalendarRange, Plus, Edit2, Trash2, Clock, Calendar, Check, X, AlertCircle } from 'lucide-react';

const WEEKDAYS = [
  { key: 'Lu', label: 'L' },
  { key: 'Ma', label: 'M' },
  { key: 'Mi', label: 'M' },
  { key: 'Ju', label: 'J' },
  { key: 'Vi', label: 'V' },
  { key: 'Sá', label: 'S' },
  { key: 'Do', label: 'D' }
];

export default function RoutinesView({ routines = [], setRoutines }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [repeatFilter, setRepeatFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [routineToDelete, setRoutineToDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    repeat: true,
    selectedDays: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'], // default to all
    time: '',
    description: '',
    urgency: 'medium',
    category: 'medicina'
  });
  
  const [errors, setErrors] = useState({});

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'repeat', label: 'Repetitivas' },
    { value: 'once', label: 'No repetitivas' }
  ];

  const categoryFilterOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'medicina', label: 'Medicina' },
    { value: 'ejercicio', label: 'Ejercicio' },
    { value: 'alimentacion', label: 'Alimentación' },
    { value: 'social', label: 'Social' },
    { value: 'general', label: 'General' }
  ];

  // Filtering Logic
  const filteredRoutines = routines.filter(routine => {
    const matchesSearch = 
      routine.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      routine.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesRepeat = 
      repeatFilter === 'all' || 
      (repeatFilter === 'repeat' && routine.repeat) || 
      (repeatFilter === 'once' && !routine.repeat);

    const matchesCategory = 
      categoryFilter === 'all' || 
      routine.category === categoryFilter;

    return matchesSearch && matchesRepeat && matchesCategory;
  });

  // Handle open modal for create
  const handleOpenCreate = () => {
    setSelectedRoutine(null);
    setFormData({
      name: '',
      repeat: true,
      selectedDays: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'],
      time: '08:00',
      description: '',
      urgency: 'medium',
      category: 'medicina'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Handle open modal for edit
  const handleOpenEdit = (routine) => {
    setSelectedRoutine(routine);
    
    // Parse days
    let daysArr = [];
    if (routine.days === 'Todos los días') {
      daysArr = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
    } else if (routine.days === 'Lunes a Viernes') {
      daysArr = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi'];
    } else if (routine.days === 'Fines de semana') {
      daysArr = ['Sá', 'Do'];
    } else if (routine.days && routine.days !== 'No aplica') {
      daysArr = routine.days.split(', ').map(d => d.trim());
    }

    setFormData({
      name: routine.name,
      repeat: routine.repeat,
      selectedDays: daysArr,
      time: routine.time,
      description: routine.description,
      urgency: routine.urgency || 'medium',
      category: routine.category || 'medicina'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Toggle day selection
  const handleToggleDay = (dayKey) => {
    setFormData(prev => {
      const days = [...prev.selectedDays];
      if (days.includes(dayKey)) {
        return { ...prev, selectedDays: days.filter(d => d !== dayKey) };
      } else {
        return { ...prev, selectedDays: [...days, dayKey] };
      }
    });
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
    if (formData.repeat && formData.selectedDays.length === 0) {
      newErrors.selectedDays = 'Debes seleccionar al menos un día para repetir.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Format days representation
    let daysString = 'No aplica';
    if (formData.repeat) {
      if (formData.selectedDays.length === 7) {
        daysString = 'Todos los días';
      } else if (
        formData.selectedDays.length === 5 && 
        ['Lu', 'Ma', 'Mi', 'Ju', 'Vi'].every(d => formData.selectedDays.includes(d))
      ) {
        daysString = 'Lunes a Viernes';
      } else if (
        formData.selectedDays.length === 2 && 
        ['Sá', 'Do'].every(d => formData.selectedDays.includes(d))
      ) {
        daysString = 'Fines de semana';
      } else {
        // Order days correctly (mon to sun)
        const order = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
        const sortedDays = [...formData.selectedDays].sort((a, b) => order.indexOf(a) - order.indexOf(b));
        daysString = sortedDays.join(', ');
      }
    }

    if (selectedRoutine) {
      // Edit Routine
      setRoutines(prev => prev.map(r => r.id === selectedRoutine.id ? {
        ...r,
        name: formData.name,
        repeat: formData.repeat,
        days: daysString,
        time: formData.time,
        description: formData.description,
        urgency: formData.urgency,
        category: formData.category
      } : r));
    } else {
      // Create Routine
      const newId = routines.length > 0 ? Math.max(...routines.map(r => r.id)) + 1 : 1;
      setRoutines(prev => [...prev, {
        id: newId,
        name: formData.name,
        repeat: formData.repeat,
        days: daysString,
        time: formData.time,
        description: formData.description,
        status: 'pending',
        urgency: formData.urgency,
        category: formData.category
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
      setRoutines(prev => prev.filter(r => r.id !== routineToDelete.id));
      setIsDeleteOpen(false);
      setRoutineToDelete(null);
    }
  };

  // Toggle routine complete status
  const handleToggleStatus = (routine) => {
    setRoutines(prev => prev.map(r => r.id === routine.id ? {
      ...r,
      status: r.status === 'completed' ? 'pending' : 'completed',
      completedAt: r.status === 'completed' ? null : new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })
    } : r));
  };

  // Columns for the DataTable
  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (value) => (
        <span className="text-slate-400 font-mono text-xs select-none">#{value}</span>
      )
    },
    {
      key: 'name',
      label: 'Nombre de Rutina',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleToggleStatus(row)}
            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
              row.status === 'completed' 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'border-slate-300 hover:border-blue-500 bg-white'
            }`}
            title={row.status === 'completed' ? 'Marcar como pendiente' : 'Marcar como completada'}
          >
            {row.status === 'completed' && <Check className="w-3.5 h-3.5" />}
          </button>
          <span className={`font-bold block tracking-tight ${row.status === 'completed' ? 'line-through text-slate-400 font-medium' : 'text-slate-900'}`}>
            {value}
          </span>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Categoría',
      render: (value, row) => {
        const isMed = value === 'medicina';
        const isExer = value === 'ejercicio';
        const isFood = value === 'alimentacion';
        const isSocial = value === 'social';
        
        let colorClass = 'bg-slate-100 text-slate-700';
        if (isMed) colorClass = 'bg-rose-50 text-rose-700 border border-rose-100';
        else if (isExer) colorClass = 'bg-sky-50 text-sky-700 border border-sky-100';
        else if (isFood) colorClass = 'bg-amber-50 text-amber-700 border border-amber-100';
        else if (isSocial) colorClass = 'bg-violet-50 text-violet-700 border border-violet-100';

        return (
          <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${colorClass} ${row.status === 'completed' ? 'opacity-60' : ''}`}>
            {value || 'general'}
          </span>
        );
      }
    },
    {
      key: 'repeat',
      label: 'Repetir',
      render: (value) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
          value 
            ? 'bg-green-50 text-green-700 border-green-100' 
            : 'bg-slate-50 text-slate-500 border-slate-100'
        }`}>
          {value ? 'Sí' : 'No'}
        </span>
      )
    },
    {
      key: 'days',
      label: 'Día(s)',
      render: (value, row) => (
        <span className={`font-semibold text-xs ${!row.repeat ? 'text-slate-400' : 'text-slate-700'}`}>
          {value}
        </span>
      )
    },
    {
      key: 'time',
      label: 'Hora',
      render: (value, row) => (
        <span className={`inline-flex items-center gap-1 text-sm font-bold ${row.status === 'completed' ? 'text-slate-400' : 'text-slate-900'}`}>
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          {value}
        </span>
      )
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (value, row) => (
        <span className={`text-xs block max-w-xs leading-relaxed ${row.status === 'completed' ? 'text-slate-400 font-normal' : 'text-slate-500 font-medium'}`}>
          {value || <span className="italic text-slate-300">Sin descripción</span>}
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
            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-blue-600 rounded-xl transition cursor-pointer"
            title="Editar Rutina"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleOpenDelete(row)} 
            className="p-1.5 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl transition cursor-pointer"
            title="Eliminar Rutina"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <CalendarRange className="w-6 h-6 text-blue-600" />
            Gestión de Rutinas Diarias
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
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
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white border border-slate-100 p-4 rounded-3xl shadow-xs">
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
            label="Repetición:"
            options={filterOptions}
            value={repeatFilter}
            onChange={(e) => setRepeatFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable 
        columns={columns} 
        data={filteredRoutines} 
        emptyStateMessage="No se encontraron rutinas registradas."
      />

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base tracking-tight flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-blue-600" />
                {selectedRoutine ? 'Editar Rutina' : 'Nueva Rutina'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 hover:bg-slate-200/50 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm text-slate-600">
              
              {/* Routine Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Nombre de la Rutina *
                </label>
                <input 
                  type="text"
                  placeholder="Ej. Medicina de la presión, Caminata, etc."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full bg-white border rounded-2xl px-4 py-2.5 text-slate-800 outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition ${
                    errors.name ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200'
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
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Hora de ejecución *
                  </label>
                  <div className="relative">
                    <input 
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className={`w-full bg-white border rounded-2xl px-4 py-2.5 text-slate-800 outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition ${
                        errors.time ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200'
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
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-800 outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition cursor-pointer"
                  >
                    <option value="medicina">Medicina</option>
                    <option value="ejercicio">Ejercicio</option>
                    <option value="alimentacion">Alimentación</option>
                    <option value="social">Social</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              {/* Repeat Toggle */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Repetir Rutina
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5">Define si la rutina se repite periódicamente.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, repeat: !formData.repeat })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 ${
                    formData.repeat ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      formData.repeat ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Day selection (conditional) */}
              {formData.repeat && (
                <div className="space-y-2.5 p-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Días de la semana *
                  </label>
                  <div className="flex justify-between gap-1.5">
                    {WEEKDAYS.map(day => {
                      const isSelected = formData.selectedDays.includes(day.key);
                      return (
                        <button
                          key={day.key}
                          type="button"
                          onClick={() => handleToggleDay(day.key)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white shadow-xs hover:bg-blue-700'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                  {errors.selectedDays && (
                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.selectedDays}
                    </p>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Descripción / Instrucciones
                </label>
                <textarea 
                  placeholder="Detalles de la rutina (ej. Dosis, lugar, detalles adicionales)..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-800 outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition resize-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-2xl text-xs font-bold transition duration-150 cursor-pointer"
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
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-scale-in p-6">
            <h3 className="font-bold text-slate-900 text-base mb-2 tracking-tight flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              ¿Confirmar eliminación?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              ¿Estás seguro de que deseas eliminar la rutina <span className="font-bold text-slate-800">"{routineToDelete?.name}"</span>? Esta acción no se puede deshacer y Qhawaybot dejará de emitir este recordatorio.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
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
