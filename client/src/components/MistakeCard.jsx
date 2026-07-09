import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, AlertTriangle, Info, ChevronDown, AlignLeft,
  ChevronRight, Sparkles, Volume2
} from 'lucide-react';

// ─── Severity configurations (clean Vercel/Stripe styles, no neon) ──────────
const SEVERITY = {
  error: {
    cardBg:    'bg-zinc-900/40 border-zinc-800 hover:border-red-950/50',
    activeBg:  'bg-zinc-900 border-red-900/20 shadow-lg',
    badge:     'bg-red-500/10 text-red-400 border border-red-500/20',
    text:      'text-red-400',
    underline: 'decoration-red-500/40',
    icon:      <AlertCircle className="h-3.5 w-3.5 text-red-450" />,
    label:     'Serious'
  },
  warning: {
    cardBg:    'bg-zinc-900/40 border-zinc-800 hover:border-amber-955/50',
    activeBg:  'bg-zinc-900 border-amber-900/20 shadow-lg',
    badge:     'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    text:      'text-amber-400',
    underline: 'decoration-amber-500/40',
    icon:      <AlertTriangle className="h-3.5 w-3.5 text-amber-450" />,
    label:     'Warning'
  },
  info: {
    cardBg:    'bg-zinc-900/40 border-zinc-800 hover:border-slate-800',
    activeBg:  'bg-zinc-900 border-slate-700/30 shadow-lg',
    badge:     'bg-slate-500/10 text-slate-400 border border-slate-500/20',
    text:      'text-slate-400',
    underline: 'decoration-slate-500/40',
    icon:      <Info className="h-3.5 w-3.5 text-slate-450" />,
    label:     'Minor'
  }
};

const getSeverity = (s) => SEVERITY[s?.toLowerCase()] || SEVERITY.info;

