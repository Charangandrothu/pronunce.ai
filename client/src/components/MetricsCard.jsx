import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Activity, Sparkles, ShieldCheck } from 'lucide-react';

function MetricItem({ label, score, icon, colorClass }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200; // milliseconds
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

  return (
    <motion.div 
      whileHover={{ y: -3, scale: 1.01 }}
      className="glass-panel border-white/5 rounded-2xl p-5 relative overflow-hidden shadow-lg flex flex-col justify-between hover:border-white/10"
    >
      {/* Accent Glow Backlight */}
      <div className="absolute -right-12 -top-12 w-24 h-24 bg-white/[0.01] rounded-full blur-xl"></div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
            {icon}
          </div>
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{label}</span>
        </div>
        <span className="text-base font-extrabold text-white">{displayScore}%</span>
      </div>

      <div className="mt-5">
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
          <motion.div
            className={`bg-gradient-to-r ${colorClass} h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.05)]`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.15 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function MetricsCard({ metrics = {}, pronunciation, fluency, clarity, confidence }) {
  // Helper: pick value from nested metrics object OR direct prop, no fallback default
  const pick = (key, directVal) => {
    if (metrics[key]?.score !== undefined) return metrics[key].score;
    if (directVal !== undefined && directVal !== null) return directVal;
    return 0;
  };

  const scoreMap = {
    pronunciation: {
      score: pick('pronunciation', pronunciation),
      label: 'Pronunciation',
      icon: <Volume2 className="h-4.5 w-4.5 text-violet-400" />,
      colorClass: 'from-violet-500 to-indigo-500 shadow-violet-500/10'
    },
    fluency: {
      score: pick('fluency', fluency),
      label: 'Fluency',
      icon: <Activity className="h-4.5 w-4.5 text-cyan-400" />,
      colorClass: 'from-cyan-500 to-blue-500 shadow-cyan-500/10'
    },
    clarity: {
      score: pick('clarity', clarity),
      label: 'Clarity',
      icon: <Sparkles className="h-4.5 w-4.5 text-pink-400" />,
      colorClass: 'from-pink-500 to-rose-500 shadow-pink-500/10'
    },
    confidence: {
      score: pick('confidence', confidence),
      label: 'Confidence',
      icon: <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />,
      colorClass: 'from-emerald-500 to-teal-500 shadow-emerald-500/10'
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
    >
      {Object.entries(scoreMap).map(([key, item]) => (
        <MetricItem
          key={key}
          label={item.label}
          score={item.score}
          icon={item.icon}
          colorClass={item.colorClass}
        />
      ))}
    </motion.div>
  );
}
