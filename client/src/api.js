const API_BASE = 'http://localhost:5000/api';

export function getAuthToken() {
  return localStorage.getItem('cric_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('cric_token', token);
  } else {
    localStorage.removeItem('cric_token');
  }
}

export function getCurrentUser() {
  const userStr = localStorage.getItem('cric_user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('cric_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('cric_user');
  }
}

export async function apiFetch(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => apiFetch('/auth/me'),

  // Overview
  getOverview: () => apiFetch('/overview'),

  // Tournaments
  getTournaments: (params = '') => apiFetch(`/tournaments${params}`),
  getTournament: (id) => apiFetch(`/tournaments/${id}`),
  getTournamentFormOptions: () => apiFetch('/tournaments/meta/form-options'),
  createTournament: (data) => apiFetch('/tournaments', { method: 'POST', body: JSON.stringify(data) }),
  participateInTournament: (id, data) => apiFetch(`/tournaments/${id}/participate`, { method: 'POST', body: JSON.stringify(data) }),
  scheduleMatch: (tournamentId, data) => apiFetch(`/tournaments/${tournamentId}/schedule-match`, { method: 'POST', body: JSON.stringify(data) }),

  // Matches
  getMatches: (params = '') => apiFetch(`/matches${params}`),
  getMatch: (id) => apiFetch(`/matches/${id}`),
  scoreBall: (matchId, data) => apiFetch(`/matches/${matchId}/score-ball`, { method: 'POST', body: JSON.stringify(data) }),
  completeMatch: (matchId, data) => apiFetch(`/matches/${matchId}/complete`, { method: 'POST', body: JSON.stringify(data) }),

  // Leaderboards
  getLeaderboard: (category = 'orange_cap', tournamentId = 'all') => 
    apiFetch(`/leaderboards?category=${category}&tournament_id=${tournamentId}`),

  // Earnings
  getEarningsSummary: () => apiFetch('/earnings/summary'),
  awardPrizeMoney: (data) => apiFetch('/earnings/award', { method: 'POST', body: JSON.stringify(data) }),

  // Players
  getPlayers: (params = '') => apiFetch(`/players${params}`),
  getPlayer: (id) => apiFetch(`/players/${id}`),
  comparePlayers: (id1, id2) => apiFetch(`/players/compare/${id1}/${id2}`),

  // Teams & Venues
  getTeams: () => apiFetch('/teams'),
  getTeam: (id) => apiFetch(`/teams/${id}`),
  getVenues: () => apiFetch('/venues')
};
