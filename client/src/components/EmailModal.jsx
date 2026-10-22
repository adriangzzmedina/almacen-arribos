import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle2, FileText, AlertCircle, Paperclip } from 'lucide-react';

export default function EmailModal({ isOpen, onClose, arribo, detalles = [] }) {
  const [destinatario, setDestinatario] = useState(arribo?.email_cliente || '');
  const [notasAdicionales, setNotasAdicionales] = useState('');
  const [sending, setSending] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen || !arribo) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!destinatario.trim()) {
      setError('Por favor indica un correo electrónico');
      return;
    }

    try {
      setSending(true);
      setError('');
      const res = await fetch(`/api/arribos/${arribo.id}/enviar-correo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinatario: destinatario.trim(),
          notasAdicionales: notasAdicionales.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar correo');

      setResultado(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setResultado(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base">Enviar Boleta de Entrada por Correo</h2>
              <p className="text-xs text-slate-400">Folio: {arribo.folio}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {resultado ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">¡Correo Enviado Exitosamente!</h3>
              <p className="text-sm text-slate-600 mt-1">
                La boleta de recepción ha sido enviada al cliente.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-1.5 text-slate-600">
              <p><strong className="text-slate-800">Destinatario:</strong> {resultado.detallesEnvio.destinatario}</p>
              <p><strong className="text-slate-800">Asunto:</strong> {resultado.detallesEnvio.asunto}</p>
              <p><strong className="text-slate-800">Fecha y Hora:</strong> {resultado.detallesEnvio.fechaEnvio}</p>
              <p><strong className="text-slate-800">Adjunto:</strong> Boleta_{arribo.folio}.pdf</p>
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
            >
              Aceptar y Volver
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Correo Electrónico Destinatario *
              </label>
              <input
                type="email"
                required
                value={destinatario}
                onChange={(e) => setDestinatario(e.target.value)}
                placeholder="correo@cliente.com"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Asunto del Correo
              </label>
              <input
                type="text"
                disabled
                value={`Comprobante de Entrada al Almacén - Folio ${arribo.folio} (${arribo.guia_bol})`}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-xs font-medium cursor-not-allowed"
              />
            </div>

            {/* Tarjeta de archivo adjunto */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Boleta_{arribo.folio}.pdf</p>
                  <p className="text-[11px] text-slate-500">
                    {arribo.bultos} bulto(s) • {arribo.peso_libras} lbs • {detalles.length} partidas
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                <Paperclip className="w-3 h-3" />
                Adjunto
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Mensaje o Notas para el Cliente <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <textarea
                rows="3"
                value={notasAdicionales}
                onChange={(e) => setNotasAdicionales(e.target.value)}
                placeholder="Ej. Estimado cliente, le informamos que su mercancía con guía CAS-98421033 fue recibida en nuestro almacén central conforme a la boleta anexa."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs resize-none"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={sending}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                {sending ? 'Enviando...' : 'Enviar Boleta'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
