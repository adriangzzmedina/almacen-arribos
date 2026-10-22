import React, { useState } from 'react';
import { PlusCircle, RefreshCw, Palette } from 'lucide-react';
import LogoBodega from './LogoBodega';

export default function Navbar({ onOpenNuevoArribo, onRefresh, loading }) {
  // Permite alternar entre las dos opciones de 2 colores solicitadas por el usuario
  const [logoVariant, setLogoVariant] = useState('azul-amarillo'); // 'azul-amarillo' | 'amarillo-rojo'

  const hoy = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const togglePalette = () => {
    setLogoVariant(prev => prev === 'azul-amarillo' ? 'amarillo-rojo' : 'azul-amarillo');
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Identidad de Marca: Logotipo Elegante y Título */}
        <div className="flex items-center gap-3.5">
          <div className="relative group cursor-pointer" onClick={togglePalette} title="Clic para alternar combinación de 2 colores (Azul/Amarillo o Amarillo/Rojo)">
            <LogoBodega
              className="w-14 h-14 sm:w-16 sm:h-16 transition-transform group-hover:scale-105"
              variant={logoVariant}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl sm:text-2xl tracking-tight text-white">
                AlmacénPro
              </h1>
              <span className="text-xs bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                Control de Arribos
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-slate-400 capitalize hidden sm:block">
                {hoy}
              </p>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <button
                onClick={togglePalette}
                className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                title="Cambiar combinación de 2 colores del logotipo"
              >
                <Palette className="w-3 h-3" />
                <span>
                  Logo: {logoVariant === 'azul-amarillo' ? 'Fondo Azul / Frente Amarillo' : 'Fondo Amarillo / Frente Rojo'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Recargar datos"
            className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          <button
            onClick={onOpenNuevoArribo}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 sm:px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/25 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Registrar Entrada</span>
            <span className="sm:hidden">Nueva</span>
          </button>
        </div>

      </div>
    </header>
  );
}
