import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import testRoutes from './routes/testRoutes.js';
import authRoutes from './routes/authRoutes.js';
import artworkRoutes from './routes/artworkRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB Atlas before starting the server
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────

// cors: allows the frontend (localhost:5173) to make requests to this backend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// express.json: lets Express read JSON request bodies (e.g. login form data)
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────

// Authentication routes
app.use('/api/auth', authRoutes);

// Artwork routes (Phase 6)
app.use('/api/artworks', artworkRoutes);

// A simple test route to confirm the API is running
app.use('/api', testRoutes);

// ─── Global Error Handler ─────────────────────────────────────────────────────
// This must be registered AFTER all routes.
// Any error passed via next(err) in a route will end up here.
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
