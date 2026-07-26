import React, { useState } from 'react';
import { ArrowRight, Search, FileText, Activity, Video, Sparkles } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export function AICopilot() {
    const [status, setStatus] = useState<'idle' | 'thinking' | 'generating'>('idle');
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('Ask NeuroFlow anything about your city');

    const suggestions = [
        { label: "Show busiest road", icon: Activity },
        { label: "Generate report", icon: FileText },
        { label: "Predict congestion", icon: Activity },
        { label: "Show incidents", icon: Search },
        { label: "Open Camera 5", icon: Video },
    ];

    const loadingMessages = [
        "Checking live traffic...",
        "Analyzing city conditions...",
        "Looking at the latest traffic data...",
        "Gathering information...",
        "One moment..."
    ];

    const getFallbackMessage = (q: string) => {
        const lowerQ = q.toLowerCase();
        if (lowerQ.includes('busiest road')) return "I couldn't retrieve the latest traffic data. Please try again.";
        if (lowerQ.includes('generate report')) return "I wasn't able to generate the report right now.";
        if (lowerQ.includes('predict congestion')) return "The prediction service is temporarily unavailable.";
        if (lowerQ.includes('camera')) return "I couldn't connect to Camera 5.";
        return "Sorry, I couldn't retrieve the latest traffic information right now. Please try again in a moment.";
    };

    const fetchCopilotResponse = async (text: string, retries = 1): Promise<string> => {
        try {
            const res = await fetch('http://localhost:8000/api/v1/copilot/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: text })
            });
            if (!res.ok) throw new Error("API Error");
            const data = await res.json();
            return data.response;
        } catch (error) {
            if (retries > 0) {
                return fetchCopilotResponse(text, retries - 1);
            }
            throw error;
        }
    };

    const handleSubmit = async (e?: React.FormEvent, directQuery?: string) => {
        if (e) e.preventDefault();
        const textToSubmit = directQuery || query;
        if (!textToSubmit.trim() && status === 'idle') return;
        
        setStatus('thinking');
        setResponse(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
        
        try {
            setStatus('generating');
            const answer = await fetchCopilotResponse(textToSubmit);
            setResponse(answer);
        } catch (error) {
            setResponse(getFallbackMessage(textToSubmit));
        } finally {
            setStatus('idle');
            setQuery('');
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-blue-500/20 group">
            {/* Background Glow */}
            <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-colors duration-1000 ${status !== 'idle' ? 'bg-blue-400/20 animate-pulse' : 'bg-blue-500/10'}`} />
            
            <div className="flex items-center justify-between gap-4 mb-6 relative z-10">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        AI Copilot 
                        {status !== 'idle' && <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />}
                    </h3>
                    <p className="text-slate-600 text-sm mt-1 leading-relaxed max-w-[90%]">
                        {status !== 'idle' ? <span className="text-blue-500 font-bold animate-pulse">{response}</span> : response}
                    </p>
                </div>
                <div className="shrink-0 w-[100px] h-[100px] relative">
                    {/* Ring Pulse Effect when active */}
                    {status !== 'idle' && (
                        <div className="absolute inset-2 border-[3px] border-blue-400 rounded-full animate-ping opacity-20 pointer-events-none" />
                    )}
                    <DotLottieReact src="/animation/ai chatbot.lottie" loop autoplay speed={status === 'idle' ? 1 : 1.5} />
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-end relative z-10">
                <div className={`flex flex-wrap gap-2 mb-6 transition-opacity duration-300 ${status !== 'idle' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    {suggestions.map((s, i) => (
                        <button 
                            key={i} 
                            onClick={() => { setQuery(s.label); handleSubmit(undefined, s.label); }}
                            className="flex items-center gap-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-600 hover:text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:-translate-y-0.5"
                        >
                            <s.icon className="w-3.5 h-3.5" />
                            {s.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="relative group/input">
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={status !== 'idle'}
                        placeholder="Ask NeuroFlow AI..." 
                        className="w-full bg-slate-50 border-2 border-slate-100 group-hover/input:border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl pl-5 pr-14 py-4 text-slate-900 font-medium placeholder:text-slate-400 outline-none transition-all shadow-inner disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                    <button 
                        type="submit"
                        disabled={status !== 'idle'}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors shadow-md hover:shadow-lg"
                    >
                        <ArrowRight className={`w-5 h-5 ${status !== 'idle' ? 'animate-pulse' : ''}`} />
                    </button>
                </form>
            </div>
        </div>
    );
}
