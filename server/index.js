const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./db');
const authRoutes = require('./routes/auth');
const tournamentRoutes = require('./routes/tournaments');
const matchRoutes = require('./routes/matches');
const playerRoutes = require('./routes/players');
const leaderboardRoutes = require('./routes/leaderboards');
const teamRoutes = require('./routes/teams');
const venueRoutes = require('./routes/venues');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/leaderboards', leaderboardRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/venues', venueRoutes);

// Database Statistics & Overview
app.get('/api/overview', async (req, res) => {
  try {
    const [[{ totalPlayers }]] = await db.mysqlPool.query('SELECT COUNT(*) AS totalPlayers FROM player');
    const [[{ totalTournaments }]] = await db.mysqlPool.query('SELECT COUNT(*) AS totalTournaments FROM tournament');
    const [[{ totalMatches }]] = await db.mysqlPool.query('SELECT COUNT(*) AS totalMatches FROM matches');
    const [[{ totalVenues }]] = await db.mysqlPool.query('SELECT COUNT(*) AS totalVenues FROM venue');
    const [[{ totalTeams }]] = await db.mysqlPool.query('SELECT COUNT(*) AS totalTeams FROM teams');
    const [[{ totalRuns }]] = await db.mysqlPool.query('SELECT COALESCE(SUM(runs_scored), 0) AS totalRuns FROM player_match_stats');
    const [[{ totalWickets }]] = await db.mysqlPool.query('SELECT COALESCE(SUM(wickets_taken), 0) AS totalWickets FROM player_match_stats');
    
    const [formatCounts] = await db.mysqlPool.query(`
      SELECT tt.type_name AS format, COUNT(t.tournament_id) AS count 
      FROM tournament t 
      JOIN tournament_type tt ON t.type_id = tt.type_id 
      GROUP BY tt.type_name
    `);

    const liveMatches = await db.call('sp_GetLiveMatches', [3]);
    const upcomingMatches = await db.call('sp_GetUpcomingMatches', [4]);
    const orangeCapLeaders = await db.call('sp_GetOrangeCapLeaders', [5]);
    const purpleCapLeaders = await db.call('sp_GetPurpleCapLeaders', [5]);

    res.json({
      totalTournaments: Number(totalTournaments || 0),
      totalMatches: Number(totalMatches || 0),
      totalPlayers: Number(totalPlayers || 0),
      totalTeams: Number(totalTeams || 0),
      totalVenues: Number(totalVenues || 0),
      totalRuns: Number(totalRuns || 0),
      totalWickets: Number(totalWickets || 0),
      formatCounts: formatCounts || [],
      liveMatches: liveMatches || [],
      upcomingMatches: upcomingMatches || [],
      orangeCapLeaders: orangeCapLeaders || [],
      purpleCapLeaders: purpleCapLeaders || []
    });
  } catch (err) {
    console.error('Overview error:', err);
    res.status(500).json({ error: 'Failed to load statistical overview data: ' + err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Cricket Tournament DBMS API',
    driver: db.getDriver(),
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build if available
const fs = require('fs');
const distPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🏏 Cricket DBMS Server running on http://localhost:${PORT}`);
});
