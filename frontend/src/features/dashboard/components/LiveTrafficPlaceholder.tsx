import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Camera, Maximize2 } from "lucide-react";

export function LiveTrafficPlaceholder() {
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-[#00E5FF]/30 shadow-[0_0_20px_rgba(0,229,255,0.1)] overflow-hidden flex flex-col h-full min-h-[400px]">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Camera className="text-[#00E5FF] w-5 h-5" />
            Live AI Vision Feed
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="success" className="animate-pulse">Live Tracking</Badge>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative bg-slate-950 flex flex-col items-center justify-center">
        
        {/* Background Image showing YOLO tracking */}
        <div 
          className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none"
          style={{
            backgroundImage: 'url(/login-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        {/* Overlay grid lines for aesthetic */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjMDBFNUZGIiBzdHJva2Utd2lkdGg9IjAuNSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTAgNDBoNDBNNDAgMHY0MCIvPjwvZz48L3N2Zz4=')] opacity-20 z-0"></div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-md p-6 bg-slate-950/60 backdrop-blur-md rounded-2xl border border-slate-800">
          <div className="w-16 h-16 rounded-full bg-[#00E5FF]/10 flex items-center justify-center mb-4">
            <Camera className="w-8 h-8 text-[#00E5FF]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Awaiting Video Source</h3>
          <p className="text-slate-400 text-sm mb-6">
            Phase 3 will integrate live RTSP streams with YOLOv11 + ByteTrack to display real-time bounding boxes and trajectories here.
          </p>
          <div className="flex gap-4 w-full">
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-3">
              <div className="text-xs text-slate-500 mb-1">FPS</div>
              <div className="text-xl font-mono text-white">--</div>
            </div>
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-3">
              <div className="text-xs text-slate-500 mb-1">Detections</div>
              <div className="text-xl font-mono text-white">--</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
