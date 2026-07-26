import { Maximize2, Play, Pause, CameraOff } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { useState } from 'react';

interface VideoPlayerProps {
  streamUrl?: string;
  sourceName?: string;
  isActive?: boolean;
}

export function VideoPlayer({ streamUrl, sourceName = "Camera 1 - Main Intersection", isActive = true }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-xl relative">
      {/* Video header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <Badge variant={isActive ? "success" : "destructive"} className="animate-pulse shadow-lg">
            {isActive ? "LIVE STREAM" : "OFFLINE"}
          </Badge>
          <span className="text-white font-medium drop-shadow-md">{sourceName}</span>
        </div>
        <button className="text-white/70 hover:text-white transition-colors bg-black/20 p-1.5 rounded-md backdrop-blur-sm">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Video Content */}
      <div className="flex-1 relative flex items-center justify-center bg-black/90">
        {isActive && streamUrl && isPlaying ? (
          <img 
            src={streamUrl} 
            alt="Live Vision Stream" 
            className="w-full h-full object-contain"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500">
            <CameraOff className="w-12 h-12 mb-4 opacity-50" />
            <p>Stream Paused or Unavailable</p>
          </div>
        )}
        
        {/* Futuristic Overlay Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjMDBFNUZGIiBzdHJva2Utd2lkdGg9IjAuNSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTAgNDBoNDBNNDAgMHY0MCIvPjwvZz48L3N2Zz4=')]"></div>
      </div>

      {/* Video Controls */}
      <div className="h-14 border-t border-slate-800 bg-slate-900 flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-white hover:text-[#00E5FF] transition-colors flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-800"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          
          <div className="h-4 w-px bg-slate-700"></div>
          
          <div className="text-xs font-mono text-[#00E5FF]">
            YOLOv11 + ByteTrack
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
          <span>RES: 1920x1080</span>
          <span>LATENCY: 42ms</span>
        </div>
      </div>
    </div>
  );
}
