import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  Radio, 
  Award, 
  CircleDollarSign, 
  Users, 
  Shield, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { api } from '../api';

export default function DashboardView({ 
  onNavigate, 
  onOpenConduct, 
  onOpenPlayer, 
  onOpenParticipate,
  currentUser 
}) {
  const [overview, setOverview] = useState(null);
  const [featuredTournaments, setFeaturedTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [overviewData, tournamentsData] = await Promise.all([
        api.getOverview(),
        api.getTournaments('?limit=4')
      ]);
      setOverview(overviewData);
      setFeaturedTournaments(tournamentsData.slice(0, 3));
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading stadium dashboard and live fixtures...
      </div>
    );
  }

  const liveMatch = overview?.liveMatches?.[0];
  const orangeLeader = overview?.orangeCapLeaders?.[0];
  const purpleLeader = overview?.purpleCapLeaders?.[0];
  const topEarner = overview?.topEarners?.[0];

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <div className="hero-tag">
            <span>⚡ Next-Gen Cricket DBMS</span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span>MySQL & SQLite Synchronized</span>
          </div>

          <h1 className="hero-title">
            Conduct Tournaments. Track Performance. <span>Dominate the Honors Board.</span>
          </h1>

          <p className="hero-desc">
            The premier cricket sports management platform. Conduct custom tournaments, register teams, 
            score matches ball-by-ball in real time, analyze multi-parameter player leaderboards, 
            and track tournament prize money distributions.
          </p>

          <div className="hero-actions">
            {currentUser?.role === 'Player' ? (
              <button 
                className="btn btn-primary btn-lg" 
                onClick={() => onOpenParticipate ? onOpenParticipate(null) : onNavigate('tournaments')}
              >
                <Trophy size={18} /> Join Tournament
              </button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={onOpenConduct}>
                <Trophy size={18} /> Host Tournament
              </button>
            )}
            <button className="btn btn-secondary btn-lg" onClick={() => onNavigate('matches')}>
              <Radio size={18} color="#ef4444" /> {currentUser?.role === 'Player' ? 'Live Matches' : 'Live Scorer'}
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => onNavigate('leaderboards')}>
              <Award size={18} /> Honors Board
            </button>
          </div>
        </div>
      </div>

      {/* Live Match Ticker / Banner (if match is Live) */}
      {liveMatch && (
        <div 
          className="card card-clickable" 
          onClick={() => onNavigate('matches')}
          style={{
            marginBottom: '32px',
            background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.12), rgba(18, 28, 48, 0.85))',
            borderColor: 'rgba(239, 68, 68, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span className="badge badge-live">
              <span className="pulse-dot"></span> LIVE MATCH
            </span>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '800' }}>
                {liveMatch.team1_name} vs {liveMatch.team2_name}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {liveMatch.tournament_name} • {liveMatch.venue_name}, {liveMatch.city}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--accent-green)', fontWeight: '700' }}>
              Interactive Ball-by-Ball Available
            </span>
            <button className="btn btn-primary btn-sm">
              Open Scorer Console <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* KPI Counters */}
      <div className="kpi-grid">
        <div className="card kpi-card" onClick={() => onNavigate('tournaments')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon-wrap" style={{ background: 'var(--accent-gold-dim)', color: 'var(--accent-gold)' }}>
            <Trophy size={26} />
          </div>
          <div>
            <div className="kpi-val">{overview?.totalTournaments || 0}</div>
            <div className="kpi-lbl">Tournaments Conducted</div>
          </div>
        </div>

        <div className="card kpi-card" onClick={() => onNavigate('matches')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon-wrap" style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}>
            <Radio size={26} />
          </div>
          <div>
            <div className="kpi-val">{overview?.totalMatches || 0}</div>
            <div className="kpi-lbl">Matches Recorded</div>
          </div>
        </div>

        <div className="card kpi-card" onClick={() => onNavigate('earnings')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(0, 229, 255, 0.15)', color: 'var(--accent-cyan)' }}>
            <CircleDollarSign size={26} />
          </div>
          <div>
            <div className="kpi-val">${(Number(overview?.totalPrizeMoney || 0) / 1000000).toFixed(1)}M</div>
            <div className="kpi-lbl">Total Prize Purse</div>
          </div>
        </div>

        <div className="card kpi-card" onClick={() => onNavigate('players')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)', color: 'var(--purple-cap)' }}>
            <Users size={26} />
          </div>
          <div>
            <div className="kpi-val">{overview?.totalPlayers || 0}</div>
            <div className="kpi-lbl">Professional Players</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Featured Tournaments & Honors Spotlight */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '28px', marginBottom: '36px' }}>
        {/* Left Column: Featured Tournaments */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={20} color="var(--accent-gold)" /> Featured Tournaments
            </h3>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('tournaments')}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {featuredTournaments.map(t => (
              <div 
                key={t.tournament_id} 
                className="card"
                style={{ padding: '20px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
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
                    <h4 style={{ fontSize: '18px', marginTop: '8px' }}>{t.tournament_name}</h4>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prize Pool</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-gold)' }}>
                      ${Number(t.prize_money).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span>📍 {t.host_country}</span>
                    <span>🛡️ {t.teams_count} Teams</span>
                    <span>🏏 {t.matches_count} Matches</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => onOpenParticipate(t)}
                    >
                      Participate
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => onNavigate('tournaments')}
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Honors Board Spotlight */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} color="var(--accent-green)" /> Honors Board Spotlight
            </h3>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('leaderboards')}
            >
              All Honors <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Orange Cap Leader */}
            {orangeLeader && (
              <div 
                className="card card-clickable" 
                onClick={() => onOpenPlayer(orangeLeader.player_id)}
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 119, 0, 0.12), rgba(18, 28, 48, 0.8))',
                  borderColor: 'rgba(255, 119, 0, 0.35)',
                  padding: '18px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-orange">🟠 ORANGE CAP LEADER</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Most Runs</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '800' }}>{orangeLeader.player_name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{orangeLeader.team_name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--orange-cap)', fontFamily: 'var(--font-display)' }}>
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
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(18, 28, 48, 0.8))',
                  borderColor: 'rgba(168, 85, 247, 0.35)',
                  padding: '18px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-purple">🟣 PURPLE CAP LEADER</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Most Wickets</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '800' }}>{purpleLeader.player_name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{purpleLeader.team_name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--purple-cap)', fontFamily: 'var(--font-display)' }}>
                      {purpleLeader.total_wickets}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>WICKETS</div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Earner */}
            {topEarner && (
              <div 
                className="card card-clickable" 
                onClick={() => onOpenPlayer(topEarner.player_id)}
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 209, 102, 0.12), rgba(18, 28, 48, 0.8))',
                  borderColor: 'var(--border-gold)',
                  padding: '18px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-gold">💰 HIGHEST EARNER</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tournament Purse</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '800' }}>{topEarner.player_name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{topEarner.team_name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--accent-gold)', fontFamily: 'var(--font-display)' }}>
                      ${Number(topEarner.total_earnings).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TOTAL EARNED</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Matches Preview */}
      {overview?.upcomingMatches?.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="var(--accent-cyan)" /> Scheduled Fixtures
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {overview.upcomingMatches.map(m => (
              <div key={m.match_id} className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <span>{m.tournament_name}</span>
                  <span>{m.match_date}</span>
                </div>

                <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px' }}>
                  {m.team1_name} vs {m.team2_name}
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  📍 {m.venue_name}, {m.city}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
