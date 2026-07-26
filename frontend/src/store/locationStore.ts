import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

interface WeatherData {
    temperature: number;
    humidity: number;
    rain: number;
    wind_speed: number;
    visibility: number;
    condition: string;
}

interface LocationState {
    latitude: number | null;
    longitude: number | null;
    city: string | null;
    state: string | null;
    country: string | null;
    weather: WeatherData | null;
    trafficUnavailable: boolean;
    locationPermission: 'granted' | 'denied' | 'prompt';
    loading: boolean;
    error: string | null;
    
    // Actions
    fetchLocationAndData: () => Promise<void>;
    fetchReverseGeocode: (lat: number, lon: number) => Promise<void>;
    fetchWeather: (lat: number, lon: number) => Promise<void>;
    fetchTraffic: (lat: number, lon: number) => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const useLocationStore = create<LocationState>((set, get) => ({
    latitude: null,
    longitude: null,
    city: null,
    state: null,
    country: null,
    weather: null,
    trafficUnavailable: false,
    locationPermission: 'prompt',
    loading: false,
    error: null,

    fetchLocationAndData: async () => {
        set({ loading: true, error: null });
        
        if (!navigator.geolocation) {
            set({ locationPermission: 'denied', loading: false, error: 'Geolocation is not supported by your browser.' });
            return;
        }

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            set({ 
                latitude: lat, 
                longitude: lon, 
                locationPermission: 'granted' 
            });

            // Fetch dependent data in parallel
            await Promise.allSettled([
                get().fetchReverseGeocode(lat, lon),
                get().fetchWeather(lat, lon),
                get().fetchTraffic(lat, lon)
            ]);

        } catch (error) {
            if (error instanceof GeolocationPositionError) {
                if (error.code === error.PERMISSION_DENIED) {
                    set({ locationPermission: 'denied', error: 'Location permission denied. Switching to Demo Mode.' });
                } else {
                    set({ error: `Geolocation error: ${error.message}` });
                }
            } else {
                set({ error: 'Failed to get location.' });
            }
        } finally {
            set({ loading: false });
        }
    },

    fetchReverseGeocode: async (lat: number, lon: number) => {
        try {
            const token = useAuthStore.getState().accessToken;
            const res = await axios.get(`${API_URL}/location/reverse`, {
                params: { lat, lon },
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            set({
                city: res.data.city,
                state: res.data.state,
                country: res.data.country
            });
        } catch (error) {
            console.error("Failed to reverse geocode:", error);
        }
    },

    fetchWeather: async (lat: number, lon: number) => {
        try {
            const token = useAuthStore.getState().accessToken;
            const res = await axios.get(`${API_URL}/weather`, {
                params: { lat, lon },
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            set({ weather: res.data });
        } catch (error) {
            console.error("Failed to fetch weather:", error);
        }
    },

    fetchTraffic: async (lat: number, lon: number) => {
        try {
            set({ trafficUnavailable: false });
            const token = useAuthStore.getState().accessToken;
            await axios.get(`${API_URL}/traffic/flow`, {
                params: { lat, lon },
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            // If successful, we would store traffic flow data here
        } catch (error: any) {
            // Check for 503 Service Unavailable which we hardcoded in backend
            if (error.response && error.response.status === 503) {
                set({ trafficUnavailable: true });
            } else {
                console.error("Failed to fetch traffic:", error);
            }
        }
    }
}));
