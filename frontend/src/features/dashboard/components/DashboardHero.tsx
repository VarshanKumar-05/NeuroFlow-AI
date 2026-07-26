import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Cpu, Database, Video, CloudSun } from 'lucide-react';

export function DashboardHero() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const dateStr = time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const statusPills = [
        { label: 'AI Ready', icon: Cpu, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
        { label: 'DB Connected', icon: Database, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100' },
        { label: 'Engine Running', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        { label: '24 Cameras', icon: Video, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    ];

    return (
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
                <div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                        Good Morning Operator 👋
                    </h1>
                    <p className="text-slate-500 text-lg mt-1 font-medium">
                        Welcome back to NeuroFlow AI. Monitoring city traffic in real time.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {statusPills.map((pill, i) => (
                        <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${pill.bg} ${pill.border} shadow-sm`}>
                            <pill.icon className={`w-3.5 h-3.5 ${pill.color}`} />
                            <span className={`text-[13px] font-bold ${pill.color}`}>{pill.label}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm shrink-0"
            >
                <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                        <CloudSun className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Weather</p>
                        <p className="text-sm font-bold text-slate-700">72°F Clear</p>
                    </div>
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{dateStr}</p>
                    <p className="text-lg font-black text-slate-900 tracking-tight">{timeStr}</p>
                </div>
            </motion.div>
        </div>
    );
}
