import express from 'express';
import cors from 'cors';
import { config } from './config';
import apiRoutes from './routes';

const app = express();

app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json());

// API Base Route
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'OptiFreight Express Backend', timestamp: new Date() });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 OptiFreight Backend running at http://localhost:${PORT}`);
});
