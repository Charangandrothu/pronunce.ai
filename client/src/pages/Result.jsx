import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ScoreCard from '../components/ScoreCard';
import MetricsCard from '../components/MetricsCard';
import AudioPlayer from '../components/AudioPlayer';
import MistakeCard from '../components/MistakeCard';
import Suggestions from '../components/Suggestions';
import Footer from '../components/Footer';
import { getAnalysis as getResults } from '../services/analysisService';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';

export default function Result() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data,    setData]    = useState(null);

  // Ref forwarded into AudioPlayer so MistakeCard can seek
  const audioPlayerRef = useRef(null);

  // Extract from navigation state
  const {
    audioUrl   = '',
    fileName   = '',
    sessionId  = '',
    resultData = null
  } = location.state || {};

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (resultData) {
        setData(resultData);
        setLoading(false);
        return;
      }
      if (!sessionId) { setLoading(false); return; }

      try {
        setLoading(true);
        const res = await getResults(sessionId);
        if (active) {
          setData(res.data?.data || res.data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load results:', err);
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, [sessionId, resultData]);

  const handleRetake = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    navigate('/', { state: { scrollToUpload: true } });
  };

  // Seek callback forwarded into MistakeCard
  const handleSeek = useCallback((seconds) => {
    audioPlayerRef.current?.seekTo(seconds);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-slate-100 bg-grid-pattern relative">
      <div className="noise-overlay" />
      <div className="vignette-mask" />

      <Navbar />

      <div className="radial-glow glow-purple top-[10%] right-[5%] w-[600px] h-[600px]" />
      <div className="radial-glow glow-cyan   top-[40%] left-[5%]  w-[550px] h-[550px]" />
      <div className="radial-glow glow-pink   bottom-[10%] right-[15%] w-[500px] h-[500px]" />

      <main className="flex-grow max-w-5xl w-full mx-auto px-6 lg:px-8 py-24 md:py-28 z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <Loader2 className="h-10 w-10 text-slate-400 animate-spin" />
            <h2 className="text-lg font-bold mt-6 text-slate-200 uppercase tracking-wider">
              Retrieving Diagnostics
            </h2>
            <p className="text-xs text-slate-500 mt-2 font-mono">[loading phoneme alignment vectors...]</p>
          </div>
        ) : data ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-8"
          >
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
              <div>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors cursor-pointer group"
                >
                  <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Exit to Console</span>
                </button>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-3">
                  Pronunciation Assessment Report
                </h1>
                <p className="text-xs text-slate-500 mt-1.5 font-light">
                  Source Clip: <span className="font-mono text-slate-400 break-all">{fileName || 'speech_sample.mp3'}</span>
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-white hover:bg-slate-100 rounded-full shadow-lg transition-all cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                <span>Re-assess</span>
              </motion.button>
            </div>

            {/* ── Top grid: Score + Metrics + Player ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              <div className="lg:col-span-1">
                <ScoreCard score={data.overallScore || 0} />
              </div>

              <div className="lg:col-span-2 flex flex-col justify-between gap-6">
                <MetricsCard
                  pronunciation={data.pronunciation}
                  fluency={data.fluency}
                  clarity={data.clarity}
                  confidence={data.confidence}
                />

                {/* Audio player with forwarded ref for seeking */}
                <div className="glass-panel bg-[#121215]/50 border border-white/5 rounded-2xl p-4">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest block mb-3 font-bold">
                    Uploaded Recording
                  </span>
                  <AudioPlayer ref={audioPlayerRef} src={audioUrl} mistakes={data.mistakes || []} />
                </div>
              </div>
            </div>

            {/* ── Bottom grid: Transcript + Sandbox ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
              <div className="space-y-6">
                <MistakeCard
                  transcript={data.transcript}
                  transcription={data.transcription}
                  highlights={data.highlights || []}
                  mistakes={data.mistakes || []}
                  onSeek={audioUrl ? handleSeek : undefined}
                />
              </div>

              <div>
                <Suggestions
                  practiceWords={data.practiceWords || []}
                  summary={data.summary || ''}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <p className="text-sm text-slate-400 font-light">Speech Assessment report is empty.</p>
            <button
              type="button"
              onClick={handleRetake}
              className="mt-6 px-6 py-3 rounded-full bg-white hover:bg-slate-100 text-zinc-950 text-xs font-bold uppercase tracking-widest transition-all"
            >
              Assess Voice Sample
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
