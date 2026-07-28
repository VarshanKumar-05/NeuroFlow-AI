import { useEffect, useState } from 'react';
import { useWSStore } from '../store/wsStore';
import { useTrafficStore } from '../store/trafficStore';
import { useIncidentStore, EmergencyIncident } from '../store/incidentStore';
import { UniversalSourceManager } from '../components/common/UniversalSourceManager';
import { AlertTriangle, MapPin, Phone, Navigation, Clock, Activity, Video, ExternalLink, Calendar, CheckCircle, ShieldCheck, Database, Zap, Download, FileText, Search, X, ChevronDown, ChevronUp, Radio, Siren, Eye } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/DataTable';

export default function Incidents() {
  const { lastMessage } = useWSStore();
  const { cameras } = useTrafficStore();
  const { 
    incidents, stats, selectedIncident, isDetailOpen, isLoading,
    searchQuery, selectedStatus, selectedSeverity, selectedPriority, selectedDate,
    setSearchQuery, setSelectedStatus, setSelectedSeverity, setSelectedPriority, setSelectedDate,
    fetchStats, fetchIncidents, fetchIncidentProfile, closeDetail,
    acknowledgeIncident, investigateIncident, resolveIncident, closeIncident, archiveIncident, downloadExport
  } = useIncidentStore();

  const [activeEmergency, setActiveEmergency] = useState<any>(null);
  const [operatorNoteInput, setOperatorNoteInput] = useState('');
  const [isTableExpanded, setIsTableExpanded] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchIncidents();
  }, [fetchStats, fetchIncidents]);

  // Listen for real-time WebSocket incident detection events
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'EMERGENCY_INCIDENT' || lastMessage.type === 'INCIDENT_NEW') {
        const incident = lastMessage.payload;
        setActiveEmergency({
          ...incident,
          telegramSent: true,
          callStatus: 'Completed'
        });
        fetchStats();
        fetchIncidents();
      } else if (lastMessage.type === 'INCIDENT_RESOLVED' || lastMessage.type === 'INCIDENT_CLOSED') {
        // Automatically clear active emergency overlay when resolved/closed
        setActiveEmergency(null);
        fetchStats();
        fetchIncidents();
      }
    }
  }, [lastMessage, fetchStats, fetchIncidents]);

  const handleResolveEmergency = async (id: string) => {
    await resolveIncident(id);
    setActiveEmergency(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500 max-w-[1700px] mx-auto min-h-screen text-slate-100">
      
      {/* Top Emergency Command Center Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-5 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500 ${
            activeEmergency ? 'bg-red-500/20 text-red-500 border border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
          }`}>
            <AlertTriangle className={`w-6 h-6 ${activeEmergency ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white uppercase">Emergency Command Center</h1>
              {activeEmergency ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                  CRITICAL EMERGENCY MODE ACTIVE
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  MONITORING NORMAL
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              AI Incident Monitoring, Verification & Emergency Response Dispatch
            </p>
          </div>
        </div>

        {/* Incident Summary Metrics & Export Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-slate-800/50 rounded-2xl border border-slate-700/50 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Incidents</span>
              <span className="text-red-500 font-black text-sm">{stats.active_incidents}</span>
            </div>
            <div className="h-6 w-px bg-slate-700"></div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Critical (P1)</span>
              <span className="text-amber-500 font-black text-sm">{stats.critical_incidents}</span>
            </div>
            <div className="h-6 w-px bg-slate-700"></div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Resolved Today</span>
              <span className="text-emerald-400 font-black text-sm">{stats.resolved_today}</span>
            </div>
            <div className="h-6 w-px bg-slate-700"></div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Avg Response</span>
              <span className="text-blue-400 font-black text-sm">{stats.avg_response_time}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <UniversalSourceManager channel="incidents" />
            <Button variant="outline" size="sm" onClick={() => downloadExport('csv')} className="border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-xs">
              <Download className="w-3.5 h-3.5 mr-1.5" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadExport('pdf')} className="border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-xs text-red-400">
              <FileText className="w-3.5 h-3.5 mr-1.5" /> PDF
            </Button>
          </div>
        </div>
      </div>

      {/* HERO SECTION: 70% Live Stream (Left) + 30% Live Emergency Event Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT (70%): Hero Live Camera Feed Container */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className={`bg-slate-900/80 backdrop-blur-2xl rounded-3xl border p-4 shadow-2xl relative overflow-hidden flex flex-col min-h-[480px] transition-all duration-500 ${
            activeEmergency ? 'border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.15)]' : 'border-slate-800/80'
          }`}>
            
            {/* Camera Status Bar */}
            <div className="flex items-center justify-between mb-3 px-2 z-20">
              <div className="flex items-center gap-3">
                {activeEmergency ? (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-black shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                    EMERGENCY DETECTED
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    🟢 MONITORING ACTIVE
                  </div>
                )}
                <span className="text-sm font-bold text-white tracking-wide">Live City Camera 01 — Sector 4</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-emerald-400"><ShieldCheck className="w-3.5 h-3.5" /> AI Incident Engine Active</span>
              </div>
            </div>

            {/* Video Stream Player */}
            <div className="relative flex-1 rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner group">
              <img 
                src="http://localhost:8000/api/v1/vision/stream?channel=incidents" 
                alt="Live AI Incident Feed" 
                className="w-full h-full object-cover min-h-[420px]"
              />

              {/* DYNAMIC INCIDENT OVERLAY: Only render when model detects an active emergency */}
              {activeEmergency && (
                <>
                  {/* Dynamic Red Incident Bounding Box Overlay */}
                  <div className="absolute top-[28%] left-[32%] w-[240px] h-[160px] border-4 border-red-600 bg-red-500/20 rounded-xl shadow-[0_0_35px_rgba(239,68,68,0.8)] animate-pulse pointer-events-none">
                    <div className="absolute -top-8 left-0 bg-red-600 text-white font-black text-[11px] px-3 py-1 rounded shadow-lg flex items-center gap-2 uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 animate-bounce" />
                      <span>{activeEmergency.incident_type || activeEmergency.type || "Vehicle Collision"}</span>
                      <span className="bg-black/40 px-1.5 py-0.5 rounded text-[10px]">{activeEmergency.confidence || 98.5}%</span>
                    </div>
                  </div>

                  {/* Floating Incident Banner Card */}
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-xl border border-red-500/50 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl z-20 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                        <Siren className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-red-400 uppercase tracking-wide">
                            🚨 {activeEmergency.incident_type || activeEmergency.type || "Vehicle Collision"}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500 text-white">
                            {activeEmergency.severity || "CRITICAL"}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-white mt-0.5">
                          Detected on {activeEmergency.camera_id || activeEmergency.cameraName || "Live City Camera 01"} at {activeEmergency.timestamp || "Just now"} — Telegram Alert Dispatched
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs" 
                        onClick={() => handleResolveEmergency(activeEmergency.id)}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Mark Resolved
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs" 
                        onClick={() => fetchIncidentProfile(activeEmergency.id)}
                      >
                        Evidence Profile
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* Live Monitoring HUD Reticle (Normal State) */}
              {!activeEmergency && (
                <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs flex items-center gap-3">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    🟢 Normal Stream Flow
                  </span>
                  <span className="h-3 w-px bg-slate-700"></span>
                  <span className="text-slate-400">AI Detection: <strong className="text-white">Active Monitoring</strong></span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT (30%): Live Incident Event Feed */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/80 p-5 shadow-2xl flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">Live Incident Event Stream</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  REALTIME WEBSOCKET
                </span>
              </div>

              {/* Incident Feed Cards */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {(!Array.isArray(incidents) || incidents.length === 0) ? (
                  <div className="text-center py-10 text-slate-500 text-xs font-medium">No active incident alerts detected...</div>
                ) : (
                  (Array.isArray(incidents) ? incidents : []).slice(0, 5).map((inc: EmergencyIncident, idx: number) => (
                    <div 
                      key={inc.id || idx}
                      onClick={() => fetchIncidentProfile(inc.id)}
                      className="p-3.5 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-red-500/50 rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-between group shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-red-400 shrink-0">
                          <Siren className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">{inc.incident_type}</span>
                          <p className="text-[11px] font-medium text-slate-400 mt-0.5">{inc.camera_id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          inc.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {inc.severity}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono">{inc.timestamp ? inc.timestamp.split(' ')[1] : 'Just now'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsTableExpanded(!isTableExpanded)}
                className="w-full text-xs text-slate-400 hover:text-white flex items-center justify-center gap-2"
              >
                {isTableExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {isTableExpanded ? 'Hide Incident Audit Table' : 'Expand Searchable Incident Audit Table'}
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* EXPANDABLE SEARCHABLE INCIDENT AUDIT TABLE PANEL (BELOW LIVE SECTION) */}
      <div className={`bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/80 p-5 shadow-2xl space-y-4 transition-all duration-500 ${isTableExpanded ? 'block' : 'hidden md:block'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-black text-white uppercase tracking-wider">Searchable Incident Audit Database</h3>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Type, Camera, Description..." 
                className="pl-9 bg-slate-800/60 border-slate-700 text-xs" 
              />
            </div>

            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-3 py-2 text-xs bg-slate-800/60 border border-slate-700 rounded-xl text-slate-300">
              <option value="all">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
              <option value="INVESTIGATING">INVESTIGATING</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>

            <select value={selectedSeverity} onChange={(e) => setSelectedSeverity(e.target.value)} className="px-3 py-2 text-xs bg-slate-800/60 border border-slate-700 rounded-xl text-slate-300">
              <option value="all">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
            </select>

            <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="px-3 py-2 text-xs bg-slate-800/60 border border-slate-700 rounded-xl text-slate-300">
              <option value="all">All Priorities</option>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 bg-slate-800/40">
                <TableHead className="text-slate-400 font-bold">Snapshot</TableHead>
                <TableHead className="text-slate-400 font-bold">Incident ID</TableHead>
                <TableHead className="text-slate-400 font-bold">Type</TableHead>
                <TableHead className="text-slate-400 font-bold">Severity</TableHead>
                <TableHead className="text-slate-400 font-bold">Priority</TableHead>
                <TableHead className="text-slate-400 font-bold">Camera</TableHead>
                <TableHead className="text-slate-400 font-bold">Time</TableHead>
                <TableHead className="text-slate-400 font-bold">Confidence</TableHead>
                <TableHead className="text-slate-400 font-bold">Status</TableHead>
                <TableHead className="text-right text-slate-400 font-bold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={10} className="text-center py-6 text-slate-500">Loading incident records...</TableCell></TableRow>
              ) : !Array.isArray(incidents) || incidents.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="text-center py-6 text-slate-500">No emergency incident records found.</TableCell></TableRow>
              ) : (
                (Array.isArray(incidents) ? incidents : []).map((inc: EmergencyIncident) => (
                  <TableRow key={inc.id} onClick={() => fetchIncidentProfile(inc.id)} className="border-slate-800/60 hover:bg-slate-800/40 cursor-pointer transition-colors">
                    <TableCell>
                      <div className="w-14 h-10 rounded-md bg-slate-950 overflow-hidden border border-slate-800 shrink-0">
                        <img src={`http://localhost:8000${inc.snapshot_path || '/static/snapshots/placeholder.jpg'}`} alt="Snapshot" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = '/login-bg.png'} />
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-white">INC-{inc.id.split('-')[0].toUpperCase()}</TableCell>
                    <TableCell className="font-bold text-xs text-white">{inc.incident_type}</TableCell>
                    <TableCell><span className={`px-2 py-0.5 rounded text-[10px] font-black ${inc.severity === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>{inc.severity}</span></TableCell>
                    <TableCell className="font-mono text-xs font-bold text-slate-300">{inc.priority}</TableCell>
                    <TableCell className="text-xs text-slate-400">{inc.camera_id}</TableCell>
                    <TableCell className="text-xs text-slate-500">{inc.timestamp}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-emerald-400">{inc.confidence}%</TableCell>
                    <TableCell><Badge variant={inc.status === 'RESOLVED' ? 'success' : 'destructive'} className="text-[10px] font-bold">{inc.status}</Badge></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="sm" className="h-7 text-xs text-[#00E5FF]">Investigate</Button></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* EMERGENCY COMMAND PROFILE DRAWER */}
      {isDetailOpen && selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-end animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <div>
                    <h3 className="text-xl font-bold text-white">Emergency Command Profile</h3>
                    <p className="text-xs text-slate-400">Incident ID: INC-{selectedIncident.id.split('-')[0].toUpperCase()}</p>
                  </div>
                </div>
                <button onClick={closeDetail} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Evidence */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Snapshot Evidence</span>
                  <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                    <img src={`http://localhost:8000${selectedIncident.snapshot_path || '/static/snapshots/placeholder.jpg'}`} alt="Snapshot" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = '/login-bg.png'} />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Video Clip Buffer</span>
                  <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                    <video src={`http://localhost:8000${selectedIncident.video_clip_path || '/static/snapshots/placeholder_video.mp4'}`} controls className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              {/* Specs Matrix */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800"><span className="text-slate-500">Type</span><p className="font-bold text-white mt-0.5">{selectedIncident.incident_type}</p></div>
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800"><span className="text-slate-500">Severity</span><p className="font-bold text-red-500 mt-0.5">{selectedIncident.severity}</p></div>
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800"><span className="text-slate-500">Priority</span><p className="font-bold text-amber-500 mt-0.5">{selectedIncident.priority}</p></div>
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800"><span className="text-slate-500">Confidence</span><p className="font-bold text-emerald-400 mt-0.5">{selectedIncident.confidence}%</p></div>
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800"><span className="text-slate-500">Camera</span><p className="font-bold text-white mt-0.5">{selectedIncident.camera_id}</p></div>
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800"><span className="text-slate-500">Status</span><p className="font-bold text-cyan-400 mt-0.5">{selectedIncident.status}</p></div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-500">Operator Audit Notes</span>
                <textarea 
                  value={operatorNoteInput || selectedIncident.operator_notes || ''} 
                  onChange={(e) => setOperatorNoteInput(e.target.value)} 
                  placeholder="Enter operator incident notes..." 
                  className="w-full h-20 p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00E5FF]" 
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => acknowledgeIncident(selectedIncident.id, operatorNoteInput)} className="flex-1 border-slate-800">Acknowledge</Button>
                <Button variant="outline" size="sm" onClick={() => investigateIncident(selectedIncident.id, operatorNoteInput)} className="flex-1 text-amber-500 border-amber-500/30">Investigate</Button>
                <Button variant="default" size="sm" onClick={() => resolveIncident(selectedIncident.id, operatorNoteInput)} className="flex-1 bg-emerald-600 text-white">Resolve</Button>
                <Button variant="outline" size="sm" onClick={() => closeIncident(selectedIncident.id, operatorNoteInput)} className="flex-1 border-slate-800">Close</Button>
                <Button variant="outline" size="sm" onClick={() => archiveIncident(selectedIncident.id, operatorNoteInput)} className="flex-1 text-slate-500 border-slate-800">Archive</Button>
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-400">Lifecycle Audit Timeline</h4>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {selectedIncident.history?.map((h, i) => (
                    <div key={i} className="p-2.5 bg-slate-800/40 rounded-xl border border-slate-800 text-xs flex justify-between">
                      <div><p className="font-semibold text-slate-200">{h.event}</p><p className="text-[10px] text-slate-500">By: {h.operator}</p></div>
                      <span className="font-mono text-[10px] text-slate-500">{h.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button variant="outline" onClick={closeDetail} className="w-full mt-4 border-slate-800">Close Profile</Button>
          </div>
        </div>
      )}

    </div>
  );
}
