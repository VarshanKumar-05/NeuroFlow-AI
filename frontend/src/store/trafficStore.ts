import { create } from 'zustand';

export interface TrafficStats {
  totalVehicles: number;
  activeVehicles?: number;
  vehiclesToday?: number;
  vpm?: number;
  vph?: number;
  totalVehiclesTrend: number;
  avgSpeed: number;
  avgSpeedTrend: number;
  congestionScore: number;
  congestionLevel?: string;
  congestionTrend: number;
  trafficDensity?: string;
  roadOccupancy?: string;
  queueLength?: string;
  activeIncidents: number;
  processingFps?: number;
  detectionFps?: number;
  streamingFps?: number;
  trackerFps?: number;
  avgConfidence?: string;
  modelName?: string;
  trackerName?: string;
  inferenceResolution?: string;
  latency?: string;
  processingLatency?: string;
  cpuUsage?: string;
  gpuUsage?: string;
  memoryUsage?: string;
}

export interface HardwareData {
  cpuUsage: string;
  gpuUsage: string;
  gpuMemory: string;
  ramUsage: string;
  diskUsage?: string;
}

export interface EventItem {
  id: string;
  timestamp: string;
  type: string;
  severity: 'info' | 'warning' | 'critical' | 'low' | 'medium' | 'high';
  camera: string;
  description: string;
}

export interface AIStatusItem {
  name: string;
  status: string;
  detail: string;
}

export interface DetailedHealthItem {
  component: string;
  status: 'healthy' | 'warning' | 'offline';
  latency: string;
  detail: string;
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
  count?: number;
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
  last_frame_time?: string;
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
  hardware: HardwareData;
  events: EventItem[];
  aiStatus: AIStatusItem[];
  detailedSystemHealth: DetailedHealthItem[];
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
  updateHardware: (hardware: HardwareData) => void;
  updateEvents: (events: EventItem[]) => void;
  updateAIStatus: (statusList: AIStatusItem[]) => void;
  updateDetailedSystemHealth: (health: DetailedHealthItem[]) => void;
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
    activeVehicles: 0,
    vehiclesToday: 0,
    vpm: 0,
    vph: 0,
    totalVehiclesTrend: 0,
    avgSpeed: 0,
    avgSpeedTrend: 0,
    congestionScore: 0,
    congestionLevel: "Free Flow",
    congestionTrend: 0,
    trafficDensity: "0 veh/km",
    roadOccupancy: "0.0%",
    queueLength: "0 veh",
    activeIncidents: 0,
    processingFps: 0,
    detectionFps: 0,
    streamingFps: 0,
    trackerFps: 0,
    avgConfidence: "0.0%",
    modelName: "YOLOv11n",
    trackerName: "ByteTrack",
    inferenceResolution: "1280x720",
    latency: "0 ms",
    processingLatency: "0 ms",
    cpuUsage: "0.0%",
    gpuUsage: "0.0%",
    memoryUsage: "0.0%"
  },
  hardware: {
    cpuUsage: "0.0%",
    gpuUsage: "0.0%",
    gpuMemory: "0 MB (0%)",
    ramUsage: "0.0%",
    diskUsage: "0.0%"
  },
  events: [],
  aiStatus: [],
  detailedSystemHealth: [],
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

  updateHardware: (hardware) => set({ hardware }),
  updateEvents: (events) => set({ events }),
  updateAIStatus: (aiStatus) => set({ aiStatus }),
  updateDetailedSystemHealth: (detailedSystemHealth) => set({ detailedSystemHealth }),

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
