import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import uploadRoutes from './routes/uploadRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Add Helmet for security headers
app.use(helmet());

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming JSON body payloads
app.use(express.json());

// Log HTTP requests in developer format
app.use(morgan('dev'));

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API system is operational.'
  });
});

// Mount upload and analysis routes
app.use('/api', uploadRoutes);

// 404 Fallback Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler (must be registered last)
app.use(errorHandler);

export default app;
