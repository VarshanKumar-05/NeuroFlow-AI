import React, { useState, useEffect } from 'react';
import { Video, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTrafficStore } from '../../../store/trafficStore';
import { UniversalSourceManager } from '../../../components/common/UniversalSourceManager';
import { api } from '../../../lib/axios';

export function CameraGrid() {
    const { cameras } = useTrafficStore();
    const [isConnecting, setIsConnecting] = useState(false);
    const [sourceType, setSourceType] = useState('demo');
    const [sourceUrl, setSourceUrl] = useState('');
    const [sourceFile, setSourceFile] = useState<File | null>(null);
    const [webcams, setWebcams] = useState<{id: string, name: string}[]>([]);
    const [loadingStep, setLoadingStep] = useState(0);
    const [loadingError, setLoadingError] = useState('');
    const [isHovering, setIsHovering] = useState(false);
    
    // We expect the backend to broadcast the active camera as the first item or named 'cam-1'
    const activeCam = cameras.length > 0 ? cameras[0] : null;

    const handleReconnect = async () => {
        setIsConnecting(true);
        try {
            await api.post('/vision/source/reconnect');
        } catch (error) {
            console.error("Failed to reconnect", error);
        }
        setTimeout(() => setIsConnecting(false), 2000);
    };

    useEffect(() => {
        if (sourceType === '0' && webcams.length === 0) {
            api.get('/vision/webcams').then(res => {
                setWebcams(res.data);
                if (res.data.length > 0) {
                    setSourceUrl(res.data[0].id);
                }
            }).catch(console.error);
        }
    }, [sourceType, webcams.length]);

    // Auto-load default video source on application startup
    useEffect(() => {
        if (cameras.length === 0) {
            // Give the UI a moment to render before starting the connection process
            const timer = setTimeout(() => {
                handleSetSource(undefined, true);
            }, 500);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSetSource = async (e?: React.FormEvent, isReset = false) => {
        if (e) e.preventDefault();
        
        setLoadingError('');
        setIsConnecting(true);
        setLoadingStep(1); // Uploading/Connecting
        
        try {
            // Start simulation of steps
            const stepInterval = setInterval(() => {
                setLoadingStep(prev => prev < 5 ? prev + 1 : prev);
            }, 600);
            
            if (isReset || sourceType === 'demo') {
                await api.post('/vision/source', {
                    type: 'mp4',
                    url: 'd:/placements/Smart traffic/frontend/public/Dataset.mp4',
                    name: `Demo Dataset`,
                    id: 'cam-demo'
                });
            } else if (sourceType === 'mp4' && sourceFile) {
                const formData = new FormData();
                formData.append('file', sourceFile);
                await api.post('/vision/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/vision/source', {
                    type: sourceType,
                    url: sourceType === '0' ? sourceUrl || '0' : sourceUrl,
                    name: `Custom ${sourceType.toUpperCase()}`,
                    id: 'cam-custom'
                });
            }
            
            clearInterval(stepInterval);
            setLoadingStep(6); // Connected
            setTimeout(() => {
                setIsConnecting(false);
                setLoadingStep(0);
            }, 500);
        } catch (error) {
            console.error("Failed to set source", error);
            setLoadingError("Unable to connect to source");
            setTimeout(() => setIsConnecting(false), 3000);
        }
    };

    const isOnline = activeCam?.status === 'online';

    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-slate-500/20">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                        <Video className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Live Vision Feed & Source</h3>
                        <p className="text-slate-500 text-sm">Universal Source Manager</p>
                    </div>
                </div>
                {activeCam && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleSetSource(undefined, true)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1 rounded-full bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                        >
                            Reset to Demo
                        </button>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${isOnline ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                            {isOnline ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                            {isOnline ? 'Connected' : 'No Active Video Source'}
                        </div>
                    </div>
                )}
            </div>

            {/* LIVE VIDEO FEED */}
            <div 
                className="relative w-full bg-slate-900 rounded-2xl overflow-hidden mb-4 border border-slate-200 shadow-inner group aspect-video"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                {isConnecting ? (
                    <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 text-white z-20">
                        <div className="w-full max-w-sm">
                            <h3 className="text-xl font-bold mb-6 text-center">Loading Source...</h3>
                            
                            {loadingError ? (
                                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-center">
                                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                    <p className="text-red-400 font-medium">{loadingError}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-400">Progress</span>
                                        <span className="font-mono text-blue-400">{Math.min(100, loadingStep * 20)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-2 mb-6">
                                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, loadingStep * 20)}%` }}></div>
                                    </div>
                                    
                                    <div className="space-y-2 text-sm text-slate-400">
                                        <div className={`flex items-center gap-2 ${loadingStep >= 1 ? 'text-white' : ''}`}>
                                            <CheckCircle2 className={`w-4 h-4 ${loadingStep >= 1 ? 'text-emerald-500' : 'text-slate-600'}`} /> Uploading / Connecting
                                        </div>
                                        <div className={`flex items-center gap-2 ${loadingStep >= 2 ? 'text-white' : ''}`}>
                                            <CheckCircle2 className={`w-4 h-4 ${loadingStep >= 2 ? 'text-emerald-500' : 'text-slate-600'}`} /> Validating Stream
                                        </div>
                                        <div className={`flex items-center gap-2 ${loadingStep >= 3 ? 'text-white' : ''}`}>
                                            <CheckCircle2 className={`w-4 h-4 ${loadingStep >= 3 ? 'text-emerald-500' : 'text-slate-600'}`} /> Loading YOLOv11
                                        </div>
                                        <div className={`flex items-center gap-2 ${loadingStep >= 4 ? 'text-white' : ''}`}>
                                            <CheckCircle2 className={`w-4 h-4 ${loadingStep >= 4 ? 'text-emerald-500' : 'text-slate-600'}`} /> Loading ByteTrack
                                        </div>
                                        <div className={`flex items-center gap-2 ${loadingStep >= 5 ? 'text-white' : ''}`}>
                                            <CheckCircle2 className={`w-4 h-4 ${loadingStep >= 5 ? 'text-emerald-500' : 'text-slate-600'}`} /> Initializing Analytics
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : isOnline ? (
                    <img 
                        src={`http://localhost:8000/api/v1/vision/stream?t=${Date.now()}`}
                        alt="Live Vision Feed"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // If stream fails, wait and try to reload
                            setTimeout(() => {
                                e.currentTarget.src = `http://localhost:8000/api/v1/vision/stream?t=${Date.now()}`;
                            }, 3000);
                        }}
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                        <Video className="w-12 h-12 mb-2 opacity-50" />
                        <p className="font-semibold text-sm">No Active Video Source</p>
                    </div>
                )}

                {/* OVERLAY STATS */}
                {activeCam && (
                    <div className="absolute top-3 left-3 flex gap-2">
                        <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                            FPS: {activeCam.fps}
                        </div>
                        <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-amber-400 border border-amber-500/30">
                            LAT: {activeCam.latency}ms
                        </div>
                        {activeCam.resolution && (
                            <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-blue-400 border border-blue-500/30">
                                RES: {activeCam.resolution}
                            </div>
                        )}
                    </div>
                )}

                <button 
                    onClick={handleReconnect}
                    disabled={isConnecting}
                    className={`absolute top-3 right-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white p-1.5 rounded-md transition-all disabled:opacity-50 ${isHovering ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
                    title="Force Reconnect"
                >
                    <RefreshCw className={`w-4 h-4 ${isConnecting ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* SOURCE SELECTOR FORM */}
            <UniversalSourceManager channel="dashboard" className="mb-4" />

            {/* CAMERA DETAILS LIST (Keep existing aesthetics) */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {cameras.map((cam, i) => (
                        <div key={i} className={`flex items-center justify-between p-3 rounded-2xl border ${cam.status === 'online' ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100 bg-slate-50'} hover:shadow-md transition-all group`}>
                            <div className="flex items-center gap-3">
                                <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-200">
                                    <img 
                                        src={cam.thumb || '/login-bg.png'} 
                                        alt={cam.name}
                                        className={`w-full h-full object-cover transition-opacity ${cam.status === 'offline' ? 'opacity-30 grayscale' : 'opacity-100'}`}
                                        onError={(e) => e.currentTarget.src = '/login-bg.png'}
                                    />
                                    {cam.status === 'online' && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white shadow-sm animate-pulse" />}
                                    {cam.status === 'warning' && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border border-white shadow-sm animate-pulse" />}
                                    {cam.status === 'offline' && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white shadow-sm" />}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 truncate max-w-[100px]">{cam.name}</h4>
                                    <div className="flex gap-2 text-[10px] text-slate-500 font-bold mt-0.5 uppercase tracking-wider">
                                        <span>{cam.type || 'SOURCE'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right pr-2">
                                <div className="text-sm font-black text-blue-600">{cam.vehicles}</div>
                                <div className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Veh</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
