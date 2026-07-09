import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { X, TrendingUp, Flame, Dumbbell, Clock, } from 'lucide-react';

// Shows a weekly summary card of workouts, calories, active minutes
// Usage: <WeeklySummary isOpen={show} onClose={() => setShow(false)} />

const WeeklySummary = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);
  const { t }    = useContext(ThemeContext);

  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!isOpen || !user) return;
    loadSummary();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSummary = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${user.token}` };

      // Fetch workouts and nutrition at the same time
      const [workoutsRes, nutritionRes] = await Promise.all([
        fetch('https://fitness-backend-z4vd.onrender.com/api/workouts',  { headers }),
        fetch('https://fitness-backend-z4vd.onrender.com/api/nutrition', { headers }),
      ]);
      const [workouts, nutrition] = await Promise.all([
        workoutsRes.json(),
        nutritionRes.json(),
      ]);

      // Figure out the start of this week (Monday)
      const now       = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday
      const monday    = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);

      // Filter to only this week's data
      const weekWorkouts  = Array.isArray(workouts)
        ? workouts.filter(w => new Date(w.date) >= monday)
        : [];

      const weekNutrition = Array.isArray(nutrition)
        ? nutrition.filter(n => new Date(n.date) >= monday)
        : [];

      // Calculate totals
      const totalCaloriesBurned = weekWorkouts.reduce((a, w) => a + (w.caloriesBurned || 0), 0);
      const totalMinutes        = weekWorkouts.reduce((a, w) => a + (w.duration || 0), 0);
      const totalCaloriesEaten  = weekNutrition.reduce((a, n) => a + (n.calories || 0), 0);
      const totalWeightLifted   = weekWorkouts.reduce((a, w) => a + (w.weight || 0), 0);

      // Count unique days with a workout
      const uniqueDays = new Set(weekWorkouts.map(w => new Date(w.date).toDateString())).size;

      setSummary({
        workoutCount:      weekWorkouts.length,
        caloriesBurned:    totalCaloriesBurned,
        activeMinutes:     totalMinutes,
        caloriesEaten:     totalCaloriesEaten,
        weightLifted:      totalWeightLifted,
        activeDays:        uniqueDays,
        weekStart:         monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weekEnd:           now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl border"
        style={{ backgroundColor: t.card, borderColor: t.borderHex }}>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={22} className="text-[#D4FF33]" />
            <div>
              <h2 className="font-bold text-lg" style={{ color: t.textHex }}>Weekly Summary</h2>
              {summary && (
                <p className="text-xs" style={{ color: t.subtextHex }}>
                  {summary.weekStart} – {summary.weekEnd}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="hover:opacity-70 transition" style={{ color: t.subtextHex }}>
            <X size={22} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10" style={{ color: t.subtextHex }}>
            Loading your week...
          </div>
        ) : !summary ? (
          <div className="text-center py-10" style={{ color: t.subtextHex }}>
            Could not load data.
          </div>
        ) : (
          <>
            {/* Big headline number */}
            <div className="text-center p-6 rounded-2xl mb-4"
              style={{ backgroundColor: t.bg }}>
              <span className="text-5xl font-bold text-[#D4FF33]">{summary.activeDays}</span>
              <p className="text-sm mt-1" style={{ color: t.subtextHex }}>
                active day{summary.activeDays !== 1 ? 's' : ''} this week
              </p>

              {/* Day dots */}
              <div className="flex justify-center gap-2 mt-3">
                {['M','T','W','T','F','S','S'].map((day, i) => {
                  // Check if this day index had a workout (rough check)
                  const isActive = i < summary.activeDays;
                  return (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: isActive ? '#D4FF33' : t.card,
                        color:           isActive ? '#000'    : t.subtextHex,
                        border: `1px solid ${isActive ? '#D4FF33' : t.borderHex}`,
                      }}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">

              <div className="p-4 rounded-xl border" style={{ backgroundColor: t.bg, borderColor: t.borderHex }}>
                <div className="flex items-center gap-2 mb-2">
                  <Dumbbell size={16} className="text-[#D4FF33]" />
                  <span className="text-xs uppercase font-bold" style={{ color: t.subtextHex }}>Workouts</span>
                </div>
                <span className="text-2xl font-bold" style={{ color: t.textHex }}>
                  {summary.workoutCount}
                </span>
              </div>

              <div className="p-4 rounded-xl border" style={{ backgroundColor: t.bg, borderColor: t.borderHex }}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-blue-400" />
                  <span className="text-xs uppercase font-bold" style={{ color: t.subtextHex }}>Minutes</span>
                </div>
                <span className="text-2xl font-bold" style={{ color: t.textHex }}>
                  {summary.activeMinutes}
                </span>
              </div>

              <div className="p-4 rounded-xl border" style={{ backgroundColor: t.bg, borderColor: t.borderHex }}>
                <div className="flex items-center gap-2 mb-2">
                  <Flame size={16} className="text-orange-400" />
                  <span className="text-xs uppercase font-bold" style={{ color: t.subtextHex }}>Cal Burned</span>
                </div>
                <span className="text-2xl font-bold" style={{ color: t.textHex }}>
                  {summary.caloriesBurned}
                </span>
              </div>

              <div className="p-4 rounded-xl border" style={{ backgroundColor: t.bg, borderColor: t.borderHex }}>
                <div className="flex items-center gap-2 mb-2">
                  <Flame size={16} className="text-yellow-400" />
                  <span className="text-xs uppercase font-bold" style={{ color: t.subtextHex }}>Cal Eaten</span>
                </div>
                <span className="text-2xl font-bold" style={{ color: t.textHex }}>
                  {summary.caloriesEaten}
                </span>
              </div>

            </div>

            {/* Motivational message */}
            <div className="p-4 rounded-xl text-center"
              style={{ backgroundColor: 'rgba(212,255,51,0.1)', border: '1px solid rgba(212,255,51,0.2)' }}>
              <p className="text-sm font-bold text-[#D4FF33]">
                {summary.activeDays >= 5
                  ? '🔥 Crushing it! Amazing week!'
                  : summary.activeDays >= 3
                  ? '💪 Solid week! Keep it up!'
                  : summary.activeDays >= 1
                  ? '👟 Good start! Push for more next week.'
                  : '😴 Rest week! Get back on track tomorrow.'}
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default WeeklySummary;
