import React, { useState, useRef, useCallback } from 'react';
import { Volume2, Mic, MicOff, CheckCircle, XCircle, BrainCircuit, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


// ─── Levenshtein distance ─────────────────────────────────────────────────────
const levenshtein = (a, b) => {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
};

/**
 * Multi-factor phonetic similarity score (0–100).
 * Combines:
 *  - Character-level Levenshtein similarity (60% weight)
 *  - First-letter match bonus              (20% weight)
 *  - First 3-char prefix match bonus       (20% weight)
 *
 * Only the FIRST WORD of `spoken` is compared — so if the user says
 * a sentence, we grab the single word closest to the target.
 */
const phoneSimilarity = (spokenRaw, target) => {
  if (!spokenRaw || !target) return 0;
  const b = target.toLowerCase().trim();

  // Grab the single word from what was spoken that's most like the target
  const words = spokenRaw.toLowerCase().trim().split(/\s+/);
  const a = words.reduce((best, w) => {
    const d = levenshtein(w, b);
    return d < levenshtein(best, b) ? w : best;
  }, words[0]);

  if (a === b) return 100;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 100;

  // Base Levenshtein score
  const levScore = ((maxLen - levenshtein(a, b)) / maxLen) * 60;

  // First letter match
  const letterBonus = a[0] === b[0] ? 20 : 0;

  // First 3 chars prefix match
  const prefix = Math.min(3, b.length);
  const prefixMatch = a.slice(0, prefix) === b.slice(0, prefix) ? 20 : 0;

  return Math.min(100, Math.round(levScore + letterBonus + prefixMatch));
};

// ─── Browser SpeechRecognition wrapper ────────────────────────────────────────
const getSpeechRecognition = () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  return SR ? new SR() : null;
};

// ─── Difficulty badge ─────────────────────────────────────────────────────────
const DifficultyBadge = ({ difficulty }) => {
  const level = difficulty?.toLowerCase();
  const styles = level === 'hard'
    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
    : level === 'easy'
      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
      : 'bg-amber-500/10 border-amber-500/20 text-amber-400';
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${styles}`}>
      {difficulty || 'Medium'}
    </span>
  );
};

// ─── Result pill ──────────────────────────────────────────────────────────────
// Uses hardcoded Tailwind classes (not dynamic strings) to prevent purging.
const RESULT_STYLES = {
  notDetected: {
    wrap:  'bg-slate-800/60 border-slate-600/30',
    text:  'text-slate-400',
    score: 'text-slate-400 bg-slate-700/30 border-slate-600/30',
    label: '🎙 Nothing detected — please speak clearly into your mic.',
    Icon:  MicOff
  },
  excellent: {
    wrap:  'bg-emerald-500/10 border-emerald-500/20',
    text:  'text-emerald-400',
    score: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    label: '✅ Excellent pronunciation!',
    Icon:  CheckCircle
  },
  good: {
    wrap:  'bg-amber-500/10 border-amber-500/20',
    text:  'text-amber-400',
    score: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    label: '⚠️ Close — keep practising',
    Icon:  AlertTriangle
  },
  poor: {
    wrap:  'bg-rose-500/10 border-rose-500/20',
    text:  'text-rose-400',
    score: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    label: '❌ Try again — say the word clearly',
    Icon:  XCircle
  }
};

const ResultPill = ({ score, spokenWord, notDetected }) => {
  const key = notDetected
    ? 'notDetected'
    : score >= 85 ? 'excellent'
    : score >= 65 ? 'good'
    : 'poor';

  const s = RESULT_STYLES[key];
  const Icon = s.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className={`mt-4 p-4 rounded-2xl border shadow-lg ${s.wrap}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <Icon className={`h-5 w-5 shrink-0 ${s.text}`} />
          <div className="min-w-0">
            {!notDetected && (
              <p className="text-xs font-semibold text-slate-300 truncate">
                You said: <strong className="text-white">&ldquo;{spokenWord}&rdquo;</strong>
              </p>
            )}
            <p className={`text-[10px] mt-0.5 ${s.text}`}>{s.label}</p>
          </div>
        </div>
        {!notDetected && (
          <span className={`text-sm font-extrabold px-3 py-1 rounded-lg border shrink-0 ${s.score}`}>
            {score}%
          </span>
        )}
      </div>
    </motion.div>
  );
};

