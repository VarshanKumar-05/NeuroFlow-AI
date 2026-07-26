import React from 'react';
import { Play, UploadCloud, Eye, FileText, Plus, Settings } from 'lucide-react';

export function QuickActions() {
    const actions = [
        { label: "Start Detection", icon: Play, color: "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600" },
        { label: "Upload Video", icon: UploadCloud, color: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600" },
        { label: "Open Live Vision", icon: Eye, color: "text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600" },
        { label: "Generate Report", icon: FileText, color: "text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-600 hover:text-white hover:border-purple-600" },
        { label: "Add Camera", icon: Plus, color: "text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-600 hover:text-white hover:border-orange-600" },
        { label: "Manage Cameras", icon: Settings, color: "text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-700 hover:text-white hover:border-slate-700" },
    ];

    return (
        <div className="flex flex-wrap gap-4">
            {actions.map((action, i) => (
                <button 
                    key={i} 
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-bold shadow-sm transition-all duration-300 ${action.color}`}
                >
                    <action.icon className="w-4 h-4" />
                    {action.label}
                </button>
            ))}
        </div>
    );
}
