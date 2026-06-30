import React from 'react';

export default function MetricCard({
  title,
  value,
  unit,
  average,
  icon: Icon,
  alert,
  gradientColor = "blue",
}) {
  const colorMap = {
    blue: {
      text: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      glow: "shadow-blue-500/5",
    },
    red: {
      text: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      glow: "shadow-rose-500/5",
    },
    amber: {
      text: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      glow: "shadow-amber-500/5",
    },
    emerald: {
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      glow: "shadow-emerald-500/5",
    },
  };

  const style = colorMap[gradientColor] || colorMap.blue;

  return (
    <div className={`glass-panel glass-panel-hover p-6 rounded-2xl transition-all duration-300 shadow-lg ${style.glow} relative overflow-hidden group`}>
      <div className={`absolute -right-16 -top-16 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${style.bg}`} />

      <div className="flex justify-between items-start">
        <div>
          <span className="text-slate-400 text-sm font-medium tracking-wide block mb-1">
            {title}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {value !== undefined && value !== null ? value : '--'}
            </span>
            <span className={`text-lg font-semibold ${style.text}`}>
              {unit}
            </span>
          </div>
        </div>

        <div className={`p-3 rounded-xl ${style.bg} ${style.border} border`}>
          {Icon && <Icon className={`w-6 h-6 ${style.text}`} />}
        </div>
      </div>

      <div className="mt-5 flex justify-between items-center border-t border-slate-800/60 pt-4">
        <div className="text-xs text-slate-400">
          Promedio: <span className="text-slate-200 font-semibold">{average !== undefined && average !== null ? `${average}${unit}` : '--'}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${alert ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'} inline-block`} />
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">
            {alert ? 'Alerta' : 'Normal'}
          </span>
        </div>
      </div>
    </div>
  );
}
