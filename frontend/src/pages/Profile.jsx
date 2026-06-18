import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { User, Mail, Calendar, Ruler, Weight, Activity, LogOut, Save, ShieldCheck, Sun, Moon, Flame } from 'lucide-react';

const Profile = () => {
  const { user, logout }    = useContext(AuthContext);
  const { t, theme, changeTheme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState('');
  const [stats,   setStats]   = useState({ workouts: 0, calories: 0 });
  const [formData, setFormData] = useState({
    name: '', email: '', age: '', height: '', weight: '',
    fitnessGoal: 'General Health', gender: 'Not Specified', joinDate: ''
  });

  const calculateBMI = () => {
    if (formData.height && formData.weight) {
      const h = formData.height / 100;
      return (formData.weight / (h * h)).toFixed(1);
    }
    return '--';
  };
  const bmi = calculateBMI();

  const getBMICategory = (b) => {
    if (b === '--') return '';
    if (b < 18.5) return 'Underweight';
    if (b < 24.9) return 'Normal Weight';
    if (b < 29.9) return 'Overweight';
    return 'Obese';
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.token) return;
      try {
        const headers = { 'Authorization': `Bearer ${user.token}` };
        const [profileRes, workoutsRes, statsRes] = await Promise.all([
          fetch('https://fitness-tracker-4q8f.onrender.com/api/users/profile', { headers }),
          fetch('https://fitness-tracker-4q8f.onrender.com/api/workouts',      { headers }),
          fetch('https://fitness-tracker-4q8f.onrender.com/api/stats',         { headers }),
        ]);
        const profile   = await profileRes.json();
        const workouts  = await workoutsRes.json();
        const bodyStats = await statsRes.json();

        const totalCals    = Array.isArray(workouts)  ? workouts.reduce((a, c) => a + (c.caloriesBurned || 0), 0) : 0;
        const latestWeight = Array.isArray(bodyStats) && bodyStats.length > 0 ? bodyStats[0].weight : profile.weight;

        setStats({ workouts: Array.isArray(workouts) ? workouts.length : 0, calories: totalCals });
        setFormData({
          name:        profile.name        || '',
          email:       profile.email       || '',
          age:         profile.age         || '',
          height:      profile.height      || '',
          weight:      latestWeight        || '',
          fitnessGoal: profile.fitnessGoal || 'General Health',
          gender:      profile.gender      || 'Not Specified',
          joinDate:    profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''
        });
      } catch (error) { console.error('Error fetching profile', error); }
    };
    fetchData();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const response = await fetch('https://fitness-tracker-4q8f.onrender.com/api/users/profile', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body:    JSON.stringify({
          name:        formData.name,
          age:         Number(formData.age),
          height:      Number(formData.height),
          fitnessGoal: formData.fitnessGoal,
          gender:      formData.gender,
        }),
      });
      if (response.ok) {
        setMsg('✅ Profile updated successfully!');
        setTimeout(() => setMsg(''), 3000);
      } else {
        const err = await response.json();
        setMsg('❌ ' + (err.message || 'Update failed'));
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const inputCls = `w-full border rounded-xl p-3 focus:border-[#D4FF33] focus:outline-none transition-colors`;

  // Theme options
  const themeOptions = [
    { key: 'dark',  label: 'Dark',  icon: Moon,  desc: 'Classic dark mode' },
    { key: 'light', label: 'Light', icon: Sun,   desc: 'Clean light mode' },
    { key: 'warm',  label: 'Warm',  icon: Flame, desc: 'Eye-friendly warm' },
  ];

  return (
    <div className="min-h-screen p-6 pb-24" style={{ backgroundColor: t.bg }}>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: t.textHex }}>My Profile</h1>
          <p style={{ color: t.subtextHex }}>Manage your account settings</p>
        </div>
        <button onClick={logout}
          className="flex items-center gap-2 text-red-500 bg-red-500/10 px-4 py-2 rounded-lg hover:bg-red-500/20 transition text-sm font-bold">
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT: Identity + BMI + Theme */}
        <div className="space-y-6">

          {/* Identity Card */}
          <div className="p-6 rounded-2xl border flex flex-col items-center text-center"
            style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
            <div className="w-24 h-24 bg-[#D4FF33] rounded-full flex items-center justify-center text-black text-4xl font-bold mb-4 shadow-lg shadow-[#D4FF33]/20">
              {formData.name.charAt(0)?.toUpperCase() || '?'}
            </div>
            <h2 className="text-2xl font-bold" style={{ color: t.textHex }}>{formData.name}</h2>
            <p className="text-sm mb-4" style={{ color: t.subtextHex }}>{formData.email}</p>
            <div className="px-3 py-1 rounded-full text-xs flex items-center gap-2"
              style={{ backgroundColor: t.bg, color: t.subtextHex }}>
              <Calendar size={12} /> Member since {formData.joinDate}
            </div>
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 w-full mt-6">
              <div className="rounded-xl p-3 text-center" style={{ backgroundColor: t.bg }}>
                <div className="text-2xl font-bold text-[#D4FF33]">{stats.workouts}</div>
                <div className="text-xs" style={{ color: t.subtextHex }}>Workouts</div>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ backgroundColor: t.bg }}>
                <div className="text-2xl font-bold text-orange-500">{stats.calories}</div>
                <div className="text-xs" style={{ color: t.subtextHex }}>Cal Burned</div>
              </div>
            </div>
          </div>

          {/* BMI Card */}
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: t.textHex }}>
              <Activity size={18} className="text-[#D4FF33]" /> BMI Calculator
            </h3>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-4xl font-bold" style={{ color: t.textHex }}>{bmi}</span>
                <p className="text-sm mt-1" style={{ color: t.subtextHex }}>{getBMICategory(bmi)}</p>
              </div>
              <div className="text-right text-xs" style={{ color: t.subtextHex }}>
                {formData.height}cm & {formData.weight}kg
              </div>
            </div>
          </div>

          {/* 🎨 Theme Switcher */}
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
            <h3 className="font-bold mb-4" style={{ color: t.textHex }}>🎨 App Theme</h3>
            <div className="space-y-3">
              {themeOptions.map(({ key, label, icon: Icon, desc }) => (
                <button key={key} onClick={() => changeTheme(key)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    theme === key ? 'border-[#D4FF33] bg-[#D4FF33]/10' : ''
                  }`}
                  style={theme !== key ? { borderColor: t.borderHex, backgroundColor: t.bg } : {}}>
                  <div className={`p-2 rounded-lg ${theme === key ? 'bg-[#D4FF33] text-black' : ''}`}
                    style={theme !== key ? { backgroundColor: t.card, color: t.subtextHex } : {}}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-sm" style={{ color: theme === key ? '#D4FF33' : t.textHex }}>{label}</div>
                    <div className="text-xs" style={{ color: t.subtextHex }}>{desc}</div>
                  </div>
                  {theme === key && <div className="ml-auto w-2 h-2 rounded-full bg-[#D4FF33]"></div>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Edit Form */}
        <div className="lg:col-span-2">
          <div className="p-8 rounded-2xl border" style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: t.textHex }}>
              <ShieldCheck size={20} className="text-[#D4FF33]" /> Personal Details
            </h3>

            {msg && (
              <div className={`mb-6 p-3 rounded-lg text-sm text-center border ${msg.startsWith('✅') ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                {msg}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs mb-2 uppercase font-bold" style={{ color: t.subtextHex }}>Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-3.5" style={{ color: t.subtextHex }} />
                    <input type="text" className={`${inputCls} pl-10`}
                      style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                      value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-2 uppercase font-bold" style={{ color: t.subtextHex }}>Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-3.5" style={{ color: t.subtextHex }} />
                    <input type="email" disabled
                      className={`${inputCls} pl-10 opacity-50 cursor-not-allowed`}
                      style={{ backgroundColor: t.card, borderColor: t.borderHex, color: t.subtextHex }}
                      value={formData.email} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs mb-2 uppercase font-bold" style={{ color: t.subtextHex }}>Age</label>
                  <input type="number" className={inputCls}
                    style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                    value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs mb-2 uppercase font-bold" style={{ color: t.subtextHex }}>Height (cm)</label>
                  <div className="relative">
                    <Ruler size={16} className="absolute left-3 top-3.5" style={{ color: t.subtextHex }} />
                    <input type="number" className={`${inputCls} pl-9`}
                      style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                      value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-2 uppercase font-bold" style={{ color: t.subtextHex }}>Weight (kg)</label>
                  <div className="relative">
                    <Weight size={16} className="absolute left-3 top-3.5" style={{ color: t.subtextHex }} />
                    <input type="number" disabled title="Update this in Body Stats section"
                      className={`${inputCls} pl-9 opacity-50 cursor-not-allowed`}
                      style={{ backgroundColor: t.card, borderColor: t.borderHex, color: t.subtextHex }}
                      value={formData.weight} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs mb-2 uppercase font-bold" style={{ color: t.subtextHex }}>Primary Goal</label>
                  <select className={`${inputCls} appearance-none`}
                    style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                    value={formData.fitnessGoal} onChange={e => setFormData({ ...formData, fitnessGoal: e.target.value })}>
                    <option>General Health</option>
                    <option>Weight Loss</option>
                    <option>Muscle Gain</option>
                    <option>Endurance</option>
                    <option>Flexibility</option>
                    <option>Athletic Performance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-2 uppercase font-bold" style={{ color: t.subtextHex }}>Gender</label>
                  <select className={`${inputCls} appearance-none`}
                    style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                    value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                    <option>Not Specified</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={loading}
                  className="w-full bg-[#D4FF33] text-black font-bold py-4 rounded-xl hover:opacity-90 transition flex justify-center items-center gap-2">
                  {loading ? 'Saving...' : <><Save size={20} /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
