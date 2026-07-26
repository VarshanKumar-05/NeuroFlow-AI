import { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { CameraData } from "./CameraCard";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  camera?: CameraData | null;
  onSave: (camera: Partial<CameraData>) => void;
}

export function CameraModal({ isOpen, onClose, camera, onSave }: CameraModalProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [rtspUrl, setRtspUrl] = useState("");

  useEffect(() => {
    if (camera) {
      setName(camera.name);
      setLocation(camera.location);
      setRtspUrl(`rtsp://mock-stream-url.com/${camera.id}`);
    } else {
      setName("");
      setLocation("");
      setRtspUrl("");
    }
  }, [camera, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: camera?.id,
      name,
      location,
      status: camera?.status || "offline",
      fps: camera?.fps || 0,
      lastActive: camera?.lastActive || "Never",
    });
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={camera ? "Edit Camera" : "Add New Camera"}
      description="Configure RTSP stream details and location metadata."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">
            Camera Name
          </label>
          <Input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. North Intersection Main"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">
            Location
          </label>
          <Input 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. 5th Ave & Broadway"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">
            RTSP Stream URL
          </label>
          <Input 
            value={rtspUrl}
            onChange={(e) => setRtspUrl(e.target.value)}
            placeholder="rtsp://user:pass@ip:port/stream"
            required
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#00E5FF] hover:bg-[#00d0e6] text-slate-900">
            {camera ? "Save Changes" : "Add Camera"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
