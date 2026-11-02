const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all players with search & filters using direct SQL queries
router.get('/', async (req, res) => {
  try {
    const { search = '', role = 'All', team_id = 'All', country_id = 'All', limit = 50, page = 1 } = req.query;

    const lim = Math.max(1, Math.min(200, Number(limit) || 50));
    const offset = Math.max(0, (Number(page) - 1) * lim);

    let whereClauses = ['1=1'];
    let params = [];

    if (search && search.trim() !== '') {
      whereClauses.push('(LOWER(CONCAT(p.first_name, " ", p.last_name)) LIKE ? OR LOWER(t.team_name) LIKE ?)');
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      params.push(searchTerm, searchTerm);
    }

    if (role && role !== 'All') {
      whereClauses.push('p.player_role = ?');
      params.push(role);
    }

    if (team_id && team_id !== 'All' && Number(team_id) > 0) {
      whereClauses.push('p.team_id = ?');
      params.push(Number(team_id));
    }

    if (country_id && country_id !== 'All' && Number(country_id) > 0) {
      whereClauses.push('p.country_id = ?');
      params.push(Number(country_id));
    }

    const whereSql = whereClauses.join(' AND ');

    // Main players query with career totals aggregated
    const sql = `
      SELECT 
        p.player_id,
        p.first_name,
        p.last_name,
        CONCAT(p.first_name, ' ', p.last_name) AS full_name,
        p.jersey_number,
        p.player_role,
        p.batting_style,
        p.bowling_style,
        p.status,
        t.team_id,
        t.team_name,
        c.country_id,
        c.country_name,
        c.country_code,
        COALESCE(s.matches_played, 0) AS matches_played,
        COALESCE(s.total_runs, 0) AS total_runs,
        COALESCE(s.highest_score, 0) AS highest_score,
        COALESCE(s.total_wickets, 0) AS total_wickets,
        COALESCE(s.total_catches, 0) AS total_catches
      FROM player p
      LEFT JOIN teams t ON p.team_id = t.team_id
      JOIN country c ON p.country_id = c.country_id
      LEFT JOIN (
        SELECT 
          player_id,
          COUNT(DISTINCT match_id) AS matches_played,
          SUM(runs_scored) AS total_runs,
          MAX(runs_scored) AS highest_score,
          SUM(wickets_taken) AS total_wickets,
          SUM(catches) AS total_catches
        FROM player_match_stats
        GROUP BY player_id
      ) s ON p.player_id = s.player_id
      WHERE ${whereSql}
      ORDER BY total_runs DESC, total_wickets DESC
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM player p
      LEFT JOIN teams t ON p.team_id = t.team_id
      JOIN country c ON p.country_id = c.country_id
      WHERE ${whereSql}
    `;

    const players = await db.query(sql, [...params, lim, offset]);
    const countResult = await db.get(countSql, params);

    res.json({
      players: players || [],
      total: countResult ? countResult.total : (players ? players.length : 0)
    });
  } catch (err) {
    console.error('Fetch players error:', err);
    res.status(500).json({ error: 'Failed to fetch players: ' + err.message });
  }
});

// Head-to-Head Comparison between two players using direct SQL
router.get('/compare/:id1/:id2', async (req, res) => {
  try {
    const id1 = Number(req.params.id1);
    const id2 = Number(req.params.id2);

    const compareSql = `
      SELECT 
        p.player_id,
        CONCAT(p.first_name, ' ', p.last_name) AS player_name,
        p.jersey_number,
        p.player_role,
        p.batting_style,
        p.bowling_style,
        t.team_name,
        c.country_name,
        COALESCE(s.matches_played, 0) AS matches_played,
        COALESCE(s.total_runs, 0) AS total_runs,
        COALESCE(s.highest_score, 0) AS highest_score,
        ROUND(COALESCE(s.total_runs * 100.0 / NULLIF(s.balls_faced, 0), 0), 2) AS strike_rate,
        ROUND(COALESCE(s.total_runs * 1.0 / NULLIF(s.times_out, 0), s.total_runs), 2) AS batting_average,
        COALESCE(s.total_wickets, 0) AS total_wickets,
        ROUND(COALESCE(s.runs_conceded * 6.0 / NULLIF(s.balls_bowled, 0), 0), 2) AS economy,
        COALESCE(s.total_catches, 0) AS total_catches,
        COALESCE(pom.pom_awards, 0) AS pom_awards
      FROM player p
      LEFT JOIN teams t ON p.team_id = t.team_id
      JOIN country c ON p.country_id = c.country_id
      LEFT JOIN (
        SELECT 
          player_id,
          COUNT(DISTINCT match_id) AS matches_played,
          SUM(runs_scored) AS total_runs,
          SUM(balls_faced) AS balls_faced,
          MAX(runs_scored) AS highest_score,
          SUM(is_out) AS times_out,
          SUM(wickets_taken) AS total_wickets,
          SUM(runs_conceded) AS runs_conceded,
          SUM(overs_bowled * 6) AS balls_bowled,
          SUM(catches) AS total_catches
        FROM player_match_stats
        GROUP BY player_id
      ) s ON p.player_id = s.player_id
      LEFT JOIN (
        SELECT player_of_match_id, COUNT(*) AS pom_awards
        FROM matches
        WHERE player_of_match_id IS NOT NULL
        GROUP BY player_of_match_id
      ) pom ON p.player_id = pom.player_of_match_id
      WHERE p.player_id = ?
    `;

    const player1 = await db.get(compareSql, [id1]);
    const player2 = await db.get(compareSql, [id2]);

    if (!player1 || !player2) {
      return res.status(404).json({ error: 'One or both players not found.' });
    }

    res.json({ player1, player2 });
  } catch (err) {
    console.error('Player comparison error:', err);
    res.status(500).json({ error: 'Failed to compare players: ' + err.message });
  }
});

