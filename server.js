/**
 * Main Express Server
 * 
 * This is the entry point of the backend application.
 * It sets up the Express server, middleware, and routes.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import profileRoutes from './routes/profile.js';
import aiRoutes from './routes/ai.js';
import progressRoutes from './routes/progress.js';

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS allows frontend (on Vercel) to communicate with backend (on Render)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Health check endpoint (useful for deployment)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Career Mentor API is running' });
});

// API Routes
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/progress', progressRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
