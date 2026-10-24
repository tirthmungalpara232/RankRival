const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all teams - Powered by sp_GetAllTeams
router.get('/', async (req, res) => {
  try {
    const teams = await db.call('sp_GetAllTeams');
    res.json(teams);
  } catch (err) {
    console.error('Fetch teams error:', err);
    res.status(500).json({ error: 'Failed to fetch teams: ' + err.message });
  }
});

// Get single team details & squad - Powered by stored procedures
router.get('/:id', async (req, res) => {
  try {
    const teamId = req.params.id;

    const team = await db.callSingle('sp_GetTeamById', [teamId]);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const squad = await db.call('sp_GetTeamSquad', [teamId]);
    const tournamentHistory = await db.call('sp_GetTeamTournamentHistory', [teamId]);

    res.json({
      team,
      squad,
      tournamentHistory
    });
  } catch (err) {
    console.error('Fetch team details error:', err);
    res.status(500).json({ error: 'Failed to fetch team details: ' + err.message });
  }
});

module.exports = router;
