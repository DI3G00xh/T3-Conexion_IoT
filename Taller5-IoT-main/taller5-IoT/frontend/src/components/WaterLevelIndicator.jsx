import React from 'react';
import { Droplet } from 'lucide-react';

export default function WaterLevelIndicator({ level, alert }) {
  const levelsMap = {
    0: { pct: 0, label: "Vacío", color: "bg-rose-600/40", text: "text-rose-500" },
    1: { pct: 25, label: "Bajo", color: "bg-amber-500/60", text: "text-amber-500" },
    2: { pct: 50, label: "Medio", color: "bg-blue-500/70", text: "text-blue-400" },
    3: { pct: 75, label: "Alto", color: "bg-cyan-500/80", text: "text-cyan-400" },
    4: { pct: 100, label: "Lleno", color: "bg-emerald-500/90", text: "text-emerald-400" }
  };

  const current = levelsMap[level] || levelsMap[0];

  return (
    <div className="glass-panel p-6 rounded-2xl shadow-lg relative overflow-hidden h-[380px] flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Droplet className="w-5 h-5 text-blue-400" />
          Nivel de Agua
        </h3>
        <p className="text-xs text-slate-400">Estado del depósito en tiempo real</p>
      </div>

      <div className="flex items-center gap-8 my-auto justify-center">
        <div className="relative w-28 h-56 rounded-3xl border-2 border-slate-700/80 bg-slate-900/60 overflow-hidden shadow-inner flex flex-col justify-end">
          
          <div 
            className={`w-full transition-all duration-1000 ease-out relative ${current.color}`}
            style={{ height: `${current.pct}%` }}
          >
            {current.pct > 0 && (
              <div className="absolute -top-3 left-0 w-[200%] h-4 bg-inherit rounded-[40%] animate-[spin_6s_linear_infinite] opacity-60 transform -translate-x-1/4" />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
          </div>

          <div className="absolute inset-y-0 right-2 flex flex-col justify-between py-4 text-[9px] text-slate-500 font-bold select-none">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {current.pct}%
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estado</span>
            <div className={`text-xl font-extrabold ${current.text}`}>
              {current.label}
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Valor Crudo</span>
            <div className="text-slate-100 font-bold text-md">
              Nivel {level} / 4
            </div>
          </div>

          {alert && (
            <div className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold animate-pulse-slow">
              ¡Alerta Nivel Bajo!
            </div>
          )}
        </div>
      </div>

      <div className="text-[10px] text-slate-400 border-t border-slate-800/60 pt-3">
        Sensor: <span className="font-semibold text-slate-200">sensor_nivel_agua</span>
      </div>
    </div>
  );
}
