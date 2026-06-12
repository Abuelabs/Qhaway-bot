import React, { useState, useEffect } from 'react';
import { HeartPulse, Activity, Droplet, Thermometer, Moon, Footprints, Stethoscope, ShieldCheck, AlertCircle, Phone, User } from 'lucide-react';
import { mockVitalsByElder } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabase';

export default function HealthView({ elderId = 1, elderName = '', elder = null }) {
  const { t } = useLanguage();
  const [vitals, setVitals] = useState(mockVitalsByElder[elderId] || mockVitalsByElder[1]);

  useEffect(() => {
    const fetchVitals = async () => {
      try {
        const { data, error } = await supabase
          .from('vitals')
          .select('*')
          .eq('elder_id', elderId)
          .order('last_updated', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setVitals({
            heartRate: data.heart_rate,
            bloodPressure: data.blood_pressure,
            spo2: data.spo2,
            temperature: data.temperature,
            sleepHours: data.sleep_hours,
            steps: data.steps,
            lastUpdated: new Date(data.last_updated).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
          });
        } else {
          setVitals(mockVitalsByElder[elderId] || mockVitalsByElder[1] || {
            heartRate: 72,
            bloodPressure: "120/80",
            spo2: 98,
            temperature: 36.5,
            sleepHours: 7.0,
            steps: 0,
            lastUpdated: "Hace instantes"
          });
        }
      } catch (e) {
        console.error('Error fetching vitals:', e);
      }
    };
    fetchVitals();
  }, [elderId]);

  const stats = [
    { key: 'heartRate', label: t('health.heartRate'), value: `${vitals.heartRate || 0} bpm`, icon: HeartPulse, color: 'rose-wine' },
    { key: 'bloodPressure', label: t('health.bloodPressure'), value: vitals.bloodPressure || '120/80', icon: Activity, color: 'baltic-blue' },
    { key: 'spo2', label: t('health.spo2'), value: `${vitals.spo2 || 98}%`, icon: Droplet, color: 'verdigris' },
    { key: 'temperature', label: t('health.temperature'), value: `${vitals.temperature || 36.5}°C`, icon: Thermometer, color: 'chocolate' },
    { key: 'sleepHours', label: t('health.sleep'), value: `${vitals.sleepHours || 7} h`, icon: Moon, color: 'baltic-blue' },
    { key: 'steps', label: t('health.steps'), value: vitals.steps != null ? vitals.steps.toLocaleString('es-PE') : '0', icon: Footprints, color: 'verdigris' },
  ];

  const colorClasses = {
    'rose-wine': 'bg-purple-50 dark:bg-rose-wine-950 text-purple-600 dark:text-rose-wine-400',
    'baltic-blue': 'bg-blue-50 dark:bg-baltic-blue-950 text-blue-600 dark:text-baltic-blue-400',
    'verdigris': 'bg-green-50 dark:bg-verdigris-950 text-green-600 dark:text-verdigris-400',
    'chocolate': 'bg-orange-50 dark:bg-chocolate-950 text-orange-600 dark:text-chocolate-400',
  };

  return (
    <div className="w-full space-y-6">

      {/* View Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Stethoscope className="w-6 h-6 text-blue-600 dark:text-baltic-blue-400" />
            {t('health.title')}
          </h2>
          <p className="text-xs text-slate-400 dark:text-prussian-blue-400 mt-0.5">
            {t('health.subtitle', { name: elderName || t('health.defaultName'), time: vitals.lastUpdated })}
          </p>
        </div>
      </div>

      {/* Vitals Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ key, label, value, icon: Icon, color }) => (
          <div key={key} className="bg-white dark:bg-prussian-blue-800/40 border border-slate-100 dark:border-prussian-blue-800 rounded-2xl p-4 flex flex-col gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-prussian-blue-400 font-semibold">{label}</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Medical record / Ficha médica */}
      {elder && (
        <div className="bg-white dark:bg-prussian-blue-800/40 border border-slate-100 dark:border-prussian-blue-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <User className="w-4 h-4 text-blue-600 dark:text-baltic-blue-400" />
            Ficha médica
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {elder.age != null && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-prussian-blue-400 uppercase tracking-wider">Edad</p>
                <p className="text-sm font-bold text-slate-800 dark:text-prussian-blue-50 mt-0.5">{elder.age} años</p>
              </div>
            )}
            {elder.sex && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-prussian-blue-400 uppercase tracking-wider">Sexo</p>
                <p className="text-sm font-bold text-slate-800 dark:text-prussian-blue-50 mt-0.5">{elder.sex}</p>
              </div>
            )}
            {elder.bloodType && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-prussian-blue-400 uppercase tracking-wider">Tipo de sangre</p>
                <p className="text-sm font-bold text-slate-800 dark:text-prussian-blue-50 mt-0.5">{elder.bloodType}</p>
              </div>
            )}
            {elder.room && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-prussian-blue-400 uppercase tracking-wider">Ubicación</p>
                <p className="text-sm font-bold text-slate-800 dark:text-prussian-blue-50 mt-0.5">{elder.room}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-prussian-blue-800">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-wine-950/50 text-rose-600 dark:text-rose-wine-400 flex items-center justify-center shrink-0">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-prussian-blue-400 uppercase tracking-wider">Condiciones médicas</p>
                <p className="text-sm text-slate-700 dark:text-prussian-blue-100 mt-0.5">{elder.conditions || elder.condition || 'Ninguna registrada'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-chocolate-950/50 text-amber-600 dark:text-chocolate-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-prussian-blue-400 uppercase tracking-wider">Alergias</p>
                <p className="text-sm text-slate-700 dark:text-prussian-blue-100 mt-0.5">{elder.allergies || 'Ninguna registrada'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-baltic-blue-950/50 text-blue-600 dark:text-baltic-blue-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-prussian-blue-400 uppercase tracking-wider">Seguro de salud</p>
                <p className="text-sm text-slate-700 dark:text-prussian-blue-100 mt-0.5">{elder.insurance || 'Sin seguro de salud'}</p>
              </div>
            </div>

            {elder.emergencyContactName && (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-verdigris-950/50 text-green-600 dark:text-verdigris-400 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-prussian-blue-400 uppercase tracking-wider">Contacto de emergencia</p>
                  <p className="text-sm text-slate-700 dark:text-prussian-blue-100 mt-0.5">{elder.emergencyContactName} · {elder.emergencyContactPhone}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <p className="text-[11px] text-slate-400 dark:text-prussian-blue-500 leading-relaxed">
        {t('health.disclaimer')}
      </p>

    </div>
  );
}
