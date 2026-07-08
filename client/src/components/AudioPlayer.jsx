import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const AudioPlayer = forwardRef(function AudioPlayer({ src, mistakes = [] }, ref) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1.0);

  // Expose seekTo(seconds) for external components (e.g. MistakeCard)
  useImperativeHandle(ref, () => ({
    seekTo: (seconds) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = Math.max(0, Math.min(seconds, audio.duration || 0));
      setCurrentTime(audio.currentTime);
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  }));

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

    // Apply speed preference
    audio.playbackRate = speed;

    setIsPlaying(false);
    setCurrentTime(0);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioSource, speed]);

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

  const toggleSpeed = () => {
    const speeds = [0.8, 1.0, 1.2, 1.5];
    const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
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
    <div className="glass-panel bg-[#121215]/30 border-white/5 rounded-2xl p-4 sm:p-5 shadow-lg w-full">
      <style>{`
        @keyframes wave-bounce-pulse {
          0% { transform: scaleY(0.7); }
          100% { transform: scaleY(1.15); }
        }
        .animate-wave-pulse {
          animation: wave-bounce-pulse 0.75s infinite ease-in-out alternate;
        }
      `}</style>
      
      <audio ref={audioRef} src={audioSource} />

      {/* Waveform panel */}
      <div className="h-16 flex items-center justify-between px-3 sm:px-6 bg-zinc-950/40 rounded-xl mb-4 border border-white/5 overflow-hidden group hover:bg-zinc-950/60 transition-all duration-350">
        {bars.map((_, i) => {
          const isBarCompleted = (i / bars.length) <= progressFraction;
          const baseHeight = 18 + Math.sin(i * 0.25) * 15 + Math.cos(i * 0.5) * 18;
          return (
            <div
              key={i}
              className={`w-[3px] sm:w-[4px] rounded-full origin-center transition-all duration-300 ${
                isBarCompleted 
                  ? 'bg-slate-300 shadow-[0_0_4px_rgba(255,255,255,0.2)]' 
                  : 'bg-zinc-800'
              } ${isPlaying && isBarCompleted ? 'animate-wave-pulse' : ''}`}
              style={{
                height: `${baseHeight}%`,
                animationDelay: `${i * 15}ms`,
                animationPlayState: isPlaying ? 'running' : 'paused'
              }}
            />
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Play control, Speed & Time */}
        <div className="flex items-center space-x-3.5 w-full sm:w-auto justify-between sm:justify-start">
          <button
            type="button"
            onClick={togglePlay}
            className="h-10 w-10 rounded-full flex items-center justify-center bg-white text-zinc-950 hover:bg-slate-100 hover:scale-103 active:scale-97 transition-all cursor-pointer shrink-0"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
          </button>
          
          <div className="text-[10px] font-bold text-slate-400 tracking-wider font-mono">
            <span>{formatTime(currentTime)}</span>
            <span className="mx-1.5 text-zinc-700">/</span>
            <span>{formatTime(duration || 38)}</span>
          </div>

          <button
            type="button"
            onClick={toggleSpeed}
            className="text-[9px] font-bold uppercase tracking-wider text-slate-450 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md border border-white/5 cursor-pointer"
          >
            {speed.toFixed(1)}x
          </button>
        </div>

        {/* Custom seek track with Issue Markers */}
        <div className="flex-grow w-full relative pt-2 pb-2">
          <div className="relative w-full h-1.5">
            {/* Markers Container */}
            <div className="absolute inset-0 pointer-events-none">
              {duration > 0 && mistakes.map((m, idx) => {
                if (m.start == null) return null;
                const pct = (m.start / duration) * 100;
                return (
                  <div
                    key={idx}
                    className="absolute h-2 w-2 rounded-full bg-red-650 border border-zinc-950 pointer-events-auto cursor-pointer group"
                    style={{ left: `${pct}%`, top: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      audioRef.current.currentTime = m.start;
                      setCurrentTime(m.start);
                      audioRef.current.play().catch(() => {});
                      setIsPlaying(true);
                    }}
                  >
                    {/* Tiny tooltip on marker hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-950 border border-white/8 text-[9px] font-semibold text-white rounded whitespace-nowrap shadow-xl">
                      {m.word}: {m.issue}
                    </div>
                  </div>
                );
              })}
            </div>

            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer focus:outline-none accent-slate-300"
              style={{
                background: `linear-gradient(to right, #cbd5e1 0%, #cbd5e1 ${((currentTime / (duration || 100)) * 100).toFixed(2)}%, rgba(255,255,255,0.06) ${((currentTime / (duration || 100)) * 100).toFixed(2)}%, rgba(255,255,255,0.06) 100%)`
              }}
            />
          </div>
        </div>

        {/* Custom volume controls */}
        <div className="flex items-center space-x-3.5 w-full sm:w-auto justify-end">
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
            className="w-16 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-slate-350"
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
