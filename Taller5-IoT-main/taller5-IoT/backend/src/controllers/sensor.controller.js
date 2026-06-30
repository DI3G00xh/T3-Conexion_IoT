import { processSensorData, getDeviceStatus } from '../services/sensor.service.js';
import { getSensorDataHistory } from '../repositories/mongo.repository.js';

/**
 * POST /sensor-data
 */
export const postSensorData = async (req, res) => {
  try {
    const { deviceId, temperatura, humedad, nivelAgua } = req.body;

    if (!deviceId || typeof deviceId !== 'string' || deviceId.trim() === '') {
      return res.status(400).json({ error: 'El campo "deviceId" es obligatorio y debe ser texto.' });
    }
    if (temperatura === undefined || typeof temperatura !== 'number' || isNaN(temperatura)) {
      return res.status(400).json({ error: 'El campo "temperatura" es obligatorio y debe ser un número.' });
    }
    if (humedad === undefined || typeof humedad !== 'number' || isNaN(humedad)) {
      return res.status(400).json({ error: 'El campo "humedad" es obligatorio y debe ser un número.' });
    }
    if (nivelAgua === undefined || !Number.isInteger(nivelAgua) || nivelAgua < 0 || nivelAgua > 4) {
      return res.status(400).json({ error: 'El campo "nivelAgua" es obligatorio y debe ser un entero entre 0 y 4.' });
    }

    const result = await processSensorData({ deviceId, temperatura, humedad, nivelAgua });

    return res.status(201).json({
      message: 'Lectura procesada y guardada correctamente',
      data: result
    });
  } catch (error) {
    console.error('Error en el controlador POST /sensor-data:', error);
    return res.status(500).json({ error: 'Ocurrió un error interno al procesar los datos.' });
  }
};

/**
 * GET /sensor-data/current/:deviceId
 */
export const getLatestStatus = async (req, res) => {
  try {
    const { deviceId } = req.params;
    if (!deviceId) {
      return res.status(400).json({ error: 'El parámetro "deviceId" es requerido.' });
    }

    const status = await getDeviceStatus(deviceId);
    if (!status) {
      return res.status(404).json({ error: `No se encontraron datos recientes para el dispositivo "${deviceId}".` });
    }

    return res.status(200).json(status);
  } catch (error) {
    console.error(' Error en el controlador GET /sensor-data/current:', error);
    return res.status(500).json({ error: 'Ocurrió un error interno al consultar el estado del dispositivo.' });
  }
};

/**
 * GET /sensor-data/history
 */
export const getHistory = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;
    const history = await getSensorDataHistory(limit);
    return res.status(200).json(history);
  } catch (error) {
    console.error(' Error en el controlador GET /sensor-data/history:', error);
    return res.status(500).json({ error: 'Ocurrió un error interno al consultar el historial.' });
  }
};
