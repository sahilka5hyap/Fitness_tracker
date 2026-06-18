import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Plus, Scale, Percent, Activity, Calendar, TrendingUp, TrendingDown, Ruler, Dumbbell } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, YAxis, CartesianGrid } from 'recharts';
import BodyStatsModel from '../components/BodyStatsModel';

const BodyStats = () => {
  const { user } = useContext(AuthContext);
  const { t }    = useContext(ThemeContext);
  const [stats,       setStats]       = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading,     setLoading]     = useState(true);

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${user.token}` };
      const [statsRes, profileRes] = await Promise.all([
        fetch('https://fitness-tracker-4q8f.onrender.com/api/stats',         { headers }),
        fetch('https://fitness-tracker-4q8f.onrender.com/api/users/profile', { headers }),
      ]);
      const statsData   = await statsRes.json();
      const profileData = await profileRes.json();
      setStats(Array.isArray(statsData) ? [...statsData].sort((a, b) => new Date(b.date) - new Date(a.date)) : []);
      setUserProfile(profileData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

    useEffect(() => { if (user) fetchData(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  const current  = stats[0] || {};
  const previous = stats[1] || {};

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return { val: '--', status: '' };
    const h   = height / 100;
    const bmi = (weight / (h * h)).toFixed(1);
    let status = 'Normal';
    if (bmi < 18.5) status = 'Underweight';
    else if (bmi >= 25) status = 'Overweight';
    return { val: bmi, status };
  };

  const bmiData     = calculateBMI(current.weight, userProfile?.height);
  const weightChange = current.weight && previous.weight ? (current.weight - previous.weight).toFixed(1) : 0;

  const graphData = [...stats].reverse().map(s => ({
    date:    new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight:  s.weight,
    bodyFat: s.bodyFat,
  }));

  const MetricCard = ({ label, value, unit, icon: Icon, color, change, subtext }) => (
    <div className="border p-5 rounded-2xl flex flex-col justify-between min-h-[140px]"
      style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-lg bg-opacity-10 ${color}`}>
          <Icon size={20} className={color.replace('bg-', 'text-')} />
        </div>
        {change !== undefined && change !== 0 && (
          <div className={`flex items-center text-xs font-bold ${change < 0 ? 'text-[#D4FF33]' : 'text-red-500'}`}>
            {change < 0 ? <TrendingDown size={14} className="mr-1" /> : <TrendingUp size={14} className="mr-1" />}
            {Math.abs(change)}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs uppercase font-bold tracking-wider mb-1" style={{ color: t.subtextHex }}>{label}</p>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold" style={{ color: t.textHex }}>{value || '--'}</span>
          <span className="text-sm font-medium mb-1" style={{ color: t.subtextHex }}>{unit}</span>
        </div>
        {subtext && <p className="text-xs mt-1" style={{ color: t.subtextHex }}>{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="p-6 pb-24 min-h-screen" style={{ backgroundColor: t.bg }}>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: t.textHex }}>Body Composition</h1>
          <p style={{ color: t.subtextHex }}>Detailed biometrics and progress tracking</p>
        </div>
        <button onClick={() => setIsModalOpen(true)}
          className="bg-[#D4FF33] text-black font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition shadow-lg shadow-[#D4FF33]/20">
          <Plus size={20} /> Log New Entry
        </button>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Current Weight"  value={current.weight}     unit="kg"  icon={Scale}    color="bg-yellow-500 text-yellow-500" change={Number(weightChange)} />
        <MetricCard label="Body Mass Index" value={bmiData.val}        unit="BMI" icon={Activity}  color="bg-purple-500 text-purple-500" subtext={bmiData.status} />
        <MetricCard label="Body Fat"        value={current.bodyFat}    unit="%"   icon={Percent}  color="bg-blue-500 text-blue-500" />
        <MetricCard label="Muscle Mass"     value={current.muscleMass} unit="kg"  icon={Dumbbell} color="bg-red-500 text-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Weight Progress Graph */}
        <div className="lg:col-span-2 border p-6 rounded-2xl h-80 relative"
          style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-[#D4FF33]" />
              <h3 className="font-bold" style={{ color: t.textHex }}>Weight Progress</h3>
            </div>
          </div>
          {graphData.length === 0 ? (
            <div className="flex items-center justify-center h-48" style={{ color: t.subtextHex }}>
              No data yet. Log your first entry!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={graphData}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.borderHex} vertical={false} />
                <XAxis dataKey="date" stroke={t.subtextHex} fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke={t.subtextHex} fontSize={12} tickLine={false} axisLine={false} domain={['auto','auto']} dx={-10} />
                <Tooltip contentStyle={{ backgroundColor: t.card, borderColor: t.borderHex, color: t.textHex }} itemStyle={{ color: '#D4FF33' }} />
                <Line type="monotone" dataKey="weight" stroke="#D4FF33" strokeWidth={3}
                  dot={{ r: 4, fill: t.bg, stroke: '#D4FF33', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#D4FF33' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Measurements */}
        <div className="border p-6 rounded-2xl" style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
          <div className="flex items-center gap-2 mb-6">
            <Ruler size={20} className="text-blue-400" />
            <h3 className="font-bold" style={{ color: t.textHex }}>Measurements</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Waist', val: current.waist },
              { label: 'Chest', val: current.chest },
              { label: 'Arms',  val: current.arms },
              { label: 'Legs',  val: current.legs },
            ].map(m => (
              <div key={m.label} className="flex justify-between items-center border-b pb-3 last:border-0" style={{ borderColor: t.borderHex }}>
                <span className="text-sm" style={{ color: t.subtextHex }}>{m.label}</span>
                <span className="font-bold text-lg" style={{ color: t.textHex }}>
                  {m.val || '--'} <span className="text-xs" style={{ color: t.subtextHex }}>cm</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg" style={{ color: t.textHex }}>Detailed History</h3>
        {loading ? (
          <div className="text-center py-10" style={{ color: t.subtextHex }}>Loading...</div>
        ) : stats.length === 0 ? (
          <div className="text-center py-10" style={{ color: t.subtextHex }}>No entries yet. Log your first body stat!</div>
        ) : stats.map(item => (
          <div key={item._id} className="border p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:opacity-90 transition-colors"
            style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
            <div className="flex items-center gap-4 min-w-[150px]" style={{ color: t.subtextHex }}>
              <div className="p-2 rounded-lg text-[#D4FF33]" style={{ backgroundColor: t.bg }}>
                <Calendar size={18} />
              </div>
              <div>
                <span className="font-bold block" style={{ color: t.textHex }}>{new Date(item.date).toLocaleDateString()}</span>
                <span className="text-xs">{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
            <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="block text-xs uppercase" style={{ color: t.subtextHex }}>Weight</span>
                <span className="font-bold" style={{ color: t.textHex }}>{item.weight} kg</span>
              </div>
              <div>
                <span className="block text-xs uppercase" style={{ color: t.subtextHex }}>Body Fat</span>
                <span className="font-bold text-blue-400">{item.bodyFat ? item.bodyFat + '%' : '--'}</span>
              </div>
              <div>
                <span className="block text-xs uppercase" style={{ color: t.subtextHex }}>Muscle</span>
                <span className="font-bold" style={{ color: t.textHex }}>{item.muscleMass ? item.muscleMass + ' kg' : '--'}</span>
              </div>
              <div className="hidden md:block">
                {item.notes && <span className="text-xs italic truncate max-w-[150px] inline-block" style={{ color: t.subtextHex }} title={item.notes}>{item.notes}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <BodyStatsModel isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={fetchData} />
    </div>
  );
};

export default BodyStats;
