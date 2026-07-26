import React from 'react';
import { PlayCircle } from 'lucide-react';

interface DashboardAnimationProps {
    slot: 'city' | 'analytics' | 'prediction' | 'ai';
    className?: string;
}

export function DashboardAnimation({ slot, className = '' }: DashboardAnimationProps) {
    const titles = {
        city: 'Smart City Live Overview',
        analytics: 'Traffic Analytics Visualization',
        prediction: 'AI Prediction Matrix',
        ai: 'Neural Network Processing'
    };

    return (
        <div className={`relative w-full h-full flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm group ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/5 to-transparent pointer-events-none" />
            
            {/* Animated Pulse Ring */}
            <div className="absolute w-32 h-32 bg-blue-500/10 rounded-full animate-ping pointer-events-none" />
            
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-blue-500 mb-4 z-10 group-hover:scale-110 transition-transform">
                <PlayCircle className="w-8 h-8" />
            </div>
            
            <h4 className="text-slate-900 dark:text-white font-semibold text-lg z-10">{titles[slot]}</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 z-10">Animation Placeholder</p>
            <p className="text-[10px] text-slate-400/70 font-mono mt-4 z-10">slot="{slot}"</p>
        </div>
    );
}
