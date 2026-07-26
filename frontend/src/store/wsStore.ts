import { create } from 'zustand';
import { useTrafficStore } from './trafficStore';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000/api/v1/ws';

interface WebSocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  reconnectAttempts: number;
  lastMessage: any | null;
}

interface WebSocketActions {
  connect: (token: string) => void;
  disconnect: () => void;
  sendMessage: (msg: any) => void;
  setConnected: (status: boolean) => void;
}

const MAX_RECONNECT_ATTEMPTS = 5;

export const useWSStore = create<WebSocketState & WebSocketActions>((set, get) => ({
  socket: null,
  isConnected: false,
  reconnectAttempts: 0,
  lastMessage: null,

  connect: (token: string) => {
    if (get().socket?.readyState === WebSocket.OPEN) return;

    // Use wss:// in production, ws:// in dev. Assume localhost:8000 for local backend
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // For this boilerplate, assuming backend is running on 8000 locally
    const wsUrl = `${protocol}//localhost:8000/api/v1/ws?token=${token}`;
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      set({ isConnected: true, reconnectAttempts: 0 });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        set({ lastMessage: data });
        
        // Dispatch to specific stores based on message type
        const store = useTrafficStore.getState();
        const channel = data.channel || 'dashboard';
        
        // Only update global traffic store from dashboard channel
        if (channel === 'dashboard') {
          if (data.type === 'TRAFFIC_STATS_UPDATE') {
            store.updateStats(data.payload);
          } else if (data.type === 'INCIDENT_NEW') {
            store.addIncident(data.payload);
          } else if (data.type === 'INCIDENT_RESOLVED') {
            store.resolveIncident(data.payload.id);
          } else if (data.type === 'INCIDENTS_SYNC') {
            store.updateIncidents(data.payload);
          } else if (data.type === 'VEHICLE_DISTRIBUTION_UPDATE') {
            store.updateVehicleDistribution(data.payload);
          } else if (data.type === 'CAMERA_STATUS_UPDATE') {
            store.updateCameras(data.payload);
          } else if (data.type === 'SYSTEM_HEALTH_UPDATE') {
            store.updateSystemHealth(data.payload);
          } else if (data.type === 'AI_PREDICTION_UPDATE') {
            store.updatePredictions(data.payload);
          } else if (data.type === 'AI_RECOMMENDATIONS_UPDATE') {
            store.updateRecommendations(data.payload);
          }
        }
        
      } catch (e) {
        if (event.data === 'pong') {
          // Heartbeat pong received
          return;
        }
        console.warn('Could not parse WS message:', event.data);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      set({ isConnected: false });
      
      const { reconnectAttempts } = get();
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const timeout = Math.min(1000 * (2 ** reconnectAttempts), 10000); // Exponential backoff
        setTimeout(() => {
          set({ reconnectAttempts: reconnectAttempts + 1 });
          get().connect(token);
        }, timeout);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close();
    };

    set({ socket: ws });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null, isConnected: false, reconnectAttempts: 0 });
    }
  },

  sendMessage: (msg: any) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.send(JSON.stringify(msg));
    } else {
      console.warn('Cannot send message, WebSocket is not connected');
    }
  },

  setConnected: (status: boolean) => set({ isConnected: status }),
}));
