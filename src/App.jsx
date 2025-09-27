import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/images/marker-icon-2x.png";
import "leaflet/dist/images/marker-icon.png";
import "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
// Removed authentication imports for simplified version
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

// Removed AWS configuration for simplified version

// Fix Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const API_BASE = "https://8p15o14kp9.execute-api.us-east-1.amazonaws.com/prod";
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

    let isMounted = true;
    setLoading(true);
    setError(null);

    console.log("Fetching URL:", url);
    fetch(url)
      .then(response => {
        console.log("Response status:", response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("API Response:", data);
        if (isMounted) {
          setData(data);
        }
      })
      .catch(err => {
        console.error("Fetch error:", err);
        if (isMounted) {
          setError(err);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [url]);

  return { data, error, loading };
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
    const conditions = [];
    if (searchType && searchValue) conditions.push(`${searchType}:${searchValue}`);
    if (country) conditions.push(`country:${country}`);
    if (actor) conditions.push(`actor:${actor}`);
    return conditions.join(' AND ');
  };

  const handleSearch = () => {
    const query = buildQuery();
    setQ(query);
    setParams(prev => ({ ...prev, gte, lte, bbox, q: query }));
    onRefresh && onRefresh();
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      padding: "24px",
      borderRadius: "0 0 12px 12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      marginBottom: "24px",
      borderBottom: "1px solid #e2e8f0"
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", color: "#334155" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "24px", gap: "16px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "600", margin: 0, color: "#1e293b" }}>
            WorldSense GDELT
          </h1>
          <div style={{ background: "#e2e8f0", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", color: "#64748b" }}>
            Global Event Data Visualization
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "24px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
              Start Date
            </label>
            <input
              type="date"
              value={gte}
              onChange={e => setGte(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                background: "#ffffff",
                color: "#374151",
                outline: "none",
                transition: "border-color 0.2s ease"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
              End Date
            </label>
            <input
              type="date"
              value={lte}
              onChange={e => setLte(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                background: "#ffffff",
                color: "#374151",
                outline: "none",
                transition: "border-color 0.2s ease"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
              Geographic Bounds
            </label>
            <input
              value={bbox}
              onChange={e => setBbox(e.target.value)}
              placeholder="west,south,east,north"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                background: "#ffffff",
                color: "#374151",
                outline: "none",
                transition: "border-color 0.2s ease"
              }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px", marginBottom: "24px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
              Search Type
            </label>
            <select
              value={searchType}
              onChange={e => setSearchType(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                background: "#ffffff",
                color: "#374151",
                outline: "none",
                transition: "border-color 0.2s ease"
              }}
            >
              <option value="theme">Theme</option>
              <option value="actor">Actor</option>
              <option value="country">Country</option>
              <option value="source">Source</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
              Search Value
            </label>
            <input
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              placeholder="e.g., HEALTH, WHO, CN"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                background: "#ffffff",
                color: "#374151",
                outline: "none",
                transition: "border-color 0.2s ease"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
              Country
            </label>
            <input
              value={country}
              onChange={e => setCountry(e.target.value)}
              placeholder="e.g., CN, US, JP"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                background: "#ffffff",
                color: "#374151",
                outline: "none",
                transition: "border-color 0.2s ease"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
              Actor
            </label>
            <input
              value={actor}
              onChange={e => setActor(e.target.value)}
              placeholder="e.g., WHO, GOV, MEDIA"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                background: "#ffffff",
                color: "#374151",
                outline: "none",
                transition: "border-color 0.2s ease"
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", alignItems: "center", justifyContent: "space-between" }}>
          <button
            onClick={handleSearch}
            style={{
              background: "#3b82f6",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(59,130,246,0.2)",
              transition: "all 0.2s ease"
            }}
          >
            Search Events
          </button>
          <div style={{ background: "#f1f5f9", padding: "8px 12px", borderRadius: "6px", fontSize: "12px", color: "#64748b", border: "1px solid #e2e8f0" }}>
            Query: {buildQuery() || "No filters applied"}
          </div>
        </div>
      </div>
    </div>
  );
}

// Map Component
function Map({ geojson, onBboxChange, loading }) {
  const center = [31.23, 121.47];
  const features = (geojson?.features || []).slice(0, 1000);

  return (
    <div style={{ width: "100%", height: "500px", borderRadius: "8px", overflow: "hidden", position: "relative", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
      <MapContainer
        center={center}
        zoom={4}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapMoveHandler onChange={onBboxChange} />
        <FitBoundsButton features={features} />
        <CopyBBoxButton />
        {features.map((feature, index) => {
          const [lng, lat] = feature.geometry.coordinates;
          const properties = feature.properties || {};
          return (
            <Marker key={index} position={[lat, lng]}>
              <Popup>
                <div style={{ minWidth: 250, padding: "12px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
                  {/* 标题 - 使用主题名称作为标题 */}
                  <div style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px", color: "#1f2937", lineHeight: "1.3" }}>
                    {properties.theme_name || properties.theme || "Global News Event"}
                  </div>
                  
                  {/* 关键词 - 显示主题和参与者 */}
                  <div style={{ marginBottom: "8px", padding: "6px", background: "#f3f4f6", borderRadius: "4px" }}>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "2px" }}>Keywords:</div>
                    <div style={{ fontSize: "14px", color: "#374151" }}>
                      {[properties.theme, properties.actor1, properties.actor2].filter(Boolean).join(" • ") || "General Event"}
                    </div>
                  </div>
                  
                  {/* 语调打分 - 重点显示 */}
                  <div style={{ marginBottom: "8px", padding: "8px", background: properties.tone > 0 ? "#dcfce7" : properties.tone < 0 ? "#fee2e2" : "#f3f4f6", borderRadius: "6px", textAlign: "center" }}>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "2px" }}>Sentiment Score</div>
                    <div style={{ fontSize: "20px", fontWeight: "bold", color: properties.tone > 0 ? "#059669" : properties.tone < 0 ? "#dc2626" : "#6b7280" }}>
                      {properties.tone > 0 ? `+${properties.tone}` : properties.tone}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      {properties.tone > 2 ? "Positive" : properties.tone < -2 ? "Negative" : "Neutral"}
                    </div>
                  </div>
                  
                  {/* 其他信息 */}
                  <div style={{ fontSize: "12px", color: "#6b7280", borderTop: "1px solid #e5e7eb", paddingTop: "8px" }}>
                    <div style={{ marginBottom: "2px" }}>
                      <strong>Country:</strong> {properties.country || "Unknown"}
                    </div>
                    <div style={{ marginBottom: "2px" }}>
                      <strong>Time:</strong> {new Date(properties.timestamp).toLocaleString()}
                    </div>
                    {properties.url && (
                      <div style={{ marginBottom: "2px", wordBreak: "break-all" }}>
                        <strong>Source:</strong> <a href={properties.url} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "none" }}>View Article</a>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      {loading && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.9)", borderRadius: "16px" }}>
          <div style={{ background: "linear-gradient(45deg, #667eea, #764ba2)", color: "white", padding: "20px 40px", borderRadius: "20px", fontSize: "16px", fontWeight: "500", boxShadow: "0 4px 20px rgba(102,126,234,0.3)" }}>
            🗺️ Loading map data...
          </div>
        </div>
      )}
    </div>
  );
}

// Map Move Handler
function MapMoveHandler({ onChange }) {
  const map = useMap();
  
  useEffect(() => {
    const handleMove = () => {
      const bounds = map.getBounds();
      const west = bounds.getWest();
      const south = bounds.getSouth();
      const east = bounds.getEast();
      const north = bounds.getNorth();
      onChange && onChange(`${west.toFixed(5)},${south.toFixed(5)},${east.toFixed(5)},${north.toFixed(5)}`);
    };
    
    handleMove();
    map.on("moveend", handleMove);
    return () => map.off("moveend", handleMove);
  }, [map, onChange]);
  
  return null;
}

// Fit Bounds Button
function FitBoundsButton({ features }) {
  const map = useMap();
  
  return (
    <button
      onClick={() => {
        if (!features || features.length === 0) return;
        const bounds = L.latLngBounds(features.map(f => {
          const [lng, lat] = f.geometry.coordinates;
          return [lat, lng];
        }));
        map.fitBounds(bounds, { padding: [20, 20] });
      }}
      style={{
        position: "absolute",
        top: 12,
        left: 12,
        zIndex: 1000,
        padding: "8px 12px",
        background: "#3b82f6",
        color: "#fff",
        borderRadius: "6px",
        border: "none",
        fontSize: "12px",
        fontWeight: "500",
        cursor: "pointer",
        boxShadow: "0 2px 4px rgba(59,130,246,0.2)",
        transition: "all 0.2s ease"
      }}
    >
      Fit Bounds
    </button>
  );
}

// Copy BBox Button
function CopyBBoxButton() {
  const map = useMap();
  
  return (
    <button
      onClick={() => {
        const bounds = map.getBounds();
        const west = bounds.getWest();
        const south = bounds.getSouth();
        const east = bounds.getEast();
        const north = bounds.getNorth();
        const bbox = `${west.toFixed(5)},${south.toFixed(5)},${east.toFixed(5)},${north.toFixed(5)}`;
        
        if (navigator?.clipboard?.writeText) {
          navigator.clipboard.writeText(bbox);
          const button = event.target;
          const originalText = button.textContent;
          button.textContent = "✅ Copied!";
          setTimeout(() => button.textContent = originalText, 2000);
        }
      }}
      style={{
        position: "absolute",
        top: 12,
        left: 120,
        zIndex: 1000,
        padding: "8px 12px",
        background: "#64748b",
        color: "#fff",
        borderRadius: "6px",
        border: "none",
        fontSize: "12px",
        fontWeight: "500",
        cursor: "pointer",
        boxShadow: "0 2px 4px rgba(100,116,139,0.2)",
        transition: "all 0.2s ease"
      }}
    >
      Copy BBox
    </button>
  );
}

// Stats Component
function Stats({ data }) {
  return (
    <div className="stats-container">
      <StatsCards data={data} />
      <EventTrendChart data={data} />
      <CountryDistributionChart data={data} />
      <ToneAnalysisChart data={data} />
      <ThemeHeatChart data={data} />
    </div>
  );
}

// Search Results Component
function SearchResults({ data }) {
  const { items = [], total = 0 } = data || {};

  return (
    <div style={{ background: "#ffffff", borderRadius: "8px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0, color: "#1e293b" }}>
          Event Results
        </h3>
        <div style={{ background: "#3b82f6", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "500" }}>
          Total: {total}
        </div>
      </div>
      
      <div style={{ background: "#f8fafc", borderRadius: "6px", overflow: "hidden", border: "1px solid #e2e8f0", maxHeight: "400px", overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "#f1f5f9", color: "#475569" }}>
              <th style={{ padding: "10px 8px", textAlign: "left", fontWeight: "500", fontSize: "12px" }}>Time</th>
              <th style={{ padding: "10px 8px", textAlign: "left", fontWeight: "500", fontSize: "12px" }}>Actor</th>
              <th style={{ padding: "10px 8px", textAlign: "left", fontWeight: "500", fontSize: "12px" }}>Country</th>
              <th style={{ padding: "10px 8px", textAlign: "left", fontWeight: "500", fontSize: "12px" }}>Theme</th>
              <th style={{ padding: "10px 8px", textAlign: "left", fontWeight: "500", fontSize: "12px" }}>Source</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #e2e8f0", transition: "background-color 0.2s ease", background: "#ffffff" }}>
                <td style={{ padding: "10px 8px", color: "#64748b", fontSize: "12px" }}>
                  {item["@timestamp"] ? new Date(item["@timestamp"]).toLocaleDateString() : "-"}
                </td>
                <td style={{ padding: "10px 8px", fontWeight: "500", fontSize: "12px", color: "#374151" }}>
                  {item.actor1 || "-"}
                </td>
                <td style={{ padding: "10px 8px" }}>
                  <span style={{ background: "#dbeafe", color: "#1e40af", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>
                    {item.country || "-"}
                  </span>
                </td>
                <td style={{ padding: "10px 8px" }}>
                  <span style={{ background: "#f3e8ff", color: "#7c3aed", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>
                    {item.theme || "-"}
                  </span>
                </td>
                <td style={{ padding: "10px 8px", color: "#9ca3af", fontSize: "11px" }}>
                  {item.source_file ? item.source_file.split("/").pop() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {(!items || items.length === 0) && (
          <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
            <div>No events found for the current filters</div>
            <div style={{ fontSize: "12px", marginTop: "8px" }}>Try adjusting your search criteria</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Login Form Component
function LoginForm({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login
        const user = await Auth.signIn(email, password);
        console.log('Login successful:', user);
        onLoginSuccess(user);
      } else {
        // Register
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        const user = await Auth.signUp({
          username: email,
          password,
          attributes: {
            email,
            name
          }
        });
        console.log('Registration successful:', user);
        setError('Registration successful! Please check your email for verification.');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

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
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        width: '400px',
        maxWidth: '90vw'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#333', fontSize: '32px', margin: '0 0 10px 0' }}>
            🌍 WorldSense
          </h1>
          <h2 style={{ color: '#667eea', fontSize: '20px', margin: '0 0 10px 0' }}>
            Global Event Analysis System
          </h2>
          <p style={{ color: '#666', fontSize: '16px', margin: '0' }}>
            Explore global news events and world dynamics
          </p>
        </div>

        <div style={{ display: 'flex', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: isLogin ? '#3b82f6' : '#f1f5f9',
              color: isLogin ? 'white' : '#64748b',
              borderRadius: '8px 0 0 8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: !isLogin ? '#3b82f6' : '#f1f5f9',
              color: !isLogin ? 'white' : '#64748b',
              borderRadius: '0 8px 8px 0',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required={!isLogin}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required={!isLogin}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
              />
            </div>
          )}

          {error && (
            <div style={{ marginBottom: '16px', padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
          <p style={{ color: '#666', fontSize: '14px', margin: '0' }}>
            Test Account: test@worldsense.com / TempPass123!
          </p>
        </div>
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [params, setParams] = useState({
    gte: "2015-02-23",
    lte: "2015-02-25",
    bbox: "70,15,135,55", // Default China region
    q: ""
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  async function checkCurrentUser() {
    try {
        const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.log('Unauthenticated user:', error);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }

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
            <span>Welcome, {currentUser.attributes?.name || currentUser.attributes?.email}</span>
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
                  <Map
                    geojson={mapData}
                    loading={mapLoading}
                    onBboxChange={handleMapMove}
                  />
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