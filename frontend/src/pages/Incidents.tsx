import React, { useEffect, useState, useRef } from 'react';
import { useWSStore } from '../store/wsStore';
import { useTrafficStore } from '../store/trafficStore';
import { AlertTriangle, MapPin, Phone, Navigation, Clock, Activity, Video, ExternalLink, Calendar, CheckCircle, ShieldCheck, Database, Zap, Settings2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export default function Incidents() {
  const { lastMessage } = useWSStore();
  const { cameras } = useTrafficStore();
  const [activeEmergency, setActiveEmergency] = useState<any>(null);
  const [incidentHistory, setIncidentHistory] = useState<any[]>([]);
  const [monitoringTime, setMonitoringTime] = useState(0);
  const [framesProcessed, setFramesProcessed] = useState(0);

  // Source Manager State
  const [sourceType, setSourceType] = useState('accident_demo');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSetSource = async () => {
    setIsLoading(true);
    try {
      if (sourceType === 'upload' && file) {
        const formData = new FormData();
        formData.append('file', file);
        await axios.post(`${API_URL}/vision/upload?channel=incidents`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setStatusMsg('Applied!');
      } else {
        let sourceUrl = url;
        if (sourceType === 'dataset') sourceUrl = '/app/Dataset.mp4';
        
        const response = await axios.post(`${API_URL}/vision/source?channel=incidents`, {
          type: sourceType === 'dataset' ? 'mp4' : sourceType,
          url: sourceUrl,
          name: `Custom ${sourceType}`,
          id: `src-${Date.now()}`
        });
        
        if (response.data.status === 'error') {
          setStatusMsg(response.data.message);
          setIsLoading(false);
          setTimeout(() => setStatusMsg(''), 5000);
          return;
        }
        
        setStatusMsg('Applied!');
      }
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setStatusMsg('Error!');
      setTimeout(() => setStatusMsg(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Stats for the monitoring view
  const activeCamera = cameras?.[0] || { name: 'Unknown', fps: 0, type: 'Video' };

  useEffect(() => {
    const timer = setInterval(() => {
      if (activeCamera.status === 'online') {
        setMonitoringTime(prev => prev + 1);
        setFramesProcessed(prev => prev + (activeCamera.fps || 0));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [activeCamera.fps, activeCamera.status]);

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'EMERGENCY_INCIDENT') {
      const incident = lastMessage.payload;
      setActiveEmergency((prev: any) => {
        // Prevent duplicate active alerts
        if (prev && prev.id === incident.id) return prev;
        
        // Add previous to history if exists
        if (prev) {
          setIncidentHistory((history) => [prev, ...history]);
        }
        
        return {
          ...incident,
          events: [
            { time: incident.timestamp, text: "Accident Detected" },
            { time: incident.timestamp, text: "Location Identified" }
          ],
          telegramSent: false,
          callStatus: 'Calling...'
        };
      });
    }
  }, [lastMessage]);

  // Simulate timeline progression for active emergency
  useEffect(() => {
    if (!activeEmergency || activeEmergency.telegramSent) return;

    const t1 = setTimeout(() => {
      setActiveEmergency((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          events: [...prev.events, { time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), text: "Nearest Hospital Found" }]
        };
      });
    }, 1500);

    const t2 = setTimeout(() => {
      setActiveEmergency((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          telegramSent: true,
          events: [...prev.events, { time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), text: "Telegram Sent" }]
        };
      });
    }, 3000);

    const t3 = setTimeout(() => {
      setActiveEmergency((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          callStatus: 'Completed',
          events: [...prev.events, { time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), text: "Emergency Call Completed" }]
        };
      });
    }, 5000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [activeEmergency?.id]);

  const resolveIncident = () => {
    if (activeEmergency) {
      setIncidentHistory(prev => [{ ...activeEmergency, status: 'Resolved', resolvedAt: new Date().toLocaleTimeString() }, ...prev]);
      setActiveEmergency(null);
    }
  };

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-4rem)] flex flex-col gap-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 mb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            Emergency Incident Management
          </h1>
          <p className="text-slate-500 text-lg mt-1 font-medium">Live accident detection and automated response coordination.</p>
        </div>
        
        {/* Sleek Inline Source Selector */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <select 
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
            className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none font-medium"
          >
            <option value="accident_demo">🚨 Accident Demo Dataset</option>
            <option value="dataset">🎥 Demo Video</option>
            <option value="upload">📁 MP4 Upload</option>
            <option value="rtsp">📡 RTSP Stream</option>
            <option value="youtube">▶️ YouTube Live</option>
            <option value="webcam">📷 USB Webcam</option>
            <option value="ip">🌐 IP Camera</option>
          </select>

          {sourceType === 'upload' ? (
            <input 
              type="file" 
              accept="video/mp4" 
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none w-64"
            />
          ) : (
            <input 
              type="text" 
              placeholder={sourceType === 'accident_demo' ? 'Built-in Accident Dataset (Dataset_annotated.mp4)' : sourceType === 'dataset' ? 'Built-in Demo Dataset (Dataset.mp4)' : 'Enter stream URL...'}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={sourceType === 'dataset' || sourceType === 'accident_demo'}
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none w-64 placeholder:text-slate-400 disabled:bg-slate-50"
            />
          )}

          <button
            onClick={handleSetSource}
            disabled={isLoading || (sourceType === 'upload' && !file)}
            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Wait...' : (statusMsg || 'Set Source')}
          </button>
        </div>
      </div>

      {activeEmergency ? (
        <div className="flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300">
          
          {/* Live Alert Banner */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex flex-col md:flex-row items-center gap-6 shadow-[0_0_20px_rgba(239,68,68,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-red-500 animate-pulse"></div>
            <div className="flex-1 pl-4 flex items-center gap-4">
              <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-500">🚨 HIGH PRIORITY ACCIDENT DETECTED</h2>
                <div className="flex gap-4 text-sm mt-1 text-slate-300">
                  <span className="font-semibold text-white">Source: {activeEmergency.cameraName}</span>
                  <span>Confidence: <span className="text-red-400 font-bold">{activeEmergency.confidence}%</span></span>
                  <span>Time: {activeEmergency.timestamp}</span>
                  <span>Incident ID: <span className="font-mono text-xs text-slate-400">{activeEmergency.id.split('-')[0]}</span></span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={resolveIncident}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Resolved
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Evidence & Map */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Evidence Panel */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#00E5FF]" /> Live Feed & Evidence
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg overflow-hidden border border-slate-700 bg-black aspect-video relative group">
                     {/* Stream mock for incident */}
                     <img src={`http://localhost:8000/evidence/snapshot_${activeEmergency.id}.jpg`} 
                          onError={(e) => { e.currentTarget.src = "http://localhost:8000/api/v1/vision/stream?channel=incidents" }}
                          className="w-full h-full object-cover opacity-80" alt="Live Feed" />
                     <div className="absolute inset-0 border-2 border-red-500/50 rounded-lg pointer-events-none"></div>
                     <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-semibold animate-pulse">LIVE INCIDENT</div>
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 flex flex-col justify-center">
                     <h4 className="text-slate-300 font-medium mb-2">Detection Metadata</h4>
                     <ul className="space-y-2 text-sm">
                       <li className="flex justify-between"><span className="text-slate-500">Type</span> <span className="text-red-400 font-semibold">{activeEmergency.type}</span></li>
                       <li className="flex justify-between"><span className="text-slate-500">Severity</span> <span className="text-red-400 font-semibold">{activeEmergency.severity}</span></li>
                       <li className="flex justify-between"><span className="text-slate-500">Vehicle Count</span> <span className="text-white">2+ Detected</span></li>
                       <li className="flex justify-between"><span className="text-slate-500">GPS Coords</span> <span className="text-white font-mono text-xs">{activeEmergency.lat}, {activeEmergency.lng}</span></li>
                     </ul>
                  </div>
                </div>
              </div>

              {/* Map & Hospitals */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-[#00E5FF]" /> Location & Emergency Routing
                </h3>
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Mock Map */}
                  <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 h-[250px] relative overflow-hidden flex items-center justify-center">
                     <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500 via-slate-900 to-black"></div>
                     <MapPin className="w-12 h-12 text-red-500 relative z-10 animate-bounce" />
                     <div className="absolute bottom-3 left-3 bg-slate-900/80 px-3 py-1 rounded text-xs text-white border border-slate-700 backdrop-blur">
                        {activeEmergency.address}
                     </div>
                  </div>
                  
                  {/* Nearest Hospitals */}
                  <div className="flex-1 flex flex-col gap-3">
                    <h4 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Nearest Hospitals</h4>
                    {activeEmergency.hospitals?.map((h: any, i: number) => (
                      <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 flex justify-between items-center hover:border-slate-600 transition-colors">
                        <div>
                          <p className="text-white font-medium text-sm">{h.name}</p>
                          <div className="flex gap-3 text-xs text-slate-400 mt-1">
                            <span>{h.distance} km</span>
                            <span className="text-[#00E5FF]">{h.eta} min ETA</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-full transition-colors" title="Call Hospital">
                            <Phone className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-full transition-colors" title="Navigate">
                            <Navigation className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Timeline & Status */}
            <div className="flex flex-col gap-6">
              
              {/* Emergency Services */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-[#00E5FF]" /> Automated Response
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                       <ExternalLink className="w-5 h-5 text-[#0088cc]" />
                       <span className="text-slate-200">Telegram Alert</span>
                    </div>
                    {activeEmergency.telegramSent ? (
                       <span className="text-emerald-400 flex items-center gap-1 text-sm font-medium"><CheckCircle className="w-4 h-4" /> Sent</span>
                    ) : (
                       <span className="text-slate-400 flex items-center gap-1 text-sm font-medium animate-pulse">Sending...</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                       <Phone className="w-5 h-5 text-purple-400" />
                       <span className="text-slate-200">Emergency Call (Twilio)</span>
                    </div>
                    {activeEmergency.callStatus === 'Completed' ? (
                       <span className="text-emerald-400 flex items-center gap-1 text-sm font-medium"><CheckCircle className="w-4 h-4" /> Completed</span>
                    ) : (
                       <span className="text-slate-400 flex items-center gap-1 text-sm font-medium animate-pulse">{activeEmergency.callStatus}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex-1">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-[#00E5FF]" /> Incident Timeline
                </h3>
                <div className="flex flex-col gap-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
                  {activeEmergency.events.map((evt: any, idx: number) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-slate-900 bg-[#00E5FF] text-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                        <div className="flex items-center justify-between mb-1">
                          <time className="text-xs font-mono text-[#00E5FF]">{evt.time}</time>
                        </div>
                        <div className="text-sm font-medium text-slate-300">{evt.text}</div>
                      </div>
                    </div>
                  ))}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-slate-900 bg-slate-700 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3">
                        <div className="text-sm font-medium text-slate-500 animate-pulse">Awaiting Resolution...</div>
                      </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-6 animate-in fade-in duration-500">
          
          {/* Main Monitoring Feed */}
          <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-5 flex flex-col gap-4 relative overflow-hidden min-h-[400px]">
             <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>
             
             <div className="flex items-center justify-between z-10 relative">
               <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5 text-emerald-500" /> 
                 Monitoring for accidents...
               </h3>
               <span className="flex h-3 w-3 relative">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
               </span>
             </div>

             <div className="rounded-lg overflow-hidden border border-slate-700 bg-black aspect-video relative group flex-1">
                <img src="http://localhost:8000/api/v1/vision/stream?channel=incidents" className="w-full h-full object-cover" alt="Live Feed" />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur border border-white/10 px-3 py-1.5 rounded-md flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-white text-xs font-medium tracking-wide">LIVE ACTIVE</span>
                </div>
             </div>
          </div>

          {/* Monitoring Stats Panel */}
          <div className="w-full xl:w-80 flex flex-col gap-4 shrink-0">
             
             {/* Status Card */}
             <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
               <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Pipeline Status</h4>
               <div className="space-y-4">
                 
                 <div className="flex justify-between items-center pb-3 border-b border-slate-800/50">
                   <div className="flex items-center gap-2 text-slate-300">
                     <Activity className="w-4 h-4 text-[#00E5FF]" /> Model Status
                   </div>
                   {activeCamera.status === 'online' ? (
                     <span className="text-emerald-400 font-medium text-sm">Active</span>
                   ) : (
                     <span className="text-slate-500 font-medium text-sm">Inactive</span>
                   )}
                 </div>

                 <div className="flex justify-between items-center pb-3 border-b border-slate-800/50">
                   <div className="flex items-center gap-2 text-slate-300">
                     <Video className="w-4 h-4 text-purple-400" /> Current Source
                   </div>
                   <span className="text-white font-medium text-sm">{activeCamera.status === 'online' ? activeCamera.type || 'MP4 Upload' : '-'}</span>
                 </div>

                 <div className="flex justify-between items-center pb-3 border-b border-slate-800/50">
                   <div className="flex items-center gap-2 text-slate-300">
                     <MapPin className="w-4 h-4 text-rose-400" /> Camera Name
                   </div>
                   <span className="text-white font-medium text-sm">{activeCamera.status === 'online' ? activeCamera.name : '-'}</span>
                 </div>

               </div>
             </div>

             {/* Performance Card */}
             <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex-1">
               <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Performance</h4>
               <div className="space-y-4">
                 
                 <div className="flex justify-between items-center pb-3 border-b border-slate-800/50">
                   <div className="flex items-center gap-2 text-slate-300">
                     <Zap className="w-4 h-4 text-amber-400" /> Stream FPS
                   </div>
                   <span className="text-white font-mono text-sm">{activeCamera.status === 'online' ? activeCamera.fps : 0} FPS</span>
                 </div>

                 <div className="flex justify-between items-center pb-3 border-b border-slate-800/50">
                   <div className="flex items-center gap-2 text-slate-300">
                     <Database className="w-4 h-4 text-blue-400" /> Processed
                   </div>
                   <span className="text-white font-mono text-sm">{activeCamera.status === 'online' ? framesProcessed.toLocaleString() : 0} frames</span>
                 </div>

                 <div className="flex justify-between items-center">
                   <div className="flex items-center gap-2 text-slate-300">
                     <Clock className="w-4 h-4 text-emerald-400" /> Uptime
                   </div>
                   <span className="text-white font-mono text-sm">
                     {activeCamera.status === 'online' ? `${Math.floor(monitoringTime / 60).toString().padStart(2, '0')}:${(monitoringTime % 60).toString().padStart(2, '0')}` : '00:00'}
                   </span>
                 </div>

               </div>
             </div>

          </div>

        </div>
      )}

      {/* Incident History */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden mt-4 shrink-0">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-400" /> Incident History
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Incident Type</th>
                <th className="px-6 py-4 font-medium">Camera</th>
                <th className="px-6 py-4 font-medium">Severity</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {incidentHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No historical incidents recorded.
                  </td>
                </tr>
              ) : (
                incidentHistory.map((inc, i) => (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-slate-300 font-mono text-xs">{inc.timestamp}</td>
                    <td className="px-6 py-4 text-white font-medium">{inc.type}</td>
                    <td className="px-6 py-4 text-slate-400">{inc.cameraName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        inc.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block w-fit">
                          {inc.status}
                        </span>
                        <a href={`http://localhost:8000/evidence/evidence_${inc.id}.mp4`} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">
                          View Video Clip
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
