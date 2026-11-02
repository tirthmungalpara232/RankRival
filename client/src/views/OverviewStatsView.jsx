import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Trophy, 
  Radio, 
  MapPin, 
  Shield, 
  Award, 
  TrendingUp, 
  ArrowRight,
  Flame,
  Activity
} from 'lucide-react';
import { api } from '../api';

export default function OverviewStatsView({ onNavigate, onOpenPlayer, currentUser }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const data = await api.getOverview();
      setStats(data);
    } catch (err) {
      console.error('Failed to load statistical overview:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading database statistics and system overview...
      </div>
    );
  }

  const liveMatch = stats?.liveMatches?.[0];
  const orangeLeader = stats?.orangeCapLeaders?.[0];
  const purpleLeader = stats?.purpleCapLeaders?.[0];

  return (
    <div>
      {/* Title & Introduction */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(0, 230, 118, 0.1)', border: '1px solid var(--accent-green-dim)', borderRadius: 'var(--radius-full)', marginBottom: '10px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }}></span>
          <span style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: '700' }}>DATABASE STATISTICS & METRICS</span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>
          Cricket DBMS Platform Statistics
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '780px' }}>
          Real-time summary of players registered, tournaments conducted, matches played, stadiums, and career aggregate scoring records across the relational database.
        </p>
      </div>

      {/* Live Match Notification Banner */}
      {liveMatch && (
        <div 
          className="card card-clickable" 
          onClick={() => onNavigate('matches')}
          style={{
            marginBottom: '28px',
            background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.12), rgba(18, 28, 48, 0.85))',
            borderColor: 'rgba(239, 68, 68, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            padding: '16px 20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-live">
              <span className="pulse-dot"></span> LIVE NOW
            </span>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '800' }}>
                {liveMatch.team1_name} vs {liveMatch.team2_name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {liveMatch.tournament_name} • {liveMatch.venue_name}, {liveMatch.city}
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-sm">
            View Live Match <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Primary Statistical Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* Total Players */}
        <div className="card kpi-card" onClick={() => onNavigate('players')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(0, 230, 118, 0.15)', color: 'var(--accent-green)' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="kpi-val">{stats?.totalPlayers || 0}</div>
            <div className="kpi-lbl">Total Registered Players</div>
          </div>
        </div>

        {/* Tournaments Conducted */}
        <div className="card kpi-card" onClick={() => onNavigate('tournaments')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon-wrap" style={{ background: 'var(--accent-gold-dim)', color: 'var(--accent-gold)' }}>
            <Trophy size={24} />
          </div>
          <div>
            <div className="kpi-val">{stats?.totalTournaments || 0}</div>
            <div className="kpi-lbl">Tournaments Conducted</div>
          </div>
        </div>

        {/* Total Matches */}
        <div className="card kpi-card" onClick={() => onNavigate('matches')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(0, 229, 255, 0.15)', color: 'var(--accent-cyan)' }}>
            <Radio size={24} />
          </div>
          <div>
            <div className="kpi-val">{stats?.totalMatches || 0}</div>
            <div className="kpi-lbl">Matches Recorded</div>
          </div>
        </div>

        {/* Stadiums / Venues */}
        <div className="card kpi-card" onClick={() => onNavigate('stadiums')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(255, 119, 0, 0.15)', color: 'var(--orange-cap)' }}>
            <MapPin size={24} />
          </div>
          <div>
            <div className="kpi-val">{stats?.totalVenues || 0}</div>
            <div className="kpi-lbl">Stadiums / Venues</div>
          </div>
        </div>

        {/* Teams Participating */}
        <div className="card kpi-card" onClick={() => onNavigate('teams')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)', color: 'var(--purple-cap)' }}>
            <Shield size={24} />
          </div>
          <div>
            <div className="kpi-val">{stats?.totalTeams || 0}</div>
            <div className="kpi-lbl">Participating Teams</div>
          </div>
        </div>
      </div>

      {/* Aggregate Platform Scoring Data */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Runs & Wickets Aggregate */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--accent-green)" /> Aggregate Scoring Records
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ background: 'rgba(255, 119, 0, 0.08)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 119, 0, 0.25)', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--orange-cap)', fontWeight: '700' }}>TOTAL RUNS SCORED</div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--orange-cap)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                {Number(stats?.totalRuns || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Across All Tournaments</div>
            </div>

            <div style={{ background: 'rgba(168, 85, 247, 0.08)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(168, 85, 247, 0.25)', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--purple-cap)', fontWeight: '700' }}>TOTAL WICKETS TAKEN</div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--purple-cap)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                {Number(stats?.totalWickets || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bowled Across Matches</div>
            </div>
          </div>
        </div>

        {/* Tournament Breakdown by Format */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={20} color="var(--accent-gold)" /> Tournaments by Match Format
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats?.formatCounts?.map(f => (
              <div 
                key={f.format} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge badge-gold" style={{ minWidth: '46px', textAlign: 'center' }}>{f.format}</span>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{f.format} Format Tournaments</span>
                </div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent-green)' }}>
                  {f.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers Spotlight */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Orange Cap Leader */}
        {orangeLeader && (
          <div 
            className="card card-clickable" 
            onClick={() => onOpenPlayer(orangeLeader.player_id)}
            style={{
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(255, 119, 0, 0.1), rgba(18, 28, 48, 0.85))',
              borderColor: 'rgba(255, 119, 0, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-orange">🟠 LEADING RUN SCORER</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tournament Leader</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '800' }}>{orangeLeader.player_name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{orangeLeader.team_name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '30px', fontWeight: '900', color: 'var(--orange-cap)', fontFamily: 'var(--font-mono)' }}>
                  {orangeLeader.total_runs}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>RUNS</div>
              </div>
            </div>
          </div>
        )}

        {/* Purple Cap Leader */}
        {purpleLeader && (
          <div 
            className="card card-clickable" 
            onClick={() => onOpenPlayer(purpleLeader.player_id)}
            style={{
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(18, 28, 48, 0.85))',
              borderColor: 'rgba(168, 85, 247, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-purple">🟣 LEADING WICKET TAKER</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tournament Leader</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '800' }}>{purpleLeader.player_name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{purpleLeader.team_name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '30px', fontWeight: '900', color: 'var(--purple-cap)', fontFamily: 'var(--font-mono)' }}>
                  {purpleLeader.total_wickets}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>WICKETS</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Explore Section Cards */}
      <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>
        Explore Database Sections
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px'
      }}>
        <div className="card card-clickable" onClick={() => onNavigate('stadiums')} style={{ padding: '18px' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏟️</div>
          <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>Stadiums & Venues</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            View all 20 international cricket grounds, pitch characteristics, and seating capacities.
          </p>
          <span style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: '700' }}>
            View Stadiums →
          </span>
        </div>

        <div className="card card-clickable" onClick={() => onNavigate('tournaments')} style={{ padding: '18px' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏆</div>
          <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>Tournaments</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Browse tournaments conducted, schedule fixtures, and track standings.
          </p>
          <span style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: '700' }}>
              View Tournaments →
          </span>
        </div>

        <div className="card card-clickable" onClick={() => onNavigate('matches')} style={{ padding: '18px' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔴</div>
          <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>Live Matches & Scorer</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Real-time ball-by-ball scorecards, fall of wickets, and over-by-over tracking.
          </p>
          <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700' }}>
            View Live Match →
          </span>
        </div>

        <div className="card card-clickable" onClick={() => onNavigate('leaderboards')} style={{ padding: '18px' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎖️</div>
          <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>Honors Board</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Orange Cap, Purple Cap, highest strike rates, and boundary leaders.
          </p>
          <span style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: '700' }}>
            View Honors Board →
          </span>
        </div>

        <div className="card card-clickable" onClick={() => onNavigate('players')} style={{ padding: '18px' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>👥</div>
          <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>Players Directory</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Search 124+ athletes, career profiles, batting & bowling career cards.
          </p>
          <span style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: '700' }}>
            View Players →
          </span>
        </div>

        <div className="card card-clickable" onClick={() => onNavigate('teams')} style={{ padding: '18px' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🛡️</div>
          <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>Teams</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Review national cricket teams, squad rosters, and tournament history.
          </p>
          <span style={{ fontSize: '12px', color: 'var(--purple-cap)', fontWeight: '700' }}>
            View Teams →
          </span>
        </div>
      </div>
    </div>
  );
}
