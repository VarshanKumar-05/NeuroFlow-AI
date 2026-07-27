import React from 'react';
import { AlertTriangle, Clock, Camera, Radio, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import { useTrafficStore } from '../../../store/trafficStore';

export function RecentIncidentsPanel() {
    const { events } = useTrafficStore();
    const displayEvents = events.slice(0, 7); // Show latest 7 real-time events

    const getSeverityBadge = (severity: string) => {
        if (severity === 'critical' || severity === 'high') {
            return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">Critical</span>;
        } else if (severity === 'warning' || severity === 'medium') {
            return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">Warning</span>;
        }
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">Info</span>;
    };

    const getEventIcon = (type: string) => {
        if (type.includes('Accident') || type.includes('Emergency')) return ShieldAlert;
        if (type.includes('ROI') || type.includes('Counted')) return Radio;
        return Info;
    };

    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-red-500/20">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Live Events & Incident Feed</h3>
                        <p className="text-slate-500 text-sm">Real-time WebSocket event timeline (Newest at top)</p>
                    </div>
                </div>
                <div className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Feed
                </div>
            </div>

            <div className="flex-1 space-y-3 overflow-auto max-h-[380px] no-scrollbar pr-1">
                {displayEvents.length === 0 ? (
                    <div className="h-[250px] flex flex-col items-center justify-center text-slate-400 font-medium border-2 border-dashed border-slate-100 rounded-2xl">
                        <Radio className="w-8 h-8 text-slate-300 mb-2 animate-pulse" />
                        Listening for live vehicle & system events...
                    </div>
                ) : (
                    displayEvents.map((evt) => {
                        const Icon = getEventIcon(evt.type);
                        return (
                            <div key={evt.id} className="relative pl-5 py-1 border-l-2 border-slate-200 group">
                                <span className={`absolute -left-[9px] top-4 w-4 h-4 rounded-full border-4 border-white shadow-sm ${
                                    evt.severity === 'critical' ? 'bg-red-500 animate-pulse' :
                                    evt.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                }`} />
                                
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 hover:bg-white hover:border-slate-200 hover:shadow-md transition-all duration-200">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-4 h-4 text-slate-600" />
                                            <h4 className="text-xs font-bold text-slate-900">{evt.type}</h4>
                                        </div>
                                        {getSeverityBadge(evt.severity)}
                                    </div>
                                    <p className="text-xs font-semibold text-slate-600 mb-1">{evt.description}</p>
                                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                                        <span className="flex items-center gap-1"><Camera className="w-3 h-3 text-slate-400" /> {evt.camera}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> {evt.timestamp}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
