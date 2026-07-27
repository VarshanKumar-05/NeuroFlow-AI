import React from 'react';
import { motion } from 'framer-motion';
import { Car, Activity, Zap, ShieldCheck, Gauge, Clock, BarChart3, Radio } from 'lucide-react';
import { useTrafficStore } from '../../../store/trafficStore';

export function DashboardKPIs() {
    const { stats } = useTrafficStore();

    const totalVeh = stats.totalVehicles;
    const activeVeh = stats.activeVehicles || 0;
    const vehToday = stats.vehiclesToday || totalVeh;
    const vpm = stats.vpm || 0;
    const vph = stats.vph || 0;
    const speed = stats.avgSpeed;
    const congestion = stats.congestionScore;
    const detectionFps = stats.detectionFps || stats.processingFps || 0;
    const streamingFps = stats.streamingFps || 0;
    const latency = stats.processingLatency || stats.latency || "0 ms";
    const confidence = stats.avgConfidence || "0.0%";

    const kpis = [
        { 
            title: "Total Vehicles", 
            value: totalVeh.toLocaleString(), 
            trend: "Live ROI", 
            isUp: true, 
            icon: Car, 
            color: "blue",
            hexColor: "#3b82f6",
            fillPercent: Math.min(100, Math.max(10, Math.round((totalVeh / 500) * 100)))
        },
        { 
            title: "Active Vehicles", 
            value: activeVeh.toString(), 
            trend: "On Frame", 
            isUp: true, 
            icon: Radio, 
            color: "emerald",
            hexColor: "#10b981",
            fillPercent: Math.min(100, activeVeh * 10)
        },
        { 
            title: "Vehicles Today", 
            value: vehToday.toLocaleString(), 
            trend: "Daily Total", 
            isUp: true, 
            icon: BarChart3, 
            color: "indigo",
            hexColor: "#6366f1",
            fillPercent: 85
        },
        { 
            title: "Flow Rate (VPM / VPH)", 
            value: `${vpm} /min | ${vph} /h`, 
            trend: "Real-time", 
            isUp: true, 
            icon: Zap, 
            color: "sky",
            hexColor: "#0284c7",
            fillPercent: Math.min(100, vpm * 3)
        },
        { 
            title: "Congestion Index", 
            value: `${congestion}% (${stats.congestionLevel || 'Normal'})`, 
            trend: stats.congestionLevel || "Free Flow", 
            isUp: congestion < 60, 
            icon: Activity, 
            color: congestion > 70 ? "red" : congestion > 40 ? "orange" : "emerald",
            hexColor: congestion > 70 ? "#ef4444" : congestion > 40 ? "#f97316" : "#10b981",
            fillPercent: congestion
        },
        { 
            title: "Average Speed", 
            value: `${speed.toFixed(1)} km/h`, 
            trend: "Estimated", 
            isUp: speed > 20, 
            icon: Gauge, 
            color: "purple",
            hexColor: "#8b5cf6",
            fillPercent: Math.min(100, Math.round((speed / 80) * 100))
        },
        { 
            title: "Pipeline FPS (Infer / Stream)", 
            value: `${detectionFps} / ${streamingFps} FPS`, 
            trend: "AI Engine", 
            isUp: detectionFps >= 15, 
            icon: Clock, 
            color: "emerald",
            hexColor: "#10b981",
            fillPercent: Math.min(100, Math.round((detectionFps / 30) * 100))
        },
        { 
            title: "AI Detection Conf. & Latency", 
            value: `${confidence} | ${latency}`, 
            trend: "Stable", 
            isUp: true, 
            icon: ShieldCheck, 
            color: "emerald",
            hexColor: "#10b981",
            fillPercent: parseFloat(confidence) || 95
        },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    const getColorClasses = (color: string) => {
        const map: any = {
            blue: 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white',
            emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white',
            orange: 'bg-orange-50 text-orange-600 border-orange-100 group-hover:bg-orange-500 group-hover:text-white',
            red: 'bg-red-50 text-red-600 border-red-100 group-hover:bg-red-600 group-hover:text-white',
            indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white',
            purple: 'bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-600 group-hover:text-white',
            sky: 'bg-sky-50 text-sky-600 border-sky-100 group-hover:bg-sky-500 group-hover:text-white',
            slate: 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-slate-700 group-hover:text-white',
        };
        return map[color] || map.blue;
    };

    return (
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
            {kpis.map((kpi, i) => (
                <motion.div 
                    key={i} 
                    variants={item}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-default relative overflow-hidden"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors duration-300 ${getColorClasses(kpi.color)}`}>
                            <kpi.icon className="w-6 h-6" />
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                            kpi.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                            {kpi.trend}
                        </div>
                    </div>
                    
                    <div>
                        <p className="text-slate-500 text-sm font-semibold mb-1">{kpi.title}</p>
                        <h4 className="text-xl font-black text-slate-900 tracking-tight">{kpi.value}</h4>
                    </div>
                    
                    {/* Colored Progress Bar Line */}
                    <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${kpi.fillPercent}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ backgroundColor: kpi.hexColor }}
                        />
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}
