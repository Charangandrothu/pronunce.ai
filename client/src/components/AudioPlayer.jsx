import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const AudioPlayer = forwardRef(function AudioPlayer({ src }, ref) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Expose seekTo(seconds) for external components (e.g. MistakeCard)
  useImperativeHandle(ref, () => ({
    seekTo: (seconds) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = Math.max(0, Math.min(seconds, audio.duration || 0));
      setCurrentTime(audio.currentTime);
      // Auto-play from that point
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  }));

  // Fallback demo audio if no audio is uploaded
  const audioSource = src || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    // Reset when source changes
    setIsPlaying(false);
    setCurrentTime(0);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioSource]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((e) => console.log("Play interrupted", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    audioRef.current.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    audioRef.current.muted = nextMute;
    setIsMuted(nextMute);
  };

  const formatTime = (time) => {
    if (isNaN(time) || time === Infinity) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Waveform size (32 bars)
  const bars = Array.from({ length: 32 });
  const progressFraction = duration ? currentTime / duration : 0;

  return (
    <div className="glass-panel border-white/5 rounded-2xl p-4 sm:p-5 shadow-lg w-full">
      <style>{`
        @keyframes wave-bounce-pulse {
          0% { transform: scaleY(0.5); }
          100% { transform: scaleY(1.25); }
        }
        .animate-wave-pulse {
          animation: wave-bounce-pulse 0.75s infinite ease-in-out alternate;
        }
      `}</style>
      
      <audio ref={audioRef} src={audioSource} />

      {/* Real-time Progress-bound Waveform */}
      <div className="h-16 flex items-center justify-between px-3 sm:px-6 bg-slate-950/50 rounded-xl mb-4 border border-white/5 overflow-hidden">
        {bars.map((_, i) => {
          const isBarCompleted = (i / bars.length) <= progressFraction;
          // Create custom vocal amplitude shape
          const baseHeight = 18 + Math.sin(i * 0.25) * 15 + Math.cos(i * 0.5) * 18;
          return (
            <div
              key={i}
              className={`w-[3px] sm:w-[4px] rounded-full origin-center transition-all duration-300 ${
                isBarCompleted 
                  ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]' 
                  : 'bg-slate-800'
              } ${isPlaying && isBarCompleted ? 'animate-wave-pulse' : ''}`}
              style={{
                height: `${baseHeight}%`,
                animationDelay: `${i * 20}ms`,
                animationPlayState: isPlaying ? 'running' : 'paused'
              }}
            />
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Play control & Time */}
        <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-start">
          <button
            type="button"
            onClick={togglePlay}
            className="h-11 w-11 rounded-full flex items-center justify-center bg-white hover:bg-cyan-400 text-slate-950 hover:scale-105 active:scale-95 transition-all shadow-md shadow-white/5 cursor-pointer shrink-0"
          >
            {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
          </button>
          
          <div className="text-[10px] font-bold text-slate-400 tracking-wider font-mono">
            <span>{formatTime(currentTime)}</span>
            <span className="mx-1.5 text-slate-700">/</span>
            <span>{formatTime(duration || 38)}</span>
          </div>
        </div>

        {/* Custom seek track */}
        <div className="flex-grow w-full">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer focus:outline-none accent-cyan-400"
            style={{
              background: `linear-gradient(to right, #22d3ee 0%, #22d3ee ${((currentTime / (duration || 100)) * 100).toFixed(2)}%, rgba(255,255,255,0.06) ${((currentTime / (duration || 100)) * 100).toFixed(2)}%, rgba(255,255,255,0.06) 100%)`
            }}
          />
        </div>

        {/* Custom volume controls */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <button 
            type="button"
            onClick={toggleMute}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-slate-300"
            style={{
              background: `linear-gradient(to right, #cbd5e1 0%, #cbd5e1 ${((isMuted ? 0 : volume) * 100).toFixed(2)}%, rgba(255,255,255,0.06) ${((isMuted ? 0 : volume) * 100).toFixed(2)}%, rgba(255,255,255,0.06) 100%)`
            }}
          />
        </div>
      </div>
    </div>
  );
});

export default AudioPlayer;
