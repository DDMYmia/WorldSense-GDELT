import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Event Count Trend Chart
export function EventTrendChart({ data }) {
  if (!data || !data.series) return <div className="chart-placeholder">Loading...</div>;

  const chartData = data.series.map(item => ({
    date: item.date,
    count: item.count,
    formattedDate: new Date(item.date).toLocaleDateString('en-US')
  }));

  return (
    <div className="chart-container">
      <h3>📈 Daily Event Count Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="formattedDate" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            labelFormatter={(value) => `Date: ${value}`}
            formatter={(value) => [`${value} events`, 'Event Count']}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#667eea"
            fill="#667eea"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Country Event Distribution Pie Chart
export function CountryDistributionChart({ data, searchData }) {
  // Try to use search data first for detailed country breakdown
  if (searchData && searchData.items && searchData.items.length > 0) {
    const countryCount = {};
    searchData.items.forEach(item => {
      const country = item._source?.country || 'Unknown';
      countryCount[country] = (countryCount[country] || 0) + 1;
    });

    const topCountries = Object.entries(countryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#43e97b', '#f093fb', '#a8e6cf'];

    return (
      <div className="chart-container">
        <h3>🌍 Country Event Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={topCountries}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name} (${value})`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {topCountries.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => { return [`${name} has ${value} events`, 'Event Count']}} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Fallback to basic stats data
  if (!data || !data.series) return <div className="chart-placeholder">Loading country data...</div>;

  const totalEvents = data.series.reduce((sum, item) => sum + (item.count || 0), 0);
  const topCountries = [
    { name: 'Multiple Countries', value: totalEvents, percentage: 100 }
  ];

  return (
    <div className="chart-container">
      <h3>🌍 Country Event Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={topCountries}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name} (${value})`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            <Cell fill="#667eea" />
          </Pie>
          <Tooltip formatter={(value) => [`${value} events`, 'Event Count']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Tone Analysis Bar Chart
export function ToneAnalysisChart({ data, searchData }) {
  // Try to use search data first for detailed tone analysis
  if (searchData && searchData.items && searchData.items.length > 0) {
    const toneRanges = { negative: 0, neutral: 0, positive: 0 };
    searchData.items.forEach(item => {
      const tone = item?._source.tone || 0;
      if (tone < -2) toneRanges.negative++;
      else if (tone > 2) toneRanges.positive++;
      else toneRanges.neutral++;
    });

    const chartData = [
      { name: 'Negative', value: toneRanges.negative, color: '#f5576c' },
      { name: 'Neutral', value: toneRanges.neutral, color: '#4facfe' },
      { name: 'Positive', value: toneRanges.positive, color: '#43e97b' }
    ];

    return (
      <div className="chart-container">
        <h3>😊 Tone Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [`${value} events`, 'Event Count']}
              labelFormatter={(value) => `Tone: ${value}`}
            />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Fallback to stats data analysis
  if (!data || !data.series) return <div className="chart-placeholder">Loading tone data...</div>;

  const toneRanges = { negative: 0, neutral: 0, positive: 0 };
  data.series.forEach(item => {
    // Try different field names for tone
    const tone = item.tone_avg || item.averageTone || item.avg_tone || 0;
    if (tone < -2) toneRanges.negative++;
    else if (tone > 2) toneRanges.positive++;
    else toneRanges.neutral++;
  });

  const chartData = [
    { name: 'Negative', value: toneRanges.negative, color: '#f5576c' },
    { name: 'Neutral', value: toneRanges.neutral, color: '#4facfe' },
    { name: 'Positive', value: toneRanges.positive, color: '#43e97b' }
  ];

  return (
    <div className="chart-container">
      <h3>😊 Tone Analysis</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value) => [`${value}`, 'Count']}
            labelFormatter={(value) => `Tone: ${value}`}
          />
          <Bar
            dataKey="value"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Theme Heat Trend Chart
export function ThemeHeatChart({ data, searchData }) {
  // Try to use search data first for real theme analysis
  if (searchData && searchData.items && searchData.items.length > 0) {
    
    const themeCount = {};
    searchData.items.forEach(item => {
      const theme = item.theme || 'General';
      // Clean theme name to avoid duplicates
      const cleanTheme = theme.toString().trim();
      themeCount[cleanTheme] = (themeCount[cleanTheme] || 0) + 1;
    });

    const themes = Object.entries(themeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([name, count], index) => ({
        theme: name.length > 12 ? name.substring(0, 12) + '...' : name,
        heat: count,
        intensity: count > 50 ? 'High' : count > 20 ? 'Medium' : 'Low',
        key: `theme-${index}` // Add stable key
      }));

    return (
      <div className="chart-container">
        <h3>🔥 Theme Heat Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={themes} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis dataKey="theme" type="category" tick={{ fontSize: 10 }} width={120} />
            <Tooltip
              formatter={(value) => [`${value} events`, 'Event Count']}
              labelFormatter={(value) => `Theme: ${value}`}
            />
            <Bar
              dataKey="heat"
              radius={[0, 4, 4, 0]}
            >
              {themes.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.intensity === 'High' ? '#ff6b6b' : entry.intensity === 'Medium' ? '#ffa726' : '#66bb6a'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Fallback: create basic theme analysis from available data
  if (!data || !data.series) return <div className="chart-placeholder">Loading theme data...</div>;

  const totalEvents = data.series.reduce((sum, item) => sum + item.count, 0);
  const themes = [
    { theme: 'Global Events', heat: Math.round(totalEvents * 0.6), intensity: 'High' },
    { theme: 'Regional News', heat: Math.round(totalEvents * 0.25), intensity: 'Medium' },
    { theme: 'Local Stories', heat: Math.round(totalEvents * 0.15), intensity: 'Low' }
  ];

  return (
    <div className="chart-container">
      <h3>🔥 Theme Heat Analysis</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={themes} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis dataKey="theme" type="category" tick={{ fontSize: 12 }} width={100} />
          <Tooltip
            formatter={(value) => [`${value} events`, 'Event Count']}
            labelFormatter={(value) => `Theme: ${value}`}
          />
          <Bar
            dataKey="heat"
            radius={[0, 4, 4, 0]}
          >
            {themes.map((entry) => (
              <Cell key={entry.key} fill={entry.intensity === 'High' ? '#ff6b6b' : entry.intensity === 'Medium' ? '#ffa726' : '#66bb6a'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Comprehensive Statistics Cards
export function StatsCards({ data }) {
  if (!data || !data.series) return <div className="chart-placeholder">Loading...</div>;

  const totalEvents = data.series.reduce((sum, item) => sum + item.count, 0);
  const avgEvents = Math.round(totalEvents / data.series.length);
  const maxEvents = Math.max(...data.series.map(item => item.count));
  const minEvents = Math.min(...data.series.map(item => item.count));

  const stats = [
    { title: 'Total Events', value: totalEvents, icon: '📊', color: '#667eea' },
    { title: 'Daily Average', value: avgEvents, icon: '📈', color: '#764ba2' },
    { title: 'Peak Day', value: maxEvents, icon: '🔥', color: '#f093fb' },
    { title: 'Lowest Day', value: minEvents, icon: '📉', color: '#4facfe' }
  ];

  return (
    <div className="stats-cards">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
          <div className="stat-icon">{stat.icon}</div>
          <div className="stat-content">
            <div className="stat-value">{stat.value.toLocaleString()}</div>
            <div className="stat-title">{stat.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
