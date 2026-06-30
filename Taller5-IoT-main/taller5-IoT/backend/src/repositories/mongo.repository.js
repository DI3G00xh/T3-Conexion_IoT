import SensorData from '../models/SensorData.js';

export const saveSensorData = async (data) => {
  try {
    const record = new SensorData(data);
    return await record.save();
  } catch (error) {
    console.error(' Error al guardar datos en MongoDB:', error);
    throw error;
  }
};

export const getSensorDataHistory = async (limit = 100) => {
  try {
    return await SensorData.find()
      .sort({ timestamp: -1 })
      .limit(limit);
  } catch (error) {
    console.error(' Error al consultar historial en MongoDB:', error);
    throw error;
  }
};
