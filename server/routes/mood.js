const express = require('express');
const router = express.Router();
const Sentiment = require('sentiment');
const MoodPost = require('../models/MoodPost');
const sentiment = new Sentiment();

// POST /api/mood/submit
router.post('/submit', async (req, res) => {
  try {
    const { text, emoji, location } = req.body;
    // Simple sentiment analysis
    const result = sentiment.analyze(text);
    let mood = 'neutral';
    if (result.score > 1) mood = 'happy';
    else if (result.score < -1) mood = 'angry';
    else if (result.score < 0) mood = 'sad';
    // Save mood post
    const post = new MoodPost({
      text,
      emoji,
      sentiment: mood,
      location,
      createdAt: new Date(),
    });
    await post.save();
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/mood/analytics
router.get('/analytics', async (req, res) => {
  try {
    const moods = await MoodPost.aggregate([
      { $group: { _id: '$sentiment', count: { $sum: 1 } } }
    ]);
    res.json({ success: true, moods });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/mood/timeseries
router.get('/timeseries', async (req, res) => {
  try {
    const data = await MoodPost.aggregate([
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            sentiment: "$sentiment"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/mood/map
router.get('/map', async (req, res) => {
  try {
    const posts = await MoodPost.find({ 'location.lat': { $exists: true }, 'location.lng': { $exists: true } }, { text: 1, emoji: 1, sentiment: 1, location: 1, createdAt: 1 });
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router; 