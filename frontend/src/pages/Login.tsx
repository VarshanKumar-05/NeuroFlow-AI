import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { 
    Activity, Mail, Lock, Eye, EyeOff, 
    Video, Target, ShieldCheck, CheckCircle2
} from 'lucide-react';

// Animation variants
const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 28 } }
};

import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export default function Login() {
    const [email, setEmail] = useState('admin@neuroflow.ai');
    const [password, setPassword] = useState('admin123');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const login = useAuthStore(state => state.setTokens);
    const setUser = useAuthStore(state => state.setUser);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password
            });
            login(response.data.access_token, response.data.refresh_token);
            // Optionally decode JWT or set a default user
            setUser({ email, role: 'Admin' });
            navigate('/welcome');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex bg-[#F8FAFC] font-sans p-4 md:p-6 overflow-hidden">
            
            {/* Outer Container mimicking premium SaaS layout */}
            <div className="w-full h-full max-w-[1800px] mx-auto flex flex-col lg:flex-row bg-white rounded-[28px] shadow-[0_30px_80px_rgba(15,23,42,0.10)] overflow-hidden border border-[#E2E8F0] relative">
                
                {/* LEFT SECTION - VIDEO HERO (65% width) */}
                <div className="relative hidden lg:flex lg:w-[65%] flex-col justify-between p-12 z-0 overflow-hidden">
                    
                    {/* Background Video */}
                    <div className="absolute inset-0 z-[-2]">
                        <video 
                            src="/videos/login-bg.mp4"
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            preload="auto"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Gradient Overlay for Text Readability */}
                    <div 
                        className="absolute inset-0 z-[-1]" 
                        style={{
                            background: 'linear-gradient(90deg, rgba(255,255,255,.88), rgba(255,255,255,.45), rgba(255,255,255,.10))'
                        }} 
                    />

                    {/* Gradient Overlay for Text Readability */}
                    <div 
                        className="absolute inset-0 z-[-1]" 
                        style={{
                            background: 'linear-gradient(90deg, rgba(255,255,255,.70) 0%, rgba(255,255,255,.35) 35%, rgba(255,255,255,.08) 70%, rgba(255,255,255,0) 100%)'
                        }} 
                    />

                    {/* Top Branding */}
                    <motion.div 
                        initial="hidden" animate="show" variants={staggerContainer}
                        className="relative z-10 h-full flex flex-col justify-center"
                    >
                        {/* Logo */}
                        <motion.div variants={fadeUp} className="absolute top-6 left-8">
                            <img src="/logo-horizontal.png" alt="NeuroFlow AI Logo" className="h-28 w-auto object-contain mix-blend-screen drop-shadow-lg" />
                        </motion.div>

                        {/* Middle Content */}
                        <div className="mt-16 max-w-[520px]">
                            <motion.h2 
                                variants={fadeUp} 
                                className="text-[56px] 2xl:text-[72px] font-[800] tracking-tight leading-[0.95] mb-4 2xl:mb-6 text-[#0F172A]"
                            >
                                Smarter Traffic.<br />
                                <span 
                                    className="text-transparent bg-clip-text"
                                    style={{ backgroundImage: 'linear-gradient(90deg, #2563EB, #4F8CFF)' }}
                                >
                                    Better Tomorrow.
                                </span>
                            </motion.h2>
                            
                            <motion.p variants={fadeUp} className="text-[18px] 2xl:text-[22px] text-[#334155] font-medium mb-8 2xl:mb-12 leading-relaxed">
                                AI-Powered traffic management system that optimizes flow, reduces congestion and saves lives.
                            </motion.p>

                            {/* Feature List */}
                            <div className="space-y-3 2xl:space-y-4 relative">
                                {/* Video Effects Container - Particles & Glow */}
                                <div className="absolute -inset-10 bg-[#00E5FF]/5 blur-[100px] rounded-full pointer-events-none -z-10" />

                                {[
                                    { icon: <Activity className="w-5 h-5 text-[#2563EB]" />, bg: "bg-blue-100", title: "AI Driven Insights", desc: "Real-time analytics and predictions" },
                                    { icon: <Video className="w-5 h-5 text-[#10B981]" />, bg: "bg-emerald-100", title: "Smart Signal Control", desc: "Adaptive signal optimization" },
                                    { icon: <Target className="w-5 h-5 text-[#8B5CF6]" />, bg: "bg-purple-100", title: "Live Monitoring", desc: "24/7 real-time traffic surveillance" },
                                    { icon: <ShieldCheck className="w-5 h-5 text-[#F59E0B]" />, bg: "bg-amber-100", title: "Emergency Priority", desc: "Smart detection & instant clearance" }
                                ].map((feature, idx) => (
                                    <motion.div 
                                        key={idx} 
                                        variants={fadeUp} 
                                        className="flex items-center gap-4 group py-1"
                                    >
                                        <div className={`w-10 h-10 2xl:w-12 2xl:h-12 rounded-xl ${feature.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm relative`}>
                                            <div className="absolute inset-0 rounded-xl bg-white/20 blur-sm mix-blend-overlay group-hover:opacity-100 opacity-0 transition-opacity" />
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-[15px] 2xl:text-[17px] font-bold text-[#0F172A] leading-tight">{feature.title}</h4>
                                            <p className="text-[13px] 2xl:text-[14px] text-[#334155] font-medium mt-0.5 2xl:mt-1">{feature.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>


                    </motion.div>
                </div>

                {/* RIGHT SECTION - AUTHENTICATION (35% width) */}
                <div className="w-full lg:w-[35%] h-full flex flex-col bg-white relative z-10 border-l border-[#F1F5F9]">
                    
                    <div className="flex-1 flex flex-col justify-center px-8 md:px-14">
                        <motion.div 
                            initial="hidden" animate="show" variants={slideInRight}
                            className="w-full max-w-[380px] mx-auto"
                        >
                            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-6">
                                
                                <motion.div variants={fadeUp} className="space-y-1.5">
                                    <h3 className="text-[26px] font-extrabold text-[#0F172A] tracking-tight">Welcome Back!</h3>
                                    <p className="text-[14px] text-[#64748B] font-medium">Sign in to continue to TrafficAI Dashboard</p>
                                </motion.div>

                                <motion.form variants={staggerContainer} initial="hidden" animate="show" onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    
                                    {error && (
                                        <motion.div variants={fadeUp} className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                                            {error}
                                        </motion.div>
                                    )}

                                    {/* Email Input */}
                                    <motion.div variants={fadeUp} className="space-y-2">
                                        <label className="text-[13px] font-bold text-[#1E293B]">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail className="h-4 w-4 text-[#94A3B8]" />
                                            </div>
                                            <input 
                                                type="email" 
                                                value={email} 
                                                onChange={e => setEmail(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all text-[15px] shadow-sm" 
                                                placeholder="Enter your email" 
                                                required
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Password Input */}
                                    <motion.div variants={fadeUp} className="space-y-2">
                                        <label className="text-[13px] font-bold text-[#1E293B]">Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="h-4 w-4 text-[#94A3B8]" />
                                            </div>
                                            <input 
                                                type={showPassword ? "text" : "password"} 
                                                value={password} 
                                                onChange={e => setPassword(e.target.value)}
                                                className="w-full pl-11 pr-12 py-3.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all text-[15px] shadow-sm" 
                                                placeholder="Enter your password" 
                                                required
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </motion.div>

                                    {/* Options */}
                                    <motion.div variants={fadeUp} className="flex items-center justify-between mt-1">
                                        <label className="flex items-center gap-2.5 cursor-pointer group">
                                            <div className="relative w-[18px] h-[18px] rounded-[5px] border border-[#CBD5E1] bg-white flex items-center justify-center group-hover:border-[#2563EB] transition-colors shadow-sm">
                                                <input type="checkbox" className="absolute opacity-0 w-full h-full cursor-pointer peer" defaultChecked />
                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                                            </div>
                                            <span className="text-[14px] text-[#475569] font-medium group-hover:text-[#0F172A] transition-colors">Remember me</span>
                                        </label>
                                        <a href="#" className="text-[14px] text-[#2563EB] hover:text-[#1D4ED8] transition-colors font-bold">
                                            Forgot Password?
                                        </a>
                                    </motion.div>

                                    {/* Submit Button */}
                                    <motion.button 
                                        variants={fadeUp}
                                        type="submit" 
                                        disabled={isLoading}
                                        className={`w-full py-3.5 mt-2 ${isLoading ? 'bg-gray-400' : 'bg-gradient-to-br from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.35)]'} text-white text-[15px] font-bold rounded-xl transition-all transform hover:-translate-y-[1px] active:translate-y-[1px] flex items-center justify-center gap-2`}
                                    >
                                        {isLoading ? 'Signing In...' : 'Sign In'}
                                        {!isLoading && <span className="text-lg leading-none mb-0.5">→</span>}
                                    </motion.button>
                                </motion.form>

                                {/* Divider */}
                                <motion.div variants={fadeUp} className="flex items-center gap-4 my-2">
                                    <div className="flex-1 h-px bg-[#E2E8F0]"></div>
                                    <span className="text-[13px] text-[#94A3B8] font-medium">or continue with</span>
                                    <div className="flex-1 h-px bg-[#E2E8F0]"></div>
                                </motion.div>

                                {/* Social Logins */}
                                <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
                                    <button className="flex items-center justify-center gap-2.5 py-3 bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] rounded-xl text-[14px] font-semibold text-[#475569] transition-all shadow-sm">
                                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                                        Google
                                    </button>
                                    <button className="flex items-center justify-center gap-2.5 py-3 bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] rounded-xl text-[14px] font-semibold text-[#475569] transition-all shadow-sm">
                                        <svg className="w-[18px] h-[18px]" viewBox="0 0 21 21"><path d="M0 0h10v10H0z" fill="#f25022"/><path d="M11 0h10v10H11z" fill="#7fba00"/><path d="M0 11h10v10H0z" fill="#00a4ef"/><path d="M11 11h10v10H11z" fill="#ffb900"/></svg>
                                        Microsoft
                                    </button>
                                    <button className="flex items-center justify-center gap-2.5 py-3 bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] rounded-xl text-[14px] font-semibold text-[#475569] transition-all shadow-sm">
                                        <ShieldCheck className="w-[18px] h-[18px] text-[#2563EB]" />
                                        SSO
                                    </button>
                                </motion.div>

                                {/* Enterprise Badge */}
                                <motion.div variants={fadeUp} className="mt-2 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-3 transition-colors duration-300">
                                    <div className="bg-white p-2 rounded-lg border border-[#E2E8F0] shadow-sm shrink-0">
                                        <ShieldCheck className="w-5 h-5 text-[#475569]" />
                                    </div>
                                    <div className="flex flex-col pt-0.5">
                                        <span className="text-[13px] font-bold text-[#0F172A]">Secure & Reliable</span>
                                        <span className="text-[12px] text-[#64748B] leading-[1.4] mt-0.5">Your data is protected with enterprise grade security and encryption.</span>
                                    </div>
                                </motion.div>

                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
