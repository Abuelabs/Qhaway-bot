import React, { useState } from 'react';
import SearchBar from './ui/SearchBar';
import FilterSelect from './ui/FilterSelect';
import DataTable from './ui/DataTable';
import { Phone, Users, ShieldAlert, CheckCircle, XCircle, Clock, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
  const { t } = useLanguage();
  const [contacts, setContacts] = useState(mockContacts);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal and deletion states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactToDelete, setContactToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    relation: '',
    phone: '',
    priority: 'Media'
  });

  const [errors, setErrors] = useState({});

  // Filtering Logic
  const filteredContacts = contacts.filter(contact => {
    return contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           contact.relation.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // CRUD handlers
  const handleOpenCreate = () => {
    setSelectedContact(null);
    setFormData({
      name: '',
      relation: '',
      phone: '',
      priority: 'Media'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (contact) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name,
      relation: contact.relation,
      phone: contact.phone,
      priority: contact.priority || 'Media'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del contacto es requerido.';
    }
    if (!formData.relation.trim()) {
      newErrors.relation = 'La relación o parentesco es requerida.';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'El número de teléfono es requerido.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (selectedContact) {
      // Edit mode
      setContacts(prev => prev.map(c => c.id === selectedContact.id ? {
        ...c,
        name: formData.name,
        relation: formData.relation,
        phone: formData.phone,
        priority: formData.priority
      } : c));
    } else {
      // Create mode
      const newId = contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1;
      setContacts(prev => [...prev, {
        id: newId,
        name: formData.name,
        relation: formData.relation,
        phone: formData.phone,
        priority: formData.priority
      }]);
    }
    setIsModalOpen(false);
  };

  const handleOpenDelete = (contact) => {
    setContactToDelete(contact);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (contactToDelete) {
      setContacts(prev => prev.filter(c => c.id !== contactToDelete.id));
      setIsDeleteOpen(false);
      setContactToDelete(null);
    }
  };

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
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => handleOpenEdit(row)} 
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-prussian-blue-800 text-slate-500 hover:text-blue-600 rounded-xl transition cursor-pointer"
            title="Editar Contacto"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleOpenDelete(row)} 
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-500 hover:text-red-600 rounded-xl transition cursor-pointer"
            title="Eliminar Contacto"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full space-y-6">
      
      {/* View Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Users className="w-6 h-6 text-blue-600 dark:text-baltic-blue-400" />
            {t('contacts.title')}
          </h2>
          <p className="text-xs text-slate-400 dark:text-prussian-blue-400 mt-0.5">
            {t('contacts.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-red-600 dark:text-rose-wine-400 font-bold bg-red-50 dark:bg-rose-wine-950 py-1.5 px-3 rounded-xl border border-red-100/50 dark:border-rose-wine-800">
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span>{t('contacts.activeAlerts')}</span>
          </div>
          
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-xs hover:shadow-md hover:-translate-y-0.5 transition duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nuevo Contacto
          </button>
        </div>
      </div>

      {/* Control Panel (Search) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-prussian-blue-800/40 border border-slate-100 dark:border-prussian-blue-800 p-4 rounded-3xl shadow-xs">
        <SearchBar
          placeholder={t('contacts.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Contacts Data Table */}
      <DataTable
        columns={columns}
        data={filteredContacts}
        emptyStateMessage={t('contacts.empty')}
      />

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-prussian-blue-900 border border-slate-100 dark:border-prussian-blue-800 rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="bg-slate-50 dark:bg-prussian-blue-805 border-b border-slate-100 dark:border-prussian-blue-800 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-baltic-blue-400" />
                {selectedContact ? 'Editar Contacto' : 'Nuevo Contacto'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 hover:bg-slate-200/50 dark:hover:bg-prussian-blue-700 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm text-slate-655 dark:text-prussian-blue-200">
              
              {/* Contact Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-prussian-blue-400 uppercase tracking-wider">
                  Nombre Completo *
                </label>
                <input 
                  type="text"
                  placeholder="Ej. Dr. Roberto Ramos, Hijo, etc."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full bg-white dark:bg-prussian-blue-805 border rounded-2xl px-4 py-2.5 text-slate-800 dark:text-prussian-blue-105 outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition ${
                    errors.name ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-prussian-blue-700'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs flex items-center gap-1 mt-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Relation / Parentesco */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-prussian-blue-400 uppercase tracking-wider">
                  Relación o Parentesco *
                </label>
                <input 
                  type="text"
                  placeholder="Ej. Médico Cardiólogo, Hijo, etc."
                  value={formData.relation}
                  onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                  className={`w-full bg-white dark:bg-prussian-blue-805 border rounded-2xl px-4 py-2.5 text-slate-800 dark:text-prussian-blue-105 outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition ${
                    errors.relation ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-prussian-blue-700'
                  }`}
                />
                {errors.relation && (
                  <p className="text-red-500 text-xs flex items-center gap-1 mt-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.relation}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-prussian-blue-400 uppercase tracking-wider">
                  Número de Teléfono *
                </label>
                <input 
                  type="text"
                  placeholder="Ej. +51 987 654 321"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full bg-white dark:bg-prussian-blue-805 border rounded-2xl px-4 py-2.5 text-slate-800 dark:text-prussian-blue-105 outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition ${
                    errors.phone ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-prussian-blue-700'
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs flex items-center gap-1 mt-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-prussian-blue-400 uppercase tracking-wider">
                  Prioridad *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full bg-white dark:bg-prussian-blue-805 border border-slate-200 dark:border-prussian-blue-700 rounded-2xl px-4 py-2.5 text-slate-800 dark:text-prussian-blue-105 outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition cursor-pointer"
                >
                  <option value="Crítica">Crítica</option>
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-prussian-blue-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-prussian-blue-800 hover:bg-slate-200 dark:hover:bg-prussian-blue-700 text-slate-605 dark:text-prussian-blue-200 rounded-2xl text-xs font-bold transition duration-150 cursor-pointer"
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
              ¿Estás seguro de que deseas eliminar al contacto <span className="font-bold text-slate-800 dark:text-white">"{contactToDelete?.name}"</span>? Esta acción no se puede deshacer y se borrará del directorio de emergencias.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-prussian-blue-800 hover:bg-slate-200 dark:hover:bg-prussian-blue-700 text-slate-605 dark:text-prussian-blue-200 rounded-xl text-xs font-bold transition cursor-pointer"
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
