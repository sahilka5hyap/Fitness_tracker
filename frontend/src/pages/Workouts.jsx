import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import {
  Plus, Dumbbell, Calendar, Clock, Flame, Repeat,
  Trash2, Play, ChevronRight, Star, Zap
} from 'lucide-react';
import WorkoutModel      from '../components/WorkoutModel';
import ExerciseVideoModal from '../components/ExerciseVideoModal';
import exerciseVideos    from '../data/exerciseVideos';

const DAILY_ROUTINES = {
  Monday:    {
    title: 'International Chest Day',
    focus: 'Chest & Triceps',
    color: 'text-red-400',
    bg:    'bg-red-500/10',
    border:'border-red-500/20',
    exercises: ['Bench Press', 'Incline Dumbbell Press', 'Tricep Dips', 'Cable Fly', 'Push Ups'],
  },
  Tuesday:   {
    title: 'Back Attack',
    focus: 'Back & Biceps',
    color: 'text-blue-400',
    bg:    'bg-blue-500/10',
    border:'border-blue-500/20',
    exercises: ['Deadlift', 'Pull Ups', 'Barbell Rows', 'Lat Pulldown', 'Seated Row'],
  },
  Wednesday: {
    title: 'Leg Day',
    focus: 'Legs & Core',
    color: 'text-orange-400',
    bg:    'bg-orange-500/10',
    border:'border-orange-500/20',
    exercises: ['Squats', 'Leg Press', 'Romanian Deadlift', 'Lunges', 'Calf Raises'],
  },
  Thursday:  {
    title: 'Shoulder Boulder',
    focus: 'Shoulders & Arms',
    color: 'text-purple-400',
    bg:    'bg-purple-500/10',
    border:'border-purple-500/20',
    exercises: ['Overhead Press', 'Lateral Raises', 'Face Pulls', 'Arnold Press', 'Barbell Curl'],
  },
  Friday:    {
    title: 'Full Body HIIT',
    focus: 'Cardio & Conditioning',
    color: 'text-yellow-400',
    bg:    'bg-yellow-500/10',
    border:'border-yellow-500/20',
    exercises: ['Burpees', 'Kettlebell Swings', 'Sprints', 'Jump Rope'],
  },
  Saturday:  {
    title: 'Active Recovery',
    focus: 'Yoga & Light Cardio',
    color: 'text-green-400',
    bg:    'bg-green-500/10',
    border:'border-green-500/20',
    exercises: ['Stretching', 'Light Jog', 'Foam Rolling'],
  },
  Sunday:    {
    title: 'Rest Day',
    focus: 'Rest & Meal Prep',
    color: 'text-gray-400',
    bg:    'bg-gray-500/10',
    border:'border-gray-500/20',
    exercises: ['Sleep', 'Hydrate', 'Relax'],
  },
};

