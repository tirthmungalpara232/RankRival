const express = require('express');
const router = express.Router();
const db = require('../db');
const { optionalAuth, authenticateToken, requireOrganizerOrAdmin } = require('../middleware/auth');

// Get all tournaments with filters - Powered by sp_GetAllTournaments
router.get('/', async (req, res) => {
  try {
    const { status = 'All', type_id = 'All' } = req.query;

    const statusParam = (status && status !== 'All') ? status : '';
    const typeIdParam = (type_id && type_id !== 'All') ? Number(type_id) : 0;

    const tournaments = await db.call('sp_GetAllTournaments', [statusParam, typeIdParam]);
    res.json(tournaments);
  } catch (err) {
    console.error('Fetch tournaments error:', err);
    res.status(500).json({ error: 'Failed to fetch tournaments: ' + err.message });
  }
});

// Get Tournament formats and countries (for creating tournaments)
router.get('/meta/form-options', async (req, res) => {
  try {
    const types = await db.query('SELECT type_id, type_name, overs_per_innings, description FROM tournament_type');
    const countries = await db.query('SELECT country_id, country_name, country_code FROM country ORDER BY country_name ASC');
    const teams = await db.query('SELECT team_id, team_name FROM teams ORDER BY team_name ASC');
    const venues = await db.query('SELECT venue_id, venue_name, city FROM venue ORDER BY venue_name ASC');

    res.json({ types, countries, teams, venues });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tournament options: ' + err.message });
  }
});

// Get single tournament details - Powered by stored procedures
router.get('/:id', async (req, res) => {
  try {
    const tournamentId = Number(req.params.id);

    const tournament = await db.callSingle('sp_GetTournamentDetails', [tournamentId]);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const pointsTable = await db.call('sp_GetTournamentPointsTable', [tournamentId]);
    const matches = await db.call('sp_GetTournamentMatches', [tournamentId]);
    const topBatsmen = await db.call('sp_GetTournamentTopBatsmen', [tournamentId, 5]);
    const topBowlers = await db.call('sp_GetTournamentTopBowlers', [tournamentId, 5]);
    const prizeBreakdown = await db.call('sp_GetTournamentPrizeBreakdown', [tournamentId]);

    res.json({
      tournament,
      pointsTable,
      matches,
      topBatsmen,
      topBowlers,
      prizeBreakdown
    });
  } catch (err) {
    console.error('Fetch tournament details error:', err);
    res.status(500).json({ error: 'Failed to load tournament: ' + err.message });
  }
});

// Conduct / Create New Tournament (Organizers and Admins only) - Powered by sp_CreateTournament
router.post('/', authenticateToken, requireOrganizerOrAdmin, async (req, res) => {
  try {
    const {
      tournament_name,
      type_id,
      host_country_id,
      season_year = new Date().getFullYear().toString(),
      start_date,
      end_date,
      prize_money = 1000000.00,
      entry_fee = 0.00,
      description = '',
      status = 'Upcoming',
      participating_team_ids = []
    } = req.body;

    if (!tournament_name || !type_id || !host_country_id || !start_date || !end_date) {
      return res.status(400).json({ error: 'Please provide tournament name, format, host country, start and end dates.' });
    }

    const result = await db.run('CALL sp_CreateTournament(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
      tournament_name.trim(),
      Number(type_id),
      Number(host_country_id),
      season_year,
      start_date,
      end_date,
      prize_money,
      status,
      req.user.user_id,
      entry_fee,
      description.trim()
    ]);

    const tournamentId = result.lastInsertRowid;

    // Register teams if provided
    if (Array.isArray(participating_team_ids) && participating_team_ids.length > 0) {
      for (const teamId of participating_team_ids) {
        await db.run('CALL sp_RegisterTeamForTournament(?, ?, ?, ?)', [
          tournamentId,
          teamId,
          req.user.user_id,
          'Registered on tournament creation'
        ]);
      }
    }

    res.status(201).json({
      message: 'Tournament conducted & created successfully!',
      tournament_id: tournamentId
    });
  } catch (err) {
    console.error('Create tournament error:', err);
    res.status(500).json({ error: 'Failed to create tournament: ' + err.message });
  }
});

// Participate in any tournament - Powered by sp_RegisterTeamForTournament
router.post('/:id/participate', authenticateToken, async (req, res) => {
  try {
    const tournamentId = Number(req.params.id);
    const { team_id, notes = '' } = req.body;

    if (!team_id) {
      return res.status(400).json({ error: 'Please select a team to participate with.' });
    }

    // Check if tournament exists
    const tour = await db.callSingle('sp_GetTournamentDetails', [tournamentId]);
    if (!tour) {
      return res.status(404).json({ error: 'Tournament not found.' });
    }

    await db.run('CALL sp_RegisterTeamForTournament(?, ?, ?, ?)', [
      tournamentId,
      Number(team_id),
      req.user.user_id,
      notes || 'User registration'
    ]);

    res.json({
      message: 'Successfully registered for tournament!',
      tournament_id: tournamentId,
      team_id
    });
  } catch (err) {
    console.error('Tournament participation error:', err);
    res.status(500).json({ error: 'Failed to register for tournament: ' + err.message });
  }
});

// Schedule match in tournament (Organizers and Admins only) - Powered by sp_ScheduleMatch
router.post('/:id/schedule-match', authenticateToken, requireOrganizerOrAdmin, async (req, res) => {
  try {
    const tournamentId = Number(req.params.id);
    const {
      team1_id,
      team2_id,
      venue_id,
      match_date,
      start_time = '19:00:00',
      match_stage = 'Group'
    } = req.body;

    if (!team1_id || !team2_id || !venue_id || !match_date) {
      return res.status(400).json({ error: 'Team 1, Team 2, Venue, and Date are required.' });
    }

    if (team1_id === team2_id) {
      return res.status(400).json({ error: 'A team cannot play against itself.' });
    }

    const result = await db.run('CALL sp_ScheduleMatch(?, ?, ?, ?, ?, ?, ?)', [
      tournamentId,
      Number(team1_id),
      Number(team2_id),
      Number(venue_id),
      match_date,
      start_time,
      match_stage
    ]);

    res.status(201).json({
      message: 'Match scheduled successfully!',
      match_id: result.lastInsertRowid
    });
  } catch (err) {
    console.error('Schedule match error:', err);
    res.status(500).json({ error: 'Failed to schedule match: ' + err.message });
  }
});

module.exports = router;

