import mongoose from 'mongoose';

const coloringPageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['Animals', 'Nature', 'Fantasy', 'Space', 'Vehicles', 'Mandalas'],
    required: true
  },
  imageUrl: {
    type: String, // URL to the actual image/svg file
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  tags: [String]
}, {
  timestamps: true
});

const ColoringPage = mongoose.model('ColoringPage', coloringPageSchema);

export default ColoringPage;
