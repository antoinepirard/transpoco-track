# Transpoco Track

A modern fleet tracking application built with the golden-path stack for 2025. Track your vehicle fleet in real-time on interactive maps with smooth animations and live updates.

## 🚀 Tech Stack

### Core Frontend

- **Next.js 14** with App Router and TypeScript
- **Tailwind CSS** for styling
- **TanStack Query** for server state management
- **Zustand** for UI state management

### Mapping & Visualization

- **MapLibre GL JS** for WebGL-based basemap rendering
- **deck.gl** for high-performance vehicle overlays
- **MapTiler** vector tiles integration

### Real-time Communication

- **Native WebSocket** client with Web Workers
- **Ably** integration ready (with fallback)
- Efficient diff-based updates

## 🏗️ Architecture

This application follows the recommended 2025 architecture for fleet tracking:

- **Basemap & Renderer**: MapLibre GL JS + vector tiles (MapTiler)
- **High-volume Overlays**: deck.gl (IconLayer for vehicles, PathLayer for trails)
- **Frontend App**: React + TypeScript, Next.js, TanStack Query, Zustand
- **Realtime Transport**: WebSockets via Web Workers
- **State Management**: Zustand for UI state, TanStack Query for server cache

## 🚗 Features

- **Real-time Vehicle Tracking**: Live position updates with smooth interpolation
- **Interactive Maps**: WebGL-powered maps with zoom, pan, and rotation
- **Map Layer Controls**: Toggle traffic, locations (POI), routes, and heatmap overlays
- **Vehicle Trails**: Historical path visualization
- **Fleet Dashboard**: Vehicle status, speed, and driver information
- **Responsive Design**: Works on desktop and mobile devices
- **Performance Optimized**: GPU-accelerated rendering for thousands of vehicles

### Map Features

- **Traffic Layer**: Real-time traffic conditions with color-coded congestion levels
- **Locations Layer**: Points of interest including restaurants, fuel stations, hospitals, and shops
- **Routes Layer**: Navigation routes with primary and secondary route visualization
- **Heatmap Layer**: Vehicle activity density visualization with dynamic zoom-based rendering

## 📦 Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your API keys:
   - `NEXT_PUBLIC_MAPTILER_API_KEY`: Get from [MapTiler](https://www.maptiler.com/)
   - `NEXT_PUBLIC_ABLY_API_KEY`: Get from [Ably](https://ably.com/) (optional)

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Map Styles

The application supports multiple map styles. Edit `src/lib/maplibre/config.ts`:

```typescript
export const MAP_STYLES = {
  streets: 'https://api.maptiler.com/maps/streets-v2/style.json',
  satellite: 'https://api.maptiler.com/maps/satellite/style.json',
  hybrid: 'https://api.maptiler.com/maps/hybrid/style.json',
  // Add more styles...
};
```

### WebSocket Configuration

Configure your WebSocket server in `src/components/fleet/FleetMap.tsx`:

```typescript
<FleetMap
  organizationId="your-org-id"
  websocketUrl="wss://your-websocket-server.com"
  apiKey={process.env.NEXT_PUBLIC_MAPTILER_API_KEY}
/>
```

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/
│   ├── map/            # MapLibre + deck.gl components
│   ├── fleet/          # Vehicle-specific UI components
│   └── ui/             # Reusable UI components
├── lib/
│   ├── maplibre/       # Map configuration and utilities
│   ├── deckgl/         # deck.gl layer definitions
│   ├── websocket/      # WebSocket client implementation
│   └── workers/        # Web Workers for background processing
├── hooks/              # Custom React hooks
├── stores/             # Zustand state stores
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🔌 WebSocket Message Format

The application expects WebSocket messages in this format:

```typescript
interface WebSocketMessage {
  type: 'vehicle_update' | 'bulk_update' | 'geofence_alert';
  organizationId: string;
  data: VehicleUpdate | VehicleUpdate[] | GeofenceAlert;
}

interface VehicleUpdate {
  type: 'position' | 'status' | 'metadata';
  vehicleId: string;
  timestamp: Date;
  data: {
    latitude?: number;
    longitude?: number;
    speed?: number;
    heading?: number;
    // ... other vehicle properties
  };
}
```

## 🎯 Performance Features

- **GPU Rendering**: All vehicle markers rendered using WebGL
- **Web Workers**: Message parsing and data processing off main thread
- **Differential Updates**: Only changed vehicles are updated
- **Memory Efficient**: Automatic cleanup of old trail data
- **Responsive**: 60fps rendering even with thousands of vehicles

## 🔄 State Management

The application uses Zustand for state management:

- **Fleet Store** (`src/stores/fleet.ts`): Manages vehicles, trails, and selection
- **Real-time Updates**: WebSocket messages automatically update the store
- **Persistence**: Selected vehicle and viewport state preserved

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

### Docker

```bash
docker build -t transpoco-track .
docker run -p 3000:3000 transpoco-track
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with the golden-path stack recommendations for 2025
- MapLibre GL JS for excellent WebGL mapping
- deck.gl for high-performance data visualization
- Next.js team for the amazing React framework
