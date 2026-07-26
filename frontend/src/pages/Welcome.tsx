import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import type { DotLottie } from '@lottiefiles/dotlottie-react';
import { 
    Activity, ShieldCheck, Zap, Video, Target, TrendingUp, 
    ChevronRight, Server, Cpu, Camera, AlertCircle, Database, CheckCircle2, Cloud
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------
// Helper: Lottie Observer (Pauses when off-screen)
// ---------------------------------------------------------
const LottieObserver = ({ src, className }: { src: string, className?: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);
    const isInView = useInView(containerRef, { margin: "200px 0px" });

    useEffect(() => {
        if (dotLottie) {
            if (isInView) {
                dotLottie.play();
            } else {
                dotLottie.pause();
            }
        }
    }, [isInView, dotLottie]);

    return (
        <div ref={containerRef} className={className}>
            <DotLottieReact
                src={src}
                loop
                dotLottieRefCallback={setDotLottie}
                className="w-full h-full"
            />
        </div>
    );
};


export default function Welcome() {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll();
    
    // Parallax values for Hero
    const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    useEffect(() => {
        // Initialize Lenis
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Standard GSAP Fade Up
        const sections = document.querySelectorAll('.gsap-section');
        sections.forEach((section) => {
            gsap.fromTo(section, 
                { opacity: 0, y: 50 }, 
                { 
                    opacity: 1, 
                    y: 0, 
                    duration: 1, 
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 80%",
                        end: "bottom 20%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });

        // Core Features Sticky Scroll Sync
        const featureCards = gsap.utils.toArray('.feature-card');
        featureCards.forEach((card: any, i) => {
            ScrollTrigger.create({
                trigger: card,
                start: "top center",
                end: "bottom center",
                toggleClass: { targets: card, className: "active-feature" }
            });
        });

        return () => {
            lenis.destroy();
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    // Animation Variants
    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };
    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    return (
        <div ref={containerRef} className="bg-white min-h-screen font-sans text-[#0F172A] selection:bg-[#2563EB] selection:text-white">
            
            {/* STICKY NAVIGATION */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo-horizontal.png" alt="NeuroFlow AI" className="h-8 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        <span className="text-[22px] font-extrabold tracking-tight text-[#0F172A]">NeuroFlow AI</span>
                    </div>
                    
                    <div className="hidden lg:flex items-center gap-8 font-medium text-[15px] text-[#64748B]">
                        <a href="#about" className="hover:text-[#2563EB] transition-colors">Overview</a>
                        <a href="#workflow" className="hover:text-[#2563EB] transition-colors">Workflow</a>
                        <a href="#features" className="hover:text-[#2563EB] transition-colors">Features</a>
                        <a href="#tech" className="hover:text-[#2563EB] transition-colors">Technology</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="text-[#64748B] text-[15px] font-medium hover:text-[#0F172A] transition-colors hidden sm:block">
                            Skip Intro
                        </button>
                        <button onClick={() => navigate('/dashboard')} className="bg-[#0F172A] hover:bg-[#1E293B] text-white px-5 py-2.5 rounded-full text-[14px] font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center gap-2">
                            Enter Dashboard <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* SECTION 1: HERO */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden min-h-[90vh] flex items-center">
                <div className="absolute inset-0 bg-[#F8FAFC] -z-10" />
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-[#2563EB]/5 rounded-full blur-[120px] -z-10" />
                
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Hero Left */}
                    <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 flex flex-col justify-center">
                        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
                            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold tracking-wide">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                Next-Gen Traffic Intelligence
                            </motion.div>
                            
                            <motion.h1 variants={fadeUp} className="text-6xl sm:text-[72px] font-[800] leading-[1.05] tracking-tight text-[#0F172A]">
                                Welcome to <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#3B82F6]">NeuroFlow AI</span>
                            </motion.h1>
                            
                            <motion.p variants={fadeUp} className="text-xl text-[#64748B] leading-relaxed max-w-[540px]">
                                Transforming traffic surveillance into intelligent decision-making using Artificial Intelligence, Computer Vision, and Predictive Analytics.
                            </motion.p>
                            
                            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 pt-4">
                                <button onClick={() => navigate('/dashboard')} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-4 rounded-2xl text-[16px] font-bold shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2">
                                    Enter Dashboard <ChevronRight className="w-5 h-5" />
                                </button>
                                <a href="#workflow" className="bg-white hover:bg-slate-50 text-[#0F172A] border border-[#E5E7EB] px-8 py-4 rounded-2xl text-[16px] font-bold shadow-sm transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2">
                                    Watch AI Workflow
                                </a>
                            </motion.div>

                            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 pt-8">
                                {['Real-Time Monitoring', 'AI Insights', 'Traffic Prediction', 'Incident Detection'].map((badge, i) => (
                                    <span key={i} className="px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#475569] shadow-sm flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-[#22C55E]" /> {badge}
                                    </span>
                                ))}
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Hero Right - Lottie Animation */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square bg-transparent flex items-center justify-center pointer-events-none"
                    >
                        {/* Lottie Animation: Future City */}
                        <LottieObserver src="/animation/Future City.lottie" className="w-full h-full scale-[1.15]" />
                    </motion.div>
                </div>
            </section>

            {/* SECTION 2: WHAT IS NEUROFLOW AI */}
            <section id="about" className="py-24 lg:py-32 px-6 bg-white gsap-section">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        
                        {/* Left: Clean CSS/SVG Workflow Illustration */}
                        <div className="w-full lg:w-1/2 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-blue-50/50 rounded-full blur-3xl -z-10" />
                            <div className="flex flex-col items-center gap-6">
                                {/* CCTV Node */}
                                <motion.div 
                                    initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
                                    className="bg-white border border-[#E5E7EB] shadow-lg rounded-2xl p-6 flex flex-col items-center w-64 text-center z-10"
                                >
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3"><Camera /></div>
                                    <h4 className="font-bold text-[#0F172A]">CCTV Camera</h4>
                                    <p className="text-sm text-[#64748B] mt-1">Raw video feeds</p>
                                </motion.div>

                                {/* Arrow */}
                                <motion.div 
                                    initial={{ height: 0 }} whileInView={{ height: 48 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.5 }}
                                    className="w-0.5 bg-blue-500/30 overflow-hidden relative"
                                >
                                    <motion.div animate={{ y: [0, 48, 48] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-full h-4 bg-blue-500" />
                                </motion.div>

                                {/* AI Node */}
                                <motion.div 
                                    initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
                                    className="bg-[#0F172A] border border-[#1E293B] shadow-2xl shadow-blue-900/20 rounded-2xl p-6 flex flex-col items-center w-72 text-center z-10 transform scale-105"
                                >
                                    <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-3"><Cpu /></div>
                                    <h4 className="font-bold text-white">Artificial Intelligence</h4>
                                    <p className="text-sm text-slate-400 mt-1">Detection, Tracking & Prediction</p>
                                </motion.div>

                                {/* Arrow */}
                                <motion.div 
                                    initial={{ height: 0 }} whileInView={{ height: 48 }} viewport={{ once: true }} transition={{ delay: 0.6, duration: 0.5 }}
                                    className="w-0.5 bg-blue-500/30 overflow-hidden relative"
                                >
                                    <motion.div animate={{ y: [0, 48, 48] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }} className="w-full h-4 bg-blue-500" />
                                </motion.div>

                                {/* Dashboard Node */}
                                <motion.div 
                                    initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 }}
                                    className="bg-white border border-[#E5E7EB] shadow-lg rounded-2xl p-6 flex flex-col items-center w-64 text-center z-10"
                                >
                                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3"><Activity /></div>
                                    <h4 className="font-bold text-[#0F172A]">Traffic Dashboard</h4>
                                    <p className="text-sm text-[#64748B] mt-1">Actionable insights</p>
                                </motion.div>
                            </div>
                        </div>

                        {/* Right: Text Explanation */}
                        <div className="w-full lg:w-1/2">
                            <h2 className="text-[40px] font-bold text-[#0F172A] mb-6">What is NeuroFlow AI?</h2>
                            <p className="text-lg text-[#64748B] leading-relaxed mb-10">
                                NeuroFlow AI bridges the gap between raw traffic footage and actionable city planning insights. It automatically monitors, analyzes, and predicts traffic patterns.
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[
                                    { title: "Project Introduction", desc: "A robust AI platform designed to replace legacy manual traffic surveillance with autonomous vision AI." },
                                    { title: "Problem Statement", desc: "Urban congestion causes billions in lost productivity. Traditional systems lack real-time predictive capabilities." },
                                    { title: "Objectives", desc: "Optimize signal timing, detect incidents instantly, and provide actionable analytics to city planners." },
                                    { title: "Real-world Benefits", desc: "Reduced commute times, lower carbon emissions, and faster emergency response times across the city." }
                                ].map((card, i) => (
                                    <div key={i} className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-6">
                                        <h3 className="text-lg font-bold text-[#0F172A] mb-2">{card.title}</h3>
                                        <p className="text-[#64748B] text-sm leading-relaxed">{card.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* SECTION 3: PROBLEM VS SOLUTION */}
            <section className="py-24 lg:py-32 px-6 bg-[#F8FAFC] border-y border-[#E5E7EB] gsap-section">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 relative">
                        
                        {/* Decorative Center Arrow (Hidden on mobile) */}
                        <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none">
                            <div className="w-16 h-16 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-blue-600">
                                <ChevronRight className="w-8 h-8" />
                            </div>
                        </div>

                        {/* Problem */}
                        <div className="space-y-8">
                            <div>
                                <span className="text-[#EF4444] font-bold tracking-wider uppercase text-sm mb-2 block">The Problem</span>
                                <h2 className="text-3xl font-bold text-[#0F172A]">Legacy Systems</h2>
                            </div>
                            <div className="space-y-4">
                                {['Traffic congestion leading to delays', 'Manual monitoring prone to human error', 'Slow incident response times', 'Limited and static analytics'].map((text, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm opacity-80">
                                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                                            <AlertCircle className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium text-slate-700">{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Solution */}
                        <div className="space-y-8">
                            <div>
                                <span className="text-[#22C55E] font-bold tracking-wider uppercase text-sm mb-2 block">The Solution</span>
                                <h2 className="text-3xl font-bold text-[#0F172A]">NeuroFlow AI</h2>
                            </div>
                            <div className="space-y-4">
                                {['Autonomous AI Vehicle Detection', 'Continuous Multi-Object Tracking', 'Instant AI Predictions & Forecasting', 'Dynamic Real-time Dashboard'].map((text, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-blue-100 shadow-md shadow-blue-50 transform hover:scale-[1.02] transition-transform">
                                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <span className="font-bold text-slate-900">{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* SECTION 4: AI WORKFLOW */}
            <section id="workflow" className="py-24 lg:py-32 px-6 bg-white overflow-hidden gsap-section">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        
                        {/* Timeline */}
                        <div className="w-full lg:w-1/2 relative">
                            <h2 className="text-[40px] font-bold text-[#0F172A] mb-12">AI Workflow</h2>
                            
                            {/* Vertical Line */}
                            <div className="absolute top-[100px] bottom-10 left-10 w-0.5 bg-blue-100 rounded-full" />
                            <motion.div 
                                animate={{ y: ["0%", "800%", "0%"] }}
                                transition={{ duration: 6, ease: "linear", repeat: Infinity }}
                                className="absolute top-[100px] left-10 w-0.5 h-20 bg-blue-500 shadow-[0_0_10px_#3B82F6] rounded-full z-10" 
                            />

                            <div className="space-y-8 relative z-20">
                                {[
                                    { title: "Video Input", desc: "Ingests RTSP streams from city cameras.", icon: <Camera /> },
                                    { title: "Vehicle Detection", desc: "YOLO identifies vehicles & pedestrians.", icon: <Target /> },
                                    { title: "Vehicle Tracking", desc: "ByteTrack maintains trajectories.", icon: <Activity /> },
                                    { title: "Traffic Analytics", desc: "Calculates speeds and counts lanes.", icon: <Cpu /> },
                                    { title: "AI Prediction", desc: "Predicts future traffic states.", icon: <Cloud /> },
                                    { title: "Dashboard", desc: "Data visualized in real-time.", icon: <TrendingUp /> }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-6 group">
                                        <div className="w-20 h-20 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm flex items-center justify-center text-[#64748B] group-hover:border-[#2563EB] group-hover:text-[#2563EB] group-hover:shadow-lg transition-all shrink-0 bg-clip-padding">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-[20px] font-bold text-[#0F172A] mb-1 group-hover:text-[#2563EB] transition-colors">{item.title}</h4>
                                            <p className="text-[#64748B]">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Traffic concept.lottie */}
                        <div className="w-full lg:w-1/2 flex items-center justify-center pointer-events-none">
                            <LottieObserver src="/animation/Traffic concept.lottie" className="w-[80%] aspect-square opacity-90 mix-blend-multiply" />
                        </div>

                    </div>
                </div>
            </section>

            {/* SECTION 5: CORE FEATURES (Sticky Scroll Design) */}
            <section id="features" className="py-24 px-6 bg-[#0F172A] text-white">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 relative">
                    
                    {/* Left: Scrollable Feature Cards */}
                    <div className="w-full lg:w-1/2 space-y-24 py-32">
                        <div className="mb-24">
                            <h2 className="text-[48px] font-bold mb-6">Core Features</h2>
                            <p className="text-xl text-slate-400">Scroll to explore the powerful tools driving our AI platform.</p>
                        </div>

                        {[
                            { title: "Vehicle Detection", desc: "High-accuracy identification of cars, trucks, buses, and motorcycles using state-of-the-art vision models.", icon: <Target /> },
                            { title: "Object Tracking", desc: "Persistent tracking across frames to monitor trajectories and prevent double-counting.", icon: <Activity /> },
                            { title: "Traffic Analytics", desc: "Granular data on speeds, densities, and flows segmented by time and lane.", icon: <TrendingUp /> },
                            { title: "AI Prediction", desc: "Forecast future traffic states using historical time-series data and machine learning.", icon: <Cloud /> },
                            { title: "Camera Management", desc: "Centralized control of all RTSP streams, health monitoring, and system diagnostics.", icon: <Video /> },
                            { title: "Incident Detection", desc: "Automated alerts for accidents, wrong-way driving, and stationary vehicles.", isIncident: true }
                        ].map((feature, i) => (
                            <div key={i} className="feature-card min-h-[30vh] flex flex-col justify-center transition-opacity duration-500 opacity-30 [&.active-feature]:opacity-100">
                                <div className="bg-[#1E293B]/50 backdrop-blur-sm border border-slate-700/50 rounded-[24px] p-8 hover:bg-[#1E293B] hover:border-blue-500/30 transition-all">
                                    {/* Handle special Incident Lottie replace icon */}
                                    {feature.isIncident ? (
                                        <div className="w-24 h-24 mb-6 rounded-xl overflow-hidden bg-white/5 p-2">
                                            <LottieObserver src="/animation/Road repair square composition.lottie" className="w-full h-full" />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
                                            {feature.icon}
                                        </div>
                                    )}
                                    <h3 className="text-[28px] font-bold mb-4">{feature.title}</h3>
                                    <p className="text-slate-400 text-lg leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right: Sticky Lottie Animation */}
                    <div className="hidden lg:block w-1/2 relative">
                        <div className="sticky top-0 h-screen flex items-center justify-center pointer-events-none">
                            <LottieObserver src="/animation/Traffic concept (1).lottie" className="w-[90%] aspect-square opacity-90 drop-shadow-2xl mix-blend-screen" />
                        </div>
                    </div>

                </div>
                
                {/* CSS for active-feature opacity handled via Tailwind arbitrary variant in JS toggling class, or raw CSS below */}
                <style>{`
                    .active-feature { opacity: 1 !important; transform: scale(1.02); }
                `}</style>
            </section>

            {/* SECTION 6: TECHNOLOGY STACK */}
            <section id="tech" className="py-24 lg:py-32 px-6 bg-white gsap-section">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-[40px] font-bold text-[#0F172A] mb-16">Powered by Modern Technology</h2>
                    
                    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                        {['YOLOv11', 'ByteTrack', 'OpenCV', 'FastAPI', 'React', 'PostgreSQL', 'Redis', 'Docker', 'DotLottie'].map((tech, i) => (
                            <div key={i} className="px-6 py-4 bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl flex items-center gap-3 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="font-bold text-[#0F172A] text-lg">{tech}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 7: SYSTEM STATUS */}
            <section className="py-24 lg:py-32 px-6 bg-[#F8FAFC] border-t border-[#E5E7EB] gsap-section">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white rounded-[32px] border border-[#E5E7EB] shadow-[0_30px_80px_rgba(15,23,42,0.05)] p-10 md:p-16 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-green-50 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
                        
                        <h2 className="text-[32px] font-bold text-[#0F172A] mb-12 flex items-center gap-4">
                            <Server className="w-8 h-8 text-blue-600" />
                            Mission Control Ready
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: "AI Engine", status: "Online", val: "99.9%", icon: <Cpu /> },
                                { label: "Database", status: "Synced", val: "12ms", icon: <Database /> },
                                { label: "Cameras", status: "Active", val: "24/24", icon: <Video /> },
                                { label: "Predictions", status: "Running", val: "100%", icon: <Activity /> }
                            ].map((stat, i) => (
                                <div key={i} className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-slate-400">{stat.icon}</div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="relative flex h-2.5 w-2.5">
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                            </span>
                                            <span className="text-xs font-bold text-green-600 uppercase tracking-wider">{stat.status}</span>
                                        </div>
                                    </div>
                                    <h4 className="text-sm font-semibold text-[#64748B] mb-1">{stat.label}</h4>
                                    <p className="text-2xl font-black text-[#0F172A]">{stat.val}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 8: FINAL CTA */}
            <section className="py-32 px-6 bg-white gsap-section">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-[48px] md:text-[56px] font-[800] text-[#0F172A] leading-[1.1] mb-8 tracking-tight">
                        Ready to Explore <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#3B82F6]">NeuroFlow AI?</span>
                    </h2>
                    
                    <p className="text-xl text-[#64748B] mb-12 max-w-2xl mx-auto leading-relaxed">
                        Discover how AI can transform modern traffic management through real-time analytics, intelligent monitoring, and predictive insights.
                    </p>

                    <button 
                        onClick={() => navigate('/dashboard')} 
                        className="group relative inline-flex items-center justify-center gap-3 bg-[#0F172A] text-white px-10 py-5 rounded-full text-[18px] font-bold shadow-[0_20px_40px_rgba(15,23,42,0.2)] transition-all hover:scale-105 active:scale-95 overflow-hidden"
                    >
                        {/* Button Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative z-10 flex items-center gap-3">
                            Enter Dashboard <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                </div>
            </section>

        </div>
    );
}
