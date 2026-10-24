const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// Register a new user - Powered by stored procedures
router.post('/register', async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      full_name,
      role = 'Player',
      country_id = 1,
      player_role = 'All-rounder',
      batting_style = 'Right-hand',
      bowling_style = 'Right-arm medium',
      team_id = null,
      jersey_number = null,
      avatar = null
    } = req.body;

    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ error: 'Username, email, password, and full name are required.' });
    }

    // Check existing using stored procedure
    const existing = await db.callSingle('sp_CheckUserExists', [username.trim(), email.trim()]);
    if (existing) {
      return res.status(400).json({ error: 'Username or email already registered.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    let linkedPlayerId = null;

    // If role is Player, create a linked player record using stored procedure
    if (role === 'Player') {
      const nameParts = full_name.trim().split(' ');
      const firstName = nameParts[0] || 'Cricket';
      const lastName = nameParts.slice(1).join(' ') || 'Player';

      const playerResult = await db.run('CALL sp_CreatePlayer(?, ?, ?, ?, ?, ?, ?, ?)', [
        firstName,
        lastName,
        country_id,
        team_id,
        jersey_number || Math.floor(Math.random() * 99) + 1,
        player_role,
        batting_style,
        bowling_style
      ]);

      linkedPlayerId = playerResult.lastInsertRowid;
    }

    const userResult = await db.run('CALL sp_CreateUser(?, ?, ?, ?, ?, ?, ?)', [
      username.trim(),
      email.trim(),
      password_hash,
      full_name.trim(),
      role,
      linkedPlayerId,
      avatar
    ]);

    const userId = userResult.lastInsertRowid;

    const user = {
      user_id: userId,
      username: username.trim(),
      email: email.trim().toLowerCase(),
      full_name: full_name.trim(),
      role,
      player_id: linkedPlayerId,
      avatar
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// Login - Powered by stored procedure
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: 'Please provide both username/email and password.' });
    }

    const userRecord = await db.callSingle('sp_GetUserForLogin', [login.trim()]);

    if (!userRecord) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    const isMatch = bcrypt.compareSync(password, userRecord.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
    }

    const user = {
      user_id: userRecord.user_id,
      username: userRecord.username,
      email: userRecord.email,
      full_name: userRecord.full_name,
      role: userRecord.role,
      player_id: userRecord.player_id,
      avatar: userRecord.avatar,
      player_role: userRecord.player_role,
      team_name: userRecord.team_name,
      country_name: userRecord.country_name
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful!',
      token,
      user
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// Get Current User Profile & Stats - Powered by stored procedures
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userRecord = await db.callSingle('sp_GetUserProfileById', [req.user.user_id]);

    if (!userRecord) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let stats = null;
    let tournaments = [];
    let earnings = [];
    let totalEarnings = 0;

    if (userRecord.player_id) {
      stats = await db.callSingle('sp_GetPlayerAggregatedStats', [userRecord.player_id]);
      tournaments = await db.call('sp_GetPlayerTournamentsParticipated', [userRecord.player_id]);
      earnings = await db.call('sp_GetPlayerEarningsList', [userRecord.player_id]);
      totalEarnings = earnings.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    }

    res.json({
      user: userRecord,
      stats,
      tournaments,
      earnings,
      totalEarnings
    });
  } catch (err) {
    console.error('Fetch me error:', err);
    res.status(500).json({ error: 'Failed to fetch user data: ' + err.message });
  }
});

module.exports = router;
