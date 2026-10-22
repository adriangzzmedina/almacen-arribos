import React, { useState, useEffect } from 'react';
import {
  X, Plus, Trash2, Printer, Mail, Package,
  FileSpreadsheet, Hash, Layers, CheckCircle2, AlertCircle
} from 'lucide-react';
import { generarBoletaPDF } from '../utils/pdfGenerator';

const UNIDADES_MEDIDA = [
  'PZA',
  'CAJA',
  'TARIMA',
  'CARRETE',
  'KG',
  'LBS',
  'METROS',
  'JUEGO',
  'KIT',
  'ROLLO'
];

export default function DetallesModal({
  isOpen,
  onClose,
  arribo,
  onOpenEmail
}) {
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  // Formulario de nueva partida
  const [newItem, setNewItem] = useState({
    numero_parte: '',
    modelo: '',
    descripcion: '',
    cantidad: 1,
    unidad_medida: 'PZA',
    numero_serie: '',
    notas: ''
  });

  // Cargar partidas del arribo
  const cargarDetalles = async () => {
    if (!arribo?.id) return;
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/arribos/${arribo.id}/detalles`);
      if (!res.ok) throw new Error('Error al consultar partidas');
      const data = await res.json();
      setDetalles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && arribo) {
      cargarDetalles();
    }
  }, [isOpen, arribo]);

  if (!isOpen || !arribo) return null;

  // Manejar adición de partida
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.numero_parte.trim()) {
      setError('Ingresa el número de parte');
      return;
    }
    if (!newItem.descripcion.trim()) {
      setError('Ingresa la descripción del artículo');
      return;
    }
    if (!newItem.cantidad || parseFloat(newItem.cantidad) <= 0) {
      setError('Ingresa una cantidad válida mayor a 0');
      return;
    }

    try {
      setAdding(true);
      setError('');
      const res = await fetch(`/api/arribos/${arribo.id}/detalles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });

      if (!res.ok) throw new Error('Error al registrar la partida');
      const itemGuardado = await res.json();

      setDetalles(prev => [...prev, itemGuardado]);

      // Resetear formulario para siguiente partida manteniendo unidad
      setNewItem({
        numero_parte: '',
        modelo: '',
        descripcion: '',
        cantidad: 1,
        unidad_medida: newItem.unidad_medida,
        numero_serie: '',
        notas: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  // Eliminar partida
  const handleDeleteItem = async (detalleId) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta partida?')) return;
    try {
      const res = await fetch(`/api/detalles/${detalleId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar partida');
      setDetalles(prev => prev.filter(d => d.id !== detalleId));
    } catch (err) {
      alert(err.message);
    }
  };

  const totalPiezas = detalles.reduce((sum, item) => sum + Number(item.cantidad || 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header con resumen del arribo */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-md">
                {arribo.folio}
              </span>
              <h2 className="font-bold text-lg text-white">
                Detalle de Mercancía Recibida
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Cliente: <span className="text-slate-200 font-medium">{arribo.cliente}</span> • Guía: <span className="text-sky-300 font-mono">{arribo.guia_bol}</span> • Transportista: {arribo.transportista}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => generarBoletaPDF(arribo, detalles, false)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 font-medium transition-colors"
              title="Generar boleta PDF con las partidas registradas"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              Boleta PDF
            </button>
            <button
              onClick={() => onOpenEmail(arribo, detalles)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
              title="Enviar boleta por correo"
            >
              <Mail className="w-3.5 h-3.5" />
              Enviar Correo
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resumen rápido de bultos y peso */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-4">
            <span>Bultos declarados: <strong className="text-slate-900">{arribo.bultos}</strong></span>
            <span>•</span>
            <span>Peso total: <strong className="text-slate-900">{arribo.peso_libras} lbs</strong></span>
            <span>•</span>
            <span>Partidas registradas: <strong className="text-blue-600">{detalles.length}</strong></span>
            <span>•</span>
            <span>Total unidades: <strong className="text-emerald-700">{totalPiezas.toLocaleString()}</strong></span>
          </div>
          <span className="text-slate-400 font-mono">
            ID de Entrada: #{arribo.id}
          </span>
        </div>

        {/* Body con scroll */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulario para agregar una partida */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 sm:p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              Registrar Nueva Partida / Artículo
            </h3>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* No. Parte */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. de Parte / SKU *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. PART-4402"
                    value={newItem.numero_parte}
                    onChange={(e) => setNewItem({ ...newItem, numero_parte: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                  />
                </div>

                {/* Modelo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Modelo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Series X-300"
                    value={newItem.modelo}
                    onChange={(e) => setNewItem({ ...newItem, modelo: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Cantidad */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cantidad Recibida *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    required
                    value={newItem.cantidad}
                    onChange={(e) => setNewItem({ ...newItem, cantidad: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                  />
                </div>

                {/* Unidad de Medida */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unidad de Medida *
                  </label>
                  <select
                    value={newItem.unidad_medida}
                    onChange={(e) => setNewItem({ ...newItem, unidad_medida: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-medium"
                  >
                    {UNIDADES_MEDIDA.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* Descripción */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Descripción del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sensor de presión hidráulico con conector sellado"
                    value={newItem.descripcion}
                    onChange={(e) => setNewItem({ ...newItem, descripcion: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Número de Serie (opcional) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Número de Serie <span className="text-slate-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. SN-99820-A"
                    value={newItem.numero_serie}
                    onChange={(e) => setNewItem({ ...newItem, numero_serie: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={adding}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {adding ? 'Guardando...' : 'Agregar Partida'}
                </button>
              </div>
            </form>
          </div>

          {/* Listado de partidas registradas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-600" />
                Partidas Asociadas ({detalles.length})
              </h3>
              {detalles.length > 0 && (
                <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {totalPiezas.toLocaleString()} unidades totales
                </span>
              )}
            </div>

            {loading ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                Cargando partidas...
              </div>
            ) : detalles.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">Aún no se han capturado partidas para este arribo</p>
                <p className="text-xs text-slate-400 mt-1">Usa el formulario superior para registrar el contenido de la entrada.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-center">#</th>
                      <th className="py-2.5 px-3">No. Parte</th>
                      <th className="py-2.5 px-3">Modelo</th>
                      <th className="py-2.5 px-3">Descripción</th>
                      <th className="py-2.5 px-3 text-right">Cantidad</th>
                      <th className="py-2.5 px-3 text-center">U.M.</th>
                      <th className="py-2.5 px-3">No. Serie</th>
                      <th className="py-2.5 px-3 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                    {detalles.map((d, index) => (
                      <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 text-center text-slate-400">{index + 1}</td>
                        <td className="py-2 px-3 font-mono font-semibold text-slate-900">{d.numero_parte}</td>
                        <td className="py-2 px-3 text-slate-600">{d.modelo || '-'}</td>
                        <td className="py-2 px-3 text-slate-800">{d.descripcion}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">{Number(d.cantidad).toLocaleString()}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {d.unidad_medida}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-500">{d.numero_serie || '-'}</td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => handleDeleteItem(d.id)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Eliminar partida"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Los cambios se guardan automáticamente en la base de datos de almacén.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );
}
