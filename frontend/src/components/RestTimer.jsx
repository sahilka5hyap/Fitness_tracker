import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Timer } from 'lucide-react';

// Simple rest timer that pops up between sets
// Usage: <RestTimer isOpen={showTimer} onClose={() => setShowTimer(false)} />

const RestTimer = ({ isOpen, onClose }) => {

  // How many seconds to rest - user can pick
  const PRESETS = [30, 60, 90, 120, 180];

  const [totalSeconds,   setTotalSeconds]   = useState(60);  // default 60s
  const [secondsLeft,    setSecondsLeft]     = useState(60);
  const [isRunning,      setIsRunning]       = useState(false);
  const [isFinished,     setIsFinished]      = useState(false);

  const intervalRef = useRef(null);

  // Start / stop the timer
  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
      setIsFinished(true);
    }

    // Cleanup when component updates
    return () => clearInterval(intervalRef.current);
  }, [isRunning, secondsLeft]);

  // Reset everything when timer preset changes
  const handlePresetClick = (seconds) => {
    clearInterval(intervalRef.current);
    setTotalSeconds(seconds);
    setSecondsLeft(seconds);
    setIsRunning(false);
    setIsFinished(false);
  };

  // Reset to beginning
  const handleReset = () => {
    clearInterval(intervalRef.current);
    setSecondsLeft(totalSeconds);
    setIsRunning(false);
    setIsFinished(false);
  };

  // Format seconds into MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Progress circle math
  const radius     = 70;
  const circumference = 2 * Math.PI * radius;
  const progress   = secondsLeft / totalSeconds;
  const strokeDash = circumference * progress;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-sm shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Timer size={20} className="text-[#D4FF33]" />
            <h2 className="text-white font-bold text-lg">Rest Timer</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={22} />
          </button>
        </div>

        {/* Preset buttons */}
        <div className="flex gap-2 mb-6 justify-center">
          {PRESETS.map(s => (
            <button
              key={s}
              onClick={() => handlePresetClick(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                totalSeconds === s
                  ? 'bg-[#D4FF33] text-black border-[#D4FF33]'
                  : 'text-gray-400 border-[#2a2a2a] hover:border-[#D4FF33]'
              }`}
            >
              {s < 60 ? `${s}s` : `${s / 60}m`}
            </button>
          ))}
        </div>

        {/* Circle progress */}
        <div className="flex justify-center mb-6">
          <div className="relative" style={{ width: 180, height: 180 }}>
            <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background circle */}
              <circle
                cx="90" cy="90" r={radius}
                fill="none"
                stroke="#2a2a2a"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="90" cy="90" r={radius}
                fill="none"
                stroke={isFinished ? '#4ade80' : '#D4FF33'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${strokeDash} ${circumference}`}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>

            {/* Time text in middle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {isFinished ? (
                <span className="text-green-400 font-bold text-xl">Done! 💪</span>
              ) : (
                <>
                  <span className="text-white font-bold text-4xl font-mono">
                    {formatTime(secondsLeft)}
                  </span>
                  <span className="text-gray-500 text-xs mt-1">remaining</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#2a2a2a] text-gray-400 hover:text-white hover:border-gray-500 transition font-bold"
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button
            onClick={() => { setIsRunning(!isRunning); setIsFinished(false); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D4FF33] text-black font-bold hover:opacity-90 transition"
          >
            {isRunning ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Start</>}
          </button>
        </div>

        {/* Tip */}
        <p className="text-center text-xs text-gray-600 mt-4">
          Tap a preset to change rest duration
        </p>

      </div>
    </div>
  );
};

export default RestTimer;
