import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Activity, Sparkles, ShieldCheck } from 'lucide-react';

function MetricItem({ label, score, icon, description }) {
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
      whileHover={{ y: -2 }}
      className="glass-panel glow-card bg-[#121215]/50 border border-white/5 rounded-2xl p-5 relative overflow-hidden shadow-md flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-450 shrink-0">
            {icon}
          </div>
          <div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">{label}</span>
            <p className="text-[10px] text-slate-500 font-light mt-1.5 leading-snug">{description}</p>
          </div>
        </div>
        <span className="text-sm font-extrabold text-white shrink-0">{displayScore}%</span>
      </div>

      <div className="mt-5">
        <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden border border-white/5">
          <motion.div
            className="bg-slate-400 h-full rounded-full"
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
      description: 'Syllable stress and phoneme articulation index.',
      icon: <Volume2 className="h-4 w-4" />
    },
    fluency: {
      score: pick('fluency', fluency),
      label: 'Fluency',
      description: 'Tempo, pause distribution, and rhythm cadence.',
      icon: <Activity className="h-4 w-4" />
    },
    clarity: {
      score: pick('clarity', clarity),
      label: 'Clarity',
      description: 'Vocal stability and clean speech sound projection.',
      icon: <Sparkles className="h-4 w-4" />
    },
    confidence: {
      score: pick('confidence', confidence),
      label: 'Confidence',
      description: 'Articulative certainty and steady signal speed.',
      icon: <ShieldCheck className="h-4 w-4" />
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
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
          description={item.description}
        />
      ))}
    </motion.div>
  );
}
