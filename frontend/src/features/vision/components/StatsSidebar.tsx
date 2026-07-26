import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Activity, Cpu, HardDrive, Zap } from 'lucide-react';

export function StatsSidebar() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00E5FF]" />
            Pipeline Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Inference Speed</p>
              <p className="text-xl font-bold font-mono">12.4<span className="text-sm text-slate-400 font-sans ml-1">ms</span></p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-xs text-slate-500">Tracker (ByteTrack)</p>
              <p className="text-xl font-bold font-mono">1.2<span className="text-sm text-slate-400 font-sans ml-1">ms</span></p>
            </div>
          </div>
          
          <div className="h-px bg-slate-100 dark:bg-slate-800" />
          
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Processing FPS</p>
              <p className="text-2xl font-bold text-green-500 font-mono">72.4</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-xs text-slate-500">Target FPS</p>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300 font-mono">30.0</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-500" />
            Hardware Utilization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400"><Cpu className="w-3 h-3"/> CPU Usage</span>
              <span className="font-mono">42%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '42%' }} />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400"><HardDrive className="w-3 h-3"/> GPU Memory (CUDA)</span>
              <span className="font-mono">2.1 / 8 GB</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: '26%' }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
