import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AppShell from '../layouts/AppShell';
import { WebSocketProvider } from '../components/WebSocketProvider';

import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Welcome from '../pages/Welcome';
import Settings from '../pages/Settings';
import Cameras from '../pages/Cameras';
import LiveVision from '../pages/LiveVision';
import Vehicles from '../pages/Vehicles';
import Incidents from '../pages/Incidents';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    if (!isAuthenticated) return <Navigate to="/login" />;
    return <>{children}</>;
};

const RootRedirect = () => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    return isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootRedirect />
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/welcome',
        element: <AuthGuard><Welcome /></AuthGuard>
    },
    {
        path: '/',
        element: <AuthGuard><WebSocketProvider><AppShell /></WebSocketProvider></AuthGuard>,
        children: [
            { path: 'dashboard', element: <Dashboard /> },
            { path: 'vision', element: <LiveVision /> },
            { path: 'vehicles', element: <Vehicles /> },
            { path: 'incidents', element: <Incidents /> },
            { path: 'cameras', element: <Cameras /> },
            { path: 'settings', element: <Settings /> }
        ]
    }
]);
