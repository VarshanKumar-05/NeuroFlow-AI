import { useEffect, useState } from 'react';
import { useVehicleStore, ANPRVehicle } from '../store/vehicleStore';
import { UniversalSourceManager } from '../components/common/UniversalSourceManager';
import { Car, Truck, Bus, Bike, Search, Download, FileSpreadsheet, Activity, ShieldCheck, Database, RefreshCw, X, Radio, Clock, Eye, Trash2, Shield, Camera, Cpu } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/DataTable';

const getIconForClass = (typeStr: string) => {
  switch (typeStr.toLowerCase()) {
    case 'car': return <Car className="w-4 h-4 text-cyan-400" />;
    case 'truck': return <Truck className="w-4 h-4 text-amber-400" />;
    case 'bus': return <Bus className="w-4 h-4 text-indigo-400" />;
    case 'motorcycle': case 'bike': return <Bike className="w-4 h-4 text-emerald-400" />;
    default: return <Car className="w-4 h-4 text-slate-400" />;
  }
};

export default function Vehicles() {
  const { 
    vehicles, sessionMetrics, sessionDuration, selectedVehicle, isProfileOpen, isLoading,
    searchQuery, selectedType, selectedStatus,
    setSearchQuery, setSelectedType, setSelectedStatus,
    fetchSession, clearSession, fetchVehicleProfile, closeProfile, downloadExport
  } = useVehicleStore();

  const [activeDetections, setActiveDetections] = useState([
    { id: '1', type: 'Car', plate: 'AP39AB1234', confidence: 98.5, box: { top: '35%', left: '40%', width: '180px', height: '110px' }, plateBox: { top: '65%', left: '20%', width: '80px', height: '24px' } },
    { id: '2', type: 'Truck', plate: 'TS09EA5678', confidence: 96.2, box: { top: '22%', left: '12%', width: '220px', height: '140px' }, plateBox: { top: '70%', left: '25%', width: '90px', height: '26px' } }
  ]);

  useEffect(() => {
    fetchSession();
    const interval = setInterval(() => {
      fetchSession();
    }, 2000);
    return () => clearInterval(interval);
  }, [fetchSession]);

  const filteredVehicles = vehicles.filter(v => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || (v.license_plate && v.license_plate.toLowerCase().includes(q)) || (v.vehicle_type && v.vehicle_type.toLowerCase().includes(q));
    const matchesType = selectedType === 'all' || v.vehicle_type.toLowerCase() === selectedType.toLowerCase();
    const matchesStatus = selectedStatus === 'all' || v.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500 max-w-[1700px] mx-auto min-h-screen text-slate-100">
      
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-5 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)] shrink-0">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-black tracking-tight text-white uppercase">Vehicle Intelligence</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                🟢 AI ANPR ACTIVE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                CAMERA: {sessionMetrics.camera_status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Commercial License Plate Recognition (ANPR/LPR) Traffic Surveillance Workstation
            </p>
          </div>
        </div>

        {/* Dynamic Header Metrics & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-slate-800/50 rounded-2xl border border-slate-700/50 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Stream FPS</span>
              <span className="text-cyan-400 font-black text-sm">{sessionMetrics.current_fps} FPS</span>
            </div>
            <div className="h-6 w-px bg-slate-700"></div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Session Vehicles</span>
              <span className="text-white font-black text-sm">{sessionMetrics.vehicles_seen}</span>
            </div>
            <div className="h-6 w-px bg-slate-700"></div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">OCR Accuracy</span>
              <span className="text-emerald-400 font-black text-sm">{sessionMetrics.avg_ocr_confidence}%</span>
            </div>
            <div className="h-6 w-px bg-slate-700"></div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">System Status</span>
              <span className="text-emerald-400 font-black text-xs">🟢 OPERATIONAL</span>
            </div>
          </div>

          <div className="flex gap-2">
            <UniversalSourceManager channel="vehicles" />
            <Button variant="outline" size="sm" onClick={() => downloadExport('csv')} className="border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-xs">
              <Download className="w-3.5 h-3.5 mr-1.5" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadExport('excel')} className="border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-xs text-emerald-400">
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={clearSession} className="border-slate-700 bg-slate-800/60 hover:bg-red-500/20 text-xs text-red-400 border-red-500/30">
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear Session
            </Button>
          </div>
        </div>
      </div>

      {/* 2. IN-MEMORY SESSION SUMMARY BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Vehicles Seen</span>
          <span className="text-xl font-black text-white mt-0.5 block">{sessionMetrics.vehicles_seen}</span>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Unique Plates</span>
          <span className="text-xl font-black text-cyan-400 mt-0.5 block">{sessionMetrics.unique_plates}</span>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Cars</span>
          <span className="text-xl font-black text-blue-400 mt-0.5 block">{sessionMetrics.cars}</span>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Trucks</span>
          <span className="text-xl font-black text-amber-400 mt-0.5 block">{sessionMetrics.trucks}</span>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Buses</span>
          <span className="text-xl font-black text-indigo-400 mt-0.5 block">{sessionMetrics.buses}</span>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Motorcycles</span>
          <span className="text-xl font-black text-emerald-400 mt-0.5 block">{sessionMetrics.motorcycles}</span>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Avg Confidence</span>
          <span className="text-xl font-black text-emerald-400 mt-0.5 block">{sessionMetrics.avg_ocr_confidence}%</span>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Session Duration</span>
          <span className="text-xl font-black text-purple-400 mt-0.5 block font-mono">{sessionDuration}</span>
        </div>
      </div>

      {/* 3. HERO SECTION: 70% Live Stream (Left) + 30% Live Detection Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT (70%): Hero Live AI Camera Feed Container */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800 p-4 shadow-2xl relative overflow-hidden flex flex-col min-h-[480px]">
            
            {/* Camera Status Bar */}
            <div className="flex items-center justify-between mb-3 px-2 z-20">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  LIVE ANPR FEED
                </div>
                <span className="text-sm font-bold text-white tracking-wide">Live City Camera 01 — Sector 4</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-emerald-400"><ShieldCheck className="w-3.5 h-3.5" /> High Precision LPR Active</span>
              </div>
            </div>

            {/* Video Stream Player */}
            <div className="relative flex-1 rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner group">
              <img 
                src="http://localhost:8000/api/v1/vision/stream?channel=vehicles" 
                alt="Live ANPR Feed" 
                className="w-full h-full object-cover min-h-[420px]"
              />

              {/* CLEAN OPERATOR OVERLAYS: Show ONLY Vehicle Type, Plate Text, and OCR Confidence */}
              {activeDetections.map((det) => (
                <div 
                  key={det.id}
                  style={{ top: det.box.top, left: det.box.left, width: det.box.width, height: det.box.height }}
                  className="absolute border-2 border-emerald-400/80 bg-emerald-500/10 rounded-xl pointer-events-none shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all duration-300"
                >
                  {/* Clean Operator Tag (Type, Plate, Confidence) */}
                  <div className="absolute -top-7 left-0 bg-emerald-500/90 backdrop-blur text-black font-black text-[11px] px-2 py-0.5 rounded shadow-lg flex items-center gap-1.5 tracking-tight">
                    <span>{det.type}</span>
                    <span className="font-mono bg-black/40 text-white px-1.5 rounded">{det.plate}</span>
                    <span className="bg-black/30 text-emerald-300 px-1 rounded text-[9px]">{det.confidence}%</span>
                  </div>
                </div>
              ))}

              {/* Live Monitoring HUD Reticle */}
              <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs flex items-center gap-3">
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  LPR Engine: Active
                </span>
                <span className="h-3 w-px bg-slate-700"></span>
                <span className="text-slate-400">OCR Policy: <strong className="text-white">Single-Pass Cached</strong></span>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT (30%): Live Detection Feed Cards */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/80 p-5 shadow-2xl flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">Live Detection Feed</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  REAL-TIME SESSION
                </span>
              </div>

              {/* Detection Cards Stream */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {(!Array.isArray(vehicles) || vehicles.length === 0) ? (
                  <div className="text-center py-10 text-slate-500 text-xs font-medium">Awaiting vehicle stream detections...</div>
                ) : (
                  (Array.isArray(vehicles) ? vehicles : []).slice(0, 6).map((v: ANPRVehicle, idx: number) => (
                    <div 
                      key={v.id || idx}
                      onClick={() => fetchVehicleProfile(v.id)}
                      className="p-3.5 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-cyan-500/50 rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-between group shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0">
                          {getIconForClass(v.vehicle_type)}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white">{v.vehicle_type}</span>
                          <p className="font-mono text-sm font-black text-cyan-400 tracking-wider mt-0.5">{v.license_plate}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          v.status === 'NEW' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                          v.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          'bg-slate-700 text-slate-300 border border-slate-600'
                        }`}>
                          {v.status}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono">{v.last_seen || 'Just now'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-center">
              <span className="text-[11px] text-slate-500 font-medium">Session records clear automatically on refresh</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. SEARCHABLE SESSION VEHICLE TABLE PANEL (BELOW LIVE SECTION) */}
      <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/80 p-5 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-black text-white uppercase tracking-wider">Searchable Session Vehicle Table</h3>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Plate (AP39AB1234), Vehicle Type..." 
                className="pl-9 bg-slate-800/60 border-slate-700 text-xs" 
              />
            </div>

            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="px-3 py-2 text-xs bg-slate-800/60 border border-slate-700 rounded-xl text-slate-300 font-medium">
              <option value="all">All Vehicles</option>
              <option value="car">Cars</option>
              <option value="truck">Trucks</option>
              <option value="bus">Buses</option>
              <option value="motorcycle">Motorcycles</option>
            </select>

            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-3 py-2 text-xs bg-slate-800/60 border border-slate-700 rounded-xl text-slate-300 font-medium">
              <option value="all">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="LEFT CAMERA">LEFT CAMERA</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 bg-slate-800/40">
                <TableHead className="text-slate-400 font-bold">Snapshot</TableHead>
                <TableHead className="text-slate-400 font-bold">Vehicle Type</TableHead>
                <TableHead className="text-slate-400 font-bold">License Plate</TableHead>
                <TableHead className="text-slate-400 font-bold">OCR Confidence</TableHead>
                <TableHead className="text-slate-400 font-bold">First Seen</TableHead>
                <TableHead className="text-slate-400 font-bold">Last Seen</TableHead>
                <TableHead className="text-slate-400 font-bold">Duration</TableHead>
                <TableHead className="text-slate-400 font-bold">Status</TableHead>
                <TableHead className="text-right text-slate-400 font-bold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-6 text-slate-500">Loading session vehicle records...</TableCell></TableRow>
              ) : !Array.isArray(filteredVehicles) || filteredVehicles.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-6 text-slate-500">No vehicle records in active monitoring session.</TableCell></TableRow>
              ) : (
                (Array.isArray(filteredVehicles) ? filteredVehicles : []).map((v: ANPRVehicle) => (
                  <TableRow key={v.id} onClick={() => fetchVehicleProfile(v.id)} className="border-slate-800/60 hover:bg-slate-800/40 cursor-pointer transition-colors">
                    <TableCell>
                      <div className="w-14 h-10 rounded-md bg-slate-950 overflow-hidden border border-slate-800 shrink-0">
                        <img src={`http://localhost:8000${v.vehicle_snapshot || '/static/snapshots/placeholder.jpg'}`} alt="Snapshot" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = '/login-bg.png'} />
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-xs text-white">
                      <div className="flex items-center gap-1.5">
                        {getIconForClass(v.vehicle_type)}
                        <span>{v.vehicle_type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-black text-cyan-400">{v.license_plate}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-emerald-400">{v.ocr_confidence}%</TableCell>
                    <TableCell className="text-xs text-slate-400">{v.first_seen}</TableCell>
                    <TableCell className="text-xs text-slate-400">{v.last_seen}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-300">{v.duration || '1s'}</TableCell>
                    <TableCell>
                      <Badge variant={v.status === 'ACTIVE' ? 'success' : 'secondary'} className="text-[10px] font-bold">
                        {v.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-cyan-400">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 5. VEHICLE DETAILS DRAWER */}
      {isProfileOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-end animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h3 className="text-xl font-bold text-white">ANPR Vehicle Details</h3>
                    <p className="text-xs text-slate-400">Session ID: {selectedVehicle.id}</p>
                  </div>
                </div>
                <button onClick={closeProfile} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Snapshots */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Vehicle Crop</span>
                  <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                    <img src={`http://localhost:8000${selectedVehicle.vehicle_snapshot || '/static/snapshots/placeholder.jpg'}`} alt="Vehicle Crop" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = '/login-bg.png'} />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Plate Crop</span>
                  <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-2">
                    <img src={`http://localhost:8000${selectedVehicle.plate_snapshot || '/static/snapshots/placeholder.jpg'}`} alt="Plate Crop" className="w-full h-[80%] object-contain" onError={(e) => e.currentTarget.src = '/login-bg.png'} />
                  </div>
                </div>
              </div>

              {/* Specs Matrix */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800"><span className="text-slate-500">Vehicle Type</span><p className="font-bold text-white mt-0.5">{selectedVehicle.vehicle_type}</p></div>
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800"><span className="text-slate-500">License Plate</span><p className="font-bold text-cyan-400 mt-0.5 font-mono">{selectedVehicle.license_plate}</p></div>
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800"><span className="text-slate-500">OCR Confidence</span><p className="font-bold text-emerald-400 mt-0.5">{selectedVehicle.ocr_confidence}%</p></div>
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800"><span className="text-slate-500">First Seen</span><p className="font-bold text-white mt-0.5">{selectedVehicle.first_seen}</p></div>
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800"><span className="text-slate-500">Last Seen</span><p className="font-bold text-white mt-0.5">{selectedVehicle.last_seen}</p></div>
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800"><span className="text-slate-500">Duration</span><p className="font-bold text-purple-400 mt-0.5">{selectedVehicle.duration || '1s'}</p></div>
              </div>

              {/* Session Status Box */}
              <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs font-semibold block">Current Session Status</span>
                  <span className="text-white font-bold text-sm mt-0.5 block">{selectedVehicle.status}</span>
                </div>
                <Badge variant={selectedVehicle.status === 'ACTIVE' ? 'success' : 'secondary'} className="text-xs font-bold">
                  {selectedVehicle.status}
                </Badge>
              </div>
            </div>

            <Button variant="outline" onClick={closeProfile} className="w-full mt-4 border-slate-800">Close Details</Button>
          </div>
        </div>
      )}

    </div>
  );
}