// Single Player Profile & Career Performance using direct SQL
router.get('/:id', async (req, res) => {
  try {
    const playerId = Number(req.params.id);

    // Basic player details
    const playerSql = `
      SELECT 
        p.*,
        CONCAT(p.first_name, ' ', p.last_name) AS full_name,
        t.team_name,
        c.country_name,
        c.country_code
      FROM player p
      LEFT JOIN teams t ON p.team_id = t.team_id
      JOIN country c ON p.country_id = c.country_id
      WHERE p.player_id = ?
    `;
    const player = await db.get(playerSql, [playerId]);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Aggregated career stats
    const careerSql = `
      SELECT 
        COUNT(DISTINCT pms.match_id) AS matches_played,
        COALESCE(SUM(pms.runs_scored), 0) AS total_runs,
        COALESCE(MAX(pms.runs_scored), 0) AS highest_score,
        COALESCE(SUM(pms.balls_faced), 0) AS balls_faced,
        ROUND(COALESCE(SUM(pms.runs_scored) * 100.0 / NULLIF(SUM(pms.balls_faced), 0), 0), 2) AS strike_rate,
        ROUND(COALESCE(SUM(pms.runs_scored) * 1.0 / NULLIF(SUM(pms.is_out), 0), SUM(pms.runs_scored)), 2) AS batting_average,
        COALESCE(SUM(pms.fours), 0) AS total_fours,
        COALESCE(SUM(pms.sixes), 0) AS total_sixes,
        COUNT(CASE WHEN pms.runs_scored >= 50 AND pms.runs_scored < 100 THEN 1 END) AS fifties,
        COUNT(CASE WHEN pms.runs_scored >= 100 THEN 1 END) AS hundreds,
        COALESCE(SUM(pms.wickets_taken), 0) AS total_wickets,
        COALESCE(SUM(pms.overs_bowled), 0) AS total_overs,
        COALESCE(SUM(pms.runs_conceded), 0) AS runs_conceded,
        ROUND(COALESCE(SUM(pms.runs_conceded) * 6.0 / NULLIF(SUM(pms.overs_bowled * 6), 0), 0), 2) AS bowling_economy,
        ROUND(COALESCE(SUM(pms.runs_conceded) * 1.0 / NULLIF(SUM(pms.wickets_taken), 0), 0), 2) AS bowling_average,
        COALESCE(SUM(pms.catches), 0) AS total_catches,
        (SELECT COUNT(*) FROM matches WHERE player_of_match_id = ?) AS pom_awards
      FROM player_match_stats pms
      WHERE pms.player_id = ?
    `;
    const careerStats = await db.get(careerSql, [playerId, playerId]);

    // Tournament history
    const tourHistorySql = `
      SELECT 
        t.tournament_id,
        t.tournament_name,
        tt.type_name AS format,
        COUNT(DISTINCT m.match_id) AS matches_played,
        COALESCE(SUM(pms.runs_scored), 0) AS runs,
        COALESCE(MAX(pms.runs_scored), 0) AS highest_score,
        ROUND(COALESCE(SUM(pms.runs_scored) * 100.0 / NULLIF(SUM(pms.balls_faced), 0), 0), 2) AS strike_rate,
        COALESCE(SUM(pms.wickets_taken), 0) AS wickets,
        ROUND(COALESCE(SUM(pms.runs_conceded) * 6.0 / NULLIF(SUM(pms.overs_bowled * 6), 0), 0), 2) AS economy,
        COALESCE(SUM(pms.catches), 0) AS catches,
        COUNT(CASE WHEN m.player_of_match_id = ? THEN 1 END) AS pom_count
      FROM player_match_stats pms
      JOIN matches m ON pms.match_id = m.match_id
      JOIN tournament t ON m.tournament_id = t.tournament_id
      JOIN tournament_type tt ON t.type_id = tt.type_id
      WHERE pms.player_id = ?
      GROUP BY t.tournament_id, t.tournament_name, tt.type_name
      ORDER BY t.start_date DESC
    `;
    const tournamentHistory = await db.query(tourHistorySql, [playerId, playerId]);

    // Match logs
    const matchLogsSql = `
      SELECT 
        m.match_id,
        DATE_FORMAT(m.match_date, '%Y-%m-%d') AS match_date,
        t.tournament_name,
        CASE WHEN pms.team_id = m.team1_id THEN t2.team_name ELSE t1.team_name END AS opponent_team,
        pms.runs_scored,
        pms.balls_faced,
        pms.fours,
        pms.sixes,
        ROUND(COALESCE(pms.runs_scored * 100.0 / NULLIF(pms.balls_faced, 0), 0), 2) AS match_strike_rate,
        pms.is_out,
        pms.dismissal_type,
        pms.overs_bowled,
        pms.runs_conceded,
        pms.wickets_taken,
        pms.catches,
        CASE WHEN m.player_of_match_id = ? THEN 1 ELSE 0 END AS is_player_of_match
      FROM player_match_stats pms
      JOIN matches m ON pms.match_id = m.match_id
      JOIN tournament t ON m.tournament_id = t.tournament_id
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      WHERE pms.player_id = ?
      ORDER BY m.match_date DESC
      LIMIT 15
    `;
    const matchLogs = await db.query(matchLogsSql, [playerId, playerId]);

    res.json({
      player,
      careerStats,
      tournamentHistory: tournamentHistory || [],
      matchLogs: matchLogs || []
    });
  } catch (err) {
    console.error('Fetch player error:', err);
    res.status(500).json({ error: 'Failed to load player: ' + err.message });
  }
});

module.exports = router;
