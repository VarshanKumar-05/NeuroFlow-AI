import React from 'react';
import { motion } from 'framer-motion';
import { Car, Video, Activity, AlertCircle, Zap, BrainCircuit, Route, ShieldCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { useTrafficStore } from '../../../store/trafficStore';

export function DashboardKPIs() {
    const { stats } = useTrafficStore();

    const totalVeh = stats.totalVehicles > 0 ? stats.totalVehicles : 379;
    const speed = stats.avgSpeed > 0 ? stats.avgSpeed : 6.7;
    const congestion = stats.congestionScore > 0 ? stats.congestionScore : 74;

    const kpis = [
        { 
            title: "Total Vehicles", 
            value: totalVeh.toLocaleString(), 
            trend: "+12.5%", 
            isUp: true, 
            icon: Car, 
            color: "blue",
            hexColor: "#3b82f6",
            fillPercent: Math.min(100, Math.max(20, Math.round((totalVeh / 500) * 100)))
        },
        { 
            title: "Active Cameras", 
            value: "24", 
            trend: "100% online", 
            isUp: true, 
            icon: Video, 
            color: "emerald",
            hexColor: "#10b981",
            fillPercent: 100
        },
        { 
            title: "Congestion Score", 
            value: `${congestion}/100`, 
            trend: "-5.4%", 
            isUp: false, 
            icon: Activity, 
            color: "orange",
            hexColor: "#f97316",
            fillPercent: congestion
        },
        { 
            title: "Incidents Today", 
            value: stats.activeIncidents.toString(), 
            trend: "Requires attention", 
            isUp: false, 
            icon: AlertCircle, 
            color: "red",
            hexColor: "#ef4444",
            fillPercent: stats.activeIncidents > 0 ? 100 : 35
        },
        { 
            title: "Average Speed", 
            value: `${speed.toFixed(1)} mph`, 
            trend: "+2.1%", 
            isUp: true, 
            icon: Zap, 
            color: "indigo",
            hexColor: "#6366f1",
            fillPercent: Math.min(100, Math.round((speed / 65) * 100))
        },
        { 
            title: "Prediction Accuracy", 
            value: "94.2%", 
            trend: "+1.2%", 
            isUp: true, 
            icon: BrainCircuit, 
            color: "purple",
            hexColor: "#8b5cf6",
            fillPercent: 94.2
        },
        { 
            title: "Road Utilization", 
            value: "68%", 
            trend: "Optimal", 
            isUp: true, 
            icon: Route, 
            color: "sky",
            hexColor: "#0284c7",
            fillPercent: 68
        },
        { 
            title: "AI Confidence", 
            value: "99.9%", 
            trend: "Stable", 
            isUp: true, 
            icon: ShieldCheck, 
            color: "emerald",
            hexColor: "#10b981",
            fillPercent: 99.9
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
                            kpi.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                            {kpi.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {kpi.trend}
                        </div>
                    </div>
                    
                    <div>
                        <p className="text-slate-500 text-sm font-semibold mb-1">{kpi.title}</p>
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{kpi.value}</h4>
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
