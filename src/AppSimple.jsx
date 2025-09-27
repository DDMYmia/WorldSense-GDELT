import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/images/marker-icon-2x.png";
import "leaflet/dist/images/marker-icon.png";
import "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import './styles/charts.css';
import './styles/layout.css';

// Import chart components
import {
  EventTrendChart,
  CountryDistributionChart,
  ToneAnalysisChart,
  ThemeHeatChart,
  StatsCards
} from './components/Charts';

// Fix Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const API_BASE = "https://8p15o14kp9.execute-api.us-east-1.amazonaws.com";
console.log('API_BASE:', API_BASE);
console.log('App Version: 2.8.0 - Simplified Version');
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

// Map Component
function Map({ geojson, onBboxChange, loading }) {
  const map = useMap();
  const defaultPosition = [31.23, 121.47]; // Centered around China
  const features = (geojson?.features || []).slice(0, 1000); // Limit markers for performance

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
    "ET": "Ethiopia", "KE": "Kenya", "TZ": "Tanzania", "UG": "Uganda", "CD": "DR Congo",
    "SD": "Sudan", "DZ": "Algeria", "MA": "Morocco", "LY": "Libya", "IQ": "Iraq",
    "SY": "Syria", "YE": "Yemen", "AF": "Afghanistan", "MM": "Myanmar", "LK": "Sri Lanka",
    "NP": "Nepal", "KZ": "Kazakhstan", "UZ": "Uzbekistan", "AZ": "Azerbaijan", "GE": "Georgia",
    "AM": "Armenia", "BY": "Belarus", "RO": "Romania", "HU": "Hungary", "CZ": "Czech Republic",
    "SK": "Slovakia", "BG": "Bulgaria", "RS": "Serbia", "HR": "Croatia", "BA": "Bosnia and Herzegovina",
    "AL": "Albania", "MK": "North Macedonia", "SI": "Slovenia", "LT": "Lithuania", "LV": "Latvia",
    "EE": "Estonia", "IS": "Iceland", "CY": "Cyprus", "MT": "Malta", "LU": "Luxembourg",
    "AD": "Andorra", "MC": "Monaco", "SM": "San Marino", "VA": "Vatican City", "LI": "Liechtenstein",
    "XK": "Kosovo", "PS": "Palestine", "TW": "Taiwan", "HK": "Hong Kong", "MO": "Macau",
    "CU": "Cuba", "HT": "Haiti", "DO": "Dominican Republic", "JM": "Jamaica", "TT": "Trinidad and Tobago",
    "BS": "Bahamas", "BB": "Barbados", "LC": "Saint Lucia", "GD": "Grenada", "VC": "Saint Vincent and the Grenadines",
    "DM": "Dominica", "AG": "Antigua and Barbuda", "KN": "Saint Kitts and Nevis", "BZ": "Belize", "GT": "Guatemala",
    "SV": "El Salvador", "HN": "Honduras", "NI": "Nicaragua", "CR": "Costa Rica", "PA": "Panama",
    "EC": "Ecuador", "BO": "Bolivia", "PY": "Paraguay", "UY": "Uruguay", "GY": "Guyana",
    "SR": "Suriname", "GF": "French Guiana", "FK": "Falkland Islands", "GS": "South Georgia and the South Sandwich Islands",
    "AQ": "Antarctica", "GL": "Greenland", "PM": "Saint Pierre and Miquelon", "WF": "Wallis and Futuna", "NC": "New Caledonia",
    "VU": "Vanuatu", "SB": "Solomon Islands", "PG": "Papua New Guinea", "FM": "Federated States of Micronesia", "MH": "Marshall Islands",
    "KI": "Kiribati", "NR": "Nauru", "TV": "Tuvalu", "WS": "Samoa", "TO": "Tonga",
    "FJ": "Fiji", "PW": "Palau", "TL": "Timor-Leste", "BN": "Brunei", "LA": "Laos",
    "KH": "Cambodia", "MV": "Maldives", "BT": "Bhutan", "NP": "Nepal", "KG": "Kyrgyzstan",
    "TJ": "Tajikistan", "TM": "Turkmenistan", "ER": "Eritrea", "DJ": "Djibouti", "SO": "Somalia",
    "SS": "South Sudan", "CF": "Central African Republic", "CM": "Cameroon", "GA": "Gabon", "CG": "Republic of the Congo",
    "AO": "Angola", "ZM": "Zambia", "ZW": "Zimbabwe", "MW": "Malawi", "MZ": "Mozambique",
    "BW": "Botswana", "NA": "Namibia", "LS": "Lesotho", "SZ": "Eswatini", "MG": "Madagascar",
    "KM": "Comoros", "SC": "Seychelles", "MU": "Mauritius", "CV": "Cape Verde", "ST": "Sao Tome and Principe",
    "GW": "Guinea-Bissau", "GM": "Gambia", "SN": "Senegal", "MR": "Mauritania", "ML": "Mali",
    "BF": "Burkina Faso", "NE": "Niger", "TD": "Chad", "BI": "Burundi", "RW": "Rwanda",
    "SL": "Sierra Leone", "LR": "Liberia", "CI": "Ivory Coast", "GH": "Ghana", "TG": "Togo",
    "BJ": "Benin", "GQ": "Equatorial Guinea", "CD": "Democratic Republic of the Congo", "RE": "Réunion", "YT": "Mayotte",
    "SH": "Saint Helena", "FK": "Falkland Islands", "PN": "Pitcairn Islands", "TK": "Tokelau", "NU": "Niue",
    "CK": "Cook Islands", "WF": "Wallis and Futuna", "TV": "Tuvalu", "KI": "Kiribati", "NR": "Nauru",
    "SM": "San Marino", "VA": "Vatican City", "LI": "Liechtenstein", "MC": "Monaco", "AD": "Andorra",
    "GI": "Gibraltar", "IM": "Isle of Man", "JE": "Jersey", "GG": "Guernsey", "FO": "Faroe Islands",
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
    <MapContainer center={defaultPosition} zoom={4} style={{ height: '100%', width: '100%', borderRadius: '12px' }}>
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
        const theme = properties.theme || 'Global News Event';

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

  useEffect(() => {
    if (params.gte !== gte) setGte(params.gte);
    if (params.lte !== lte) setLte(params.lte);
    if (params.bbox !== bbox) setBbox(params.bbox);
    if (params.q !== q) setQ(params.q);
  }, [params.gte, params.lte, params.bbox, params.q]);

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
      <div style={{ maxWidth: '1400px', margin: '0 auto', color: '#334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', margin: 0, color: '#1e293b' }}>🌍 WorldSense GDELT</h1>
          <div style={{ background: '#e2e8f0', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', color: '#64748b' }}>Global Event Data Visualization</div>
        </div>

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

// Main App Component
export default function AppSimple() {
  const [params, setParams] = useState({
    gte: "2015-02-23",
    lte: "2015-02-25",
    bbox: "70,15,135,55", // Default to China region
    q: ""
  });
  const [refreshKey, setRefreshKey] = useState(0); // Used to force data refresh

  // Build API URLs
  const mapUrl = useMemo(() => {
    const url = new URL(`${API_BASE}/map`);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    url.searchParams.set('size', '500');
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
    url.searchParams.set('size', '10');
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
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>🌍 WorldSense</h1>
          <div className="user-info">
            <span>Global Event Analysis System</span>
          </div>
        </div>
      </header>
      <main className="app-main">
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
              <CountryDistributionChart data={statsData} />
              <ToneAnalysisChart data={statsData} />
              <ThemeHeatChart data={statsData} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
