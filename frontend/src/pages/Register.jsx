import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Activity } from 'lucide-react';
import PasswordInput from '../components/PasswordInput';

export default function Register({ setToken }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    level: 'college'
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        level: formData.level
      });
      if (res.data?.token) {
        setToken(res.data.token);
        localStorage.setItem('userLevel', formData.level);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-screen bg-[#070d1a] relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass-panel max-w-md w-full p-8 space-y-6 relative overflow-hidden z-10 border border-slate-700/80 bg-slate-900/80 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"></div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-xs text-slate-400">Join BioVerse Interactive Anatomy</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-3 rounded-xl text-xs text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <input 
            required 
            type="text" 
            placeholder="Full Name" 
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
          />
          <input 
            required 
            type="email" 
            placeholder="Email Address" 
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500" 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
          />
          <PasswordInput 
            id="register-password"
            required 
            placeholder="Password (min 6 characters)" 
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500" 
            value={formData.password} 
            onChange={e => setFormData({...formData, password: e.target.value})} 
          />
          <PasswordInput 
            id="register-confirm-password"
            required 
            placeholder="Confirm Password" 
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500" 
            value={formData.confirmPassword} 
            onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
          />

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Learning Level</label>
            <select
              value={formData.level}
              onChange={e => setFormData({...formData, level: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="school">School Level (Introductory / High School)</option>
              <option value="college">College Level (Undergraduate Biological Sciences)</option>
              <option value="medical">Medical Level (Clinical & Pathophysiology)</option>
            </select>
          </div>

          <button type="submit" className="w-full btn-primary py-3 rounded-xl text-sm font-bold shadow-lg shadow-cyan-950">
            Create Account
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account? <Link to="/login" className="text-cyan-400 font-semibold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
