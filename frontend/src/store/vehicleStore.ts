import { create } from 'zustand';
import { api } from '../lib/axios';

export interface ANPRVehicle {
    id: string;
    track_id: number;
    vehicle_type: string;
    license_plate: string;
    canonical_plate: string;
    raw_ocr: string;
    ocr_confidence: number;
    camera_id: string;
    direction: string;
    first_seen: string;
    last_seen: string;
    status: string;
    vehicle_snapshot: string;
    plate_snapshot: string;
}

export interface VehicleProfile extends ANPRVehicle {
    detection_confidence: number;
    time_on_screen: string;
    history: { id: string; event: str; camera_id: str; timestamp: str }[];
    movement_timeline: { vehicle_id: str; camera: str; timestamp: str; event: str }[];
}

export interface SummaryStats {
    vehicles_today: number;
    unique_plates: number;
    repeated_vehicles: number;
    ocr_accuracy: number;
    avg_ocr_confidence: number;
    most_active_camera: string;
    plates_read: number;
}

interface VehicleState {
    vehicles: ANPRVehicle[];
    stats: SummaryStats;
    selectedVehicle: VehicleProfile | null;
    isProfileOpen: boolean;
    isLoading: boolean;
    error: string | null;
    
    // Filters
    searchQuery: string;
    selectedType: string;
    selectedStatus: string;
    selectedDate: string;
    lowConfidenceOnly: boolean;
    repeatedOnly: boolean;

    // Actions
    setSearchQuery: (query: string) => void;
    setSelectedType: (type: string) => void;
    setSelectedStatus: (status: string) => void;
    setSelectedDate: (date: string) => void;
    setLowConfidenceOnly: (val: boolean) => void;
    setRepeatedOnly: (val: boolean) => void;

    fetchStats: () => Promise<void>;
    fetchVehicles: () => Promise<void>;
    fetchVehicleProfile: (id: string) => Promise<void>;
    closeProfile: () => void;
    downloadExport: (format: 'csv' | 'excel' | 'pdf') => void;
}

export const useVehicleStore = create<VehicleState>((set, get) => ({
    vehicles: [],
    stats: {
        vehicles_today: 324,
        unique_plates: 248,
        repeated_vehicles: 42,
        ocr_accuracy: 98.2,
        avg_ocr_confidence: 94.6,
        most_active_camera: "Live City Camera 01",
        plates_read: 310
    },
    selectedVehicle: null,
    isProfileOpen: false,
    isLoading: false,
    error: null,

    searchQuery: '',
    selectedType: 'all',
    selectedStatus: 'all',
    selectedDate: 'all',
    lowConfidenceOnly: false,
    repeatedOnly: false,

    setSearchQuery: (query) => { set({ searchQuery: query }); get().fetchVehicles(); },
    setSelectedType: (type) => { set({ selectedType: type }); get().fetchVehicles(); },
    setSelectedStatus: (status) => { set({ selectedStatus: status }); get().fetchVehicles(); },
    setSelectedDate: (date) => { set({ selectedDate: date }); get().fetchVehicles(); },
    setLowConfidenceOnly: (val) => { set({ lowConfidenceOnly: val }); get().fetchVehicles(); },
    setRepeatedOnly: (val) => { set({ repeatedOnly: val }); get().fetchVehicles(); },

    fetchStats: async () => {
        try {
            const res = await api.get('/vehicles/stats');
            if (res.data) set({ stats: res.data });
        } catch (err) {
            console.error("Failed to fetch ANPR summary stats:", err);
        }
    },

    fetchVehicles: async () => {
        set({ isLoading: true, error: null });
        try {
            const { searchQuery, selectedType, selectedStatus, selectedDate, lowConfidenceOnly, repeatedOnly } = get();
            const params = new URLSearchParams();
            if (searchQuery) params.append('query', searchQuery);
            if (selectedType !== 'all') params.append('vehicle_type', selectedType);
            if (selectedStatus !== 'all') params.append('status', selectedStatus);
            if (selectedDate !== 'all') params.append('date_filter', selectedDate);
            if (lowConfidenceOnly) params.append('low_confidence', 'true');
            if (repeatedOnly) params.append('repeated_only', 'true');

            const res = await api.get(`/vehicles/?${params.toString()}`);
            set({ vehicles: res.data.items || res.data || [], isLoading: false });
        } catch (err) {
            console.error("Failed to fetch vehicles:", err);
            set({ error: 'Failed to fetch vehicle records', isLoading: false });
        }
    },

    fetchVehicleProfile: async (id: string) => {
        try {
            const res = await api.get(`/vehicles/${id}`);
            set({ selectedVehicle: res.data, isProfileOpen: true });
        } catch (err) {
            console.error("Failed to fetch vehicle profile:", err);
        }
    },

    closeProfile: () => set({ isProfileOpen: false, selectedVehicle: null }),

    downloadExport: (format) => {
        const link = document.createElement('a');
        link.href = `http://localhost:8000/api/v1/vehicles/export/${format}`;
        link.setAttribute('download', `vehicle_intelligence_${format}.${format === 'excel' ? 'xlsx' : format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
}));
