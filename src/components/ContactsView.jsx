import React, { useState } from 'react';
import SearchBar from './ui/SearchBar';
import FilterSelect from './ui/FilterSelect';
import DataTable from './ui/DataTable';
import { Phone, Users, ShieldAlert, CheckCircle, XCircle, Clock } from 'lucide-react';
<<<<<<< HEAD
=======
import { useLanguage } from '../context/LanguageContext';
>>>>>>> d3b1d46 (Primer commit del proyecto Qhaway-bot)

const mockContacts = [
  {
    id: 1,
    name: "Dr. Roberto Ramos",
    relation: "Médico Cardiólogo",
    phone: "+51 987 654 321",
    status: "disponible", // disponible | ocupado | no-disponible
    priority: "Alta"
  },
  {
    id: 2,
    name: "Harlins Gálvez (Hijo)",
    relation: "Familiar Administrador",
    phone: "+51 912 345 678",
    status: "disponible",
    priority: "Crítica"
  },
  {
    id: 3,
    name: "Sofía Ramos Gálvez",
    relation: "Hija / Cuidadora Secundaria",
    phone: "+51 922 888 777",
    status: "ocupado",
    priority: "Media"
  },
  {
    id: 4,
    name: "Ambulancias Cruz Roja",
    relation: "Servicio de Emergencia",
    phone: "115 / (01) 234-5678",
    status: "disponible",
    priority: "Crítica"
  },
  {
    id: 5,
    name: "Clínica San Borja",
    relation: "Centro Médico de Guardia",
    phone: "(01) 611-7777",
    status: "no-disponible",
    priority: "Baja"
  }
];

