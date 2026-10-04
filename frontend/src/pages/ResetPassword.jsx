import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Activity } from 'lucide-react';
import PasswordInput from '../components/PasswordInput';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', token: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tokenRequested, setTokenRequested] = useState(false);

  const requestToken = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, { email: formData.email });
      setMessage(res.data.message);
      setError('');
      setTokenRequested(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not request a reset token');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/auth/reset-password/${encodeURIComponent(formData.token)}`, {
        password: formData.newPassword
      });
      setMessage(res.data.message || "Password reset successful");
      setError('');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed");
      setMessage('');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-screen bg-[#070d1a] relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass-panel max-w-md w-full p-8 space-y-6 relative overflow-hidden z-10 border border-slate-700/80 bg-slate-900/80 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white">Reset Password</h2>
          <p className="text-xs text-slate-400">Request a reset token, then enter it with your new password</p>
        </div>
        
        {error && <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-3 rounded-xl text-xs text-center">{error}</div>}
        {message && <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 p-3 rounded-xl text-xs text-center">{message}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <input 
            required 
            type="email" 
            placeholder="Email Address" 
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500" 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
          />
          <button type="button" onClick={requestToken} className="w-full py-2 rounded-xl text-xs font-semibold border border-slate-700 text-cyan-400 hover:border-cyan-500">
            Request reset token
          </button>
          <input
            required
            type="text"
            placeholder="Reset token"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            value={formData.token}
            onChange={e => setFormData({...formData, token: e.target.value})}
          />
          <PasswordInput 
            id="reset-new-password"
            required 
            placeholder="New Password (min 6 chars)" 
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500" 
            value={formData.newPassword} 
            onChange={e => setFormData({...formData, newPassword: e.target.value})} 
          />
          <PasswordInput 
            id="reset-confirm-password"
            required 
            placeholder="Confirm New Password" 
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500" 
            value={formData.confirmPassword} 
            onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
          />
          <button type="submit" className="w-full btn-primary py-3 rounded-xl text-sm font-bold shadow-lg shadow-cyan-950">
            Reset Password
          </button>
        </form>
        
        <p className="text-center text-xs text-slate-400">
          Remembered your password? <Link to="/login" className="text-cyan-400 font-semibold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
