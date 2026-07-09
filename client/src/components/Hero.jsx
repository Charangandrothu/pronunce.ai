import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Play, ShieldCheck, Activity, Brain, Volume2, CheckCircle2, Loader2, Info } from 'lucide-react';

export default function Hero({ onStartClick }) {
  // Waveform bars representation
  const waveBars = Array.from({ length: 24 });

  // --- States for the interactive AI Analysis Console Loop ---
  // Steps: 0: Waiting, 1: Uploading, 2: Speech Recognition, 3: Phoneme Alignment, 4: Pronunciation Analysis, 5: Feedback Generation, 6: Completed
  const [pipelineStep, setPipelineStep] = useState(0);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [typedWords, setTypedWords] = useState([]);
  const [hoveredWord, setHoveredWord] = useState(null);
  const [scores, setScores] = useState({ quality: 0, pronunciation: 0, fluency: 0, confidence: 0 });

  const transcriptText = "Today I am introducing my pronunciation assessment application.";
  const wordsList = transcriptText.split(" ");

  // Loop simulation
  useEffect(() => {
    let interval = null;
    let uploadTimer = null;
    let wordTimer = null;
    let scoreTimer = null;

    const runLoop = async () => {
      // Step 0: Waiting (2s)
      setPipelineStep(0);
      setUploadPercent(0);
      setTypedWords([]);
      setScores({ quality: 0, pronunciation: 0, fluency: 0, confidence: 0 });
      await delay(2000);

      // Step 1: Uploading (2s)
      setPipelineStep(1);
      let pct = 0;
      uploadTimer = setInterval(() => {
        pct += 8;
        if (pct >= 100) {
          setUploadPercent(100);
          clearInterval(uploadTimer);
        } else {
          setUploadPercent(pct);
        }
      }, 150);
      await delay(2000);

      // Step 2: Speech Recognition (3s)
      setPipelineStep(2);
      let currentWordIndex = 0;
      wordTimer = setInterval(() => {
        if (currentWordIndex < wordsList.length) {
          setTypedWords(prev => [...prev, wordsList[currentWordIndex]]);
          currentWordIndex++;
        } else {
          clearInterval(wordTimer);
        }
      }, 200);
      await delay(3000);

      // Step 3: Phoneme Alignment (1.5s)
      setPipelineStep(3);
      await delay(1500);

      // Step 4: Pronunciation Analysis & Step 5: Feedback Generation (3s)
      setPipelineStep(4);
      let targetScores = { quality: 92, pronunciation: 84, fluency: 88, confidence: 90 };
      let currentScores = { quality: 0, pronunciation: 0, fluency: 0, confidence: 0 };
      scoreTimer = setInterval(() => {
        let done = true;
        Object.keys(targetScores).forEach(key => {
          if (currentScores[key] < targetScores[key]) {
            currentScores[key] += 4;
            if (currentScores[key] > targetScores[key]) currentScores[key] = targetScores[key];
            done = false;
          }
        });
        setScores({ ...currentScores });
        if (done) clearInterval(scoreTimer);
      }, 50);
      await delay(1500);

      // Step 5: Feedback Generation
      setPipelineStep(5);
      await delay(1500);

      // Step 6: Completed (6s pause)
      setPipelineStep(6);
      await delay(6000);

      // Restart Loop
      runLoop();
    };

    runLoop();

    return () => {
      clearTimeout(interval);
      clearInterval(uploadTimer);
      clearInterval(wordTimer);
      clearInterval(scoreTimer);
    };
  }, []);

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // CEFR Badge color helper
  const getSeverityStyle = (word) => {
    if (!word) return '';
    const w = word.toLowerCase().replace(/[^a-z]/g, '');
    if (w === 'pronunciation') return 'text-red-400 border-red-500/20 bg-red-500/5 decoration-red-400/80';
    if (w === 'introducing') return 'text-amber-400 border-amber-500/20 bg-amber-500/5 decoration-amber-400/80';
    return '';
  };

  const getWordMetadata = (word) => {
    if (!word) return null;
    const w = word.toLowerCase().replace(/[^a-z]/g, '');
    if (w === 'pronunciation') {
      return {
        issue: 'Incorrect Stress Placement',
        suggestion: 'Stress "pro-nun-ci-A-tion" (5th syllable)',
        confidence: '68%',
        time: '2.4s'
      };
    }
    if (w === 'introducing') {
      return {
        issue: 'Vowel Sound Mismatch',
        suggestion: 'Say "in-tro-DUC-ing" instead of "in-tro-dosing"',
        confidence: '78%',
        time: '1.2s'
      };
    }
    return null;
  };

  // spring configurations
  const titleVariants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 100,
        delay: i * 0.12
      }
    })
  };

  return (
    <div className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24 max-w-5xl w-full mx-auto px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* Left: Typography & Headings */}
        <div className="lg:col-span-5 flex flex-col items-start text-left">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-6 backdrop-blur-md"
          >
            <Sparkles className="h-3 w-3 text-slate-405" />
            <span>AI Speech Co-Pilot v1.0</span>
          </motion.div>

          <div className="space-y-2">
            <motion.h1
              custom={0}
              initial="hidden"
              animate="visible"
              variants={titleVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-white"
            >
              <span className="text-premium-gradient text-shimmer">AI Pronunciation</span>
            </motion.h1>
            <motion.h1
              custom={1}
              initial="hidden"
              animate="visible"
              variants={titleVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-slate-450"
            >
              Assessment
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-6 text-xs sm:text-sm text-slate-400 font-light leading-relaxed max-w-sm"
          >
            Submit your voice recordings to perform phoneme inspection, evaluate syllable stress, and calibrate articulation alignments dynamically in under 5 seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="mt-10 flex flex-col sm:flex-row space-y-3.5 sm:space-y-0 sm:space-x-4.5 w-full sm:w-auto"
          >
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={onStartClick}
              className="group flex items-center justify-center space-x-2.5 px-7 py-3.5 text-xs font-bold rounded-full bg-white hover:bg-slate-100 text-zinc-950 shadow-lg cursor-pointer transition-all duration-300"
            >
              <span>Start Assessment</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => alert("Watch Demo: Our system records speech, aligns phoneme streams against native stress patterns, and compiles a comprehensive analytics matrix in under 5 seconds.")}
              className="flex items-center justify-center space-x-2 px-7 py-3.5 text-xs font-bold rounded-full border border-white/8 bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 hover:text-white transition-all cursor-pointer backdrop-blur-md"
            >
              <Play className="h-3 w-3 fill-current text-slate-400" />
              <span>Watch Demo</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Right: Redesigned Realistic AI Analysis Console */}
        <div className="lg:col-span-7 flex justify-center relative select-none w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="glass-panel glow-card bg-[#121215]/50 border border-white/5 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative overflow-hidden"
          >
            {/* Header / State Console */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className={`h-2 w-2 rounded-full ${pipelineStep === 6 ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`} />
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">
                  {pipelineStep === 0 && "Waiting Sample"}
                  {pipelineStep === 1 && "Uploading Sample"}
                  {pipelineStep === 2 && "Speech Recognition"}
                  {pipelineStep === 3 && "Phoneme Alignment"}
                  {pipelineStep === 4 && "Pronunciation Analysis"}
                  {pipelineStep === 5 && "Feedback Generation"}
                  {pipelineStep === 6 && "Analysis Completed"}
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[8px] font-mono uppercase text-slate-500">Queue:</span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-350 border border-white/5 font-mono">
                  {pipelineStep === 0 && "Idle"}
                  {pipelineStep === 1 && `Uploading ${uploadPercent}%`}
                  {pipelineStep === 2 && "Transcribing"}
                  {pipelineStep === 3 && "Mapping"}
                  {pipelineStep === 4 && "Scoring"}
                  {pipelineStep === 5 && "Formatting"}
                  {pipelineStep === 6 && "Ready"}
                </span>
              </div>
            </div>

            {/* Left AI Pipeline Vertical Steps & Right Panel Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Left Column: AI Pipeline Step Indicator */}
              <div className="md:col-span-5 flex flex-col space-y-2 border-r border-white/5 pr-4">
                <span className="text-[8px] text-slate-550 uppercase tracking-widest font-mono block mb-1">Pipeline Steps</span>
                {[
                  { label: "Audio Upload", step: 1 },
                  { label: "Speech Recognition", step: 2 },
                  { label: "Phoneme Alignment", step: 3 },
                  { label: "Pronunciation Analysis", step: 4 },
                  { label: "Feedback Generation", step: 5 }
                ].map((item, idx) => {
                  const isActive = pipelineStep === item.step;
                  const isCompleted = pipelineStep > item.step;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center space-x-2 p-1.5 rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'bg-blue-500/5 border border-blue-500/10 text-white font-semibold'
                          : isCompleted
                            ? 'text-slate-500 border border-transparent'
                            : 'text-slate-700 border border-transparent'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : isActive ? (
                        <Loader2 className="h-3.5 w-3.5 text-blue-400 animate-spin shrink-0" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border border-zinc-800 shrink-0 flex items-center justify-center text-[7px] text-zinc-800 font-mono">{item.step}</div>
                      )}
                      <span className="text-[10px] tracking-tight truncate">{item.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Live Output Display */}
              <div className="md:col-span-7 space-y-4">
                
                {/* Waveform / Visual status */}
                <div className="bg-zinc-950/40 rounded-xl p-3.5 border border-white/5 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[8px] text-slate-550 uppercase tracking-wider font-mono">Audio Calibration Frame</span>
                    {pipelineStep === 1 && (
                      <span className="text-[8px] font-mono text-blue-400 animate-pulse">
                        [{'█'.repeat(Math.floor(uploadPercent/10)) + '░'.repeat(10-Math.floor(uploadPercent/10))}] {uploadPercent}%
                      </span>
                    )}
                    {pipelineStep === 2 && (
                      <span className="text-[8px] font-mono text-slate-400 animate-pulse">
                        Transcribing...
                      </span>
                    )}
                  </div>
                  
                  <div className="h-10 flex items-center justify-between px-1">
                    {waveBars.map((_, i) => {
                      const baseHt = 15 + Math.sin(i * 0.5) * 10 + Math.cos(i * 0.8) * 15;
                      let animHt = baseHt;
                      if (pipelineStep === 0) animHt = 4; // Flatline
                      return (
                        <motion.div
                          key={i}
                          animate={pipelineStep > 0 ? {
                            height: [`${animHt}%`, `${Math.max(10, animHt + (Math.random() - 0.5) * 40)}%`, `${animHt}%`]
                          } : { height: '8%' }}
                          transition={{ duration: 1.2 + Math.random(), repeat: Infinity, ease: 'easeInOut' }}
                          className={`w-[2.5px] rounded-full transition-colors duration-300 ${
                            pipelineStep >= 4 ? 'bg-emerald-500/60' : pipelineStep > 0 ? 'bg-blue-500/60' : 'bg-zinc-800'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Live Transcript / Word alignments */}
                <div className="bg-zinc-950/40 rounded-xl p-3.5 border border-white/5 relative min-h-[90px]">
                  <span className="text-[8px] text-slate-550 uppercase tracking-wider font-mono block mb-2">Live Transcript Analysis</span>
                  {pipelineStep <= 1 ? (
                    <p className="text-[10px] text-slate-650 italic font-mono">[Waiting for calibration data stream...]</p>
                  ) : (
                    <div className="text-xs leading-relaxed text-slate-300 font-mono flex flex-wrap gap-x-1.5 gap-y-1 relative">
                      {typedWords.map((word, idx) => {
                        const styleClass = pipelineStep >= 3 ? getSeverityStyle(word) : '';
                        const meta = getWordMetadata(word);
                        return (
                          <span
                            key={idx}
                            onMouseEnter={() => meta && setHoveredWord({ word, ...meta })}
                            onMouseLeave={() => setHoveredWord(null)}
                            className={`inline-block px-1 rounded transition-all duration-250 ${
                              styleClass ? `underline decoration-2 underline-offset-4 cursor-help ${styleClass}` : ''
                            }`}
                          >
                            {word}
                          </span>
                        );
                      })}
                      
                      {/* Live Word Tooltip Popup */}
                      <AnimatePresence>
                        {hoveredWord && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute -top-14 left-0 right-0 mx-auto w-full z-30 p-2 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl flex items-start space-x-2 text-[9px] text-slate-300 font-sans"
                          >
                            <Info className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <p className="font-bold text-white uppercase tracking-wider text-[8px]">{hoveredWord.word}: <span className="text-red-405 font-medium lowercase">{hoveredWord.issue}</span></p>
                              <p className="text-slate-400 font-light">{hoveredWord.suggestion}</p>
                              <p className="text-slate-550 font-mono text-[7px]">{hoveredWord.confidence} Match &bull; timestamp {hoveredWord.time}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Bottom Row: AI Scores & Metrics Grid */}
            <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/5">
              {[
                { label: 'Quality', val: scores.quality, display: `${scores.quality}%` },
                { label: 'Pronunciation', val: scores.pronunciation, display: `${scores.pronunciation}%` },
                { label: 'Fluency', val: scores.fluency, display: `${scores.fluency}%` },
                { label: 'Confidence', val: scores.confidence, display: `${scores.confidence}%` }
              ].map((item, idx) => (
                <div key={idx} className="bg-zinc-950/20 rounded-xl p-2.5 border border-white/5 text-center">
                  <span className="text-[7.5px] text-slate-550 uppercase tracking-wider font-mono block">{item.label}</span>
                  <span className="text-xs font-extrabold text-white mt-1 block font-mono">
                    {pipelineStep >= 4 ? item.display : '--'}
                  </span>
                  {pipelineStep >= 4 && (
                    <div className="w-full bg-white/5 rounded-full h-1 mt-2 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${item.val}%`, transition: 'width 0.8s ease-out' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

          </motion.div>
        </div>

      </div>
    </div>
  );
}