// ─── Word row ─────────────────────────────────────────────────────────────────
function WordRow({ item, isRecording, isDisabled, result, onListen, onRecord }) {
  const active = isRecording;

  return (
    <div className={`flex flex-col gap-2 p-4 rounded-2xl border transition-all duration-200 ${
      active
        ? 'bg-violet-600/10 border-violet-500/30'
        : 'bg-white/[0.01] hover:bg-white/[0.02] border-white/5 hover:border-white/10'
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Word info */}
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-slate-200 capitalize">{item.word}</span>
            <DifficultyBadge difficulty={item.difficulty} />
          </div>
          <span className="text-xs font-mono text-slate-500 mt-1 block tracking-wider">
            {item.ipa || '/.../'}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => onListen(item.word)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer border border-white/5"
          >
            <Volume2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>Listen</span>
          </button>

          <button
            type="button"
            onClick={() => onRecord(item.word)}
            disabled={isDisabled}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-md ${
              active
                ? 'bg-rose-500 text-white cursor-pointer animate-pulse'
                : isDisabled
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'text-slate-950 bg-white hover:bg-cyan-400 cursor-pointer'
            }`}
          >
            {active ? (
              <><MicOff className="h-3.5 w-3.5 shrink-0" /><span>Stop</span></>
            ) : (
              <><Mic className="h-3.5 w-3.5 shrink-0" /><span>Record</span></>
            )}
          </button>
        </div>
      </div>

      {/* Recording indicator */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center space-x-2 pt-1"
          >
            <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
              Listening — say &ldquo;<span className="text-white capitalize">{item.word}</span>&rdquo; now...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && !active && (
          <ResultPill
            score={result.score ?? 0}
            spokenWord={result.spokenWord ?? ''}
            notDetected={result.notDetected === true}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Suggestions({ suggestions = {}, practiceWords = [], summary = '' }) {
  const [recordingWord, setRecordingWord] = useState(null);  // word currently being recorded
  const [results, setResults]             = useState({});     // { word: { score, spokenWord } }
  const [srError, setSrError]             = useState('');     // SR not supported
  const recognitionRef                    = useRef(null);

  const activeWords = (practiceWords?.length > 0)
    ? practiceWords
    : (suggestions?.practiceWords || []);

  const activeFeedback = summary || suggestions?.generalFeedback || '';

  // ── Listen (TTS) ────────────────────────────────────────────────────────────
  const handleListen = useCallback((word) => {
    window.speechSynthesis?.cancel();
    const utt = new SpeechSynthesisUtterance(word);
    utt.lang = 'en-US';
    utt.rate = 0.75;
    window.speechSynthesis?.speak(utt);
  }, []);

  // ── Stop any running recognition ────────────────────────────────────────────
  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    setRecordingWord(null);
  }, []);

  // ── Record (real Speech Recognition) ────────────────────────────────────────
  const handleRecord = useCallback((targetWord) => {
    // If already recording this word — stop
    if (recordingWord === targetWord) {
      stopRecognition();
      return;
    }

    // Stop any previous session
    stopRecognition();
    setSrError('');

    const recognition = getSpeechRecognition();
    if (!recognition) {
      setSrError('Speech Recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    recognition.lang              = 'en-US';
    recognition.interimResults    = false;
    recognition.maxAlternatives   = 5;
    recognition.continuous        = false;

    setRecordingWord(targetWord);
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const result = event.results[0];

      // Collect alternatives
      const alternatives = Array.from(result).map(alt => ({
        transcript: alt.transcript.trim()
      }));
      console.log('[Speech Recognition]: Alternatives:', alternatives);

      if (alternatives.length === 0 || !alternatives[0].transcript) {
        setResults(prev => ({ ...prev, [targetWord]: { notDetected: true } }));
        setRecordingWord(null);
        recognitionRef.current = null;
        return;
      }

      // Pick the alternative most phonetically similar to target
      const scored = alternatives.map(alt => ({
        spoken: alt.transcript,
        score: phoneSimilarity(alt.transcript, targetWord)
      }));
      scored.sort((a, b) => b.score - a.score);
      const best = scored[0];

      setResults(prev => ({
        ...prev,
        [targetWord]: { score: best.score, spokenWord: best.spoken, notDetected: false }
      }));
      setRecordingWord(null);
      recognitionRef.current = null;
    };

    recognition.onerror = (event) => {
      console.error('[Speech Recognition Error]:', event.error);
      if (event.error === 'no-speech') {
        setResults(prev => ({ ...prev, [targetWord]: { notDetected: true } }));
      } else if (event.error === 'not-allowed') {
        setSrError('Microphone access was denied. Please allow microphone access and try again.');
      } else {
        setSrError(`Recognition error: ${event.error}`);
      }
      setRecordingWord(null);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      // If result wasn't set and we're still showing as recording, it timed out
      setRecordingWord(prev => (prev === targetWord ? null : prev));
      if (recognitionRef.current) recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (err) {
      setSrError('Could not start microphone. Please try again.');
      setRecordingWord(null);
    }
  }, [recordingWord, stopRecognition]);

  return (
    <div className="glass-panel border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden h-full ambient-card-glow hover:border-white/10">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
        <BrainCircuit className="h-4.5 w-4.5 text-cyan-400" />
        <span>Vocal Practice Sandbox</span>
      </div>

      <h3 className="text-lg font-bold text-white mb-2">Practice Challenging Vocabulary</h3>
      <p className="text-xs text-slate-400 leading-relaxed mb-6 font-light">
        Click <strong className="text-slate-300">Listen</strong> to hear the correct pronunciation, then click{' '}
        <strong className="text-slate-300">Record</strong> and say the word — your microphone score is compared against the target word in real time.
      </p>

      {/* SR not supported error */}
      <AnimatePresence>
        {srError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start space-x-2 text-xs text-rose-300"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{srError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Words list */}
      <div className="space-y-3">
        {activeWords.length > 0 ? (
          activeWords.map((item, idx) => (
            <WordRow
              key={item.word || idx}
              item={item}
              isRecording={recordingWord === item.word}
              isDisabled={recordingWord !== null && recordingWord !== item.word}
              result={results[item.word] !== undefined ? results[item.word] : null}
              onListen={handleListen}
              onRecord={handleRecord}
            />
          ))
        ) : (
          <div className="text-center p-6 text-xs text-slate-500 font-light border border-dashed border-white/5 rounded-2xl">
            No challenging words flagged for this recording — excellent pronunciation!
          </div>
        )}
      </div>

      {/* Feedback summary */}
      {activeFeedback && (
        <div className="mt-6 pt-6 border-t border-white/5 text-xs text-slate-500 leading-relaxed font-light">
          <span className="font-bold text-slate-400 block mb-1.5 uppercase tracking-widest text-[9px]">
            AI Feedback Summary
          </span>
          {activeFeedback}
        </div>
      )}
    </div>
  );
}
