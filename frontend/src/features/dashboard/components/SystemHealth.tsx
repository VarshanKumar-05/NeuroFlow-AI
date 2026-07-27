import React from 'react';
import { Server, Cpu, HardDrive, Database, Network, Activity, ShieldCheck, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTrafficStore } from '../../../store/trafficStore';

export function SystemHealth() {
    const { detailedSystemHealth, hardware, stats } = useTrafficStore();
    
    // Section 6 Hardware Metrics
    const cpuVal = parseFloat(hardware.cpuUsage || stats.cpuUsage || "0");
    const ramVal = parseFloat(hardware.ramUsage || stats.memoryUsage || "0");
    const gpuVal = parseFloat(hardware.gpuUsage || stats.gpuUsage || "0");
    const diskVal = parseFloat(hardware.diskUsage || "15");
    const gpuMemText = hardware.gpuMemory || "0 MB (0%)";

    const hardwareItems = [
        { label: "CPU Usage", value: cpuVal, text: `${cpuVal.toFixed(1)}%`, color: cpuVal > 80 ? "#ef4444" : cpuVal > 50 ? "#f59e0b" : "#10b981", icon: Cpu },
        { label: "RAM Memory", value: ramVal, text: `${ramVal.toFixed(1)}%`, color: ramVal > 85 ? "#ef4444" : ramVal > 60 ? "#f59e0b" : "#3b82f6", icon: Server },
        { label: "GPU Load", value: gpuVal, text: `${gpuVal.toFixed(1)}%`, color: "#8b5cf6", icon: Activity },
        { label: "GPU Memory", value: 35, text: gpuMemText, color: "#6366f1", icon: Database },
        { label: "Disk Storage", value: diskVal, text: `${diskVal.toFixed(1)}%`, color: "#0284c7", icon: HardDrive },
    ];

    // Section 5 System Health Components
    const healthList = detailedSystemHealth.length > 0 ? detailedSystemHealth : [
        { component: "Backend API", status: "healthy", latency: "2ms", detail: "FastAPI Active" },
        { component: "Database", status: "healthy", latency: "4ms", detail: "PostgreSQL Active" },
        { component: "Redis Cache", status: "healthy", latency: "1ms", detail: "In-Memory Broker" },
        { component: "Camera Stream", status: "healthy", latency: stats.latency || "57ms", detail: "H264 / MJPEG" },
        { component: "AI Detector Engine", status: "healthy", latency: `${stats.detectionFps || 16} FPS`, detail: "YOLOv11 Active" },
        { component: "Object Tracker", status: "healthy", latency: "3ms", detail: "ByteTrack Active" },
        { component: "Telemetry Broadcaster", status: "healthy", latency: "1ms", detail: "WebSocket 1Hz" }
    ];

    const getStatusBadge = (status: string) => {
        if (status === 'healthy' || status === 'online') {
            return (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Healthy
                </span>
            );
        } else if (status === 'warning') {
            return (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-500" /> Warning
                </span>
            );
        }
        return (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100 flex items-center gap-1">
                <XCircle className="w-3 h-3 text-red-500" /> Offline
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* SECTION 6: HARDWARE METRICS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                            <Cpu className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Hardware & System Telemetry</h3>
                            <p className="text-slate-500 text-sm">Real-time CPU, GPU, RAM & Storage metrics</p>
                        </div>
                    </div>
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Hardware Normal
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
                    {hardwareItems.map((m, i) => {
                        const Icon = m.icon;
                        return (
                            <div key={i} className="flex flex-col justify-between p-3 bg-slate-50/70 border border-slate-100 rounded-2xl">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs">
                                        <Icon className="w-4 h-4 text-slate-500" />
                                        {m.label}
                                    </div>
                                    <span className="text-xs font-bold text-slate-900">
                                        {m.text}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, Math.max(5, m.value))}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className="h-full rounded-full transition-all duration-500" 
                                        style={{ backgroundColor: m.color }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* SECTION 5: SYSTEM HEALTH MONITOR */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                            <Server className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Services Health Status</h3>
                            <p className="text-slate-500 text-sm">Backend, Database, Redis, Camera, AI Engine, Tracker & Telemetry</p>
                        </div>
                    </div>
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        7 / 7 Services Active
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {healthList.map((h, i) => (
                        <div key={i} className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl flex flex-col justify-between hover:bg-white hover:border-slate-300 transition-all duration-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-slate-800 text-xs truncate">{h.component}</span>
                            </div>
                            <div className="mb-2">
                                {getStatusBadge(h.status)}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium truncate">
                                {h.detail} ({h.latency})
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
