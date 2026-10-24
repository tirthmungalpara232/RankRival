import React, { useState, useEffect } from 'react';
import { 
  CircleDollarSign, 
  Trophy, 
  Award, 
  TrendingUp, 
  PlusCircle, 
  Search,
  Shield,
  User,
  Calendar
} from 'lucide-react';
import { api } from '../api';

export default function EarningsView({ onOpenAward, onOpenPlayer, currentUser }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    setLoading(true);
    try {
      const data = await api.getEarningsSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load earnings summary:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading prize purse distributions and player earnings ledgers...
      </div>
    );
  }

  const transactions = summary?.recentEarnings || [];
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = !searchTerm || 
      t.player_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tournament_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || t.earning_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      {/* Header & Award Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CircleDollarSign size={28} color="var(--accent-gold)" /> Prize Purse & Player Earnings Hub
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Track tournament prize money distribution, player appearance fees, and match bonuses
          </p>
        </div>

        {currentUser && (currentUser.role === 'Organizer' || currentUser.role === 'Admin') && (
          <button className="btn btn-gold" onClick={onOpenAward}>
            <PlusCircle size={16} /> Disburse Prize Money / Bonus
          </button>
        )}
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="kpi-grid">
        <div className="card kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'var(--accent-gold-dim)', color: 'var(--accent-gold)' }}>
            <Trophy size={26} />
          </div>
          <div>
            <div className="kpi-val">${(Number(summary?.totalPrizePool || 0) / 1000000).toFixed(1)}M</div>
            <div className="kpi-lbl">Total Tournament Purse</div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}>
            <CircleDollarSign size={26} />
          </div>
          <div>
            <div className="kpi-val">${(Number(summary?.totalEarnings || 0) / 1000000).toFixed(1)}M</div>
            <div className="kpi-lbl">Total Disbursed to Players</div>
          </div>
        </div>

        <div 
          className="card kpi-card card-clickable"
          onClick={() => summary?.topPlayer && onOpenPlayer(summary.topPlayer.player_id)}
        >
          <div className="kpi-icon-wrap" style={{ background: 'rgba(0, 229, 255, 0.15)', color: 'var(--accent-cyan)' }}>
            <Award size={26} />
          </div>
          <div>
            <div className="kpi-val" style={{ fontSize: '20px' }}>{summary?.topPlayer?.player_name || 'N/A'}</div>
            <div className="kpi-lbl">Richest Player (${Number(summary?.topPlayer?.total_amount || 0).toLocaleString()})</div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)', color: 'var(--purple-cap)' }}>
            <Shield size={26} />
          </div>
          <div>
            <div className="kpi-val" style={{ fontSize: '20px' }}>{summary?.topTeam?.team_name || 'N/A'}</div>
            <div className="kpi-lbl">Top Earning Squad (${Number(summary?.topTeam?.team_total || 0).toLocaleString()})</div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {summary?.typeBreakdown?.map(tb => (
          <div key={tb.earning_type} className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {tb.earning_type}
            </div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent-gold)', marginTop: '4px' }}>
              ${Number(tb.total_amount).toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {tb.count} payouts recorded
            </div>
          </div>
        ))}
      </div>

      {/* Transactions Ledger Table */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '18px' }}>Prize Money & Match Bonuses Ledger</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Individual player payouts itemized by tournament and match performance
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search player or tournament..."
              style={{ width: '220px', padding: '6px 12px', fontSize: '13px' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />

            <select 
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Tournament Prize Share">Tournament Prize Share</option>
              <option value="Player of the Match">Player of the Match</option>
              <option value="Match Fee">Match Fee</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Recipient Player</th>
                <th>Team</th>
                <th>Tournament</th>
                <th>Payout Category</th>
                <th>Amount ($ USD)</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t.earning_id}>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.date_awarded}</td>
                  <td 
                    style={{ fontWeight: '700', color: 'var(--accent-green)', cursor: 'pointer' }}
                    onClick={() => onOpenPlayer(t.player_id)}
                  >
                    {t.player_name}
                  </td>
                  <td>{t.team_name}</td>
                  <td style={{ fontWeight: '600' }}>{t.tournament_name}</td>
                  <td>
                    <span className={`badge ${
                      t.earning_type.includes('Prize') ? 'badge-gold' : 
                      t.earning_type.includes('Match') ? 'badge-green' : 'badge-orange'
                    }`}>
                      {t.earning_type}
                    </span>
                  </td>
                  <td style={{ fontWeight: '800', color: 'var(--accent-gold)' }}>
                    +${Number(t.amount).toLocaleString()}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
