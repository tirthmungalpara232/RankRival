import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ConductTournamentModal from './components/ConductTournamentModal';
import ParticipateModal from './components/ParticipateModal';
import PlayerProfileModal from './components/PlayerProfileModal';
import HeadToHeadModal from './components/HeadToHeadModal';

import OverviewStatsView from './views/OverviewStatsView';
import StadiumsView from './views/StadiumsView';
import TournamentsView from './views/TournamentsView';
import LiveMatchCenterView from './views/LiveMatchCenterView';
import LeaderboardsView from './views/LeaderboardsView';
import PlayersView from './views/PlayersView';
import TeamsView from './views/TeamsView';

import { getCurrentUser, setAuthToken, setCurrentUser } from './api';

const routeMap = {
  overview: '/stastics',
  stastics: '/stastics',
  statistics: '/stastics',
  stadium: '/stadium',
  stadiums: '/stadium',
  tournaments: '/tournaments',
  matches: '/matches',
  leaderboards: '/leaderboards',
  players: '/players',
  teams: '/teams'
};

export default function App() {
  const navigate = useNavigate();
  const [currentUser, setUser] = useState(getCurrentUser());

  // Modal triggers
  const [authOpen, setAuthOpen] = useState(false);
  const [conductOpen, setConductOpen] = useState(false);
  const [participateOpen, setParticipateOpen] = useState(false);
  const [participatingTournament, setParticipatingTournament] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareInitialId, setCompareInitialId] = useState(1);
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  function handleLogout() {
    setAuthToken(null);
    setCurrentUser(null);
    setUser(null);
  }

  function handleAuthSuccess(user) {
    setUser(user);
  }

  function handleOpenParticipate(tournament) {
    if (!currentUser) {
      setAuthOpen(true);
      return;
    }
    setParticipatingTournament(tournament);
    setParticipateOpen(true);
  }

  function handleOpenConduct() {
    if (!currentUser) {
      setAuthOpen(true);
      return;
    }
    setConductOpen(true);
  }

  function handleOpenPlayer(playerId) {
    setSelectedPlayerId(playerId);
  }

  function handleOpenCompare(id1 = 1) {
    setCompareInitialId(id1);
    setCompareOpen(true);
  }

  function handleSelectMatch(matchId) {
    setSelectedMatchId(matchId);
    navigate('/matches');
  }

  function handleInternalNavigate(dest) {
    const target = routeMap[dest] || (dest.startsWith('/') ? dest : `/${dest}`);
    navigate(target);
  }

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <Navbar 
        currentUser={currentUser}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenConductTournament={handleOpenConduct}
        onOpenParticipate={() => handleOpenParticipate(null)}
        onLogout={handleLogout}
        onOpenMyProfile={() => {
          if (currentUser?.player_id) {
            handleOpenPlayer(currentUser.player_id);
          } else {
            alert(`Logged in as ${currentUser.full_name} (${currentUser.role})`);
          }
        }}
      />

      {/* Main Content Arena with Declarative React Router Routes */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/stastics" replace />} />
          <Route 
            path="/stastics" 
            element={
              <OverviewStatsView 
                onNavigate={handleInternalNavigate}
                onOpenPlayer={handleOpenPlayer}
                currentUser={currentUser}
              />
            } 
          />
          <Route path="/statistics" element={<Navigate to="/stastics" replace />} />
          <Route 
            path="/stadium" 
            element={
              <StadiumsView 
                onSelectMatchVenue={() => navigate('/matches')}
              />
            } 
          />
          <Route path="/stadiums" element={<Navigate to="/stadium" replace />} />
          <Route 
            path="/tournaments" 
            element={
              <TournamentsView 
                onOpenConduct={handleOpenConduct}
                onOpenParticipate={handleOpenParticipate}
                onSelectMatch={handleSelectMatch}
                onOpenPlayer={handleOpenPlayer}
                currentUser={currentUser}
              />
            } 
          />
          <Route 
            path="/matches" 
            element={
              <LiveMatchCenterView 
                selectedMatchId={selectedMatchId}
                onOpenPlayer={handleOpenPlayer}
                currentUser={currentUser}
              />
            } 
          />
          <Route 
            path="/leaderboards" 
            element={
              <LeaderboardsView 
                onOpenPlayer={handleOpenPlayer}
              />
            } 
          />
          <Route 
            path="/players" 
            element={
              <PlayersView 
                onOpenPlayer={handleOpenPlayer}
                onOpenCompare={handleOpenCompare}
              />
            } 
          />
          <Route 
            path="/teams" 
            element={
              <TeamsView 
                onOpenPlayer={handleOpenPlayer}
              />
            } 
          />
          <Route path="*" element={<Navigate to="/stastics" replace />} />
        </Routes>
      </main>

      {/* Modals */}
      <AuthModal 
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <ConductTournamentModal 
        isOpen={conductOpen}
        onClose={() => setConductOpen(false)}
        onSuccess={() => {
          alert('Tournament created and conducted successfully!');
          navigate('/tournaments');
        }}
      />

      <ParticipateModal 
        isOpen={participateOpen}
        onClose={() => setParticipateOpen(false)}
        tournament={participatingTournament}
        currentUser={currentUser}
        onSuccess={() => {
          alert('Successfully registered team for tournament!');
          navigate('/tournaments');
        }}
      />

      <PlayerProfileModal 
        isOpen={!!selectedPlayerId}
        playerId={selectedPlayerId}
        onClose={() => setSelectedPlayerId(null)}
        onOpenCompare={handleOpenCompare}
      />

      <HeadToHeadModal 
        isOpen={compareOpen}
        initialPlayerId={compareInitialId}
        onClose={() => setCompareOpen(false)}
      />

      {/* Clean Human DBMS Project Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(5, 9, 16, 0.95)',
        padding: '24px 20px',
        textAlign: 'center',
        fontSize: '13px',
        color: 'var(--text-muted)'
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏏</span>
            <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>CRICSPHERE</span>
            <span>• Cricket Tournament Database Management System</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span className="badge badge-green" style={{ fontSize: '11px' }}>
              MySQL Database
            </span>
            <span className="badge badge-gold" style={{ fontSize: '11px' }}>
              React + Express
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
