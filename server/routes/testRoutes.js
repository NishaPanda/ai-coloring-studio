import express from 'express';

const router = express.Router();

// GET /api/test
// A simple health-check route to confirm the API is up and reachable.
// We'll remove this later once real routes are in place.
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: '✅ AI Coloring Studio API is working!',
  });
});

export default router;
