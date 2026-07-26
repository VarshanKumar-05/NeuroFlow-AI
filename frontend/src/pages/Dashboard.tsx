import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTrafficStore } from '../store/trafficStore';
import { useWSStore } from '../store/wsStore';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, Tooltip as LeafletTooltip } from 'react-leaflet';
import { Activity, Video, Server, Shield, Cpu, Gauge, Zap } from 'lucide-react';

import { DashboardHero } from '../features/dashboard/components/DashboardHero';
import { DashboardKPIs } from '../features/dashboard/components/DashboardKPIs';
import { AICopilot } from '../features/dashboard/components/AICopilot';
import { PredictionChart } from '../features/dashboard/components/PredictionChart';
import { VehicleDistributionChart } from '../features/dashboard/components/VehicleDistributionChart';
import { AIPrediction } from '../features/dashboard/components/AIPrediction';
import { RecentIncidentsPanel } from '../features/dashboard/components/RecentIncidentsPanel';
import { CameraGrid } from '../features/dashboard/components/CameraGrid';
import { AIRecommendations } from '../features/dashboard/components/AIRecommendations';
import { QuickActions } from '../features/dashboard/components/QuickActions';
import { SystemHealth } from '../features/dashboard/components/SystemHealth';
import { LiveCityOverview } from '../features/dashboard/components/LiveCityOverview';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function Dashboard() {
    const token = useAuthStore(state => state.accessToken);
    const wsConnected = useWSStore(state => state.isConnected);
    const { cameras, stats } = useTrafficStore();

    return (
        <div className="w-full max-w-[1600px] mx-auto space-y-8 pb-12">
            {/* HERO */}
            <DashboardHero />

            {/* LIVE KPI SECTION (8 Cards) */}
            <DashboardKPIs />

            {/* CENTER PANEL & RIGHT PANEL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <AICopilot />
                </div>
                <div className="lg:col-span-2 min-h-[450px]">
                    <LiveCityOverview />
                </div>
            </div>

            {/* SECOND ROW: Analytics & Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <PredictionChart />
                </div>
                <div className="lg:col-span-1">
                    <VehicleDistributionChart />
                </div>
            </div>

            {/* THIRD ROW: AI Prediction & Incidents */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AIPrediction />
                <RecentIncidentsPanel />
            </div>

            {/* FOURTH ROW: Cameras & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CameraGrid />
                <AIRecommendations />
            </div>

            {/* FIFTH ROW: Quick Actions */}
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 px-1">Quick Actions</h3>
                <QuickActions />
            </div>

            {/* BOTTOM: System Health */}
            <SystemHealth />
            
        </div>
    );
}
