import React from 'react';
import { BrainCircuit, Activity, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useTrafficStore } from '../../../store/trafficStore';

export function AIPrediction() {
    const { predictions, aiStatus } = useTrafficStore();
    const isLoading = !predictions || predictions.confidence === 0;
    
    // Section 9 AI Status Badges
    const statusList = aiStatus.length > 0 ? aiStatus : [
        { name: "YOLOv11 Detector", status: "Active", detail: "FP16 CUDA Engine" },
        { name: "ByteTrack Tracker", status: "Active", detail: "Spatial Kalman" },
        { name: "Telemetry Broadcaster", status: "Active", detail: "WebSocket 1Hz" },
        { name: "ANPR Engine", status: "Coming Soon", detail: "Milestone 3" },
        { name: "Incident Detection", status: "Active", detail: "Anomaly Monitor" },
        { name: "Prediction Engine", status: "Active", detail: "LSTM Model" }
    ];

    const pred = predictions || {
        congestionForecast: "Free Flow",
        congestionValue: 20,
        confidence: 96,
        futureCount: 145,
        recommendedAction: "Maintain Green Wave Timing"
    };

    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-full flex flex-col min-h-[320px] transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-purple-500/20">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                        <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">AI Intelligence & System Status</h3>
                        <p className="text-slate-500 text-sm">Real-time status of computer vision & forecasting models</p>
                    </div>
                </div>
            </div>

            {/* SECTION 9: AI ENGINES STATUS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
                {statusList.map((ai, idx) => {
                    const isComingSoon = ai.status.includes('Coming Soon');
                    return (
                        <div key={idx} className={`p-2.5 rounded-2xl border flex flex-col justify-between transition-all ${
                            isComingSoon ? 'bg-slate-50/70 border-slate-200/80 text-slate-400' : 'bg-purple-50/40 border-purple-100 text-slate-800'
                        }`}>
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-[11px] truncate">{ai.name}</span>
                                {isComingSoon ? (
                                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-slate-200 text-slate-600">SOON</span>
                                ) : (
                                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-emerald-100 text-emerald-700 flex items-center gap-0.5">
                                        <CheckCircle2 className="w-2.5 h-2.5" /> ACTIVE
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium truncate mt-1">{ai.detail}</span>
                        </div>
                    );
                })}
            </div>

            {/* FORECAST & RECOMMENDATION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <div className="md:col-span-2 space-y-4">
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-xs font-bold text-slate-600">2-Hour Congestion Forecast</span>
                            <span className="text-sm font-black text-slate-900">{pred.congestionForecast}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-600 rounded-full transition-all duration-1000" style={{ width: `${Math.max(15, pred.congestionValue)}%` }} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Future Volume</span>
                            <span className="text-base font-black text-blue-600">{pred.futureCount} veh</span>
                        </div>
                        <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100 flex-1">
                            <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block mb-0.5">AI Action</span>
                            <span className="text-xs font-bold text-purple-900 truncate block">{pred.recommendedAction}</span>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-1 flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-xl">
                    <span className="text-2xl font-black text-slate-900">{pred.confidence}%</span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Model Optimal
                    </span>
                </div>
            </div>
        </div>
    );
}
