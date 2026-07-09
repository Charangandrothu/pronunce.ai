import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, Circle, Server, Sparkles } from 'lucide-react';

export default function LoadingCard({ progress, serverStatus, wakingProgress = 0 }) {
  const steps = [
    { label: "Audio Upload", minProgress: 0, maxProgress: 25 },
    { label: "Speech Recognition", minProgress: 25, maxProgress: 55 },
    { label: "Phoneme Alignment", minProgress: 55, maxProgress: 70 },
    { label: "Pronunciation Analysis", minProgress: 70, maxProgress: 85 },
    { label: "Feedback Generation", minProgress: 85, maxProgress: 100 }
  ];

  const getStepStatus = (step, currentProgress) => {
    if (currentProgress >= step.maxProgress) return 'completed';
    if (currentProgress >= step.minProgress && currentProgress < step.maxProgress) return 'active';
    return 'pending';
  };

  const getConsoleStatusText = (currentProgress) => {
    if (currentProgress < 25) return `Uploading vocal audio stream... [${currentProgress * 4}%]`;
    if (currentProgress < 55) return "Executing speech recognition model & transcribing...";
    if (currentProgress < 70) return "Computing phoneme alignment vector maps...";
    if (currentProgress < 85) return "Evaluating syllable stress & articulation quality...";
    return "Compiling final assessment feedback matrix...";
  };

  const getWakingStatusText = (wakingPct) => {
    if (wakingPct < 15) return "Allocating virtual container on Render node...";
    if (wakingPct < 30) return "Initializing base Node.js runtime environment...";
    if (wakingPct < 50) return "Loading speech recognition libraries & dependencies...";
    if (wakingPct < 70) return "Starting API services & routing engines...";
    if (wakingPct < 85) return "Testing connections to Sarvam AI & Gemini gateways...";
    return "Optimizing cold start parameters... Almost ready!";
  };

  const isSleeping = serverStatus === 'sleeping';

  return (
    <div className="w-full max-w-xl mx-auto px-4 z-20 select-none">
      <div className="glass-panel glow-card bg-[#121215]/50 border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        <AnimatePresence mode="wait">
          {isSleeping ? (
            <motion.div
              key="sleeping-state"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">
                  <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin shrink-0" />
                  <span>Render Server Warm-up</span>
                </div>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/5 border border-amber-500/10 text-amber-400 animate-pulse">
                  Waking Up Server...
                </span>
              </div>

              {/* Server Pulse Animation Graphic */}
              <div className="flex flex-col items-center justify-center py-6 relative">
                {/* Decorative glowing rings */}
                <div className="absolute h-24 w-24 rounded-full border border-amber-500/10 animate-ping opacity-75" />
                <div className="absolute h-32 w-32 rounded-full border border-blue-500/5 animate-pulse opacity-40" />

                <div className="relative flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500/10 to-zinc-950 border border-amber-500/20 shadow-lg text-amber-400">
                  <Server className="h-8 w-8 animate-pulse" />
                  <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-zinc-950 flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  </div>
                </div>
                
                <h3 className="text-xs font-bold text-white mt-4 uppercase tracking-wider font-mono">
                  Cold Boot In Progress
                </h3>
                <p className="text-[10px] text-slate-400 text-center font-light leading-relaxed max-w-sm mt-2">
                  Since this is a showcase app hosted on Render's free tier, the server spins down during periods of inactivity. Booting up takes about <span className="text-white font-mono font-bold">50 seconds</span>.
                </p>
              </div>

              {/* Status Output Console */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-[9px] uppercase tracking-wider font-mono text-slate-550 mb-2">
                    <span>Virtual Machine Console</span>
                    <span>Status: BOOTING</span>
                  </div>
                  <div className="bg-zinc-950/40 border border-white/5 rounded-xl p-3.5 font-mono text-xs text-amber-300 min-h-[50px] flex items-center">
                    <span className="animate-pulse mr-1.5">›</span> {getWakingStatusText(wakingProgress)}
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 mb-1.5">
                    <span>Calibration Progress</span>
                    <span>{wakingProgress}% (Est. {Math.max(0, 50 - Math.round((wakingProgress / 100) * 50))}s remaining)</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                    <motion.div 
                      className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${wakingProgress}%` }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              {/* Mini Info Footer */}
              <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-white/[0.01] border border-white/5 mt-4">
                <Sparkles className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5 animate-pulse" />
                <span className="text-[10px] text-slate-450 leading-relaxed font-light">
                  Your audio will automatically begin analyzing the second the container boots up. No action is required.
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="active-state"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">
                  <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin shrink-0" />
                  <span>AI Calibration Pipeline</span>
                </div>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/5 border border-blue-500/10 text-blue-400 animate-pulse">
                  Processing {progress}%
                </span>
              </div>

              {/* Realistic Progress Status */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-[9px] uppercase tracking-wider font-mono text-slate-550 mb-2">
                    <span>Status Output Log</span>
                    <span>Rate: 44.1 kHz</span>
                  </div>
                  <div className="bg-zinc-950/40 border border-white/5 rounded-xl p-3.5 font-mono text-xs text-slate-350 min-h-[50px] flex items-center">
                    <span className="animate-pulse mr-1">›</span> {getConsoleStatusText(progress)}
                  </div>
                </div>

                {/* Simple Premium Progress Bar */}
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                  <motion.div 
                    className="bg-white h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Pipeline Step Checklist */}
              <div className="space-y-2 border-t border-white/5 pt-5">
                <span className="text-[9px] text-slate-550 uppercase tracking-widest font-mono block mb-3">Pipeline Checklist</span>
                {steps.map((step, idx) => {
                  const status = getStepStatus(step, progress);
                  
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-2.5 rounded-xl transition-all duration-300 border ${
                        status === 'active' 
                          ? 'bg-blue-500/5 border-blue-500/10 text-white' 
                          : status === 'completed' 
                            ? 'bg-transparent border-transparent text-slate-500' 
                            : 'bg-transparent border-transparent text-slate-750'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : status === 'active' ? (
                          <Loader2 className="h-4 w-4 text-blue-400 animate-spin shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-zinc-800 shrink-0" />
                        )}
                        <span className="text-xs font-semibold tracking-tight">{step.label}</span>
                      </div>

                      <div>
                        {status === 'completed' && (
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                            Completed
                          </span>
                        )}
                        {status === 'active' && (
                          <span className="text-[9px] font-bold text-blue-400 bg-blue-500/5 border border-blue-500/10 px-2 py-0.5 rounded uppercase tracking-wider font-mono animate-pulse">
                            Active
                          </span>
                        )}
                        {status === 'pending' && (
                          <span className="text-[9px] font-bold text-zinc-800 uppercase tracking-wider font-mono">
                            Queued
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

