import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Play, ShieldCheck, Activity, Brain } from 'lucide-react';

export default function Hero({ onStartClick }) {
  // Waveform bars
  const waveBars = Array.from({ length: 18 });

  return (
    <div className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24 max-w-5xl mx-auto px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* Left: Typography & Headings */}
        <div className="lg:col-span-6 flex flex-col items-start text-left">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-xs font-medium text-slate-400 mb-6 backdrop-blur-md"
          >
            <Sparkles className="h-3 w-3 text-slate-400" />
            <span>AI Speech Co-Pilot v1.0</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] text-white"
          >
            <span className="text-premium-gradient">AI Pronunciation</span>
            <br />
            <span className="text-slate-400">Assessment</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-sm sm:text-base text-slate-400 font-light leading-relaxed max-w-md"
          >
            Receive detailed pronunciation analysis, fluency scoring, and personalized speaking feedback using modern AI calibration models.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto"
          >
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={onStartClick}
              className="flex items-center justify-center space-x-2 px-7 py-3.5 text-xs font-bold rounded-full bg-white hover:bg-slate-100 text-zinc-950 shadow-md transition-all cursor-pointer"
            >
              <span>Start Assessment</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => alert("Watch Demo: Our system records speech, aligns phoneme streams against native stress patterns, and compiles a comprehensive analytics matrix in under 5 seconds.")}
              className="flex items-center justify-center space-x-2 px-7 py-3.5 text-xs font-semibold rounded-full border border-white/8 bg-white/[0.02] hover:bg-white/[0.06] text-slate-355 transition-all cursor-pointer backdrop-blur-md"
            >
              <Play className="h-3 w-3 fill-current text-slate-450" />
              <span>Watch Demo</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Right: Floating AI Dashboard Widget */}
        <div className="lg:col-span-6 flex justify-center relative select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="glass-panel border-white/5 bg-[#121215]/50 rounded-3xl p-6 sm:p-7 max-w-sm w-full relative shadow-xl backdrop-blur-3xl overflow-hidden shimmer-effect"
          >
            {/* Inner Dashboard Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-slate-400 animate-pulse"></div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Assessment Console</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-slate-300 font-semibold border border-white/5">Active</span>
            </div>

            {/* Simulated Waveform Panel */}
            <div className="bg-zinc-950/40 rounded-2xl p-4 border border-white/5 mb-4 relative">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block mb-2 font-semibold">Phoneme Alignment Map</span>
              <div className="h-10 flex items-center justify-between px-2 overflow-hidden">
                {waveBars.map((_, i) => {
                  const ht = 20 + Math.sin(i * 0.45) * 15 + Math.cos(i * 0.9) * 20;
                  return (
                    <motion.div
                      key={i}
                      animate={{ height: [`${ht}%`, `${Math.max(10, ht + (Math.random() - 0.5) * 35)}%`, `${ht}%`] }}
                      transition={{ duration: 1.8 + Math.random(), repeat: Infinity, ease: 'easeInOut' }}
                      className="w-[3px] rounded-full bg-slate-500/70"
                    />
                  );
                })}
              </div>
            </div>

            {/* Transcript Panel */}
            <div className="space-y-2 mb-4">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Phoneme Highlight</span>
              <div className="text-xs leading-relaxed text-slate-300 font-mono bg-zinc-950/20 rounded-xl p-3 border border-white/5">
                The pro-<span className="text-white underline decoration-slate-400 font-bold bg-white/5 px-0.5 rounded">nun</span>-ci-ation of this complex <span className="text-white underline decoration-slate-400 font-bold bg-white/5 px-0.5 rounded">al-go-rithm</span> is correct.
              </div>
            </div>

            {/* Score & Confidence Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-950/30 rounded-xl p-3 border border-white/5">
                <span className="text-[8px] text-slate-500 uppercase font-semibold block">Speech Accuracy</span>
                <span className="text-sm font-extrabold text-white mt-1 block">94.2%</span>
              </div>
              <div className="bg-zinc-950/30 rounded-xl p-3 border border-white/5">
                <span className="text-[8px] text-slate-500 uppercase font-semibold block">Certainty Index</span>
                <span className="text-sm font-extrabold text-slate-300 mt-1 block">High (98%)</span>
              </div>
            </div>

            {/* Floating Stat Badges around Dashboard */}
            <motion.div
              animate={{ y: [0, -6, 0], x: [0, 3, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-5 -left-8 glass-panel bg-[#121215]/90 border-white/5 px-3 py-2 rounded-2xl flex items-center space-x-2 shadow-lg z-20 pointer-events-none"
            >
              <Activity className="h-3 w-3 text-slate-400" />
              <span className="text-[9px] font-bold text-slate-200">120 BPM Rhythm</span>
            </motion.div>

            <motion.div
              animate={{ y: [0, 6, 0], x: [0, -3, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-8 -right-6 glass-panel bg-[#121215]/90 border-white/5 px-3 py-2 rounded-2xl flex items-center space-x-2 shadow-lg z-20 pointer-events-none"
            >
              <Brain className="h-3 w-3 text-slate-400" />
              <span className="text-[9px] font-bold text-slate-200">Neural scoring</span>
            </motion.div>

            <motion.div
              animate={{ y: [0, -8, 0], x: [0, -4, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-6 -right-4 glass-panel bg-[#121215]/90 border-white/5 px-3 py-2 rounded-2xl flex items-center space-x-2 shadow-lg z-20 pointer-events-none"
            >
              <ShieldCheck className="h-3 w-3 text-slate-400" />
              <span className="text-[9px] font-bold text-slate-200">92% Confidence</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
