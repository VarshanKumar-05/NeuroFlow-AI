import React, { useState } from 'react';
import { VideoPlayer } from '../features/vision/components/VideoPlayer';
import { DetectionTable } from '../features/vision/components/DetectionTable';
import { StatsSidebar } from '../features/vision/components/StatsSidebar';
import { UniversalSourceManager } from '../components/common/UniversalSourceManager';
import { Camera, Settings2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export default function LiveVision() {
  const currentChannel = 'live_vision';

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
        
        {/* Universal Source Manager Component */}
        <UniversalSourceManager channel={currentChannel} />
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
