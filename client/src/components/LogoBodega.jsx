import React from 'react';

/**
 * Logotipo sobrio y elegante para Bodega / Almacén Industrial.
 * Paleta estricta de 2 colores: Fondo Azul Industrial (#0b223d) y Frente Amarillo (#fbbf24).
 * Representa una nave industrial con muelles de carga seccionales (roll-up gates),
 * ventanales superiores de almacén y tarima con mercancía en recepción.
 */
export default function LogoBodega({ className = "w-14 h-14", variant = "azul-amarillo", ...props }) {
  // Variantes de color solicitadas (por defecto: fondo azul, frente amarillo)
  const isYellowRed = variant === "amarillo-rojo";
  const bgColor = isYellowRed ? "#facc15" : "#0b223d"; // Fondo: Amarillo o Azul Profundo
  const fgColor = isYellowRed ? "#dc2626" : "#fbbf24"; // Frente: Rojo o Amarillo Oro

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 drop-shadow-md select-none`}
      {...props}
    >
      {/* 1. Fondo sólido con esquinas redondeadas modernas */}
      <rect width="120" height="120" rx="26" fill={bgColor} />

      {/* 2. Frente gráfico (Estructura de Bodega / Nave Industrial) */}
      
      {/* Línea de base / plataforma de andén */}
      <rect x="14" y="94" width="92" height="4" rx="2" fill={fgColor} />

      {/* Techo y alero industrial de baja pendiente (arquitectura de nave logística) */}
      <path
        d="M 60 25 L 106 43 L 104 48 L 60 30.5 L 16 48 L 14 43 Z"
        fill={fgColor}
      />

      {/* Remate superior de ventilación / claraboya de techo */}
      <rect x="52" y="21" width="16" height="3.5" rx="1" fill={fgColor} />
      <rect x="55" y="24.5" width="2" height="3" fill={fgColor} />
      <rect x="63" y="24.5" width="2" height="3" fill={fgColor} />

      {/* Columnas maestras exteriores de la bodega */}
      <rect x="20" y="47" width="4" height="47" rx="1" fill={fgColor} />
      <rect x="96" y="47" width="4" height="47" rx="1" fill={fgColor} />

      {/* Ventanales altos tipo triforio (iluminación cenital de bodega) */}
      <rect x="28" y="46" width="16" height="5" rx="1.5" fill={fgColor} />
      <rect x="52" y="42" width="16" height="5" rx="1.5" fill={fgColor} />
      <rect x="76" y="46" width="16" height="5" rx="1.5" fill={fgColor} />

      {/* Viga dintel horizontal de soporte de muelles */}
      <rect x="20" y="56" width="80" height="4" rx="1" fill={fgColor} />

      {/* Columnas divisoras entre muelles de carga */}
      <rect x="45" y="56" width="3.5" height="38" fill={fgColor} />
      <rect x="71" y="56" width="3.5" height="38" fill={fgColor} />

      {/* --- Muelle 1 (Izquierdo): Portón seccional acanalado cerrado --- */}
      <g stroke={fgColor} strokeWidth="2.2" strokeLinecap="round">
        <line x1="27" y1="64" x2="42" y2="64" />
        <line x1="27" y1="71.5" x2="42" y2="71.5" />
        <line x1="27" y1="79" x2="42" y2="79" />
        <line x1="27" y1="86.5" x2="42" y2="86.5" />
      </g>

      {/* --- Muelle 2 (Central): Portón abierto con tarima y carga recibida --- */}
      {/* Cortina levantada en la parte superior */}
      <line x1="51.5" y1="63" x2="68" y2="63" stroke={fgColor} strokeWidth="3" strokeLinecap="round" />
      
      {/* Tarima / Pallet industrial de madera */}
      <rect x="51" y="90" width="17" height="3" rx="0.5" fill={fgColor} />
      
      {/* Bultos / Cajas apiladas en el andén de recepción */}
      <rect x="52" y="78" width="7" height="11" rx="1" fill={fgColor} />
      <rect x="60.5" y="74" width="7.5" height="15" rx="1" fill={fgColor} />
      <rect x="53.5" y="69" width="6" height="8" rx="0.8" fill={fgColor} />

      {/* --- Muelle 3 (Derecho): Portón seccional acanalado cerrado --- */}
      <g stroke={fgColor} strokeWidth="2.2" strokeLinecap="round">
        <line x1="77.5" y1="64" x2="92.5" y2="64" />
        <line x1="77.5" y1="71.5" x2="92.5" y2="71.5" />
        <line x1="77.5" y1="79" x2="92.5" y2="79" />
        <line x1="77.5" y1="86.5" x2="92.5" y2="86.5" />
      </g>

      {/* Topes de goma / defensas de andén en la base (dock bumpers) */}
      <rect x="23" y="95" width="3" height="4" rx="1" fill={fgColor} />
      <rect x="42.5" y="95" width="3" height="4" rx="1" fill={fgColor} />
      <rect x="48.5" y="95" width="3" height="4" rx="1" fill={fgColor} />
      <rect x="68" y="95" width="3" height="4" rx="1" fill={fgColor} />
      <rect x="74" y="95" width="3" height="4" rx="1" fill={fgColor} />
      <rect x="93" y="95" width="3" height="4" rx="1" fill={fgColor} />
    </svg>
  );
}
