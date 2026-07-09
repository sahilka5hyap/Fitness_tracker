import React, { useContext } from 'react';
import { X, Zap, Clock, Flame, Dumbbell } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

const ExerciseVideoModal = ({ exercise, onClose }) => {
  const { t } = useContext(ThemeContext);

  if (!exercise) return null;

  const difficultyConfig = {
    Beginner:     { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  label: 'Beginner' },
    Intermediate: { color: '#facc15', bg: 'rgba(250,204,21,0.1)',  label: 'Intermediate' },
    Advanced:     { color: '#f87171', bg: 'rgba(248,113,113,0.1)', label: 'Advanced' },
  };
  const diff = difficultyConfig[exercise.difficulty] || difficultyConfig.Beginner;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
      onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border"
        style={{ backgroundColor: t.card, borderColor: t.borderHex }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── YouTube Embed ── */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${exercise.videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={exercise.name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* ── Info Section ── */}
        <div className="p-6">

          {/* Header row */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: t.textHex }}>
                {exercise.name}
              </h2>
              <p className="text-sm" style={{ color: t.subtextHex }}>{exercise.muscle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full transition-opacity hover:opacity-70"
              style={{ color: t.subtextHex, backgroundColor: t.bg }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ color: diff.color, backgroundColor: diff.bg }}>
              {diff.label}
            </span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ color: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.1)' }}>
              {exercise.equipment}
            </span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ color: '#D4FF33', backgroundColor: 'rgba(212,255,51,0.1)' }}>
              {exercise.sets}
            </span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ color: '#fb923c', backgroundColor: 'rgba(251,146,60,0.1)' }}>
              {exercise.calories}
            </span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { icon: Dumbbell, label: 'Equipment', val: exercise.equipment, color: '#60a5fa' },
              { icon: Clock,    label: 'Rest',      val: exercise.rest,      color: '#a78bfa' },
              { icon: Flame,    label: 'Calories',  val: exercise.calories,  color: '#fb923c' },
            ].map(({ icon: Icon, label, val, color }) => (
              <div key={label} className="rounded-xl p-3 text-center border"
                style={{ backgroundColor: t.bg, borderColor: t.borderHex }}>
                <Icon size={16} style={{ color }} className="mx-auto mb-1" />
                <p className="text-[10px] uppercase font-bold mb-1" style={{ color: t.subtextHex }}>{label}</p>
                <p className="text-xs font-bold" style={{ color: t.textHex }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Coach Tips */}
          <div className="rounded-xl p-4 border"
            style={{ backgroundColor: t.bg, borderColor: t.borderHex }}>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={15} className="text-[#D4FF33]" />
              <span className="text-sm font-bold" style={{ color: t.textHex }}>Coach Tips</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: t.subtextHex }}>
              {exercise.tips}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExerciseVideoModal;
