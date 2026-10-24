import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Swords, 
  Shield, 
  Trophy, 
  Award, 
  CircleDollarSign,
  Filter
} from 'lucide-react';
import { api } from '../api';

export default function PlayersView({ onOpenPlayer, onOpenCompare }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [teamFilter, setTeamFilter] = useState('All');
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [search, roleFilter, teamFilter]);

  async function loadTeams() {
    try {
      const data = await api.getTeams();
      setTeams(data);
    } catch (err) {
      console.error('Failed to load teams:', err);
    }
  }

  async function loadPlayers() {
    setLoading(true);
    try {
      let query = '?limit=100&';
      if (search) query += `search=${encodeURIComponent(search)}&`;
      if (roleFilter !== 'All') query += `role=${encodeURIComponent(roleFilter)}&`;
      if (teamFilter !== 'All') query += `team_id=${teamFilter}&`;

      const res = await api.getPlayers(query);
      setPlayers(res.players || []);
    } catch (err) {
      console.error('Failed to load players:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Header & Head-to-Head Launcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={28} color="var(--accent-green)" /> Professional Cricketers Directory
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Search 124+ international athletes, review tournament participation, and compare career statistics
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => onOpenCompare(1, 15)}>
          <Swords size={16} /> Compare Players Head-to-Head
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '14px' }}>
          <div>
            <label className="form-label">Search Player or Team</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search by name (e.g. Tanmay, Liam, Haris)..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Playing Role</label>
            <select 
              className="form-select"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Batsman">Batsman</option>
              <option value="Bowler">Bowler</option>
              <option value="All-rounder">All-rounder</option>
              <option value="Wicketkeeper">Wicketkeeper</option>
            </select>
          </div>

          <div>
            <label className="form-label">Filter Team</label>
            <select 
              className="form-select"
              value={teamFilter}
              onChange={e => setTeamFilter(e.target.value)}
            >
              <option value="All">All Teams</option>
              {teams.map(t => (
                <option key={t.team_id} value={t.team_id}>{t.team_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Players Cards Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading players directory...
        </div>
      ) : players.length === 0 ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No players match the chosen filters.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '18px'
        }}>
          {players.map(p => (
            <div 
              key={p.player_id}
              className="card card-clickable"
              onClick={() => onOpenPlayer(p.player_id)}
              style={{ padding: '20px' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '14px',
                    color: 'var(--accent-green)'
                  }}>
                    {p.jersey_number ? `#${p.jersey_number}` : '🏏'}
                  </div>

                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '800' }}>{p.full_name}</h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {p.team_name || p.country_name}
                    </div>
                  </div>
                </div>

                <span className="badge badge-green" style={{ fontSize: '10px' }}>
                  {p.player_role}
                </span>
              </div>

              {/* Stats Strip */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                background: 'rgba(0,0,0,0.2)',
                padding: '10px 8px',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                margin: '14px 0',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MATCHES</div>
                  <div style={{ fontSize: '14px', fontWeight: '800' }}>{p.matches_played}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--orange-cap)' }}>RUNS</div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--orange-cap)' }}>{p.total_runs}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--purple-cap)' }}>WKTS</div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--purple-cap)' }}>{p.total_wickets}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--accent-cyan)' }}>CATCH</div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent-cyan)' }}>{p.total_catches}</div>
                </div>
              </div>

              {/* Earnings & View Profile action */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>CAREER EARNINGS</div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent-gold)' }}>
                    ${Number(p.total_earnings).toLocaleString()}
                  </div>
                </div>

                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenPlayer(p.player_id);
                  }}
                >
                  Career Record →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
