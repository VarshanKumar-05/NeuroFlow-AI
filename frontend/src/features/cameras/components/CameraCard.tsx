import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Camera, Edit2, RotateCw, VideoOff } from "lucide-react";

export interface CameraData {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline" | "maintenance";
  fps: number;
  lastActive: string;
}

interface CameraCardProps {
  camera: CameraData;
  onEdit: (camera: CameraData) => void;
}

export function CameraCard({ camera, onEdit }: CameraCardProps) {
  const isOnline = camera.status === "online";

  return (
    <Card className="overflow-hidden flex flex-col hover:border-[#00E5FF]/30 transition-colors">
      <div className="relative aspect-video bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-center">
        {isOnline ? (
          <div 
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage: 'url(/login-bg.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        ) : (
          <VideoOff className="w-8 h-8 text-slate-700" />
        )}
        <div className="absolute top-2 right-2">
          <Badge 
            variant={
              camera.status === 'online' ? 'success' : 
              camera.status === 'offline' ? 'destructive' : 'warning'
            }
          >
            {camera.status}
          </Badge>
        </div>
        {isOnline && (
          <div className="absolute bottom-2 left-2 flex items-center gap-2">
            <Badge variant="outline" className="bg-black/50 text-white border-white/20 backdrop-blur-md">
              {camera.fps} FPS
            </Badge>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Camera className="w-4 h-4 text-slate-500" />
          {camera.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2 flex-1">
        <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
          <p><span className="font-medium text-slate-700 dark:text-slate-300">Location:</span> {camera.location}</p>
          <p><span className="font-medium text-slate-700 dark:text-slate-300">Last Active:</span> {camera.lastActive}</p>
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => onEdit(camera)}>
          <Edit2 className="w-3 h-3 mr-2" />
          Edit
        </Button>
        <Button variant="outline" size="sm" className="flex-1 text-xs" disabled={!isOnline}>
          <RotateCw className="w-3 h-3 mr-2" />
          Restart
        </Button>
      </CardFooter>
    </Card>
  );
}
