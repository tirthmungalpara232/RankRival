import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { 
  Trophy, 
  Award, 
  Users, 
  Shield, 
  User, 
  LogOut, 
  PlusCircle, 
  Radio,
  Menu,
  X,
  MapPin,
  BarChart3
} from 'lucide-react';

export default function Navbar({ 
  currentUser, 
  onOpenAuth, 
  onOpenConductTournament, 
  onOpenParticipate,
  onLogout,
  onOpenMyProfile 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-wrapper">
        {/* Brand - Clicking on logo routes to Statistics / Overview */}
        <Link 
          to="/stastics" 
          className="nav-brand" 
          onClick={() => setMobileMenuOpen(false)}
          title="Click to view Platform Statistics & Overview"
        >
          <div className="brand-icon">🏏</div>
          <div className="brand-text">
            <span className="brand-title">CRICSPHERE<span style={{ color: 'var(--accent-green)' }}>.DB</span></span>
            <span className="brand-subtitle">Tournament DBMS</span>
          </div>
        </Link>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Nav Links - Declarative Route Links */}
        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <NavLink 
            to="/stastics"
            className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <BarChart3 size={16} /> Statistics
          </NavLink>

          <NavLink 
            to="/stadium"
            className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <MapPin size={16} /> Stadiums
          </NavLink>

          <NavLink 
            to="/tournaments"
            className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Trophy size={16} /> Tournaments
          </NavLink>

          <NavLink 
            to="/matches"
            className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Radio size={16} color="#ef4444" /> Live Score
          </NavLink>

          <NavLink 
            to="/leaderboards"
            className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Award size={16} /> Honors Board
          </NavLink>

          <NavLink 
            to="/players"
            className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Users size={16} /> Players
          </NavLink>

          <NavLink 
            to="/teams"
            className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Shield size={16} /> Teams
          </NavLink>
        </div>

        {/* Right Actions */}
        <div className={`nav-actions ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {currentUser && (currentUser.role === 'Organizer' || currentUser.role === 'Admin') && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenConductTournament();
              }}
            >
              <PlusCircle size={15} /> Host Tournament
            </button>
          )}

          {currentUser && currentUser.role === 'Player' && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenParticipate) onOpenParticipate();
                else setCurrentTab('tournaments');
              }}
            >
              <Trophy size={15} /> Join Tournament
            </button>
          )}

          {currentUser ? (
            <div className="nav-user-row">
              <button 
                className="btn btn-secondary btn-sm nav-user-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenMyProfile();
                }}
              >
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'var(--accent-green)',
                  color: '#000',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  flexShrink: 0
                }}>
                  {currentUser.full_name?.charAt(0) || 'U'}
                </div>
                <span>{currentUser.full_name?.split(' ')[0]}</span>
                <span className="badge badge-green" style={{ fontSize: '10px', padding: '2px 5px' }}>
                  {currentUser.role}
                </span>
              </button>

              <button 
                className="btn btn-secondary btn-sm nav-logout-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
            >
              <User size={15} /> Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
