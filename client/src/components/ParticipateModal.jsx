import React, { useState, useEffect } from 'react';
import { X, Trophy, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../api';

export default function ParticipateModal({ isOpen, onClose, tournament, currentUser, onSuccess }) {
  const [tournamentsList, setTournamentsList] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, tournament]);

  async function loadData() {
    try {
      const [allTeams, allTournaments] = await Promise.all([
        api.getTeams(),
        api.getTournaments()
      ]);
      setTeams(allTeams);
      setTournamentsList(allTournaments);

      if (tournament?.tournament_id) {
        setSelectedTournamentId(tournament.tournament_id);
      } else if (allTournaments.length > 0) {
        setSelectedTournamentId(allTournaments[0].tournament_id);
      }

      if (allTeams.length > 0) {
        if (currentUser?.team_id) {
          setSelectedTeamId(currentUser.team_id);
        } else {
          setSelectedTeamId(allTeams[0].team_id);
        }
      }
    } catch (err) {
      console.error('Failed to load modal data:', err);
    }
  }

  const currentTournament = tournamentsList.find(t => String(t.tournament_id) === String(selectedTournamentId)) || tournament;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedTournamentId) {
      setError('Please select a tournament to join.');
      return;
    }
    if (!selectedTeamId) {
      setError('Please select a team.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.participateInTournament(selectedTournamentId, {
        team_id: Number(selectedTeamId),
        notes: notes || `Registered by ${currentUser?.full_name || 'Participant'}`
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to register for tournament');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={20} color="var(--accent-green)" />
              <h2 style={{ fontSize: '20px' }}>Join / Participate in Tournament</h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Register your team squad to compete for championship honors & prize pool
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

      {currentTournament && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          marginBottom: '18px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {currentTournament.tournament_name}
            </span>
            <span className="badge badge-gold">${Number(currentTournament.prize_money || 0).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span>📍 Host: {currentTournament.host_country}</span>
            <span>📅 {currentTournament.start_date || currentTournament.season_year}</span>
            <span>Format: {currentTournament.format || 'T20'}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Select Tournament</label>
          <select 
            className="form-select"
            value={selectedTournamentId}
            onChange={e => setSelectedTournamentId(e.target.value)}
          >
            {tournamentsList.map(t => (
              <option key={t.tournament_id} value={t.tournament_id}>
                {t.tournament_name} ({t.format} • ${Number(t.prize_money || 0).toLocaleString()})
              </option>
            ))}
          </select>
        </div>
          <div className="form-group">
            <label className="form-label">Select Team to Enter</label>
            <select 
              className="form-select"
              value={selectedTeamId}
              onChange={e => setSelectedTeamId(e.target.value)}
            >
              {teams.map(t => (
                <option key={t.team_id} value={t.team_id}>
                  {t.team_name} ({t.country_name})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Registration Notes (Optional)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Captain verified, player roster submitted"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
              {loading ? 'Registering...' : 'Confirm Tournament Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
