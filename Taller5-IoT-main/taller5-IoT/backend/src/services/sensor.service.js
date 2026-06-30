import { saveSensorData } from '../repositories/mongo.repository.js';
import { updateRedisCache, getRedisRealTimeData } from '../repositories/redis.repository.js';
import dotenv from 'dotenv';

dotenv.config();

let io = null;

const ALERT_TEMP_THRESHOLD = parseFloat(process.env.ALERT_TEMP_THRESHOLD || '30.0');
const ALERT_WATER_THRESHOLD = parseInt(process.env.ALERT_WATER_THRESHOLD || '1', 10);


export const setSocketIoInstance = (socketIoInstance) => {
  io = socketIoInstance;
};

export const processSensorData = async (payload) => {
  const { deviceId, temperatura, humedad, nivelAgua } = payload;
  const timestamp = new Date();

  const data = {
    deviceId,
    temperatura: parseFloat(parseFloat(temperatura).toFixed(2)),
    humedad: parseFloat(parseFloat(humedad).toFixed(2)),
    nivelAgua: parseInt(nivelAgua, 10),
    timestamp
  };

  const alertTemp = data.temperatura > ALERT_TEMP_THRESHOLD;
  const alertWater = data.nivelAgua <= ALERT_WATER_THRESHOLD;

  const alerts = {
    temperature: {
      active: alertTemp,
      message: alertTemp ? `¡Temperatura de ${data.temperatura}°C supera el límite de ${ALERT_TEMP_THRESHOLD}°C!` : null
    },
    waterLevel: {
      active: alertWater,
      message: alertWater ? `¡Nivel de agua crítico! Nivel actual: ${data.nivelAgua}` : null
    }
  };

  try {
    const [mongoResult, redisStats] = await Promise.all([
      saveSensorData(data),
      updateRedisCache(deviceId, data)
    ]);

    const rtData = await getRedisRealTimeData(deviceId);

    const updatePayload = {
      deviceId,
      latest: data,
      alerts,
      history: rtData?.history || [],
      stats: rtData?.stats || {
        totalCount: 1,
        tempAverage: data.temperatura,
        humidityAverage: data.humedad,
        lastNivelAgua: data.nivelAgua,
        lastTimestamp: timestamp.toISOString()
      }
    };

    if (io) {
      io.emit('sensor-update', updatePayload);
      console.log(` Datos emitidos vía WebSocket para dispositivo: ${deviceId}`);
    } else {
      console.warn(' Instancia Socket.io no configurada en el servicio');
    }

    return updatePayload;
  } catch (error) {
    console.error(' Error al procesar datos del sensor en el servicio:', error);
    throw error;
  }
};

export const getDeviceStatus = async (deviceId) => {
  try {
    const rtData = await getRedisRealTimeData(deviceId);
    if (!rtData || !rtData.latest) {
      return null;
    }

    const alertTemp = rtData.latest.temperatura > ALERT_TEMP_THRESHOLD;
    const alertWater = rtData.latest.nivelAgua <= ALERT_WATER_THRESHOLD;

    return {
      deviceId,
      latest: rtData.latest,
      history: rtData.history,
      stats: rtData.stats,
      alerts: {
        temperature: {
          active: alertTemp,
          message: alertTemp ? `¡Temperatura de ${rtData.latest.temperatura}°C supera el límite de ${ALERT_TEMP_THRESHOLD}°C!` : null
        },
        waterLevel: {
          active: alertWater,
          message: alertWater ? `¡Nivel de agua crítico! Nivel actual: ${rtData.latest.nivelAgua}` : null
        }
      }
    };
  } catch (error) {
    console.error(` Error recuperando estado del dispositivo ${deviceId}:`, error);
    throw error;
  }
};
