import express from 'express';
import {
  createArtwork,
  getMyArtworks,
  getArtworkById,
  updateArtwork,
  deleteArtwork,
} from '../controllers/artworkController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All artwork endpoints require user authentication
router.use(protect);

// /api/artworks
router.route('/')
  .post(createArtwork)
  .get(getMyArtworks);

// /api/artworks/:id
router.route('/:id')
  .get(getArtworkById)
  .put(updateArtwork)
  .delete(deleteArtwork);

export default router;
