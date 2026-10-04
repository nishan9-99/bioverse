import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Viewer from './pages/Viewer';
import Quiz from './pages/Quiz';
import Diseases from './pages/Diseases';
import AiTutor from './pages/AiTutor';
import Flashcards from './pages/Flashcards';
import VirtualLab from './pages/VirtualLab';
import Roadmaps from './pages/Roadmaps';
import ResetPassword from './pages/ResetPassword';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userLevel, setUserLevel] = useState(localStorage.getItem('userLevel') || 'college');

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans bg-[#070d1a] text-slate-100">
        {token && (
          <Navbar 
            setToken={setToken} 
            userLevel={userLevel} 
            setUserLevel={setUserLevel} 
          />
        )}
        <div className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
            <Route path="/login" element={<Login setToken={setToken} setUserLevel={setUserLevel} />} />
            <Route path="/register" element={<Register setToken={setToken} />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={token ? <Dashboard setToken={setToken} /> : <Navigate to="/login" />} />
            <Route path="/viewer/:organSlug" element={token ? <Viewer token={token} /> : <Navigate to="/login" />} />
            <Route path="/quiz/:organSlug" element={token ? <Quiz /> : <Navigate to="/login" />} />
            <Route path="/diseases" element={token ? <Diseases /> : <Navigate to="/login" />} />
            <Route path="/chat" element={token ? <AiTutor /> : <Navigate to="/login" />} />
            <Route path="/flashcards" element={token ? <Flashcards /> : <Navigate to="/login" />} />
            <Route path="/labs" element={token ? <VirtualLab /> : <Navigate to="/login" />} />
            <Route path="/roadmaps" element={token ? <Roadmaps /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
