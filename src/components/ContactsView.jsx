import React, { useState, useEffect } from 'react';
import SearchBar from './ui/SearchBar';
import FilterSelect from './ui/FilterSelect';
import DataTable from './ui/DataTable';
import { Phone, Users, ShieldAlert, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabase';

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

export default function ContactsView({ elderId }) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [contacts, setContacts] = useState(mockContacts);

  useEffect(() => {
    if (!elderId) return;

    const fetchContacts = async () => {
      try {
        const { data, error } = await supabase
          .from('sos_contacts')
          .select('*')
          .eq('elder_id', elderId)
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) {
          setContacts(data.map(c => ({
            id: c.id,
            name: c.name,
            relation: c.relation,
            phone: c.phone,
            status: c.available ? 'disponible' : 'no-disponible',
            priority: c.relation.toLowerCase().includes('emergencia') || c.relation.toLowerCase().includes('hijo') ? 'Crítica' : 'Alta'
          })));
        } else {
          setContacts(mockContacts);
        }
      } catch (e) {
        console.error('Error fetching contacts:', e);
      }
    };
    fetchContacts();
  }, [elderId]);

  const statusOptions = [
    { value: 'all', label: t('contacts.filters.all') },
    { value: 'disponible', label: t('contacts.filters.disponible') },
    { value: 'ocupado', label: t('contacts.filters.ocupado') },
    { value: 'no-disponible', label: t('contacts.filters.no-disponible') }
  ];

  // Filtering Logic
  const filteredContacts = contacts.filter(contact => {
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
      label: t('contacts.columns.contact'),
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-white">{value}</span>
          <span className="text-xs text-slate-400 dark:text-prussian-blue-400 font-medium">{row.relation}</span>
        </div>
      )
    },
    {
      key: 'phone',
      label: t('contacts.columns.phone'),
      render: (value) => (
        <a 
          href={`tel:${value}`} 
          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 dark:text-baltic-blue-400 dark:hover:text-baltic-blue-300 font-bold hover:underline transition"
        >
          <Phone className="w-3.5 h-3.5" />
          {value}
        </a>
      )
    },
    {
      key: 'status',
      label: t('contacts.columns.status'),
      render: (value) => {
        if (value === 'disponible') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 dark:bg-verdigris-950 text-green-700 dark:text-verdigris-400 rounded-full text-xs font-bold border border-green-100 dark:border-verdigris-800">
              <CheckCircle className="w-3.5 h-3.5" /> {t('contacts.status.disponible')}
            </span>
          );
        } else if (value === 'ocupado') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 dark:bg-chocolate-950 text-yellow-700 dark:text-chocolate-300 rounded-full text-xs font-bold border border-yellow-100 dark:border-chocolate-800">
              <Clock className="w-3.5 h-3.5" /> {t('contacts.status.ocupado')}
            </span>
          );
        } else {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-rose-wine-950 text-red-700 dark:text-rose-wine-300 rounded-full text-xs font-bold border border-red-100 dark:border-rose-wine-800">
              <XCircle className="w-3.5 h-3.5" /> {t('contacts.status.no-disponible')}
            </span>
          );
        }
      }
    },
    {
      key: 'priority',
      label: t('contacts.columns.priority'),
      render: (value) => {
        const isCritical = value === 'Crítica' || value === 'Alta';
        return (
          <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider ${
            isCritical ? 'bg-red-500/10 text-red-600 dark:bg-rose-wine-950 dark:text-rose-wine-400' : 'bg-slate-100 text-slate-500 dark:bg-prussian-blue-800 dark:text-prussian-blue-300'
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
        </div>
      </div>

      {/* Control Panel (Filters and Search) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-prussian-blue-800/40 border border-slate-100 dark:border-prussian-blue-800 p-4 rounded-3xl shadow-xs">
        <SearchBar
          placeholder={t('contacts.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect
          label={t('contacts.filterLabel')}
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
      </div>

      {/* Contacts Data Table */}
      <DataTable
        columns={columns}
        data={filteredContacts}
        emptyStateMessage={t('contacts.empty')}
      />

    </div>
  );
}
