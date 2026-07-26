import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { Car, Truck, Bus, Bike } from 'lucide-react';

interface Detection {
  track_id: number;
  class_name: string;
  conf: number;
  speed?: string;
  lane?: string;
}

// Mock initial data
const mockDetections: Detection[] = [
  { track_id: 104, class_name: 'car', conf: 0.95, speed: '45 mph', lane: 'L1' },
  { track_id: 105, class_name: 'truck', conf: 0.88, speed: '40 mph', lane: 'L2' },
  { track_id: 106, class_name: 'motorcycle', conf: 0.91, speed: '52 mph', lane: 'L1' },
  { track_id: 107, class_name: 'bus', conf: 0.96, speed: '38 mph', lane: 'L3' },
];

const getIconForClass = (className: string) => {
  switch (className.toLowerCase()) {
    case 'car': return <Car className="w-4 h-4 text-blue-500" />;
    case 'truck': return <Truck className="w-4 h-4 text-orange-500" />;
    case 'bus': return <Bus className="w-4 h-4 text-green-500" />;
    case 'motorcycle': return <Bike className="w-4 h-4 text-purple-500" />;
    default: return <Car className="w-4 h-4 text-slate-500" />;
  }
};

export function DetectionTable({ detections = mockDetections }: { detections?: Detection[] }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          Active Detections
          <Badge variant="outline" className="ml-2 font-mono text-xs">{detections.length}</Badge>
        </h3>
      </div>
      
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Track ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Speed</TableHead>
              <TableHead>Conf</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {detections.map((det) => (
              <TableRow key={det.track_id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <TableCell className="font-mono text-xs font-medium text-slate-600 dark:text-slate-300">
                  #{det.track_id}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 capitalize">
                    {getIconForClass(det.class_name)}
                    <span className="text-sm">{det.class_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{det.speed || '--'}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] font-mono border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/5">
                    {Math.round(det.conf * 100)}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {detections.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                  No active detections.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
