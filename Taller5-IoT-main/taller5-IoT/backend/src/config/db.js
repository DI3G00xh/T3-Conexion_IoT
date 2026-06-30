import mongoose from 'mongoose';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient = null;

export const connectMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/iot-taller5';
    await mongoose.connect(mongoUri);
    console.log(' MongoDB conectado exitosamente');
  } catch (error) {
    console.error(' Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

export const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    redisClient = createClient({ url: redisUrl });

    redisClient.on('error', (err) => {
      console.error(' Error en el Cliente Redis:', err);
    });

    redisClient.on('connect', () => {
      console.log(' Conectando a Redis...');
    });

    redisClient.on('ready', () => {
      console.log(' Redis listo y conectado exitosamente');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error(' Error al inicializar Redis:', error.message);
  }
};

export const getRedisClient = () => {
  return redisClient;
};
