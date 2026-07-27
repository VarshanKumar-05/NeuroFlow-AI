import { useEffect } from 'react';
import { Search, Filter, Download, Car, Truck, Bus, Bike, FileSpreadsheet, FileText, CheckCircle2, AlertTriangle, X, Shield, Clock, Camera as CameraIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/DataTable';
import { useVehicleStore, ANPRVehicle } from '../store/vehicleStore';

const getIconForClass = (className: string) => {
  switch (className.toLowerCase()) {
    case 'car': return <Car className="w-4 h-4 text-blue-500" />;
    case 'truck': return <Truck className="w-4 h-4 text-amber-500" />;
    case 'bus': return <Bus className="w-4 h-4 text-indigo-500" />;
    case 'motorcycle': case 'bike': return <Bike className="w-4 h-4 text-purple-500" />;
    default: return <Car className="w-4 h-4 text-slate-500" />;
  }
};

export default function Vehicles() {
  const { 
    vehicles, stats, selectedVehicle, isProfileOpen, isLoading,
    searchQuery, selectedType, selectedDate, lowConfidenceOnly,
    setSearchQuery, setSelectedType, setSelectedDate, setLowConfidenceOnly,
    fetchStats, fetchVehicles, fetchVehicleProfile, closeProfile, downloadExport 
  } = useVehicleStore();

  useEffect(() => {
    fetchStats();
    fetchVehicles();
  }, [fetchStats, fetchVehicles]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight flex items-center gap-3">
            <Car className="w-10 h-10 text-[#00E5FF]" />
            Vehicle Intelligence Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg mt-1 font-medium">
            ANPR Identity, Verification, Search & Investigation Platform
          </p>
        </div>
        
        {/* Export Buttons */}
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={() => downloadExport('csv')}>
            <Download className="w-4 h-4 mr-1.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadExport('excel')}>
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadExport('pdf')}>
            <FileText className="w-4 h-4 mr-1.5 text-red-500" /> PDF
          </Button>
        </div>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Vehicles Today</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.vehicles_today}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Unique Plates</p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.unique_plates}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Repeated Vehicles</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{stats.repeated_vehicles}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">OCR Accuracy</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.ocr_accuracy}%</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Avg Confidence</p>
          <p className="text-2xl font-black text-amber-500 mt-1">{stats.avg_ocr_confidence}%</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Active Camera</p>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2 truncate">{stats.most_active_camera}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by License Plate (e.g. AP39AB1234), Track ID..." 
            className="pl-9" 
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Vehicle Type Filter */}
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="all">All Vehicle Types</option>
            <option value="car">Car</option>
            <option value="truck">Truck</option>
            <option value="bus">Bus</option>
            <option value="motorcycle">Motorcycle</option>
            <option value="emergency">Emergency</option>
          </select>

          {/* Time Filter */}
          <select 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
          </select>

          {/* Low Confidence Filter */}
          <button
            onClick={() => setLowConfidenceOnly(!lowConfidenceOnly)}
            className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
              lowConfidenceOnly 
                ? 'bg-amber-500 text-white border-amber-600' 
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            Low Confidence
          </button>
        </div>
      </div>

      {/* ANPR Vehicle Records Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Snapshot</TableHead>
              <TableHead>Track ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>License Plate</TableHead>
              <TableHead>OCR Conf</TableHead>
              <TableHead>Camera</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>First Seen</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow>
                    <TableCell colSpan={10} className="text-center py-6 text-slate-500">Loading ANPR records...</TableCell>
                </TableRow>
            ) : vehicles.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={10} className="text-center py-6 text-slate-500">No ANPR vehicle records found matching query.</TableCell>
                </TableRow>
            ) : vehicles.map((vehicle: ANPRVehicle) => (
              <TableRow 
                key={vehicle.id} 
                onClick={() => fetchVehicleProfile(vehicle.id)}
                className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {/* Vehicle & Plate Snapshot */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-9 rounded-md bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600 shrink-0">
                      <img 
                        src={`http://localhost:8000${vehicle.vehicle_snapshot}`} 
                        alt="Vehicle" 
                        className="w-full h-full object-cover"
                        onError={(e) => e.currentTarget.src = '/login-bg.png'}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  TRK-{vehicle.track_id}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 font-medium capitalize">
                    {getIconForClass(vehicle.vehicle_type)}
                    <span>{vehicle.vehicle_type}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-mono font-black text-sm px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white inline-block">
                    {vehicle.license_plate}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm font-semibold">
                  <span className={vehicle.ocr_confidence < 70 ? 'text-amber-500 font-bold' : 'text-emerald-600 dark:text-emerald-400'}>
                    {vehicle.ocr_confidence}%
                  </span>
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400 text-xs">
                  {vehicle.camera_id}
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  {vehicle.direction}
                </TableCell>
                <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                  {vehicle.first_seen}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={vehicle.status === 'VERIFIED' ? 'success' : (vehicle.status === 'LOW CONFIDENCE' ? 'warning' : 'secondary')} 
                    className="text-[10px] font-bold"
                  >
                    {vehicle.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); fetchVehicleProfile(vehicle.id); }}
                    className="h-8 px-2 text-[#00E5FF] hover:text-[#00d0e6] hover:bg-[#00E5FF]/10"
                  >
                    View Profile
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Vehicle Profile Details Drawer / Modal */}
      {isProfileOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full overflow-y-auto p-6 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-[#00E5FF]" />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Vehicle Intelligence Profile</h3>
                    <p className="text-xs text-slate-500">Track ID: TRK-{selectedVehicle.track_id}</p>
                  </div>
                </div>
                <button onClick={closeProfile} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Snapshots */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Vehicle Crop</span>
                  <div className="aspect-video bg-slate-800 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
                    <img 
                      src={`http://localhost:8000${selectedVehicle.vehicle_snapshot}`} 
                      alt="Vehicle Crop" 
                      className="w-full h-full object-cover"
                      onError={(e) => e.currentTarget.src = '/login-bg.png'}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Plate Crop</span>
                  <div className="aspect-video bg-slate-800 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 flex items-center justify-center p-2">
                    <img 
                      src={`http://localhost:8000${selectedVehicle.plate_snapshot}`} 
                      alt="Plate Crop" 
                      className="w-full h-[80%] object-contain"
                      onError={(e) => e.currentTarget.src = '/login-bg.png'}
                    />
                  </div>
                </div>
              </div>

              {/* Identity Matrix */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500">License Plate</span>
                  <span className="font-mono text-base font-black text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-900 px-3 py-1 rounded border border-slate-300 dark:border-slate-700">
                    {selectedVehicle.license_plate}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Raw OCR</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{selectedVehicle.raw_ocr}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Canonical Identifier</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{selectedVehicle.canonical_plate}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">OCR Confidence</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedVehicle.ocr_confidence}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">YOLO Detection Confidence</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{selectedVehicle.detection_confidence}%</span>
                </div>
              </div>

              {/* Movement & Location Specs */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 font-medium">Vehicle Type</span>
                  <p className="font-bold text-slate-900 dark:text-white capitalize mt-0.5">{selectedVehicle.vehicle_type}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 font-medium">Direction</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedVehicle.direction}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 font-medium">First Seen</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedVehicle.first_seen}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 font-medium">Time on Screen</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedVehicle.time_on_screen}</p>
                </div>
              </div>

              {/* Movement Timeline */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Movement Timeline & Repeated Visits
                </h4>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {selectedVehicle.history?.map((h, i) => (
                    <div key={i} className="text-xs p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{h.event}</p>
                        <p className="text-[10px] text-slate-400">{h.camera_id}</p>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">{h.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" onClick={closeProfile} className="w-full">
                Close Profile
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
