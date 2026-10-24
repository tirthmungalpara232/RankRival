const express = require('express');
const router = express.Router();
const db = require('../db');

// Main Leaderboards endpoint - Powered by MySQL Stored Procedures
router.get('/', async (req, res) => {
  try {
    const { category = 'orange_cap', tournament_id = 'all', limit = 20 } = req.query;
    const tourId = (tournament_id && tournament_id !== 'all') ? Number(tournament_id) : 0;
    const lim = Number(limit) || 20;

    let results = [];

    switch (category) {
      case 'orange_cap': // Most Runs
        results = await db.call('sp_GetLeaderboardOrangeCap', [tourId, lim]);
        break;

      case 'purple_cap': // Most Wickets
        results = await db.call('sp_GetLeaderboardPurpleCap', [tourId, lim]);
        break;

      case 'strike_rate': // Highest Strike Rate (min 15 balls)
        results = await db.call('sp_GetLeaderboardStrikeRate', [tourId, lim]);
        break;

      case 'sixes': // Maximum Sixes
        results = await db.call('sp_GetLeaderboardSixes', [tourId, lim]);
        break;

      case 'fielding': // Most Catches
        results = await db.call('sp_GetLeaderboardFielding', [tourId, lim]);
        break;

      case 'earnings': // Highest Tournament Earnings
        results = await db.call('sp_GetLeaderboardEarnings', [tourId, lim]);
        break;

      case 'mvp': // Most Valuable Player
      default:
        results = await db.call('sp_GetLeaderboardMVP', [tourId, lim]);
        break;
    }

    res.json({
      category,
      tournament_id,
      count: results.length,
      data: results
    });
  } catch (err) {
    console.error('Fetch leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard: ' + err.message });
  }
});

module.exports = router;

