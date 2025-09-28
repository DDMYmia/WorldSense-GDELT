import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/images/marker-icon-2x.png";
import "leaflet/dist/images/marker-icon.png";
import "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import LoginForm from "./components/LoginForm";
import { trackUserActivity, trackSearch, trackMapInteraction } from "./utils/userTracking";
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';
import './styles/amplify-custom.css';
import './styles/auth.css';
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

// Import AWS configuration
import './aws-config';

// Fix Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const API_BASE = "https://82z3xjob1g.execute-api.us-east-1.amazonaws.com/prod";
console.log('API_BASE:', API_BASE);
console.log('App Version: 2.7.0 - Official Release');
console.log('Build Time:', new Date().toISOString());
console.log('Timestamp:', new Date().toISOString());

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
function Map({ data, onMapMove }) {
  const map = useMap();
  
  useEffect(() => {
    const handleMoveEnd = () => {
      const bounds = map.getBounds();
      const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
      onMapMove(bbox);
    };
    
    map.on('moveend', handleMoveEnd);
    return () => map.off('moveend', handleMoveEnd);
  }, [map, onMapMove]);

  if (!data || !data.features) return null;

  return (
    <>
      {data.features.map((feature, index) => {
        const [lng, lat] = feature.geometry.coordinates;
        const props = feature.properties || {};
        
        // Format time display
        const formatTime = (timestamp) => {
          if (!timestamp) return 'N/A';
          try {
            const date = new Date(timestamp);
            return date.toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            });
          } catch (e) {
            return timestamp;
          }
        };

        // Get country full name
        const getCountryName = (countryCode) => {
          const countryMap = {
            'NZ': 'New Zealand', 'AS': 'American Samoa', 'US': 'United States', 'CN': 'China',
            'JP': 'Japan', 'KR': 'South Korea', 'AU': 'Australia', 'GB': 'United Kingdom',
            'FR': 'France', 'DE': 'Germany', 'IT': 'Italy', 'ES': 'Spain',
            'RU': 'Russia', 'IN': 'India', 'BR': 'Brazil', 'CA': 'Canada',
            'BG': 'Bulgaria', 'PK': 'Pakistan', 'CH': 'Switzerland', 'MC': 'Monaco',
            'TH': 'Thailand', 'MY': 'Malaysia', 'SG': 'Singapore', 'ID': 'Indonesia',
            'PH': 'Philippines', 'VN': 'Vietnam', 'MM': 'Myanmar', 'KH': 'Cambodia',
            'LA': 'Laos', 'BN': 'Brunei', 'TL': 'East Timor', 'MN': 'Mongolia',
            'KZ': 'Kazakhstan', 'UZ': 'Uzbekistan', 'KG': 'Kyrgyzstan',
            'TJ': 'Tajikistan', 'TM': 'Turkmenistan', 'AF': 'Afghanistan',
            'BD': 'Bangladesh', 'LK': 'Sri Lanka', 'MV': 'Maldives',
            'NP': 'Nepal', 'BT': 'Bhutan', 'IR': 'Iran', 'IQ': 'Iraq',
            'SY': 'Syria', 'LB': 'Lebanon', 'JO': 'Jordan', 'IL': 'Israel',
            'PS': 'Palestine', 'SA': 'Saudi Arabia', 'AE': 'United Arab Emirates',
            'QA': 'Qatar', 'KW': 'Kuwait', 'BH': 'Bahrain', 'OM': 'Oman',
            'YE': 'Yemen', 'TR': 'Turkey', 'CY': 'Cyprus', 'GR': 'Greece',
            'AL': 'Albania', 'MK': 'North Macedonia', 'RS': 'Serbia',
            'ME': 'Montenegro', 'BA': 'Bosnia and Herzegovina', 'HR': 'Croatia', 'SI': 'Slovenia',
            'SK': 'Slovakia', 'CZ': 'Czech Republic', 'HU': 'Hungary', 'RO': 'Romania',
            'MD': 'Moldova', 'UA': 'Ukraine', 'BY': 'Belarus',
            'LT': 'Lithuania', 'LV': 'Latvia', 'EE': 'Estonia', 'FI': 'Finland',
            'SE': 'Sweden', 'NO': 'Norway', 'DK': 'Denmark', 'IS': 'Iceland',
            'IE': 'Ireland', 'PT': 'Portugal', 'MT': 'Malta', 'LU': 'Luxembourg',
            'BE': 'Belgium', 'NL': 'Netherlands', 'AT': 'Austria',
            'LI': 'Liechtenstein', 'AD': 'Andorra', 'SM': 'San Marino',
            'VA': 'Vatican City', 'PL': 'Poland', 'EG': 'Egypt', 'LY': 'Libya',
            'TN': 'Tunisia', 'DZ': 'Algeria', 'MA': 'Morocco', 'SD': 'Sudan',
            'SS': 'South Sudan', 'ET': 'Ethiopia', 'ER': 'Eritrea', 'DJ': 'Djibouti',
            'SO': 'Somalia', 'KE': 'Kenya', 'UG': 'Uganda', 'TZ': 'Tanzania',
            'RW': 'Rwanda', 'BI': 'Burundi', 'MW': 'Malawi', 'ZM': 'Zambia',
            'ZW': 'Zimbabwe', 'BW': 'Botswana', 'NA': 'Namibia', 'ZA': 'South Africa',
            'LS': 'Lesotho', 'SZ': 'Eswatini', 'MG': 'Madagascar', 'MU': 'Mauritius',
            'SC': 'Seychelles', 'KM': 'Comoros', 'MZ': 'Mozambique', 'AO': 'Angola',
            'CD': 'Democratic Republic of the Congo', 'CG': 'Republic of the Congo', 'CF': 'Central African Republic',
            'TD': 'Chad', 'CM': 'Cameroon', 'GQ': 'Equatorial Guinea', 'GA': 'Gabon',
            'ST': 'São Tomé and Príncipe', 'NG': 'Nigeria', 'NE': 'Niger',
            'BF': 'Burkina Faso', 'ML': 'Mali', 'SN': 'Senegal', 'GM': 'Gambia',
            'GW': 'Guinea-Bissau', 'GN': 'Guinea', 'SL': 'Sierra Leone', 'LR': 'Liberia',
            'CI': 'Ivory Coast', 'GH': 'Ghana', 'TG': 'Togo', 'BJ': 'Benin',
            'MR': 'Mauritania', 'CV': 'Cape Verde', 'AR': 'Argentina', 'BO': 'Bolivia',
            'CL': 'Chile', 'CO': 'Colombia', 'EC': 'Ecuador',
            'FK': 'Falkland Islands', 'GF': 'French Guiana', 'GY': 'Guyana', 'PY': 'Paraguay',
            'PE': 'Peru', 'SR': 'Suriname', 'UY': 'Uruguay', 'VE': 'Venezuela',
            'MX': 'Mexico', 'GT': 'Guatemala', 'BZ': 'Belize', 'SV': 'El Salvador',
            'HN': 'Honduras', 'NI': 'Nicaragua', 'CR': 'Costa Rica', 'PA': 'Panama',
            'CU': 'Cuba', 'JM': 'Jamaica', 'HT': 'Haiti', 'DO': 'Dominican Republic',
            'PR': 'Puerto Rico', 'TT': 'Trinidad and Tobago', 'BB': 'Barbados',
            'LC': 'Saint Lucia', 'VC': 'Saint Vincent and the Grenadines', 'GD': 'Grenada',
            'AG': 'Antigua and Barbuda', 'KN': 'Saint Kitts and Nevis', 'DM': 'Dominica',
            'BS': 'Bahamas', 'GL': 'Greenland'
          };
          return countryMap[countryCode] || countryCode;
        };

        // Get tone description
        const getToneDescription = (tone) => {
          if (tone === null || tone === undefined) return 'N/A';
          const toneValue = parseFloat(tone);
          if (toneValue > 2) return `Positive (${toneValue})`;
          if (toneValue < -2) return `Negative (${toneValue})`;
          return `Neutral (${toneValue})`;
        };

        return (
          <Marker key={index} position={[lat, lng]}>
            <Popup>
              <div style={{ minWidth: '200px', maxWidth: '300px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '16px' }}>
                  {props.theme || props.themes || 'Global News Event'}
                </h4>
                <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  <p style={{ margin: '5px 0' }}>
                    <strong>📍 Country:</strong> {getCountryName(props.country) || 'Unknown'}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>😊 Tone:</strong> {getToneDescription(props.tone)}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>⏰ Time:</strong> {formatTime(props.timestamp)}
                  </p>
                  {props.actor1 && (
                    <p style={{ margin: '5px 0' }}>
                      <strong>👤 Actor 1:</strong> {props.actor1}
                    </p>
                  )}
                  {props.actor2 && (
                    <p style={{ margin: '5px 0' }}>
                      <strong>👤 Actor 2:</strong> {props.actor2}
                    </p>
                  )}
                  {props.lang && (
                    <p style={{ margin: '5px 0' }}>
                      <strong>🌐 Language:</strong> {props.lang}
                    </p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
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

  const handleSearch = () => {
    let searchQuery = '';
    
    if (searchType === 'theme' && searchValue) {
      searchQuery = searchValue;
    } else if (searchType === 'country' && country) {
      searchQuery = `country:${country}`;
    } else if (searchType === 'actor' && actor) {
      searchQuery = `actor:${actor}`;
    }
    
    setParams({
      gte,
      lte,
      bbox,
      q: searchQuery
    });
    onRefresh();
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <label>Time Range:</label>
        <input
          type="date"
          value={gte}
          onChange={(e) => setGte(e.target.value)}
        />
        <span>to</span>
        <input
          type="date"
          value={lte}
          onChange={(e) => setLte(e.target.value)}
        />
      </div>
      
      <div className="toolbar-section">
        <label>Search Type:</label>
        <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
          <option value="theme">Theme</option>
          <option value="country">Country</option>
          <option value="actor">Actor</option>
        </select>
      </div>
      
      <div className="toolbar-section">
        {searchType === 'theme' && (
          <input
            type="text"
            placeholder="Enter search keywords"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        )}
        {searchType === 'country' && (
          <input
            type="text"
            placeholder="Enter country name"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        )}
        {searchType === 'actor' && (
          <input
            type="text"
            placeholder="Enter actor name"
            value={actor}
            onChange={(e) => setActor(e.target.value)}
          />
        )}
        <button onClick={handleSearch}>Search</button>
      </div>
      
      <div className="toolbar-section">
        <button onClick={onRefresh}>Refresh</button>
      </div>
    </div>
  );
}

// Stats Component
function Stats({ data }) {
  if (!data) return <div className="chart-placeholder">Loading...</div>;
  
  return (
    <div className="stats">
      <StatsCards data={data} />
      <div className="charts-grid">
        <EventTrendChart data={data} />
        <CountryDistributionChart data={data} />
        <ToneAnalysisChart data={data} />
        <ThemeHeatChart data={data} />
      </div>
    </div>
  );
}

// Search Results Component
function SearchResults({ data }) {
  if (!data) return <div>Loading...</div>;
  
  return (
    <div className="search-results">
      <h3>Search Results ({data.total || 0})</h3>
      <div className="results-list">
        {data.items?.map((item, index) => (
          <div key={index} className="result-item">
            <h4>{item.theme || 'No Theme'}</h4>
            <p><strong>Country:</strong> {item.country || 'Unknown'}</p>
            <p><strong>Actors:</strong> {item.actor1 || 'N/A'} - {item.actor2 || 'N/A'}</p>
            <p><strong>Tone:</strong> {item.tone || 'N/A'}</p>
            <p><strong>Time:</strong> {item.timestamp || 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main App Component
export default function AppWithAuth() {
  const [params, setParams] = useState({
    gte: "2015-02-23",
    lte: "2015-02-25",
    bbox: "70,15,135,55",
    q: ""
  });
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        console.log('User logged in:', user);
        setCurrentUser(user);
      } catch (error) {
        console.log('User not logged in:', error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    getCurrentUser();
  }, []);

  // If loading, show loading interface
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '15px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{ color: '#333', marginBottom: '20px' }}>🌍 WorldSense</h1>
          <p style={{ color: '#666' }}>Loading...</p>
        </div>
      </div>
    );
  }

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
    
    // Temporarily disable user activity tracking
    // if (currentUser) {
    //   trackSearch(currentUser.attributes.sub, params);
    // }
  };

  // Handle map interaction
  const handleMapInteraction = (type, details) => {
    // Temporarily disable user activity tracking
    // if (currentUser) {
    //   trackMapInteraction(currentUser.attributes.sub, type, details);
    // }
  };

  // If no user, show login interface
  if (!currentUser) {
    return <LoginForm onLoginSuccess={setCurrentUser} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>🌍 WorldSense</h1>
          <div className="user-info">
            <span>Welcome, {currentUser.attributes.name || currentUser.attributes.email}</span>
            <button 
              onClick={async () => {
                    await signOut();
                window.location.reload();
              }} 
              className="sign-out-btn"
            >
              Sign Out
            </button>
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
                {mapError && <div className="chart-placeholder">Map data loading failed: {mapError.message}</div>}
                {mapData && (
                  <MapContainer
                    center={[35, 100]}
                    zoom={4}
                    style={{ height: '500px', width: '100%', borderRadius: '12px' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Map 
                      data={mapData} 
                      onMapMove={handleMapMove}
                    />
                  </MapContainer>
                )}
              </div>
              
              <div className="search-results-container">
                <SearchResults data={searchData} />
              </div>
            </div>
            
            <div className="stats-container">
              <Stats data={statsData} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}