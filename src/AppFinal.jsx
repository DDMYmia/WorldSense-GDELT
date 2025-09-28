import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { signIn, signUp, signOut, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import './styles/charts.css';
import './styles/layout.css';

// Authentication integrated in toolbar
import './aws-config';

// Import chart components
import {
  EventTrendChart,
  CountryDistributionChart,
  ToneAnalysisChart,
  ThemeHeatChart,
  StatsCards
} from './components/Charts';

// Import login prompt modal
import LoginPromptModal from './components/LoginPromptModal';

const getId = ev => `${ev.properties.id}-${ev.properties.tone}-${ev.geometry.coordinates[0]}-${ev.geometry.coordinates[1]}`
// Fix Leaflet icon issues using CDN
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const API_BASE = import.meta.env.VITE_API_BASE || 'https://82z3xjob1g.execute-api.us-east-1.amazonaws.com/prod';
console.log('API_BASE:', API_BASE);
console.log('App Version: 3.0.0 - Final Clean Version');
console.log('Build Time:', new Date().toISOString());

const getDBName = () => "WorldSenseGDELT" + localStorage.getItem("userEmail") === null ? "": localStorage.getItem("userEmail");
// Custom Hook for data fetching
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    setLoading(true);
    setError(null);

    fetch(url)
      .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('API Response:', data);
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('API Error:', err);
        setError(err);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}

