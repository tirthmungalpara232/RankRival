const express = require('express');
const router = express.Router();
const db = require('../db');
const { optionalAuth, authenticateToken, requireOrganizerOrAdmin } = require('../middleware/auth');

// Get matches with filters - Powered by sp_GetAllMatches
router.get('/', async (req, res) => {
  try {
    const { tournament_id = 'All', status = 'All' } = req.query;

    const tourIdParam = (tournament_id && tournament_id !== 'All') ? Number(tournament_id) : 0;
    const statusParam = (status && status !== 'All') ? status : '';

    const matches = await db.call('sp_GetAllMatches', [tourIdParam, statusParam]);
    res.json(matches);
  } catch (err) {
    console.error('Fetch matches error:', err);
    res.status(500).json({ error: 'Failed to fetch matches: ' + err.message });
  }
});

// Get single match detailed scorecard & ball-by-ball - Powered by stored procedures
router.get('/:id', async (req, res) => {
  try {
    const matchId = Number(req.params.id);

    const matchInfo = await db.callSingle('sp_GetMatchDetails', [matchId]);
    if (!matchInfo) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const team1Batting = await db.call('sp_GetMatchBattingScorecard', [matchId, matchInfo.team1_id]);
    const team2Batting = await db.call('sp_GetMatchBattingScorecard', [matchId, matchInfo.team2_id]);
    const team2Bowling = await db.call('sp_GetMatchBowlingScorecard', [matchId, matchInfo.team2_id]);
    const team1Bowling = await db.call('sp_GetMatchBowlingScorecard', [matchId, matchInfo.team1_id]);
    const balls = await db.call('sp_GetMatchBallByBall', [matchId]);
    const umpires = await db.call('sp_GetMatchOfficials', [matchId]);
    const commentators = await db.call('sp_GetMatchCommentators', [matchId]);
    const team1Squad = await db.call('sp_GetTeamSquad', [matchInfo.team1_id]);
    const team2Squad = await db.call('sp_GetTeamSquad', [matchInfo.team2_id]);

    res.json({
      match: matchInfo,
      team1Batting,
      team2Batting,
      team1Bowling,
      team2Bowling,
      balls,
      umpires,
      commentators,
      team1Squad,
      team2Squad
    });
  } catch (err) {
    console.error('Fetch match error:', err);
    res.status(500).json({ error: 'Failed to load match: ' + err.message });
  }
});

// Live Scorer: Score a single ball (Organizers and Admins only) - Powered by sp_ScoreBall
router.post('/:id/score-ball', authenticateToken, requireOrganizerOrAdmin, async (req, res) => {
  try {
    const matchId = Number(req.params.id);
    const {
      innings = 1,
      over_num,
      ball_num,
      striker_id,
      bowler_id,
      batting_team_id,
      bowling_team_id,
      runs = 0,
      extras = 0,
      extra_type = null,
      is_wicket = 0,
      wicket_type = null,
      custom_commentary = null
    } = req.body;

    if (!striker_id || !bowler_id || !batting_team_id || !bowling_team_id) {
      return res.status(400).json({ error: 'Striker, bowler, batting team and bowling team are required.' });
    }

    const scoredBall = await db.callSingle('sp_ScoreBall', [
      matchId,
      Number(innings),
      Number(over_num),
      Number(ball_num),
      Number(striker_id),
      Number(bowler_id),
      Number(batting_team_id),
      Number(bowling_team_id),
      Number(runs),
      Number(extras),
      extra_type,
      is_wicket ? 1 : 0,
      wicket_type,
      custom_commentary
    ]);

    res.json({
      message: 'Ball scored successfully!',
      commentary: scoredBall ? scoredBall.commentary : '',
      over_num: scoredBall ? scoredBall.over_num : over_num,
      ball_num: scoredBall ? scoredBall.ball_num : ball_num,
      runs: scoredBall ? scoredBall.runs : runs,
      is_wicket: scoredBall ? scoredBall.is_wicket : is_wicket
    });
  } catch (err) {
    console.error('Score ball error:', err);
    res.status(500).json({ error: 'Failed to score ball: ' + err.message });
  }
});

// Complete match and award Player of the Match - Powered by sp_CompleteMatch
router.post('/:id/complete', authenticateToken, requireOrganizerOrAdmin, async (req, res) => {
  try {
    const matchId = Number(req.params.id);
    const {
      winner_team_id,
      win_type = 'Runs',
      win_margin = 10,
      player_of_match_id
    } = req.body;

    await db.run('CALL sp_CompleteMatch(?, ?, ?, ?, ?)', [
      matchId,
      winner_team_id ? Number(winner_team_id) : null,
      win_type,
      Number(win_margin),
      player_of_match_id ? Number(player_of_match_id) : null
    ]);

    res.json({ message: 'Match concluded and points updated successfully!' });
  } catch (err) {
    console.error('Complete match error:', err);
    res.status(500).json({ error: 'Failed to complete match: ' + err.message });
  }
});

module.exports = router;

