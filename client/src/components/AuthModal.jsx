import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { api, setAuthToken, setCurrentUser } from '../api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Player'); // 'Player' or 'Organizer'
  const [countryId, setCountryId] = useState(1);
  const [playerRole, setPlayerRole] = useState('All-rounder');
  const [battingStyle, setBattingStyle] = useState('Right-hand');
  const [bowlingStyle, setBowlingStyle] = useState('Right-arm medium');

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.login({
          login: username || email,
          password
        });
        setAuthToken(res.token);
        setCurrentUser(res.user);
        onAuthSuccess(res.user);
        onClose();
      } else {
        const res = await api.register({
          username,
          email,
          password,
          full_name: fullName,
          role,
          country_id: Number(countryId),
          player_role: playerRole,
          batting_style: battingStyle,
          bowling_style: bowlingStyle
        });
        setAuthToken(res.token);
        setCurrentUser(res.user);
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  function fillDemoAccount(userType) {
    if (userType === 'organizer') {
      setUsername('organizer');
      setPassword('password123');
      setIsLogin(true);
    } else if (userType === 'player') {
      setUsername('tanmay_desai');
      setPassword('password123');
      setIsLogin(true);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '22px' }}>{isLogin ? 'Sign In to CricSphere' : 'Create Cricket Account'}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {isLogin ? 'Access your tournament dashboard and performance records' : 'Conduct tournaments or track your cricket career performance'}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Quick Demo Logins Banner */}
        {isLogin && (
          <div style={{
            background: 'rgba(0, 230, 118, 0.08)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '18px',
            fontSize: '12px'
          }}>
            <div style={{ fontWeight: '700', color: 'var(--accent-green)', marginBottom: '4px' }}>⚡ Quick Demo Accounts:</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => fillDemoAccount('organizer')}
              >
                👔 Organizer (Rajesh)
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => fillDemoAccount('player')}
              >
                🏏 Player (Tanmay Desai)
              </button>
            </div>
          </div>
        )}

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
          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  placeholder="e.g. Virat Kohli" 
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Select Your Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    className={`btn ${role === 'Player' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setRole('Player')}
                    style={{ justifyContent: 'center' }}
                  >
                    🏏 Player
                  </button>
                  <button
                    type="button"
                    className={`btn ${role === 'Organizer' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setRole('Organizer')}
                    style={{ justifyContent: 'center' }}
                  >
                    👔 Tournament Organizer
                  </button>
                </div>
              </div>

              {role === 'Player' && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '16px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-green)', marginBottom: '8px' }}>
                    Player Profile Attributes:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '11px' }}>Playing Role</label>
                      <select className="form-select" value={playerRole} onChange={e => setPlayerRole(e.target.value)}>
                        <option value="Batsman">Batsman</option>
                        <option value="Bowler">Bowler</option>
                        <option value="All-rounder">All-rounder</option>
                        <option value="Wicketkeeper">Wicketkeeper</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '11px' }}>Country</label>
                      <select className="form-select" value={countryId} onChange={e => setCountryId(e.target.value)}>
                        <option value="1">India</option>
                        <option value="2">Australia</option>
                        <option value="3">England</option>
                        <option value="4">Pakistan</option>
                        <option value="5">South Africa</option>
                        <option value="6">New Zealand</option>
                        <option value="7">Sri Lanka</option>
                        <option value="8">Bangladesh</option>
                        <option value="9">West Indies</option>
                        <option value="10">Afghanistan</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '11px' }}>Batting Style</label>
                      <select className="form-select" value={battingStyle} onChange={e => setBattingStyle(e.target.value)}>
                        <option value="Right-hand">Right-hand</option>
                        <option value="Left-hand">Left-hand</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '11px' }}>Bowling Style</label>
                      <select className="form-select" value={bowlingStyle} onChange={e => setBowlingStyle(e.target.value)}>
                        <option value="Right-arm fast">Right-arm fast</option>
                        <option value="Right-arm medium">Right-arm medium</option>
                        <option value="Right-arm off-spin">Right-arm off-spin</option>
                        <option value="Right-arm leg-spin">Right-arm leg-spin</option>
                        <option value="Left-arm fast">Left-arm fast</option>
                        <option value="Left-arm spin">Left-arm spin</option>
                        <option value="None">None</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label className="form-label">{isLogin ? 'Username or Email' : 'Username'}</label>
            <input 
              type="text" 
              className="form-input" 
              required 
              placeholder={isLogin ? 'Enter username or email' : 'Choose a unique username'}
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                required 
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              required 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account yet? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent-green)', 
              fontWeight: '700', 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? 'Register now' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
