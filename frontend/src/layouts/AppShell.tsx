import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, Eye, Car, TrendingUp, AlertTriangle, 
    BrainCircuit, Video, FileText, Sparkles, Bell, 
    Settings, LogOut, Search, Moon, Sun, User
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function AppShell() {
    const location = useLocation();
    const logout = useAuthStore(state => state.logout);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Live Vision', href: '/vision', icon: Eye },
        { name: 'Vehicle Intelligence', href: '/vehicles', icon: Car },
        { name: 'Traffic Analytics', href: '/analytics', icon: TrendingUp },
        { name: 'Incident Detection', href: '/incidents', icon: AlertTriangle },
        { name: 'AI Prediction', href: '/prediction', icon: BrainCircuit },
        { name: 'Camera Management', href: '/cameras', icon: Video },
        { name: 'Reports', href: '/reports', icon: FileText },
        { name: 'AI Assistant', href: '/ai', icon: Sparkles },
        { name: 'Notifications', href: '/notifications', icon: Bell },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
            {/* LEFT SIDEBAR */}
            <aside className="w-[260px] bg-white border-r border-[#E5E7EB] flex flex-col hidden md:flex transition-all duration-300 z-40">
                <div className="h-20 flex items-center px-6">
                    <img src="/logo-horizontal.png" alt="NeuroFlow AI" className="h-8 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    <span className="ml-2 text-xl font-extrabold tracking-tight text-[#0F172A]">NeuroFlow</span>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto overflow-x-hidden no-scrollbar">
                    {navigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors group"
                            >
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-blue-50 border border-blue-100 rounded-xl"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <item.icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
                                <span className={`relative z-10 transition-colors ${isActive ? 'text-blue-700 font-semibold' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-[#E5E7EB]">
                    <button 
                        onClick={() => logout()}
                        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                
                {/* TOP NAVBAR */}
                <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-[#E5E7EB] flex items-center justify-between px-8 sticky top-0 z-30 transition-all">
                    {/* Left: Mobile Logo */}
                    <div className="flex items-center md:hidden">
                        <span className="text-xl font-extrabold tracking-tight text-[#0F172A]">NeuroFlow</span>
                    </div>
                    
                    {/* Search */}
                    <div className="hidden md:flex flex-1 max-w-md relative group">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search cameras, incidents, or analytics..." 
                            className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-blue-200 focus:ring-4 focus:ring-blue-500/10 rounded-full pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                        />
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 md:gap-4 ml-auto">
                        <button className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        
                        <button className="hidden sm:flex items-center gap-2 p-2.5 px-4 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-full transition-all font-semibold text-sm shadow-sm">
                            <Sparkles className="w-4 h-4" /> AI Copilot
                        </button>
                        
                        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
                        
                        <button className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all">
                            <Moon className="w-5 h-5" />
                        </button>
                        
                        <button className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-800 to-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-md ml-2 hover:shadow-lg transition-shadow">
                            OP
                        </button>
                    </div>
                </header>

                {/* SCROLLABLE MAIN AREA */}
                <main className="flex-1 overflow-auto bg-[#F8FAFC] p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
