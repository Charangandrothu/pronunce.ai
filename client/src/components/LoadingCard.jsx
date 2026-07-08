import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, Circle, Hourglass } from 'lucide-react';

export default function LoadingCard({ progress }) {
  const steps = [
    { label: "Uploading...", minProgress: 0, maxProgress: 25 },
    { label: "Speech Recognition...", minProgress: 25, maxProgress: 50 },
    { label: "AI Evaluation...", minProgress: 50, maxProgress: 75 },
    { label: "Generating Report...", minProgress: 75, maxProgress: 100 }
  ];

  // Calculate remaining seconds (mocking a 6-second total duration)
  const remainingTime = Math.max(0, Math.ceil((6 * (100 - progress)) / 100));

  const getStepStatus = (step, currentProgress) => {
    if (currentProgress >= step.maxProgress) return 'completed';
    if (currentProgress >= step.minProgress && currentProgress < step.maxProgress) return 'active';
    return 'pending';
  };

  // Helper to generate the character bar (e.g. ███████░░░)
  const getCharBar = (step, currentProgress) => {
    const status = getStepStatus(step, currentProgress);
    if (status === 'completed') return "██████████";
    if (status === 'pending') return "░░░░░░░░░░";
    
    // Calculate fractional fill for active step
    const range = step.maxProgress - step.minProgress;
    const activeProgress = currentProgress - step.minProgress;
    const percentage = Math.min(100, Math.max(0, (activeProgress / range) * 100));
    const filledBlocks = Math.round(percentage / 10);
    const emptyBlocks = 10 - filledBlocks;
    
    return "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 z-20 select-none animate-fade-in">
      <div className="glass-panel border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl shimmer-effect">
        {/* Glow Layer */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-violet-600/5 to-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>

        <div className="flex flex-col items-center">
          {/* Header */}
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
            <Loader2 className="h-4.5 w-4.5 text-cyan-400 animate-spin" />
            <span>AI Synthesis Engine</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white text-center">
            Calibrating Vocal Sample
          </h3>
          <p className="text-xs text-slate-400 mt-2 text-center font-light">
            Aligning speech syllables against phonetic neural profiles.
          </p>

          {/* Graphical Progress Bar */}
          <div className="w-full bg-white/5 rounded-full h-1.5 mt-8 overflow-hidden border border-white/5">
            <motion.div 
              className="bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Time Remaining */}
          <div className="flex justify-between w-full mt-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            <span className="flex items-center space-x-1.5">
              <Hourglass className="h-3.5 w-3.5 text-slate-600 animate-pulse" />
              <span>Analyzing Vectors</span>
            </span>
            <span>Est. {remainingTime}s Remaining</span>
          </div>

          {/* Timeline Step Blocks */}
          <div className="w-full mt-8 space-y-3.5 border-t border-white/5 pt-6">
            {steps.map((step, idx) => {
              const status = getStepStatus(step, progress);
              const charBar = getCharBar(step, progress);
              
              return (
                <div 
                  key={idx} 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl transition-all duration-300 gap-3 border ${
                    status === 'active' 
                      ? 'bg-violet-950/20 border-violet-500/20 shadow-md shadow-violet-500/2' 
                      : status === 'completed' 
                        ? 'bg-white/[0.01] border-white/5 text-slate-400' 
                        : 'bg-transparent border-transparent text-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    {status === 'completed' ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                    ) : status === 'active' ? (
                      <div className="h-4.5 w-4.5 flex items-center justify-center shrink-0">
                        <Loader2 className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
                      </div>
                    ) : (
                      <Circle className="h-4.5 w-4.5 text-slate-800 shrink-0" />
                    )}
                    <span className="text-xs sm:text-sm font-bold tracking-tight">{step.label}</span>
                  </div>

                  {/* Character Monospace Progress Bar */}
                  <div className="flex items-center space-x-3 self-end sm:self-auto">
                    <span className={`font-mono text-[10px] sm:text-xs tracking-wider ${
                      status === 'completed' 
                        ? 'text-emerald-500/60' 
                        : status === 'active' 
                          ? 'text-cyan-400 font-semibold' 
                          : 'text-slate-700'
                    }`}>
                      [{charBar}]
                    </span>
                    {status === 'active' && (
                      <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
