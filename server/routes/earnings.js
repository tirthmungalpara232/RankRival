const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireOrganizerOrAdmin } = require('../middleware/auth');

// Financial summary - Powered by stored procedures
router.get('/summary', async (req, res) => {
  try {
    const kpis = await db.callSingle('sp_GetEarningsSummaryKPIs');
    const topPlayer = await db.callSingle('sp_GetTopEarningPlayer');
    const topTeam = await db.callSingle('sp_GetTopEarningTeam');
    const typeBreakdown = await db.call('sp_GetEarningsTypeBreakdown');
    const recentEarnings = await db.call('sp_GetRecentEarnings', [15]);

    res.json({
      totalEarnings: kpis ? kpis.totalEarnings : 0,
      totalPrizePool: kpis ? kpis.totalPrizePool : 0,
      transactionCount: kpis ? kpis.transactionCount : 0,
      topPlayer,
      topTeam,
      typeBreakdown,
      recentEarnings
    });
  } catch (err) {
    console.error('Fetch earnings summary error:', err);
    res.status(500).json({ error: 'Failed to fetch earnings summary: ' + err.message });
  }
});

// Award prize money or bonus (Organizers and Admins only) - Powered by sp_AwardPlayerEarnings
router.post('/award', authenticateToken, requireOrganizerOrAdmin, async (req, res) => {
  try {
    const {
      player_id,
      tournament_id,
      match_id = null,
      earning_type = 'Tournament Prize Share',
      amount,
      currency = 'USD',
      date_awarded = new Date().toISOString().slice(0, 10),
      description = ''
    } = req.body;

    if (!player_id || !tournament_id || !amount) {
      return res.status(400).json({ error: 'Player ID, Tournament ID, and amount are required.' });
    }

    const result = await db.run('CALL sp_AwardPlayerEarnings(?, ?, ?, ?, ?, ?, ?, ?)', [
      player_id,
      tournament_id,
      match_id,
      earning_type,
      amount,
      currency,
      date_awarded,
      description
    ]);

    res.status(201).json({
      message: 'Prize money awarded successfully!',
      earning_id: result.lastInsertRowid
    });
  } catch (err) {
    console.error('Award earnings error:', err);
    res.status(500).json({ error: 'Failed to award earnings: ' + err.message });
  }
});

module.exports = router;
