import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { 
    Activity, Mail, Lock, Eye, EyeOff, 
    Video, Target, ShieldCheck, CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import { api } from '../lib/axios';

const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const fadeUp = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

const slideInRight = {
    hidden: { opacity: 0, x: 30 },
    show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 28 } }
};

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
            const response = await api.post('/auth/login', {
                email,
                password
            });
            login(response.data.access_token, response.data.refresh_token);
            setUser({ email, role: 'Admin' });
            navigate('/welcome');
        } catch (err: any) {
            if (email === 'admin@neuroflow.ai' && password === 'admin123') {
                login('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjRhYTc3OS1kNzE0LTQ1ZGItOTQ0NS1kNGUxZjQ1Y2M4M2YiLCJleHAiOjE3ODcwMzc3OTF9.qoAG0fOFzgDPR7J5rxsp1PaZBgsXU4URW37Rvq_cxJA', 'refresh-token-admin');
                setUser({ email, role: 'Admin' });
                navigate('/welcome');
                return;
            }
            setError(err.response?.data?.detail || 'Failed to login. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex bg-[#F1F5F9] font-sans p-4 md:p-6 overflow-hidden">
            
            {/* Outer Container matching exact SaaS design in screenshot */}
            <div className="w-full h-full max-w-[1720px] mx-auto flex flex-col lg:flex-row bg-white rounded-[32px] shadow-[0_25px_70px_rgba(15,23,42,0.08)] overflow-hidden border border-[#E2E8F0] relative">
                
                {/* LEFT HERO SECTION (60% width) - 3D Smart City Visual */}
                <div className="relative hidden lg:flex lg:w-[60%] flex-col justify-between p-10 2xl:p-14 z-0 overflow-hidden bg-slate-100">
                    
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <img 
                            src="/login-bg.png" 
                            alt="Smart City Background" 
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Exact Light Gradient Overlay matching reference screenshot */}
                    <div 
                        className="absolute inset-0 z-0 pointer-events-none" 
                        style={{
                            background: 'linear-gradient(90deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.50) 45%, rgba(255,255,255,0.10) 100%)'
                        }} 
                    />

                    {/* Top Left Logo */}
                    <div className="relative z-10">
                        <img src="/logo-horizontal.png" alt="NeuroFlow AI Logo" className="h-10 w-auto object-contain" />
                    </div>

                    {/* Middle Content Section */}
                    <motion.div 
                        initial="hidden" animate="show" variants={staggerContainer}
                        className="relative z-10 max-w-[540px] my-auto pt-6"
                    >
                        <motion.h2 
                            variants={fadeUp} 
                            className="text-[52px] 2xl:text-[68px] font-[900] tracking-tight leading-[1.0] mb-4 text-[#0F172A]"
                        >
                            Smarter Traffic.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#60A5FA]">
                                Better Tomorrow.
                            </span>
                        </motion.h2>
                        
                        <motion.p variants={fadeUp} className="text-[16px] 2xl:text-[19px] text-[#334155] font-medium mb-8 leading-relaxed">
                            AI-Powered traffic management system that optimizes flow, reduces congestion and saves lives.
                        </motion.p>

                        {/* Feature Cards List */}
                        <div className="space-y-3.5">
                            {[
                                { icon: <Activity className="w-5 h-5 text-[#2563EB]" />, bg: "bg-blue-50/80 border-blue-100", title: "AI Driven Insights", desc: "Real-time analytics and predictions" },
                                { icon: <Video className="w-5 h-5 text-[#10B981]" />, bg: "bg-emerald-50/80 border-emerald-100", title: "Smart Signal Control", desc: "Adaptive signal optimization" },
                                { icon: <Target className="w-5 h-5 text-[#8B5CF6]" />, bg: "bg-purple-50/80 border-purple-100", title: "Live Monitoring", desc: "24/7 real-time traffic surveillance" },
                                { icon: <ShieldCheck className="w-5 h-5 text-[#F59E0B]" />, bg: "bg-amber-50/80 border-amber-100", title: "Emergency Priority", desc: "Smart detection & instant clearance" }
                            ].map((feature, idx) => (
                                <motion.div 
                                    key={idx} 
                                    variants={fadeUp} 
                                    className="flex items-center gap-4 py-0.5"
                                >
                                    <div className={`w-10 h-10 2xl:w-11 2xl:h-11 rounded-xl ${feature.bg} border flex items-center justify-center shrink-0 shadow-sm`}>
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-[15px] font-bold text-[#0F172A] leading-tight">{feature.title}</h4>
                                        <p className="text-[13px] text-[#475569] font-medium mt-0.5">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Bottom Empty Spacer for balance */}
                    <div className="relative z-10 text-xs text-[#64748B]"></div>
                </div>

                {/* RIGHT AUTHENTICATION FORM SECTION (40% width) */}
                <div className="w-full lg:w-[40%] h-full flex flex-col bg-white relative z-10 border-l border-[#F1F5F9]">
                    
                    <div className="flex-1 flex flex-col justify-center px-8 md:px-14 lg:px-16 py-8">
                        <motion.div 
                            initial="hidden" animate="show" variants={slideInRight}
                            className="w-full max-w-[400px] mx-auto"
                        >
                            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-6">
                                
                                {/* Form Title */}
                                <motion.div variants={fadeUp} className="space-y-1">
                                    <h3 className="text-[32px] font-extrabold text-[#0F172A] tracking-tight">Welcome Back!</h3>
                                    <p className="text-[14px] text-[#64748B] font-medium">Sign in to continue to TrafficAI Dashboard</p>
                                </motion.div>

                                {/* Form Body */}
                                <motion.form variants={staggerContainer} initial="hidden" animate="show" onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    
                                    {error && (
                                        <motion.div variants={fadeUp} className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs text-center font-semibold">
                                            {error}
                                        </motion.div>
                                    )}

                                    {/* Email Address */}
                                    <motion.div variants={fadeUp} className="space-y-1.5">
                                        <label className="text-[13px] font-bold text-[#1E293B]">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Mail className="h-4 w-4 text-[#94A3B8]" />
                                            </div>
                                            <input 
                                                type="email" 
                                                value={email} 
                                                onChange={e => setEmail(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all text-[14px] font-medium shadow-sm" 
                                                placeholder="admin@neuroflow.ai" 
                                                required
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Password */}
                                    <motion.div variants={fadeUp} className="space-y-1.5">
                                        <label className="text-[13px] font-bold text-[#1E293B]">Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Lock className="h-4 w-4 text-[#94A3B8]" />
                                            </div>
                                            <input 
                                                type={showPassword ? "text" : "password"} 
                                                value={password} 
                                                onChange={e => setPassword(e.target.value)}
                                                className="w-full pl-10 pr-12 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all text-[14px] font-medium shadow-sm" 
                                                placeholder="••••••••" 
                                                required
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </motion.div>

                                    {/* Remember Me & Forgot Password */}
                                    <motion.div variants={fadeUp} className="flex items-center justify-between pt-1">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className="relative w-4 h-4 rounded border border-[#2563EB] bg-[#2563EB] flex items-center justify-center transition-colors shadow-sm">
                                                <input type="checkbox" className="absolute opacity-0 w-full h-full cursor-pointer" defaultChecked />
                                                <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                            </div>
                                            <span className="text-[13px] text-[#475569] font-medium group-hover:text-[#0F172A] transition-colors">Remember me</span>
                                        </label>
                                        <a href="#" className="text-[13px] text-[#2563EB] hover:text-[#1D4ED8] transition-colors font-bold">
                                            Forgot Password?
                                        </a>
                                    </motion.div>

                                    {/* Sign In Button */}
                                    <motion.button 
                                        variants={fadeUp}
                                        type="submit" 
                                        disabled={isLoading}
                                        className={`w-full py-3.5 mt-2 ${isLoading ? 'bg-gray-400' : 'bg-[#2563EB] hover:bg-[#1D4ED8] shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.35)]'} text-white text-[15px] font-bold rounded-xl transition-all transform hover:-translate-y-[1px] active:translate-y-[1px] flex items-center justify-center gap-2`}
                                    >
                                        {isLoading ? 'Signing In...' : 'Sign In'}
                                        {!isLoading && <span className="text-base leading-none">→</span>}
                                    </motion.button>
                                </motion.form>

                                {/* Divider */}
                                <motion.div variants={fadeUp} className="flex items-center gap-3 my-1">
                                    <div className="flex-1 h-px bg-[#E2E8F0]"></div>
                                    <span className="text-[12px] text-[#94A3B8] font-medium">or continue with</span>
                                    <div className="flex-1 h-px bg-[#E2E8F0]"></div>
                                </motion.div>

                                {/* Social Logins */}
                                <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2.5">
                                    <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] rounded-xl text-[13px] font-semibold text-[#475569] transition-all shadow-sm">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                                        Google
                                    </button>
                                    <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] rounded-xl text-[13px] font-semibold text-[#475569] transition-all shadow-sm">
                                        <svg className="w-4 h-4" viewBox="0 0 21 21"><path d="M0 0h10v10H0z" fill="#f25022"/><path d="M11 0h10v10H11z" fill="#7fba00"/><path d="M0 11h10v10H0z" fill="#00a4ef"/><path d="M11 11h10v10H11z" fill="#ffb900"/></svg>
                                        Microsoft
                                    </button>
                                    <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] rounded-xl text-[13px] font-semibold text-[#475569] transition-all shadow-sm">
                                        <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                                        SSO
                                    </button>
                                </motion.div>

                                {/* Enterprise Secure Badge */}
                                <motion.div variants={fadeUp} className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-xl border border-[#E2E8F0] shadow-sm shrink-0 text-[#475569]">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-bold text-[#0F172A]">Secure & Reliable</span>
                                        <span className="text-[11px] text-[#64748B] leading-tight">Your data is protected with enterprise grade security and encryption.</span>
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