export default function ContactsView() {
<<<<<<< HEAD
=======
  const { t } = useLanguage();
>>>>>>> d3b1d46 (Primer commit del proyecto Qhaway-bot)
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const statusOptions = [
<<<<<<< HEAD
    { value: 'all', label: 'Todos los estados' },
    { value: 'disponible', label: 'Disponible' },
    { value: 'ocupado', label: 'En llamada / Ocupado' },
    { value: 'no-disponible', label: 'No disponible' }
=======
    { value: 'all', label: t('contacts.filters.all') },
    { value: 'disponible', label: t('contacts.filters.disponible') },
    { value: 'ocupado', label: t('contacts.filters.ocupado') },
    { value: 'no-disponible', label: t('contacts.filters.no-disponible') }
>>>>>>> d3b1d46 (Primer commit del proyecto Qhaway-bot)
  ];

  // Filtering Logic
  const filteredContacts = mockContacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      contact.relation.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = 
      statusFilter === 'all' || 
      contact.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Table Columns Definition
  const columns = [
    {
      key: 'name',
<<<<<<< HEAD
      label: 'Contacto',
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{value}</span>
          <span className="text-xs text-slate-400 font-medium">{row.relation}</span>
=======
      label: t('contacts.columns.contact'),
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-white">{value}</span>
          <span className="text-xs text-slate-400 dark:text-prussian-blue-400 font-medium">{row.relation}</span>
>>>>>>> d3b1d46 (Primer commit del proyecto Qhaway-bot)
        </div>
      )
    },
    {
      key: 'phone',
<<<<<<< HEAD
      label: 'Teléfono / Canal',
      render: (value) => (
        <a 
          href={`tel:${value}`} 
          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold hover:underline transition"
=======
      label: t('contacts.columns.phone'),
      render: (value) => (
        <a 
          href={`tel:${value}`} 
          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 dark:text-baltic-blue-400 dark:hover:text-baltic-blue-300 font-bold hover:underline transition"
>>>>>>> d3b1d46 (Primer commit del proyecto Qhaway-bot)
        >
          <Phone className="w-3.5 h-3.5" />
          {value}
        </a>
      )
    },
    {
      key: 'status',
<<<<<<< HEAD
      label: 'Estado de Conexión',
      render: (value) => {
        if (value === 'disponible') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
              <CheckCircle className="w-3.5 h-3.5" /> Disponible
=======
      label: t('contacts.columns.status'),
      render: (value) => {
        if (value === 'disponible') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 dark:bg-verdigris-950 text-green-700 dark:text-verdigris-400 rounded-full text-xs font-bold border border-green-100 dark:border-verdigris-800">
              <CheckCircle className="w-3.5 h-3.5" /> {t('contacts.status.disponible')}
>>>>>>> d3b1d46 (Primer commit del proyecto Qhaway-bot)
            </span>
          );
        } else if (value === 'ocupado') {
          return (
<<<<<<< HEAD
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold border border-yellow-100">
              <Clock className="w-3.5 h-3.5" /> Ocupado
=======
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 dark:bg-chocolate-950 text-yellow-700 dark:text-chocolate-300 rounded-full text-xs font-bold border border-yellow-100 dark:border-chocolate-800">
              <Clock className="w-3.5 h-3.5" /> {t('contacts.status.ocupado')}
>>>>>>> d3b1d46 (Primer commit del proyecto Qhaway-bot)
            </span>
          );
        } else {
          return (
<<<<<<< HEAD
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-100">
              <XCircle className="w-3.5 h-3.5" /> No Disponible
=======
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-rose-wine-950 text-red-700 dark:text-rose-wine-300 rounded-full text-xs font-bold border border-red-100 dark:border-rose-wine-800">
              <XCircle className="w-3.5 h-3.5" /> {t('contacts.status.no-disponible')}
>>>>>>> d3b1d46 (Primer commit del proyecto Qhaway-bot)
            </span>
          );
        }
      }
    },
    {
      key: 'priority',
<<<<<<< HEAD
      label: 'Prioridad de SOS',
=======
      label: t('contacts.columns.priority'),
>>>>>>> d3b1d46 (Primer commit del proyecto Qhaway-bot)
      render: (value) => {
        const isCritical = value === 'Crítica' || value === 'Alta';
        return (
          <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider ${
<<<<<<< HEAD
            isCritical ? 'bg-red-500/10 text-red-600' : 'bg-slate-100 text-slate-500'
=======
            isCritical ? 'bg-red-500/10 text-red-600 dark:bg-rose-wine-950 dark:text-rose-wine-400' : 'bg-slate-100 text-slate-500 dark:bg-prussian-blue-800 dark:text-prussian-blue-300'
>>>>>>> d3b1d46 (Primer commit del proyecto Qhaway-bot)
          }`}>
            {value}
          </span>
        );
      }
    }
  ];

  return (
    <div className="w-full space-y-6">
      
      {/* View Title */}
      <div className="flex items-center justify-between">
        <div>
<<<<<<< HEAD
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Users className="w-6 h-6 text-blue-600" />
            Contactos de Emergencia SOS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Canales de comunicación priorizados y notificaciones enlazadas a Qhawaybot.
          </p>
        </div>
        
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-red-600 font-bold bg-red-50 py-1.5 px-3 rounded-xl border border-red-100/50">
          <ShieldAlert className="w-4 h-4 animate-pulse" />
          <span>Canales de Alerta Activos</span>
=======
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Users className="w-6 h-6 text-blue-600 dark:text-baltic-blue-400" />
            {t('contacts.title')}
          </h2>
          <p className="text-xs text-slate-400 dark:text-prussian-blue-400 mt-0.5">
            {t('contacts.subtitle')}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-red-600 dark:text-rose-wine-400 font-bold bg-red-50 dark:bg-rose-wine-950 py-1.5 px-3 rounded-xl border border-red-100/50 dark:border-rose-wine-800">
          <ShieldAlert className="w-4 h-4 animate-pulse" />
          <span>{t('contacts.activeAlerts')}</span>
>>>>>>> d3b1d46 (Primer commit del proyecto Qhaway-bot)
        </div>
      </div>

      {/* Control Panel (Filters and Search) */}
<<<<<<< HEAD
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-slate-100 p-4 rounded-3xl shadow-xs">
        <SearchBar 
          placeholder="Buscar por nombre o parentesco..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <FilterSelect 
          label="Filtrar:"
=======
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-prussian-blue-800/40 border border-slate-100 dark:border-prussian-blue-800 p-4 rounded-3xl shadow-xs">
        <SearchBar
          placeholder={t('contacts.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect
          label={t('contacts.filterLabel')}
>>>>>>> d3b1d46 (Primer commit del proyecto Qhaway-bot)
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
      </div>

      {/* Contacts Data Table */}
<<<<<<< HEAD
      <DataTable 
        columns={columns} 
        data={filteredContacts} 
        emptyStateMessage="No se encontraron contactos que coincidan con la búsqueda."
=======
      <DataTable
        columns={columns}
        data={filteredContacts}
        emptyStateMessage={t('contacts.empty')}
>>>>>>> d3b1d46 (Primer commit del proyecto Qhaway-bot)
      />

    </div>
  );
}
