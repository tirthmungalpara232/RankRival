import React from 'react';
import { 
  Trophy, 
  Flame, 
  Award, 
  CircleDollarSign, 
  Users, 
  Shield, 
  User, 
  LogOut, 
  PlusCircle, 
  Radio
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  currentUser, 
  onOpenAuth, 
  onOpenConductTournament, 
  onOpenParticipate,
  onLogout,
  onOpenMyProfile 
}) {
  return (
    <nav className="navbar">
      <div className="nav-wrapper">
        {/* Brand */}
        <div className="nav-brand" onClick={() => setCurrentTab('dashboard')}>
          <div className="brand-icon">🏏</div>
          <div className="brand-text">
            <span className="brand-title">CRICSPHERE<span style={{ color: 'var(--accent-green)' }}>.DB</span></span>
            <span className="brand-subtitle">Sports Tournament DBMS</span>
          </div>
        </div>

        {/* Links */}
        <div className="nav-links">
          <button 
            className={`nav-item-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentTab('dashboard')}
          >
            🏟️ Stadium
          </button>

          <button 
            className={`nav-item-btn ${currentTab === 'tournaments' ? 'active' : ''}`}
            onClick={() => setCurrentTab('tournaments')}
          >
            <Trophy size={16} /> Tournaments
          </button>

          <button 
            className={`nav-item-btn ${currentTab === 'matches' ? 'active' : ''}`}
            onClick={() => setCurrentTab('matches')}
          >
            <Radio size={16} className="text-red-500" /> Live Match & Scorer
          </button>

          <button 
            className={`nav-item-btn ${currentTab === 'leaderboards' ? 'active' : ''}`}
            onClick={() => setCurrentTab('leaderboards')}
          >
            <Award size={16} /> Honors Board
          </button>

          <button 
            className={`nav-item-btn ${currentTab === 'earnings' ? 'active' : ''}`}
            onClick={() => setCurrentTab('earnings')}
          >
            <CircleDollarSign size={16} /> Prize Purse
          </button>

          <button 
            className={`nav-item-btn ${currentTab === 'players' ? 'active' : ''}`}
            onClick={() => setCurrentTab('players')}
          >
            <Users size={16} /> Players
          </button>

          <button 
            className={`nav-item-btn ${currentTab === 'teams' ? 'active' : ''}`}
            onClick={() => setCurrentTab('teams')}
          >
            <Shield size={16} /> Teams
          </button>
        </div>

        {/* Right Actions */}
        <div className="nav-actions">
          {currentUser && (currentUser.role === 'Organizer' || currentUser.role === 'Admin') && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={onOpenConductTournament}
            >
              <PlusCircle size={15} /> Host Tournament
            </button>
          )}

          {currentUser && currentUser.role === 'Player' && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={onOpenParticipate ? onOpenParticipate : () => setCurrentTab('tournaments')}
            >
              <Trophy size={15} /> Join Tournament
            </button>
          )}

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={onOpenMyProfile}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--accent-green)',
                  color: '#000',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px'
                }}>
                  {currentUser.full_name?.charAt(0) || 'U'}
                </div>
                <span>{currentUser.full_name?.split(' ')[0]}</span>
                <span className="badge badge-green" style={{ fontSize: '10px', padding: '2px 6px' }}>
                  {currentUser.role}
                </span>
              </button>

              <button 
                className="btn btn-secondary btn-sm"
                onClick={onLogout}
                title="Log Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-primary btn-sm"
              onClick={onOpenAuth}
            >
              <User size={15} /> Sign In / Register
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
