import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import UploadCard from '../components/UploadCard';
import LoadingCard from '../components/LoadingCard';
import Footer from '../components/Footer';
import { uploadAudio, analyzeAudio, pingServer } from '../services/analysisService';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2, CheckCircle2, X } from 'lucide-react';

// Loading phases mapped to progress range
const PHASES = [
  { label: 'Uploading Audio',         min: 0,  max: 25  },
  { label: 'Speech Recognition',      min: 25, max: 55  },
  { label: 'Pronunciation Analysis', min: 55, max: 80  },
  { label: 'Generating Report',    min: 80, max: 99  }
];

export default function Home() {
  const [isAnalyzing, setIsAnalyzing]   = useState(false);
  const [progress,    setProgress]      = useState(0);
  const [pipelineError, setPipelineError] = useState(null); // Local error modal state instead of browser alerts
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'sleeping', 'online'
  const [showWakeupBanner, setShowWakeupBanner] = useState(false);
  const [wakingProgress, setWakingProgress] = useState(0);
  const navigate  = useNavigate();
  const location  = useLocation();
  const uploadRef = useRef(null);

  const handleStartClick = () => {
    uploadRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (location.state?.scrollToUpload) {
      setTimeout(handleStartClick, 150);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    let active = true;
    let pollInterval = null;
    let countdownInterval = null;

    const checkServer = async () => {
      try {
        await pingServer(1800);
        if (active) {
          setServerStatus('online');
          setShowWakeupBanner(false);
        }
      } catch (err) {
        if (active) {
          setServerStatus('sleeping');
          setShowWakeupBanner(true);
          startPolling();
          startCountdown();
        }
      }
    };

    const startPolling = () => {
      pollInterval = setInterval(async () => {
        try {
          await pingServer(2500);
          if (active) {
            setServerStatus('online');
            setWakingProgress(100);
            clearInterval(pollInterval);
            if (countdownInterval) clearInterval(countdownInterval);
            setTimeout(() => {
              if (active) setShowWakeupBanner(false);
            }, 3000);
          }
        } catch (e) {
          // Keep polling
        }
      }, 4500);
    };

    const startCountdown = () => {
      const totalSec = 50;
      let elapsedSec = 0;
      countdownInterval = setInterval(() => {
        elapsedSec += 1;
        const pct = Math.min(Math.round((elapsedSec / totalSec) * 100), 98);
        if (active) {
          setWakingProgress(pct);
        }
        if (elapsedSec >= totalSec) {
          clearInterval(countdownInterval);
        }
      }, 1000);
    };

    checkServer();

    return () => {
      active = false;
      if (pollInterval) clearInterval(pollInterval);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, []);

  /**
   * Animates progress from `from` to `to` over `durationMs` milliseconds.
   * Returns a cancel function.
   */
  const animateProgress = (from, to, durationMs) => {
    let current  = from;
    const steps  = Math.abs(to - from);
    const delay  = durationMs / steps;
    const timer  = setInterval(() => {
      current += 1;
      setProgress(current);
      if (current >= to) clearInterval(timer);
    }, delay);
    return () => clearInterval(timer);
  };

  const handleUploadSuccess = async (file) => {
    setIsAnalyzing(true);
    setProgress(0);
    setPipelineError(null);

    // Phase 1 — demo bypass
    if (file?.isDemo) {
      let p = 0;
      const demoTimer = setInterval(() => {
        p += 2;
        setProgress(Math.min(p, 99));
        if (p >= 99) clearInterval(demoTimer);
      }, 60);

      setTimeout(() => {
        clearInterval(demoTimer);
        navigate('/result', {
          state: {
            audioUrl: '',
            fileName: 'english_speech_calibration.mp3',
            sessionId: 'demo',
            resultData: {
              overallScore: 84,
              pronunciation: 81,
              fluency: 88,
              clarity: 82,
              confidence: 87,
              transcript: 'Today I am introducing my pronunciation assessment project.',
              highlights: [
                { word: 'introducing', severity: 'warning' },
                { word: 'pronunciation', severity: 'error' }
              ],
              mistakes: [
                {
                  word: 'introducing',
                  issue: 'Incorrect stress placement',
                  whatWentWrong: 'The primary stress was placed on the first syllable instead of the third.',
                  expected: '/ˌɪntrəˈdjuːsɪŋ/',
                  severity: 'warning',
                  improvementPriority: 'Medium',
                  suggestion: 'Practice saying the word slowly and place the primary emphasis on the third syllable: in-tro-DUC-ing.'
                },
                {
                  word: 'pronunciation',
                  issue: 'Incorrect vowel articulation',
                  whatWentWrong: 'The second vowel was reduced or articulated as "noun" instead of "nun".',
                  expected: '/prəˌnʌnsiˈeɪʃən/',
                  severity: 'error',
                  improvementPriority: 'High',
                  suggestion: 'Ensure the second syllable is clearly pronounced as /nʌn/ to rhyme with "nun" or "run".'
                }
              ],
              practiceWords: [
                { word: 'introducing',   difficulty: 'Medium', ipa: '/ˌɪntrəˈdjuːsɪŋ/' },
                { word: 'pronunciation', difficulty: 'Hard',   ipa: '/prəˌnʌnsiˈeɪʃən/' },
                { word: 'assessment',    difficulty: 'Medium', ipa: '/əˈsɛsmənt/' }
              ],
              summary: 'Overall pronunciation shows strong alignment. Minor syllable stress and vowel articulation deviations were identified in multi-syllabic words like "introducing" and "pronunciation". Use the Practice Section to master these sound paths.'
            }
          }
        });
      }, 3000);
      return;
    }

    // --- Real file pipeline ---
    let cancelAnim = null;
    try {
      // Phase 1: Upload (0 → 25)
      cancelAnim = animateProgress(0, 24, 4000);
      const uploadResult = await uploadAudio(file, (evt) => {
        const pct = Math.round((evt.loaded / evt.total) * 24);
        setProgress(pct);
      });

      const fileId = uploadResult.fileId || uploadResult.data?.fileId;
      if (!fileId) throw new Error('Server did not return a fileId after upload.');

      if (cancelAnim) { cancelAnim(); cancelAnim = null; }
      setProgress(25);

      // Phase 2: STT (25 → 55)
      cancelAnim = animateProgress(25, 54, 8000);

      // Phase 3: LLM (55 → 80)
      const phaseTimer = setTimeout(() => {
        if (cancelAnim) { cancelAnim(); cancelAnim = null; }
        cancelAnim = animateProgress(55, 79, 10000);
      }, 8000);

      const resultData = await analyzeAudio(fileId);

      clearTimeout(phaseTimer);
      if (cancelAnim) { cancelAnim(); cancelAnim = null; }

      // Phase 4: Generating report (80 → 100)
      setProgress(80);
      await new Promise(resolve => {
        const fin = animateProgress(80, 100, 800);
        setTimeout(() => { fin(); resolve(); }, 800);
      });

      const audioUrl = file instanceof File ? URL.createObjectURL(file) : '';

      navigate('/result', {
        state: {
          audioUrl,
          fileName: file.name,
          sessionId: fileId,
          resultData
        }
      });

    } catch (err) {
      if (cancelAnim) cancelAnim();
      console.error('[Home]: Analysis pipeline error:', err);
      setPipelineError('Unable to analyze pronunciation. Please upload another English audio between 30–45 seconds.');
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-slate-100 bg-grid-pattern relative">
      {/* Noise and vignette layers */}
      <div className="noise-overlay"></div>
      <div className="vignette-mask"></div>

      <Navbar />

      {/* Floating Server Wakeup Banner */}
      <AnimatePresence>
        {showWakeupBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-sm pointer-events-auto"
          >
            <div className="glass-panel bg-zinc-950/85 border border-white/8 rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex items-start space-x-3 relative overflow-hidden">
              {/* Glowing progress line at the bottom */}
              <div 
                className="absolute bottom-0 left-0 h-[2.5px] bg-gradient-to-r from-amber-500/70 via-blue-500/70 to-emerald-500/70 transition-all duration-1000 ease-out" 
                style={{ width: `${wakingProgress}%` }} 
              />
              
              <div className="flex-shrink-0 mt-0.5">
                {serverStatus === 'online' ? (
                  <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-4.5 w-4.5 animate-pulse" />
                  </div>
                ) : (
                  <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <p className="text-[11px] font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  {serverStatus === 'online' ? (
                    <>
                      <span>Server Operational</span>
                      <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">
                        🟢 ONLINE
                      </span>
                    </>
                  ) : (
                    <>
                      <span>Server Cold Start</span>
                      <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                        💤 WAKING UP
                      </span>
                    </>
                  )}
                </p>
                <p className="text-[10px] text-slate-350 font-light mt-1 leading-normal">
                  {serverStatus === 'online'
                    ? "Connection verified! The AI models are loaded and ready."
                    : "Render puts the server to sleep after inactivity. Waking it up now; you can still select a file in the meantime!"}
                </p>
                {serverStatus !== 'online' && (
                  <div className="mt-2.5 flex items-center justify-between text-[8px] font-mono text-slate-500">
                    <span>Wake Progress: {wakingProgress}%</span>
                    <span>Est. {Math.max(0, 50 - Math.round((wakingProgress / 100) * 50))}s</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowWakeupBanner(false)}
                className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multiple Radial background glow blobs */}
      <div className="radial-glow glow-purple top-[10%] left-[5%] w-[650px] h-[650px]"></div>
      <div className="radial-glow glow-cyan top-[30%] right-[5%] w-[600px] h-[600px]"></div>
      <div className="radial-glow glow-pink bottom-[10%] left-[15%] w-[550px] h-[550px]"></div>

      <main className="flex-grow flex flex-col justify-center pb-24 z-10 relative">
        <Hero onStartClick={handleStartClick} />
        <div ref={uploadRef} id="uploader-section" className="scroll-mt-28">
          <UploadCard onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Overlay blur loader when isAnalyzing is active */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090b]/75 backdrop-blur-xl"
            >
              <motion.div
                initial={{ scale: 0.96, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                className="w-full max-w-xl"
              >
                <LoadingCard progress={progress} serverStatus={serverStatus} wakingProgress={wakingProgress} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium error overlay modal (instead of browser alert) */}
        <AnimatePresence>
          {pipelineError && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPipelineError(null)}
                className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                className="relative z-10 w-full max-w-md glass-panel border-red-500/20 bg-zinc-950/95 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden"
              >
                <div className="flex items-center space-x-2 text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3 pb-3 border-b border-white/5 font-mono">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>Pipeline Error</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">Calibration Mismatch</h3>
                <p className="text-xs text-slate-350 leading-relaxed font-light">
                  {pipelineError}
                </p>

                <button
                  onClick={() => setPipelineError(null)}
                  className="mt-6 w-full py-3 text-xs font-bold uppercase tracking-widest text-zinc-950 bg-white hover:bg-slate-100 rounded-full transition-all cursor-pointer shadow-md"
                >
                  Acknowledge & Dismiss
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
