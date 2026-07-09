import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { X, Activity, Ruler, FileText, Save } from 'lucide-react';
import { BASE_URL } from '../utils/api';

const BodyStatsModel = ({ isOpen, onClose, onSave }) => {
  const { user } = useContext(AuthContext);
  const { t }    = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '', bodyFat: '', muscleMass: '',
    waist: '', chest: '', arms: '', legs: '',
    steps: '', sleep: '', water: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate at least one stat
    if (!formData.weight && !formData.bodyFat && !formData.steps) {
      alert('Please provide at least one stat (weight, body fat, or steps)');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/stats`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body:    JSON.stringify({
          date:       formData.date,
          weight:     Number(formData.weight)     || undefined,
          bodyFat:    Number(formData.bodyFat)    || undefined,
          muscleMass: Number(formData.muscleMass) || undefined,
          waist:      Number(formData.waist)      || undefined,
          chest:      Number(formData.chest)      || undefined,
          arms:       Number(formData.arms)       || undefined,
          legs:       Number(formData.legs)       || undefined,
          steps:      Number(formData.steps)      || undefined,
          sleep:      Number(formData.sleep)      || undefined,
          water:      Number(formData.water)      || undefined,
          notes:      formData.notes,
        }),
      });
      if (res.ok) {
        onSave();
        onClose();
        setFormData({ date: new Date().toISOString().split('T')[0], weight: '', bodyFat: '', muscleMass: '', waist: '', chest: '', arms: '', legs: '', steps: '', sleep: '', water: '', notes: '' });
      } else {
        const err = await res.json();
        alert('Error: ' + err.message);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  const inputCls = `w-full border rounded-lg p-2.5 text-sm focus:border-[#D4FF33] focus:outline-none transition-colors`;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative my-8 border"
        style={{ backgroundColor: t.card, borderColor: t.borderHex }}>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: t.textHex }}>
            <Activity className="text-[#D4FF33]" size={24} /> Log Body Stats
          </h2>
          <button onClick={onClose} className="p-2 rounded-full transition hover:opacity-70" style={{ color: t.subtextHex }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Core Metrics */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: t.subtextHex }}>Core Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs mb-1 block" style={{ color: t.subtextHex }}>Date</label>
                <input type="date" className={inputCls}
                  style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                  value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: t.subtextHex }}>Weight (kg)</label>
                <input type="number" step="0.1" className={inputCls}
                  style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                  value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: t.subtextHex }}>Body Fat (%)</label>
                <input type="number" step="0.1" className={inputCls}
                  style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                  value={formData.bodyFat} onChange={e => setFormData({ ...formData, bodyFat: e.target.value })} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: t.subtextHex }}>Muscle Mass (kg)</label>
                <input type="number" step="0.1" className={inputCls}
                  style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                  value={formData.muscleMass} onChange={e => setFormData({ ...formData, muscleMass: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Daily Tracking */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: t.subtextHex }}>Daily Tracking</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs mb-1 block" style={{ color: t.subtextHex }}>Steps</label>
                <input type="number" className={inputCls}
                  style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                  value={formData.steps} onChange={e => setFormData({ ...formData, steps: e.target.value })} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: t.subtextHex }}>Sleep (hours)</label>
                <input type="number" step="0.5" className={inputCls}
                  style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                  value={formData.sleep} onChange={e => setFormData({ ...formData, sleep: e.target.value })} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: t.subtextHex }}>Water (liters)</label>
                <input type="number" step="0.25" className={inputCls}
                  style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                  value={formData.water} onChange={e => setFormData({ ...formData, water: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Measurements */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: t.subtextHex }}>
              <Ruler size={14} /> Measurements (cm)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[['waist','Waist'],['chest','Chest'],['arms','Arms'],['legs','Legs']].map(([k,l]) => (
                <div key={k}>
                  <label className="text-xs mb-1 block" style={{ color: t.subtextHex }}>{l}</label>
                  <input type="number" className={inputCls}
                    style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                    value={formData[k]} onChange={e => setFormData({ ...formData, [k]: e.target.value })} />
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: t.subtextHex }}>
              <FileText size={14} /> Notes
            </h3>
            <textarea
              className={`${inputCls} resize-none h-24`}
              style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
              placeholder="How are you feeling? Any progress photos taken?"
              value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
          </div>

          <button disabled={loading} type="submit"
            className="w-full bg-[#D4FF33] text-black font-bold py-4 rounded-xl hover:opacity-90 transition flex justify-center items-center gap-2">
            {loading ? 'Saving...' : <><Save size={20} /> Save Entry</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BodyStatsModel;
