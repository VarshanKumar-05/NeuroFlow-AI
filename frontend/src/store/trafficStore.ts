import { create } from 'zustand';

export interface TrafficStats {
  totalVehicles: number;
  totalVehiclesTrend: number;
  avgSpeed: number;
  avgSpeedTrend: number;
  congestionScore: number;
  congestionTrend: number;
  activeIncidents: number;
}

export interface Incident {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  time: string;
  status: 'active' | 'resolved';
}

export interface VehicleDist {
  name: string;
  value: number;
  color: string;
  icon: string;
}

export interface CameraData {
  id: string;
  name: string;
  fps: number;
  latency: number;
  vehicles: number;
  status: 'online' | 'warning' | 'offline';
  thumb: string;
  type?: string;
  resolution?: string;
}

export interface HealthData {
  label: string;
  value: number;
  color: string;
}

export interface PredictionData {
  congestionForecast: string;
  congestionValue: number;
  confidence: number;
  futureCount: number;
  recommendedAction: string;
}

export interface RecommendationData {
  id: string;
  title: string;
  desc: string;
  impact: string;
  icon: string;
  color: string;
}

interface TrafficState {
  stats: TrafficStats;
  incidents: Incident[];
  vehicleDistribution: VehicleDist[];
  cameras: CameraData[];
  systemHealth: HealthData[];
  predictions: PredictionData | null;
  recommendations: RecommendationData[];
  lastUpdated: string | null;
}

interface TrafficActions {
  updateStats: (stats: Partial<TrafficStats>) => void;
  updateIncidents: (incidents: Incident[]) => void;
  addIncident: (incident: Incident) => void;
  resolveIncident: (id: string) => void;
  updateVehicleDistribution: (dist: VehicleDist[]) => void;
  updateCameras: (cams: CameraData[]) => void;
  updateSystemHealth: (health: HealthData[]) => void;
  updatePredictions: (pred: PredictionData) => void;
  updateRecommendations: (recs: RecommendationData[]) => void;
}

export const useTrafficStore = create<TrafficState & TrafficActions>((set) => ({
  stats: {
    totalVehicles: 0,
    totalVehiclesTrend: 0,
    avgSpeed: 0,
    avgSpeedTrend: 0,
    congestionScore: 0,
    congestionTrend: 0,
    activeIncidents: 0
  },
  incidents: [],
  vehicleDistribution: [],
  cameras: [],
  systemHealth: [],
  predictions: null,
  recommendations: [],
  lastUpdated: null,

  updateStats: (newStats) => set((state) => ({
    stats: { ...state.stats, ...newStats },
    lastUpdated: new Date().toISOString()
  })),

  updateIncidents: (incidents) => set({ 
    incidents,
    lastUpdated: new Date().toISOString()
  }),

  addIncident: (incident) => set((state) => {
    const updatedIncidents = [incident, ...state.incidents].slice(0, 10);
    return {
      incidents: updatedIncidents,
      stats: { ...state.stats, activeIncidents: updatedIncidents.filter(i => i.status === 'active').length },
      lastUpdated: new Date().toISOString()
    };
  }),

  resolveIncident: (id) => set((state) => {
    const updatedIncidents = state.incidents.map(inc => 
      inc.id === id ? { ...inc, status: 'resolved' as const } : inc
    );
    return {
      incidents: updatedIncidents,
      stats: { ...state.stats, activeIncidents: updatedIncidents.filter(i => i.status === 'active').length },
      lastUpdated: new Date().toISOString()
    };
  }),

  updateVehicleDistribution: (dist) => set({ vehicleDistribution: dist }),
  updateCameras: (cams) => set({ cameras: cams }),
  updateSystemHealth: (health) => set({ systemHealth: health }),
  updatePredictions: (pred) => set({ predictions: pred }),
  updateRecommendations: (recs) => set({ recommendations: recs }),
}));
