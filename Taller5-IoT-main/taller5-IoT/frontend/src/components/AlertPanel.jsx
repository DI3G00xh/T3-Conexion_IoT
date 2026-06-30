import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AlertPanel({ alerts }) {
  const activeAlerts = [];

  if (alerts?.temperature?.active) {
    activeAlerts.push({
      type: 'temperature',
      title: 'Temperatura Excesiva',
      message: alerts.temperature.message,
      color: 'rose',
    });
  }

  if (alerts?.waterLevel?.active) {
    activeAlerts.push({
      type: 'waterLevel',
      title: 'Nivel de Agua Bajo',
      message: alerts.waterLevel.message,
      color: 'amber',
    });
  }

  return (
    <div className="glass-panel p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between h-full min-h-[140px]">
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
          Centro de Alertas
        </h3>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-3">
        {activeAlerts.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-bold text-sm">Estado del Sistema: Óptimo</p>
              <p className="text-[11px] text-emerald-500/95">Todos los parámetros se encuentran en los rangos seguros definidos.</p>
            </div>
          </div>
        ) : (
          activeAlerts.map((alert, idx) => (
            <div 
              key={idx} 
              className={`flex items-start gap-3 p-4 rounded-xl border animate-pulse-slow ${
                alert.color === 'rose' 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              <div className={`p-2 rounded-lg ${alert.color === 'rose' ? 'bg-rose-500/20' : 'bg-amber-500/20'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{alert.title}</p>
                <p className="text-xs opacity-90 leading-relaxed mt-0.5">{alert.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
