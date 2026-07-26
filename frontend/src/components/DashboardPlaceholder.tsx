import React from 'react';

interface DashboardPlaceholderProps {
    slotName: string;
    height?: string;
    width?: string;
    className?: string;
}

export function DashboardPlaceholder({ slotName, height = 'auto', width = '100%', className = '' }: DashboardPlaceholderProps) {
    return (
        <div 
            className={`flex flex-col items-center justify-center text-center overflow-hidden p-6 ${className}`}
            style={{ 
                backgroundColor: '#0B1120',
                border: '1px solid #1E293B',
                borderRadius: '20px',
                height,
                width
            }}
        >
            <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-2 opacity-90">
                Dashboard Animation
            </h4>
            <p className="text-slate-400 text-xs mb-6 font-medium">
                Waiting for Lottie / MP4
            </p>
            
            <div className="w-full max-w-[200px] border border-slate-700/50 rounded-lg p-3 bg-slate-800/30">
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Slot Name</p>
                <code className="text-emerald-400 text-xs font-mono">{slotName}</code>
            </div>
        </div>
    );
}
