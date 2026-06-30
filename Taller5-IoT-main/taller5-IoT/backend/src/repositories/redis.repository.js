import { getRedisClient } from '../config/db.js';

export const updateRedisCache = async (deviceId, data) => {
  const redis = getRedisClient();
  if (!redis) {
    console.warn(' Cliente Redis no disponible para caché');
    return null;
  }

  const dataStr = JSON.stringify(data);

  try {
    const multi = redis.multi();

    multi.set(`sensor:latest:${deviceId}`, dataStr);

    multi.lPush(`sensor:history:${deviceId}`, dataStr);
    multi.lTrim(`sensor:history:${deviceId}`, 0, 9);

    await multi.exec();

    const statsKey = `sensor:stats:${deviceId}`;
    const stats = await redis.hGetAll(statsKey);

    let totalCount = 1;
    let tempSum = data.temperatura;
    let humiditySum = data.humedad;

    if (stats && stats.totalCount) {
      totalCount = parseInt(stats.totalCount, 10) + 1;
      tempSum = parseFloat(stats.tempSum) + data.temperatura;
      humiditySum = parseFloat(stats.humiditySum) + data.humedad;
    }

    const tempAverage = parseFloat((tempSum / totalCount).toFixed(2));
    const humidityAverage = parseFloat((humiditySum / totalCount).toFixed(2));

    await redis.hSet(statsKey, {
      totalCount: totalCount.toString(),
      tempSum: tempSum.toFixed(2),
      humiditySum: humiditySum.toFixed(2),
      tempAverage: tempAverage.toString(),
      humidityAverage: humidityAverage.toString(),
      lastNivelAgua: data.nivelAgua.toString(),
      lastTimestamp: data.timestamp instanceof Date ? data.timestamp.toISOString() : (data.timestamp || new Date().toISOString())
    });

    return {
      tempAverage,
      humidityAverage,
      totalCount
    };
  } catch (error) {
    console.error(' Error al actualizar caché en Redis:', error);
    return null;
  }
};

export const getRedisRealTimeData = async (deviceId) => {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const latestStr = await redis.get(`sensor:latest:${deviceId}`);
    const historyStrs = await redis.lRange(`sensor:history:${deviceId}`, 0, -1);
    const stats = await redis.hGetAll(`sensor:stats:${deviceId}`);

    const latest = latestStr ? JSON.parse(latestStr) : null;
    const history = historyStrs.map(str => JSON.parse(str));

    return {
      latest,
      history,
      stats: stats.totalCount ? {
        totalCount: parseInt(stats.totalCount, 10),
        tempAverage: parseFloat(stats.tempAverage),
        humidityAverage: parseFloat(stats.humidityAverage),
        lastNivelAgua: parseInt(stats.lastNivelAgua, 10),
        lastTimestamp: stats.lastTimestamp
      } : null
    };
  } catch (error) {
    console.error(' Error al recuperar datos de Redis:', error);
    return null;
  }
};
