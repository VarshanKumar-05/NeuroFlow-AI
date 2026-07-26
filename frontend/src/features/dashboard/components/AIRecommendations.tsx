import React from 'react';
import { Lightbulb, ArrowRight, ShieldCheck, Cone, Car, Wrench, TrafficCone } from 'lucide-react';
import { useTrafficStore } from '../../../store/trafficStore';

const iconMap: any = { TrafficCone, Car, ShieldCheck, Cone, Wrench };

export function AIRecommendations() {
    const { recommendations } = useTrafficStore();
    const displayRecs = recommendations.length > 0 ? recommendations : [
        { id: "load-1", title: "Loading Strategies", desc: "Awaiting AI insight...", impact: "Low", icon: "Activity", color: "slate" }
    ];

    const getColor = (c: string) => {
        const map: any = {
            emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
            blue: "bg-blue-50 text-blue-600 border-blue-100",
            red: "bg-red-50 text-red-600 border-red-100",
            orange: "bg-orange-50 text-orange-600 border-orange-100",
            slate: "bg-slate-50 text-slate-600 border-slate-200",
        };
        return map[c] || map.blue;
    };

    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-indigo-500/20">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900">AI Recommendations</h3>
                    <p className="text-slate-500 text-sm">Automated mitigation strategies</p>
                </div>
            </div>

            <div className="flex-1 space-y-3">
                {displayRecs.map((rec, i) => {
                    const Icon = iconMap[rec.icon] || Lightbulb;
                    return (
                        <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-100 transition-colors group cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${getColor(rec.color)}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-900">{rec.title}</h4>
                                    <p className="text-xs font-semibold text-slate-500">{rec.desc}</p>
                                </div>
                            </div>
                            <button className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200 shadow-sm transition-colors">
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
