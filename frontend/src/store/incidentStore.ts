import { create } from 'zustand';
import { api } from '../lib/axios';

export interface EmergencyIncident {
    id: string;
    incident_type: string;
    severity: string;
    priority: string;
    confidence: number;
    camera_id: string;
    timestamp: string;
    status: string;
    description: string;
    operator_notes?: string;
    assigned_operator?: string;
    vehicles_involved?: string;
    track_ids?: string;
    snapshot_path?: string;
    video_clip_path?: string;
}

export interface IncidentProfile extends EmergencyIncident {
    history: { id: string; event: string; operator: string; timestamp: string }[];
}

export interface EmergencyStats {
    active_incidents: number;
    critical_incidents: number;
    resolved_today: number;
    avg_response_time: string;
    open_investigations: number;
}

interface IncidentState {
    incidents: EmergencyIncident[];
    stats: EmergencyStats;
    selectedIncident: IncidentProfile | null;
    isDetailOpen: boolean;
    isLoading: boolean;
    error: string | null;

    // Filters
    searchQuery: string;
    selectedStatus: string;
    selectedSeverity: string;
    selectedPriority: string;
    selectedDate: string;

    // Actions
    setSearchQuery: (query: string) => void;
    setSelectedStatus: (status: string) => void;
    setSelectedSeverity: (severity: string) => void;
    setSelectedPriority: (priority: string) => void;
    setSelectedDate: (date: string) => void;

    fetchStats: () => Promise<void>;
    fetchIncidents: () => Promise<void>;
    fetchIncidentProfile: (id: string) => Promise<void>;
    closeDetail: () => void;
    acknowledgeIncident: (id: string, notes?: string) => Promise<void>;
    investigateIncident: (id: string, notes?: string) => Promise<void>;
    resolveIncident: (id: string, notes?: string) => Promise<void>;
    closeIncident: (id: string, notes?: string) => Promise<void>;
    archiveIncident: (id: string, notes?: string) => Promise<void>;
    downloadExport: (format: 'csv' | 'pdf') => void;
}

export const useIncidentStore = create<IncidentState>((set, get) => ({
    incidents: [],
    stats: {
        active_incidents: 3,
        critical_incidents: 1,
        resolved_today: 14,
        avg_response_time: "1.4 min",
        open_investigations: 1
    },
    selectedIncident: null,
    isDetailOpen: false,
    isLoading: false,
    error: null,

    searchQuery: '',
    selectedStatus: 'all',
    selectedSeverity: 'all',
    selectedPriority: 'all',
    selectedDate: 'all',

    setSearchQuery: (query) => { set({ searchQuery: query }); get().fetchIncidents(); },
    setSelectedStatus: (status) => { set({ selectedStatus: status }); get().fetchIncidents(); },
    setSelectedSeverity: (severity) => { set({ selectedSeverity: severity }); get().fetchIncidents(); },
    setSelectedPriority: (priority) => { set({ selectedPriority: priority }); get().fetchIncidents(); },
    setSelectedDate: (date) => { set({ selectedDate: date }); get().fetchIncidents(); },

    fetchStats: async () => {
        try {
            const res = await api.get('/incidents/stats');
            if (res.data) set({ stats: res.data });
        } catch (err) {
            console.error("Failed to fetch emergency stats:", err);
        }
    },

    fetchIncidents: async () => {
        set({ isLoading: true, error: null });
        try {
            const { searchQuery, selectedStatus, selectedSeverity, selectedPriority, selectedDate } = get();
            const params = new URLSearchParams();
            if (searchQuery) params.append('query', searchQuery);
            if (selectedStatus !== 'all') params.append('status', selectedStatus);
            if (selectedSeverity !== 'all') params.append('severity', selectedSeverity);
            if (selectedPriority !== 'all') params.append('priority', selectedPriority);
            if (selectedDate !== 'all') params.append('date_filter', selectedDate);

            const res = await api.get(`/incidents/?${params.toString()}`);
            const rawItems = res.data?.items || res.data;
            const items = Array.isArray(rawItems) ? rawItems : [];
            set({ incidents: items, isLoading: false });
        } catch (err) {
            console.error("Failed to fetch incidents:", err);
            set({ incidents: [], error: 'Failed to fetch emergency incidents', isLoading: false });
        }
    },

    fetchIncidentProfile: async (id: string) => {
        try {
            const res = await api.get(`/incidents/${id}`);
            set({ selectedIncident: res.data, isDetailOpen: true });
        } catch (err) {
            console.error("Failed to fetch incident profile:", err);
        }
    },

    closeDetail: () => set({ isDetailOpen: false, selectedIncident: null }),

    acknowledgeIncident: async (id: string, notes?: string) => {
        try {
            const res = await api.post(`/incidents/${id}/acknowledge`, { notes, operator: "Operator Alpha" });
            set({ selectedIncident: res.data });
            get().fetchStats();
            get().fetchIncidents();
        } catch (err) {
            console.error("Failed to acknowledge incident:", err);
        }
    },

    investigateIncident: async (id: string, notes?: string) => {
        try {
            const res = await api.post(`/incidents/${id}/investigate`, { notes, operator: "Operator Alpha" });
            set({ selectedIncident: res.data });
            get().fetchStats();
            get().fetchIncidents();
        } catch (err) {
            console.error("Failed to mark incident investigating:", err);
        }
    },

    resolveIncident: async (id: string, notes?: string) => {
        try {
            const res = await api.post(`/incidents/${id}/resolve`, { notes, operator: "Operator Alpha" });
            set({ selectedIncident: res.data });
            get().fetchStats();
            get().fetchIncidents();
        } catch (err) {
            console.error("Failed to resolve incident:", err);
        }
    },

    closeIncident: async (id: string, notes?: string) => {
        try {
            const res = await api.post(`/incidents/${id}/close`, { notes, operator: "Operator Alpha" });
            set({ selectedIncident: res.data });
            get().fetchStats();
            get().fetchIncidents();
        } catch (err) {
            console.error("Failed to close incident:", err);
        }
    },

    archiveIncident: async (id: string, notes?: string) => {
        try {
            const res = await api.post(`/incidents/${id}/archive`, { notes, operator: "Operator Alpha" });
            set({ selectedIncident: res.data });
            get().fetchStats();
            get().fetchIncidents();
        } catch (err) {
            console.error("Failed to archive incident:", err);
        }
    },

    downloadExport: (format) => {
        const link = document.createElement('a');
        link.href = `http://localhost:8000/api/v1/incidents/export/${format}`;
        link.setAttribute('download', `emergency_incidents_${format}.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
}));
