/**
   ESP32 Telementry Simulator - Node.js
   Sends HTTP POST requests containing sensor JSON to the backend every 10 seconds.
   Works with Node 18+ (uses native fetch).
   
   Uso:
     node simulator.js [BACKEND_URL] [DEVICE_ID]
   Ejemplo:
     node simulator.js http://localhost:5000/sensor-data esp32_1
*/

const BACKEND_URL = process.argv[2] || 'http://localhost:5000/sensor-data';
const DEVICE_ID = process.argv[3] || 'esp32_1';

console.log(` Iniciando simulador de ESP32...`);
console.log(` URL de Destino: ${BACKEND_URL}`);
console.log(` ID de Dispositivo: ${DEVICE_ID}`);
console.log(` Intervalo: Cada 10 segundos`);
console.log(`-----------------------------------------------`);

let temperatura = 24.5;
let humedad = 55.0;
let nivelAgua = 4; // lleno

const sendTelemetry = async () => {
  const tempDelta = (Math.random() - 0.5) * 1.5; // Cambios de hasta ±0.75°C
  const humDelta = (Math.random() - 0.5) * 3;     // Cambios de hasta ±1.5%

  temperatura = Math.max(15, Math.min(42, temperatura + tempDelta));
  humedad = Math.max(20, Math.min(95, humedad + humDelta));

  // Simular drenaje de agua: 10% de probabilidad de bajar el nivel, y si llega a 0, 20% de reiniciarse/llenarse.
  const randWater = Math.random();
  if (nivelAgua === 0) {
    if (randWater < 0.2) {
      nivelAgua = 4; // Depósito rellenado
      console.log(' [Simulador] El tanque de agua ha sido rellenado a su capacidad máxima.');
    }
  } else {
    if (randWater < 0.1) {
      nivelAgua -= 1;
      console.log(` [Simulador] El nivel de agua disminuyó a: ${nivelAgua}`);
    }
  }

  const payload = {
    deviceId: DEVICE_ID,
    temperatura: parseFloat(temperatura.toFixed(2)),
    humedad: parseFloat(humedad.toFixed(2)),
    nivelAgua: nivelAgua
  };

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const status = response.status;
    const bodyText = await response.text();

    let parsedBody;
    try {
      parsedBody = JSON.parse(bodyText);
    } catch {
      parsedBody = bodyText;
    }

    if (response.ok) {
      console.log(` [${new Date().toLocaleTimeString()}] Enviado con éxito!`);
      console.log(`   Datos: Temp: ${payload.temperatura}°C | Hum: ${payload.humedad}% | NivelAgua: ${payload.nivelAgua}`);
      if (parsedBody.data?.alerts?.temperature?.active || parsedBody.data?.alerts?.waterLevel?.active) {
        console.log('    ALERTA ACTIVA EN EL BACKEND:', JSON.stringify(parsedBody.data.alerts));
      }
    } else {
      console.error(` [${new Date().toLocaleTimeString()}] Error del Servidor (HTTP ${status}):`, parsedBody);
    }
  } catch (error) {
    console.error(` [${new Date().toLocaleTimeString()}] Error de conexión de red:`, error.message);
  }
};

sendTelemetry();
setInterval(sendTelemetry, 10000);