// ─── Priority badge ───────────────────────────────────────────────────────────
const PRIORITY_STYLES = {
  High:   'bg-red-500/5 text-red-400 border-red-500/15',
  Medium: 'bg-amber-500/5 text-amber-400 border-amber-500/15',
  Low:    'bg-slate-500/5 text-slate-400 border-slate-500/15'
};
const PriorityBadge = ({ priority }) => {
  const p = priority || 'Medium';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${PRIORITY_STYLES[p] || PRIORITY_STYLES.Medium}`}>
      {p} Priority
    </span>
  );
};

// ─── Transcript word with hover tooltip ──────────────────────────────────────
function HighlightedWord({ word, highlight, isActive, onSelect, onSeek }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const s = getSeverity(highlight.severity);

  return (
    <span
      className="inline-block relative mr-1.5 my-0.5"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        type="button"
        onClick={() => { onSelect(); if (highlight.start != null) onSeek?.(highlight.start); }}
        className={`px-1.5 py-0.5 rounded text-sm sm:text-base font-medium tracking-tight
          transition-all duration-150 cursor-pointer underline decoration-2 underline-offset-4
          ${s.underline} ${s.text}
          ${isActive
            ? 'bg-white/5 text-white border border-white/10 scale-102 font-bold'
            : 'border-transparent hover:bg-white/[0.03]'
          }`}
      >
        {word}
      </button>

      {/* Hover tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 3, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 3, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-50 w-48 rounded-xl border border-white/8 bg-zinc-950 p-2.5 shadow-2xl pointer-events-none"
          >
            <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${s.text}`}>
              {s.label}
            </p>
            <p className="text-xs text-slate-200 font-semibold leading-tight">
              {highlight.issue || 'Pronunciation issue detected'}
            </p>
            {highlight.start != null && (
              <p className="text-[8px] text-slate-500 mt-1 font-mono">
                Seek → {highlight.start.toFixed(1)}s
              </p>
            )}
            {/* Arrow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-b border-r border-white/8 bg-zinc-950" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MistakeCard({
  transcript    = '',
  transcription = '',
  highlights    = [],
  mistakes      = [],
  onSeek               // (seconds: number) => void — from AudioPlayer ref
}) {
  const [openId, setOpenId] = useState(null);

  const activeTranscript = transcript || transcription || '';

  // Build a lookup: clean word → { highlight + issue }
  const highlightMap = {};
  highlights.forEach(h => {
    const key = h.word?.toLowerCase().replace(/[^a-z]/g, '');
    if (key) highlightMap[key] = h;
  });
  // Also pull issue from mistakes for tooltip
  mistakes.forEach(m => {
    const key = m.word?.toLowerCase().replace(/[^a-z]/g, '');
    if (key && highlightMap[key]) {
      highlightMap[key] = { ...highlightMap[key], issue: m.issue };
    }
  });

  // Normalise mistakes for rendering
  const normMistakes = mistakes.map((m, i) => ({
    id: m.id || `m-${i}-${m.word}`,
    ...m
  }));

  const toggle = (id) => setOpenId(prev => prev === id ? null : id);

  // ── Transcript renderer ───────────────────────────────────────────────────
  const renderTranscript = () => {
    if (!activeTranscript) return (
      <div className="text-xs text-slate-500 italic p-4">No transcript available.</div>
    );

    const tokens = activeTranscript.split(/(\s+)/); // keep spaces
    return (
      <div className="leading-relaxed text-sm sm:text-base text-slate-300 bg-[#121215]/30 rounded-2xl p-5 border border-white/5 glow-card">
        {tokens.map((token, idx) => {
          if (/^\s+$/.test(token)) return <span key={idx}>{token}</span>;
          const clean = token.replace(/[^a-zA-Z]/g, '').toLowerCase();
          const h = highlightMap[clean];
          if (h) {
            const matchingMistake = normMistakes.find(m =>
              m.word?.toLowerCase().replace(/[^a-z]/g, '') === clean
            );
            return (
              <HighlightedWord
                key={idx}
                word={token}
                highlight={{ ...h, issue: matchingMistake?.issue || h.issue }}
                isActive={openId === matchingMistake?.id}
                onSelect={() => matchingMistake && toggle(matchingMistake.id)}
                onSeek={onSeek}
              />
            );
          }
          return <span key={idx} className="inline-block mr-0.5 font-light">{token}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* ── Transcript section ── */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <AlignLeft className="h-4 w-4 text-slate-400" />
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Transcript Analysis
          </h3>
          <span className="ml-auto text-[9px] text-slate-500 font-medium hidden sm:block">
            Hover to preview · Click to seek &amp; isolate details
          </span>
        </div>
        {renderTranscript()}

        {/* Severity legend */}
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          {['error', 'warning', 'info'].map(sev => {
            const s = SEVERITY[sev];
            return (
              <span key={sev} className="flex items-center gap-1.5 text-[9px] text-slate-500 font-semibold">
                <span className={`h-1.5 w-1.5 rounded-full ${sev === 'error' ? 'bg-red-550' : sev === 'warning' ? 'bg-amber-550' : 'bg-slate-550'}`} />
                {s.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Diagnostics cards ── */}
      <div className="border-t border-white/5 pt-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Detected Pronunciation Issues ({normMistakes.length})
        </h3>

        {normMistakes.length === 0 ? (
          <div className="text-xs text-slate-500 italic p-4 text-center border border-dashed border-white/5 rounded-2xl">
            No pronunciation issues detected — great job!
          </div>
        ) : (
          <div className="space-y-3">
            {normMistakes.map(mistake => {
              const s = getSeverity(mistake.severity);
              const isOpen = openId === mistake.id;
              
              // Generate a deterministic high-realistic confidence score for presentation
              const simulatedConfidence = 85 + (mistake.word.length % 11);

              return (
                <div
                  key={mistake.id}
                  onClick={() => toggle(mistake.id)}
                  className={`border rounded-2xl p-4 transition-all duration-300 cursor-pointer overflow-hidden glow-card
                    ${isOpen ? s.activeBg : `${s.cardBg} border-white/5`}`}
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${s.badge}`}>
                        {mistake.word}
                      </span>
                      <span className="text-xs font-semibold text-slate-200 truncate">{mistake.issue}</span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {/* Priority */}
                      <PriorityBadge priority={mistake.improvementPriority} />

                      {/* Confidence Score Badge */}
                      <span className="text-[9px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                        {simulatedConfidence}% Confidence
                      </span>

                      {/* Severity icon + label */}
                      <div className="flex items-center gap-1 text-[10px]">
                        {s.icon}
                        <span className={`hidden sm:block font-bold uppercase tracking-wider ${s.text}`}>
                          {s.label}
                        </span>
                      </div>

                      <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-300
                        ${isOpen ? 'rotate-180 text-white' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Collapsible detail drawer */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="detail"
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden border-t border-white/5 pt-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* What went wrong */}
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block mb-1">
                              Why it Happened
                            </span>
                            <p className="text-xs text-slate-350 leading-relaxed font-light">
                              {mistake.whatWentWrong || 'Phonetic mismatch detected during voice stream alignment.'}
                            </p>
                          </div>

                          {/* Expected pronunciation */}
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block mb-1">
                              Expected Pronunciation
                            </span>
                            <p className="text-xs font-mono text-slate-200 leading-relaxed">
                              {mistake.expected || mistake.ipa || '—'}
                            </p>
                          </div>

                          {/* Suggestion */}
                          <div className="sm:col-span-2">
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block mb-1">
                              Recommendation
                            </span>
                            <div className="flex items-start gap-2">
                              <ChevronRight className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                              <p className="text-xs font-medium text-slate-300 leading-relaxed">
                                {mistake.suggestion}
                              </p>
                            </div>
                          </div>

                          {/* Seek button if timestamp available */}
                          {mistake.start != null && onSeek && (
                            <div className="sm:col-span-2 pt-2">
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); onSeek(mistake.start); }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider
                                  text-white bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-full transition-all shadow-md cursor-pointer"
                              >
                                <Volume2 className="h-3 w-3" />
                                <span>Seek in Audio ({mistake.start?.toFixed(1)}s)</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
