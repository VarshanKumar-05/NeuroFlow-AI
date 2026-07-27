import React from 'react';
import { Server, Cpu, HardDrive, Database, Network, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTrafficStore } from '../../../store/trafficStore';

export function SystemHealth() {
    const { systemHealth } = useTrafficStore();
    
    const displayHealth = systemHealth.length > 0 ? systemHealth : [
        { label: "CPU Usage", value: 31, color: "#3b82f6" },
        { label: "Memory", value: 12, color: "#8b5cf6" },
        { label: "Inference FPS", value: 19, color: "#f59e0b" },
        { label: "Stream FPS", value: 20, color: "#10b981" }
    ];

    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-slate-500/20">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                        <Server className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">System Health</h3>
                        <p className="text-slate-500 text-sm">Cluster performance metrics</p>
                    </div>
                </div>
                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    All Systems Operational
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {displayHealth.map((m, i) => {
                    const labelText = m.label || (m as any).name || "Metric";
                    
                    const iconMap: any = {
                        "CPU Usage": Activity,
                        "Memory": Activity,
                        "Inference FPS": Activity,
                        "Stream FPS": Activity
                    };
                    const Icon = iconMap[labelText] || Activity;

                    return (
                        <div key={i} className="flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                                    <Icon className="w-4 h-4 text-slate-400" />
                                    {labelText}
                                </div>
                                <span className="text-sm font-bold text-slate-900">
                                    {m.value}%
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
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
    );
}
