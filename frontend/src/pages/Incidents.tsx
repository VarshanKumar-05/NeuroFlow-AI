import { useEffect, useState } from 'react';
import { useWSStore } from '../store/wsStore';
import { useTrafficStore } from '../store/trafficStore';
import { useIncidentStore, EmergencyIncident } from '../store/incidentStore';
import { UniversalSourceManager } from '../components/common/UniversalSourceManager';
import { AlertTriangle, MapPin, Phone, Navigation, Clock, Activity, Video, ExternalLink, Calendar, CheckCircle, ShieldCheck, Database, Zap, Download, FileText, Search, X, UserCheck } from 'lucide-react';
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

  useEffect(() => {
    fetchStats();
    fetchIncidents();
  }, [fetchStats, fetchIncidents]);

  useEffect(() => {
    if (lastMessage && (lastMessage.type === 'EMERGENCY_INCIDENT' || lastMessage.type === 'INCIDENT_NEW')) {
      const incident = lastMessage.payload;
      setActiveEmergency({
        ...incident,
        telegramSent: true,
        callStatus: 'Completed'
      });
      fetchStats();
      fetchIncidents();
    }
  }, [lastMessage, fetchStats, fetchIncidents]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight flex items-center gap-3">
            <AlertTriangle className="w-10 h-10 text-red-500" />
            Emergency Command Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg mt-1 font-medium">
            AI Incident Lifecycle, Evidence Collection & Automated Response Dispatch
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <UniversalSourceManager channel="incidents" />
          <Button variant="outline" size="sm" onClick={() => downloadExport('csv')}>
            <Download className="w-4 h-4 mr-1.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadExport('pdf')}>
            <FileText className="w-4 h-4 mr-1.5 text-red-500" /> PDF
          </Button>
        </div>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Active Incidents</p>
          <p className="text-2xl font-black text-red-500 mt-1">{stats.active_incidents}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Critical Incidents</p>
          <p className="text-2xl font-black text-amber-500 mt-1">{stats.critical_incidents}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Open Investigations</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{stats.open_investigations}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Resolved Today</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.resolved_today}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Avg Response Time</p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.avg_response_time}</p>
        </div>
      </div>

      {/* Live High-Priority Emergency Alert Banner */}
      {activeEmergency && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_25px_rgba(239,68,68,0.15)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-red-500 animate-pulse"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-red-500 tracking-wide uppercase">🚨 CRITICAL AI EMERGENCY DETECTED</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white">P1 PRIORITY</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {activeEmergency.incident_type || activeEmergency.type || "Vehicle Collision"} on {activeEmergency.camera_id || activeEmergency.cameraName || "Live City Camera 01"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => fetchIncidentProfile(activeEmergency.id)}>
              View Evidence
            </Button>
            <Button variant="default" size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => resolveIncident(activeEmergency.id)}>
              <CheckCircle className="w-4 h-4 mr-1.5" /> Resolve Emergency
            </Button>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Incident Type, Camera, or Description..." 
            className="pl-9" 
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Status Filter */}
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>

          {/* Severity Filter */}
          <select 
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="all">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          {/* Priority Filter */}
          <select 
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="all">All Priorities</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
            <option value="P3">P3</option>
            <option value="P4">P4</option>
          </select>
        </div>
      </div>

      {/* Incident Records Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Evidence Snapshot</TableHead>
              <TableHead>Incident ID</TableHead>
              <TableHead>Incident Type</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Camera</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow>
                    <TableCell colSpan={10} className="text-center py-6 text-slate-500">Loading emergency incident records...</TableCell>
                </TableRow>
            ) : incidents.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={10} className="text-center py-6 text-slate-500">No emergency incident records found matching query.</TableCell>
                </TableRow>
            ) : incidents.map((inc: EmergencyIncident) => (
              <TableRow 
                key={inc.id} 
                onClick={() => fetchIncidentProfile(inc.id)}
                className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {/* Evidence Snapshot */}
                <TableCell>
                  <div className="w-14 h-10 rounded-md bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0">
                    <img 
                      src={`http://localhost:8000${inc.snapshot_path || '/static/snapshots/placeholder.jpg'}`} 
                      alt="Incident Snapshot" 
                      className="w-full h-full object-cover"
                      onError={(e) => e.currentTarget.src = '/login-bg.png'}
                    />
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                  INC-{inc.id.split('-')[0].toUpperCase()}
                </TableCell>
                <TableCell className="font-bold text-sm text-slate-900 dark:text-white">
                  {inc.incident_type}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    inc.severity === 'CRITICAL' ? 'bg-red-500 text-white' :
                    inc.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                    inc.severity === 'MEDIUM' ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white'
                  }`}>
                    {inc.severity}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  {inc.priority}
                </TableCell>
                <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                  {inc.camera_id}
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  {inc.timestamp}
                </TableCell>
                <TableCell className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {inc.confidence}%
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={inc.status === 'RESOLVED' || inc.status === 'CLOSED' ? 'success' : (inc.status === 'OPEN' ? 'destructive' : 'warning')} 
                    className="text-[10px] font-bold"
                  >
                    {inc.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); fetchIncidentProfile(inc.id); }}
                    className="h-8 px-2 text-[#00E5FF] hover:text-[#00d0e6] hover:bg-[#00E5FF]/10"
                  >
                    Investigate
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Incident Profile Detail Drawer / Modal */}
      {isDetailOpen && selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full overflow-y-auto p-6 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Emergency Command Profile</h3>
                    <p className="text-xs text-slate-500">Incident ID: INC-{selectedIncident.id.split('-')[0].toUpperCase()}</p>
                  </div>
                </div>
                <button onClick={closeDetail} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Evidence Snapshot & Video Clip */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">AI Snapshot Evidence</span>
                  <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
                    <img 
                      src={`http://localhost:8000${selectedIncident.snapshot_path || '/static/snapshots/placeholder.jpg'}`} 
                      alt="AI Snapshot" 
                      className="w-full h-full object-cover"
                      onError={(e) => e.currentTarget.src = '/login-bg.png'}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Video Clip Buffer</span>
                  <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 flex items-center justify-center">
                    <video 
                      src={`http://localhost:8000${selectedIncident.video_clip_path || '/static/snapshots/placeholder_video.mp4'}`} 
                      controls 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Incident Specifications Matrix */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 font-medium">Incident Type</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedIncident.incident_type}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 font-medium">Severity</span>
                  <p className="font-bold text-red-500 mt-0.5">{selectedIncident.severity}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 font-medium">Priority</span>
                  <p className="font-bold text-amber-500 mt-0.5">{selectedIncident.priority}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 font-medium">Confidence Score</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{selectedIncident.confidence}%</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 font-medium">Vehicles Involved</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedIncident.vehicles_involved}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 font-medium">Camera Source</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedIncident.camera_id}</p>
                </div>
              </div>

              {/* Operator Notes Input */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-500">Operator Audit Notes</span>
                <textarea
                  value={operatorNoteInput || selectedIncident.operator_notes || ''}
                  onChange={(e) => setOperatorNoteInput(e.target.value)}
                  placeholder="Enter operator incident notes, dispatch log, or resolution details..."
                  className="w-full h-20 p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
                />
              </div>

              {/* Lifecycle State Transition Action Buttons */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-500">Operator Action Workflow</span>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => acknowledgeIncident(selectedIncident.id, operatorNoteInput)}
                    className="flex-1"
                  >
                    Acknowledge
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => investigateIncident(selectedIncident.id, operatorNoteInput)}
                    className="flex-1 text-amber-500 border-amber-500/30"
                  >
                    Investigate
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => resolveIncident(selectedIncident.id, operatorNoteInput)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Resolve
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => closeIncident(selectedIncident.id, operatorNoteInput)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => archiveIncident(selectedIncident.id, operatorNoteInput)}
                    className="flex-1 text-slate-400"
                  >
                    Archive
                  </Button>
                </div>
              </div>

              {/* Incident History & Timeline */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Full Lifecycle Audit Timeline
                </h4>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {selectedIncident.history?.map((h, i) => (
                    <div key={i} className="text-xs p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{h.event}</p>
                        <p className="text-[10px] text-slate-400">By: {h.operator}</p>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">{h.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
              <Button variant="outline" onClick={closeDetail} className="w-full">
                Close Profile
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