// Map Event Handler Component (must be inside MapContainer)
function MapEventHandler({ onBboxChange }) {
  const map = useMap();

  function debounce(func, delay) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}
  useEffect(() => {
    const handleMoveEnd = () => {
      const bounds = map.getBounds();
      const bbox = `${bounds.getWest().toFixed(5)},${bounds.getSouth().toFixed(5)},${bounds.getEast().toFixed(5)},${bounds.getNorth().toFixed(5)}`;
   //   console.log("Map moved, new bbox:", bbox);
      onBboxChange(bbox, map.getCenter());
    };


    map.on('moveend', handleMoveEnd);
    handleMoveEnd(); // Initial call

    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map]);

  return null; // This component doesn't render anything
}
function deleteLikedEventFromDB(id) {
  const request = window.indexedDB.open(getDBName(), 1);
  request.onsuccess = function(e) {
    const db = e.target.result;
    const tx = db.transaction("likedEvents", "readwrite");
    const store = tx.objectStore("likedEvents");
    store.delete(id);
    tx.oncomplete = () => db.close();
  };
}
// Map Component
function Map({ geojson, onBboxChange, center, onLike, onDelete, likedEvents, isLoggedIn }) {
  const features = (geojson?.features || []).slice(0, 1000); // Limit markers for performance

  // Track which marker popup is open
  const [openPopupIdx, setOpenPopupIdx] = useState(null);
  const likedIds = new Set(likedEvents.map(ev => getId(ev)));
    // Custom icons
  const defaultIcon = new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  const likedIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Reset open popup when features change
  useEffect(() => {
    setOpenPopupIdx(null);
  }, [features]);

  const getToneDescription = (tone) => {
    if (tone > 5) return 'Very Positive';
    if (tone > 2) return 'Positive';
    if (tone >= -2) return 'Neutral';
    if (tone > -5) return 'Negative';
    return 'Very Negative';
  };

  return (
    <MapContainer center={center} zoom={4} style={{ height: 'calc(100vh - 300px)', width: '100%', borderRadius: '12px' }}>
      <MapEventHandler onBboxChange={onBboxChange} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {features.map((feature) => {
        const [lon, lat] = feature.geometry.coordinates;
        const idx = `${feature.properties.id}-${feature.properties.tone}-${lon}-${lat}`; // Unique key for each marker
        const properties = feature.properties || {};
        const isLiked = likedIds.has(idx);

        const countryFullName = properties.country || 'Unknown';
        const toneDescription = getToneDescription(properties.tone);
        const formattedTime = properties['@timestamp'] && !properties['@timestamp'].startsWith('2608') ? new Date(properties['@timestamp']).toLocaleString() : 'Unknown';

        // Create a more descriptive title from available data
        const actor1Name = properties.actor1 || 'Unknown Actor';
        const actor2Name = properties.actor2 || '';
        const eventType = properties.theme || 'Global Event';
        const theme = actor1Name + (actor2Name ? ` vs ${actor2Name}` : '') + ` - ${eventType}`;

        return (
          <Marker key={idx} position={[lat, lon]}
           icon={isLiked ? likedIcon : defaultIcon}
             eventHandlers={{
            click: () => setOpenPopupIdx(idx)
          }}>
              <Popup onClose={() => setOpenPopupIdx(null)}>
                <div style={{ minWidth: 200, padding: '8px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                   {theme}
                  </div>
                  <div style={{ marginBottom: '4px' }}><strong>Country:</strong> {countryFullName}</div>
                  <div style={{ marginBottom: '4px' }}><strong>Tone:</strong>  {toneDescription} ({properties.tone})</div>
                  <div style={{ marginBottom: '4px' }}><strong>Time:</strong> {formattedTime}</div>
                  {properties.actor1 && <div style={{ marginBottom: '4px' }}><strong>Actor 1:</strong> {properties.actor1}</div>}
                  {properties.actor2 && <div style={{ marginBottom: '4px' }}><strong>Actor 2:</strong> {properties.actor2}</div>}
                  {properties.lang && <div style={{ marginBottom: '4px' }}><strong>Language:</strong> {properties.lang}</div>}
                  {(isLiked && isLoggedIn) && (
                  <button
                    style={{
                      marginTop: '8px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                    onClick={() => onDelete(properties)}
                  >
                    🗑 Delete
                  </button>
                )}
                {(!isLiked && isLoggedIn) && (
                  <button
                    style={{
                      marginTop: '8px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                    onClick={() => onLike(feature)}
                  >
                    👍 Like
                  </button>
                )}
                </div>
              </Popup>
         
          </Marker>
        );
      })}
    </MapContainer>
  );
}

// Toolbar Component
function Toolbar({ params, setParams, onRefresh, onShowLoginPrompt, onLoginStateChange }) {
  const [gte, setGte] = useState(params.gte);
  const [lte, setLte] = useState(params.lte);
  const [bbox, setBbox] = useState(params.bbox);
  const [q, setQ] = useState(params.q);
  const [searchType, setSearchType] = useState('theme');
  const [searchValue, setSearchValue] = useState('');
  const [country, setCountry] = useState('');
  const [actor, setActor] = useState('');

  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.gte !== gte) setGte(params.gte);
    if (params.lte !== lte) setLte(params.lte);
    if (params.bbox !== bbox) setBbox(params.bbox);
    if (params.q !== q) setQ(params.q);
  }, [params.gte, params.lte, params.bbox, params.q]);

  // Check login state on mount
  useEffect(() => {
    checkAuthState();
  }, []);

  async function checkAuthState() {
    try {
      const user = await getCurrentUser();
      setUser(user);
      setIsLoggedIn(true);
    } catch (error) {
      setIsLoggedIn(false);
      setUser(null);
    }
  }

  async function handleSignIn(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn({ username: email, password });
      setUser(result);
      setIsLoggedIn(true);
      localStorage.setItem('userEmail', email);
      setEmail(email);
      setPassword('');
      onLoginStateChange && onLoginStateChange(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name: email.split('@')[0] // Use email prefix as default name
          }
        }
      });
      
      // Auto sign in after successful registration
      try {
        const result = await signIn({ username: email, password });
        setUser(result);
        setIsLoggedIn(true);
        setEmail('');
        setPassword('');
        onLoginStateChange && onLoginStateChange(true);
        setError('Registration and login successful!');
      } catch (signInError) {
        setError('Registration successful! Please sign in manually.');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      setIsLoggedIn(false);
      setUser(null);
      setEmail('');
      setPassword('');
      // Clear localStorage for persistence
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userEmail');
      onLoginStateChange && onLoginStateChange(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  const buildQuery = () => {
    const queryParts = [];
    if (searchType && searchValue) queryParts.push(`${searchType}:${searchValue}`);
    if (country) queryParts.push(`country:${country}`);
    if (actor) queryParts.push(`actor:${actor}`);
    return queryParts.join(" AND ");
  };

  const handleSearch = () => {
    const newQ = buildQuery();
    setQ(newQ);
    setParams(prev => ({ ...prev, gte, lte, bbox, q: newQ }));
    onRefresh();
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', padding: '24px', borderRadius: '0 0 12px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', color: '#334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '600', margin: 0, color: '#1e293b' }}>🌍 WorldSense GDELT</h1>
            <div style={{ background: '#e2e8f0', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', color: '#64748b' }}>Global Event Data Visualization</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isLoggedIn && user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  Welcome, {user.attributes?.name || user.attributes?.email || user.username || email}
                </span>
                <button
                  onClick={handleSignOut}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  disabled={loading}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  placeholder="Account"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px',
                    width: '140px'
                  }}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px',
                    width: '100px'
                  }}
                />
                <button
                  onClick={handleSignIn}
                  style={{
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  disabled={loading || !email || !password}
                >
                  {loading ? '...' : 'Sign In'}
                </button>
                <button
                  onClick={handleSignUp}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  disabled={loading}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            color: '#dc3545',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            marginBottom: '16px',
            borderLeft: '3px solid #dc3545'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Start Date</label>
            <input
              type="date"
              value={gte}
              onChange={(e) => setGte(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', background: '#ffffff', color: '#374151', outline: 'none', transition: 'border-color 0.2s ease' }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>End Date</label>
            <input
              type="date"
              value={lte}
              onChange={(e) => setLte(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', background: '#ffffff', color: '#374151', outline: 'none', transition: 'border-color 0.2s ease' }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Geographic Bounds</label>
            <input
              value={bbox}
              onChange={(e) => setBbox(e.target.value)}
              placeholder="west,south,east,north"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', background: '#ffffff', color: '#374151', outline: 'none', transition: 'border-color 0.2s ease' }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Search Type</label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', background: '#ffffff', color: '#374151', outline: 'none', transition: 'border-color 0.2s ease' }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="theme">Theme</option>
              <option value="actor">Actor</option>
              <option value="country">Country</option>
              <option value="source">Source</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Search Value</label>
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="e.g., HEALTH, WHO, CN"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', background: '#ffffff', color: '#374151', outline: 'none', transition: 'border-color 0.2s ease' }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Country</label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g., CN, US, JP"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', background: '#ffffff', color: '#374151', outline: 'none', transition: 'border-color 0.2s ease' }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Actor</label>
            <input
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              placeholder="e.g., WHO, GOV, MEDIA"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', background: '#ffffff', color: '#374151', outline: 'none', transition: 'border-color 0.2s ease' }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={handleSearch}
            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', boxShadow: '0 2px 4px rgba(59,130,246,0.2)', transition: 'all 0.2s ease' }}
            onMouseOver={(e) => { e.target.style.background = '#2563eb'; e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 4px 8px rgba(59,130,246,0.3)'; }}
            onMouseOut={(e) => { e.target.style.background = '#3b82f6'; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 2px 4px rgba(59,130,246,0.2)'; }}
          >
            Search Events
          </button>
          <div style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#64748b', border: '1px solid #e2e8f0' }}>
            Query: {buildQuery() || "No filters applied"}
          </div>
        </div>
      </div>
    </div>
  );
}

// Search Results Component
function SearchResults({ data, onDelete }) {
  return (
    <div style={{ background: '#ffffff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#1e293b' }}>Saved Events</h3>
        <div style={{ background: '#3b82f6', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
          Total: {data?.total || 0}
        </div>
      </div>
      <div style={{ background: '#f8fafc', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0', maxHeight: '400px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', color: '#475569' }}>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '500', fontSize: '12px' }}>Time</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '500', fontSize: '12px' }}>Actor</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '500', fontSize: '12px' }}>Country</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '500', fontSize: '12px' }}>Tone</th>
              {/* <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '500', fontSize: '12px' }}>Source</th> */}
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s ease', background: '#ffffff' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}>
                <td style={{ padding: '10px 8px', color: '#64748b', fontSize: '12px' }}>{item.properties['@timestamp'] ? new Date(item.properties['@timestamp']).toLocaleDateString() : '-'}</td>
                <td style={{ padding: '10px 8px', fontWeight: '500', fontSize: '12px', color: '#374151' }}>{item.properties.actor1 || '-'}</td>
                <td style={{ padding: '10px 8px' }}>
                  <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '500' }}>{item.properties.country || '-'}</span>
                </td>
                <td style={{ padding: '10px 8px' }}>
                  <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '500' }}>{item.properties.tone || '-'}</span>
                </td>
                <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                  <button
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                    onClick={() => onDelete(item)}
                  >
                    Delete
                  </button>
                </td>
                {/* <td style={{ padding: '10px 8px', color: '#9ca3af', fontSize: '11px' }}>{item.source_file ? item.source_file.split('/').pop() : '-'}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
        {(!data?.items || data.items.length === 0) && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <div>No Saved events </div>
            <div style={{ fontSize: '12px', marginTop: '8px' }}></div>
          </div>
        )}
      </div>
    </div>
  );
}

// Dashboard Component (contains the main UI)
function Dashboard() {
  const [params, setParams] = useState({
    gte: "2015-01-01",
    lte: "2015-12-31",
    bbox: "-180,-90,180,90", // Global view
    q: ""
  });
  const [refreshKey, setRefreshKey] = useState(0); // Used to force data refresh
  
  // Login prompt modal state
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [hasShownLoginPrompt, setHasShownLoginPrompt] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Build API URLs
  const mapUrl = useMemo(() => {
    const url = new URL(`${API_BASE}/map`);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    url.searchParams.set('size', '5000'); // Increased to 5000 as requested
    return url.toString();
  }, [params, refreshKey]);

  const statsUrl = useMemo(() => {
    const url = new URL(`${API_BASE}/stats`);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    return url.toString();
  }, [params, refreshKey]);

  const searchUrl = useMemo(() => {
    const url = new URL(`${API_BASE}/search`);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    url.searchParams.set('size', '500'); // Increased for chart aggregation
    return url.toString();
  }, [params, refreshKey]);

  // Data fetching
  const { data: mapData, loading: mapLoading, error: mapError } = useFetch(mapUrl);
  const { data: statsData, loading: statsLoading, error: statsError } = useFetch(statsUrl);
  const { data: searchData, loading: searchLoading, error: searchError } = useFetch(searchUrl);

  // Handle map movement
  const handleMapMove = (bbox, center) => {
    
    setMapCenter(center);
    setParams(prev => ({ ...prev, bbox }));
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Check login state on mount with persistence
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const user = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        setIsLoggedIn(true);
        // Store login state in localStorage for persistence
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', attributes.email || '');
        console.log('User authenticated:', user);
      } catch (error) {
        // setIsLoggedIn(false);
        // localStorage.removeItem('isLoggedIn');
        // localStorage.removeItem('userEmail');
        // console.log('User not authenticated');
      }
    };
    checkAuthState();
  }, []);

  // Show login prompt after a delay (only if not logged in)
  useEffect(() => {
    const timer = setTimeout(() => {
      return;
      if (!hasShownLoginPrompt && !isLoggedIn) {
        setShowLoginPrompt(true);
        setHasShownLoginPrompt(true);
      }
    }, 1000); // Show after 3 seconds

    return () => clearTimeout(timer);
  }, [hasShownLoginPrompt, isLoggedIn]);

  // Handle login from modal
  const handleModalLogin = async (email, password) => {
    try {
      // Update login state
      setIsLoggedIn(true);
      setShowLoginPrompt(false);
      // Store login state in localStorage for persistence
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Close login prompt
  const handleCloseLoginPrompt = () => {
    setShowLoginPrompt(false);
  };

  const [likedEvents, setLikedEvents] = useState([]);

  // Load liked events from IndexedDB on mount
  useEffect(() => {
    
    if (!localStorage.getItem('userEmail')) return;
    const request = window.indexedDB.open(getDBName(), 1);
    request.onupgradeneeded = function(e) {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("likedEvents")) {
        db.createObjectStore("likedEvents", { keyPath: "id" });
      }
    };
    request.onsuccess = function(e) {
      const db = e.target.result;
      const tx = db.transaction("likedEvents", "readonly");
      const store = tx.objectStore("likedEvents");
      const getAll = store.getAll();
      getAll.onsuccess = function() {
        setLikedEvents(getAll.result.map(props => ({ ...props.feature, id: props.id })));
        db.close();
      };
    };
  }, [isLoggedIn]);

  // Handle like event
  const handleLikeEvent = (feature) => {
    setLikedEvents(prev => {
      const id = getId(feature);
      if (prev.some(ev => getId(ev) === id)) return prev;
      // Save to IndexedDB
      const request = window.indexedDB.open(getDBName(), 1);
      request.onsuccess = function(e) {
        const db = e.target.result;
        const tx = db.transaction("likedEvents", "readwrite");
        const store = tx.objectStore("likedEvents");
        store.put({ feature, id });
        tx.oncomplete = () => db.close();
      };
      return [...prev, feature];
    });
  };

  // Handle delete event
  const handleDeleteEvent = (feature) => {
    const id = getId(feature)
    setLikedEvents(prev => prev.filter(ev => getId(ev) !== id));
    deleteLikedEventFromDB(id);
  };


 const [mapCenter, setMapCenter] = useState([20, 0]); // Default center [lat, lon]
  return (
    <div className="dashboard-container">
      <Toolbar
        params={params}
        setParams={setParams}
        onRefresh={handleRefresh}
        onShowLoginPrompt={() => setShowLoginPrompt(true)}
        onLoginStateChange={(loggedIn) => {
          setIsLoggedIn(loggedIn)
        } }
      />
      
      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={handleCloseLoginPrompt}
        onLogin={handleModalLogin}
      />

      <div className="dashboard-content">
        <div className="main-content">
          <div className="map-container">
            <h3>{mapData && <span>🌍 Global Event Map</span>} {mapLoading && <span>Loading map data...</span>} {mapError && <span>{`Failed to load map data:  ${mapError.message}`}</span>}</h3>
            {/* {mapLoading && <div className="chart-placeholder">Loading map data...</div>}
            {mapError && <div className="chart-placeholder">Failed to load map data: {mapError.message}</div>} */}
            {mapData && (
              <Map 
                geojson={mapData} onBboxChange={handleMapMove} 
                center={mapCenter} onLike={handleLikeEvent}       
                onDelete={handleDeleteEvent}
                likedEvents={likedEvents} isLoggedIn={isLoggedIn}/>
            )}
          </div>

          <div className="search-results-container">
            <SearchResults data={{ items: likedEvents}} onDelete={handleDeleteEvent}/>
          </div>
        </div>

        <div className="stats-container">
          <StatsCards data={statsData} />
          <EventTrendChart data={statsData} />
          <CountryDistributionChart data={statsData} searchData={searchData} mapData={mapData}/>
          <ToneAnalysisChart data={statsData} searchData={searchData} mapData={mapData}/>
          {/* <ThemeHeatChart data={statsData} searchData={searchData} /> */}
        </div>
      </div>
    </div>
  );
}

// Main App Component - Direct Access
export default function AppFinal() {
  return <Dashboard />;
}
