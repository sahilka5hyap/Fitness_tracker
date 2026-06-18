import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Plus, Flame, Droplets, Utensils, Zap, Wheat, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import MealModel from '../components/MealModel';

const calculateTargets = (profile) => {
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
  let calories = Math.round(bmr * 1.55);
  if (goal === 'Weight Loss')          calories -= 500;
  if (goal === 'Muscle Gain')          calories += 300;
  if (goal === 'Athletic Performance') calories += 200;

  let protein, carbs, fat;
  if (goal === 'Weight Loss') {
    protein = Math.round(weight * 2.2);
    fat     = Math.round((calories * 0.25) / 9);
    carbs   = Math.round((calories - (protein * 4) - (fat * 9)) / 4);
  } else if (goal === 'Muscle Gain') {
    protein = Math.round(weight * 2.5);
    fat     = Math.round((calories * 0.25) / 9);
    carbs   = Math.round((calories - (protein * 4) - (fat * 9)) / 4);
  } else {
    protein = Math.round(weight * 1.8);
    fat     = Math.round((calories * 0.30) / 9);
    carbs   = Math.round((calories - (protein * 4) - (fat * 9)) / 4);
  }

  if (carbs < 50)   carbs = 50;
  if (protein < 50) protein = 50;
  if (fat < 30)     fat = 30;

  return { calories, protein, carbs, fat };
};

