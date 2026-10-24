import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trophy, 
  Award, 
  CircleDollarSign, 
  Shield, 
  Activity, 
  Calendar, 
  Star, 
  Flame, 
  FileText,
  UserCheck
} from 'lucide-react';
import { api } from '../api';

export default function PlayerProfileModal({ isOpen, onClose, playerId, onOpenCompare }) {
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tournaments'); // 'tournaments', 'earnings', 'matches', 'stats'

  useEffect(() => {
    if (isOpen && playerId) {
      loadPlayer();
    }
  }, [isOpen, playerId]);

  async function loadPlayer() {
    setLoading(true);
    try {
      const data = await api.getPlayer(playerId);
      setPlayerData(data);
    } catch (err) {
      console.error('Failed to load player:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const player = playerData?.player;
  const career = playerData?.careerStats;
  const tourHistory = playerData?.tournamentHistory || [];
  const earnings = playerData?.earningsLedger || [];
  const matchLogs = playerData?.matchLogs || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '880px', padding: '28px' }}>
        <div className="modal-header" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #00e676, #00b0ff)',
              color: '#040912',
              fontSize: '24px',
              fontWeight: '900',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(0, 230, 118, 0.3)'
            }}>
              {player?.jersey_number ? `#${player.jersey_number}` : (player?.first_name?.charAt(0) || 'P')}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '24px' }}>{player?.first_name} {player?.last_name}</h2>
                <span className="badge badge-green">{player?.player_role}</span>
                <span className="badge badge-gold">{player?.country_name}</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', gap: '14px', marginTop: '4px' }}>
                <span>🛡️ {player?.team_name || 'Free Agent'}</span>
                <span>🏏 Bat: {player?.batting_style || 'Right-hand'}</span>
                <span>⚾ Bowl: {player?.bowling_style || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onOpenCompare && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => onOpenCompare(playerId)}
              >
                ⚔️ Compare
              </button>
            )}
            <button className="modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading player performance records and earnings...
          </div>
        ) : (
          <>
            {/* Top Quick Numbers Bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '10px',
              marginBottom: '20px'
            }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Matches</div>
                <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--font-display)' }}>{career?.matches_played || 0}</div>
              </div>

              <div style={{ background: 'rgba(255, 119, 0, 0.08)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 119, 0, 0.3)', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--orange-cap)', textTransform: 'uppercase' }}>Total Runs</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--orange-cap)', fontFamily: 'var(--font-display)' }}>{career?.total_runs || 0}</div>
              </div>

              <div style={{ background: 'rgba(168, 85, 247, 0.08)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(168, 85, 247, 0.3)', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--purple-cap)', textTransform: 'uppercase' }}>Wickets</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--purple-cap)', fontFamily: 'var(--font-display)' }}>{career?.total_wickets || 0}</div>
              </div>

              <div style={{ background: 'rgba(0, 229, 255, 0.08)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0, 229, 255, 0.3)', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>Catches</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)' }}>{career?.total_catches || 0}</div>
              </div>

              <div style={{ background: 'rgba(255, 209, 102, 0.1)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-gold)', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--accent-gold)', textTransform: 'uppercase' }}>Total Earnings</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent-gold)', fontFamily: 'var(--font-display)' }}>
                  ${Number(career?.total_earnings || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Sub-view navigation tabs */}
            <div className="tabs-bar">
              <button 
                className={`tab-btn ${activeTab === 'tournaments' ? 'active' : ''}`}
                onClick={() => setActiveTab('tournaments')}
              >
                <Trophy size={16} /> Tournament Records ({tourHistory.length})
              </button>

              <button 
                className={`tab-btn ${activeTab === 'earnings' ? 'active' : ''}`}
                onClick={() => setActiveTab('earnings')}
              >
                <CircleDollarSign size={16} /> Prize Purse Ledger ({earnings.length})
              </button>

              <button 
                className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
                onClick={() => setActiveTab('matches')}
              >
                <Activity size={16} /> Match Logs ({matchLogs.length})
              </button>

              <button 
                className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveTab('stats')}
              >
                <FileText size={16} /> Full Career Card
              </button>
            </div>

            {/* TAB 1: TOURNAMENT PARTICIPATION & PERFORMANCE */}
            {activeTab === 'tournaments' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '15px' }}>Tournament Performance History</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Detailed breakdown of runs, wickets, catches, and earnings by tournament
                  </span>
                </div>

                {tourHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No tournament participation recorded yet.
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Tournament Name</th>
                          <th>Format</th>
                          <th>Matches</th>
                          <th>Runs</th>
                          <th>High</th>
                          <th>SR</th>
                          <th>Wickets</th>
                          <th>Econ</th>
                          <th>Catches</th>
                          <th>POM</th>
                          <th>Tournament Earnings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tourHistory.map(th => (
                          <tr key={th.tournament_id}>
                            <td style={{ fontWeight: '700' }}>{th.tournament_name}</td>
                            <td><span className="badge badge-gold" style={{ fontSize: '10px' }}>{th.format}</span></td>
                            <td>{th.matches_played}</td>
                            <td style={{ fontWeight: '700', color: 'var(--orange-cap)' }}>{th.runs}</td>
                            <td>{th.highest_score}</td>
                            <td>{th.strike_rate}</td>
                            <td style={{ fontWeight: '700', color: 'var(--purple-cap)' }}>{th.wickets}</td>
                            <td>{th.economy}</td>
                            <td style={{ fontWeight: '700', color: 'var(--accent-cyan)' }}>{th.catches}</td>
                            <td>{th.pom_count > 0 ? `⭐ ${th.pom_count}` : '-'}</td>
                            <td style={{ fontWeight: '800', color: 'var(--accent-gold)' }}>
                              ${Number(th.tournament_earnings).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: FINANCIAL EARNINGS LEDGER */}
            {activeTab === 'earnings' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '15px' }}>Earnings & Prize Money Ledger</h4>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-gold)' }}>
                    Career Purse: ${Number(career?.total_earnings || 0).toLocaleString()} USD
                  </div>
                </div>

                {earnings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No earnings entries recorded yet.
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Tournament</th>
                          <th>Earning Type</th>
                          <th>Amount</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {earnings.map(e => (
                          <tr key={e.earning_id}>
                            <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{e.date_awarded}</td>
                            <td style={{ fontWeight: '600' }}>{e.tournament_name}</td>
                            <td>
                              <span className={`badge ${
                                e.earning_type.includes('Prize') ? 'badge-gold' : 
                                e.earning_type.includes('Match') ? 'badge-green' : 'badge-orange'
                              }`}>
                                {e.earning_type}
                              </span>
                            </td>
                            <td style={{ fontWeight: '800', color: 'var(--accent-gold)' }}>
                              +${Number(e.amount).toLocaleString()} {e.currency}
                            </td>
                            <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{e.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: MATCH-BY-MATCH LOGS */}
            {activeTab === 'matches' && (
              <div>
                <h4 style={{ fontSize: '15px', marginBottom: '12px' }}>Recent Match Logs</h4>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Tournament</th>
                        <th>Opponent</th>
                        <th>Runs</th>
                        <th>Balls</th>
                        <th>4s/6s</th>
                        <th>SR</th>
                        <th>Dismissal</th>
                        <th>Overs</th>
                        <th>Wkts</th>
                        <th>Catches</th>
                        <th>POM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchLogs.map((m, idx) => (
                        <tr key={idx}>
                          <td style={{ fontSize: '12px' }}>{m.match_date}</td>
                          <td>{m.tournament_name}</td>
                          <td style={{ fontWeight: '600' }}>vs {m.opponent_team}</td>
                          <td style={{ fontWeight: '700', color: 'var(--orange-cap)' }}>{m.runs_scored}</td>
                          <td>{m.balls_faced}</td>
                          <td>{m.fours}/{m.sixes}</td>
                          <td>{m.match_strike_rate}</td>
                          <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {m.is_out ? (m.dismissal_type || 'Out') : 'Not out *'}
                          </td>
                          <td>{m.overs_bowled > 0 ? m.overs_bowled : '-'}</td>
                          <td style={{ fontWeight: '700', color: 'var(--purple-cap)' }}>
                            {m.overs_bowled > 0 ? m.wickets_taken : '-'}
                          </td>
                          <td>{m.catches > 0 ? m.catches : '-'}</td>
                          <td>{m.is_player_of_match ? '🏆 POM' : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: FULL CAREER STATS */}
            {activeTab === 'stats' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Batting Card */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ color: 'var(--orange-cap)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🏏 Batting & Fielding Career
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                    <div>Total Runs: <strong>{career?.total_runs}</strong></div>
                    <div>Batting Average: <strong>{career?.batting_average}</strong></div>
                    <div>Strike Rate: <strong>{career?.strike_rate}</strong></div>
                    <div>Highest Score: <strong>{career?.highest_score}</strong></div>
                    <div>Fifties (50s): <strong>{career?.fifties}</strong></div>
                    <div>Hundreds (100s): <strong>{career?.hundreds}</strong></div>
                    <div>Boundaries: <strong>{career?.total_fours} (4s) / {career?.total_sixes} (6s)</strong></div>
                    <div>Catches: <strong>{career?.total_catches}</strong></div>
                  </div>
                </div>

                {/* Bowling Card */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ color: 'var(--purple-cap)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ⚾ Bowling Career
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                    <div>Total Wickets: <strong>{career?.total_wickets}</strong></div>
                    <div>Economy Rate: <strong>{career?.bowling_economy}</strong></div>
                    <div>Bowling Average: <strong>{career?.bowling_average}</strong></div>
                    <div>Overs Bowled: <strong>{career?.total_overs}</strong></div>
                    <div>Runs Conceded: <strong>{career?.runs_conceded}</strong></div>
                    <div>Player of Matches: <strong>{career?.pom_awards} 🏆</strong></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
