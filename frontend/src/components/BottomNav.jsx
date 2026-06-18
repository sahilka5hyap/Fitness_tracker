import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, Apple, Bot, User, Scale } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

const BottomNav = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { t }     = useContext(ThemeContext);

  const navItems = [
    { name: 'Home',     icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Workouts', icon: Dumbbell,         path: '/workouts' },
    { name: 'Nutrition',icon: Apple,            path: '/nutrition' },
    { name: 'Stats',    icon: Scale,            path: '/body-stats' },
    { name: 'AI Coach', icon: Bot,              path: '/ai-coach' },
    { name: 'Profile',  icon: User,             path: '/profile' },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe border-t"
      style={{ backgroundColor: t.navBgHex, borderColor: t.borderHex }}
    >
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex justify-between items-center md:justify-center md:gap-12">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center gap-1 transition-all duration-300 group"
              style={{ color: isActive ? t.accent : t.subtextHex }}
            >
              <div className={`p-1 rounded-xl transition-all`}
                style={{ backgroundColor: isActive ? t.accent + '22' : 'transparent' }}>
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium whitespace-nowrap">{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
