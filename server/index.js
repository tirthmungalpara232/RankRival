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
const earningsRoutes = require('./routes/earnings');
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
app.use('/api/earnings', earningsRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/venues', venueRoutes);

// Dashboard Overview KPIs - Powered by MySQL Stored Procedures
app.get('/api/overview', async (req, res) => {
  try {
    const kpis = await db.callSingle('sp_GetDashboardKPIs');
    const liveMatches = await db.call('sp_GetLiveMatches', [3]);
    const upcomingMatches = await db.call('sp_GetUpcomingMatches', [4]);
    const topEarners = await db.call('sp_GetTopEarners', [5]);
    const orangeCapLeaders = await db.call('sp_GetOrangeCapLeaders', [5]);
    const purpleCapLeaders = await db.call('sp_GetPurpleCapLeaders', [5]);

    res.json({
      totalTournaments: kpis ? kpis.totalTournaments : 0,
      totalMatches: kpis ? kpis.totalMatches : 0,
      totalPlayers: kpis ? kpis.totalPlayers : 0,
      totalTeams: kpis ? kpis.totalTeams : 0,
      totalPrizeMoney: kpis ? kpis.totalPrizeMoney : 0,
      liveMatches,
      upcomingMatches,
      topEarners,
      orangeCapLeaders,
      purpleCapLeaders,
      dbDriver: db.getDriver()
    });
  } catch (err) {
    console.error('Overview error:', err);
    res.status(500).json({ error: 'Failed to load overview data: ' + err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Cricket DBMS API',
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
  console.log(`⚡ Database driver: ${db.getDriver()}`);
});
