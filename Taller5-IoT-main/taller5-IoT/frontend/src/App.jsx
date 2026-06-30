import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { 
  Thermometer, 
  Droplets, 
  Cpu, 
  Wifi, 
  WifiOff, 
  Layers 
} from 'lucide-react';

import MetricCard from './components/MetricCard.jsx';
import RealTimeChart from './components/RealTimeChart.jsx';
import WaterLevelIndicator from './components/WaterLevelIndicator.jsx';
import AlertPanel from './components/AlertPanel.jsx';
import HistoryTable from './components/HistoryTable.jsx';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function App() {
  const [deviceId, setDeviceId] = useState('esp32_1');
  const [socketStatus, setSocketStatus] = useState('connecting');
  
  // Datos del dispositivo
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState(null);
  
  const [mongoHistory, setMongoHistory] = useState([]);
  const [mongoLoading, setMongoLoading] = useState(false);

  const fetchMongoHistory = async () => {
    setMongoLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/sensor-data/history?limit=50`);
      if (response.ok) {
        const data = await response.json();
        setMongoHistory(data);
      } else {
        console.error('Error cargando historial de MongoDB');
      }
    } catch (error) {
      console.error('Error de red al consultar MongoDB:', error);
    } finally {
      setMongoLoading(false);
    }
  };

  useEffect(() => {
    console.log(` Conectando con servidor WebSocket en: ${BACKEND_URL}`);
    const socket = io(BACKEND_URL, {
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log(' WebSocket conectado');
      setSocketStatus('connected');
      socket.emit('request-initial', deviceId);
    });

    socket.on('disconnect', () => {
      console.log(' WebSocket desconectado');
      setSocketStatus('disconnected');
    });

    socket.on('initial-state', (data) => {
      if (data.error) {
        console.warn('Backend inicial:', data.error);
        setLatest(null);
        setHistory([]);
        setStats(null);
        setAlerts(null);
        return;
      }
      if (data.deviceId === deviceId) {
        setLatest(data.latest);
        setHistory(data.history || []);
        setStats(data.stats);
        setAlerts(data.alerts);
      }
    });

    socket.on('sensor-update', (data) => {
      if (data.deviceId === deviceId) {
        setLatest(data.latest);
        setHistory(data.history || []);
        setStats(data.stats);
        setAlerts(data.alerts);


        setMongoHistory((prev) => {
          const exists = prev.some(item => 
            new Date(item.timestamp).getTime() === new Date(data.latest.timestamp).getTime()
          );
          if (exists) return prev;
          return [data.latest, ...prev].slice(0, 50); 
        });
      }
    });

    fetchMongoHistory();

    return () => {
      socket.disconnect();
    };
  }, [deviceId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white pb-12">
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                IoT Pulse
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                Monitoreo Avanzado en Tiempo Real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="bg-transparent border-none text-xs text-white focus:outline-none font-bold pr-2 cursor-pointer"
              >
                <option value="esp32_1" className="bg-slate-950">ESP32 Principal (esp32_1)</option>
                <option value="esp32_test" className="bg-slate-950">ESP32 Simulador (esp32_test)</option>
              </select>
            </div>

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              socketStatus === 'connected'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              {socketStatus === 'connected' ? (
                <>
                  <Wifi className="w-3.5 h-3.5 animate-pulse" />
                  <span>ONLINE</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>DESCONECTADO</span>
                </>
              )}
            </div>
          </div>

        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 mt-8 flex flex-col gap-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Temperatura"
            value={latest?.temperatura}
            unit="°C"
            average={stats?.tempAverage}
            icon={Thermometer}
            alert={alerts?.temperature?.active}
            gradientColor="red"
          />

          <MetricCard
            title="Humedad"
            value={latest?.humedad}
            unit="%"
            average={stats?.humidityAverage}
            icon={Droplets}
            alert={false} 
            gradientColor="blue"
          />

          <div className="h-full">
            <WaterLevelIndicator
              level={latest?.nivelAgua !== undefined ? latest.nivelAgua : 0}
              alert={alerts?.waterLevel?.active}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RealTimeChart historyData={history} />
          </div>
          
          <div className="h-full">
            <AlertPanel alerts={alerts} />
          </div>
        </div>

        <div className="w-full">
          <HistoryTable 
            history={mongoHistory} 
            onRefresh={fetchMongoHistory} 
            loading={mongoLoading} 
          />
        </div>

      </main>
    </div>
  );
}
