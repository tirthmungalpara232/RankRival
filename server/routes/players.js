const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all players with search & filters - Powered by stored procedures
router.get('/', async (req, res) => {
  try {
    const { search = '', role = 'All', team_id = 'All', country_id = 'All', limit = 50, page = 1 } = req.query;

    const teamIdParam = (team_id && team_id !== 'All') ? Number(team_id) : 0;
    const countryIdParam = (country_id && country_id !== 'All') ? Number(country_id) : 0;
    const roleParam = (role && role !== 'All') ? role : '';
    const lim = Number(limit) || 50;
    const offset = (Number(page) - 1) * lim;

    const players = await db.call('sp_GetAllPlayers', [
      search ? search.trim() : '',
      roleParam,
      teamIdParam,
      countryIdParam,
      lim,
      offset
    ]);

    const totalCountRes = await db.callSingle('sp_GetPlayersCount', [
      search ? search.trim() : '',
      roleParam,
      teamIdParam,
      countryIdParam
    ]);

    res.json({
      players,
      total: totalCountRes ? totalCountRes.total : players.length
    });
  } catch (err) {
    console.error('Fetch players error:', err);
    res.status(500).json({ error: 'Failed to fetch players: ' + err.message });
  }
});

// Head-to-Head Comparison between two players - Powered by sp_GetPlayerComparisonInfo
router.get('/compare/:id1/:id2', async (req, res) => {
  try {
    const { id1, id2 } = req.params;

    const player1 = await db.callSingle('sp_GetPlayerComparisonInfo', [Number(id1)]);
    const player2 = await db.callSingle('sp_GetPlayerComparisonInfo', [Number(id2)]);

    if (!player1 || !player2) {
      return res.status(404).json({ error: 'One or both players not found.' });
    }

    res.json({ player1, player2 });
  } catch (err) {
    console.error('Player comparison error:', err);
    res.status(500).json({ error: 'Failed to compare players: ' + err.message });
  }
});

// Single Player Career & Tournament-by-Tournament Performance & Earnings - Powered by stored procedures
router.get('/:id', async (req, res) => {
  try {
    const playerId = Number(req.params.id);

    const player = await db.callSingle('sp_GetPlayerDetails', [playerId]);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const careerStats = await db.callSingle('sp_GetPlayerCareerStats', [playerId]);
    const tournamentHistory = await db.call('sp_GetPlayerTournamentHistory', [playerId]);
    const earningsLedger = await db.call('sp_GetPlayerEarningsLedger', [playerId]);
    const matchLogs = await db.call('sp_GetPlayerMatchLogs', [playerId]);

    res.json({
      player,
      careerStats,
      tournamentHistory,
      earningsLedger,
      matchLogs
    });
  } catch (err) {
    console.error('Fetch player error:', err);
    res.status(500).json({ error: 'Failed to load player: ' + err.message });
  }
});

module.exports = router;

