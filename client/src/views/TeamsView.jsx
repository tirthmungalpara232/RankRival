import React, { useState, useEffect } from 'react';
import { Shield, Users, Trophy, Award, MapPin, ChevronRight, X } from 'lucide-react';
import { api } from '../api';

export default function TeamsView({ onOpenPlayer }) {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamDetails, setTeamDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    setLoading(true);
    try {
      const data = await api.getTeams();
      setTeams(data);
    } catch (err) {
      console.error('Failed to load teams:', err);
    } finally {
      setLoading(false);
    }
  }

  async function openTeamRoster(team) {
    setSelectedTeam(team);
    setDetailLoading(true);
    try {
      const data = await api.getTeam(team.team_id);
      setTeamDetails(data);
    } catch (err) {
      console.error('Failed to load team details:', err);
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={28} color="var(--accent-gold)" /> Cricket Teams & Squad Rosters
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Explore national teams, franchise squads, coaching staffs, and player lineups
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading teams and rosters...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {teams.map(t => (
            <div 
              key={t.team_id}
              className="card card-clickable"
              onClick={() => openTeamRoster(t)}
              style={{ padding: '24px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(255, 209, 102, 0.2), rgba(0, 230, 118, 0.2))',
                    border: '1px solid var(--border-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px'
                  }}>
                    🛡️
                  </div>
                  <div>
                    <h3 style={{ fontSize: '19px', fontWeight: '800' }}>{t.team_name}</h3>
                    <span className="badge badge-gold" style={{ fontSize: '10px' }}>{t.country_name}</span>
                  </div>
                </div>

                <span className="badge badge-green" style={{ fontSize: '11px' }}>
                  {t.team_type}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                <div>👑 <strong>Captain:</strong> {t.captain_name || 'To be announced'}</div>
                <div>👔 <strong>Head Coach:</strong> {t.coach_name || 'Senior Staff'}</div>
                <div>📅 <strong>Founded:</strong> {t.founded_year || 'Historical'}</div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                background: 'rgba(0,0,0,0.2)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '12px',
                marginBottom: '14px'
              }}>
                <div>👥 Squad: <strong>{t.squad_count} Players</strong></div>
                <div>🏆 Victories: <strong style={{ color: 'var(--accent-green)' }}>{t.total_wins} Wins</strong></div>
              </div>

              <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                View Squad Roster & Tournaments →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Team Details Modal */}
      {selectedTeam && (
        <div className="modal-overlay" onClick={() => setSelectedTeam(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '820px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '14px',
                  background: 'var(--accent-gold-dim)',
                  border: '1px solid var(--border-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  🛡️
                </div>
                <div>
                  <h2 style={{ fontSize: '24px' }}>{selectedTeam.team_name}</h2>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Captain: <strong>{selectedTeam.captain_name}</strong> • Coach: <strong>{selectedTeam.coach_name}</strong>
                  </div>
                </div>
              </div>

              <button className="modal-close-btn" onClick={() => setSelectedTeam(null)}>
                <X size={18} />
              </button>
            </div>

            {detailLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Loading squad roster...
              </div>
            ) : teamDetails ? (
              <div>
                <h4 style={{ fontSize: '16px', marginBottom: '14px' }}>Official Squad Roster ({teamDetails.squad?.length || 0} Players)</h4>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Player Name</th>
                        <th>Role</th>
                        <th>Batting Style</th>
                        <th>Bowling Style</th>
                        <th>Career Runs</th>
                        <th>Wickets</th>
                        <th>Earnings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamDetails.squad?.map(p => (
                        <tr 
                          key={p.player_id}
                          onClick={() => {
                            setSelectedTeam(null);
                            onOpenPlayer(p.player_id);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <td style={{ fontWeight: '700', color: 'var(--accent-green)' }}>
                            {p.jersey_number ? `#${p.jersey_number}` : '-'}
                          </td>
                          <td style={{ fontWeight: '700', color: 'var(--accent-green)' }}>
                            {p.first_name} {p.last_name}
                          </td>
                          <td><span className="badge badge-green" style={{ fontSize: '10px' }}>{p.player_role}</span></td>
                          <td style={{ fontSize: '12px' }}>{p.batting_style}</td>
                          <td style={{ fontSize: '12px' }}>{p.bowling_style || 'N/A'}</td>
                          <td style={{ fontWeight: '700', color: 'var(--orange-cap)' }}>{p.total_runs}</td>
                          <td style={{ fontWeight: '700', color: 'var(--purple-cap)' }}>{p.total_wickets}</td>
                          <td style={{ fontWeight: '800', color: 'var(--accent-gold)' }}>
                            ${Number(p.total_earnings).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
