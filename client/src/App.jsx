import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ConductTournamentModal from './components/ConductTournamentModal';
import ParticipateModal from './components/ParticipateModal';
import PlayerProfileModal from './components/PlayerProfileModal';
import HeadToHeadModal from './components/HeadToHeadModal';
import AwardPrizeModal from './components/AwardPrizeModal';

import DashboardView from './views/DashboardView';
import TournamentsView from './views/TournamentsView';
import LiveMatchCenterView from './views/LiveMatchCenterView';
import LeaderboardsView from './views/LeaderboardsView';
import EarningsView from './views/EarningsView';
import PlayersView from './views/PlayersView';
import TeamsView from './views/TeamsView';

import { getCurrentUser, setAuthToken, setCurrentUser } from './api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [currentUser, setUser] = useState(getCurrentUser());

  // Modal triggers
  const [authOpen, setAuthOpen] = useState(false);
  const [conductOpen, setConductOpen] = useState(false);
  const [participateOpen, setParticipateOpen] = useState(false);
  const [participatingTournament, setParticipatingTournament] = useState(null);
  const [awardOpen, setAwardOpen] = useState(false);
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
    setCurrentTab('matches');
  }

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <Navbar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
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

      {/* Main Content Arena */}
      <main className="main-content">
        {currentTab === 'dashboard' && (
          <DashboardView 
            onNavigate={setCurrentTab}
            onOpenConduct={handleOpenConduct}
            onOpenPlayer={handleOpenPlayer}
            onOpenParticipate={handleOpenParticipate}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'tournaments' && (
          <TournamentsView 
            onOpenConduct={handleOpenConduct}
            onOpenParticipate={handleOpenParticipate}
            onSelectMatch={handleSelectMatch}
            onOpenPlayer={handleOpenPlayer}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'matches' && (
          <LiveMatchCenterView 
            selectedMatchId={selectedMatchId}
            onOpenPlayer={handleOpenPlayer}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'leaderboards' && (
          <LeaderboardsView 
            onOpenPlayer={handleOpenPlayer}
          />
        )}

        {currentTab === 'earnings' && (
          <EarningsView 
            onOpenAward={() => setAwardOpen(true)}
            onOpenPlayer={handleOpenPlayer}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'players' && (
          <PlayersView 
            onOpenPlayer={handleOpenPlayer}
            onOpenCompare={handleOpenCompare}
          />
        )}

        {currentTab === 'teams' && (
          <TeamsView 
            onOpenPlayer={handleOpenPlayer}
          />
        )}
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
          setCurrentTab('tournaments');
        }}
      />

      <ParticipateModal 
        isOpen={participateOpen}
        onClose={() => setParticipateOpen(false)}
        tournament={participatingTournament}
        currentUser={currentUser}
        onSuccess={() => {
          alert('Successfully registered team for tournament!');
          setCurrentTab('tournaments');
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

      <AwardPrizeModal 
        isOpen={awardOpen}
        onClose={() => setAwardOpen(false)}
        onSuccess={() => {
          alert('Prize payout disbursed successfully!');
          setCurrentTab('earnings');
        }}
      />

      {/* Modern Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(5, 9, 16, 0.95)',
        padding: '28px 24px',
        textAlign: 'center',
        fontSize: '13px',
        color: 'var(--text-muted)'
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏏</span>
            <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>CRICSPHERE PRO DBMS</span>
            <span>• Full-Stack Sports Database Management System</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="badge badge-green" style={{ fontSize: '11px' }}>
              ✓ MySQL & SQLite Dual-Engine
            </span>
            <span className="badge badge-gold" style={{ fontSize: '11px' }}>
              React 19 + Express API
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
