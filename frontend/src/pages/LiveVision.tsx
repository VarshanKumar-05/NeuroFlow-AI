import React, { useState } from 'react';
import { VideoPlayer } from '../features/vision/components/VideoPlayer';
import { DetectionTable } from '../features/vision/components/DetectionTable';
import { StatsSidebar } from '../features/vision/components/StatsSidebar';
import { Camera, Settings2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export default function LiveVision() {
  const currentChannel = 'dashboard';

  // Source Manager State
  const [sourceType, setSourceType] = useState('dataset');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSetSource = async () => {
    setIsLoading(true);
    try {
      if (sourceType === 'upload' && file) {
        const formData = new FormData();
        formData.append('file', file);
        await axios.post(`${API_URL}/vision/upload?channel=${currentChannel}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setStatusMsg('Applied!');
      } else {
        let sourceUrl = url;
        if (sourceType === 'dataset') sourceUrl = '/app/Dataset.mp4';
        
        await axios.post(`${API_URL}/vision/source?channel=${currentChannel}`, {
          type: sourceType === 'dataset' ? 'mp4' : sourceType,
          url: sourceUrl,
          name: `Custom ${sourceType}`,
          id: `src-${Date.now()}`
        });
        setStatusMsg('Applied!');
      }
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setStatusMsg('Error!');
      setTimeout(() => setStatusMsg(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-4rem)] flex flex-col gap-4 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <Camera className="w-8 h-8 text-[#00E5FF]" />
            Live AI Vision
          </h1>
          <p className="text-slate-500 text-lg mt-1 font-medium">Real-time YOLOv11 vehicle detection and tracking.</p>
        </div>
        
        {/* Sleek Inline Source Selector */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <select 
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
            className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none font-medium"
          >
            <option value="dataset">Demo Video</option>
            <option value="upload">MP4 Upload</option>
            <option value="rtsp">RTSP Stream</option>
            <option value="youtube">YouTube Live</option>
            <option value="webcam">USB Webcam</option>
            <option value="ip">IP Camera</option>
          </select>

          {sourceType === 'upload' ? (
            <input 
              type="file" 
              accept="video/mp4" 
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none w-64"
            />
          ) : (
            <input 
              type="text" 
              placeholder={sourceType === 'dataset' ? 'Built-in Demo Dataset (Dataset.mp4)' : 'Enter stream URL...'}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={sourceType === 'dataset'}
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none w-64 placeholder:text-slate-400 disabled:bg-slate-50"
            />
          )}

          <button
            onClick={handleSetSource}
            disabled={isLoading || (sourceType === 'upload' && !file)}
            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Wait...' : (statusMsg || 'Set Source')}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        
        {/* Left Column: Video Feed */}
        <div className="lg:col-span-3 flex flex-col min-h-0 shadow-[0_0_20px_rgba(0,229,255,0.05)] rounded-xl border border-[#00E5FF]/20">
          <VideoPlayer streamUrl={`http://localhost:8000/api/v1/vision/stream?channel=${currentChannel}`} />
        </div>

        {/* Right Column: Stats & Detections */}
        <div className="lg:col-span-1 flex flex-col gap-4 min-h-0">
          <div className="shrink-0">
            <StatsSidebar />
          </div>
          <div className="flex-1 min-h-0">
            <DetectionTable />
          </div>
        </div>

      </div>
    </div>
  );
}
