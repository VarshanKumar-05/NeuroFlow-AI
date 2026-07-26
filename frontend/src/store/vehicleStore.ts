import { create } from 'zustand';
import axios from 'axios';

export interface Vehicle {
    id: string;
    type: string;
    timestamp: string;
    speed: string;
    location: string;
    status: string;
}

interface VehicleState {
    vehicles: Vehicle[];
    isLoading: boolean;
    error: string | null;
    fetchVehicles: (type?: string) => Promise<void>;
}

export const useVehicleStore = create<VehicleState>((set) => ({
    vehicles: [],
    isLoading: false,
    error: null,
    fetchVehicles: async (type?: string) => {
        set({ isLoading: true, error: null });
        try {
            const url = type ? `http://localhost:8000/api/v1/vehicles/?type=${type}` : `http://localhost:8000/api/v1/vehicles/`;
            const response = await axios.get(url);
            set({ vehicles: response.data, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to fetch vehicles', isLoading: false });
        }
    }
}));
