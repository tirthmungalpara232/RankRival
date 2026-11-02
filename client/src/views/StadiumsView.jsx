import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  Users, 
  Activity, 
  Radio, 
  CheckCircle,
  Filter
} from 'lucide-react';
import { api } from '../api';

export default function StadiumsView({ onSelectMatchVenue }) {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pitchFilter, setPitchFilter] = useState('All');

  useEffect(() => {
    loadVenues();
  }, []);

  async function loadVenues() {
    setLoading(true);
    try {
      const data = await api.getVenues();
      setVenues(data || []);
    } catch (err) {
      console.error('Failed to load venues:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredVenues = venues.filter(v => {
    const matchesSearch = 
      v.venue_name.toLowerCase().includes(search.toLowerCase()) ||
      v.city.toLowerCase().includes(search.toLowerCase()) ||
      (v.country_name && v.country_name.toLowerCase().includes(search.toLowerCase()));

    const matchesPitch = pitchFilter === 'All' || v.pitch_type === pitchFilter;

    return matchesSearch && matchesPitch;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '26px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>🏟️</span> Cricket Stadiums & Venues Directory
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Browse international cricket grounds, seating capacities, pitch conditions, and matches hosted
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <div>
            <label className="form-label">Search Stadium or City</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by stadium (e.g. Narendra Modi, MCG, Eden Gardens)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Pitch Condition</label>
            <select 
              className="form-select"
              value={pitchFilter}
              onChange={e => setPitchFilter(e.target.value)}
            >
              <option value="All">All Pitch Types</option>
              <option value="Spin">Spin Friendly</option>
              <option value="Pace">Pace & Bounce</option>
              <option value="Flat">Flat / Batting Friendly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Venues Grid */}
      {loading ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading stadium directory...
        </div>
      ) : filteredVenues.length === 0 ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No stadiums match the selected search or filter.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '18px'
        }}>
          {filteredVenues.map(v => (
            <div 
              key={v.venue_id}
              className="card"
              style={{
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              <div>
                {/* Top Badge Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge badge-gold" style={{ fontSize: '11px' }}>
                    {v.country_code} • {v.country_name}
                  </span>
                  
                  <span className={`badge ${
                    v.pitch_type === 'Spin' ? 'badge-purple' :
                    v.pitch_type === 'Pace' ? 'badge-green' : 'badge-orange'
                  }`} style={{ fontSize: '11px' }}>
                    {v.pitch_type} Pitch
                  </span>
                </div>

                {/* Stadium Name & City */}
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>
                  {v.venue_name}
                </h3>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                  <MapPin size={14} color="var(--accent-green)" />
                  <span>{v.city}, {v.country_name}</span>
                </div>
              </div>

              {/* Stats Box */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                background: 'rgba(0,0,0,0.25)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                marginTop: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Seating Capacity</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {Number(v.capacity).toLocaleString()}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Matches Hosted</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {v.matches_hosted || 0} Fixtures
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
