import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { signIn, signUp, signOut, getCurrentUser } from 'aws-amplify/auth';
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

// Fix Leaflet icon issues using CDN
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const API_BASE = "https://8p15o14kp9.execute-api.us-east-1.amazonaws.com/prod";
console.log('API_BASE:', API_BASE);
console.log('App Version: 3.0.0 - Final Clean Version');
console.log('Build Time:', new Date().toISOString());

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

  useEffect(() => {
    const handleMoveEnd = () => {
      const bounds = map.getBounds();
      const bbox = `${bounds.getWest().toFixed(5)},${bounds.getSouth().toFixed(5)},${bounds.getEast().toFixed(5)},${bounds.getNorth().toFixed(5)}`;
      onBboxChange(bbox);
    };

    map.on('moveend', handleMoveEnd);
    handleMoveEnd(); // Initial call

    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onBboxChange]);

  return null; // This component doesn't render anything
}

// Map Component
function Map({ geojson, onBboxChange, loading }) {
  const defaultPosition = [20, 0]; // Centered around the world (Atlantic Ocean)
  const features = (geojson?.features || []).slice(0, 1000); // Limit markers for performance

  const countryMap = {
    "US": "United States", "CN": "China", "IN": "India", "RU": "Russia", "GB": "United Kingdom",
    "DE": "Germany", "FR": "France", "JP": "Japan", "AU": "Australia", "CA": "Canada",
    "BR": "Brazil", "ZA": "South Africa", "EG": "Egypt", "NG": "Nigeria", "MX": "Mexico",
    "AR": "Argentina", "IT": "Italy", "ES": "Spain", "PK": "Pakistan", "ID": "Indonesia",
    "BD": "Bangladesh", "VN": "Vietnam", "PH": "Philippines", "TR": "Turkey", "IR": "Iran",
    "SA": "Saudi Arabia", "KR": "South Korea", "UA": "Ukraine", "PL": "Poland", "TH": "Thailand",
    "MY": "Malaysia", "SG": "Singapore", "NZ": "New Zealand", "CH": "Switzerland", "SE": "Sweden",
    "NL": "Netherlands", "BE": "Belgium", "AT": "Austria", "GR": "Greece", "PT": "Portugal",
    "IE": "Ireland", "DK": "Denmark", "NO": "Norway", "FI": "Finland", "AE": "United Arab Emirates",
    "IL": "Israel", "CL": "Chile", "CO": "Colombia", "PE": "Peru", "VE": "Venezuela",
    "ET": "Ethiopia", "KE": "Kenya", "TZ": "Tanzania", "UG": "Uganda", "CG": "Republic of the Congo",
    "SD": "Sudan", "DZ": "Algeria", "MA": "Morocco", "LY": "Libya", "IQ": "Iraq",
    "SY": "Syria", "YE": "Yemen", "AF": "Afghanistan", "MM": "Myanmar", "LK": "Sri Lanka",
    "KZ": "Kazakhstan", "UZ": "Uzbekistan", "AZ": "Azerbaijan", "GE": "Georgia",
    "AM": "Armenia", "BY": "Belarus", "RO": "Romania", "HU": "Hungary", "CZ": "Czech Republic",
    "SK": "Slovakia", "BG": "Bulgaria", "RS": "Serbia", "HR": "Croatia", "BA": "Bosnia and Herzegovina",
    "AL": "Albania", "MK": "North Macedonia", "SI": "Slovenia", "LT": "Lithuania", "LV": "Latvia",
    "EE": "Estonia", "IS": "Iceland", "CY": "Cyprus", "MT": "Malta", "LU": "Luxembourg",
    "XK": "Kosovo", "PS": "Palestine", "TW": "Taiwan", "HK": "Hong Kong", "MO": "Macau",
    "CU": "Cuba", "HT": "Haiti", "DO": "Dominican Republic", "JM": "Jamaica", "TT": "Trinidad and Tobago",
    "BS": "Bahamas", "BB": "Barbados", "LC": "Saint Lucia", "GD": "Grenada", "VC": "Saint Vincent and the Grenadines",
    "DM": "Dominica", "AG": "Antigua and Barbuda", "KN": "Saint Kitts and Nevis", "BZ": "Belize", "GT": "Guatemala",
    "SV": "El Salvador", "HN": "Honduras", "NI": "Nicaragua", "CR": "Costa Rica", "PA": "Panama",
    "EC": "Ecuador", "BO": "Bolivia", "PY": "Paraguay", "UY": "Uruguay", "GY": "Guyana",
    "SR": "Suriname", "GF": "French Guiana", "GS": "South Georgia and the South Sandwich Islands",
    "AQ": "Antarctica", "GL": "Greenland", "PM": "Saint Pierre and Miquelon", "NC": "New Caledonia",
    "VU": "Vanuatu", "SB": "Solomon Islands", "PG": "Papua New Guinea", "FM": "Federated States of Micronesia", "MH": "Marshall Islands",
    "WS": "Samoa", "TO": "Tonga",
    "FJ": "Fiji", "PW": "Palau", "TL": "Timor-Leste", "BN": "Brunei", "LA": "Laos",
    "KH": "Cambodia", "MV": "Maldives", "BT": "Bhutan", "KG": "Kyrgyzstan",
    "TJ": "Tajikistan", "TM": "Turkmenistan", "ER": "Eritrea", "DJ": "Djibouti", "SO": "Somalia",
    "SS": "South Sudan", "CF": "Central African Republic", "CM": "Cameroon", "GA": "Gabon",
    "AO": "Angola", "ZM": "Zambia", "ZW": "Zimbabwe", "MW": "Malawi", "MZ": "Mozambique",
    "BW": "Botswana", "NA": "Namibia", "LS": "Lesotho", "SZ": "Eswatini", "MG": "Madagascar",
    "KM": "Comoros", "SC": "Seychelles", "MU": "Mauritius", "CV": "Cape Verde", "ST": "Sao Tome and Principe",
    "GW": "Guinea-Bissau", "GM": "Gambia", "SN": "Senegal", "MR": "Mauritania", "ML": "Mali",
    "BF": "Burkina Faso", "NE": "Niger", "TD": "Chad", "BI": "Burundi", "RW": "Rwanda",
    "SL": "Sierra Leone", "LR": "Liberia", "CI": "Ivory Coast", "GH": "Ghana", "TG": "Togo",
    "BJ": "Benin", "GQ": "Equatorial Guinea", "RE": "Réunion", "YT": "Mayotte",
    "SH": "Saint Helena", "PN": "Pitcairn Islands", "TK": "Tokelau", "NU": "Niue",
    "CK": "Cook Islands", "GI": "Gibraltar", "IM": "Isle of Man", "JE": "Jersey", "GG": "Guernsey", "FO": "Faroe Islands",
    "AX": "Åland Islands", "SJ": "Svalbard and Jan Mayen", "BV": "Bouvet Island", "CC": "Cocos (Keeling) Islands", "CX": "Christmas Island",
    "HM": "Heard Island and McDonald Islands", "NF": "Norfolk Island", "MP": "Northern Mariana Islands", "UM": "United States Minor Outlying Islands", "VI": "U.S. Virgin Islands",
    "AS": "American Samoa", "GU": "Guam", "PR": "Puerto Rico", "AI": "Anguilla", "BM": "Bermuda",
    "KY": "Cayman Islands", "MS": "Montserrat", "TC": "Turks and Caicos Islands", "VG": "British Virgin Islands"
  };

  const getToneDescription = (tone) => {
    if (tone > 5) return 'Very Positive';
    if (tone > 2) return 'Positive';
    if (tone >= -2) return 'Neutral';
    if (tone > -5) return 'Negative';
    return 'Very Negative';
  };

  return (
    <MapContainer center={defaultPosition} zoom={4} style={{ height: '500px', width: '100%', borderRadius: '12px' }}>
      <MapEventHandler onBboxChange={onBboxChange} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {features.map((feature, idx) => {
        const [lon, lat] = feature.geometry.coordinates;
        const properties = feature.properties || {};
        const countryFullName = countryMap[properties.country] || properties.country || 'Unknown';
        const toneDescription = getToneDescription(properties.tone);
        const formattedTime = properties.timestamp ? new Date(properties.timestamp).toLocaleString() : 'Unknown';

        // Create a more descriptive title from available data
        const actor1Name = properties.actor1 || 'Unknown Actor';
        const actor2Name = properties.actor2 || '';
        const eventType = properties.theme || 'Global Event';
        const theme = actor1Name + (actor2Name ? ` vs ${actor2Name}` : '') + ` - ${eventType}`;

        return (
          <Marker key={idx} position={[lat, lon]}>
            <Popup>
              <div style={{ minWidth: 200, padding: '8px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                  {theme}
                </div>
                <div style={{ marginBottom: '4px' }}><strong>Country:</strong> {countryFullName}</div>
                <div style={{ marginBottom: '4px' }}><strong>Tone:</strong> {toneDescription} ({properties.tone})</div>
                <div style={{ marginBottom: '4px' }}><strong>Time:</strong> {formattedTime}</div>
                {properties.actor1 && <div style={{ marginBottom: '4px' }}><strong>Actor 1:</strong> {properties.actor1}</div>}
                {properties.actor2 && <div style={{ marginBottom: '4px' }}><strong>Actor 2:</strong> {properties.actor2}</div>}
                {properties.lang && <div style={{ marginBottom: '4px' }}><strong>Language:</strong> {properties.lang}</div>}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

// Toolbar Component
function Toolbar({ params, setParams, onRefresh }) {
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
      setEmail('');
      setPassword('');
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
            email
          }
        }
      });
      setError('Registration successful! Please check your email to confirm.');
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
                  Welcome, {user.attributes?.name || user.attributes?.email || user.username}
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
function SearchResults({ data }) {
  return (
    <div style={{ background: '#ffffff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#1e293b' }}>Event Results</h3>
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
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '500', fontSize: '12px' }}>Theme</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '500', fontSize: '12px' }}>Source</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s ease', background: '#ffffff' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}>
                <td style={{ padding: '10px 8px', color: '#64748b', fontSize: '12px' }}>{item['@timestamp'] ? new Date(item['@timestamp']).toLocaleDateString() : '-'}</td>
                <td style={{ padding: '10px 8px', fontWeight: '500', fontSize: '12px', color: '#374151' }}>{item.actor1 || '-'}</td>
                <td style={{ padding: '10px 8px' }}>
                  <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '500' }}>{item.country || '-'}</span>
                </td>
                <td style={{ padding: '10px 8px' }}>
                  <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '500' }}>{item.theme || '-'}</span>
                </td>
                <td style={{ padding: '10px 8px', color: '#9ca3af', fontSize: '11px' }}>{item.source_file ? item.source_file.split('/').pop() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!data?.items || data.items.length === 0) && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <div>No events found for the current filters</div>
            <div style={{ fontSize: '12px', marginTop: '8px' }}>Try adjusting your search criteria</div>
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
  const handleMapMove = (bbox) => {
    setParams(prev => ({ ...prev, bbox }));
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="dashboard-container">
      <Toolbar
        params={params}
        setParams={setParams}
        onRefresh={handleRefresh}
      />

      <div className="dashboard-content">
        <div className="main-content">
          <div className="map-container">
            <h3>🌍 Global Event Map</h3>
            {mapLoading && <div className="chart-placeholder">Loading map data...</div>}
            {mapError && <div className="chart-placeholder">Failed to load map data: {mapError.message}</div>}
            {mapData && (
              <Map geojson={mapData} onBboxChange={handleMapMove} loading={mapLoading} />
            )}
          </div>

          <div className="search-results-container">
            <SearchResults data={searchData} />
          </div>
        </div>

        <div className="stats-container">
          <StatsCards data={statsData} />
          <EventTrendChart data={statsData} />
          <CountryDistributionChart data={statsData} searchData={searchData} />
          <ToneAnalysisChart data={statsData} searchData={searchData} />
          <ThemeHeatChart data={statsData} searchData={searchData} />
        </div>
      </div>
    </div>
  );
}

// Main App Component - Direct Access
export default function AppFinal() {
  return <Dashboard />;
}
