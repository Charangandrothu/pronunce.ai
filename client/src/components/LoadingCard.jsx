import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

export default function LoadingCard({ progress }) {
  const steps = [
    { label: "Uploading Audio", minProgress: 0, maxProgress: 25 },
    { label: "Speech Recognition", minProgress: 25, maxProgress: 55 },
    { label: "Pronunciation Analysis", minProgress: 55, maxProgress: 80 },
    { label: "Generating Report", minProgress: 80, maxProgress: 100 }
  ];

  const getStepStatus = (step, currentProgress) => {
    if (currentProgress >= step.maxProgress) return 'completed';
    if (currentProgress >= step.minProgress && currentProgress < step.maxProgress) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 z-20 select-none animate-fade-in">
      <div className="glass-panel bg-[#121215]/50 border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col items-center">
          
          {/* Header */}
          <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
            <Loader2 className="h-3.5 w-3.5 text-slate-400 animate-spin" />
            <span>AI Assessment Pipeline</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white text-center">
            Calibrating Vocal Sample
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 text-center font-light">
            Aligning speech syllables against phonetic neural profiles.
          </p>

          {/* Simple Monochrome Progress Bar */}
          <div className="w-full bg-white/5 rounded-full h-1 mt-8 overflow-hidden border border-white/5">
            <motion.div 
              className="bg-white h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Timeline Step Blocks */}
          <div className="w-full mt-8 space-y-2 border-t border-white/5 pt-6">
            {steps.map((step, idx) => {
              const status = getStepStatus(step, progress);
              
              return (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-3.5 rounded-xl transition-all duration-300 border ${
                    status === 'active' 
                      ? 'bg-white/[0.02] border-white/8 text-white' 
                      : status === 'completed' 
                        ? 'bg-transparent border-transparent text-slate-500' 
                        : 'bg-transparent border-transparent text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {status === 'completed' ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-white shrink-0" />
                    ) : status === 'active' ? (
                      <Loader2 className="h-4.5 w-4.5 text-white animate-spin shrink-0" />
                    ) : (
                      <Circle className="h-4.5 w-4.5 text-zinc-800 shrink-0" />
                    )}
                    <span className="text-xs font-semibold tracking-tight">{step.label}</span>
                  </div>

                  <div>
                    {status === 'completed' && (
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        Done
                      </span>
                    )}
                    {status === 'active' && (
                      <span className="text-[9px] font-bold text-white bg-white/5 border border-white/10 px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
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
