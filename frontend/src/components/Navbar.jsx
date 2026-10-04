import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, LogOut, Flame, Award, BookOpen, Brain, Stethoscope, MessageSquare, Layers, TestTube2, Compass } from 'lucide-react';
import axios from 'axios';

export default function Navbar({ setToken, userLevel, setUserLevel }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [streak, setStreak] = useState(1);
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const fetchProgress = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/progress`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.success && res.data.data) {
          setStreak(res.data.data.currentStreak || 1);
          setCompletion(res.data.data.completionPercentage || 0);
        }
      } catch (err) {
        // Silent fallback for offline / mock mode
      }
    };
    fetchProgress();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (setToken) setToken('');
    navigate('/login');
  };

  const handleLevelChange = async (e) => {
    const newLevel = e.target.value;
    if (setUserLevel) setUserLevel(newLevel);
    localStorage.setItem('userLevel', newLevel);

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.put(`${import.meta.env.VITE_API_URL}/auth/level`, 
          { level: newLevel },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        // Saved locally regardless
      }
    }
  };

  const navLinks = [
    { label: 'Organs', path: '/dashboard', icon: Brain },
    { label: 'Diseases', path: '/diseases', icon: Stethoscope },
    { label: 'AI Tutor', path: '/chat', icon: MessageSquare },
    { label: 'Flashcards', path: '/flashcards', icon: Layers },
    { label: 'Virtual Labs', path: '/labs', icon: TestTube2 },
    { label: 'Roadmap', path: '/roadmaps', icon: Compass },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#070d1a]/80 backdrop-blur-xl border-b border-slate-800/80 px-4 md:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 text-cyan-400 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-wider text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-300">
              BioVerse
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 -mt-1">
              Interactive Anatomy
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Widgets */}
        <div className="flex items-center gap-2.5 md:gap-3 shrink-0">
          {/* Streak Badge */}
          <div 
            title={`${streak} Day Learning Streak`}
            className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-xl text-xs font-bold"
          >
            <Flame size={15} className="text-amber-400 animate-bounce" />
            <span>{streak}d</span>
          </div>

          {/* Mastery Badge */}
          <div 
            title={`${completion}% of core anatomical systems explored`}
            className="hidden sm:flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-3 py-1.5 rounded-xl text-xs font-bold"
          >
            <Award size={15} className="text-cyan-400" />
            <span>{completion}%</span>
          </div>

          {/* Learning Level Selector */}
          <div className="relative">
            <select
              value={userLevel || 'college'}
              onChange={handleLevelChange}
              className="bg-slate-900 border border-slate-700/80 text-cyan-300 text-xs font-semibold rounded-xl px-2.5 py-1.5 pr-6 cursor-pointer hover:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all appearance-none"
              title="Pedagogical Depth Level"
            >
              <option value="school">School Level</option>
              <option value="college">College Level</option>
              <option value="medical">Medical Level</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-cyan-400 text-[10px]">
              ▼
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Logout"
            className="flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-all"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
