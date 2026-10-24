import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Trophy, 
  Activity, 
  MapPin, 
  User, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
  Award
} from 'lucide-react';
import { api } from '../api';

export default function LiveMatchCenterView({ selectedMatchId, onOpenPlayer, currentUser }) {
  const [matches, setMatches] = useState([]);
  const [currentMatchId, setCurrentMatchId] = useState(selectedMatchId || null);
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);

  // Scorer Controls State
  const [strikerId, setStrikerId] = useState('');
  const [bowlerId, setBowlerId] = useState('');
  const [customCommentary, setCustomCommentary] = useState('');
  const [activeTab, setActiveTab] = useState('scorecard'); // 'scorecard', 'balls', 'info'

  // Complete match state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [winnerTeamId, setWinnerTeamId] = useState('');
  const [winType, setWinType] = useState('Runs');
  const [winMargin, setWinMargin] = useState(12);
  const [pomPlayerId, setPomPlayerId] = useState('');

  useEffect(() => {
    loadMatchesList();
  }, []);

  useEffect(() => {
    if (selectedMatchId) {
      setCurrentMatchId(selectedMatchId);
    }
  }, [selectedMatchId]);

  useEffect(() => {
    if (currentMatchId) {
      loadMatchDetails(currentMatchId);
    }
  }, [currentMatchId]);

  async function loadMatchesList() {
    try {
      const allMatches = await api.getMatches();
      setMatches(allMatches);

      if (!currentMatchId && allMatches.length > 0) {
        // Try finding a 'Live' match, else first match
        const live = allMatches.find(m => m.status === 'Live');
        setCurrentMatchId(live ? live.match_id : allMatches[0].match_id);
      }
    } catch (err) {
      console.error('Failed to load matches list:', err);
    }
  }

  async function loadMatchDetails(matchId) {
    setLoading(true);
    try {
      const data = await api.getMatch(matchId);
      setMatchData(data);

      // Pre-select striker and bowler from squads
      if (data.team1Squad?.length > 0 && !strikerId) {
        setStrikerId(data.team1Squad[0].player_id);
      }
      if (data.team2Squad?.length > 0 && !bowlerId) {
        setBowlerId(data.team2Squad[0].player_id);
      }
      if (data.match?.team1_id) {
        setWinnerTeamId(data.match.team1_id);
      }
      if (data.team1Squad?.length > 0) {
        setPomPlayerId(data.team1Squad[0].player_id);
      }
    } catch (err) {
      console.error('Failed to load match details:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleScoreBall(runs, isWicket = false, wicketType = null, extras = 0, extraType = null) {
    if (!matchData || !strikerId || !bowlerId) {
      alert('Please select both a batsman on strike and a bowler.');
      return;
    }

    setScoring(true);
    try {
      const ballsCount = matchData.balls?.length || 0;
      const overNum = Math.floor(ballsCount / 6) + 1;
      const ballNum = (ballsCount % 6) + 1;

      await api.scoreBall(currentMatchId, {
        innings: 1,
        over_num: overNum,
        ball_num: ballNum,
        striker_id: Number(strikerId),
        bowler_id: Number(bowlerId),
        batting_team_id: matchData.match.team1_id,
        bowling_team_id: matchData.match.team2_id,
        runs,
        extras,
        extra_type: extraType,
        is_wicket: isWicket ? 1 : 0,
        wicket_type: wicketType,
        custom_commentary: customCommentary
      });

      setCustomCommentary('');
      // Reload match details
      await loadMatchDetails(currentMatchId);
    } catch (err) {
      alert(err.message || 'Failed to score ball');
    } finally {
      setScoring(false);
    }
  }

  async function handleCompleteMatch(e) {
    e.preventDefault();
    try {
      await api.completeMatch(currentMatchId, {
        winner_team_id: Number(winnerTeamId),
        win_type: winType,
        win_margin: Number(winMargin),
        player_of_match_id: pomPlayerId ? Number(pomPlayerId) : null
      });

      alert('Match successfully marked Completed and points / awards updated!');
      setShowCompleteModal(false);
      loadMatchDetails(currentMatchId);
      loadMatchesList();
    } catch (err) {
      alert(err.message || 'Failed to complete match');
    }
  }

  const match = matchData?.match;
  const team1Batting = matchData?.team1Batting || [];
  const team2Batting = matchData?.team2Batting || [];
  const team1Bowling = matchData?.team1Bowling || [];
  const team2Bowling = matchData?.team2Bowling || [];
  const balls = matchData?.balls || [];

  // Totals calculation
  const t1Runs = team1Batting.reduce((sum, p) => sum + (p.runs_scored || 0), 0);
  const t1Wickets = team1Batting.reduce((sum, p) => sum + (p.is_out ? 1 : 0), 0);
  const t2Runs = team2Batting.reduce((sum, p) => sum + (p.runs_scored || 0), 0);
  const t2Wickets = team2Batting.reduce((sum, p) => sum + (p.is_out ? 1 : 0), 0);

  return (
    <div>
      {/* Match Selector Tabs */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={20} color="#ef4444" /> Live Matches & Scorecards
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Select any fixture to view scorecard or run live ball-by-ball scorer
          </span>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '8px'
        }}>
          {matches.map(m => {
            const isSelected = m.match_id === currentMatchId;
            return (
              <button
                key={m.match_id}
                onClick={() => setCurrentMatchId(m.match_id)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1px solid var(--accent-green)' : '1px solid var(--border-subtle)',
                  color: isSelected ? 'var(--accent-green)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontSize: '13px',
                  fontWeight: isSelected ? '700' : '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {m.status === 'Live' && <span className="pulse-dot" style={{ width: '6px', height: '6px' }}></span>}
                <span>{m.team1_name} vs {m.team2_name}</span>
                <span className={`badge ${m.status === 'Live' ? 'badge-live' : m.status === 'Completed' ? 'badge-completed' : 'badge-upcoming'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                  {m.status}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading live match scorecard and commentary...
        </div>
      ) : match ? (
        <div>
          {/* Big Live Match Scoreboard Banner */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(14, 23, 42, 0.95), rgba(7, 11, 20, 0.95))',
            borderColor: match.status === 'Live' ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)',
            padding: '28px',
            marginBottom: '24px',
            position: 'relative'
          }}>
            {/* Top tournament and status row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-gold">{match.format}</span>
                <span className="badge badge-green">{match.tournament_name}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>• {match.match_stage}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`badge ${match.status === 'Live' ? 'badge-live' : match.status === 'Completed' ? 'badge-completed' : 'badge-upcoming'}`}>
                  {match.status === 'Live' && <span className="pulse-dot"></span>}
                  {match.status}
                </span>

                {currentUser && (currentUser.role === 'Organizer' || currentUser.role === 'Admin') && match.status !== 'Completed' && (
                  <button 
                    className="btn btn-gold btn-sm"
                    onClick={() => setShowCompleteModal(true)}
                  >
                    🏆 End & Conclude Match
                  </button>
                )}
              </div>
            </div>

            {/* Scores Arena */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '20px', padding: '16px 0' }}>
              {/* Team 1 */}
              <div>
                <h3 style={{ fontSize: '26px', fontWeight: '900', color: '#fff' }}>{match.team1_name}</h3>
                <div style={{ fontSize: '36px', fontWeight: '900', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                  {t1Runs}/{t1Wickets}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Batting First • {balls.length > 0 ? `${Math.floor(balls.length / 6)}.${balls.length % 6} Overs` : 'Overs N/A'}
                </div>
              </div>

              {/* VS Divider */}
              <div style={{ textAlign: 'center', padding: '0 20px' }}>
                <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-muted)' }}>VS</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {match.venue_name}
                </div>
              </div>

              {/* Team 2 */}
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ fontSize: '26px', fontWeight: '900', color: '#fff' }}>{match.team2_name}</h3>
                <div style={{ fontSize: '36px', fontWeight: '900', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {t2Runs}/{t2Wickets}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Target / Opponent
                </div>
              </div>
            </div>

            {/* Result / Status Bar */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 18px',
              marginTop: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px'
            }}>
              <div>
                {match.winner_team_name ? (
                  <span style={{ color: 'var(--accent-gold)', fontWeight: '700' }}>
                    🏆 Result: {match.winner_team_name} won by {match.win_margin} {match.win_type}
                  </span>
                ) : (
                  <span style={{ color: 'var(--accent-green)', fontWeight: '600' }}>
                    🔴 Match in progress. Toss won by {match.toss_winner_name || match.team1_name} (elected to {match.toss_decision || 'Bat'})
                  </span>
                )}
              </div>

              {match.pom_name && (
                <div 
                  onClick={() => onOpenPlayer(match.pom_id)}
                  style={{ color: 'var(--accent-gold)', fontWeight: '700', cursor: 'pointer' }}
                >
                  ⭐ Player of the Match: <u>{match.pom_name}</u>
                </div>
              )}
            </div>
          </div>

          {/* Scorer Console Grid (Live Simulator for Organizers) OR Spectator Center (for Players) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginBottom: '28px' }}>
            {currentUser && (currentUser.role === 'Organizer' || currentUser.role === 'Admin') ? (
              /* Left: Interactive Scorer Console (Organizers/Admins Only) */
              <div className="card" style={{ padding: '24px', background: 'rgba(15, 23, 42, 0.85)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={18} color="var(--accent-green)" /> Official Match Scorer Console
                  </h4>
                  <span className="badge badge-green" style={{ fontSize: '10px' }}>Organizer Access</span>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Click below to record runs, boundaries, and wickets. Instantly updates batsman/bowler stats, runs table, and generates commentary!
                </p>

                {/* Striker & Bowler Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '12px' }}>🏏 Striker ({match.team1_name})</label>
                    <select 
                      className="form-select"
                      value={strikerId}
                      onChange={e => setStrikerId(e.target.value)}
                    >
                      {matchData.team1Squad?.map(p => (
                        <option key={p.player_id} value={p.player_id}>
                          {p.player_name} ({p.player_role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '12px' }}>⚾ Bowler ({match.team2_name})</label>
                    <select 
                      className="form-select"
                      value={bowlerId}
                      onChange={e => setBowlerId(e.target.value)}
                    >
                      {matchData.team2Squad?.map(p => (
                        <option key={p.player_id} value={p.player_id}>
                          {p.player_name} ({p.player_role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Custom Commentary Input */}
                <div style={{ marginBottom: '14px' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Optional custom commentary (or leave blank for smart auto-commentary)..."
                    value={customCommentary}
                    onChange={e => setCustomCommentary(e.target.value)}
                  />
                </div>

                {/* Scorer Buttons */}
                <div className="scorer-buttons-grid">
                  <button 
                    className="scorer-btn"
                    onClick={() => handleScoreBall(0)}
                    disabled={scoring}
                  >
                    0
                    <span className="label">Dot Ball</span>
                  </button>

                  <button 
                    className="scorer-btn"
                    onClick={() => handleScoreBall(1)}
                    disabled={scoring}
                  >
                    1
                    <span className="label">Single</span>
                  </button>

                  <button 
                    className="scorer-btn"
                    onClick={() => handleScoreBall(2)}
                    disabled={scoring}
                  >
                    2
                    <span className="label">Double</span>
                  </button>

                  <button 
                    className="scorer-btn"
                    onClick={() => handleScoreBall(3)}
                    disabled={scoring}
                  >
                    3
                    <span className="label">Three</span>
                  </button>

                  <button 
                    className="scorer-btn scorer-btn-boundary-four"
                    onClick={() => handleScoreBall(4)}
                    disabled={scoring}
                  >
                    4 🔥
                    <span className="label">Boundary 4</span>
                  </button>

                  <button 
                    className="scorer-btn scorer-btn-boundary-six"
                    onClick={() => handleScoreBall(6)}
                    disabled={scoring}
                  >
                    6 🚀
                    <span className="label">Maximum 6</span>
                  </button>

                  <button 
                    className="scorer-btn scorer-btn-wicket"
                    onClick={() => handleScoreBall(0, true, 'Caught')}
                    disabled={scoring}
                  >
                    W 💥
                    <span className="label">Wicket</span>
                  </button>

                  <button 
                    className="scorer-btn"
                    onClick={() => handleScoreBall(1, false, null, 1, 'Wide')}
                    disabled={scoring}
                  >
                    Wd
                    <span className="label">Wide (+1)</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Left: Read-Only Match Watch Center (For Players / Visitors) */
              <div className="card" style={{ padding: '24px', background: 'rgba(15, 23, 42, 0.85)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Radio size={18} color="#ef4444" /> Live Stadium Broadcast & Over Tracker
                  </h4>
                  <span className="badge badge-upcoming" style={{ fontSize: '10px' }}>
                    {currentUser?.role === 'Player' ? 'Player View' : 'Spectator Mode'}
                  </span>
                </div>

                <div style={{
                  background: 'rgba(0, 229, 255, 0.06)',
                  border: '1px solid rgba(0, 229, 255, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  marginBottom: '16px',
                  fontSize: '13px'
                }}>
                  <div style={{ color: 'var(--accent-cyan)', fontWeight: '700', marginBottom: '4px' }}>
                    🔒 Read-Only Match Center
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    As a signed-in <strong>Player</strong>, you can follow live overs, review player scorecards, and read the real-time commentary stream. Modifying live match scorecards is restricted to accredited <strong>Tournament Organizers</strong> and Match Officials.
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MATCH VENUE</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '2px' }}>{match.venue_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{match.city} • Pitch: {match.pitch_type || 'Standard'}</div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TOURNAMENT FORMAT</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '2px' }}>{match.format} ({match.overs_per_innings ? `${match.overs_per_innings} Overs` : 'Multi-day'})</div>
                    <div style={{ fontSize: '12px', color: 'var(--accent-gold)' }}>Prize Pool: ${Number(match.prize_money).toLocaleString()}</div>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Official Umpires: <strong>{matchData.umpires?.map(u => u.umpire_name).join(', ') || 'ICC Accredited'}</strong>
                  </span>
                  <span className="badge badge-green" style={{ fontSize: '10px' }}>
                    Live Synchronized
                  </span>
                </div>
              </div>
            )}

            {/* Right: Live Commentary Feed */}
            <div className="card" style={{ padding: '24px', maxHeight: '420px', display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontSize: '16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--accent-gold)" /> Live Commentary Stream
              </h4>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {balls.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No balls recorded yet. Use the console on the left to start scoring!
                  </div>
                ) : (
                  balls.slice().reverse().map(b => (
                    <div 
                      key={b.ball_id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: b.is_wicket ? 'rgba(239, 68, 68, 0.12)' : (b.runs >= 4 ? 'rgba(0, 230, 118, 0.08)' : 'rgba(255,255,255,0.02)'),
                        borderLeft: b.is_wicket ? '3px solid #ef4444' : (b.runs >= 4 ? '3px solid var(--accent-green)' : '3px solid rgba(255,255,255,0.1)'),
                        fontSize: '13px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <span style={{ fontWeight: '700' }}>Ov {b.over_num}.{b.ball_num}</span>
                        <span>{b.runs} Run{b.runs !== 1 ? 's' : ''}</span>
                      </div>
                      <div style={{ color: b.is_wicket ? '#ef4444' : (b.runs >= 4 ? 'var(--accent-green)' : 'var(--text-primary)') }}>
                        {b.commentary}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Full Match Scorecard */}
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '18px' }}>
              Official Match Scorecard
            </h3>

            {/* Innings 1 Batting */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '16px', color: 'var(--accent-green)' }}>
                  {match.team1_name} Innings (Batting)
                </h4>
                <div style={{ fontSize: '14px', fontWeight: '800' }}>
                  Total: {t1Runs}/{t1Wickets}
                </div>
              </div>

              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Batter</th>
                      <th>Dismissal</th>
                      <th>R</th>
                      <th>B</th>
                      <th>4s</th>
                      <th>6s</th>
                      <th>SR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team1Batting.map(b => (
                      <tr key={b.player_id}>
                        <td 
                          style={{ fontWeight: '700', cursor: 'pointer', color: 'var(--accent-green)' }}
                          onClick={() => onOpenPlayer(b.player_id)}
                        >
                          {b.player_name}
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {b.is_out ? (b.dismissal_type || 'Out') : 'Not out *'}
                        </td>
                        <td style={{ fontWeight: '800', color: 'var(--orange-cap)' }}>{b.runs_scored}</td>
                        <td>{b.balls_faced}</td>
                        <td>{b.fours}</td>
                        <td>{b.sixes}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{b.strike_rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Team 2 Bowling against Team 1 */}
            <div style={{ marginBottom: '28px' }}>
              <h4 style={{ fontSize: '16px', color: 'var(--purple-cap)', marginBottom: '12px' }}>
                {match.team2_name} Bowling
              </h4>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Bowler</th>
                      <th>Overs</th>
                      <th>Runs</th>
                      <th>Wickets</th>
                      <th>Economy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team2Bowling.map(bw => (
                      <tr key={bw.player_id}>
                        <td 
                          style={{ fontWeight: '700', cursor: 'pointer', color: 'var(--purple-cap)' }}
                          onClick={() => onOpenPlayer(bw.player_id)}
                        >
                          {bw.player_name}
                        </td>
                        <td>{bw.overs_bowled}</td>
                        <td>{bw.runs_conceded}</td>
                        <td style={{ fontWeight: '800', color: 'var(--purple-cap)' }}>{bw.wickets_taken}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{bw.economy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Innings 2 Batting (if exists) */}
            {team2Batting.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '16px', color: 'var(--accent-cyan)' }}>
                    {match.team2_name} Innings (Batting)
                  </h4>
                  <div style={{ fontSize: '14px', fontWeight: '800' }}>
                    Total: {t2Runs}/{t2Wickets}
                  </div>
                </div>

                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Batter</th>
                        <th>Dismissal</th>
                        <th>R</th>
                        <th>B</th>
                        <th>4s</th>
                        <th>6s</th>
                        <th>SR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {team2Batting.map(b => (
                        <tr key={b.player_id}>
                          <td 
                            style={{ fontWeight: '700', cursor: 'pointer', color: 'var(--accent-cyan)' }}
                            onClick={() => onOpenPlayer(b.player_id)}
                          >
                            {b.player_name}
                          </td>
                          <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {b.is_out ? (b.dismissal_type || 'Out') : 'Not out *'}
                          </td>
                          <td style={{ fontWeight: '800', color: 'var(--orange-cap)' }}>{b.runs_scored}</td>
                          <td>{b.balls_faced}</td>
                          <td>{b.fours}</td>
                          <td>{b.sixes}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{b.strike_rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Complete Match Modal */}
      {showCompleteModal && (
        <div className="modal-overlay" onClick={() => setShowCompleteModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>🏆 Conclude & Finalize Match</h3>
            <form onSubmit={handleCompleteMatch}>
              <div className="form-group">
                <label className="form-label">Winner Team</label>
                <select className="form-select" value={winnerTeamId} onChange={e => setWinnerTeamId(e.target.value)}>
                  <option value={match.team1_id}>{match.team1_name}</option>
                  <option value={match.team2_id}>{match.team2_name}</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Win Type</label>
                  <select className="form-select" value={winType} onChange={e => setWinType(e.target.value)}>
                    <option value="Runs">Runs</option>
                    <option value="Wickets">Wickets</option>
                    <option value="Super Over">Super Over</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Win Margin</label>
                  <input type="number" className="form-input" min="1" value={winMargin} onChange={e => setWinMargin(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Player of the Match (POM Award + $15,000 Bonus)</label>
                <select className="form-select" value={pomPlayerId} onChange={e => setPomPlayerId(e.target.value)}>
                  <optgroup label={match.team1_name}>
                    {matchData.team1Squad?.map(p => (
                      <option key={p.player_id} value={p.player_id}>{p.player_name}</option>
                    ))}
                  </optgroup>
                  <optgroup label={match.team2_name}>
                    {matchData.team2Squad?.map(p => (
                      <option key={p.player_id} value={p.player_id}>{p.player_name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCompleteModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold" style={{ flex: 2 }}>
                  Save & Finalize Match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
