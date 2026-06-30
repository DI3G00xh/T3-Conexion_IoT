import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { connectMongoDB, connectRedis } from './config/db.js';
import { setSocketIoInstance, getDeviceStatus } from './services/sensor.service.js';
import { postSensorData, getLatestStatus, getHistory } from './controllers/sensor.controller.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: corsOrigin,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

setSocketIoInstance(io);

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Servidor Backend IoT - Taller 5 funcionando correctamente.',
    endpoints: {
      postData: 'POST /sensor-data',
      currentStatus: 'GET /sensor-data/current/:deviceId',
      historicalHistory: 'GET /sensor-data/history'
    }
  });
});

app.post('/sensor-data', postSensorData);
app.get('/sensor-data/current/:deviceId', getLatestStatus);
app.get('/sensor-data/history', getHistory);

io.on('connection', (socket) => {
  console.log(` Cliente conectado vía WebSocket: ${socket.id}`);

  socket.on('request-initial', async (deviceId) => {
    try {
      console.log(`Cliente ${socket.id} solicita datos iniciales para: ${deviceId}`);
      const status = await getDeviceStatus(deviceId);
      if (status) {
        socket.emit('initial-state', status);
      } else {
        socket.emit('initial-state', { error: `Sin datos para ${deviceId}` });
      }
    } catch (error) {
      console.error('Error al enviar estado inicial por Socket:', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(` Cliente desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectMongoDB();
  await connectRedis();

  httpServer.listen(PORT, () => {
    console.log(`-> Servidor backend IoT corriendo en http://localhost:${PORT}`);
  });
};

startServer();
