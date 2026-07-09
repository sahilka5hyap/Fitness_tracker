import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Plus, Trash2, Save, X, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react';


const STORAGE_KEY = 'myWorkoutPlans';

const CustomWorkoutPlan = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);
  const { t }    = useContext(ThemeContext);

  const [plans,       setPlans]       = useState([]);     // list of saved plans
  const [showForm,    setShowForm]    = useState(false);  // show create form
  const [openPlanId,  setOpenPlanId]  = useState(null);   // which plan is expanded

  // Form state for creating a new plan
  const [planName,    setPlanName]    = useState('');
  const [exercises,   setExercises]   = useState(['']);   // list of exercise inputs

  // Load saved plans from localStorage when opened
  useEffect(() => {
    if (!isOpen) return;
    const saved = localStorage.getItem(STORAGE_KEY + '_' + user?._id);
    if (saved) setPlans(JSON.parse(saved));
  }, [isOpen, user]);

  // Save all plans to localStorage
  const savePlans = (updatedPlans) => {
    setPlans(updatedPlans);
    localStorage.setItem(STORAGE_KEY + '_' + user?._id, JSON.stringify(updatedPlans));
  };

  // Add a new empty exercise input row
  const addExerciseRow = () => {
    setExercises([...exercises, '']);
  };

  // Update one exercise in the list
  const updateExercise = (index, value) => {
    const updated = [...exercises];
    updated[index] = value;
    setExercises(updated);
  };

  // Remove one exercise row
  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  // Save the new plan
  const handleSavePlan = () => {
    if (!planName.trim()) {
      alert('Please enter a plan name');
      return;
    }
    const filledExercises = exercises.filter(e => e.trim() !== '');
    if (filledExercises.length === 0) {
      alert('Please add at least one exercise');
      return;
    }

    const newPlan = {
      id:        Date.now().toString(),
      name:      planName.trim(),
      exercises: filledExercises,
      createdAt: new Date().toLocaleDateString(),
    };

    savePlans([...plans, newPlan]);

    // Reset form
    setPlanName('');
    setExercises(['']);
    setShowForm(false);
  };

  // Delete a plan
  const deletePlan = (planId) => {
    if (!window.confirm('Delete this plan?')) return;
    savePlans(plans.filter(p => p.id !== planId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="w-full max-w-lg rounded-2xl shadow-2xl border flex flex-col max-h-[90vh]"
        style={{ backgroundColor: t.card, borderColor: t.borderHex }}>

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b shrink-0"
          style={{ borderColor: t.borderHex }}>
          <div className="flex items-center gap-2">
            <Dumbbell size={22} className="text-[#D4FF33]" />
            <h2 className="font-bold text-lg" style={{ color: t.textHex }}>My Workout Plans</h2>
          </div>
          <button onClick={onClose} style={{ color: t.subtextHex }}>
            <X size={22} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1">

          {/* Create new plan button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full border-2 border-dashed rounded-xl py-4 flex items-center justify-center gap-2 font-bold mb-6 hover:border-[#D4FF33] hover:text-[#D4FF33] transition-colors"
              style={{ borderColor: t.borderHex, color: t.subtextHex }}
            >
              <Plus size={18} /> Create New Plan
            </button>
          )}

          {/* Create plan form */}
          {showForm && (
            <div className="border rounded-xl p-5 mb-6" style={{ backgroundColor: t.bg, borderColor: t.borderHex }}>
              <h3 className="font-bold mb-4" style={{ color: t.textHex }}>New Plan</h3>

              {/* Plan name */}
              <input
                type="text"
                placeholder="Plan name (e.g. Push Pull Legs)"
                className="w-full border rounded-xl p-3 mb-4 text-sm focus:border-[#D4FF33] focus:outline-none"
                style={{ backgroundColor: t.card, borderColor: t.borderHex, color: t.textHex }}
                value={planName}
                onChange={e => setPlanName(e.target.value)}
              />

              {/* Exercise list */}
              <p className="text-xs font-bold uppercase mb-2" style={{ color: t.subtextHex }}>
                Exercises
              </p>
              {exercises.map((ex, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder={`Exercise ${index + 1} (e.g. Bench Press)`}
                    className="flex-1 border rounded-xl p-3 text-sm focus:border-[#D4FF33] focus:outline-none"
                    style={{ backgroundColor: t.card, borderColor: t.borderHex, color: t.textHex }}
                    value={ex}
                    onChange={e => updateExercise(index, e.target.value)}
                  />
                  {exercises.length > 1 && (
                    <button
                      onClick={() => removeExercise(index)}
                      className="p-3 rounded-xl hover:text-red-500 transition"
                      style={{ backgroundColor: t.card, color: t.subtextHex }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}

              {/* Add exercise row button */}
              <button
                onClick={addExerciseRow}
                className="text-xs font-bold flex items-center gap-1 mt-2 mb-4 hover:text-[#D4FF33] transition"
                style={{ color: t.subtextHex }}
              >
                <Plus size={13} /> Add Exercise
              </button>

              {/* Save / Cancel */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowForm(false); setPlanName(''); setExercises(['']); }}
                  className="flex-1 py-3 rounded-xl border font-bold transition"
                  style={{ borderColor: t.borderHex, color: t.subtextHex }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePlan}
                  className="flex-1 py-3 rounded-xl bg-[#D4FF33] text-black font-bold flex items-center justify-center gap-2 hover:opacity-90 transition"
                >
                  <Save size={16} /> Save Plan
                </button>
              </div>
            </div>
          )}

          {/* Saved plans list */}
          {plans.length === 0 ? (
            <div className="text-center py-10" style={{ color: t.subtextHex }}>
              <Dumbbell size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No plans yet. Create your first one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map(plan => (
                <div key={plan.id} className="border rounded-xl overflow-hidden"
                  style={{ backgroundColor: t.bg, borderColor: t.borderHex }}>

                  {/* Plan header row */}
                  <div
                    className="flex justify-between items-center p-4 cursor-pointer hover:opacity-80 transition"
                    onClick={() => setOpenPlanId(openPlanId === plan.id ? null : plan.id)}
                  >
                    <div>
                      <p className="font-bold" style={{ color: t.textHex }}>{plan.name}</p>
                      <p className="text-xs" style={{ color: t.subtextHex }}>
                        {plan.exercises.length} exercises · Created {plan.createdAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); deletePlan(plan.id); }}
                        className="p-2 rounded-lg hover:text-red-500 transition"
                        style={{ color: t.subtextHex }}
                      >
                        <Trash2 size={14} />
                      </button>
                      {openPlanId === plan.id
                        ? <ChevronUp size={16} style={{ color: t.subtextHex }} />
                        : <ChevronDown size={16} style={{ color: t.subtextHex }} />
                      }
                    </div>
                  </div>

                  {/* Exercise list (shown when expanded) */}
                  {openPlanId === plan.id && (
                    <div className="px-4 pb-4 border-t" style={{ borderColor: t.borderHex }}>
                      <div className="pt-3 space-y-2">
                        {plan.exercises.map((ex, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-[#D4FF33] text-black text-xs font-bold flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-sm" style={{ color: t.textHex }}>{ex}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomWorkoutPlan;
