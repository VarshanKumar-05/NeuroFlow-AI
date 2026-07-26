import os

frontend_dir = r'd:\placements\Smart traffic\frontend'

directories = [
    'src/components/ui',
    'src/components/shared',
    'src/features/auth',
    'src/hooks',
    'src/layouts',
    'src/lib',
    'src/pages',
    'src/routes',
    'src/services',
    'src/store',
    'src/styles',
    'src/types',
]

for d in directories:
    os.makedirs(os.path.join(frontend_dir, d), exist_ok=True)

files_code = {
    'src/styles/globals.css': '''@import "tailwindcss";

@theme {
  --color-primary: #00E5FF;
  --color-secondary: #3B82F6;
  --color-background: #05070B;
  --color-surface: #10192B;
  --color-surface-hover: #1a2540;
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-text: #F8FAFC;
  --color-muted: #94A3B8;
  --color-border: #1E293B;
  --color-card: #0F1729;
  --color-accent: #00E5FF;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
}

body {
    background-color: var(--color-background);
    color: var(--color-text);
    font-family: var(--font-sans);
}
''',

    'src/lib/utils.ts': '''import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
''',

    'src/lib/axios.ts': '''import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    timeout: 15000,
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Simple implementation for now
        return Promise.reject(error);
    }
);
''',

    'src/store/authStore.ts': '''import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    user: any | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    setTokens: (access: string, refresh: string) => void;
    setUser: (user: any) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh, isAuthenticated: true }),
            setUser: (user) => set({ user }),
            logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
''',

    'src/routes/index.tsx': '''import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AppShell from '../layouts/AppShell';
import Landing from '../pages/Landing';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    if (!isAuthenticated) return <Navigate to="/login" />;
    return <>{children}</>;
};

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Landing />
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/',
        element: <AuthGuard><AppShell /></AuthGuard>,
        children: [
            { path: 'dashboard', element: <Dashboard /> }
        ]
    }
]);
''',

    'src/layouts/AppShell.tsx': '''import { Outlet } from 'react-router-dom';

export default function AppShell() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="h-16 border-b border-border flex items-center px-6">
                <h1 className="text-xl font-bold text-primary">NeuroFlow AI</h1>
            </header>
            <main className="flex-1 p-6 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
''',

    'src/pages/Landing.tsx': '''import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-text">
            <h1 className="text-6xl font-bold mb-4 text-primary">NeuroFlow AI</h1>
            <p className="text-xl mb-8 text-muted">AI-Powered Traffic Intelligence & Decision Platform</p>
            <Link to="/login" className="px-6 py-3 bg-primary text-background font-medium rounded-lg">Get Started</Link>
        </div>
    );
}
''',

    'src/pages/Login.tsx': '''import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Login() {
    const [email, setEmail] = useState('admin@neuroflow.ai');
    const [password, setPassword] = useState('admin123');
    const login = useAuthStore(state => state.setTokens);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock login for now
        login('mock-access-token', 'mock-refresh-token');
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="bg-surface p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-text">Login</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input 
                        type="email" value={email} onChange={e => setEmail(e.target.value)}
                        className="bg-background border border-border p-2 rounded text-text" 
                        placeholder="Email" 
                    />
                    <input 
                        type="password" value={password} onChange={e => setPassword(e.target.value)}
                        className="bg-background border border-border p-2 rounded text-text" 
                        placeholder="Password" 
                    />
                    <button type="submit" className="bg-primary text-background font-bold py-2 rounded">Sign In</button>
                </form>
            </div>
        </div>
    );
}
''',

    'src/pages/Dashboard.tsx': '''export default function Dashboard() {
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Mission Control</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-lg border border-border">
                    <h3 className="text-muted text-sm uppercase">Total Vehicles</h3>
                    <p className="text-3xl font-bold text-primary mt-2">1,245</p>
                </div>
                <div className="bg-surface p-6 rounded-lg border border-border">
                    <h3 className="text-muted text-sm uppercase">Avg Speed</h3>
                    <p className="text-3xl font-bold text-secondary mt-2">42 km/h</p>
                </div>
                <div className="bg-surface p-6 rounded-lg border border-border">
                    <h3 className="text-muted text-sm uppercase">Congestion</h3>
                    <p className="text-3xl font-bold text-warning mt-2">Moderate</p>
                </div>
                <div className="bg-surface p-6 rounded-lg border border-border">
                    <h3 className="text-muted text-sm uppercase">Active Incidents</h3>
                    <p className="text-3xl font-bold text-danger mt-2">2</p>
                </div>
            </div>
        </div>
    );
}
''',

    'src/main.tsx': '''import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
'''
}

for path, content in files_code.items():
    with open(os.path.join(frontend_dir, path), 'w', encoding='utf-8') as f:
        f.write(content)
