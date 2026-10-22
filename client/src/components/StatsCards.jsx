import React from 'react';
import { Truck, Boxes, Scale, ClipboardList } from 'lucide-react';

export default function StatsCards({ stats }) {
  const cards = [
    {
      title: 'Total Arribos Registrados',
      value: stats?.total_arribos ?? 0,
      subValue: `${stats?.arribos_hoy ?? 0} recibidos hoy`,
      icon: Truck,
      color: 'blue'
    },
    {
      title: 'Bultos en Almacén',
      value: Number(stats?.total_bultos ?? 0).toLocaleString(),
      subValue: 'Bultos / Pallets recibidos',
      icon: Boxes,
      color: 'amber'
    },
    {
      title: 'Peso Total Declarado',
      value: `${Number(stats?.total_peso_libras ?? 0).toLocaleString()} lbs`,
      subValue: `Equivalente a ${Number(stats?.total_peso_kg ?? 0).toLocaleString()} kg`,
      icon: Scale,
      color: 'emerald'
    },
    {
      title: 'Partidas Detalladas',
      value: Number(stats?.total_partidas ?? 0).toLocaleString(),
      subValue: `${Number(stats?.total_piezas ?? 0).toLocaleString()} unidades en inventario`,
      icon: ClipboardList,
      color: 'indigo'
    }
  ];

  const colorStyles = {
    blue: {
      bg: 'bg-blue-50 text-blue-600 border-blue-100',
      iconBg: 'bg-blue-600 text-white'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      iconBg: 'bg-amber-600 text-white'
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      iconBg: 'bg-emerald-600 text-white'
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      iconBg: 'bg-indigo-600 text-white'
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((c, i) => {
        const Icon = c.icon;
        const style = colorStyles[c.color];
        return (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                {c.title}
              </p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                {c.value}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {c.subValue}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${style.iconBg}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
