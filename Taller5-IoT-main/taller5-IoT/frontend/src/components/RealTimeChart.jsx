import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function RealTimeChart({ historyData }) {
  const chartData = [...historyData]
    .reverse()
    .map(item => {
      const timeStr = item.timestamp
        ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : '';
      return {
        ...item,
        timeStr,
        temperatura: parseFloat(item.temperatura),
        humedad: parseFloat(item.humedad)
      };
    });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-4 rounded-xl border border-slate-700/60 shadow-xl text-xs">
          <p className="text-slate-400 font-semibold mb-2">{label}</p>
          <p className="text-rose-400 mb-1">
            Temperatura: <span className="font-bold text-white">{payload[0].value}°C</span>
          </p>
          <p className="text-blue-400">
            Humedad: <span className="font-bold text-white">{payload[1].value}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6 rounded-2xl shadow-lg relative overflow-hidden h-[380px] flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Tendencias en Tiempo Real</h3>
          <p className="text-xs text-slate-400">Evolución de los últimos 10 reportes de sensores</p>
        </div>
        <div className="flex gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-slate-300">Temperatura (°C)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-slate-300">Humedad (%)</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            Esperando lecturas de sensores...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="humidGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.3)" vertical={false} />
              
              <XAxis 
                dataKey="timeStr" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                axisLine={false} 
              />
              
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                axisLine={false} 
                domain={['auto', 'auto']}
              />
              
              <Tooltip content={<CustomTooltip />} />

              <Line
                type="monotone"
                dataKey="temperatura"
                stroke="#f43f5e"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 1, fill: '#1e293b' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Temp"
              />

              <Line
                type="monotone"
                dataKey="humedad"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 1, fill: '#1e293b' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Humedad"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
