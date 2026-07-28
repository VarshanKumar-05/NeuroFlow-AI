import { useEffect, useState } from 'react';
import { Search, Filter, Download, Car, Truck, Bus, Bike, FileSpreadsheet, FileText, CheckCircle2, AlertTriangle, X, Shield, Clock, Camera as CameraIcon, ChevronDown, ChevronUp, Eye, Zap, Activity } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/DataTable';
import { useVehicleStore, ANPRVehicle } from '../store/vehicleStore';

const getIconForClass = (className: string) => {
  switch (className.toLowerCase()) {
    case 'car': return <Car className="w-4 h-4 text-blue-400" />;
    case 'truck': return <Truck className="w-4 h-4 text-amber-400" />;
    case 'bus': return <Bus className="w-4 h-4 text-indigo-400" />;
    case 'motorcycle': case 'bike': return <Bike className="w-4 h-4 text-purple-400" />;
    default: return <Car className="w-4 h-4 text-slate-400" />;
  }
};

export default function Vehicles() {
  const { 
    vehicles, stats, selectedVehicle, isProfileOpen, isLoading,
    searchQuery, selectedType, selectedDate, lowConfidenceOnly,
    setSearchQuery, setSelectedType, setSelectedDate, setLowConfidenceOnly,
    fetchStats, fetchVehicles, fetchVehicleProfile, closeProfile, downloadExport 
  } = useVehicleStore();

  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [selectedOverlayVehicle, setSelectedOverlayVehicle] = useState<any>(null);

  useEffect(() => {
    fetchStats();
    fetchVehicles();
  }, [fetchStats, fetchVehicles]);

  // Sample live overlay detections for AI visualization over camera stream
  const liveDetections = [
    { id: 'TRK-101', type: 'Car', plate: 'AP39AB1234', confidence: 98.4, verified: true, box: { top: '32%', left: '28%', width: '180px', height: '120px' }, plateBox: { top: '70%', left: '35%', width: '70px', height: '22px' } },
    { id: 'TRK-104', type: 'Truck', plate: 'TS09AA5678', confidence: 94.1, verified: true, box: { top: '24%', left: '60%', width: '210px', height: '140px' }, plateBox: { top: '75%', left: '65%', width: '80px', height: '24px' } },
    { id: 'TRK-109', type: 'Motorcycle', plate: 'UNREADABLE', confidence: 62.5, verified: false, box: { top: '55%', left: '48%', width: '110px', height: '90px' }, plateBox: { top: '65%', left: '52%', width: '50px', height: '18px' } }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500 max-w-[1700px] mx-auto min-h-screen text-slate-100">
      
      {/* Top Operations Center Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-5 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.2)]">
            <Car className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white uppercase">Vehicle Intelligence Center</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-[#00E5FF] border border-cyan-500/30">
                LIVE ANPR HERO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Mission Control ANPR Identity, Bounding Box Overlays & Identity Verification Platform
            </p>
          </div>
        </div>

        {/* Executive Quick Stats & Exports */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-slate-800/50 rounded-2xl border border-slate-700/50 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Vehicles Today</span>
              <span className="text-white font-black text-sm">{stats.vehicles_today}</span>
            </div>
            <div className="h-6 w-px bg-slate-700"></div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">OCR Accuracy</span>
              <span className="text-emerald-400 font-black text-sm">{stats.ocr_accuracy}%</span>
            </div>
            <div className="h-6 w-px bg-slate-700"></div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Avg Confidence</span>
              <span className="text-cyan-400 font-black text-sm">{stats.avg_ocr_confidence}%</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => downloadExport('csv')} className="border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-xs">
              <Download className="w-3.5 h-3.5 mr-1.5" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadExport('excel')} className="border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-xs text-emerald-400">
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadExport('pdf')} className="border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-xs text-red-400">
              <FileText className="w-3.5 h-3.5 mr-1.5" /> PDF
            </Button>
          </div>
        </div>
      </div>

      {/* HERO SECTION: 70% Live Stream (Left) + 30% Live Intelligence Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT (70%): Hero Live Camera Feed Container */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/80 p-4 shadow-2xl relative overflow-hidden flex flex-col min-h-[480px]">
            
            {/* Camera Overlay Status Header */}
            <div className="flex items-center justify-between mb-3 px-2 z-20">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  LIVE ANPR FEED
                </div>
                <span className="text-sm font-bold text-white tracking-wide">Live City Camera 01 — Main Junction</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1 font-mono"><Zap className="w-3.5 h-3.5 text-amber-400" /> 30.0 FPS</span>
                <span className="flex items-center gap-1 font-mono"><Eye className="w-3.5 h-3.5 text-cyan-400" /> 1280x720</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> YOLOv11 + ByteTrack</span>
              </div>
            </div>

            {/* Video Stream Player with Real-Time Bounding Box Canvas Overlay */}
            <div className="relative flex-1 rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner group">
              <img 
                src="http://localhost:8000/api/v1/vision/stream?channel=vehicles" 
                alt="Live AI ANPR Stream" 
                className="w-full h-full object-cover min-h-[420px]"
              />

              {/* Dynamic AI Detections Overlay (Green Vehicle Bounding Box + Red Plate Bounding Box) */}
              {liveDetections.map((det, idx) => (
                <div 
                  key={idx}
                  onClick={() => fetchVehicleProfile(vehicles[idx]?.id || vehicles[0]?.id)}
                  style={{ top: det.box.top, left: det.box.left, width: det.box.width, height: det.box.height }}
                  className="absolute border-2 border-emerald-400/90 rounded-lg cursor-pointer transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] group/box"
                >
                  {/* Vehicle Label Tag */}
                  <div className="absolute -top-7 left-0 bg-emerald-500/90 backdrop-blur text-black font-black text-[11px] px-2 py-0.5 rounded shadow-lg flex items-center gap-1.5 tracking-tight">
                    <span>{det.id}</span>
                    <span className="opacity-80">| {det.type}</span>
                    <span className="bg-black/30 text-white px-1 rounded text-[9px]">{det.confidence}%</span>
                  </div>

                  {/* Red License Plate Bounding Box Overlay */}
                  <div 
                    style={{ top: det.plateBox.top, left: det.plateBox.left, width: det.plateBox.width, height: det.plateBox.height }}
                    className="absolute border-2 border-red-500 bg-red-500/20 rounded flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  >
                    <span className="text-[9px] font-black text-white font-mono bg-black/80 px-1 rounded tracking-tighter">
                      {det.plate}
                    </span>
                  </div>
                </div>
              ))}

              {/* Live Overlay HUD Reticle */}
              <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs flex items-center gap-3">
                <span className="text-slate-400">Tracking Active: <strong className="text-emerald-400">3 Vehicles</strong></span>
                <span className="h-3 w-px bg-slate-700"></span>
                <span className="text-slate-400">ANPR Engine: <strong className="text-cyan-400">OCR Persistent</strong></span>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT (30%): Live ANPR Intelligence Feed */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/80 p-5 shadow-2xl flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">Live Intelligence Feed</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  REAL-TIME STREAM
                </span>
              </div>

              {/* Animated Detection Cards Stream */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {!Array.isArray(vehicles) || vehicles.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs font-medium">Awaiting live ANPR detections...</div>
                ) : (
                  (Array.isArray(vehicles) ? vehicles : []).slice(0, 6).map((v: ANPRVehicle, idx: number) => (
                    <div 
                      key={v.id || idx}
                      onClick={() => fetchVehicleProfile(v.id)}
                      className="p-3.5 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-cyan-500/50 rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-between group shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:text-cyan-400 shrink-0">
                          {getIconForClass(v.vehicle_type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-cyan-400">TRK-{v.track_id}</span>
                            <span className="text-xs font-bold text-white">{v.vehicle_type}</span>
                          </div>
                          <p className="font-mono text-sm font-black text-white tracking-wider mt-0.5">{v.license_plate}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${v.ocr_confidence >= 70 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                          {v.ocr_confidence}%
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono">Just now</p>
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
                {isTableExpanded ? 'Hide ANPR Database Table' : 'Expand Searchable ANPR Database Table'}
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* EXPANDABLE SEARCHABLE DATABASE TABLE PANEL (BELOW LIVE SECTION) */}
      <div className={`bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/80 p-5 shadow-2xl space-y-4 transition-all duration-500 ${isTableExpanded ? 'block' : 'hidden md:block'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-black text-white uppercase tracking-wider">Searchable ANPR Intelligence Database</h3>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Plate (AP39AB1234), Track ID..." 
                className="pl-9 bg-slate-800/60 border-slate-700 text-xs" 
              />
            </div>

            {/* Vehicle Type Filter */}
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-800/60 border border-slate-700 rounded-xl text-slate-300 font-medium"
            >
              <option value="all">All Vehicles</option>
              <option value="Car">Cars</option>
              <option value="Truck">Trucks</option>
              <option value="Bus">Buses</option>
              <option value="Motorcycle">Motorcycles</option>
            </select>

            {/* Low Confidence Filter Toggle */}
            <Button 
              variant={lowConfidenceOnly ? "default" : "outline"} 
              size="sm"
              onClick={() => setLowConfidenceOnly(!lowConfidenceOnly)}
              className={`text-xs ${lowConfidenceOnly ? 'bg-red-600 hover:bg-red-700 text-white' : 'border-slate-700 text-slate-400'}`}
            >
              Low Confidence Only
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 bg-slate-800/40">
                <TableHead className="text-slate-400 font-bold">Track ID</TableHead>
                <TableHead className="text-slate-400 font-bold">Type</TableHead>
                <TableHead className="text-slate-400 font-bold">License Plate</TableHead>
                <TableHead className="text-slate-400 font-bold">OCR Confidence</TableHead>
                <TableHead className="text-slate-400 font-bold">Camera</TableHead>
                <TableHead className="text-slate-400 font-bold">Direction</TableHead>
                <TableHead className="text-slate-400 font-bold">First Seen</TableHead>
                <TableHead className="text-slate-400 font-bold">Status</TableHead>
                <TableHead className="text-right text-slate-400 font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-6 text-slate-500">Loading ANPR database...</TableCell></TableRow>
              ) : !Array.isArray(vehicles) || vehicles.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-6 text-slate-500">No ANPR vehicle records found.</TableCell></TableRow>
              ) : (
                (Array.isArray(vehicles) ? vehicles : []).map((v: ANPRVehicle) => (
                  <TableRow 
                    key={v.id} 
                    onClick={() => fetchVehicleProfile(v.id)}
                    className="border-slate-800/60 hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <TableCell className="font-mono text-xs font-bold text-cyan-400">TRK-{v.track_id}</TableCell>
                    <TableCell className="text-xs font-bold text-white">{v.vehicle_type}</TableCell>
                    <TableCell className="font-mono text-sm font-black text-white">{v.license_plate}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${v.ocr_confidence >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {v.ocr_confidence}%
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">{v.camera_id}</TableCell>
                    <TableCell className="text-xs text-slate-400">{v.direction || 'Northbound'}</TableCell>
                    <TableCell className="text-xs text-slate-500">{v.first_seen}</TableCell>
                    <TableCell>
                      <Badge variant={v.status === 'VERIFIED' ? 'success' : 'warning'} className="text-[10px] font-bold">
                        {v.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-cyan-400 hover:bg-cyan-500/10">Profile</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* VEHICLE PROFILE DRAWER */}
      {isProfileOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-end animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <Car className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h3 className="text-xl font-bold text-white">Vehicle Profile & ANPR Evidence</h3>
                    <p className="text-xs text-slate-400">Track ID: TRK-{selectedVehicle.track_id}</p>
                  </div>
                </div>
                <button onClick={closeProfile} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Crops */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Vehicle Crop</span>
                  <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                    <img src={`http://localhost:8000${selectedVehicle.vehicle_crop}`} alt="Vehicle Crop" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = '/login-bg.png'} />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Plate Crop</span>
                  <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-2">
                    <img src={`http://localhost:8000${selectedVehicle.plate_crop}`} alt="Plate Crop" className="max-h-full object-contain" onError={(e) => e.currentTarget.src = '/login-bg.png'} />
                  </div>
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                  <span className="text-slate-500">Canonical Plate</span>
                  <p className="font-bold text-white font-mono mt-0.5">{selectedVehicle.canonical_plate}</p>
                </div>
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                  <span className="text-slate-500">Raw OCR</span>
                  <p className="font-bold text-cyan-400 font-mono mt-0.5">{selectedVehicle.raw_ocr}</p>
                </div>
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                  <span className="text-slate-500">OCR Confidence</span>
                  <p className="font-bold text-emerald-400 font-mono mt-0.5">{selectedVehicle.ocr_confidence}%</p>
                </div>
              </div>

              {/* Timeline History */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-400">Camera Journey Timeline</h4>
                <div className="space-y-2">
                  {selectedVehicle.history?.map((h, i) => (
                    <div key={i} className="p-2.5 bg-slate-800/40 rounded-xl border border-slate-800 text-xs flex justify-between">
                      <span className="text-slate-300">{h.event}</span>
                      <span className="text-slate-500 font-mono">{h.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button variant="outline" onClick={closeProfile} className="w-full mt-4 border-slate-800">Close Drawer</Button>
          </div>
        </div>
      )}

    </div>
  );
}
