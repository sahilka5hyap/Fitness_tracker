import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import api from '../utils/api';
import { Ruler, Activity, ArrowRight, User } from 'lucide-react';

const Onboarding = () => {
  const { user, updateUser } = useContext(AuthContext);
  const { t }                = useContext(ThemeContext);
  const toast                = useToast();
  const navigate              = useNavigate();
  const [loading,  setLoading]  = useState(false);
  const [formData, setFormData] = useState({
    gender: 'Male', age: '', height: '', weight: '', fitnessGoal: 'General Health'
  });

  const goals = ['Weight Loss', 'Muscle Gain', 'General Health', 'Endurance'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.age || !formData.height || !formData.weight) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const data = await api.updateProfile(user.token, {
        gender:      formData.gender,
        age:         Number(formData.age),
        height:      Number(formData.height),
        weight:      Number(formData.weight),
        fitnessGoal: formData.fitnessGoal,
      });
      updateUser(data);
      toast.success('Profile set up! Welcome to FitAI 🎉');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full border rounded-xl p-4 focus:border-[#D4FF33] focus:outline-none transition-all`;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ backgroundColor: t.bg }}>

      {/* Background glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#D4FF33] rounded-full filter blur-[150px] opacity-5 pointer-events-none"></div>

      <div className="w-full max-w-2xl border rounded-3xl p-8 z-10 shadow-2xl"
        style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2" style={{ color: t.textHex }}>
            Let's customize your <span className="text-[#D4FF33]">Plan</span>
          </h1>
          <p style={{ color: t.subtextHex }}>Tell us about yourself so the AI can build your perfect routine.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Gender */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest mb-3 block" style={{ color: t.subtextHex }}>Gender</label>
            <div className="flex gap-4">
              {['Male','Female'].map(g => (
                <button key={g} type="button" onClick={() => setFormData({ ...formData, gender: g })}
                  className="flex-1 py-4 rounded-xl border-2 font-bold transition-all"
                  style={formData.gender === g
                    ? { borderColor: '#D4FF33', backgroundColor: 'rgba(212,255,51,0.1)', color: '#D4FF33' }
                    : { borderColor: t.borderHex, backgroundColor: t.bg, color: t.subtextHex }}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative group">
              <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: t.subtextHex }}>Age</label>
              <User className="absolute left-4 top-[38px]" size={18} style={{ color: t.subtextHex }} />
              <input type="number" required placeholder="21" className={`${inputCls} pl-12`}
                style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
            </div>
            <div className="relative group">
              <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: t.subtextHex }}>Height (cm)</label>
              <Ruler className="absolute left-4 top-[38px]" size={18} style={{ color: t.subtextHex }} />
              <input type="number" required placeholder="175" className={`${inputCls} pl-12`}
                style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} />
            </div>
            <div className="relative group">
              <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: t.subtextHex }}>Weight (kg)</label>
              <Activity className="absolute left-4 top-[38px]" size={18} style={{ color: t.subtextHex }} />
              <input type="number" required placeholder="70" className={`${inputCls} pl-12`}
                style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} />
            </div>
          </div>

          {/* Goals */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest mb-3 block" style={{ color: t.subtextHex }}>Primary Goal</label>
            <div className="grid grid-cols-2 gap-3">
              {goals.map(goal => (
                <button key={goal} type="button" onClick={() => setFormData({ ...formData, fitnessGoal: goal })}
                  className="p-4 rounded-xl text-left border transition-all"
                  style={formData.fitnessGoal === goal
                    ? { backgroundColor: '#ffffff', borderColor: '#ffffff', color: '#000000' }
                    : { backgroundColor: t.bg, borderColor: t.borderHex, color: t.subtextHex }}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm">{goal}</span>
                    {formData.fitnessGoal === goal && <Activity size={16} />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full bg-[#D4FF33] text-black font-black uppercase italic tracking-wider py-5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(212,255,51,0.2)] disabled:opacity-60">
            {loading ? 'Saving...' : <>{' '}Complete Profile <ArrowRight size={20} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
