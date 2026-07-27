import React, { useEffect, useState, useRef } from 'react';
import { Activity, Server, Cpu, MapPin, CloudRain, Wind, AlertTriangle } from 'lucide-react';
import { useLocationStore } from '../../../store/locationStore';
import { useTrafficStore } from '../../../store/trafficStore';
import { useWSStore } from '../../../store/wsStore';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const TOMTOM_API_KEY = import.meta.env.VITE_TOMTOM_API_KEY;

// Component to handle map center updates and bounds tracking
function MapController({ center, setBounds }: { center: [number, number], setBounds: (b: any) => void }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 13, { animate: true });
    }, [center, map]);

    useEffect(() => {
        const handleMove = () => {
            setBounds(map.getBounds());
        };
        map.on('moveend', handleMove);
        // Initial bounds
        handleMove();
        return () => { map.off('moveend', handleMove); };
    }, [map, setBounds]);

    return null;
}

// Custom icon for user location
const userIcon = L.divIcon({
    className: 'bg-transparent',
    html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.6)] map-pulse-node"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

export function LiveCityOverview() {
    const { 
        latitude, longitude, city, state, country, weather, 
        locationPermission, fetchLocationAndData, fetchWeather 
    } = useLocationStore();
    
    const wsConnected = useWSStore(state => state.isConnected);
    const { cameras } = useTrafficStore();
    const [initSteps, setInitSteps] = useState(0);

    const [trafficError, setTrafficError] = useState(false);
    const [incidents, setIncidents] = useState<any[]>([]);
    const [mapBounds, setMapBounds] = useState<any>(null);

    // Initial fetch on mount
    useEffect(() => {
        fetchLocationAndData();
    }, [fetchLocationAndData]);

    // Auto-refresh weather every 5 minutes if location is granted
    useEffect(() => {
        if (locationPermission !== 'granted' || !latitude || !longitude) return;
        const interval = setInterval(() => {
            fetchWeather(latitude, longitude);
        }, 300000);
        return () => clearInterval(interval);
    }, [locationPermission, latitude, longitude, fetchWeather]);

    // Fallback logic
    const hasLocation = locationPermission === 'granted' && latitude && longitude;
    const displayLat = latitude || 0;
    const displayLon = longitude || 0;

    // Simulated Initialization Sequence for UI
    useEffect(() => {
        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep += 1;
            setInitSteps(currentStep);
            if (currentStep >= 7) clearInterval(interval);
        }, 200);
        return () => clearInterval(interval);
    }, []);

    // Fetch Traffic Incidents from TomTom REST API
    const fetchTomTomIncidents = async () => {
        if (!mapBounds || !TOMTOM_API_KEY) return;
        
        try {
            setTrafficError(false);
            const minLat = mapBounds.getSouth();
            const maxLat = mapBounds.getNorth();
            const minLon = mapBounds.getWest();
            const maxLon = mapBounds.getEast();

            const url = `https://api.tomtom.com/traffic/services/5/incidentDetails/s3/${minLat},${minLon},${maxLat},${maxLon}/13/-1/json?key=${TOMTOM_API_KEY}`;
            
            const response = await axios.get(url);
            const data = response.data;

            if (data && data.tm && data.tm.poi) {
                setIncidents(data.tm.poi);
            } else {
                setIncidents([]);
            }
        } catch (error) {
            console.error("Error fetching TomTom incidents:", error);
            setTrafficError(true);
        }
    };

    // Auto-fetch incidents when map bounds change
    useEffect(() => {
        fetchTomTomIncidents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapBounds]);

    // Interval for incidents
    useEffect(() => {
        const trafficInterval = setInterval(() => {
            fetchTomTomIncidents();
        }, 30000);
        return () => clearInterval(trafficInterval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapBounds]);

    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-full flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-blue-500/20">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Live City Overview</h3>
                    <p className="text-slate-500 text-sm">Real-time Smart City Intelligence</p>
                </div>
                <div className="flex items-center gap-3">
                    {trafficError && (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100">
                            <AlertTriangle className="w-3 h-3" /> Live traffic data temporarily unavailable
                        </span>
                    )}
                    <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${wsConnected ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'}`} />
                        {wsConnected ? 'Real-time Feed' : 'Connecting...'}
                    </span>
                </div>
            </div>
            
            <div className="flex-1 w-full flex flex-col md:flex-row gap-6 relative">
                
                {/* Skeleton Loader Overlay */}
                <div className={`absolute inset-0 bg-white z-30 transition-opacity duration-1000 flex gap-6 ${initSteps >= 7 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex-[2] rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
                    <div className="flex-1 rounded-2xl bg-slate-50 animate-pulse border border-slate-200" />
                </div>

                {/* Interactive TomTom Map (Left Side - 68%) */}
                <div className="flex-[2] rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-0 bg-slate-100 flex flex-col min-h-[340px]">
                    <MapContainer 
                        center={[displayLat || 40.7128, displayLon || -74.0060]} 
                        zoom={13} 
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={true}
                    >
                        <MapController center={[displayLat || 40.7128, displayLon || -74.0060]} setBounds={setMapBounds} />
                        
                        {/* Premium Free Base Map (CartoDB Voyager - Highlights Roads) */}
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />

                        {/* User Location (Only show if location is granted) */}
                        {hasLocation && (
                            <Marker position={[displayLat, displayLon]} icon={userIcon}>
                                <Popup>You are here</Popup>
                            </Marker>
                        )}

                        {/* Incidents */}
                        {incidents.map((incident, idx) => {
                            const lat = incident.p.y;
                            const lon = incident.p.x;
                            const description = incident.d || 'Unknown Incident';
                            const severity = incident.ty === 1 ? 'High' : (incident.ty === 2 ? 'Medium' : 'Low');
                            const road = incident.r || 'Unknown Road';
                            
                            let bgColor = 'bg-orange-500';
                            let iconHtml = '⚠️';
                            
                            if (description.toLowerCase().includes('accident') || incident.ic === 1) {
                                bgColor = 'bg-red-500';
                                iconHtml = '💥';
                            } else if (description.toLowerCase().includes('construction') || incident.ic === 9) {
                                bgColor = 'bg-yellow-500';
                                iconHtml = '🚧';
                            } else if (description.toLowerCase().includes('closed') || incident.ic === 8) {
                                bgColor = 'bg-red-600';
                                iconHtml = '⛔';
                            } else if (description.toLowerCase().includes('disabled') || incident.ic === 2) {
                                bgColor = 'bg-slate-600';
                                iconHtml = '🚙';
                            }

                            const incidentIcon = L.divIcon({
                                className: 'bg-transparent',
                                html: `<div class="w-6 h-6 ${bgColor} rounded-full flex items-center justify-center text-xs shadow-md border-2 border-white cursor-pointer">${iconHtml}</div>`,
                                iconSize: [24, 24],
                                iconAnchor: [12, 12]
                            });

                            return (
                                <Marker key={idx} position={[lat, lon]} icon={incidentIcon}>
                                    <Popup>
                                        <div className="p-1 min-w-[200px]">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-lg">{iconHtml}</span>
                                                <h4 className="font-bold text-slate-900 text-sm m-0 leading-tight">{road}</h4>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-xs flex justify-between border-b border-slate-100 pb-1">
                                                    <span className="text-slate-500">Severity</span>
                                                    <span className={`font-bold ${severity === 'High' ? 'text-red-500' : (severity === 'Medium' ? 'text-orange-500' : 'text-blue-500')}`}>{severity}</span>
                                                </div>
                                                <div className="text-xs pt-1 text-slate-700 font-medium">
                                                    {description}
                                                </div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                </div>

                {/* Status Panel (Right Side - 32%) - Section 2 Traffic Status */}
                <div className="flex-1 shrink-0 relative overflow-hidden rounded-2xl glass-panel bg-white border border-slate-200 shadow-sm flex flex-col p-6 z-10">
                    
                    {/* Location & Status Header */}
                    <div className="mb-6 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">Traffic Status Center</h4>
                                <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                                    Section 2 Live Telemetry
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4 flex-1">
                        {/* 1. Congestion Level with Color Visual Badge */}
                        <div className="col-span-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Congestion Level</p>
                                <h4 className="text-lg font-black text-slate-900">{stats.congestionLevel || "Free Flow"} ({stats.congestionScore}%)</h4>
                            </div>
                            <div>
                                {stats.congestionScore >= 85 ? (
                                    <span className="px-3 py-1 rounded-full text-xs font-black bg-red-500 text-white shadow-sm flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Severe
                                    </span>
                                ) : stats.congestionScore >= 60 ? (
                                    <span className="px-3 py-1 rounded-full text-xs font-black bg-orange-500 text-white shadow-sm flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Heavy
                                    </span>
                                ) : stats.congestionScore >= 30 ? (
                                    <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-sm flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Moderate
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Green Flow
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 2. Road Occupancy */}
                        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Road Occupancy</p>
                            <p className="text-lg font-black text-slate-900">{stats.roadOccupancy || "0.0%"}</p>
                        </div>
                        
                        {/* 3. Traffic Density */}
                        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Traffic Density</p>
                            <p className="text-lg font-black text-slate-900">{stats.trafficDensity || "0 veh/km"}</p>
                        </div>

                        {/* 4. Average Speed */}
                        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Average Speed</p>
                            <p className="text-lg font-black text-indigo-600">{stats.avgSpeed.toFixed(1)} km/h</p>
                        </div>

                        {/* 5. Queue Length */}
                        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Queue Length</p>
                            <p className="text-lg font-black text-blue-600">{stats.queueLength || "0 veh"}</p>
                        </div>
                    </div>

                    {/* System Footer */}
                    <div className="border-t border-slate-100 pt-4 mt-2 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-600">Model Resolution</span>
                            <span className="font-bold text-slate-900">{stats.inferenceResolution || "1280x720"}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-600">Inference Latency</span>
                            <span className="font-bold text-emerald-600">{stats.processingLatency || stats.latency || "57 ms"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
