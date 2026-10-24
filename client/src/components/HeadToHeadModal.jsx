import React, { useState, useEffect } from 'react';
import { X, Swords, Trophy, DollarSign, Award } from 'lucide-react';
import { api } from '../api';

export default function HeadToHeadModal({ isOpen, onClose, initialPlayerId }) {
  const [playerList, setPlayerList] = useState([]);
  const [player1Id, setPlayer1Id] = useState(initialPlayerId || 1);
  const [player2Id, setPlayer2Id] = useState(15);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPlayersList();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && player1Id && player2Id) {
      loadComparison();
    }
  }, [isOpen, player1Id, player2Id]);

  async function loadPlayersList() {
    try {
      const res = await api.getPlayers('?limit=150');
      setPlayerList(res.players || []);
    } catch (err) {
      console.error('Failed to load player list:', err);
    }
  }

  async function loadComparison() {
    setLoading(true);
    try {
      const res = await api.comparePlayers(player1Id, player2Id);
      setComparison(res);
    } catch (err) {
      console.error('Failed to compare players:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const p1 = comparison?.player1;
  const p2 = comparison?.player2;

  function renderStatComparison(label, val1, val2, higherIsBetter = true, isCurrency = false, isDec = false) {
    const num1 = Number(val1) || 0;
    const num2 = Number(val2) || 0;
    const maxVal = Math.max(num1, num2, 1);
    const p1Pct = Math.min(100, Math.round((num1 / maxVal) * 100));
    const p2Pct = Math.min(100, Math.round((num2 / maxVal) * 100));

    const p1Wins = higherIsBetter ? num1 > num2 : (num1 > 0 && (num1 < num2 || num2 === 0));
    const p2Wins = higherIsBetter ? num2 > num1 : (num2 > 0 && (num2 < num1 || num1 === 0));

    const formatted1 = isCurrency ? `$${num1.toLocaleString()}` : (isDec ? num1.toFixed(2) : num1);
    const formatted2 = isCurrency ? `$${num2.toLocaleString()}` : (isDec ? num2.toFixed(2) : num2);

    return (
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '13px' }}>
          <span style={{ fontWeight: p1Wins ? '800' : '500', color: p1Wins ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
            {formatted1} {p1Wins && '👑'}
          </span>
          <span style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '11px', color: 'var(--text-muted)' }}>
            {label}
          </span>
          <span style={{ fontWeight: p2Wins ? '800' : '500', color: p2Wins ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>
            {p2Wins && '👑'} {formatted2}
          </span>
        </div>

        <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(255,255,255,0.06)' }}>
          <div style={{
            width: `${(num1 / (num1 + num2 || 1)) * 100}%`,
            background: 'var(--accent-green)',
            transition: 'width 0.4s ease'
          }} />
          <div style={{
            width: `${(num2 / (num1 + num2 || 1)) * 100}%`,
            background: 'var(--accent-gold)',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Swords size={22} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '22px' }}>Head-to-Head Player Comparison</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Player Selectors */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div>
            <label className="form-label">Player 1</label>
            <select className="form-select" value={player1Id} onChange={e => setPlayer1Id(Number(e.target.value))}>
              {playerList.map(p => (
                <option key={p.player_id} value={p.player_id}>
                  {p.full_name} ({p.team_name || p.country_name})
                </option>
              ))}
            </select>
          </div>

          <div style={{ textAlign: 'center', fontWeight: '900', color: 'var(--text-muted)', fontSize: '18px' }}>
            VS
          </div>

          <div>
            <label className="form-label">Player 2</label>
            <select className="form-select" value={player2Id} onChange={e => setPlayer2Id(Number(e.target.value))}>
              {playerList.map(p => (
                <option key={p.player_id} value={p.player_id}>
                  {p.full_name} ({p.team_name || p.country_name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Comparing player data...
          </div>
        ) : p1 && p2 ? (
          <div>
            {/* Player Cards Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
              <div style={{
                background: 'rgba(0, 230, 118, 0.08)',
                border: '1px solid var(--border-glow)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-green)' }}>
                  {p1.first_name} {p1.last_name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {p1.player_role} • {p1.team_name || p1.country_name}
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 209, 102, 0.08)',
                border: '1px solid var(--border-gold)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-gold)' }}>
                  {p2.first_name} {p2.last_name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {p2.player_role} • {p2.team_name || p2.country_name}
                </div>
              </div>
            </div>

            {/* Comparison Metrics */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              {renderStatComparison('Matches Played', p1.matches_played, p2.matches_played)}
              {renderStatComparison('Total Runs Scored', p1.total_runs, p2.total_runs)}
              {renderStatComparison('Batting Average', p1.batting_average, p2.batting_average, true, false, true)}
              {renderStatComparison('Batting Strike Rate', p1.strike_rate, p2.strike_rate, true, false, true)}
              {renderStatComparison('Highest Score', p1.highest_score, p2.highest_score)}
              {renderStatComparison('Total Sixes (6s)', p1.sixes, p2.sixes)}
              {renderStatComparison('Total Wickets Taken', p1.total_wickets, p2.total_wickets)}
              {renderStatComparison('Bowling Economy', p1.economy, p2.economy, false, false, true)}
              {renderStatComparison('Catches Taken', p1.total_catches, p2.total_catches)}
              {renderStatComparison('Player of Matches (POM)', p1.pom_awards, p2.pom_awards)}
              {renderStatComparison('Total Career Earnings ($)', p1.total_earnings, p2.total_earnings, true, true)}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
