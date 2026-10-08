import mongoose from 'mongoose';

const artworkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coloringPage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ColoringPage',
    required: true
  },
  title: {
    type: String,
    default: 'My Artwork'
  },
  canvasData: {
    type: String, // Store the canvas state/image as a base64 string or similar
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Artwork = mongoose.model('Artwork', artworkSchema);

export default Artwork;
