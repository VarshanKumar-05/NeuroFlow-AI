import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useWSStore } from '../store/wsStore';

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { accessToken, isAuthenticated } = useAuthStore();
  const { connect, disconnect, socket, isConnected } = useWSStore();

  useEffect(() => {
    // Connect to WebSocket only when authenticated and token is available
    if (isAuthenticated && accessToken) {
      connect(accessToken);
    } else {
      disconnect();
    }

    return () => {
      // Optional cleanup on unmount if you only want WS active in certain routes.
      // Usually, it's fine to leave it open if it's placed inside the authenticated app shell.
    };
  }, [isAuthenticated, accessToken, connect, disconnect]);

  // Optional Heartbeat interval to keep connection alive
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isConnected && socket) {
      interval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send('ping');
        }
      }, 30000); // 30 seconds heartbeat
    }
    return () => clearInterval(interval);
  }, [isConnected, socket]);

  return <>{children}</>;
};
