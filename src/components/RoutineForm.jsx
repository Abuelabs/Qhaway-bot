import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Pill, Clock, Plus, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function RoutineForm({ elderId, onSuccess, onClose }) {
  const [formData, setFormData] = useState({
    nombrePastilla: '',
    dosis: '',
    hora: '08:00',
    categoria: 'medicina',
    prioridad: 'medium',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!formData.nombrePastilla.trim()) {
      errors.nombrePastilla = 'El nombre de la pastilla/medicamento es requerido.';
    }
    if (!formData.dosis.trim()) {
      errors.dosis = 'La dosis es requerida (ej. 1 pastilla, 5ml).';
    }
    if (!formData.hora) {
      errors.hora = 'La hora es requerida.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Obtener el usuario autenticado actualmente desde Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('No se pudo verificar la sesión. Por favor, inicia sesión de nuevo.');
      }

      // 2. Ejecutar el INSERT incluyendo el UUID del usuario o elder_id según el esquema
      // Mostramos la lógica adaptada tanto para 'rutinas_medicas' (con RLS) como para la tabla del esquema 'routines'
      const isCustomSchema = false; // Cambiar a true si usas una tabla personalizada llamada 'rutinas_medicas'

      let insertData = {};
      let targetTable = 'routines';

      if (isCustomSchema) {
        targetTable = 'rutinas_medicas';
        insertData = {
          usuario_id: user.id, // UUID del usuario autenticado para RLS
          nombre_pastilla: formData.nombrePastilla,
          dosis: formData.dosis,
          hora: formData.hora,
          categoria: formData.categoria,
          prioridad: formData.prioridad,
          created_at: new Date().toISOString()
        };
      } else {
        // Estructura oficial del proyecto Qhaway-bot para la tabla 'routines'
        insertData = {
          elder_id: elderId || '00000000-0000-0000-0000-000000000000', // Reemplazar con el ID del adulto mayor
          name: formData.nombrePastilla,
          description: `Dosis: ${formData.dosis}`,
          time: formData.hora,
          category: formData.categoria,
          urgency: formData.prioridad,
          status: 'pending',
          repeat: true,
          recurrence_rule: { frequency: 'daily', interval: 1, end: { type: 'never' } },
          start_date: new Date().toISOString().split('T')[0]
        };
      }

      const { data, error } = await supabase
        .from(targetTable)
        .insert([insertData])
        .select();

      if (error) {
        throw error;
      }

      setSuccessMsg('¡Rutina médica guardada exitosamente en Supabase!');
      
      // Limpiar formulario tras éxito
      setFormData({
        nombrePastilla: '',
        dosis: '',
        hora: '08:00',
        categoria: 'medicina',
        prioridad: 'medium',
      });

      // 3. Actualizar la lista en el componente padre de forma optimista o mediante refetch
      if (onSuccess && data && data.length > 0) {
        // Enviamos el registro insertado de vuelta
        const newRoutine = data[0];
        onSuccess({
          id: newRoutine.id,
          name: newRoutine.name || newRoutine.nombre_pastilla,
          description: newRoutine.description || `Dosis: ${newRoutine.dosis}`,
          time: newRoutine.time || newRoutine.hora,
          status: newRoutine.status || 'pending',
          category: newRoutine.category || newRoutine.categoria,
          urgency: newRoutine.urgency || newRoutine.prioridad,
          startDate: newRoutine.start_date || newRoutine.created_at,
          recurrenceRule: newRoutine.recurrence_rule || null
        });
      }

      // Cerrar modal/formulario tras un retraso corto
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }

    } catch (err) {
      console.error('Error insertando la rutina médica:', err);
      setErrorMsg(err.message || 'Ocurrió un error inesperado al guardar la rutina.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-prussian-blue-900 border border-slate-200/60 dark:border-prussian-blue-800 rounded-3xl p-6 shadow-xl w-full max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
          <Pill className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">Agregar Rutina Médica</h3>
          <p className="text-xs text-slate-400 dark:text-prussian-blue-400">Inserta un nuevo recordatorio de medicina</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        
        {/* Nombre de la pastilla / medicina */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-500 dark:text-prussian-blue-400 uppercase tracking-wider">
            Medicamento / Pastilla
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ej. Paracetamol 500mg, Losartán"
              value={formData.nombrePastilla}
              onChange={(e) => setFormData({ ...formData, nombrePastilla: e.target.value })}
              className={`w-full bg-slate-50 dark:bg-prussian-blue-800 border rounded-2xl px-4 py-2.5 text-slate-800 dark:text-prussian-blue-100 outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition ${
                validationErrors.nombrePastilla ? 'border-red-500' : 'border-slate-200 dark:border-prussian-blue-700'
              }`}
            />
          </div>
          {validationErrors.nombrePastilla && (
            <p className="text-red-500 text-xs flex items-center gap-1 font-semibold">
              <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.nombrePastilla}
            </p>
          )}
        </div>

        {/* Dosis */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-500 dark:text-prussian-blue-400 uppercase tracking-wider">
            Dosis
          </label>
          <input
            type="text"
            placeholder="Ej. 1 tableta, 10ml, 2 gotas"
            value={formData.dosis}
            onChange={(e) => setFormData({ ...formData, dosis: e.target.value })}
            className={`w-full bg-slate-50 dark:bg-prussian-blue-800 border rounded-2xl px-4 py-2.5 text-slate-800 dark:text-prussian-blue-100 outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition ${
              validationErrors.dosis ? 'border-red-500' : 'border-slate-200 dark:border-prussian-blue-700'
            }`}
          />
          {validationErrors.dosis && (
            <p className="text-red-500 text-xs flex items-center gap-1 font-semibold">
              <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.dosis}
            </p>
          )}
        </div>

        {/* Hora y Prioridad */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 dark:text-prussian-blue-400 uppercase tracking-wider">
              Hora de toma
            </label>
            <div className="relative">
              <input
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                className="w-full bg-slate-50 dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 rounded-2xl px-4 py-2.5 text-slate-800 dark:text-prussian-blue-100 outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 dark:text-prussian-blue-400 uppercase tracking-wider">
              Prioridad
            </label>
            <select
              value={formData.prioridad}
              onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
              className="w-full bg-slate-50 dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 rounded-2xl px-4 py-2.5 text-slate-800 dark:text-prussian-blue-100 outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition cursor-pointer"
            >
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>
        </div>

        {/* Mensajes de Feedback (Verde éxito / Rojo error) */}
        {successMsg && (
          <div className="p-3.5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 rounded-2xl flex items-start gap-2.5 animate-fade-in font-medium text-xs">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 rounded-2xl flex items-start gap-2.5 animate-fade-in font-medium text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-prussian-blue-800">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-1/2 py-2.5 border border-slate-200 dark:border-prussian-blue-700 text-slate-650 dark:text-prussian-blue-300 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-prussian-blue-800 transition cursor-pointer"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className={`py-2.5 font-bold text-white rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
              onClose ? 'w-1/2' : 'w-full'
            } ${
              isLoading
                ? 'bg-emerald-700/80 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Guardar Rutina
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
