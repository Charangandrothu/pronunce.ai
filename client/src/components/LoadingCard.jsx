import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, Circle, UploadCloud, FileAudio } from 'lucide-react';

export default function LoadingCard({ progress }) {
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

  return (
    <div className="w-full max-w-xl mx-auto px-4 z-20 select-none">
      <div className="glass-panel glow-card bg-[#121215]/50 border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">
            <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin shrink-0" />
            <span>AI Calibration Pipeline</span>
          </div>
          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/5 border border-blue-500/10 text-blue-400 animate-pulse">
            Processing {progress}%
          </span>
        </div>

        {/* Realistic Progress Status */}
        <div className="space-y-4 mb-6">
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
                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 border ${
                  status === 'active' 
                    ? 'bg-blue-500/5 border-blue-500/10 text-white' 
                    : status === 'completed' 
                      ? 'bg-transparent border-transparent text-slate-500' 
                      : 'bg-transparent border-transparent text-slate-700'
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

      </div>
    </div>
  );
}
