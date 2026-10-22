import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Printer, Mail, ListPlus, Edit3, Trash2,
  FileText, Truck, ArrowUpDown, Filter, ChevronRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import ArriboModal from './components/ArriboModal';
import DetallesModal from './components/DetallesModal';
import EmailModal from './components/EmailModal';
import { generarBoletaPDF } from './utils/pdfGenerator';

export default function App() {
  const [arribos, setArribos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('Todos');

  // Modales
  const [isArriboModalOpen, setIsArriboModalOpen] = useState(false);
  const [arriboToEdit, setArriboToEdit] = useState(null);

  const [selectedArriboForDetalles, setSelectedArriboForDetalles] = useState(null);
  const [isDetallesModalOpen, setIsDetallesModalOpen] = useState(false);

  const [selectedArriboForEmail, setSelectedArriboForEmail] = useState(null);
  const [detallesForEmail, setDetallesForEmail] = useState([]);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Cargar datos
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resArribos, resStats] = await Promise.all([
        fetch(`/api/arribos?q=${encodeURIComponent(searchQuery)}&estado=${encodeURIComponent(selectedEstado)}`),
        fetch('/api/estadisticas')
      ]);

      if (resArribos.ok) {
        const dataArribos = await resArribos.json();
        setArribos(dataArribos);
      }
      if (resStats.ok) {
        const dataStats = await resStats.json();
        setStats(dataStats);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, selectedEstado]);

  // Guardar nuevo o editar arribo
  const handleSaveArribo = async (formData, id) => {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/arribos/${id}` : '/api/arribos';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al guardar');
    }

    const saved = await res.json();
    await fetchData();

    // Si es nuevo, abrir directamente el detalle de mercancía para facilitarle el registro
    if (!id && saved?.id) {
      setTimeout(() => {
        abrirDetalles(saved);
      }, 300);
    }
  };

  // Eliminar arribo
  const handleDeleteArribo = async (id, folio) => {
    if (!window.confirm(`¿Estás seguro de eliminar el arribo ${folio}? Se eliminarán también todas sus partidas de detalle.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/arribos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Abrir modal de detalles
  const abrirDetalles = async (arribo) => {
    setSelectedArriboForDetalles(arribo);
    setIsDetallesModalOpen(true);
  };

  // Abrir modal de correo
  const abrirCorreo = async (arribo, detallesPrevios = null) => {
    setSelectedArriboForEmail(arribo);
    if (detallesPrevios) {
      setDetallesForEmail(detallesPrevios);
    } else {
      // Obtener partidas si no vienen dadas
      try {
        const res = await fetch(`/api/arribos/${arribo.id}/detalles`);
        if (res.ok) {
          const items = await res.json();
          setDetallesForEmail(items);
        }
      } catch (err) {
        setDetallesForEmail([]);
      }
    }
    setIsEmailModalOpen(true);
  };

  // Generar Boleta PDF directo desde la tabla
  const handleGenerarPDFDirecto = async (arribo) => {
    try {
      const res = await fetch(`/api/arribos/${arribo.id}/detalles`);
      const items = res.ok ? await res.json() : [];
      generarBoletaPDF(arribo, items, false);
    } catch (err) {
      generarBoletaPDF(arribo, [], false);
    }
  };

  // Color de badge de estado
  const getBadgeColor = (estado) => {
    switch (estado) {
      case 'Recibido':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'En Inspección':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Inspeccionado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Concluido':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Barra superior */}
      <Navbar
        onOpenNuevoArribo={() => {
          setArriboToEdit(null);
          setIsArriboModalOpen(true);
        }}
        onRefresh={fetchData}
        loading={loading}
      />

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Banner de bienvenida / instrucciones */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
              Módulo de Recepción & Logística
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Registro y Control de Entradas al Almacén
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Registra arribos de transporte con guía BOL, peso en libras y bultos. Emite de inmediato la boleta oficial de entrada en PDF para el cliente y captura el detalle de números de parte recibidos.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setArriboToEdit(null);
                  setIsArriboModalOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Registrar Nueva Entrada
              </button>
            </div>
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <StatsCards stats={stats} />

        {/* Sección de Gestión de Arribos */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          
          {/* Barra de Filtros y Búsqueda */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por cliente, folio, transportista o guía..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 font-medium"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">
                  Estado:
                </span>
                <select
                  value={selectedEstado}
                  onChange={(e) => setSelectedEstado(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Todos">Todos los Estados</option>
                  <option value="Recibido">Recibido</option>
                  <option value="En Inspección">En Inspección</option>
                  <option value="Inspeccionado">Inspeccionado</option>
                  <option value="Concluido">Concluido</option>
                </select>
              </div>

              <span className="text-xs text-slate-400 font-medium">
                {arribos.length} registros
              </span>
            </div>
          </div>

          {/* Tabla de Arribos */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200/60">
                <tr>
                  <th className="py-3.5 px-4">Folio / Fecha</th>
                  <th className="py-3.5 px-4">Cliente Propietario</th>
                  <th className="py-3.5 px-4">Transporte / Guía BOL</th>
                  <th className="py-3.5 px-4 text-center">Bultos</th>
                  <th className="py-3.5 px-4 text-right">Peso (lbs / kg)</th>
                  <th className="py-3.5 px-4 text-center">Mercancía</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {arribos.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400">
                      {searchQuery
                        ? 'No se encontraron arribos con los términos de búsqueda.'
                        : 'No hay arribos registrados en el sistema.'}
                    </td>
                  </tr>
                ) : (
                  arribos.map((arribo) => {
                    const pesoKg = (Number(arribo.peso_libras || 0) * 0.45359237).toFixed(1);
                    return (
                      <tr key={arribo.id} className="hover:bg-blue-50/30 transition-colors">
                        
                        {/* Folio y Fecha */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-blue-600 block">
                            {arribo.folio}
                          </span>
                          <span className="text-xs text-slate-400">
                            {arribo.fecha_arribo}
                          </span>
                        </td>

                        {/* Cliente */}
                        <td className="py-3.5 px-4 max-w-[200px]">
                          <p className="font-bold text-slate-900 truncate">
                            {arribo.cliente}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {arribo.email_cliente || 'Sin correo registrado'}
                          </p>
                        </td>

                        {/* Transporte & Guía */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
                            <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{arribo.transportista}</span>
                          </div>
                          <span className="text-xs font-mono text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100 mt-1 inline-block">
                            Guía: {arribo.guia_bol}
                          </span>
                        </td>

                        {/* Bultos */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-lg text-xs">
                            {arribo.bultos}
                          </span>
                        </td>

                        {/* Peso */}
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-bold text-slate-900 block">
                            {Number(arribo.peso_libras).toLocaleString()} lbs
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ~{pesoKg} kg
                          </span>
                        </td>

                        {/* Partidas de Detalle */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => abrirDetalles(arribo)}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl font-semibold transition-colors bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                            title="Gestionar partidas de mercancía"
                          >
                            <ListPlus className="w-3.5 h-3.5" />
                            <span>{arribo.cantidad_partidas || 0} partidas</span>
                          </button>
                        </td>

                        {/* Estado */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getBadgeColor(arribo.estado)}`}>
                            {arribo.estado}
                          </span>
                        </td>

                        {/* Botones de Acción */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Boleta PDF */}
                            <button
                              onClick={() => handleGenerarPDFDirecto(arribo)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Generar y abrir Boleta PDF"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {/* Enviar Correo */}
                            <button
                              onClick={() => abrirCorreo(arribo)}
                              className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                              title="Enviar Boleta por correo electrónico"
                            >
                              <Mail className="w-4 h-4" />
                            </button>

                            {/* Editar */}
                            <button
                              onClick={() => {
                                setArriboToEdit(arribo);
                                setIsArriboModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Editar datos de arribo"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Eliminar */}
                            <button
                              onClick={() => handleDeleteArribo(arribo.id, arribo.folio)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar arribo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>

      {/* Modales */}
      <ArriboModal
        isOpen={isArriboModalOpen}
        onClose={() => {
          setIsArriboModalOpen(false);
          setArriboToEdit(null);
        }}
        onSave={handleSaveArribo}
        arriboToEdit={arriboToEdit}
      />

      <DetallesModal
        isOpen={isDetallesModalOpen}
        onClose={() => {
          setIsDetallesModalOpen(false);
          setSelectedArriboForDetalles(null);
          fetchData();
        }}
        arribo={selectedArriboForDetalles}
        onOpenEmail={(arribo, detalles) => {
          setIsDetallesModalOpen(false);
          abrirCorreo(arribo, detalles);
        }}
      />

      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setSelectedArriboForEmail(null);
        }}
        arribo={selectedArriboForEmail}
        detalles={detallesForEmail}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>AlmacénPro • Sistema de Control de Entradas, Arribos y Boletas de Mercancía</p>
      </footer>
    </div>
  );
}
