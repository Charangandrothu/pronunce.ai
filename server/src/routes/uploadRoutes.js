import express from 'express';
import { upload } from '../middleware/multer.js';
import { handleUpload } from '../controllers/uploadController.js';
import { handleAnalysis } from '../controllers/analysisController.js';

const router = express.Router();

// Upload audio endpoint (validates extension and size via Multer, duration via Controller)
router.post('/upload', upload.single('file'), handleUpload);

// Analyze transcript and evaluate pronunciation pipeline
router.post('/analyze', handleAnalysis);

export default router;
