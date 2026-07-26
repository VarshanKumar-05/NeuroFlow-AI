import React from 'react';
import { AlertTriangle, Clock, MapPin, Target, ChevronRight, Camera } from 'lucide-react';
import { useTrafficStore } from '../../../store/trafficStore';

export function RecentIncidentsPanel() {
    const { incidents } = useTrafficStore();
    const displayIncidents = incidents.slice(0, 5); // Show latest 5

    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-red-500/20">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Recent Incidents</h3>
                        <p className="text-slate-500 text-sm">Latest anomalies detected by Vision AI</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-4 overflow-auto no-scrollbar pr-2">
                {displayIncidents.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                        No active incidents
                    </div>
                ) : (
                    displayIncidents.map((incident) => (
                        <div key={incident.id} className="relative pl-6 py-2 border-l-2 border-slate-100 group">
                            {/* Pulsing Ring for High/Critical */}
                            {(incident.severity === 'critical' || incident.severity === 'high') && (
                                <span className="absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-red-400 animate-ping opacity-75" />
                            )}
                            {/* Static Dot */}
                            <span className={`absolute -left-[9px] top-6 w-4 h-4 rounded-full border-4 border-white shadow-sm transition-transform group-hover:scale-125 ${
                                incident.severity === 'critical' || incident.severity === 'high' ? 'bg-red-500' :
                                incident.severity === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
                            }`} />
                            
                            <div className="flex bg-slate-50 border border-slate-100 rounded-2xl p-3 hover:bg-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300 group-hover:-translate-y-0.5">
                                {/* Thumbnail / Camera View Placeholder */}
                                <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden relative shrink-0 mr-4 border border-slate-300">
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                                        <Camera className="w-5 h-5 mb-1" />
                                        <span className="text-[8px] font-bold uppercase tracking-wider">Cam {Math.floor(Math.random() * 10) + 1}</span>
                                    </div>
                                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                </div>

                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="flex items-start justify-between mb-1">
                                        <h4 className="text-sm font-bold text-slate-900">{incident.type}</h4>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            incident.severity === 'critical' || incident.severity === 'high' ? 'bg-red-100 text-red-700' :
                                            incident.severity === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {incident.severity}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-[10px] font-semibold text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-slate-400" />
                                            <span className="truncate">{incident.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1 justify-end">
                                            <Clock className="w-3 h-3 text-slate-400" />
                                            <span>{new Date(incident.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Target className="w-3 h-3 text-slate-400" />
                                            <span>Conf: {Math.floor(Math.random() * 15) + 85}%</span>
                                        </div>
                                    </div>
                                </div>

                                <button className="ml-3 self-center p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
