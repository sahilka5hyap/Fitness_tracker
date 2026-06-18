import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useToast } from './Toast';
import { X, Dumbbell, Search } from 'lucide-react';
import { BASE_URL } from '../utils/api';

const WorkoutModel = ({ isOpen, onClose, onSave }) => {
  const { user }   = useContext(AuthContext);
  const { t }      = useContext(ThemeContext);
  const toast      = useToast();
  const [loading,  setLoading]  = useState(false);
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState([]);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    sets: '', reps: '', weight: '',
    duration: '', caloriesBurned: '', distance: '',
  });

  // Fetch suggestions — fires on open (empty query = full list) and on every keystroke
  useEffect(() => {
    if (!isOpen || !user?.token) return;
    const fetchExercises = async () => {
      try {
        const res  = await fetch(
          `${BASE_URL}/api/exercises/search?query=${encodeURIComponent(query)}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Exercise search error:', err);
      }
    };
    const timer = setTimeout(fetchExercises, query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [query, isOpen, user?.token]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelected(null);
      setResults([]);
      setFormData({
        title: '', date: new Date().toISOString().split('T')[0],
        sets: '', reps: '', weight: '', duration: '', caloriesBurned: '', distance: '',
      });
    }
  }, [isOpen]);

  const handleSelect = (ex) => {
    setSelected(ex);
    setFormData(prev => ({ ...prev, title: ex.name }));
    setQuery(ex.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalTitle = formData.title || query;
    if (!finalTitle.trim()) { toast.error('Please select or type an exercise name'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/workouts`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({
          title:          finalTitle,
          exerciseName:   selected?.name     || finalTitle,
          muscleGroup:    selected?.muscleGroup || 'Other',
          sets:           Number(formData.sets)           || 0,
          reps:           Number(formData.reps)           || 0,
          weight:         Number(formData.weight)         || 0,
          duration:       Number(formData.duration)       || 0,
          caloriesBurned: Number(formData.caloriesBurned) || 0,
          distance:       Number(formData.distance)       || 0,
          date:           formData.date,
        }),
      });
      if (res.ok) {
        onSave();
        onClose();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to log workout');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputCls = `w-full border rounded-lg p-3 focus:border-[#D4FF33] focus:outline-none text-sm transition-colors`;

  // Show dropdown only when not selected and results exist
  const showDropdown = !selected && results.length > 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh] border"
        style={{ backgroundColor: t.card, borderColor: t.borderHex }}>

        {/* Header */}
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: t.textHex }}>
            <Dumbbell className="text-[#D4FF33]" size={24} /> Log Workout
          </h2>
          <button onClick={onClose} style={{ color: t.subtextHex }}>
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="mb-4 shrink-0 relative">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3" style={{ color: t.subtextHex }} />
            <input
              type="text"
              placeholder="Search exercise (e.g. Bench Press, Squats)"
              className={`${inputCls} pl-10`}
              style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setSelected(null);
                setFormData(prev => ({ ...prev, title: e.target.value }));
              }}
              autoFocus
            />
          </div>

          {/* Suggestion chips */}
          {showDropdown && (
            <div className="mt-2">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2"
                style={{ color: t.subtextHex }}>
                {query ? `Results for "${query}"` : 'Popular Exercises'}
              </p>
              <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto">
                {results.map(ex => (
                  <button
                    key={ex._id}
                    onClick={() => handleSelect(ex)}
                    className="whitespace-nowrap border text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:bg-[#D4FF33] hover:text-black hover:border-[#D4FF33]"
                    style={{ backgroundColor: t.bg, borderColor: t.borderHex, color: t.subtextHex }}
                  >
                    {ex.name}
                    <span className="ml-1.5 opacity-50 text-[10px]">{ex.muscleGroup}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="overflow-y-auto pr-1">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Selected exercise badge */}
            {selected && (
              <div className="p-3 rounded-xl border flex justify-between items-center"
                style={{ backgroundColor: t.bg, borderColor: '#D4FF33' }}>
                <div>
                  <span className="text-xs font-bold uppercase text-[#D4FF33]">{selected.muscleGroup}</span>
                  <div className="font-bold text-sm mt-0.5" style={{ color: t.textHex }}>{selected.name}</div>
                  <span className="text-xs" style={{ color: t.subtextHex }}>{selected.equipment} · {selected.category}</span>
                </div>
                <button type="button" onClick={() => { setSelected(null); setQuery(''); setFormData(prev => ({ ...prev, title: '' })); }}
                  className="text-xs text-[#D4FF33] hover:underline">
                  Change
                </button>
              </div>
            )}

            {/* Strength fields */}
            <div className="grid grid-cols-3 gap-3">
              {[['sets','Sets'],['reps','Reps'],['weight','Weight (kg)']].map(([k, l]) => (
                <div key={k}>
                  <label className="text-xs mb-1 block" style={{ color: t.subtextHex }}>{l}</label>
                  <input type="number" min="0" className={inputCls}
                    style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                    value={formData[k]} onChange={e => setFormData(prev => ({ ...prev, [k]: e.target.value }))} />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[['duration','Duration (min)'],['caloriesBurned','Calories Burned']].map(([k, l]) => (
                <div key={k}>
                  <label className="text-xs mb-1 block" style={{ color: t.subtextHex }}>{l}</label>
                  <input type="number" min="0" className={inputCls}
                    style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                    value={formData[k]} onChange={e => setFormData(prev => ({ ...prev, [k]: e.target.value }))} />
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs mb-1 block" style={{ color: t.subtextHex }}>Date</label>
              <input type="date" className={inputCls}
                style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                value={formData.date} onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#D4FF33] text-black font-bold py-3.5 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-60">
              {loading
                ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Saving...</>
                : 'Log Workout'
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkoutModel;