import { useEffect } from 'react';
import { Search, Filter, Download, Car, Truck, Bus, Bike } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/DataTable';
import { useVehicleStore } from '../store/vehicleStore';

const getIconForClass = (className: string) => {
  switch (className.toLowerCase()) {
    case 'car': return <Car className="w-4 h-4 text-blue-500" />;
    case 'truck': return <Truck className="w-4 h-4 text-orange-500" />;
    case 'bus': return <Bus className="w-4 h-4 text-green-500" />;
    case 'motorcycle': return <Bike className="w-4 h-4 text-purple-500" />;
    default: return <Car className="w-4 h-4 text-slate-500" />;
  }
};

export default function Vehicles() {
  const { vehicles, isLoading, fetchVehicles } = useVehicleStore();

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-3">
            <Car className="w-10 h-10 text-[#00E5FF]" />
            Vehicle Intelligence
          </h1>
          <p className="text-slate-500 text-lg mt-1 font-medium">Search and analyze historical tracked vehicles and trajectories.</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search by Track ID..." className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Type
          </Button>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Camera
          </Button>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Time Range
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Track ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Speed</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">Loading vehicles...</TableCell>
                </TableRow>
            ) : vehicles.map((vehicle) => (
              <TableRow key={vehicle.id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <TableCell className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                  {vehicle.id}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 capitalize">
                    {getIconForClass(vehicle.type)}
                    <span>{vehicle.type}</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-500 dark:text-slate-400">
                  {vehicle.timestamp}
                </TableCell>
                <TableCell className="font-mono">
                  {vehicle.speed}
                </TableCell>
                <TableCell>
                  {vehicle.location}
                </TableCell>
                <TableCell>
                  <Badge variant={vehicle.status === 'Tracked' ? 'success' : 'secondary'} className="text-xs">
                    {vehicle.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-[#00E5FF] hover:text-[#00d0e6] hover:bg-[#00E5FF]/10">
                    View Profile
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}
