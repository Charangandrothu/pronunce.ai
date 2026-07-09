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
 */
const phoneSimilarity = (spokenRaw, target) => {
  if (!spokenRaw || !target) return 0;
  const b = target.toLowerCase().trim();

  const words = spokenRaw.toLowerCase().trim().split(/\s+/);
  const a = words.reduce((best, w) => {
    const d = levenshtein(w, b);
    return d < levenshtein(best, b) ? w : best;
  }, words[0]);

  if (a === b) return 100;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 100;

  const levScore = ((maxLen - levenshtein(a, b)) / maxLen) * 60;
  const letterBonus = a[0] === b[0] ? 20 : 0;
  const prefix = Math.min(3, b.length);
  const prefixMatch = a.slice(0, prefix) === b.slice(0, prefix) ? 20 : 0;

  return Math.min(100, Math.round(levScore + letterBonus + prefixMatch));
};

// ─── Browser SpeechRecognition wrapper ────────────────────────────────────────
const getSpeechRecognition = () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  return SR ? new SR() : null;
};

// ─── Difficulty badge (Stripe-like monochrome) ──────────────────────────────
const DifficultyBadge = ({ difficulty }) => {
  const level = difficulty?.toLowerCase();
  const styles = level === 'hard'
    ? 'bg-red-500/5 border-red-500/10 text-red-405'
    : level === 'easy'
      ? 'bg-slate-500/5 border-slate-500/10 text-slate-400'
      : 'bg-amber-500/5 border-amber-500/10 text-amber-405';
  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${styles}`}>
      {difficulty || 'Medium'}
    </span>
  );
};

// ─── Result pill with green success and color type accents ───────────────────
const RESULT_STYLES = {
  notDetected: {
    wrap:  'bg-zinc-900 border-zinc-800/80',
    text:  'text-slate-400',
    score: 'text-slate-400 bg-white/5 border-white/5',
    label: '🎙 Nothing detected — speak clearly.',
    Icon:  MicOff
  },
  excellent: {
    wrap:  'bg-emerald-950/20 border-emerald-500/20',
    text:  'text-emerald-400',
    score: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    label: 'Excellent pronunciation!',
    Icon:  CheckCircle
  },
  good: {
    wrap:  'bg-amber-950/20 border-amber-500/20',
    text:  'text-amber-400',
    score: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    label: 'Close — keep practicing',
    Icon:  AlertTriangle
  },
  poor: {
    wrap:  'bg-red-950/20 border-red-500/20',
    text:  'text-red-400',
    score: 'text-red-400 bg-red-500/10 border-red-500/20',
    label: 'Try again — articulate clearly',
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
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className={`mt-3 p-3.5 rounded-xl border shadow-md ${s.wrap}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 min-w-0">
          <Icon className={`h-4 w-4 shrink-0 ${s.text}`} />
          <div className="min-w-0">
            {!notDetected && (
              <p className="text-xs font-semibold text-slate-200 truncate">
                You said: &ldquo;{spokenWord}&rdquo;
              </p>
            )}
            <p className={`text-[10px] mt-0.5 ${s.text}`}>{s.label}</p>
          </div>
        </div>
        {!notDetected && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${s.score}`}>
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
    <div className={`flex flex-col gap-2.5 p-4.5 rounded-2xl border transition-all duration-300 ${
      active
        ? 'bg-zinc-900 border-slate-700/30'
        : 'bg-[#121215]/30 hover:bg-[#121215]/50 border-white/5 glow-card'
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Word info */}
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-slate-200 capitalize">{item.word}</span>
            <DifficultyBadge difficulty={item.difficulty} />
            {result && !result.notDetected && (
              <span className="inline-flex items-center text-[9px] text-emerald-400 font-semibold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/15">
                Recently Practiced
              </span>
            )}
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
            <Volume2 className="h-3.5 w-3.5 text-slate-450" />
            <span>Listen</span>
          </button>

          <button
            type="button"
            onClick={() => onRecord(item.word)}
            disabled={isDisabled}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-md ${
              active
                ? 'bg-red-600 text-white cursor-pointer animate-pulse'
                : isDisabled
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-transparent'
                  : 'text-white bg-zinc-900 border border-white/10 hover:bg-zinc-800 cursor-pointer'
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

      {/* Recording & Real-time hearing indicator */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-1.5 pt-1.5 border-t border-white/5 mt-1"
          >
            <div className="flex items-center space-x-2">
              <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                Listening...
              </span>
            </div>
            {result && result.spokenWord && (
              <p className="text-xs text-slate-350 italic">
                Hearing: &ldquo;<span className="text-white font-medium capitalize">{result.spokenWord}</span>&rdquo;
              </p>
            )}
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
  const [results, setResults]             = useState({});     // { word: { score, spokenWord, notDetected } }
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

  // ── Record (real Speech Recognition with real-time interim updates) ────────
  const handleRecord = useCallback((targetWord) => {
    if (recordingWord === targetWord) {
      stopRecognition();
      return;
    }

    stopRecognition();
    setSrError('');

    const recognition = getSpeechRecognition();
    if (!recognition) {
      setSrError('Speech Recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    recognition.lang              = 'en-US';
    recognition.interimResults    = true; // Enable real-time updates as you speak!
    recognition.maxAlternatives   = 5;
    recognition.continuous        = false;

    setRecordingWord(targetWord);
    recognitionRef.current = recognition;

    // Reset current word results so it registers fresh audio stream
    setResults(prev => ({
      ...prev,
      [targetWord]: null
    }));

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const text = (finalTranscript || interimTranscript).trim();
      if (text) {
        const score = phoneSimilarity(text, targetWord);
        setResults(prev => ({
          ...prev,
          [targetWord]: { score, spokenWord: text, notDetected: false }
        }));
      }
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
      // Auto-fallback: if recording ended but no voice data was registered in state,
      // explicitly trigger a Not Detected visual pill.
      setResults(prev => {
        if (!prev[targetWord]) {
          return { ...prev, [targetWord]: { notDetected: true } };
        }
        return prev;
      });
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
    <div className="glass-panel glow-card bg-[#121215]/50 border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
        <BrainCircuit className="h-4 w-4 text-slate-400" />
        <span>Practice Section</span>
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">Practice Challenging Vocabulary</h3>
      <p className="text-xs text-slate-455 leading-relaxed mb-6 font-light">
        Click <strong className="text-slate-350">Listen</strong> to hear the correct pronunciation, then click{' '}
        <strong className="text-slate-355">Record</strong> and say the word — your microphone score is compared against the target word in real time.
      </p>

      {/* SR not supported error */}
      <AnimatePresence>
        {srError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start space-x-2 text-xs text-red-400"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-450" />
            <span>{srError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Words list */}
      <div className="space-y-3.5">
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
        <div className="mt-6 pt-6 border-t border-white/5 text-xs text-slate-455 leading-relaxed font-light">
          <span className="font-bold text-slate-400 block mb-1.5 uppercase tracking-widest text-[9px]">
            AI Assessment Summary
          </span>
          {activeFeedback}
        </div>
      )}
    </div>
  );
}
