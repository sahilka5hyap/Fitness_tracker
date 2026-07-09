import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import {
  Activity, Flame, Footprints, Dumbbell, Scale, Plus,
  Calendar, TrendingUp, Zap, ChevronRight, Moon, Droplets,
  Minus, Timer, BarChart2, ListChecks
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import WorkoutModel      from '../components/WorkoutModel';
import MealModel         from '../components/MealModel';
import BodyStatsModel    from '../components/BodyStatsModel';
import RestTimer         from '../components/RestTimer';
import WeeklySummary     from '../components/WeeklySummary';
import CustomWorkoutPlan from '../components/CustomWorkoutPlan';
import { StatCardSkeleton } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import api from '../utils/api';

const calculateTDEE = (profile) => {
  const age    = profile?.age    || 25;
  const weight = profile?.weight || 70;
  const height = profile?.height || 170;
  const gender = profile?.gender || 'Male';
  const goal   = profile?.fitnessGoal || 'General Health';

  let bmr;
  if (gender === 'Male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const tdee = Math.round(bmr * 1.55);
  if (goal === 'Weight Loss')          return tdee - 500;
  if (goal === 'Muscle Gain')          return tdee + 300;
  if (goal === 'Athletic Performance') return tdee + 200;
  return tdee;
};

const calculateStreak = (workouts) => {
  if (!Array.isArray(workouts) || workouts.length === 0) return 0;
  const workoutDays = new Set(workouts.map(w => new Date(w.date).toDateString()));
  let streak  = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    if (workoutDays.has(checkDate.toDateString())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { t }    = useContext(ThemeContext);
  const toast    = useToast();
  const navigate = useNavigate();
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const [isLoading, setIsLoading] = useState(true);

  const [showQuickLogMenu,  setShowQuickLogMenu]  = useState(false);
  const [activeModal,       setActiveModal]       = useState(null);
  const [showStartOptions,  setShowStartOptions]  = useState(false);
  const [stepsInput,        setStepsInput]        = useState('');
  const [showRestTimer,     setShowRestTimer]     = useState(false);
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);
  const [showWorkoutPlans,  setShowWorkoutPlans]  = useState(false);

  const [dashboardData, setDashboardData] = useState({
    caloriesIn: 0, caloriesBurned: 0, activeMinutes: 0,
    steps: 0, weight: 0, muscleMass: 0, sleep: 0, water: 0
  });
  const [graphData,      setGraphData]      = useState([]);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [streak,         setStreak]         = useState(0);
  const [calorieTarget,  setCalorieTarget]  = useState(2500);
  const [profile,        setProfile]        = useState(null);

  const getDailyFocus = () => {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const today = days[new Date().getDay()];
    const schedule = {
      Monday:    { focus: 'Chest & Triceps',  icon: '💪', color: 'text-red-500',    bg: 'bg-red-500/10',    border: 'border-red-500/20' },
      Tuesday:   { focus: 'Back & Biceps',    icon: '🏋️', color: 'text-blue-500',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
      Wednesday: { focus: 'Legs & Core',      icon: '🦵', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
      Thursday:  { focus: 'Shoulders & Abs',  icon: '🧘', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
      Friday:    { focus: 'Full Body HIIT',   icon: '🔥', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
      Saturday:  { focus: 'Yoga & Recovery',  icon: '🧘', color: 'text-green-500',  bg: 'bg-green-500/10',  border: 'border-green-500/20' },
      Sunday:    { focus: 'Rest Day',         icon: '😴', color: 'text-gray-500',   bg: 'bg-gray-500/10',   border: 'border-gray-500/20' },
    };
    return { day: today, ...schedule[today] };
  };
  const dailySuggestion = getDailyFocus();

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [workouts, nutrition, stats, profileData] = await Promise.all([
        api.getWorkouts(user.token),
        api.getMeals(user.token),
        api.getStats(user.token),
        api.getProfile(user.token),
      ]);

      if (profileData && !profileData.message) {
        setProfile(profileData);
        setCalorieTarget(calculateTDEE(profileData));
      }

      const todayStr    = new Date().toDateString();
      const todaysMeals = Array.isArray(nutrition) ? nutrition.filter(n => new Date(n.date).toDateString() === todayStr) : [];
      const calIn       = todaysMeals.reduce((a, c) => a + (c.calories || 0), 0);
      const todaysWork  = Array.isArray(workouts)  ? workouts.filter(w  => new Date(w.date).toDateString() === todayStr) : [];
      const calOut      = todaysWork.reduce((a, c) => a + (c.caloriesBurned || 0), 0);
      const durationSum = todaysWork.reduce((a, c) => a + (c.duration || 0), 0);
      const sortedStats = Array.isArray(stats) ? [...stats].sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
      const latestStat  = sortedStats[0] || {};

      setDashboardData({
        caloriesIn: calIn, caloriesBurned: calOut, activeMinutes: durationSum,
        steps: latestStat.steps || 0, weight: latestStat.weight || 0,
        muscleMass: latestStat.muscleMass || 0, sleep: latestStat.sleep || 0,
        water: latestStat.water || 0
      });
      setRecentWorkouts(Array.isArray(workouts) ? workouts.slice(0, 3) : []);
      setStreak(calculateStreak(Array.isArray(workouts) ? workouts : []));

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d;
      });
      setGraphData(last7Days.map(date => {
        const ds   = date.toDateString();
        const mins = (Array.isArray(workouts) ? workouts : [])
          .filter(w => new Date(w.date).toDateString() === ds)
          .reduce((a, c) => a + (c.duration || 0), 0);
        return { day: date.toLocaleDateString('en-US', { weekday: 'short' }), active: mins };
      }));

    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Could not load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => { if (user) fetchData(); }, [user, fetchData]);

  // ✅ FIX #5: Only posts the specific stat being changed.
  // Old code bundled dashboardData.weight from a stale closure, posting weight=0
  // on first load with every water/sleep/steps update, polluting stats history.
  const updateStat = async (key, changeValue, isDirectSet = false) => {
    let newValue = isDirectSet ? parseFloat(changeValue) : (dashboardData[key] || 0) + changeValue;
    if (newValue < 0) newValue = 0;

    setDashboardData(prev => ({ ...prev, [key]: newValue }));

    try {
      await api.createStat(user.token, { [key]: newValue });
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Could not save that update');
      fetchData();
    }
  };

  const MetricCard = ({ title, value, subtext, icon: Icon, color, type }) => (
    <div className="p-4 rounded-2xl border flex flex-col justify-between h-full"
      style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
          <Icon size={18} className={color} />
        </div>
        {subtext && <span className="text-[10px] font-medium uppercase" style={{ color: t.subtextHex }}>{subtext}</span>}
      </div>
      <div className="mb-3">
        <h3 className="text-xl font-bold" style={{ color: t.textHex }}>{value}</h3>
        <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: t.subtextHex }}>{title}</p>
      </div>
      {type === 'water' && (
        <div className="flex items-center gap-2 mt-auto">
          <button onClick={() => updateStat('water', -0.25)} className="p-1.5 rounded-lg" style={{ backgroundColor: t.bg, color: t.subtextHex }}><Minus size={14} /></button>
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: t.bg }}>
            <div className="h-full bg-cyan-400" style={{ width: `${Math.min((dashboardData.water / 3) * 100, 100)}%` }} />
          </div>
          <button onClick={() => updateStat('water', 0.25)} className="p-1.5 rounded-lg" style={{ backgroundColor: t.bg, color: t.subtextHex }}><Plus size={14} /></button>
        </div>
      )}
      {type === 'sleep' && (
        <div className="flex items-center gap-2 mt-auto">
          <button onClick={() => updateStat('sleep', -0.5)} className="p-1.5 rounded-lg" style={{ backgroundColor: t.bg, color: t.subtextHex }}><Minus size={14} /></button>
          <span className="text-xs font-mono flex-1 text-center" style={{ color: t.subtextHex }}>8h Goal</span>
          <button onClick={() => updateStat('sleep', 0.5)} className="p-1.5 rounded-lg" style={{ backgroundColor: t.bg, color: t.subtextHex }}><Plus size={14} /></button>
        </div>
      )}
      {type === 'steps' && (
        <div className="flex items-center gap-2 mt-auto">
          <input type="number" placeholder="+Steps"
            className="w-full border rounded-lg py-1 px-2 text-xs focus:border-[#D4FF33] focus:outline-none"
            style={{ backgroundColor: t.bg, borderColor: t.borderHex, color: t.textHex }}
            value={stepsInput} onChange={e => setStepsInput(e.target.value)} />
          <button onClick={() => { if (!stepsInput) return; updateStat('steps', parseInt(stepsInput), false); setStepsInput(''); }}
            className="p-1.5 bg-green-900/30 text-green-500 border border-green-500/30 rounded-lg hover:bg-green-500 hover:text-black transition">
            <Plus size={14} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-6 pb-24" style={{ backgroundColor: t.bg }}>

      {/* Header */}
      <div className="flex justify-between items-start mb-8 relative">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: t.textHex }}>
            Hello, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: t.subtextHex }}>
            Here is your daily summary • {todayDate}
          </p>
        </div>
        <button onClick={() => setShowQuickLogMenu(!showQuickLogMenu)}
          className="bg-[#D4FF33] text-black font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all">
          <Plus size={18} /> Quick Log
        </button>

        {showQuickLogMenu && (
          <div className="absolute right-0 top-12 border rounded-xl p-2 w-48 z-50 shadow-xl"
            style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
            {[
              { label: 'Log Workout',    icon: <Dumbbell size={16} className="text-[#D4FF33]" />,  modal: 'workout' },
              { label: 'Log Meal',       icon: <Flame    size={16} className="text-orange-500" />, modal: 'meal' },
              { label: 'Log Body Stats', icon: <Scale    size={16} className="text-blue-500" />,   modal: 'stats' },
            ].map(item => (
              <button key={item.modal}
                onClick={() => { setActiveModal(item.modal); setShowQuickLogMenu(false); }}
                className="flex items-center gap-3 px-3 py-2.5 text-sm w-full text-left rounded-lg transition-colors"
                style={{ color: t.subtextHex }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = t.bg}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Streak + Quick Tools */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-2xl border flex flex-col items-center justify-center text-center"
          style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
          <span className="text-3xl mb-1">🔥</span>
          <span className="text-2xl font-bold" style={{ color: t.textHex }}>{streak}</span>
          <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: t.subtextHex }}>Day Streak</span>
        </div>

        <button onClick={() => setShowRestTimer(true)}
          className="p-4 rounded-2xl border flex flex-col items-center justify-center text-center hover:border-[#D4FF33] transition-all group"
          style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
          <Timer size={24} className="mb-1 group-hover:text-[#D4FF33] transition-colors" style={{ color: t.subtextHex }} />
          <span className="text-xs font-bold" style={{ color: t.textHex }}>Rest Timer</span>
          <span className="text-[10px]" style={{ color: t.subtextHex }}>Between sets</span>
        </button>

        <button onClick={() => setShowWeeklySummary(true)}
          className="p-4 rounded-2xl border flex flex-col items-center justify-center text-center hover:border-[#D4FF33] transition-all group"
          style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
          <BarChart2 size={24} className="mb-1 group-hover:text-[#D4FF33] transition-colors" style={{ color: t.subtextHex }} />
          <span className="text-xs font-bold" style={{ color: t.textHex }}>This Week</span>
          <span className="text-[10px]" style={{ color: t.subtextHex }}>Summary</span>
        </button>
      </div>

      {/* Today's Focus + Nutrition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className={`p-6 rounded-2xl relative overflow-hidden border ${dailySuggestion.bg} ${dailySuggestion.border}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className={`p-1.5 rounded-md bg-black/20 ${dailySuggestion.color}`}><Calendar size={16} /></div>
            <h3 className={`font-bold text-sm uppercase tracking-wide ${dailySuggestion.color}`}>Today's Focus</h3>
          </div>
          <h2 className="text-2xl font-bold mb-1 flex items-center gap-2" style={{ color: t.textHex }}>
            {dailySuggestion.icon} {dailySuggestion.focus}
          </h2>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setShowStartOptions(true)}
              className="flex-1 border font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-80"
              style={{ backgroundColor: t.card, borderColor: t.borderHex, color: t.textHex }}>
              Start Training <ChevronRight size={14} />
            </button>
            <button onClick={() => setShowWorkoutPlans(true)}
              className="border font-bold py-3 px-3 rounded-xl flex items-center justify-center hover:border-[#D4FF33] hover:text-[#D4FF33] transition-all"
              style={{ backgroundColor: t.card, borderColor: t.borderHex, color: t.subtextHex }}>
              <ListChecks size={16} />
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 p-6 rounded-2xl border flex flex-col justify-between"
          style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Flame className="text-orange-500" size={20} />
              <h3 className="font-bold text-lg" style={{ color: t.textHex }}>Daily Nutrition</h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono" style={{ color: t.subtextHex }}>Target: {calorieTarget} kcal</span>
              {profile?.fitnessGoal && (
                <p className="text-[10px]" style={{ color: t.subtextHex }}>({profile.fitnessGoal})</p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: t.subtextHex }}>Consumed</span>
                <span className="font-bold" style={{ color: t.textHex }}>{dashboardData.caloriesIn} / {calorieTarget} kcal</span>
              </div>
              <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: t.bg }}>
                <div className="h-full bg-orange-500" style={{ width: `${Math.min((dashboardData.caloriesIn / calorieTarget) * 100, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: t.subtextHex }}>Burned</span>
                <span className="font-bold text-[#D4FF33]">{dashboardData.caloriesBurned} kcal</span>
              </div>
              <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: t.bg }}>
                <div className="h-full bg-[#D4FF33]" style={{ width: `${Math.min((dashboardData.caloriesBurned / 800) * 100, 100)}%` }} />
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: t.borderHex }}>
              <span className="text-xs" style={{ color: t.subtextHex }}>Net Calories</span>
              <span className={`text-sm font-bold ${dashboardData.caloriesIn - dashboardData.caloriesBurned > calorieTarget ? 'text-red-400' : 'text-green-400'}`}>
                {dashboardData.caloriesIn - dashboardData.caloriesBurned} kcal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Tracking */}
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: t.textHex }}>
        <Activity size={18} className="text-[#D4FF33]" /> Daily Tracking
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard title="Weight"  value={dashboardData.weight}                 subtext="kg"    icon={Scale}      color="text-yellow-500" />
            <MetricCard title="Muscle"  value={dashboardData.muscleMass}             subtext="kg"    icon={Dumbbell}   color="text-purple-500" />
            <MetricCard title="Active"  value={dashboardData.activeMinutes}          subtext="min"   icon={Zap}        color="text-[#D4FF33]" />
            <MetricCard title="Steps"   value={dashboardData.steps.toLocaleString()} subtext="steps" icon={Footprints} color="text-green-500"  type="steps" />
            <MetricCard title="Sleep"   value={dashboardData.sleep.toFixed(1)}       subtext="hours" icon={Moon}       color="text-indigo-400" type="sleep" />
            <MetricCard title="Water"   value={`${dashboardData.water.toFixed(2)}L`} subtext="/ 3L"  icon={Droplets}   color="text-cyan-400"   type="water" />
          </>
        )}
      </div>

      {/* Graph + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl border h-80"
          style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
          <h3 className="font-bold flex items-center gap-2 mb-4" style={{ color: t.textHex }}>
            <TrendingUp size={20} className="text-[#D4FF33]" /> Activity Volume
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={graphData}>
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: t.card, borderColor: t.borderHex, color: t.textHex }} />
              <XAxis dataKey="day" axisLine={false} tickLine={false}
                tick={{ fill: t.graphAxisColor, fontSize: 12 }} dy={10} />
              <Bar dataKey="active" radius={[4,4,0,0]} barSize={30}>
                {graphData.map((entry, i) => (
                  <Cell key={i} fill={entry.active > 0 ? '#D4FF33' : t.graphEmptyBar} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-2xl border" style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
          <h3 className="font-bold mb-4" style={{ color: t.textHex }}>Recent Logs</h3>
          <div className="space-y-4">
            {recentWorkouts.length === 0
              ? <p className="text-sm" style={{ color: t.subtextHex }}>No recent activity.</p>
              : recentWorkouts.map(w => (
                <div key={w._id} className="flex items-center gap-3 pb-3 border-b last:border-0 last:pb-0"
                  style={{ borderColor: t.borderHex }}>
                  <div className="p-2 rounded-lg text-[#D4FF33]" style={{ backgroundColor: t.bg }}>
                    <Dumbbell size={16} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold truncate" style={{ color: t.textHex }}>{w.title}</h4>
                  </div>
                  <span className="text-xs font-bold" style={{ color: t.subtextHex }}>{w.duration}m</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Start Training Modal */}
      {showStartOptions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="border rounded-2xl p-6 w-80 shadow-2xl"
            style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
            <h3 className="text-lg font-bold mb-4 text-center" style={{ color: t.textHex }}>Choose Training Mode</h3>
            <div className="space-y-3">
              <button onClick={() => { setShowStartOptions(false); navigate('/workouts'); }}
                className="w-full bg-[#D4FF33] hover:opacity-90 text-black font-bold py-3 rounded-xl transition-all">
                🏋️ Manual Workout
              </button>
              <button onClick={() => { setShowStartOptions(false); navigate('/ai-coach'); }}
                className="w-full border font-bold py-3 rounded-xl transition-all hover:opacity-80"
                style={{ backgroundColor: t.bg, borderColor: t.borderHex, color: t.textHex }}>
                🤖 AI Coach
              </button>
            </div>
            <button onClick={() => setShowStartOptions(false)}
              className="w-full text-sm mt-4 transition-colors" style={{ color: t.subtextHex }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <WorkoutModel      isOpen={activeModal === 'workout'} onClose={() => setActiveModal(null)} onSave={fetchData} />
      <MealModel         isOpen={activeModal === 'meal'}    onClose={() => setActiveModal(null)} onSave={fetchData} />
      <BodyStatsModel    isOpen={activeModal === 'stats'}   onClose={() => setActiveModal(null)} onSave={fetchData} />
      <RestTimer         isOpen={showRestTimer}             onClose={() => setShowRestTimer(false)} />
      <WeeklySummary     isOpen={showWeeklySummary}         onClose={() => setShowWeeklySummary(false)} />
      <CustomWorkoutPlan isOpen={showWorkoutPlans}          onClose={() => setShowWorkoutPlans(false)} />
    </div>
  );
};

export default Dashboard;