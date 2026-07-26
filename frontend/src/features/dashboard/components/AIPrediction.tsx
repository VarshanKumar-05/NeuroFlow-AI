import React from 'react';
import { BrainCircuit, Activity, ChevronRight } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useTrafficStore } from '../../../store/trafficStore';

export function AIPrediction() {
    const { predictions } = useTrafficStore();
    const isLoading = !predictions || predictions.confidence === 0;
    
    // Fallback if websocket hasn't sent predictions yet
    const pred = predictions || {
        congestionForecast: "Calculating...",
        congestionValue: 0,
        confidence: 0,
        futureCount: 0,
        recommendedAction: "Awaiting Data"
    };

    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-full flex flex-col min-h-[300px] transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-purple-500/20">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                    <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900">AI Prediction</h3>
                    <p className="text-slate-500 text-sm">Next 2 hours forecast</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 items-center">
                {/* Left side: Stats & Info (2/3 width) */}
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-bold text-slate-600">Congestion Forecast</span>
                            <span className="text-xl font-black text-slate-900">{pred.congestionForecast}</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full transition-all duration-1000" style={{ width: `${pred.congestionValue}%` }} />
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-bold text-slate-600">Prediction Confidence</span>
                            <span className="text-xl font-black text-slate-900">{pred.confidence}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${pred.confidence}%` }} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="flex flex-col justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Future Vehicles</p>
                                <Activity className="w-4 h-4 text-blue-300" />
                            </div>
                            <p className="text-2xl font-black text-blue-600">{pred.futureCount.toLocaleString()}</p>
                        </div>

                        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 cursor-pointer hover:bg-purple-100 transition-colors group flex flex-col justify-center">
                            <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Recommended Action</p>
                            <div className="flex items-center justify-between text-purple-900 font-bold text-sm">
                                <span className="leading-tight">{pred.recommendedAction}</span>
                                <ChevronRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side: Animation / Status Panel (1/3 width) */}
                <div className="md:col-span-1 flex justify-center items-center h-full relative min-h-[220px]">
                    {/* Loading Animation */}
                    <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 bg-white ${isLoading ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'}`}>
                        <div className="w-48 h-48">
                            <DotLottieReact src="/animation/searching.json" loop autoplay />
                        </div>
                        <p className="text-blue-600 font-bold mt-2 animate-pulse text-sm">Analyzing...</p>
                    </div>

                    {/* Active Status Visualization */}
                    <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${!isLoading ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'}`}>
                         <div className="relative text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 w-full h-full flex flex-col items-center justify-center overflow-hidden group hover:border-purple-200 transition-colors">
                            {/* Decorative Chart Background */}
                            <svg className="absolute bottom-0 left-0 w-full h-24 text-purple-100 opacity-50 transition-transform duration-1000 group-hover:scale-105" preserveAspectRatio="none" viewBox="0 0 100 100">
                                <path d="M0,100 L0,50 Q25,20 50,60 T100,30 L100,100 Z" fill="currentColor"/>
                            </svg>
                            
                            <div className="relative z-10 flex flex-col items-center">
                                {/* Circular Confidence Indicator */}
                                <div className="relative w-20 h-20 mb-3">
                                    <svg className="w-full h-full" viewBox="0 0 36 36">
                                        <path
                                            className="text-slate-200"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        />
                                        <path
                                            className="text-emerald-500 transition-all duration-1000 ease-out"
                                            strokeDasharray={`${pred.confidence}, 100`}
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-lg font-black text-slate-800">{pred.confidence}%</span>
                                    </div>
                                </div>
                                <h4 className="text-emerald-600 font-bold text-sm mb-1">Model Optimized</h4>
                                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Live Accuracy</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
