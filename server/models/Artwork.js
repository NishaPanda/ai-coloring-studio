import mongoose from 'mongoose';

const artworkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    pageId: {
      type: String,
      required: true,
      trim: true,
    },
    pageTitle: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      default: 'My Artwork',
      trim: true,
    },
    regionColors: {
      type: Map,
      of: String,
      default: {},
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Artwork = mongoose.model('Artwork', artworkSchema);

export default Artwork;
