import { create } from 'zustand';
import { api } from '../lib/axios';

export interface ANPRVehicle {
    id: string;
    track_id: number;
    vehicle_type: string;
    vehicle_confidence?: number;
    license_plate: string;
    canonical_plate?: string;
    raw_ocr?: string;
    plate_detection_confidence?: number;
    ocr_confidence: number;
    speed?: number | null;
    speed_status?: string;
    camera_id: string;
    direction?: string;
    first_seen: string;
    last_seen: string;
    duration?: string;
    status: string; // NEW, ACTIVE, LEFT CAMERA, INVALID OCR
    vehicle_snapshot: string;
    plate_snapshot: string;
}

export interface SessionMetrics {
    vehicles_seen: number;
    unique_plates: number;
    cars: number;
    trucks: number;
    buses: number;
    motorcycles: number;
    avg_ocr_confidence: number;
    current_fps: number;
    camera_status: string;
}

export interface VehicleProfile extends ANPRVehicle {
    detection_confidence?: number;
    time_on_screen?: string;
    history?: { id: string; event: string; camera_id: string; timestamp: string }[];
}

interface VehicleState {
    vehicles: ANPRVehicle[];
    sessionMetrics: SessionMetrics;
    sessionDuration: string;
    selectedVehicle: VehicleProfile | null;
    isProfileOpen: boolean;
    isLoading: boolean;
    error: string | null;
    
    // Filters
    searchQuery: string;
    selectedType: string;
    selectedStatus: string;

    // Actions
    setSearchQuery: (query: string) => void;
    setSelectedType: (type: string) => void;
    setSelectedStatus: (status: string) => void;

    fetchSession: () => Promise<void>;
    clearSession: () => Promise<void>;
    fetchVehicleProfile: (id: string) => Promise<void>;
    closeProfile: () => void;
    downloadExport: (format: 'csv' | 'excel' | 'pdf') => void;
}

export const useVehicleStore = create<VehicleState>((set, get) => ({
    vehicles: [],
    sessionMetrics: {
        vehicles_seen: 0,
        unique_plates: 0,
        cars: 0,
        trucks: 0,
        buses: 0,
        motorcycles: 0,
        avg_ocr_confidence: 0,
        current_fps: 30.0,
        camera_status: "Connected"
    },
    sessionDuration: "0s",
    selectedVehicle: null,
    isProfileOpen: false,
    isLoading: false,
    error: null,

    searchQuery: '',
    selectedType: 'all',
    selectedStatus: 'all',

    setSearchQuery: (query) => { set({ searchQuery: query }); },
    setSelectedType: (type) => { set({ selectedType: type }); },
    setSelectedStatus: (status) => { set({ selectedStatus: status }); },

    fetchSession: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get('/vehicles/session');
            if (res.data) {
                const vehiclesList = Array.isArray(res.data.vehicles) ? res.data.vehicles : [];
                set({ 
                    vehicles: vehiclesList, 
                    sessionMetrics: res.data.metrics || get().sessionMetrics,
                    sessionDuration: res.data.session_duration || "1m 05s",
                    isLoading: false 
                });
            }
        } catch (err) {
            console.error("Failed to fetch ANPR active session:", err);
            set({ isLoading: false });
        }
    },

    clearSession: async () => {
        try {
            await api.post('/session/clear');
            set({ 
                vehicles: [], 
                sessionMetrics: {
                    vehicles_seen: 0,
                    unique_plates: 0,
                    cars: 0,
                    trucks: 0,
                    buses: 0,
                    motorcycles: 0,
                    avg_ocr_confidence: 0,
                    current_fps: 30.0,
                    camera_status: "Connected"
                },
                sessionDuration: "0s",
                selectedVehicle: null,
                isProfileOpen: false
            });
        } catch (err) {
            console.error("Failed to clear ANPR session:", err);
        }
    },

    fetchVehicleProfile: async (id: string) => {
        const { vehicles } = get();
        const found = vehicles.find(v => v.id === id);
        if (found) {
            set({ selectedVehicle: found as VehicleProfile, isProfileOpen: true });
        } else {
            try {
                const res = await api.get(`/vehicles/${id}`);
                set({ selectedVehicle: res.data, isProfileOpen: true });
            } catch (err) {
                console.error("Failed to fetch vehicle profile:", err);
            }
        }
    },

    closeProfile: () => set({ isProfileOpen: false, selectedVehicle: null }),

    downloadExport: (format) => {
        const link = document.createElement('a');
        link.href = `http://localhost:8000/api/v1/vehicles/export/${format}`;
        link.setAttribute('download', `anpr_session_export_${format}.${format === 'excel' ? 'xlsx' : format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
}));
