import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Activity } from 'lucide-react';
import PasswordInput from '../components/PasswordInput';

export default function Login({ setToken, setUserLevel }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, formData);
      if (res.data?.token) {
        setToken(res.data.token);
        if (res.data.user?.level) {
          localStorage.setItem('userLevel', res.data.user.level);
          if (setUserLevel) setUserLevel(res.data.user.level);
        }
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-screen bg-[#070d1a] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass-panel max-w-md w-full p-8 space-y-6 relative overflow-hidden z-10 border border-slate-700/80 bg-slate-900/80 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"></div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-xs text-slate-400">Sign in to BioVerse Interactive Anatomy</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-3 rounded-xl text-xs text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            required 
            type="email" 
            placeholder="Email Address" 
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500" 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
          />
          <PasswordInput 
            id="login-password"
            autoComplete="current-password"
            required 
            placeholder="Password" 
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500" 
            value={formData.password} 
            onChange={e => setFormData({...formData, password: e.target.value})} 
          />
          <button type="submit" className="w-full btn-primary py-3 rounded-xl text-sm font-bold shadow-lg shadow-cyan-950">
            Login
          </button>
        </form>

        <div className="space-y-2 pt-2 text-center text-xs text-slate-400">
          <p><Link to="/reset-password" className="text-cyan-400 hover:underline">Forgot your password?</Link></p>
          <p>Don't have an account? <Link to="/register" className="text-cyan-400 font-semibold hover:underline">Register here</Link></p>
        </div>
      </div>
    </div>
  );
}
