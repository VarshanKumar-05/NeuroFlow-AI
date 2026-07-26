import { useEffect, useState } from 'react';
import { Camera, Plus } from 'lucide-react';
import { CameraCard, CameraData } from '../features/cameras/components/CameraCard';
import { CameraModal } from '../features/cameras/components/CameraModal';
import { Button } from '../components/ui/Button';
import { useCameraStore } from '../store/cameraStore';

export default function Cameras() {
  const { cameras, fetchCameras, addCamera, updateCamera } = useCameraStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<CameraData | null>(null);

  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

  const handleAddCamera = () => {
    setSelectedCamera(null);
    setIsModalOpen(true);
  };

  const handleEditCamera = (camera: CameraData) => {
    setSelectedCamera(camera);
    setIsModalOpen(true);
  };

  const handleSaveCamera = (cameraData: Partial<CameraData>) => {
    if (cameraData.id) {
      updateCamera(cameraData);
    } else {
      addCamera(cameraData);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-3">
            <Camera className="w-10 h-10 text-[#00E5FF]" />
            Camera Management
          </h1>
          <p className="text-slate-500 text-lg mt-1 font-medium">Configure and monitor your AI vision network sources.</p>
        </div>
        <Button onClick={handleAddCamera} className="bg-[#00E5FF] hover:bg-[#00d0e6] text-slate-900 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
          <Plus className="w-4 h-4 mr-2" />
          Add Camera
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cameras.map(camera => (
          <CameraCard key={camera.id} camera={camera} onEdit={handleEditCamera} />
        ))}
      </div>

      <CameraModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        camera={selectedCamera}
        onSave={handleSaveCamera}
      />
    </div>
  );
}
