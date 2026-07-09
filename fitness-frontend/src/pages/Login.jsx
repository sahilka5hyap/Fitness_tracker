import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Activity, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login, sessionMessage, clearSessionMessage } = useContext(AuthContext);
  const { t }       = useContext(ThemeContext);
  const navigate    = useNavigate();
  const [formData,  setFormData] = useState({ email: '', password: '' });
  const [error,     setError]    = useState('');
  const [loading,   setLoading]  = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Show a one-time notice if the user landed here because their session expired
  useEffect(() => {
    if (sessionMessage) setError(sessionMessage);
    return () => clearSessionMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(formData.email, formData.password);
    setLoading(false);
    if (res.error) { setError(res.error); }
    else           { navigate('/dashboard'); }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: t.bg, color: t.textHex }}>

      {/* Left image (desktop only) */}
      <div className="hidden lg:flex w-1/2 relative bg-gray-900 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
        <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"
          alt="Gym" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="relative z-20 p-12 text-center">
          <Activity className="w-16 h-16 text-[#D4FF33] mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-4 text-white">Welcome Back</h1>
          <p className="text-xl text-gray-300">Track your progress, crush your goals.</p>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 lg:hidden bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')] bg-cover opacity-5 pointer-events-none"></div>

        <div className="w-full max-w-md z-10">
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-2 text-[#D4FF33]">Sign In</h2>
            <p style={{ color: t.subtextHex }}>Enter your details to access your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wide" style={{ color: t.subtextHex }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5" size={20} style={{ color: t.subtextHex }} />
                <input type="email"
                  className="w-full border pl-12 p-3 rounded-xl focus:border-[#D4FF33] focus:outline-none transition-colors"
                  style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                  placeholder="john@example.com"
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wide" style={{ color: t.subtextHex }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5" size={20} style={{ color: t.subtextHex }} />
                <input type={showPassword ? 'text' : 'password'}
                  className="w-full border pl-12 pr-12 p-3 rounded-xl focus:border-[#D4FF33] focus:outline-none transition-colors"
                  style={{ backgroundColor: t.input, borderColor: t.borderHex, color: t.textHex }}
                  placeholder="••••••••"
                  value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-4 top-3.5" style={{ color: t.subtextHex }}
                  tabIndex={-1} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#D4FF33] text-black font-bold py-4 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? 'Signing in...' : <>{' '}Sign In <ArrowRight size={20} /></>}
            </button>
          </form>

          <p className="mt-8 text-center" style={{ color: t.subtextHex }}>
            Don't have an account?{' '}
            <Link to="/register" className="text-white font-bold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