const Nutrition = () => {
  const { user } = useContext(AuthContext);
  const { t }    = useContext(ThemeContext);

  const [todaysMeals, setTodaysMeals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [targets,     setTargets]     = useState({ calories: 2500, protein: 150, carbs: 300, fat: 80 });

  // ✅ FIX #6: useCallback keeps fetchMeals stable across renders so it can
  // safely live in the useEffect dependency array without causing infinite loops.
  const fetchMeals = useCallback(async () => {
    try {
      const headers = { 'Authorization': `Bearer ${user.token}` };
      const [mealsRes, profileRes] = await Promise.all([
        fetch('https://fitness-tracker-4q8f.onrender.com/api/nutrition',     { headers }),
        fetch('https://fitness-tracker-4q8f.onrender.com/api/users/profile', { headers }),
      ]);
      const [data, profileData] = await Promise.all([mealsRes.json(), profileRes.json()]);

      if (profileData && !profileData.message) setTargets(calculateTargets(profileData));

      const allMeals = Array.isArray(data) ? data : [];
      const today    = new Date().toDateString();
      setTodaysMeals(allMeals.filter(m => new Date(m.date).toDateString() === today));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteMeal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meal?')) return;
    try {
      const res = await fetch(`https://fitness-tracker-4q8f.onrender.com/api/nutrition/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) fetchMeals();
    } catch (err) { console.error(err); }
  };

  // ✅ FIX #6: fetchMeals now included in deps — safe because useCallback keeps it stable
  useEffect(() => {
    if (user?.token) fetchMeals();
  }, [user, fetchMeals]);

  const totals = todaysMeals.reduce((acc, curr) => ({
    calories: acc.calories + (curr.calories || 0),
    protein:  acc.protein  + (curr.protein  || 0),
    carbs:    acc.carbs    + (curr.carbs    || 0),
    fat:      acc.fat      + (curr.fat      || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const macroData = [
    { name: 'Protein', value: totals.protein, color: '#3b82f6' },
    { name: 'Carbs',   value: totals.carbs,   color: '#eab308' },
    { name: 'Fat',     value: totals.fat,     color: '#ef4444' },
  ].filter(d => d.value > 0);

  const getMealsByType = (type) => todaysMeals.filter(m => m.mealType === type);

  const MacroCard = ({ label, value, target, unit, color, icon: Icon }) => {
    const pct = Math.min((value / target) * 100, 100);
    return (
      <div className="border p-5 rounded-2xl relative overflow-hidden"
        style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
        <div className="flex justify-between items-start mb-2">
          <div className={`p-2 rounded-lg bg-opacity-10 ${color}`}>
            <Icon size={20} className={color.replace('bg-', 'text-')} />
          </div>
          <span className="text-xs font-bold" style={{ color: t.subtextHex }}>{Math.round(pct)}%</span>
        </div>
        <p className="text-xs uppercase font-bold tracking-wider mb-1" style={{ color: t.subtextHex }}>{label}</p>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-2xl font-bold" style={{ color: t.textHex }}>{value}</span>
          <span className="text-xs" style={{ color: t.subtextHex }}>/ {target}{unit}</span>
        </div>
        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: t.bg }}>
          <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };

  const MealSection = ({ title, type }) => {
    const sectionMeals = getMealsByType(type);
    if (sectionMeals.length === 0) return null;
    const sectionCals = sectionMeals.reduce((acc, curr) => acc + curr.calories, 0);
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: t.subtextHex }}>{title}</h3>
          <span className="text-xs" style={{ color: t.subtextHex }}>{sectionCals} cal</span>
        </div>
        <div className="space-y-3">
          {sectionMeals.map(meal => (
            <div key={meal._id}
              className="border p-4 rounded-xl flex justify-between items-center group hover:border-[#D4FF33] transition-colors"
              style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-[#D4FF33] group-hover:text-black transition-colors"
                  style={{ backgroundColor: t.bg, color: t.subtextHex }}>
                  <Utensils size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-sm" style={{ color: t.textHex }}>{meal.foodName}</h4>
                  <p className="text-xs flex gap-2" style={{ color: t.subtextHex }}>
                    <span>P: {meal.protein}g</span>
                    <span>C: {meal.carbs}g</span>
                    <span>F: {meal.fat}g</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm text-[#D4FF33]">{meal.calories}</span>
                <button onClick={() => deleteMeal(meal._id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 p-1"
                  style={{ color: t.subtextHex }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 pb-24 min-h-screen" style={{ backgroundColor: t.bg }}>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: t.textHex }}>Nutrition</h1>
          <p style={{ color: t.subtextHex }}>Track your macros and meals</p>
        </div>
        <button onClick={() => setIsModalOpen(true)}
          className="bg-[#D4FF33] text-black font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition shadow-lg shadow-[#D4FF33]/20">
          <Plus size={20} /> Log Meal
        </button>
      </div>

      {/* Macro Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MacroCard label="Calories" value={totals.calories} target={targets.calories} unit=""  icon={Flame}    color="bg-orange-500 text-orange-500" />
        <MacroCard label="Protein"  value={totals.protein}  target={targets.protein}  unit="g" icon={Zap}      color="bg-blue-500 text-blue-500" />
        <MacroCard label="Carbs"    value={totals.carbs}    target={targets.carbs}    unit="g" icon={Wheat}    color="bg-yellow-500 text-yellow-500" />
        <MacroCard label="Fats"     value={totals.fat}      target={targets.fat}      unit="g" icon={Droplets} color="bg-red-500 text-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Meal Log */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-10" style={{ color: t.subtextHex }}>Loading meals...</div>
          ) : todaysMeals.length === 0 ? (
            <div className="text-center py-12 border rounded-2xl border-dashed" style={{ borderColor: t.borderHex }}>
              <Utensils size={40} className="mx-auto mb-4" style={{ color: t.subtextHex }} />
              <p style={{ color: t.subtextHex }}>No meals logged today.</p>
              <button onClick={() => setIsModalOpen(true)} className="text-[#D4FF33] text-sm font-bold mt-2 hover:underline">
                Start Tracking
              </button>
            </div>
          ) : (
            <>
              <MealSection title="Breakfast" type="Breakfast" />
              <MealSection title="Lunch"     type="Lunch" />
              <MealSection title="Dinner"    type="Dinner" />
              <MealSection title="Snacks"    type="Snack" />
            </>
          )}
        </div>

        {/* Analysis */}
        <div className="space-y-6">
          <div className="border p-6 rounded-2xl h-80 flex flex-col items-center justify-center relative"
            style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
            <h3 className="absolute top-6 left-6 font-bold text-sm uppercase" style={{ color: t.subtextHex }}>Macro Split</h3>
            {totals.calories > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={macroData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {macroData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: t.card, borderColor: t.borderHex, color: t.textHex }} itemStyle={{ color: t.textHex }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm" style={{ color: t.subtextHex }}>Log food to see breakdown</div>
            )}
            {totals.calories > 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-4">
                <div className="text-center">
                  <span className="block text-2xl font-bold" style={{ color: t.textHex }}>{totals.calories}</span>
                  <span className="text-xs" style={{ color: t.subtextHex }}>kcal</span>
                </div>
              </div>
            )}
          </div>

          <div className="border p-6 rounded-2xl"
            style={{ backgroundColor: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.2)' }}>
            <div className="flex items-start gap-3">
              <Droplets className="text-blue-400 shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-blue-100 mb-1">Hydration Tip</h4>
                <p className="text-xs text-blue-200/70 leading-relaxed">
                  Drink 500ml of water before every meal to improve digestion and manage appetite.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MealModel isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={fetchMeals} />
    </div>
  );
};

export default Nutrition;