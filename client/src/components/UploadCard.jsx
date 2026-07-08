import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, AlertCircle, CheckCircle2, Trash2, FileAudio, AudioLines } from 'lucide-react';

export default function UploadCard({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [duration, setDuration] = useState(null);
  const [error, setError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateAudioFile = (selectedFile) => {
    setIsValidating(true);
    setError(null);

    // Check extension
    const extension = selectedFile.name.split('.').pop().toLowerCase();
    if (!['mp3', 'wav', 'm4a'].includes(extension)) {
      setError("Unsupported file format. Please upload an MP3, WAV, or M4A file.");
      setIsValidating(false);
      return;
    }

    // Check duration by creating an audio element and reading metadata
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(selectedFile);
    audio.src = objectUrl;
    
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(objectUrl);
      const fileDuration = audio.duration;
      setDuration(fileDuration);
      
      if (fileDuration < 30 || fileDuration > 45) {
        setError(`Invalid audio length: ${Math.round(fileDuration)} seconds. The recording must be between 30 and 45 seconds.`);
        setFile(null);
      } else {
        setFile(selectedFile);
      }
      setIsValidating(false);
    });

    audio.addEventListener('error', () => {
      URL.revokeObjectURL(objectUrl);
      setError("Unable to read audio file metadata. The file may be corrupt.");
      setIsValidating(false);
    });
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      validateAudioFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/mp3': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/x-wav': ['.wav'],
      'audio/m4a': ['.m4a'],
      'audio/x-m4a': ['.m4a']
    },
    multiple: false
  });

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setDuration(null);
    setError(null);
  };

  const handleUpload = () => {
    if (file) {
      onUploadSuccess(file);
    }
  };

  const fileExtension = file ? file.name.split('.').pop().toUpperCase() : '';

  return (
    <div className="w-full max-w-2xl mx-auto px-4 select-none">
      <div className="gradient-border-wrapper shadow-2xl">
        <div className="gradient-border-content p-6 sm:p-8 relative overflow-hidden">
          {/* Subtle glow layers */}
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Speech Input Console
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-light">
              Submit your 30–45 second oral sample for phoneme inspection.
            </p>
          </div>

          {/* Validation Metrics checklist */}
          <div className="grid grid-cols-3 gap-3 mb-6 text-center">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
              <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-bold">Language</span>
              <span className="block text-xs text-slate-300 mt-1 font-semibold">English</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
              <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-bold">Duration</span>
              <span className="block text-xs text-slate-300 mt-1 font-semibold">30s - 45s</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
              <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-bold">Form</span>
              <span className="block text-xs text-slate-300 mt-1 font-semibold">Single File</span>
            </div>
          </div>

          {/* Drag Zone with conditional glow */}
          <div
            {...getRootProps()}
            className={`relative group cursor-pointer border border-dashed rounded-2xl p-8 sm:p-12 transition-all duration-300 ${
              isDragActive 
                ? 'border-cyan-400 bg-cyan-500/5 shadow-[0_0_30px_rgba(34,211,238,0.1)]' 
                : file 
                  ? 'border-violet-500/20 bg-violet-500/5' 
                  : 'border-white/10 hover:border-violet-500/25 bg-white/[0.01] hover:bg-white/[0.02]'
            }`}
          >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center justify-center space-y-4">
              <motion.div
                animate={isDragActive ? { scale: 1.08, y: -4 } : { scale: 1, y: 0 }}
                className={`p-4 rounded-full transition-colors duration-300 ${
                  isDragActive 
                    ? 'bg-cyan-500/10 text-cyan-400' 
                    : file 
                      ? 'bg-violet-500/10 text-violet-400' 
                      : 'bg-white/5 text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {file ? (
                  <CheckCircle2 className="h-9 w-9 text-emerald-400 animate-pulse" />
                ) : (
                  <UploadCloud className="h-9 w-9" />
                )}
              </motion.div>

              {file ? (
                <div className="text-center w-full">
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
                    {fileExtension} File
                  </span>
                  <p className="text-sm font-semibold text-slate-200 break-all max-w-md mx-auto">
                    {file.name}
                  </p>
                  
                  {/* Waveform preview representation */}
                  <div className="h-8 flex items-center justify-center space-x-1 mt-4 max-w-xs mx-auto overflow-hidden opacity-80">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: ['25%', '90%', '25%'] }}
                        transition={{ duration: 1 + Math.random(), repeat: Infinity, ease: 'easeInOut', delay: i * 0.05 }}
                        className="w-[3px] rounded-full bg-violet-400"
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-center space-x-2 mt-4">
                    <span className="text-xs text-slate-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    <span className="text-slate-700">&bull;</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {Math.round(duration)}s Duration (Calibrated)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={clearFile}
                    className="mt-5 inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-full transition-colors cursor-pointer border border-rose-500/10"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Clear and Reset</span>
                  </button>
                </div>
              ) : isValidating ? (
                <div className="text-center">
                  <div className="w-6 h-6 border-2 border-t-transparent border-cyan-400 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs font-semibold text-slate-300">Evaluating audio boundaries...</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors duration-300">
                    Drag speech sample here, or <span className="text-cyan-400 group-hover:text-cyan-300 underline decoration-dotted underline-offset-4">browse files</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-2 font-light">
                    Accepts MP3, WAV, or M4A formats
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Validation Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start space-x-2.5 text-xs shadow-lg"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-semibold">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Magnetic-styled Action Button */}
          <button
            onClick={handleUpload}
            disabled={!file}
            className={`w-full mt-6 py-4 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center transition-all duration-300 cursor-pointer ${
              file
                ? 'bg-white hover:bg-cyan-400 text-slate-950 shadow-xl shadow-cyan-500/5 hover:shadow-cyan-400/20 transform hover:-translate-y-0.5 active:translate-y-0'
                : 'bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed shadow-none'
            }`}
          >
            Start AI Calibration
          </button>

          {/* Quick Demo Option */}
          <div className="text-center mt-4.5">
            <button
              type="button"
              onClick={() => onUploadSuccess({ name: "english_speech_calibration.mp3", size: 1350000, duration: 38, isDemo: true })}
              className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-violet-400 transition-colors underline underline-offset-4 cursor-pointer"
            >
              Don't have a recording? Try Demo Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
