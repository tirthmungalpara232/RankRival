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
      if (initialPlayerId) {
        setPlayer1Id(initialPlayerId);
      }
    }
  }, [isOpen, initialPlayerId]);

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
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1 text-[13px]">
          <span className={p1Wins ? 'font-extrabold text-[#00e676]' : 'font-medium text-slate-400'}>
            {formatted1} {p1Wins && '👑'}
          </span>
          <span className="font-bold uppercase text-[11px] text-slate-400 tracking-wider">
            {label}
          </span>
          <span className={p2Wins ? 'font-extrabold text-[#ffd166]' : 'font-medium text-slate-400'}>
            {p2Wins && '👑'} {formatted2}
          </span>
        </div>

        <div className="flex h-2 rounded overflow-hidden bg-white/5">
          <div
            className="bg-[#00e676] transition-all duration-400 ease-out"
            style={{ width: `${(num1 / (num1 + num2 || 1)) * 100}%` }}
          />
          <div
            className="bg-[#ffd166] transition-all duration-400 ease-out"
            style={{ width: `${(num2 / (num1 + num2 || 1)) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card max-w-[720px]" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2.5">
            <Swords size={22} className="text-[#00e5ff]" />
            <h2 className="text-xl font-bold text-white">Head-to-Head Player Comparison</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Player Selectors */}
        <div className="grid grid-cols-[1fr_40px_1fr] items-center gap-3 mb-6">
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

          <div className="text-center font-black text-slate-500 text-lg select-none">
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
          <div className="text-center py-10 text-slate-400">
            Comparing player data...
          </div>
        ) : p1 && p2 ? (
          <div>
            {/* Player Cards Header */}
            <div className="grid grid-cols-2 gap-3.5 mb-6">
              <div className="bg-[#00e676]/10 border border-[#00e676]/25 rounded-xl p-4 text-center">
                <div className="text-lg font-extrabold text-[#00e676]">
                  {p1.first_name} {p1.last_name}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {p1.player_role} • {p1.team_name || p1.country_name}
                </div>
              </div>

              <div className="bg-[#ffd166]/10 border border-[#ffd166]/35 rounded-xl p-4 text-center">
                <div className="text-lg font-extrabold text-[#ffd166]">
                  {p2.first_name} {p2.last_name}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {p2.player_role} • {p2.team_name || p2.country_name}
                </div>
              </div>
            </div>

            {/* Comparison Metrics */}
            <div className="bg-black/20 p-5 rounded-xl border border-white/10">
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
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