const DIFF_STYLE = {
  Beginner:     { color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  Intermediate: { color: '#facc15', bg: 'rgba(250,204,21,0.12)' },
  Advanced:     { color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
};

const Workouts = () => {
  const { user } = useContext(AuthContext);
  const { t }    = useContext(ThemeContext);

  const [workouts,         setWorkouts]         = useState([]);
  const [isModalOpen,      setIsModalOpen]      = useState(false);
  const [loading,          setLoading]          = useState(true);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [activeTab,        setActiveTab]        = useState('tutorials');

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const daily     = DAILY_ROUTINES[todayName] || DAILY_ROUTINES.Sunday;

  const fetchWorkouts = async () => {
    try {
      const res  = await fetch('https://fitness-tracker-4q8f.onrender.com/api/workouts', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setWorkouts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkout = async (id) => {
    if (!window.confirm('Delete this workout?')) return;
    try {
      await fetch(`https://fitness-tracker-4q8f.onrender.com/api/workouts/${id}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchWorkouts();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { if (user) fetchWorkouts(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const openExercise = (exName) => {
    const data = exerciseVideos[exName];
    if (data) setSelectedExercise({ name: exName, ...data });
  };

  return (
    <div className="p-6 pb-24 min-h-screen" style={{ backgroundColor: t.bg }}>

      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: t.textHex }}>Workouts</h1>
          <p style={{ color: t.subtextHex }}>Log your training and track progress</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#D4FF33] text-black font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition shadow-lg shadow-[#D4FF33]/20"
        >
          <Plus size={20} /> Log Workout
        </button>
      </div>

      {/* Today's Routine Banner */}
      <div className={`border p-6 rounded-2xl mb-6 relative overflow-hidden ${daily.bg} ${daily.border}`}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4FF33] blur-[100px] opacity-5 rounded-full pointer-events-none" />
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="text-[#D4FF33]" size={16} />
          <span className={`text-xs font-bold uppercase tracking-wider ${daily.color}`}>
            {todayName}'s Routine
          </span>
        </div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: t.textHex }}>{daily.title}</h2>
        <p className="text-sm mb-5" style={{ color: t.subtextHex }}>Focus: {daily.focus}</p>
        <div className="flex flex-wrap gap-2">
          {daily.exercises.map((ex) => (
            <button
              key={ex}
              onClick={() => openExercise(ex)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:border-[#D4FF33] hover:text-[#D4FF33]"
              style={{ backgroundColor: t.card, borderColor: t.borderHex, color: t.subtextHex }}
            >
              <Play size={10} fill="currentColor" /> {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ backgroundColor: t.card }}>
        {[
          { key: 'tutorials', label: '📺 Exercise Tutorials' },
          { key: 'logs',      label: '📋 My Logs' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-5 py-2 rounded-lg text-sm font-bold transition-all"
            style={activeTab === tab.key
              ? { backgroundColor: '#D4FF33', color: '#000' }
              : { color: t.subtextHex }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1 — EXERCISE TUTORIALS */}
      {activeTab === 'tutorials' && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-[#D4FF33]" />
            <h3 className="font-bold text-lg" style={{ color: t.textHex }}>
              Today's Exercise Tutorials
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ backgroundColor: 'rgba(212,255,51,0.15)', color: '#D4FF33' }}>
              {daily.exercises.length} exercises
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {daily.exercises.map((exName) => {
              const ex   = exerciseVideos[exName];
              const diff = DIFF_STYLE[ex?.difficulty] || DIFF_STYLE.Beginner;
              return (
                <div
                  key={exName}
                  onClick={() => openExercise(exName)}
                  className="rounded-2xl overflow-hidden border cursor-pointer group transition-all duration-300 hover:border-[#D4FF33] hover:shadow-lg hover:shadow-[#D4FF33]/10"
                  style={{ backgroundColor: t.card, borderColor: t.borderHex }}
                >
                  <div className="relative overflow-hidden" style={{ height: '168px' }}>
                    {ex ? (
                      <img
                        src={`https://img.youtube.com/vi/${ex.videoId}/mqdefault.jpg`}
                        alt={exName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: t.bg }}>
                        <Dumbbell size={40} style={{ color: t.subtextHex }} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-14 h-14 bg-[#D4FF33] rounded-full flex items-center justify-center shadow-xl">
                        <Play size={20} className="text-black ml-1" fill="black" />
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      {ex && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ color: diff.color, backgroundColor: diff.bg, backdropFilter: 'blur(4px)' }}>
                          {ex.difficulty}
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                      ▶ Watch
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-bold text-base" style={{ color: t.textHex }}>{exName}</h4>
                      <ChevronRight size={16} className="mt-0.5 group-hover:text-[#D4FF33] transition-colors"
                        style={{ color: t.subtextHex }} />
                    </div>
                    {ex ? (
                      <>
                        <p className="text-xs mb-3" style={{ color: t.subtextHex }}>
                          {ex.muscle} · {ex.equipment}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold" style={{ color: '#D4FF33' }}>{ex.sets}</span>
                          <span className="text-xs" style={{ color: t.subtextHex }}>{ex.calories}</span>
                        </div>
                        <p className="text-xs mt-3 line-clamp-2 leading-relaxed" style={{ color: t.subtextHex }}>
                          💡 {ex.tips}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs" style={{ color: t.subtextHex }}>Click to learn more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Exercise Library */}
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <Star size={18} className="text-[#D4FF33]" />
              <h3 className="font-bold text-lg" style={{ color: t.textHex }}>Full Exercise Library</h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ backgroundColor: 'rgba(212,255,51,0.15)', color: '#D4FF33' }}>
                {Object.keys(exerciseVideos).length} exercises
              </span>
            </div>

            {[
              { group: '💪 Chest',     exercises: ['Bench Press','Incline Dumbbell Press','Tricep Dips','Cable Fly','Push Ups'] },
              { group: '🏋 Back',      exercises: ['Deadlift','Pull Ups','Barbell Rows','Lat Pulldown','Seated Row'] },
              { group: '🦵 Legs',      exercises: ['Squats','Leg Press','Romanian Deadlift','Lunges','Calf Raises'] },
              { group: '🧘 Shoulders', exercises: ['Overhead Press','Lateral Raises','Face Pulls','Arnold Press'] },
              { group: '💪 Arms',      exercises: ['Barbell Curl','Hammer Curl','Tricep Pushdown','Skull Crushers'] },
              { group: '🍫 Core',      exercises: ['Plank','Hanging Leg Raise','Russian Twist'] },
              { group: '🔥 Cardio',    exercises: ['Burpees','Kettlebell Swings','Sprints','Jump Rope'] },
              { group: '🧘 Recovery',  exercises: ['Stretching','Light Jog','Foam Rolling','Sleep','Hydrate','Relax'] },
            ].map(({ group, exercises }) => (
              <div key={group} className="mb-6">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: t.subtextHex }}>
                  {group}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {exercises.map(exName => {
                    const ex   = exerciseVideos[exName];
                    
                    return (
                      <button
                        key={exName}
                        onClick={() => openExercise(exName)}
                        className="flex items-center gap-3 p-3 rounded-xl border text-left group hover:border-[#D4FF33] transition-all"
                        style={{ backgroundColor: t.card, borderColor: t.borderHex }}
                      >
                        {ex ? (
                          <img
                            src={`https://img.youtube.com/vi/${ex.videoId}/default.jpg`}
                            alt={exName}
                            className="w-14 h-10 object-cover rounded-lg shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-10 rounded-lg shrink-0 flex items-center justify-center"
                            style={{ backgroundColor: t.bg }}>
                            <Dumbbell size={16} style={{ color: t.subtextHex }} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate" style={{ color: t.textHex }}>{exName}</p>
                          {ex && (
                            <p className="text-[10px]" style={{ color: t.subtextHex }}>
                              {ex.muscle} · {ex.sets}
                            </p>
                          )}
                        </div>
                        <Play size={14} className="shrink-0 group-hover:text-[#D4FF33] transition-colors"
                          style={{ color: t.subtextHex }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2 — MY LOGS */}
      {activeTab === 'logs' && (
        <div>
          <h3 className="font-bold text-lg mb-4" style={{ color: t.textHex }}>Recent Logs</h3>

          {loading ? (
            <div className="text-center py-12" style={{ color: t.subtextHex }}>Loading...</div>
          ) : workouts.length === 0 ? (
            <div className="text-center py-16 border rounded-2xl border-dashed" style={{ borderColor: t.borderHex }}>
              <Dumbbell size={48} className="mx-auto mb-4" style={{ color: t.subtextHex }} />
              <p className="font-bold mb-1" style={{ color: t.textHex }}>No workouts logged yet</p>
              <p className="text-sm mb-4" style={{ color: t.subtextHex }}>
                Click "Log Workout" to record your first session
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#D4FF33] text-black font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition"
              >
                + Log Workout
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {workouts.map(workout => (
                <div
                  key={workout._id}
                  className="border p-5 rounded-xl flex justify-between items-center group hover:border-[#D4FF33]/50 transition-all"
                  style={{ backgroundColor: t.card, borderColor: t.borderHex }}
                >
                  <div className="flex items-center gap-4">
                    {exerciseVideos[workout.title] ? (
                      <button
                        onClick={() => openExercise(workout.title)}
                        className="relative shrink-0 overflow-hidden rounded-xl hover:opacity-80 transition-opacity"
                        style={{ width: 64, height: 48 }}
                        title="Watch tutorial"
                      >
                        <img
                          src={`https://img.youtube.com/vi/${exerciseVideos[workout.title].videoId}/default.jpg`}
                          alt={workout.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Play size={12} fill="white" className="text-white" />
                        </div>
                      </button>
                    ) : (
                      <div className="p-3 rounded-xl text-[#D4FF33] shrink-0" style={{ backgroundColor: t.bg }}>
                        <Dumbbell size={20} />
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold text-lg" style={{ color: t.textHex }}>{workout.title}</h4>
                      <div className="flex flex-wrap gap-3 text-xs mt-1" style={{ color: t.subtextHex }}>
                        <span className="flex items-center gap-1">
                          <Calendar size={11} /> {new Date(workout.date).toLocaleDateString()}
                        </span>
                        {workout.duration > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {workout.duration} min
                          </span>
                        )}
                        {workout.caloriesBurned > 0 && (
                          <span className="flex items-center gap-1">
                            <Flame size={11} /> {workout.caloriesBurned} cal
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {workout.weight > 0 ? (
                      <div className="text-right">
                        <span className="text-xl font-bold" style={{ color: t.textHex }}>
                          {workout.weight}
                          <span className="text-xs font-normal ml-1" style={{ color: t.subtextHex }}>kg</span>
                        </span>
                        {workout.sets > 0 && (
                          <p className="text-xs flex items-center gap-1 justify-end mt-0.5" style={{ color: t.subtextHex }}>
                            <Repeat size={10} /> {workout.sets} × {workout.reps}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm font-bold" style={{ color: t.subtextHex }}>Cardio</span>
                    )}

                    <button
                      onClick={() => deleteWorkout(workout._id)}
                      className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:text-red-500"
                      style={{ color: t.subtextHex, backgroundColor: t.bg }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <WorkoutModel
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchWorkouts}
      />
      <ExerciseVideoModal
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </div>
  );
};

export default Workouts;