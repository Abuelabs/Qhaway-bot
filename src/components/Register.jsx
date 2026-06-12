import React, { useState } from 'react'
import { Heart, User, Users, ShieldCheck, Plus, Trash2, ArrowLeft, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { supabase } from '../supabase'

// Health insurance providers available in Perú
export const HEALTH_INSURANCE_OPTIONS = [
  'Rímac Seguros',
  'Pacífico Seguros',
  'Mapfre Perú',
  'La Positiva Seguros',
  'Sanitas Perú',
  'Bupa Perú',
  'SIS (Seguro Integral de Salud)',
  'EsSalud (Seguro Social de Salud)',
  'Fondo de la Sanidad del Ejército del Perú',
  'Fondo de la Sanidad de la Marina de Guerra',
  'Fondo de la Sanidad de la Fuerza Aérea (FAP)',
  'Fondo de Sanidad de la Policía Nacional (SaludPol)',
  'Oncosalud / Red Auna',
  'Otros',
]

const BLOOD_TYPES = ['No especificado', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

const emptyElder = () => ({
  uid: Math.random().toString(36).slice(2),
  name: '',
  age: '',
  sex: '',
  bloodType: 'No especificado',
  conditions: '',
  allergies: '',
  hasInsurance: '',
  insurance: '',
  insuranceOther: '',
  room: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
})

const inputClass = 'w-full bg-slate-950/60 border border-slate-700 focus:border-blue-500 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition'
const labelClass = 'text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block'

export default function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [step, setStep] = useState(1) // 1: admin data, 2: elders data, 3: review

  // Admin / caregiver account data
  const [admin, setAdmin] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)

  // Elders being cared for
  const [elders, setElders] = useState([emptyElder()])

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const updateAdmin = (field, value) => setAdmin((prev) => ({ ...prev, [field]: value }))

  const updateElder = (uid, field, value) => {
    setElders((prev) => prev.map((e) => (e.uid === uid ? { ...e, [field]: value } : e)))
  }

  const addElder = () => setElders((prev) => [...prev, emptyElder()])

  const removeElder = (uid) => setElders((prev) => (prev.length > 1 ? prev.filter((e) => e.uid !== uid) : prev))

  const validateAdminStep = () => {
    if (!admin.fullName.trim() || !admin.email.trim() || !admin.phone.trim() || !admin.password) {
      setError('Por favor completa todos los campos obligatorios.')
      return false
    }
    if (!admin.email.includes('@')) {
      setError('Ingresa un correo electrónico válido.')
      return false
    }
    if (admin.password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.')
      return false
    }
    if (admin.password !== admin.confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return false
    }
    setError('')
    return true
  }

  const validateEldersStep = () => {
    for (const elder of elders) {
      if (!elder.name.trim() || !elder.age || !elder.sex) {
        setError('Completa al menos el nombre, edad y sexo de cada abuelito.')
        return false
      }
      if (elder.hasInsurance === 'si' && !elder.insurance) {
        setError('Selecciona el seguro de salud o elige "Otros".')
        return false
      }
      if (elder.hasInsurance === 'si' && elder.insurance === 'Otros' && !elder.insuranceOther.trim()) {
        setError('Especifica el nombre del seguro de salud.')
        return false
      }
    }
    setError('')
    return true
  }

  const goNext = () => {
    if (step === 1 && !validateAdminStep()) return
    if (step === 2 && !validateEldersStep()) return
    setStep((s) => Math.min(s + 1, 3))
  }

  const goBack = () => {
    setError('')
    setStep((s) => Math.max(s - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateAdminStep() || !validateEldersStep()) {
      setStep(1)
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1. Sign up user via Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: admin.email.trim(),
        password: admin.password,
        options: {
          data: {
            full_name: admin.fullName.trim(),
            phone: admin.phone.trim()
          }
        }
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      const user = data.user
      if (!user) {
        setError('Error al registrar usuario en el servidor.')
        setLoading(false)
        return
      }

      // 2. Update profile (upsert ensures row exists regardless of DB trigger delays)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: admin.fullName.trim(),
          phone: admin.phone.trim()
        })

      if (profileError) {
        console.error('Error saving profiles:', profileError)
      }

      // 3. Insert elders associated with this caregiver
      const eldersToInsert = elders.map((elder) => ({
        caregiver_id: user.id,
        name: elder.name.trim(),
        age: Number(elder.age) || 0,
        sex: elder.sex,
        blood_type: elder.bloodType,
        condition: elder.conditions.trim() || 'Sin condiciones registradas',
        conditions: elder.conditions.trim(),
        allergies: elder.allergies.trim() || 'Ninguna registrada',
        has_insurance: elder.hasInsurance === 'si',
        insurance: elder.hasInsurance === 'si'
          ? (elder.insurance === 'Otros' ? elder.insuranceOther.trim() : elder.insurance)
          : 'Sin seguro de salud',
        room: elder.room.trim() || 'Sin asignar',
        emergency_contact_name: elder.emergencyContactName.trim(),
        emergency_contact_phone: elder.emergencyContactPhone.trim(),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        device_status: 'Conectado'
      }))

      const { data: insertedElders, error: eldersError } = await supabase
        .from('elders')
        .insert(eldersToInsert)
        .select()

      if (eldersError) {
        setError('Cuenta creada, pero hubo un error al registrar los abuelitos: ' + eldersError.message)
        setLoading(false)
        return
      }

      // Map back to format expected by App.jsx and Dashboard.jsx
      const normalizedElders = (insertedElders || []).map((e) => ({
        id: e.id,
        name: e.name,
        age: e.age,
        sex: e.sex,
        bloodType: e.blood_type,
        condition: e.condition,
        conditions: e.conditions,
        allergies: e.allergies,
        hasInsurance: e.has_insurance,
        insurance: e.insurance,
        room: e.room,
        emergencyContactName: e.emergency_contact_name,
        emergencyContactPhone: e.emergency_contact_phone,
        avatar: e.avatar,
        deviceStatus: e.device_status
      }))

      setLoading(false)
      onRegisterSuccess(admin.fullName, normalizedElders)
    } catch (e) {
      setError(e.message || 'Error al conectar con el servidor')
      setLoading(false)
    }
  }

  const steps = [
    { id: 1, label: 'Tu cuenta', icon: User },
    { id: 2, label: 'Abuelitos a cuidar', icon: Users },
    { id: 3, label: 'Confirmación', icon: ShieldCheck },
  ]

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-10 relative overflow-hidden font-sans w-full">

      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[450px] h-80 sm:h-[450px] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 sm:w-[450px] h-80 sm:h-[450px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-2xl w-full z-10">

        {/* Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">Crea tu cuenta en Qhawaybot</h1>
          <p className="text-slate-400 text-sm font-semibold">Registra tus datos y la información de las personas que vas a cuidar</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, idx) => {
            const Icon = s.icon
            const isActive = step === s.id
            const isDone = step > s.id
            return (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all ${
                    isActive ? 'bg-blue-600 border-blue-600 text-white' :
                    isDone ? 'bg-green-600/20 border-green-500 text-green-400' :
                    'bg-slate-900 border-slate-700 text-slate-500'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${isActive ? 'text-white' : 'text-slate-500'}`}>{s.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-0.5 w-10 sm:w-16 rounded-full mb-5 transition-all ${step > s.id ? 'bg-green-500' : 'bg-slate-700'}`} />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-md shadow-2xl p-6 sm:p-8 animate-fade-in">

          {/* STEP 1: Admin / caregiver account */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-white mb-1">Datos del administrador</h2>
              <p className="text-xs text-slate-400 mb-4">Esta será la cuenta principal para gestionar Qhawaybot.</p>

              <div>
                <label className={labelClass}>Nombre completo</label>
                <input
                  type="text"
                  value={admin.fullName}
                  onChange={(e) => updateAdmin('fullName', e.target.value)}
                  placeholder="Ej. María Fernández"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Correo electrónico</label>
                  <input
                    type="email"
                    value={admin.email}
                    onChange={(e) => updateAdmin('email', e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Teléfono</label>
                  <input
                    type="tel"
                    value={admin.phone}
                    onChange={(e) => updateAdmin('phone', e.target.value)}
                    placeholder="+51 987 654 321"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={admin.password}
                      onChange={(e) => updateAdmin('password', e.target.value)}
                      placeholder="••••••••"
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Confirmar contraseña</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={admin.confirmPassword}
                    onChange={(e) => updateAdmin('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Elder profiles */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-white mb-1">Información de los abuelitos a cuidar</h2>
                <p className="text-xs text-slate-400">Esta información ayudará a Qhawaybot a brindar un mejor cuidado y a actuar correctamente en caso de emergencia.</p>
              </div>

              {elders.map((elder, idx) => (
                <div key={elder.uid} className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 relative">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-blue-400 uppercase tracking-wide">Abuelito {idx + 1}</h3>
                    {elders.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeElder(elder.uid)}
                        className="text-rose-400 hover:text-rose-300 transition cursor-pointer p-1"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Nombre completo</label>
                      <input
                        type="text"
                        value={elder.name}
                        onChange={(e) => updateElder(elder.uid, 'name', e.target.value)}
                        placeholder="Ej. Don José Pérez"
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Edad</label>
                        <input
                          type="number"
                          min="0"
                          value={elder.age}
                          onChange={(e) => updateElder(elder.uid, 'age', e.target.value)}
                          placeholder="78"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Sexo</label>
                        <select
                          value={elder.sex}
                          onChange={(e) => updateElder(elder.uid, 'sex', e.target.value)}
                          className={`${inputClass} cursor-pointer`}
                        >
                          <option value="" className="bg-slate-900">Selecciona</option>
                          <option value="Femenino" className="bg-slate-900">Femenino</option>
                          <option value="Masculino" className="bg-slate-900">Masculino</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Tipo de sangre</label>
                      <select
                        value={elder.bloodType}
                        onChange={(e) => updateElder(elder.uid, 'bloodType', e.target.value)}
                        className={`${inputClass} cursor-pointer`}
                      >
                        {BLOOD_TYPES.map((bt) => (
                          <option key={bt} value={bt} className="bg-slate-900">{bt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Habitación / Ubicación en casa</label>
                      <input
                        type="text"
                        value={elder.room}
                        onChange={(e) => updateElder(elder.uid, 'room', e.target.value)}
                        placeholder="Ej. Habitación principal"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Enfermedades o condiciones médicas</label>
                    <textarea
                      value={elder.conditions}
                      onChange={(e) => updateElder(elder.uid, 'conditions', e.target.value)}
                      placeholder="Ej. Hipertensión, diabetes tipo 2, leve pérdida de memoria..."
                      rows={2}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Alergias</label>
                    <textarea
                      value={elder.allergies}
                      onChange={(e) => updateElder(elder.uid, 'allergies', e.target.value)}
                      placeholder="Ej. Penicilina, polen, frutos secos..."
                      rows={2}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {/* Health insurance */}
                  <div className="space-y-3">
                    <label className={labelClass}>¿Cuenta con seguro de salud?</label>
                    <div className="flex gap-3">
                      {['si', 'no'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => updateElder(elder.uid, 'hasInsurance', opt)}
                          className={`flex-1 py-2.5 rounded-2xl text-sm font-bold border transition cursor-pointer ${
                            elder.hasInsurance === opt
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-slate-950/60 border-slate-700 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {opt === 'si' ? 'Sí' : 'No'}
                        </button>
                      ))}
                    </div>

                    {elder.hasInsurance === 'si' && (
                      <div className="space-y-3 animate-fade-in">
                        <div>
                          <label className={labelClass}>Seguro de salud</label>
                          <select
                            value={elder.insurance}
                            onChange={(e) => updateElder(elder.uid, 'insurance', e.target.value)}
                            className={`${inputClass} cursor-pointer`}
                          >
                            <option value="" className="bg-slate-900">Selecciona una opción</option>
                            {HEALTH_INSURANCE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt} className="bg-slate-900">{opt}</option>
                            ))}
                          </select>
                        </div>

                        {elder.insurance === 'Otros' && (
                          <div>
                            <label className={labelClass}>Especifica el seguro</label>
                            <input
                              type="text"
                              value={elder.insuranceOther}
                              onChange={(e) => updateElder(elder.uid, 'insuranceOther', e.target.value)}
                              placeholder="Nombre del seguro de salud"
                              className={inputClass}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Emergency contact for this elder */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Contacto de emergencia</label>
                      <input
                        type="text"
                        value={elder.emergencyContactName}
                        onChange={(e) => updateElder(elder.uid, 'emergencyContactName', e.target.value)}
                        placeholder="Nombre del familiar o médico"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Teléfono de emergencia</label>
                      <input
                        type="tel"
                        value={elder.emergencyContactPhone}
                        onChange={(e) => updateElder(elder.uid, 'emergencyContactPhone', e.target.value)}
                        placeholder="+51 987 654 321"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addElder}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-700 hover:border-blue-500 text-slate-400 hover:text-blue-400 font-bold py-3 rounded-2xl transition cursor-pointer text-sm"
              >
                <Plus className="w-4 h-4" />
                Agregar otro abuelito
              </button>
            </div>
          )}

          {/* STEP 3: Review & confirm */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-white mb-1">Confirma tu información</h2>
                <p className="text-xs text-slate-400">Revisa los datos antes de crear tu cuenta. Podrás editarlos luego desde tu perfil.</p>
              </div>

              <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                <h3 className="text-sm font-black text-blue-400 uppercase tracking-wide mb-2">Administrador</h3>
                <p className="text-sm text-white font-bold">{admin.fullName}</p>
                <p className="text-xs text-slate-400">{admin.email} · {admin.phone}</p>
              </div>

              {elders.map((elder, idx) => (
                <div key={elder.uid} className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                  <h3 className="text-sm font-black text-blue-400 uppercase tracking-wide mb-2">Abuelito {idx + 1}</h3>
                  <p className="text-sm text-white font-bold">{elder.name || '—'} · {elder.age || '—'} años · {elder.sex || '—'}</p>
                  <p className="text-xs text-slate-400">Tipo de sangre: {elder.bloodType}</p>
                  <p className="text-xs text-slate-400">Condiciones: {elder.conditions || 'Ninguna registrada'}</p>
                  <p className="text-xs text-slate-400">Alergias: {elder.allergies || 'Ninguna registrada'}</p>
                  <p className="text-xs text-slate-400">
                    Seguro de salud: {elder.hasInsurance === 'si'
                      ? (elder.insurance === 'Otros' ? elder.insuranceOther : elder.insurance) || '—'
                      : 'Sin seguro de salud'}
                  </p>
                  {elder.room && <p className="text-xs text-slate-400">Ubicación: {elder.room}</p>}
                  {elder.emergencyContactName && (
                    <p className="text-xs text-slate-400">Contacto de emergencia: {elder.emergencyContactName} ({elder.emergencyContactPhone})</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Error message */}
          {error && (
            <p className="text-rose-400 text-xs font-bold mt-4 bg-rose-950/30 border border-rose-900/50 rounded-xl px-3 py-2">{error}</p>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-3 mt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-5 rounded-2xl transition active:scale-95 cursor-pointer text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Atrás
              </button>
            ) : (
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="inline-flex items-center gap-2 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white font-bold py-3 px-5 rounded-2xl transition cursor-pointer text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl transition shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer text-sm"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-bold py-3 px-6 rounded-2xl transition shadow-lg shadow-green-500/20 active:scale-95 cursor-pointer text-sm font-sans"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Crear cuenta
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Switch to login */}
        <p className="text-center text-xs text-slate-500 mt-6">
          ¿Ya tienes una cuenta?{' '}
          <button onClick={onSwitchToLogin} className="text-blue-400 hover:text-blue-300 font-bold cursor-pointer">
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  )
}
