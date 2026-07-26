import { create } from 'zustand';
import axios from 'axios';
import { CameraData } from '../features/cameras/components/CameraCard';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface CameraState {
    cameras: CameraData[];
    isLoading: boolean;
    error: string | null;
    fetchCameras: () => Promise<void>;
    addCamera: (camera: Partial<CameraData>) => Promise<void>;
    updateCamera: (camera: Partial<CameraData>) => Promise<void>;
}

const getHeaders = () => {
    const token = useAuthStore.getState().accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useCameraStore = create<CameraState>((set, get) => ({
    cameras: [],
    isLoading: false,
    error: null,
    
    fetchCameras: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/cameras/`, { headers: getHeaders() });
            set({ cameras: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.detail || 'Failed to fetch cameras', isLoading: false });
        }
    },
    
    addCamera: async (cameraData: Partial<CameraData>) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/cameras/`, cameraData, { headers: getHeaders() });
            set((state) => ({ cameras: [...state.cameras, response.data], isLoading: false }));
        } catch (error: any) {
            set({ error: error.response?.data?.detail || 'Failed to add camera', isLoading: false });
        }
    },
    
    updateCamera: async (cameraData: Partial<CameraData>) => {
        if (!cameraData.id) return;
        set({ isLoading: true, error: null });
        try {
            const response = await axios.put(`${API_URL}/cameras/${cameraData.id}`, cameraData, { headers: getHeaders() });
            set((state) => ({
                cameras: state.cameras.map(c => c.id === cameraData.id ? response.data : c),
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.detail || 'Failed to update camera', isLoading: false });
        }
    }
}));
