import React, { useState } from 'react';
import { Video, Upload, Youtube, Camera, MonitorPlay, Save } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface VideoSourceManagerProps {
  channel?: string;
  title?: string;
  compact?: boolean;
  onSourceApplied?: () => void;
}

export function VideoSourceManager({ channel = 'dashboard', title = 'Global Video Source', compact = false, onSourceApplied }: VideoSourceManagerProps) {
  const [sourceType, setSourceType] = useState('dataset');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  const handleApply = async () => {
    setIsLoading(true);
    setStatus({ type: null, message: '' });

    try {
      if (sourceType === 'upload' && file) {
        const formData = new FormData();
        formData.append('file', file);
        await axios.post(`${API_URL}/vision/upload?channel=${channel}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setStatus({ type: 'success', message: 'Video uploaded and applied!' });
        if (onSourceApplied) onSourceApplied();
      } else {
        let sourceUrl = url;
        if (sourceType === 'dataset') {
          sourceUrl = '/app/Dataset.mp4';
        }
        
        await axios.post(`${API_URL}/vision/source?channel=${channel}`, {
          type: sourceType === 'dataset' ? 'mp4' : sourceType,
          url: sourceUrl,
          name: `Custom ${sourceType} Source`,
          id: `src-${Date.now()}`
        });
        setStatus({ type: 'success', message: 'Source applied successfully!' });
        if (onSourceApplied) onSourceApplied();
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to apply source' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-[#1a1f2e] border border-slate-700 rounded-xl ${compact ? 'p-3 mb-4' : 'p-4 md:p-6 mb-6'}`}>
      <div className={`flex items-center gap-3 ${compact ? 'mb-3' : 'mb-4'}`}>
        <div className={`bg-blue-500/20 rounded-lg ${compact ? 'p-1.5' : 'p-2'}`}>
          <MonitorPlay className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-blue-400`} />
        </div>
        <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-white`}>{title}</h3>
      </div>
      
      <div className={`grid grid-cols-2 md:grid-cols-4 ${compact ? 'gap-2 mb-3' : 'gap-4 mb-4'}`}>
        <button
          onClick={() => setSourceType('dataset')}
          className={`flex items-center justify-center gap-2 rounded-lg border transition-all ${compact ? 'p-2 text-xs' : 'p-3 text-sm'} ${
            sourceType === 'dataset' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#0f1219] border-slate-700 text-slate-300 hover:border-slate-500'
          }`}
        >
          <Video className="w-4 h-4" /> {compact ? 'Demo' : 'Demo Dataset'}
        </button>
        
        <button
          onClick={() => setSourceType('upload')}
          className={`flex items-center justify-center gap-2 rounded-lg border transition-all ${compact ? 'p-2 text-xs' : 'p-3 text-sm'} ${
            sourceType === 'upload' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#0f1219] border-slate-700 text-slate-300 hover:border-slate-500'
          }`}
        >
          <Upload className="w-4 h-4" /> {compact ? 'MP4' : 'MP4 Upload'}
        </button>
        
        <button
          onClick={() => setSourceType('youtube')}
          className={`flex items-center justify-center gap-2 rounded-lg border transition-all ${compact ? 'p-2 text-xs' : 'p-3 text-sm'} ${
            sourceType === 'youtube' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#0f1219] border-slate-700 text-slate-300 hover:border-slate-500'
          }`}
        >
          <Youtube className="w-4 h-4" /> YouTube
        </button>
        
        <button
          onClick={() => setSourceType('rtsp')}
          className={`flex items-center justify-center gap-2 rounded-lg border transition-all ${compact ? 'p-2 text-xs' : 'p-3 text-sm'} ${
            sourceType === 'rtsp' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#0f1219] border-slate-700 text-slate-300 hover:border-slate-500'
          }`}
        >
          <Camera className="w-4 h-4" /> {compact ? 'IP/RTSP' : 'IP/RTSP Cam'}
        </button>
      </div>

      <div className={`flex flex-col md:flex-row ${compact ? 'gap-2' : 'gap-4'} items-start md:items-center`}>
        <div className="flex-1 w-full">
          {sourceType === 'upload' ? (
            <input 
              type="file" 
              accept="video/mp4" 
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className={`w-full bg-[#0f1219] border border-slate-700 rounded-lg text-white focus:border-blue-500 outline-none ${compact ? 'p-2 text-xs' : 'p-2.5 text-sm'}`}
            />
          ) : sourceType !== 'dataset' ? (
            <input 
              type="text" 
              placeholder={`Enter ${sourceType.toUpperCase()} URL...`}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={`w-full bg-[#0f1219] border border-slate-700 rounded-lg text-white focus:border-blue-500 outline-none ${compact ? 'p-2 text-xs' : 'p-3 text-sm'}`}
            />
          ) : (
            <div className={`bg-[#0f1219] border border-slate-700 rounded-lg text-slate-400 ${compact ? 'p-2 text-xs' : 'p-3 text-sm'}`}>
              Using embedded live city dataset...
            </div>
          )}
        </div>
        
        <button
          onClick={handleApply}
          disabled={isLoading || (sourceType === 'upload' && !file) || (sourceType !== 'dataset' && sourceType !== 'upload' && !url)}
          className={`flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 text-white rounded-lg font-medium transition-all ${compact ? 'px-4 py-2 text-xs' : 'px-6 py-3 text-sm'}`}
        >
          <Save className="w-4 h-4" />
          {isLoading ? 'Applying...' : 'Apply Source'}
        </button>
      </div>
      
      {status.message && (
        <div className={`mt-4 p-3 rounded-lg ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {status.message}
        </div>
      )}
    </div>
  );
}
