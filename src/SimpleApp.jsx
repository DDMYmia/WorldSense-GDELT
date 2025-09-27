import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const API_BASE = "https://8p15o14kp9.execute-api.us-east-1.amazonaws.com";

console.log('App Version: 2.7.0 - Complete Frontend with Login');
console.log('Build Time:', new Date().toISOString());

// Simple Login Component
function LoginForm({ onLogin }) {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple authentication simulation
    if (email && password) {
      onLogin({ email, name: email.split('@')[0] });
    }
  };

  if (!showLogin) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        zIndex: 1000,
        padding: '20px'
      }}>
        <button
          onClick={() => setShowLogin(true)}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Login / Register
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '15px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '400px',
        maxWidth: '90vw'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
          🌍 WorldSense Login
        </h2>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="test@worldsense.com"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="TempPass123!"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
              }}
              required
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setShowLogin(false)}
              style={{
                flex: 1,
                background: '#f1f5f9',
                color: '#64748b',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#666' }}>
          Demo: test@worldsense.com / TempPass123!
        </div>
      </div>
    </div>
  );
}

// Stats Cards Component
function StatsCards({ data }) {
  if (!data || !data.series) return null;
  
  const totalEvents = data.series.reduce((sum, item) => sum + (item.count || 0), 0);
  const avgEvents = Math.round(totalEvents / data.series.length);
  const maxEvents = Math.max(...data.series.map(item => item.count || 0));
  
  const stats = [
    { title: 'Total Events', value: totalEvents, icon: '📊', color: '#667eea' },
    { title: 'Daily Average', value: avgEvents, icon: '📈', color: '#764ba2' },
    { title: 'Peak Day', value: maxEvents, icon: '🔥', color: '#f093fb' }
  ];
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '20px'
    }}>
      {stats.map((stat, index) => (
        <div key={index} style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderLeft: `4px solid ${stat.color}`,
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{ fontSize: '30px' }}>{stat.icon}</div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
              {stat.value.toLocaleString()}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>{stat.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Simple Chart Component
function EventChart({ data }) {
  if (!data || !data.series || data.series.length === 0) {
    return (
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📈 Daily Event Trend</h3>
        <div style={{ color: '#666' }}>No chart data available</div>
      </div>
    );
  }
  
  const maxValue = Math.max(...data.series.map(item => item.count || 0));
  
  return (
    <div style={{
      background: 'white',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📈 Daily Event Trend</h3>
      <div style={{ display: 'flex', alignItems: 'end', gap: '8px', height: '200px' }}>
        {data.series.map((item, index) => {
          const height = ((item.count || 0) / maxValue) * 160;
          return (
            <div key={index} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1
            }}>
              <div style={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                width: '100%',
                height: `${height}px`,
                borderRadius: '4px 4px 0 0',
                marginBottom: '8px',
                transition: 'all 0.3s ease'
              }} />
              <div style={{ 
                fontSize: '12px', 
                color: '#666',
                transform: 'rotate(-45deg)',
                whiteSpace: 'nowrap',
                marginTop: '5px'
              }}>
                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>
                {item.count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Custom hook for data fetching
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
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}

// Map movement handler
function MapMoveHandler({ onChange }) {
  const map = useMap();
  
  useEffect(() => {
    const handleMove = () => {
      const bounds = map.getBounds();
      const bbox = `${bounds.getWest().toFixed(5)},${bounds.getSouth().toFixed(5)},${bounds.getEast().toFixed(5)},${bounds.getNorth().toFixed(5)}`;
      onChange && onChange(bbox);
    };
    
    map.on("moveend", handleMove);
    return () => map.off("moveend", handleMove);
  }, [map, onChange]);
  
  return null;
}

// Main App Component
export default function SimpleApp() {
  const [user, setUser] = useState(null);
  const [params, setParams] = useState({
    gte: "2015-02-23",
    lte: "2015-02-25",
    bbox: "70,15,135,55"
  });

  // Build URLs
  const mapUrl = useMemo(() => {
    const url = new URL(`${API_BASE}/map`);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    url.searchParams.set('size', '500');
    return url.toString();
  }, [params]);

  const statsUrl = useMemo(() => {
    const url = new URL(`${API_BASE}/stats`);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    return url.toString();
  }, [params]);

  const searchUrl = useMemo(() => {
    const url = new URL(`${API_BASE}/search`);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    url.searchParams.set('size', '10');
    return url.toString();
  }, [params]);

  // Fetch data
  const { data: mapData, loading: mapLoading } = useFetch(mapUrl);
  const { data: statsData } = useFetch(statsUrl);
  const { data: searchData } = useFetch(searchUrl);

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px 0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
                🌍 WorldSense GDELT
              </h1>
              <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
                Global Event Data Visualization & Analysis
              </p>
            </div>
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span>Welcome, {user.name}!</span>
                <button
                  onClick={() => setUser(null)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Login Overlay */}
      {!user && <LoginForm onLogin={setUser} />}

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        {/* Date Controls */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📅 Date Range</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Start Date</label>
              <input
                type="date"
                value={params.gte}
                onChange={e => setParams(prev => ({ ...prev, gte: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>End Date</label>
              <input
                type="date"
                value={params.lte}
                onChange={e => setParams(prev => ({ ...prev, lte: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards data={statsData} />

        {/* Chart */}
        <EventChart data={statsData} />

        {/* Map and Results */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'start' }}>
          {/* Map */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>🗺️ Global Event Map</h3>
            <div style={{ height: '500px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
              {mapLoading && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(255,255,255,0.9)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1000
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
                    <div>Loading map data...</div>
                  </div>
                </div>
              )}
              <MapContainer
                center={[35, 100]}
                zoom={4}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <MapMoveHandler onChange={(bbox) => setParams(prev => ({ ...prev, bbox }))} />
                {mapData?.features?.slice(0, 500).map((feature, index) => {
                  const [lng, lat] = feature.geometry.coordinates;
                  const props = feature.properties || {};
                  return (
                    <Marker key={index} position={[lat, lng]}>
                      <Popup>
                        <div style={{ minWidth: 200, padding: '10px' }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                            {props.actor1 || 'Unknown Actor'}
                          </div>
                          <div><strong>Country:</strong> {props.country || 'N/A'}</div>
                          <div><strong>Tone:</strong> {props.tone || 'N/A'}</div>
                          <div><strong>Time:</strong> {props.timestamp || 'N/A'}</div>
                          <div><strong>Theme:</strong> {props.theme || 'N/A'}</div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>

          {/* Search Results */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
              🔍 Recent Events ({searchData?.total || 0})
            </h3>
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {searchData?.items?.slice(0, 10).map((item, index) => (
                <div key={index} style={{
                  padding: '15px',
                  borderBottom: '1px solid #f0f0f0',
                  marginBottom: '10px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
                    {item.actor1 || 'Unknown'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                    {item.country || 'N/A'} • {item.theme || 'No theme'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#999' }}>
                    {item['@timestamp'] ? new Date(item['@timestamp']).toLocaleDateString() : 'No date'}
                  </div>
                </div>
              )) || (
                <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔍</div>
                  <div>No events found</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

