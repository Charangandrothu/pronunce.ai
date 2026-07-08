import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Target } from 'lucide-react';

export default function ScoreCard({ score = 0 }) {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = 70;
  const strokeWidth = 10;
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

  const getLevelLabel = (val) => {
    if (val >= 90) return { title: "Native Speaker Level", color: "text-cyan-400" };
    if (val >= 80) return { title: "Advanced Professional", color: "text-violet-400" };
    if (val >= 70) return { title: "Upper Intermediate", color: "text-indigo-400" };
    return { title: "Intermediate Learner", color: "text-amber-400" };
  };

  const level = getLevelLabel(score);

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden h-full ambient-card-glow border-white/10">
      {/* Dynamic Backlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-tr from-violet-600/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
        <Target className="h-4.5 w-4.5 text-violet-400" />
        <span>Vocal Accuracy Index</span>
      </div>

      {/* SVG Radial Meter */}
      <div className="relative flex items-center justify-center w-44 h-44">
        <svg className="w-full h-full transform -rotate-90">
          <defs>
            <linearGradient id="scoreRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          {/* Base track */}
          <circle
            cx="88"
            cy="88"
            r={radius}
            className="stroke-white/5"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active stroke with gradient */}
          <motion.circle
            cx="88"
            cy="88"
            r={radius}
            stroke="url(#scoreRingGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            style={{
              filter: "drop-shadow(0 0 10px rgba(139, 92, 246, 0.4))"
            }}
          />
        </svg>

        {/* Value Label */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-5xl font-extrabold tracking-tight text-white">
            {displayScore}
          </span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            / 100 Max
          </span>
        </div>
      </div>

      <div className="mt-6 relative z-10">
        <span className={`text-xs font-bold uppercase tracking-widest ${level.color}`}>
          {level.title}
        </span>
        <p className="text-xs text-slate-400 mt-2.5 max-w-xs leading-relaxed font-light">
          Articulations successfully calibrated. Phonation structures show strong rhythmic alignment.
        </p>
      </div>
    </div>
  );
}
