// ==========================================
// NeuroFlow AI — TypeScript Type Definitions
// ==========================================

// ---- Auth Types ----
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type Role = 'admin' | 'operator' | 'viewer' | 'analyst';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

// ---- Camera Types ----
export interface Camera {
  id: string;
  name: string;
  location: string;
  stream_url: string;
  latitude: number;
  longitude: number;
  status: 'online' | 'offline' | 'maintenance';
  fps: number;
  resolution: string;
  zone_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CameraCreate {
  name: string;
  location: string;
  stream_url: string;
  latitude: number;
  longitude: number;
  resolution?: string;
  zone_id?: string;
}

export interface CameraUpdate {
  name?: string;
  location?: string;
  stream_url?: string;
  latitude?: number;
  longitude?: number;
  status?: Camera['status'];
  resolution?: string;
  zone_id?: string;
}

// ---- Vehicle Types ----
export interface Vehicle {
  id: string;
  plate_number: string;
  vehicle_type: VehicleType;
  color?: string;
  first_seen: string;
  last_seen: string;
  detection_count: number;
}

export type VehicleType = 'car' | 'truck' | 'bus' | 'motorcycle' | 'bicycle' | 'pedestrian' | 'unknown';

export interface VehicleDetail extends Vehicle {
  detections: Detection[];
  average_speed: number;
  cameras_seen: string[];
}

// ---- Detection Types ----
export interface Detection {
  id: string;
  camera_id: string;
  vehicle_id?: string;
  vehicle_type: VehicleType;
  confidence: number;
  bbox: BoundingBox;
  speed?: number;
  direction?: string;
  lane?: number;
  timestamp: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ---- Traffic Types ----
export interface TrafficMetric {
  camera_id: string;
  camera_name: string;
  vehicle_count: number;
  average_speed: number;
  congestion_level: CongestionLevel;
  congestion_score: number;
  lane_occupancy: Record<string, number>;
  flow_rate: number;
  timestamp: string;
}

export type CongestionLevel = 'free_flow' | 'light' | 'moderate' | 'heavy' | 'gridlock';

export interface TrafficSummary {
  total_vehicles: number;
  average_speed: number;
  overall_congestion: CongestionLevel;
  congestion_score: number;
  active_cameras: number;
  total_cameras: number;
  incidents_count: number;
  peak_hour: string;
  busiest_camera: string;
  period_start: string;
  period_end: string;
}

// ---- Incident Types ----
export interface Incident {
  id: string;
  type: IncidentType;
  severity: Severity;
  status: IncidentStatus;
  title: string;
  description: string;
  camera_id: string;
  camera_name: string;
  location: string;
  assigned_to?: string;
  detected_at: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export type IncidentType = 'accident' | 'congestion' | 'wrong_way' | 'stopped_vehicle' | 'debris' | 'pedestrian' | 'illegal_parking' | 'speeding' | 'other';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type IncidentStatus = 'detected' | 'acknowledged' | 'investigating' | 'resolved' | 'false_alarm';

export interface IncidentCreate {
  type: IncidentType;
  severity: Severity;
  title: string;
  description: string;
  camera_id: string;
  location: string;
}

export interface IncidentUpdate {
  status?: IncidentStatus;
  severity?: Severity;
  description?: string;
  assigned_to?: string;
}

export interface IncidentStats {
  total: number;
  by_severity: Record<Severity, number>;
  by_type: Record<string, number>;
  by_status: Record<IncidentStatus, number>;
  average_resolution_time: number;
}

// ---- Prediction Types ----
export interface Prediction {
  id: string;
  camera_id: string;
  camera_name: string;
  predicted_congestion: CongestionLevel;
  predicted_vehicle_count: number;
  predicted_speed: number;
  confidence: number;
  prediction_horizon: number; // minutes
  predicted_for: string;
  created_at: string;
}

export interface PredictionRequest {
  camera_id: string;
  horizon_minutes: number;
}

// ---- Report Types ----
export interface Report {
  id: string;
  title: string;
  type: ReportType;
  status: 'generating' | 'completed' | 'failed';
  format: 'pdf' | 'csv' | 'json';
  file_url?: string;
  file_size?: number;
  generated_by: string;
  period_start: string;
  period_end: string;
  created_at: string;
}

export type ReportType = 'daily' | 'weekly' | 'monthly' | 'incident' | 'camera' | 'custom';

export interface ReportCreate {
  title: string;
  type: ReportType;
  format: 'pdf' | 'csv' | 'json';
  period_start: string;
  period_end: string;
  camera_ids?: string[];
}

// ---- Notification Types ----
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  created_at: string;
}

// ---- AI Recommendation Types ----
export interface AIRecommendation {
  id: string;
  type: 'signal_timing' | 'reroute' | 'alert' | 'deployment' | 'general';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  status: 'pending' | 'accepted' | 'dismissed';
  camera_id?: string;
  created_at: string;
}

// ---- API Response Types ----
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApiError {
  detail: string;
  status_code: number;
  errors?: Record<string, string[]>;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    ai_model: ServiceStatus;
    websocket: ServiceStatus;
  };
}

export interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  latency_ms: number;
  message?: string;
}

// ---- Dashboard Types ----
export interface DashboardData {
  summary: TrafficSummary;
  metrics: TrafficMetric[];
  recent_incidents: Incident[];
  recommendations: AIRecommendation[];
  health: HealthStatus;
  cameras: Camera[];
}

// ---- Filter Types ----
export interface DateRange {
  start: string;
  end: string;
}

export interface TrafficFilters {
  camera_ids?: string[];
  vehicle_types?: VehicleType[];
  congestion_levels?: CongestionLevel[];
  min_speed?: number;
  max_speed?: number;
}

// ---- WebSocket Event Types ----
export interface WSEvent<T = unknown> {
  type: string;
  channel: string;
  data: T;
  timestamp: string;
}

// ---- Toast Types ----
export interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
}
