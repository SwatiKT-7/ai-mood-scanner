const mongoose = require('mongoose');

const MoodPostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  text: { type: String, required: true },
  emoji: { type: String, required: true },
  sentiment: { type: String, required: true },
  location: {
    lat: Number,
    lng: Number,
    city: String,
    country: String,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MoodPost', MoodPostSchema); 