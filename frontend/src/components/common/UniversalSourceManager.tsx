import React, { useState } from 'react';
import axios from 'axios';
import { Video, Check, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface UniversalSourceManagerProps {
  channel?: string;
  className?: string;
  onSourceChanged?: () => void;
}

export function UniversalSourceManager({ channel = 'dashboard', className = '', onSourceChanged }: UniversalSourceManagerProps) {
  const [sourceType, setSourceType] = useState('dataset');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSetSource = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setIsError(false);
    setStatusMsg('');

    try {
      if (sourceType === 'upload' && file) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post(`${API_URL}/vision/upload?channel=${channel}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.status === 'error') {
          setIsError(true);
          setStatusMsg(res.data.message || 'Upload failed');
        } else {
          setStatusMsg('Source Set!');
          if (onSourceChanged) onSourceChanged();
        }
      } else {
        let sourceUrl = url;
        let finalType = sourceType;

        if (sourceType === 'dataset') {
          sourceUrl = '/app/Dataset.mp4';
          finalType = 'dataset';
        } else if (sourceType === 'accident_demo') {
          sourceUrl = '/app/Dataset_annotated.mp4';
          finalType = 'accident_demo';
        }

        const res = await axios.post(`${API_URL}/vision/source?channel=${channel}`, {
          type: finalType,
          url: sourceUrl,
          name: `Source (${sourceType})`,
          id: `src-${Date.now()}`
        });

        if (res.data.status === 'error') {
          setIsError(true);
          setStatusMsg(res.data.message || 'Failed');
        } else {
          setStatusMsg('Source Set!');
          if (onSourceChanged) onSourceChanged();
        }
      }
      setTimeout(() => setStatusMsg(''), 3500);
    } catch (err: any) {
      console.error('Failed to set source', err);
      setIsError(true);
      setStatusMsg(err.response?.data?.message || 'Connection Error');
      setTimeout(() => setStatusMsg(''), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-2.5 bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
      <select
        value={sourceType}
        onChange={(e) => {
          setSourceType(e.target.value);
          setUrl('');
          setFile(null);
          setStatusMsg('');
        }}
        className="bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
      >
        <option value="dataset">Demo Video</option>
        <option value="accident_demo">Accident Demo</option>
        <option value="upload">MP4 Upload</option>
        <option value="rtsp">RTSP Stream</option>
        <option value="youtube">YouTube Live</option>
        <option value="webcam">USB Webcam</option>
        <option value="ip">IP Camera</option>
      </select>

      {sourceType === 'upload' ? (
        <input
          type="file"
          accept="video/mp4,video/mkv,video/avi"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg p-1.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex-1 min-w-[200px]"
        />
      ) : (
        <input
          type="text"
          placeholder={
            sourceType === 'accident_demo'
              ? 'Built-in Accident Dataset (Dataset_annotated.mp4)'
              : sourceType === 'dataset'
              ? 'Built-in Demo Dataset (Dataset.mp4)'
              : 'Enter stream URL (e.g. YouTube / RTSP)...'
          }
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={sourceType === 'dataset' || sourceType === 'accident_demo'}
          className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex-1 min-w-[200px] placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-400"
        />
      )}

      <button
        onClick={handleSetSource}
        disabled={isLoading || (sourceType === 'upload' && !file)}
        className={`px-5 py-2 text-white font-bold text-sm rounded-lg transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5 min-w-[110px] ${
          isError
            ? 'bg-red-600 hover:bg-red-700'
            : statusMsg === 'Source Set!'
            ? 'bg-emerald-600 hover:bg-emerald-700'
            : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'
        } disabled:opacity-50`}
      >
        {isLoading ? (
          'Setting...'
        ) : statusMsg ? (
          statusMsg
        ) : (
          'Set Source'
        )}
      </button>
    </div>
  );
}
