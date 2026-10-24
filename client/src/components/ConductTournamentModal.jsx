import React, { useState, useEffect } from 'react';
import { X, Trophy, Calendar, DollarSign, Globe, Shield, AlertCircle } from 'lucide-react';
import { api } from '../api';

export default function ConductTournamentModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Options from API
  const [types, setTypes] = useState([]);
  const [countries, setCountries] = useState([]);
  const [teams, setTeams] = useState([]);

  // Form State
  const [tournamentName, setTournamentName] = useState('');
  const [typeId, setTypeId] = useState(1);
  const [hostCountryId, setHostCountryId] = useState(1);
  const [seasonYear, setSeasonYear] = useState('2026');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [prizeMoney, setPrizeMoney] = useState(5000000);
  const [entryFee, setEntryFee] = useState(50000);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Upcoming');
  const [selectedTeams, setSelectedTeams] = useState([1, 2, 3, 4]); // Default select some teams

  useEffect(() => {
    if (isOpen) {
      loadOptions();
      // Set default dates (today to +30 days)
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setDate(now.getDate() + 30);
      setStartDate(now.toISOString().slice(0, 10));
      setEndDate(nextMonth.toISOString().slice(0, 10));
    }
  }, [isOpen]);

  async function loadOptions() {
    try {
      const data = await api.getTournamentFormOptions();
      setTypes(data.types || []);
      setCountries(data.countries || []);
      setTeams(data.teams || []);
      if (data.types?.length > 0) setTypeId(data.types[0].type_id);
      if (data.countries?.length > 0) setHostCountryId(data.countries[0].country_id);
    } catch (err) {
      console.error('Failed to load form options:', err);
    }
  }

  function toggleTeam(teamId) {
    if (selectedTeams.includes(teamId)) {
      setSelectedTeams(selectedTeams.filter(id => id !== teamId));
    } else {
      setSelectedTeams([...selectedTeams, teamId]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (selectedTeams.length < 2) {
      setError('Please select at least 2 participating teams for the tournament.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        tournament_name: tournamentName,
        type_id: Number(typeId),
        host_country_id: Number(hostCountryId),
        season_year: seasonYear,
        start_date: startDate,
        end_date: endDate,
        prize_money: Number(prizeMoney),
        entry_fee: Number(entryFee),
        description,
        status,
        participating_team_ids: selectedTeams
      };

      await api.createTournament(payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to conduct tournament');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={22} color="var(--accent-gold)" />
              <h2 style={{ fontSize: '22px' }}>Conduct & Host New Tournament</h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Configure tournament structure, format, purse prize money, and participating teams
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#ef4444',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tournament Name *</label>
            <input 
              type="text" 
              className="form-input" 
              required
              placeholder="e.g. World Cricket Super League 2026"
              value={tournamentName}
              onChange={e => setTournamentName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Format / Match Type</label>
              <select className="form-select" value={typeId} onChange={e => setTypeId(e.target.value)}>
                {types.map(t => (
                  <option key={t.type_id} value={t.type_id}>
                    {t.type_name} ({t.overs_per_innings ? `${t.overs_per_innings} Overs` : 'Multi-day'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Host Country</label>
              <select className="form-select" value={hostCountryId} onChange={e => setHostCountryId(e.target.value)}>
                {countries.map(c => (
                  <option key={c.country_id} value={c.country_id}>
                    {c.country_name} ({c.country_code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Season Year</label>
              <input 
                type="text" 
                className="form-input" 
                value={seasonYear}
                onChange={e => setSeasonYear(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input 
                type="date" 
                className="form-input" 
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input 
                type="date" 
                className="form-input" 
                required
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Total Prize Pool ($ USD) *</label>
              <input 
                type="number" 
                className="form-input" 
                required
                min="0"
                step="50000"
                value={prizeMoney}
                onChange={e => setPrizeMoney(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Participating Teams Selection */}
          <div className="form-group">
            <label className="form-label">
              Select Participating Teams ({selectedTeams.length} selected)
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '8px',
              maxHeight: '160px',
              overflowY: 'auto',
              padding: '10px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              {teams.map(team => {
                const isSelected = selectedTeams.includes(team.team_id);
                return (
                  <button
                    key={team.team_id}
                    type="button"
                    onClick={() => toggleTeam(team.team_id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '1px solid var(--accent-green)' : '1px solid rgba(255,255,255,0.06)',
                      background: isSelected ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255,255,255,0.02)',
                      color: isSelected ? 'var(--accent-green)' : 'var(--text-secondary)',
                      fontSize: '12px',
                      fontWeight: isSelected ? '700' : '500',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{team.team_name}</span>
                    {isSelected && <span>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description & Rules (Optional)</label>
            <textarea 
              className="form-textarea" 
              rows="2"
              placeholder="Tournament rules, group stages, qualification guidelines..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ flex: 1 }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ flex: 2 }}
              disabled={loading}
            >
              {loading ? 'Creating Tournament...' : 'Conduct & Publish Tournament'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
