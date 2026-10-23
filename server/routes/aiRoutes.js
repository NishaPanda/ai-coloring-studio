import express from 'express';
import { suggestColors } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/ai/suggest-colors
router.post('/suggest-colors', suggestColors);

export default router;
