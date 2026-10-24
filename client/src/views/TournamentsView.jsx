import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Users, 
  PlusCircle, 
  Search, 
  Radio, 
  CheckCircle,
  Clock,
  ArrowRight,
  Shield,
  CircleDollarSign,
  Award
} from 'lucide-react';
import { api } from '../api';

export default function TournamentsView({ 
  onOpenConduct, 
  onOpenParticipate, 
  onSelectMatch,
  onOpenPlayer,
  currentUser 
}) {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [formatFilter, setFormatFilter] = useState('All');
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [tournamentDetails, setTournamentDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState('points'); // 'points', 'matches', 'performers', 'prize'

  // Schedule Match Form state
  const [scheduling, setScheduling] = useState(false);
  const [venues, setVenues] = useState([]);
  const [schTeam1, setSchTeam1] = useState('');
  const [schTeam2, setSchTeam2] = useState('');
  const [schVenue, setSchVenue] = useState('');
  const [schDate, setSchDate] = useState('');
  const [schStage, setSchStage] = useState('Group');

  useEffect(() => {
    loadTournaments();
  }, [statusFilter, formatFilter]);

  async function loadTournaments() {
    setLoading(true);
    try {
      let query = '?';
      if (statusFilter !== 'All') query += `status=${statusFilter}&`;
      if (formatFilter !== 'All') query += `type_id=${formatFilter}&`;

      const data = await api.getTournaments(query);
      setTournaments(data);

      // Auto-select first tournament for detail view if none selected
      if (data.length > 0 && !selectedTournament) {
        selectTournament(data[0]);
      }
    } catch (err) {
      console.error('Failed to load tournaments:', err);
    } finally {
      setLoading(false);
    }
  }

  async function selectTournament(t) {
    setSelectedTournament(t);
    setDetailLoading(true);
    try {
      const details = await api.getTournament(t.tournament_id);
      setTournamentDetails(details);

      // Pre-fill scheduler options if teams available
      if (details.pointsTable?.length >= 2) {
        setSchTeam1(details.pointsTable[0].team_id);
        setSchTeam2(details.pointsTable[1].team_id);
      }

      // Load venues
      const venuesList = await api.getVenues();
      setVenues(venuesList);
      if (venuesList.length > 0) setSchVenue(venuesList[0].venue_id);
      setSchDate(new Date().toISOString().slice(0, 10));
    } catch (err) {
      console.error('Failed to load tournament details:', err);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleScheduleMatch(e) {
    e.preventDefault();
    if (!selectedTournament || !schTeam1 || !schTeam2 || !schVenue || !schDate) return;

    try {
      await api.scheduleMatch(selectedTournament.tournament_id, {
        team1_id: Number(schTeam1),
        team2_id: Number(schTeam2),
        venue_id: Number(schVenue),
        match_date: schDate,
        match_stage: schStage
      });

      alert('Match successfully scheduled in tournament!');
      setScheduling(false);
      selectTournament(selectedTournament); // Reload details
    } catch (err) {
      alert(err.message || 'Failed to schedule match');
    }
  }

  return (
    <div>
      {/* Header & Host action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Trophy size={28} color="var(--accent-gold)" /> Cricket Tournaments
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Browse championship events, inspect points tables, schedule matches, and enter your team
          </p>
        </div>

        {(!currentUser || currentUser.role === 'Organizer' || currentUser.role === 'Admin') ? (
          <button className="btn btn-primary" onClick={onOpenConduct}>
            <PlusCircle size={16} /> Conduct Tournament
          </button>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={() => onOpenParticipate(selectedTournament || tournaments[0])}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Trophy size={16} /> Join Tournament
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'Ongoing', 'Upcoming', 'Completed'].map(status => (
            <button
              key={status}
              className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'Ongoing' && '🔴 '}
              {status}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Format:</span>
          <select 
            className="form-select" 
            style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
            value={formatFilter} 
            onChange={e => setFormatFilter(e.target.value)}
          >
            <option value="All">All Formats</option>
            <option value="1">T20</option>
            <option value="2">ODI</option>
            <option value="4">T10</option>
            <option value="3">Test</option>
          </select>
        </div>
      </div>

      {/* Main Split Layout: Tournaments List (Left) & Tournament Detail Center (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
        {/* Left: Tournament Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading tournaments...
            </div>
          ) : tournaments.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No tournaments found for selected filters.
            </div>
          ) : (
            tournaments.map(t => {
              const isSelected = selectedTournament?.tournament_id === t.tournament_id;
              return (
                <div 
                  key={t.tournament_id}
                  className="card card-clickable"
                  onClick={() => selectTournament(t)}
                  style={{
                    borderColor: isSelected ? 'var(--accent-green)' : 'var(--border-subtle)',
                    background: isSelected ? 'rgba(0, 230, 118, 0.05)' : 'var(--bg-card)',
                    padding: '20px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge ${
                        t.status === 'Ongoing' ? 'badge-live' : 
                        t.status === 'Upcoming' ? 'badge-upcoming' : 'badge-completed'
                      }`}>
                        {t.status === 'Ongoing' && <span className="pulse-dot" style={{ width: '6px', height: '6px' }}></span>}
                        {t.status}
                      </span>
                      <span className="badge badge-gold">{t.format}</span>
                    </div>

                    <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent-gold)' }}>
                      ${Number(t.prize_money).toLocaleString()}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '17px', marginBottom: '6px' }}>{t.tournament_name}</h3>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '14px', marginBottom: '14px' }}>
                    <span>📍 {t.host_country}</span>
                    <span>📅 {t.season_year}</span>
                    <span>🛡️ {t.teams_count} Teams</span>
                    <span>🏏 {t.matches_count} Matches</span>
                  </div>

                  {/* Winner if Completed */}
                  {t.winner_team && (
                    <div style={{
                      background: 'rgba(255, 209, 102, 0.08)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <span style={{ color: 'var(--accent-gold)', fontWeight: '700' }}>🏆 Champions: {t.winner_team}</span>
                      {t.runner_up_team && <span style={{ color: 'var(--text-muted)' }}>Runner-up: {t.runner_up_team}</span>}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenParticipate(t);
                      }}
                    >
                      Participate / Join
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => selectTournament(t)}
                    >
                      Inspect Standings →
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Tournament Command Center */}
        <div>
          {detailLoading ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
              Loading tournament center...
            </div>
          ) : tournamentDetails ? (
            <div className="card" style={{ padding: '28px' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-gold">{tournamentDetails.tournament.format}</span>
                    <span className="badge badge-green">{tournamentDetails.tournament.status}</span>
                  </div>
                  <h2 style={{ fontSize: '24px' }}>{tournamentDetails.tournament.tournament_name}</h2>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', gap: '14px', marginTop: '4px' }}>
                    <span>📍 Host: {tournamentDetails.tournament.host_country}</span>
                    <span>📅 {tournamentDetails.tournament.start_date} to {tournamentDetails.tournament.end_date}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Purse Pool</div>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--accent-gold)' }}>
                    ${Number(tournamentDetails.tournament.prize_money).toLocaleString()}
                  </div>
                  <button 
                    className="btn btn-primary btn-sm" 
                    style={{ marginTop: '8px' }}
                    onClick={() => onOpenParticipate(tournamentDetails.tournament)}
                  >
                    Enter Team Squad
                  </button>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="tabs-bar">
                <button 
                  className={`tab-btn ${detailTab === 'points' ? 'active' : ''}`}
                  onClick={() => setDetailTab('points')}
                >
                  📊 Points Table
                </button>
                <button 
                  className={`tab-btn ${detailTab === 'matches' ? 'active' : ''}`}
                  onClick={() => setDetailTab('matches')}
                >
                  🏏 Fixtures & Scorecards ({tournamentDetails.matches?.length || 0})
                </button>
                <button 
                  className={`tab-btn ${detailTab === 'performers' ? 'active' : ''}`}
                  onClick={() => setDetailTab('performers')}
                >
                  ⭐ Top Performers
                </button>
                {(currentUser?.role === 'Organizer' || currentUser?.role === 'Admin') && (
                  <button 
                    className={`tab-btn ${detailTab === 'schedule' ? 'active' : ''}`}
                    onClick={() => setDetailTab('schedule')}
                  >
                    ➕ Schedule Match
                  </button>
                )}
              </div>

              {/* TAB 1: POINTS TABLE */}
              {detailTab === 'points' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '15px' }}>Official Standings Table</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Top teams advance to knockouts</span>
                  </div>

                  {tournamentDetails.pointsTable?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No teams registered yet. Be the first to participate!
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Team</th>
                            <th>P</th>
                            <th>W</th>
                            <th>L</th>
                            <th>NRR</th>
                            <th>PTS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tournamentDetails.pointsTable.map((pt, index) => (
                            <tr key={pt.team_id} style={{ background: index < 2 ? 'rgba(0, 230, 118, 0.04)' : 'transparent' }}>
                              <td style={{ fontWeight: '700', color: index < 2 ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                                {index + 1}
                              </td>
                              <td style={{ fontWeight: '700' }}>
                                {pt.team_name} {index === 0 && '👑'}
                              </td>
                              <td>{pt.matches_played}</td>
                              <td style={{ color: 'var(--accent-green)', fontWeight: '600' }}>{pt.won}</td>
                              <td style={{ color: '#ef4444' }}>{pt.lost}</td>
                              <td style={{ fontFamily: 'var(--font-mono)' }}>
                                {pt.net_run_rate > 0 ? `+${pt.net_run_rate}` : pt.net_run_rate}
                              </td>
                              <td style={{ fontWeight: '900', fontSize: '15px', color: 'var(--accent-gold)' }}>
                                {pt.points}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MATCHES & FIXTURES */}
              {detailTab === 'matches' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '15px' }}>Tournament Schedule & Results</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click match to open live scorecard</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                    {tournamentDetails.matches?.map(m => (
                      <div 
                        key={m.match_id}
                        className="card card-clickable"
                        onClick={() => onSelectMatch(m.match_id)}
                        style={{
                          padding: '14px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: m.status === 'Live' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255,255,255,0.02)'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                            <span className={`badge ${m.status === 'Live' ? 'badge-live' : m.status === 'Completed' ? 'badge-completed' : 'badge-upcoming'}`} style={{ fontSize: '10px' }}>
                              {m.status}
                            </span>
                            <span>{m.match_stage}</span>
                            <span>•</span>
                            <span>{m.match_date}</span>
                          </div>

                          <div style={{ fontSize: '15px', fontWeight: '800' }}>
                            {m.team1_name} vs {m.team2_name}
                          </div>

                          {m.winner_name && (
                            <div style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: '600', marginTop: '2px' }}>
                              ✓ {m.winner_name} won by {m.win_margin} {m.win_type}
                            </div>
                          )}
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <button className="btn btn-secondary btn-sm">
                            Scorecard →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: TOP PERFORMERS */}
              {detailTab === 'performers' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Top Batsmen */}
                  <div style={{ background: 'rgba(255, 119, 0, 0.05)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 119, 0, 0.2)' }}>
                    <h5 style={{ color: 'var(--orange-cap)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🟠 Top Run Scorers
                    </h5>
                    {tournamentDetails.topBatsmen?.map((b, i) => (
                      <div 
                        key={b.player_id} 
                        onClick={() => onOpenPlayer(b.player_id)}
                        style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                      >
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '13px' }}>{i + 1}. {b.player_name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.team_name} • SR: {b.strike_rate}</div>
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--orange-cap)' }}>
                          {b.total_runs}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Top Bowlers */}
                  <div style={{ background: 'rgba(168, 85, 247, 0.05)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                    <h5 style={{ color: 'var(--purple-cap)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🟣 Top Wicket Takers
                    </h5>
                    {tournamentDetails.topBowlers?.map((w, i) => (
                      <div 
                        key={w.player_id} 
                        onClick={() => onOpenPlayer(w.player_id)}
                        style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                      >
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '13px' }}>{i + 1}. {w.player_name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{w.team_name} • Econ: {w.economy}</div>
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--purple-cap)' }}>
                          {w.total_wickets}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: SCHEDULE MATCH */}
              {detailTab === 'schedule' && (
                <div>
                  <h4 style={{ fontSize: '15px', marginBottom: '14px' }}>Schedule Match in {tournamentDetails.tournament.tournament_name}</h4>
                  <form onSubmit={handleScheduleMatch}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="form-group">
                        <label className="form-label">Team 1</label>
                        <select className="form-select" value={schTeam1} onChange={e => setSchTeam1(e.target.value)}>
                          {tournamentDetails.pointsTable?.map(t => (
                            <option key={t.team_id} value={t.team_id}>{t.team_name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Team 2</label>
                        <select className="form-select" value={schTeam2} onChange={e => setSchTeam2(e.target.value)}>
                          {tournamentDetails.pointsTable?.map(t => (
                            <option key={t.team_id} value={t.team_id}>{t.team_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                      <div className="form-group">
                        <label className="form-label">Venue</label>
                        <select className="form-select" value={schVenue} onChange={e => setSchVenue(e.target.value)}>
                          {venues.map(v => (
                            <option key={v.venue_id} value={v.venue_id}>{v.venue_name} ({v.city})</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Match Date</label>
                        <input type="date" className="form-input" required value={schDate} onChange={e => setSchDate(e.target.value)} />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Stage</label>
                        <select className="form-select" value={schStage} onChange={e => setSchStage(e.target.value)}>
                          <option value="Group">Group</option>
                          <option value="Quarter-final">Quarter-final</option>
                          <option value="Semi-final">Semi-final</option>
                          <option value="Final">Final</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                      Schedule Match Fixture
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
