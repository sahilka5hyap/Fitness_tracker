import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useToast } from './Toast';
import { X, Flame, Search, Plus } from 'lucide-react';
import { BASE_URL } from '../utils/api';

const MealModel = ({ isOpen, onClose, onSave }) => {
  const { user }    = useContext(AuthContext);
  const { t }       = useContext(ThemeContext);
  const toast       = useToast();
  const [loading,   setLoading]  = useState(false);
  const [query,     setQuery]    = useState('');
  const [results,   setResults]  = useState([]);
  const [selected,  setSelected] = useState(null);
  const [quantity,  setQuantity] = useState(1);
  const [formData,  setFormData] = useState({
    mealType: 'Breakfast', foodName: '', calories: '', protein: '', carbs: '', fat: '',
  });

  // Fetch foods — fires on open (empty = popular list) and on every keystroke
  useEffect(() => {
    if (!isOpen || !user?.token) return;
    const fetchFoods = async () => {
      try {
        const res  = await fetch(
          `${BASE_URL}/api/foods/search?query=${encodeURIComponent(query)}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Food search error:', err);
      }
    };
    const timer = setTimeout(fetchFoods, query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [query, isOpen, user?.token]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelected(null);
      setResults([]);
      setQuantity(1);
      setFormData({ mealType: 'Breakfast', foodName: '', calories: '', protein: '', carbs: '', fat: '' });
    }
  }, [isOpen]);

  const handleSelectFood = (food) => {
    setSelected(food);
    setQuantity(1);
    setFormData(prev => ({
      ...prev,
      foodName: food.name,
      calories: food.calories,
      protein:  food.protein,
      carbs:    food.carbs,
      fat:      food.fat,
    }));
  };

  const handleQuantityChange = (e) => {
    const qty = parseFloat(e.target.value) || 0;
    setQuantity(qty);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        calories: Math.round(selected.calories * qty),
        protein:  parseFloat((selected.protein * qty).toFixed(1)),
        carbs:    parseFloat((selected.carbs    * qty).toFixed(1)),
        fat:      parseFloat((selected.fat      * qty).toFixed(1)),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.foodName || !formData.calories) {
      toast.error('Food name and calories are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/nutrition`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({
          mealType: formData.mealType,
          foodName: formData.foodName,
          calories: Number(formData.calories),
          protein:  Number(formData.protein) || 0,
          carbs:    Number(formData.carbs)   || 0,
          fat:      Number(formData.fat)     || 0,
        }),
      });
      if (res.ok) {
        onSave();
        onClose();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to log meal');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputCls = `w-full border rounded-lg p-3 focus:border-[#D4FF33] focus:outline-none text-sm transition-colors`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="w-full max-w-lg rounded-2xl p-6 shadow-2xl relative flex flex-col max-h-[90vh] border"
        style={{ backgroundColor: t.card, borderColor: t.borderHex }}>

        {/* Header */}
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: t.textHex }}>
            <Flame className="text-[#D4FF33]" size={24} /> Log Meal
          </h2>
          <button onClick={onClose} style={{ color: t.subtextHex }}>
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="mb-3 shrink-0">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3" style={{ color: t.subtextHex }} />
            <input
              type="text"
              placeholder="Search food (e.g. Rice, Chicken, Banana)"
              className={`${inputCls} pl-10`}
              style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(null); }}
              autoFocus
            />
          </div>

          {/* Food suggestions */}
          {!selected && results.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2"
                style={{ color: t.subtextHex }}>
                {query ? `Results for "${query}"` : 'Popular Foods'}
              </p>
              <div className="flex gap-2 flex-wrap max-h-28 overflow-y-auto">
                {results.map(food => (
                  <button
                    key={food._id}
                    onClick={() => handleSelectFood(food)}
                    className="flex-shrink-0 border text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:bg-[#D4FF33] hover:text-black hover:border-[#D4FF33] flex items-center gap-1"
                    style={{ backgroundColor: t.bg, borderColor: t.borderHex, color: t.subtextHex }}
                  >
                    <Plus size={10} />
                    {food.name}
                    <span className="opacity-50 text-[10px] ml-1">{food.calories}cal</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="overflow-y-auto pr-1">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Meal Type */}
            <div>
              <label className="text-xs font-bold uppercase block mb-2" style={{ color: t.subtextHex }}>Meal Type</label>
              <div className="flex gap-2">
                {['Breakfast','Lunch','Dinner','Snack'].map(type => (
                  <button type="button" key={type}
                    onClick={() => setFormData(prev => ({ ...prev, mealType: type }))}
                    className="flex-1 py-2 text-xs rounded-lg border transition-all font-bold"
                    style={formData.mealType === type
                      ? { backgroundColor: '#D4FF33', color: '#000', borderColor: '#D4FF33' }
                      : { backgroundColor: t.bg, borderColor: t.borderHex, color: t.subtextHex }}>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected food card */}
            {selected && (
              <div className="p-4 rounded-xl border flex items-center justify-between"
                style={{ backgroundColor: t.bg, borderColor: '#D4FF33' }}>
                <div>
                  <div className="font-bold text-sm" style={{ color: t.textHex }}>{selected.name}</div>
                  <span className="text-xs mt-0.5 block" style={{ color: t.subtextHex }}>
                    Serving: <span className="text-[#D4FF33]">{selected.servingSize}</span> ·
                    {selected.calories} cal · P:{selected.protein}g C:{selected.carbs}g F:{selected.fat}g
                  </span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 rounded-lg border ml-3"
                  style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
                  <span className="text-xs" style={{ color: t.subtextHex }}>×</span>
                  <input type="number" min="0.1" step="0.1"
                    className="w-12 bg-transparent font-bold text-center focus:outline-none text-sm"
                    style={{ color: t.textHex }}
                    value={quantity} onChange={handleQuantityChange} />
                </div>
              </div>
            )}

            {/* Manual food name (if nothing selected) */}
            {!selected && (
              <div>
                <label className="text-xs mb-1 block" style={{ color: t.subtextHex }}>Food Name</label>
                <input type="text" className={inputCls} required
                  style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                  placeholder="e.g. Homemade Dal"
                  value={formData.foodName}
                  onChange={e => setFormData(prev => ({ ...prev, foodName: e.target.value }))} />
              </div>
            )}

            {/* Macros */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block font-bold text-orange-400">Calories</label>
                <input type="number" min="0" className={`${inputCls} font-bold`} required
                  style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                  value={formData.calories}
                  onChange={e => setFormData(prev => ({ ...prev, calories: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs mb-1 block text-blue-400">Protein (g)</label>
                <input type="number" min="0" className={inputCls}
                  style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                  value={formData.protein}
                  onChange={e => setFormData(prev => ({ ...prev, protein: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs mb-1 block text-yellow-400">Carbs (g)</label>
                <input type="number" min="0" className={inputCls}
                  style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                  value={formData.carbs}
                  onChange={e => setFormData(prev => ({ ...prev, carbs: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs mb-1 block text-red-400">Fat (g)</label>
                <input type="number" min="0" className={inputCls}
                  style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                  value={formData.fat}
                  onChange={e => setFormData(prev => ({ ...prev, fat: e.target.value }))} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#D4FF33] text-black font-bold py-3.5 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-60">
              {loading
                ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Saving...</>
                : 'Save Meal Entry'
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MealModel;