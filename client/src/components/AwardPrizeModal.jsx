import React, { useState, useEffect } from 'react';
import { X, CircleDollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../api';

export default function AwardPrizeModal({ isOpen, onClose, onSuccess }) {
  const [players, setPlayers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [playerId, setPlayerId] = useState('');
  const [tournamentId, setTournamentId] = useState('');
  const [earningType, setEarningType] = useState('Tournament Prize Share');
  const [amount, setAmount] = useState(50000);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  async function loadData() {
    try {
      const pRes = await api.getPlayers('?limit=150');
      const tRes = await api.getTournaments();
      setPlayers(pRes.players || []);
      setTournaments(tRes || []);

      if (pRes.players?.length > 0) setPlayerId(pRes.players[0].player_id);
      if (tRes?.length > 0) setTournamentId(tRes[0].tournament_id);
    } catch (err) {
      console.error('Failed to load award data:', err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!playerId || !tournamentId || !amount) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.awardPrizeMoney({
        player_id: Number(playerId),
        tournament_id: Number(tournamentId),
        earning_type: earningType,
        amount: Number(amount),
        currency: 'USD',
        description: description || `${earningType} payout`
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to award prize money');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CircleDollarSign size={22} color="var(--accent-gold)" />
            <h2 style={{ fontSize: '20px' }}>Award Prize Money & Bonuses</h2>
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
            <label className="form-label">Recipient Player *</label>
            <select className="form-select" value={playerId} onChange={e => setPlayerId(e.target.value)}>
              {players.map(p => (
                <option key={p.player_id} value={p.player_id}>
                  {p.full_name} ({p.team_name || p.country_name})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Associated Tournament *</label>
            <select className="form-select" value={tournamentId} onChange={e => setTournamentId(e.target.value)}>
              {tournaments.map(t => (
                <option key={t.tournament_id} value={t.tournament_id}>
                  {t.tournament_name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Payout Type</label>
              <select className="form-select" value={earningType} onChange={e => setEarningType(e.target.value)}>
                <option value="Tournament Prize Share">Tournament Prize Share</option>
                <option value="Player of the Match">Player of the Match Award</option>
                <option value="Match Fee">Match Appearance Fee</option>
                <option value="Performance Bonus">Performance Bonus</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Amount ($ USD) *</label>
              <input 
                type="number" 
                className="form-input" 
                required
                min="100"
                step="1000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Remarks</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Finals Victory Bonus, Most Wickets Bonus"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-gold" style={{ flex: 2 }} disabled={loading}>
              {loading ? 'Disbursing...' : 'Disburse Prize Payout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
