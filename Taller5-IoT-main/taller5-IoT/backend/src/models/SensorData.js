import mongoose from 'mongoose';

const sensorDataSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
    },
    temperatura: {
      type: Number,
      required: true,
    },
    humedad: {
      type: Number,
      required: true,
    },
    nivelAgua: {
      type: Number,
      required: true,
      min: 0,
      max: 4,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} no es un nivel de agua válido. Debe ser entero entre 0 y 4.'
      }
    },
    timestamp: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

sensorDataSchema.index({ deviceId: 1, timestamp: -1 });

const SensorData = mongoose.model('SensorData', sensorDataSchema);

export default SensorData;
