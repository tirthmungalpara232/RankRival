const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all venues - Powered by sp_GetAllVenues
router.get('/', async (req, res) => {
  try {
    const venues = await db.call('sp_GetAllVenues');
    res.json(venues);
  } catch (err) {
    console.error('Fetch venues error:', err);
    res.status(500).json({ error: 'Failed to fetch venues: ' + err.message });
  }
});

module.exports = router;
