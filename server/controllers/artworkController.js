import mongoose from 'mongoose';
import Artwork from '../models/Artwork.js';

// ─── Create Artwork ───────────────────────────────────────────────────────────
// @route   POST /api/artworks
// @access  Private (protected by JWT)
export const createArtwork = async (req, res, next) => {
  try {
    const { pageId, pageTitle, title, regionColors, isPublic } = req.body;

    // Validate required fields
    if (!pageId) {
      return res.status(400).json({ success: false, message: 'Page ID is required' });
    }

    if (!regionColors || typeof regionColors !== 'object') {
      return res.status(400).json({ success: false, message: 'Region color data is required' });
    }

    const artwork = await Artwork.create({
      user: req.user._id,
      pageId: String(pageId).trim(),
      pageTitle: pageTitle ? String(pageTitle).trim() : 'Coloring Page',
      title: title && String(title).trim().length > 0 ? String(title).trim() : `${pageTitle || 'My'} Artwork`,
      regionColors,
      isPublic: Boolean(isPublic),
    });

    res.status(201).json({
      success: true,
      artwork,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Artworks for Logged-in User ──────────────────────────────────────
// @route   GET /api/artworks
// @access  Private
export const getMyArtworks = async (req, res, next) => {
  try {
    const artworks = await Artwork.find({ user: req.user._id }).sort({ updatedAt: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: artworks.length,
      artworks,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Artwork by ID ─────────────────────────────────────────────────
// @route   GET /api/artworks/:id
// @access  Private
export const getArtworkById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid artwork ID' });
    }

    const artwork = await Artwork.findById(id);

    if (!artwork) {
      return res.status(404).json({ success: false, message: 'Artwork not found' });
    }

    // Enforce ownership: only the owner (or public artwork in future phases)
    if (artwork.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this artwork' });
    }

    res.status(200).json({
      success: true,
      artwork,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update Artwork ───────────────────────────────────────────────────────────
// @route   PUT /api/artworks/:id
// @access  Private
export const updateArtwork = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, regionColors, isPublic } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid artwork ID' });
    }

    const artwork = await Artwork.findById(id);

    if (!artwork) {
      return res.status(404).json({ success: false, message: 'Artwork not found' });
    }

    // Enforce ownership
    if (artwork.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this artwork' });
    }

    if (title !== undefined && String(title).trim().length > 0) {
      artwork.title = String(title).trim();
    }

    if (regionColors !== undefined && typeof regionColors === 'object') {
      artwork.regionColors = regionColors;
    }

    if (isPublic !== undefined) {
      artwork.isPublic = Boolean(isPublic);
    }

    const updatedArtwork = await artwork.save();

    res.status(200).json({
      success: true,
      artwork: updatedArtwork,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Artwork ───────────────────────────────────────────────────────────
// @route   DELETE /api/artworks/:id
// @access  Private
export const deleteArtwork = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid artwork ID' });
    }

    const artwork = await Artwork.findById(id);

    if (!artwork) {
      return res.status(404).json({ success: false, message: 'Artwork not found' });
    }

    // Enforce ownership
    if (artwork.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this artwork' });
    }

    await artwork.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Artwork deleted successfully',
      id,
    });
  } catch (error) {
    next(error);
  }
};
