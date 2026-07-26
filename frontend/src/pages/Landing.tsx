import { Link } from 'react-router-dom';
import { Activity, User, Settings, CheckCircle2, BrainCircuit, Cloud, PlayCircle } from 'lucide-react';

export default function Landing() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] to-[#E6F0FA] text-slate-900 font-sans relative overflow-hidden flex flex-col">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#00E5FF] opacity-10 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full"></div>
                
                {/* Subtle Grid or Rays can be added via SVG, omitted for simplicity */}
            </div>

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl w-full mx-auto">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-slate-900 text-[#00E5FF]">
                        <span className="font-bold text-xl leading-none">N</span>
                    </div>
                    <Activity className="text-[#00E5FF] w-6 h-6" />
                    <span className="text-xl font-bold tracking-tight ml-1">NeuroFlow AI</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white backdrop-blur border border-slate-200 rounded-lg shadow-sm font-medium transition-colors">
                        <User className="w-4 h-4" /> Profile
                    </Link>
                    <Link to="/settings" className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white backdrop-blur border border-slate-200 rounded-lg shadow-sm font-medium transition-colors">
                        <Settings className="w-4 h-4" /> Settings
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-between px-8 max-w-7xl w-full mx-auto pt-10 pb-20 gap-16">
                
                {/* Left Side: Copy */}
                <div className="flex-1 max-w-xl">
                    <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-slate-400 mb-6">
                        Unlock <span className="text-slate-900">Real-Time<br/>Intelligence with<br/>NeuroFlow AI</span>
                    </h1>
                    <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-md">
                        Advanced YOLO Tracking and Analytics for Smarter Decisions. Elevate Your Operations.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link to="/login" className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] rounded-xl blur opacity-70 group-hover:opacity-100 transition duration-200"></div>
                            <div className="relative px-6 py-3 bg-[#00E5FF] hover:bg-[#00d0e6] text-white font-medium rounded-lg transition-colors flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.5)]">
                                Get Started Free
                            </div>
                        </Link>
                        <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">
                            <PlayCircle className="w-5 h-5 text-slate-400" /> Watch Demo
                        </button>
                    </div>
                </div>

                {/* Right Side: Image and Badges */}
                <div className="flex-1 relative w-full max-w-2xl mt-16 lg:mt-0 perspective-[1000px]">
                    {/* Floating Badges */}
                    <div className="absolute -top-8 left-0 z-20 bg-green-500 text-white px-4 py-2 rounded-lg rounded-bl-none shadow-lg shadow-green-500/20 flex items-center gap-2 animate-[bounce_3s_ease-in-out_infinite]">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium text-sm">High-Accuracy<br/>YOLOv8</span>
                        {/* Caret */}
                        <div className="absolute -bottom-2 left-0 w-4 h-4 bg-green-500 clip-triangle"></div>
                    </div>

                    <div className="absolute -top-12 left-[30%] z-20 bg-[#00E5FF] text-white px-4 py-2 rounded-lg rounded-bl-none shadow-lg shadow-[#00E5FF]/20 flex items-center gap-2 animate-[bounce_4s_ease-in-out_infinite]">
                        <BrainCircuit className="w-5 h-5" />
                        <span className="font-medium text-sm">Real-Time<br/>Processing & Insights</span>
                    </div>

                    <div className="absolute -top-6 right-8 z-20 bg-green-500 text-white px-4 py-2 rounded-lg rounded-bl-none shadow-lg shadow-green-500/20 flex items-center gap-2 animate-[bounce_3.5s_ease-in-out_infinite]">
                        <Cloud className="w-5 h-5" />
                        <span className="font-medium text-sm">Scalable Cloud<br/>Integration</span>
                    </div>
                    
                    <div className="absolute top-4 right-4 z-20 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider shadow-lg flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        LIVE
                    </div>

                    {/* 3D Image Container */}
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 transform rotate-x-[5deg] rotate-y-[-10deg] rotate-z-[2deg] hover:rotate-0 transition-transform duration-700 ease-out z-10 bg-slate-100">
                        <img 
                            src="/demo-image.png" 
                            alt="Traffic Dashboard Demo" 
                            className="w-full h-auto object-cover aspect-video"
                        />
                        {/* Overlay mock bounding boxes for extra realism if image is just plain */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                        
                        {/* Mock Box 1 */}
                        <div className="absolute top-[30%] left-[40%] w-16 h-16 border-2 border-[#00E5FF] bg-[#00E5FF]/10 flex flex-col justify-end">
                            <div className="bg-[#00E5FF] text-white text-[8px] px-1 font-mono">ID: 1042 Car</div>
                        </div>
                        {/* Mock Box 2 */}
                        <div className="absolute top-[60%] right-[20%] w-10 h-20 border-2 border-green-500 bg-green-500/10 flex flex-col justify-end">
                            <div className="bg-green-500 text-white text-[8px] px-1 font-mono">ID: 3051 Ped</div>
                        </div>
                    </div>
                    
                    {/* Shadow under image */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-4/5 h-20 bg-black/10 blur-2xl rounded-[100%] z-0"></div>
                </div>

            </main>

            {/* Footer */}
            <footer className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl w-full mx-auto text-sm text-slate-500 mt-auto border-t border-slate-200/50">
                <div>&copy; NeuroFlow AI. All rights reserved.</div>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-slate-800 transition-colors">Key Lowing Links</a>
                    <a href="#" className="hover:text-slate-800 transition-colors">Contact</a>
                </div>
            </footer>
        </div>
    );
}
