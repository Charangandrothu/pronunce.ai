import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import UploadCard from '../components/UploadCard';
import LoadingCard from '../components/LoadingCard';
import Footer from '../components/Footer';
import { uploadAudio, analyzeAudio } from '../services/analysisService';

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
      alert('Unable to analyze pronunciation. Please upload another English audio between 30–45 seconds.');
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

      {/* Multiple Radial background glow blobs */}
      <div className="radial-glow glow-purple top-[10%] left-[5%] w-[650px] h-[650px]"></div>
      <div className="radial-glow glow-cyan top-[30%] right-[5%] w-[600px] h-[600px]"></div>
      <div className="radial-glow glow-pink bottom-[10%] left-[15%] w-[550px] h-[550px]"></div>

      <main className="flex-grow flex flex-col justify-center pb-24 z-10">
        {!isAnalyzing ? (
          <>
            <Hero onStartClick={handleStartClick} />
            <div ref={uploadRef} id="uploader-section" className="scroll-mt-28">
              <UploadCard onUploadSuccess={handleUploadSuccess} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingCard progress={progress} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
