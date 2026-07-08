import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Play, Volume2, ShieldCheck, Activity, Brain } from 'lucide-react';

export default function Hero({ onStartClick }) {
  // Waveform bars
  const waveBars = Array.from({ length: 18 });

  return (
    <div className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24 max-w-7xl mx-auto px-6 lg:px-8">
      {/* Background Glow Blobs */}
      <div className="radial-glow glow-purple top-10 left-10 w-[500px] h-[500px]"></div>
      <div className="radial-glow glow-cyan top-40 right-20 w-[450px] h-[450px]"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* Left: Typography & Headings */}
        <div className="lg:col-span-6 flex flex-col items-start text-left">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-950/30 text-xs font-semibold text-violet-300 mb-6 backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>AI Speech Co-Pilot v1.0</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08] text-white"
          >
            <span className="text-premium-gradient">AI Pronunciation</span>
            <br />
            <span className="text-neon-gradient">Assessment</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 text-sm sm:text-base md:text-lg text-slate-400 font-light leading-relaxed max-w-lg"
          >
            Receive detailed pronunciation analysis, fluency scoring, and personalized speaking feedback using modern AI calibration models.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto"
          >
            <button
              onClick={onStartClick}
              className="flex items-center justify-center space-x-2.5 px-8 py-3.5 text-xs sm:text-sm font-bold rounded-full bg-white hover:bg-cyan-400 text-slate-950 shadow-xl shadow-cyan-500/10 hover:shadow-cyan-400/25 transition-all duration-300 transform active:scale-95 cursor-pointer"
            >
              <span>Start Assessment</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => alert("Watch Demo: Our system records speech, aligns phoneme streams against native stress patterns, and compiles a comprehensive analytics matrix in under 5 seconds.")}
              className="flex items-center justify-center space-x-2 px-8 py-3.5 text-xs sm:text-sm font-semibold rounded-full border border-white/5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer backdrop-blur-md"
            >
              <Play className="h-3.5 w-3.5 fill-current text-cyan-400" />
              <span>Watch Demo</span>
            </button>
          </motion.div>
        </div>

        {/* Right: Floating AI Dashboard Widget */}
        <div className="lg:col-span-6 flex justify-center relative select-none">
          {/* Main Dashboard Widget Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-panel border-white/10 rounded-3xl p-6 sm:p-7 max-w-md w-full relative shadow-2xl backdrop-blur-3xl overflow-hidden shimmer-effect"
          >
            {/* Inner Dashboard Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="h-3 w-3 rounded-full bg-cyan-500 animate-pulse"></div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Calibration Panel</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">Active</span>
            </div>

            {/* Simulated Waveform Panel */}
            <div className="bg-slate-950/50 rounded-2xl p-4 border border-white/5 mb-4 relative">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block mb-2 font-semibold">Phoneme Alignment Map</span>
              <div className="h-10 flex items-center justify-between px-2 overflow-hidden">
                {waveBars.map((_, i) => {
                  const ht = 20 + Math.sin(i * 0.45) * 15 + Math.cos(i * 0.9) * 20;
                  return (
                    <motion.div
                      key={i}
                      animate={{ height: [`${ht}%`, `${Math.max(10, ht + (Math.random() - 0.5) * 40)}%`, `${ht}%`] }}
                      transition={{ duration: 1.5 + Math.random(), repeat: Infinity, ease: 'easeInOut' }}
                      className="w-[3px] rounded-full bg-cyan-400/70"
                    />
                  );
                })}
              </div>
            </div>

            {/* Transcript Panel */}
            <div className="space-y-2 mb-4">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Phoneme Highlight</span>
              <div className="text-xs leading-relaxed text-slate-300 font-mono bg-slate-950/20 rounded-xl p-3 border border-white/5">
                The pro-<span className="text-violet-400 underline font-bold bg-violet-500/10 px-0.5 rounded">nun</span>-ci-ation of this complex <span className="text-cyan-400 underline font-bold bg-cyan-500/10 px-0.5 rounded">al-go-rithm</span> is correct.
              </div>
            </div>

            {/* Score & Confidence Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/40 rounded-xl p-3 border border-white/5">
                <span className="text-[8px] text-slate-500 uppercase font-semibold block">Speech Accuracy</span>
                <span className="text-base font-extrabold text-white mt-1 block">94.2%</span>
              </div>
              <div className="bg-slate-950/40 rounded-xl p-3 border border-white/5">
                <span className="text-[8px] text-slate-500 uppercase font-semibold block">Certainty Index</span>
                <span className="text-base font-extrabold text-cyan-400 mt-1 block">High (98%)</span>
              </div>
            </div>

            {/* Floating Stat Badges around Dashboard */}
            {/* Top Left Float */}
            <motion.div
              animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -left-8 glass-panel bg-[#090d1c]/80 border-white/10 px-3.5 py-2 rounded-2xl flex items-center space-x-2 shadow-lg z-20 pointer-events-none"
            >
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-[10px] font-bold text-slate-200">120 BPM Rhythm</span>
            </motion.div>

            {/* Top Right Float */}
            <motion.div
              animate={{ y: [0, 8, 0], x: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-10 -right-6 glass-panel bg-[#090d1c]/80 border-white/10 px-3.5 py-2 rounded-2xl flex items-center space-x-2 shadow-lg z-20 pointer-events-none"
            >
              <Brain className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-200">Neural scoring</span>
            </motion.div>

            {/* Bottom Right Float */}
            <motion.div
              animate={{ y: [0, -10, 0], x: [0, -6, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-8 -right-4 glass-panel bg-[#090d1c]/80 border-white/10 px-3.5 py-2 rounded-2xl flex items-center space-x-2 shadow-lg z-20 pointer-events-none"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold text-slate-200">92% Confidence</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
