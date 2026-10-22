import React, { useState, useEffect } from 'react';
import { X, Truck, Calendar, User, Mail, FileText, Scale, Boxes, Tag, AlertCircle } from 'lucide-react';

const TRANSPORTISTAS_COMUNES = [
  'Transportes Castores',
  'Tresguerras Express',
  'DHL Freight / Supply Chain',
  'FedEx Freight',
  'Estafeta Carga',
  'Potosinos Express Pack',
  'Fletera Nacional Particular',
  'Transportes Monterrey',
  'Redpack'
];

export default function ArriboModal({ isOpen, onClose, onSave, arriboToEdit }) {
  const [formData, setFormData] = useState({
    fecha_arribo: '',
    cliente: '',
    email_cliente: '',
    transportista: '',
    guia_bol: '',
    bultos: 1,
    peso_libras: '',
    descripcion_general: '',
    estado: 'Recibido'
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (arriboToEdit) {
      setFormData({
        fecha_arribo: arriboToEdit.fecha_arribo || '',
        cliente: arriboToEdit.cliente || '',
        email_cliente: arriboToEdit.email_cliente || '',
        transportista: arriboToEdit.transportista || '',
        guia_bol: arriboToEdit.guia_bol || '',
        bultos: arriboToEdit.bultos || 1,
        peso_libras: arriboToEdit.peso_libras || '',
        descripcion_general: arriboToEdit.descripcion_general || '',
        estado: arriboToEdit.estado || 'Recibido'
      });
    } else {
      // Valor predeterminado: fecha y hora actual en formato YYYY-MM-DDTHH:mm
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      const localISOTime = new Date(now - offset).toISOString().slice(0, 16);

      setFormData({
        fecha_arribo: localISOTime.replace('T', ' '),
        cliente: '',
        email_cliente: '',
        transportista: '',
        guia_bol: '',
        bultos: 1,
        peso_libras: '',
        descripcion_general: '',
        estado: 'Recibido'
      });
    }
    setError('');
  }, [arriboToEdit, isOpen]);

  if (!isOpen) return null;

  const pesoKg = formData.peso_libras
    ? (parseFloat(formData.peso_libras) * 0.45359237).toFixed(2)
    : '0.00';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cliente.trim()) {
      setError('Por favor indica el nombre del cliente');
      return;
    }
    if (!formData.transportista.trim()) {
      setError('Por favor indica la línea transportista');
      return;
    }
    if (!formData.guia_bol.trim()) {
      setError('Por favor indica el número de guía o Bill of Lading (BOL)');
      return;
    }
    if (!formData.peso_libras || parseFloat(formData.peso_libras) <= 0) {
      setError('Ingresa un peso válido en libras');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await onSave(formData, arriboToEdit?.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar el arribo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">
                {arriboToEdit ? `Editar Arribo (${arriboToEdit.folio})` : 'Registrar Nuevo Arribo al Almacén'}
              </h2>
              <p className="text-xs text-slate-400">
                Captura los datos del transporte y recepción de bultos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Fecha de Arribo */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Fecha y Hora de Arribo *
              </label>
              <input
                type="text"
                required
                value={formData.fecha_arribo}
                onChange={(e) => setFormData({ ...formData, fecha_arribo: e.target.value })}
                placeholder="2026-10-21 14:30"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                Estado del Arribo
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-white"
              >
                <option value="Recibido">Recibido en Patio / Rampa</option>
                <option value="En Inspección">En Proceso de Inspección</option>
                <option value="Inspeccionado">Inspeccionado y Conforme</option>
                <option value="Concluido">Concluido y Ubicado</option>
              </select>
            </div>

            {/* Cliente */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Cliente Propietario *
              </label>
              <input
                type="text"
                required
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                placeholder="Ej. Manufacturas del Norte S.A."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Correo Electrónico del Cliente */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                Correo para Boleta de Entrada
              </label>
              <input
                type="email"
                value={formData.email_cliente}
                onChange={(e) => setFormData({ ...formData, email_cliente: e.target.value })}
                placeholder="logistica@cliente.com"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Línea Transportista */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                Línea Transportista *
              </label>
              <input
                type="text"
                required
                list="transportistas-list"
                value={formData.transportista}
                onChange={(e) => setFormData({ ...formData, transportista: e.target.value })}
                placeholder="Ej. Transportes Castores"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <datalist id="transportistas-list">
                {TRANSPORTISTAS_COMUNES.map((t, idx) => (
                  <option key={idx} value={t} />
                ))}
              </datalist>
            </div>

            {/* No. Guía / Bill of Lading */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                No. Guía / Bill of Lading (BOL) *
              </label>
              <input
                type="text"
                required
                value={formData.guia_bol}
                onChange={(e) => setFormData({ ...formData, guia_bol: e.target.value })}
                placeholder="Ej. BOL-99482103"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              />
            </div>

            {/* Cantidad de Bultos */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-blue-600" />
                Cantidad de Bultos / Pallets *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={formData.bultos}
                onChange={(e) => setFormData({ ...formData, bultos: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
              />
            </div>

            {/* Peso Total en Libras (lbs) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-blue-600" />
                  Peso Total en Libras (lbs) *
                </span>
                <span className="text-blue-600 font-bold lowercase">
                  ~{pesoKg} kg
                </span>
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                required
                value={formData.peso_libras}
                onChange={(e) => setFormData({ ...formData, peso_libras: e.target.value })}
                placeholder="Ej. 1250.50"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
              />
            </div>
          </div>

          {/* Descripción General de la Mercancía */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Descripción General de la Mercancía
            </label>
            <textarea
              rows="3"
              value={formData.descripcion_general}
              onChange={(e) => setFormData({ ...formData, descripcion_general: e.target.value })}
              placeholder="Ej. Tarimas flejadas con piezas industriales, refacciones y cables. En buenas condiciones exteriores."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md hover:shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              {saving ? 'Guardando...' : arriboToEdit ? 'Actualizar Arribo' : 'Registrar Entrada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
