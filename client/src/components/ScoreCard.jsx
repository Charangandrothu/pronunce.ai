import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

export default function ScoreCard({ score = 0 }) {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = 70;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const increment = score / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [score]);

  const getLevelDetails = (val) => {
    if (val >= 90) {
      return {
        cefr: "CEFR C2",
        label: "Advanced Speaker",
        description: "Excellent pronunciation with minor stress deviations.",
        color: "text-white"
      };
    }
    if (val >= 80) {
      return {
        cefr: "CEFR C1",
        label: "Advanced Speaker",
        description: "Good articulation with minor stress issues.",
        color: "text-slate-200"
      };
    }
    if (val >= 70) {
      return {
        cefr: "CEFR B2",
        label: "Upper Intermediate",
        description: "Solid articulation with some stress mismatches.",
        color: "text-slate-300"
      };
    }
    return {
      cefr: "CEFR B1",
      label: "Intermediate Learner",
      description: "Requires practice on core phonetic structures.",
      color: "text-slate-450"
    };
  };

  const level = getLevelDetails(score);

  return (
    <div className="glass-panel bg-[#121215]/50 border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden h-full">
      <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
        <Target className="h-4 w-4 text-slate-400" />
        <span>Overall Pronunciation Score</span>
      </div>

      {/* SVG Radial Meter */}
      <div className="relative flex items-center justify-center w-40 h-40">
        <svg className="w-full h-full transform -rotate-90">
          <defs>
            <linearGradient id="scoreRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
          {/* Base track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-white/5"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active stroke */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            stroke="url(#scoreRingGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>

        {/* Value Label */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tracking-tight text-white">
            {displayScore}
          </span>
          <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
            / 100 max
          </span>
        </div>
      </div>

      <div className="mt-6 relative z-10">
        <div className="flex items-center justify-center space-x-2">
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/8 text-[9px] font-bold text-slate-300">
            {level.cefr}
          </span>
          <span className={`text-xs font-semibold ${level.color}`}>
            {level.label}
          </span>
        </div>
        <p className="text-xs text-slate-450 mt-3 max-w-xs leading-relaxed font-light">
          {level.description}
        </p>
      </div>
    </div>
  );
}
