import React, { useState } from 'react';
import { RefreshCw, Database, Search } from 'lucide-react';

export default function HistoryTable({ history, onRefresh, loading }) {
  const [searchTerm, setSearchTerm] = useState('');

  const renderWaterBadge = (level) => {
    const badges = {
      0: { text: "0% - Crítico", css: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
      1: { text: "25% - Bajo", css: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
      2: { text: "50% - Medio", css: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
      3: { text: "75% - Alto", css: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" },
      4: { text: "100% - Lleno", css: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    };
    const badge = badges[level] || { text: `${level}`, css: "bg-slate-500/15 text-slate-400 border-slate-500/30" };

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.css}`}>
        {badge.text}
      </span>
    );
  };

  const filteredHistory = history.filter(item => 
    item.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-panel p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col h-[400px]">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            Historial de MongoDB
          </h3>
          <p className="text-xs text-slate-400">Datos históricos completos almacenados de forma persistente</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Buscar por Disp..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl py-1.5 pl-9 pr-4 text-xs text-slate-200 transition-all placeholder-slate-500 w-36 sm:w-48"
            />
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed transition-all text-white text-xs font-semibold px-4 py-2 rounded-xl active:scale-95 shadow-md shadow-indigo-600/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto border border-slate-800/80 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold sticky top-0 z-10 border-b border-slate-800">
            <tr>
              <th className="px-5 py-3">Timestamp</th>
              <th className="px-5 py-3">Dispositivo</th>
              <th className="px-5 py-3 text-right">Temperatura</th>
              <th className="px-5 py-3 text-right">Humedad</th>
              <th className="px-5 py-3 text-center">Nivel de Agua</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {loading && filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-5 py-8 text-center text-slate-500">
                  Cargando registros históricos...
                </td>
              </tr>
            ) : filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-5 py-8 text-center text-slate-500">
                  No se encontraron registros de sensores.
                </td>
              </tr>
            ) : (
              filteredHistory.map((item, idx) => (
                <tr key={item._id || idx} className="hover:bg-slate-800/25 transition-all text-slate-300">
                  <td className="px-5 py-3 font-mono text-[11px] text-slate-400">
                    {item.timestamp ? new Date(item.timestamp).toLocaleString() : '--'}
                  </td>
                  <td className="px-5 py-3 font-bold text-white">
                    {item.deviceId}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-rose-400">
                    {item.temperatura !== undefined ? `${parseFloat(item.temperatura).toFixed(2)} °C` : '--'}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-blue-400">
                    {item.humedad !== undefined ? `${parseFloat(item.humedad).toFixed(2)} %` : '--'}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {renderWaterBadge(item.nivelAgua)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
