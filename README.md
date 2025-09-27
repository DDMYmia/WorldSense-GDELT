# WorldSense GDELT Dashboard

A React-based frontend application for visualizing GDELT global news events and sentiment analysis, featuring interactive maps and comprehensive data exploration.

## Tech Stack

- **React 18.2.0** - Modern UI framework with hooks and functional components
- **Vite 5.0.8** - Fast build tool with hot module replacement
- **Leaflet 1.9.4 + react-leaflet 4.2.1** - Interactive mapping with clustering support
- **Recharts 2.9.3** - Declarative charting library for data visualization
- **AWS Amplify 6.0.16** - Authentication and backend service integration
- **TypeScript** - Type-safe development with IntelliSense support
- **ESLint** - Code quality and consistency enforcement

## Architecture Design

### Component Architecture
- **Modular Design**: Separate concerns with dedicated API, components, hooks, and utilities
- **Custom Hooks**: Encapsulated data fetching and state management logic
- **Responsive Layout**: Adaptive design supporting desktop and mobile devices
- **Authentication Flow**: AWS Amplify integration for secure user access

### Data Flow
- **Real-time Updates**: Debounced API calls triggered by map interactions and filter changes
- **State Management**: React state with useMemo for optimized re-renders
- **Error Handling**: Comprehensive error boundaries and loading states
- **Performance Optimization**: Request deduplication and intelligent caching

### User Experience
- **Interactive Map**: Pan, zoom, and bounding box selection with marker clustering
- **Multi-dimensional Views**: Map visualization, time-series charts, and tabular search results
- **Advanced Filtering**: Date ranges, geographic bounds, and thematic search capabilities

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn package manager

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

## API Integration

The application consumes data from three primary endpoints:
- `/map` - GeoJSON features for spatial event visualization
- `/stats` - Time-series data for trend analysis and metrics
- `/search` - Filtered event listings with pagination support

## Deployment

The `dist/` folder contains optimized static assets ready for deployment to any web server or CDN. The application is configured as a single-page application with proper routing fallbacks.


