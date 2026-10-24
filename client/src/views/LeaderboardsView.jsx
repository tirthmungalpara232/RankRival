import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Trophy, 
  Flame, 
  Zap, 
  CircleDollarSign, 
  Shield, 
  Search,
  Star,
  Users
} from 'lucide-react';
import { api } from '../api';

export default function LeaderboardsView({ onOpenPlayer }) {
  const [category, setCategory] = useState('orange_cap');
  const [tournamentId, setTournamentId] = useState('all');
  const [tournaments, setTournaments] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournamentsList();
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [category, tournamentId]);

  async function loadTournamentsList() {
    try {
      const data = await api.getTournaments();
      setTournaments(data);
    } catch (err) {
      console.error('Failed to load tournaments list:', err);
    }
  }

  async function loadLeaderboard() {
    setLoading(true);
    try {
      const res = await api.getLeaderboard(category, tournamentId);
      setLeaderboardData(res.data || []);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }

  const top3 = leaderboardData.slice(0, 3);
  const rest = leaderboardData.slice(3);

  const categoryDetails = {
    orange_cap: {
      title: 'Orange Cap — Leading Run Scorers',
      badge: 'badge-orange',
      color: 'var(--orange-cap)',
      metricLabel: 'Runs',
      metricKey: 'runs',
      icon: '🟠'
    },
    purple_cap: {
      title: 'Purple Cap — Leading Wicket Takers',
      badge: 'badge-purple',
      color: 'var(--purple-cap)',
      metricLabel: 'Wickets',
      metricKey: 'wickets',
      icon: '🟣'
    },
    strike_rate: {
      title: 'Power Hitters — Highest Batting Strike Rate',
      badge: 'badge-green',
      color: 'var(--accent-green)',
      metricLabel: 'Strike Rate',
      metricKey: 'strike_rate',
      icon: '⚡'
    },
    sixes: {
      title: 'Maximum Sixes — Boundary Kings',
      badge: 'badge-gold',
      color: 'var(--accent-gold)',
      metricLabel: 'Sixes (6s)',
      metricKey: 'sixes',
      icon: '🚀'
    },
    fielding: {
      title: 'Safest Hands — Most Catches & Dismissals',
      badge: 'badge-upcoming',
      color: 'var(--accent-cyan)',
      metricLabel: 'Catches',
      metricKey: 'catches',
      icon: '🧤'
    },
    earnings: {
      title: 'Prize Money Hub — Highest Career & Tournament Earners',
      badge: 'badge-gold',
      color: 'var(--accent-gold)',
      metricLabel: 'Total Earned',
      metricKey: 'total_earnings',
      isCurrency: true,
      icon: '💰'
    },
    mvp: {
      title: 'Most Valuable Player (MVP Points Rating)',
      badge: 'badge-green',
      color: 'var(--accent-green)',
      metricLabel: 'MVP Index',
      metricKey: 'mvp_points',
      icon: '⭐'
    }
  };

  const currentCat = categoryDetails[category] || categoryDetails.orange_cap;

  return (
    <div>
      {/* Header & Tournament Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={28} color="var(--accent-green)" /> The Cricket Honors Board
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Official rankings across runs, strike rates, wickets, catches, earnings, and MVP points
          </p>
        </div>

        {/* Tournament Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>Filter Tournament:</span>
          <select 
            className="form-select"
            style={{ width: '260px' }}
            value={tournamentId}
            onChange={e => setTournamentId(e.target.value)}
          >
            <option value="all">🏆 All Tournaments (All-Time Career)</option>
            {tournaments.map(t => (
              <option key={t.tournament_id} value={t.tournament_id}>
                {t.tournament_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Categories Selector Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '28px'
      }}>
        {[
          { id: 'orange_cap', label: '🟠 Orange Cap (Runs)' },
          { id: 'purple_cap', label: '🟣 Purple Cap (Wickets)' },
          { id: 'strike_rate', label: '⚡ Highest Strike Rate' },
          { id: 'sixes', label: '🚀 Maximum Sixes' },
          { id: 'fielding', label: '🧤 Most Catches' },
          { id: 'earnings', label: '💰 Top Earners ($)' },
          { id: 'mvp', label: '⭐ MVP Index' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`btn btn-sm ${category === cat.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ whiteSpace: 'nowrap', padding: '8px 16px', fontWeight: category === cat.id ? '800' : '600' }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Computing rankings from tournament match databases...
        </div>
      ) : leaderboardData.length === 0 ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No records found for this category and tournament filter.
        </div>
      ) : (
        <div>
          {/* TOP 3 PODIUM */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '18px',
            marginBottom: '32px'
          }}>
            {top3.map((player, idx) => {
              const rank = idx + 1;
              const val = player[currentCat.metricKey];
              const displayVal = currentCat.isCurrency ? `$${Number(val).toLocaleString()}` : val;
              const isGold = rank === 1;

              return (
                <div
                  key={player.player_id}
                  className="card card-clickable"
                  onClick={() => onOpenPlayer(player.player_id)}
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    background: isGold 
                      ? 'linear-gradient(135deg, rgba(255, 209, 102, 0.14), rgba(18, 28, 48, 0.9))'
                      : 'var(--bg-card)',
                    borderColor: isGold ? 'var(--border-gold)' : 'var(--border-subtle)',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isGold ? 'var(--accent-gold)' : (rank === 2 ? '#94a3b8' : '#cd7f32'),
                    color: '#000',
                    fontWeight: '900',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    boxShadow: isGold ? 'var(--shadow-glow-gold)' : 'none'
                  }}>
                    {rank === 1 ? '👑' : `#${rank}`}
                  </div>

                  <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{player.player_name}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    {player.player_role} • {player.team_name}
                  </div>

                  <div style={{
                    fontSize: '32px',
                    fontWeight: '900',
                    fontFamily: 'var(--font-display)',
                    color: currentCat.color,
                    lineHeight: 1
                  }}>
                    {displayVal}
                  </div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {currentCat.metricLabel}
                  </div>
                </div>
              );
            })}
          </div>

          {/* FULL LEADERBOARD TABLE */}
          <div className="card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '16px', marginBottom: '16px' }}>{currentCat.title}</h4>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Role</th>
                    <th>Team</th>
                    <th>Country</th>
                    {category === 'orange_cap' && (
                      <>
                        <th>Innings</th>
                        <th>Runs</th>
                        <th>High</th>
                        <th>Average</th>
                        <th>SR</th>
                        <th>4s/6s</th>
                        <th>50s/100s</th>
                      </>
                    )}
                    {category === 'purple_cap' && (
                      <>
                        <th>Matches</th>
                        <th>Wickets</th>
                        <th>Overs</th>
                        <th>Runs Conc.</th>
                        <th>Economy</th>
                        <th>Average</th>
                      </>
                    )}
                    {category === 'strike_rate' && (
                      <>
                        <th>Runs</th>
                        <th>Balls Faced</th>
                        <th>Strike Rate</th>
                        <th>Sixes</th>
                        <th>Fours</th>
                      </>
                    )}
                    {category === 'sixes' && (
                      <>
                        <th>Sixes (6s)</th>
                        <th>Fours (4s)</th>
                        <th>Runs</th>
                        <th>Strike Rate</th>
                      </>
                    )}
                    {category === 'fielding' && (
                      <>
                        <th>Matches</th>
                        <th>Catches Taken</th>
                      </>
                    )}
                    {category === 'earnings' && (
                      <>
                        <th>Payouts</th>
                        <th>Prize Shares</th>
                        <th>POM Bonuses</th>
                        <th>Match Fees</th>
                        <th>Total Earnings</th>
                      </>
                    )}
                    {category === 'mvp' && (
                      <>
                        <th>Runs</th>
                        <th>Wickets</th>
                        <th>Catches</th>
                        <th>Sixes</th>
                        <th>MVP Points</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((p, idx) => (
                    <tr 
                      key={p.player_id}
                      onClick={() => onOpenPlayer(p.player_id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: '800', color: idx < 3 ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                        {idx + 1}
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--accent-green)' }}>
                        {p.player_name}
                      </td>
                      <td><span className="badge badge-green" style={{ fontSize: '10px' }}>{p.player_role}</span></td>
                      <td>{p.team_name}</td>
                      <td>{p.country_name}</td>

                      {category === 'orange_cap' && (
                        <>
                          <td>{p.innings}</td>
                          <td style={{ fontWeight: '800', color: 'var(--orange-cap)' }}>{p.runs}</td>
                          <td>{p.highest_score}</td>
                          <td>{p.batting_average}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{p.strike_rate}</td>
                          <td>{p.fours}/{p.sixes}</td>
                          <td>{p.fifties}/{p.hundreds}</td>
                        </>
                      )}

                      {category === 'purple_cap' && (
                        <>
                          <td>{p.matches}</td>
                          <td style={{ fontWeight: '800', color: 'var(--purple-cap)' }}>{p.wickets}</td>
                          <td>{p.overs}</td>
                          <td>{p.runs_conceded}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{p.economy}</td>
                          <td>{p.bowling_average}</td>
                        </>
                      )}

                      {category === 'strike_rate' && (
                        <>
                          <td>{p.runs}</td>
                          <td>{p.balls_faced}</td>
                          <td style={{ fontWeight: '800', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>{p.strike_rate}</td>
                          <td>{p.sixes}</td>
                          <td>{p.fours}</td>
                        </>
                      )}

                      {category === 'sixes' && (
                        <>
                          <td style={{ fontWeight: '800', color: 'var(--accent-gold)' }}>{p.sixes}</td>
                          <td>{p.fours}</td>
                          <td>{p.runs}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{p.strike_rate}</td>
                        </>
                      )}

                      {category === 'fielding' && (
                        <>
                          <td>{p.matches}</td>
                          <td style={{ fontWeight: '800', color: 'var(--accent-cyan)' }}>{p.catches}</td>
                        </>
                      )}

                      {category === 'earnings' && (
                        <>
                          <td>{p.transactions_count}</td>
                          <td>${Number(p.prize_share).toLocaleString()}</td>
                          <td>${Number(p.pom_bonus).toLocaleString()}</td>
                          <td>${Number(p.match_fees).toLocaleString()}</td>
                          <td style={{ fontWeight: '900', color: 'var(--accent-gold)' }}>
                            ${Number(p.total_earnings).toLocaleString()}
                          </td>
                        </>
                      )}

                      {category === 'mvp' && (
                        <>
                          <td>{p.runs}</td>
                          <td>{p.wickets}</td>
                          <td>{p.catches}</td>
                          <td>{p.sixes}</td>
                          <td style={{ fontWeight: '900', color: 'var(--accent-green)' }}>
                            {p.mvp_points}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
