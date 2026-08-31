import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import machineRoutes from './routes/machineRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';
import checksRoutes from './routes/checksRoutes.js';
import toolsRoutes from './routes/toolsRoutes.js';
import workpieceRoutes from './routes/workpieceRoutes.js';
import operationRoutes from './routes/operationRoutes.js';

dotenv.config();

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok'
  });
});

// API Routes
app.use('/api/machine', machineRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/checks', checksRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/workpiece', workpieceRoutes);
app.use('/api/operation', operationRoutes);

// Error handling middleware
app.use(errorHandler);

// Initialize database after app setup
initDatabase().then(() => {
  console.log('✅ Database initialized successfully');
}).catch((error) => {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
});

export default app;
