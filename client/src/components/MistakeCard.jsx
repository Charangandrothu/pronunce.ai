import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, AlertTriangle, Info, ChevronDown, Sparkles,
  ChevronRight, Zap
} from 'lucide-react';

// ─── Severity config (hardcoded classes to avoid Tailwind purge) ──────────────
const SEVERITY = {
  error: {
    cardBg:    'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50',
    activeBg:  'border-violet-500/40 bg-slate-900/60',
    badge:     'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    text:      'text-rose-400',
    underline: 'decoration-rose-400',
    dot:       'bg-rose-500',
    icon:      <AlertCircle className="h-4 w-4 text-rose-400" />,
    dots:      5,
    label:     '🔴 Serious',
    tooltip:   'border-rose-500/30 bg-rose-950/80'
  },
  warning: {
    cardBg:    'bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40',
    activeBg:  'border-violet-500/40 bg-slate-900/60',
    badge:     'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    text:      'text-amber-400',
    underline: 'decoration-amber-400',
    dot:       'bg-amber-500',
    icon:      <AlertTriangle className="h-4 w-4 text-amber-400" />,
    dots:      3,
    label:     '🟡 Warning',
    tooltip:   'border-amber-500/30 bg-amber-950/80'
  },
  info: {
    cardBg:    'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40',
    activeBg:  'border-violet-500/40 bg-slate-900/60',
    badge:     'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    text:      'text-blue-400',
    underline: 'decoration-blue-400',
    dot:       'bg-blue-500',
    icon:      <Info className="h-4 w-4 text-blue-400" />,
    dots:      1,
    label:     '🟢 Minor',
    tooltip:   'border-blue-500/30 bg-blue-950/80'
  }
};

const getSeverity = (s) => SEVERITY[s?.toLowerCase()] || SEVERITY.info;

// ─── Priority badge ───────────────────────────────────────────────────────────
const PRIORITY_STYLES = {
  High:   'bg-rose-500/15 text-rose-400 border-rose-500/25',
  Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  Low:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
};
const PriorityBadge = ({ priority }) => {
  const p = priority || 'Medium';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${PRIORITY_STYLES[p] || PRIORITY_STYLES.Medium}`}>
      <Zap className="h-2.5 w-2.5" />
      {p}
    </span>
  );
};

// ─── Transcript word with hover tooltip ──────────────────────────────────────
function HighlightedWord({ word, highlight, isActive, onSelect, onSeek }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const s = getSeverity(highlight.severity);

  return (
    <span
      className="inline-block relative mr-2 my-1"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        type="button"
        onClick={() => { onSelect(); if (highlight.start != null) onSeek?.(highlight.start); }}
        className={`px-2 py-0.5 rounded-lg border text-xs sm:text-sm font-bold tracking-tight
          transition-all duration-200 cursor-pointer underline decoration-2 underline-offset-4
          ${s.underline} ${s.text}
          ${isActive
            ? `${s.cardBg} border-current scale-105 shadow-[0_0_16px_rgba(139,92,246,0.2)]`
            : 'border-transparent hover:bg-white/5'
          }`}
      >
        {word}
      </button>

      {/* Hover tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-52 rounded-xl border
              px-3 py-2.5 shadow-2xl pointer-events-none ${s.tooltip}`}
          >
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${s.text}`}>
              {s.label}
            </p>
            <p className="text-xs text-slate-200 font-semibold leading-snug">
              {highlight.issue || 'Pronunciation issue detected'}
            </p>
            {highlight.start != null && (
              <p className="text-[9px] text-slate-500 mt-1.5">
                Click to seek → {highlight.start.toFixed(1)}s
              </p>
            )}
            {!highlight.start && (
              <p className="text-[9px] text-slate-500 mt-1.5 italic">Click to view details ↓</p>
            )}
            {/* Arrow */}
            <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45
              border-b border-r ${s.tooltip.includes('rose') ? 'border-rose-500/30 bg-rose-950/80'
                : s.tooltip.includes('amber') ? 'border-amber-500/30 bg-amber-950/80'
                : 'border-blue-500/30 bg-blue-950/80'}`}
            />
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
      <div className="leading-relaxed text-sm sm:text-base text-slate-300 bg-slate-950/60 rounded-2xl p-5 border border-white/5 shadow-inner">
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
        <div className="flex items-center space-x-2.5 mb-3">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            AI Speech Highlight &amp; Transcript
          </h3>
          <span className="ml-auto text-[9px] text-slate-600 font-medium hidden sm:block">
            Hover to preview · Click to seek &amp; expand
          </span>
        </div>
        {renderTranscript()}

        {/* Severity legend */}
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          {['error', 'warning', 'info'].map(sev => {
            const s = SEVERITY[sev];
            return (
              <span key={sev} className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                {s.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Diagnostics cards ── */}
      <div className="border-t border-white/5 pt-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          AI Phonetic Diagnostics ({normMistakes.length})
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

              return (
                <div
                  key={mistake.id}
                  onClick={() => toggle(mistake.id)}
                  className={`glass-panel border rounded-2xl p-4 transition-all duration-300 cursor-pointer overflow-hidden
                    ${isOpen ? s.activeBg : `border-white/5 hover:border-white/10 hover:bg-white/[0.01]`}`}
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.badge}`}>
                        {mistake.word}
                      </span>
                      <span className="text-xs font-bold text-slate-200 truncate">{mistake.issue}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Priority */}
                      <PriorityBadge priority={mistake.improvementPriority} />

                      {/* Severity dots */}
                      <div className="hidden sm:flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={`h-1.5 w-1.5 rounded-full ${i < s.dots ? s.dot : 'bg-white/10'}`} />
                        ))}
                      </div>

                      {/* Severity icon + label */}
                      <div className="flex items-center gap-1">
                        {s.icon}
                        <span className={`hidden sm:block text-[9px] font-bold uppercase tracking-wider ${s.text}`}>
                          {mistake.severity}
                        </span>
                      </div>

                      <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-300
                        ${isOpen ? 'rotate-180 text-violet-400' : ''}`}
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
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden border-t border-white/5 pt-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* What went wrong */}
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block mb-1">
                              What Went Wrong
                            </span>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {mistake.whatWentWrong || mistake.issue}
                            </p>
                          </div>

                          {/* Expected pronunciation */}
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block mb-1">
                              Expected Pronunciation
                            </span>
                            <p className="text-xs font-mono text-violet-300 leading-relaxed">
                              {mistake.expected || mistake.ipa || '—'}
                            </p>
                          </div>

                          {/* Suggestion */}
                          <div className="sm:col-span-2">
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block mb-1">
                              Correction Directive
                            </span>
                            <div className="flex items-start gap-2">
                              <ChevronRight className="h-3.5 w-3.5 text-cyan-400 mt-0.5 shrink-0" />
                              <p className="text-xs font-semibold text-cyan-400 leading-relaxed">
                                {mistake.suggestion}
                              </p>
                            </div>
                          </div>

                          {/* Seek button if timestamp available */}
                          {mistake.start != null && onSeek && (
                            <div className="sm:col-span-2">
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); onSeek(mistake.start); }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider
                                  text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-full transition-all shadow-md cursor-pointer"
                              >
                                ▶ Jump to {mistake.start?.toFixed(1)}s in audio
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
