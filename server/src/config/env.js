import dotenv from 'dotenv';
import path from 'path';

// Locate and load the .env file in the server root
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const SARVAM_API_KEY = process.env.SARVAM_API_KEY || '';
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Simple sanity check for API keys
if (!process.env.SARVAM_API_KEY && process.env.NODE_ENV === 'production') {
  console.error("FATAL ERROR: SARVAM_API_KEY is not defined in production environment variables.");
  process.exit(1);
} else if (!process.env.SARVAM_API_KEY) {
  console.warn("WARNING: SARVAM_API_KEY is not defined. The backend will fall back to mock data modes.");
}
