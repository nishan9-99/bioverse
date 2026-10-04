import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Mic, Zap, Brain, Heart, Wind, Bone, Layers, Stethoscope, 
  MessageSquare, TestTube2, Compass, CheckCircle2, ChevronRight, Sparkles, Trophy, ArrowUpRight
} from 'lucide-react';
import axios from 'axios';

const ORGANS_CATALOG = [
  {
    slug: 'brain',
    name: 'Human Brain',
    system: 'Nervous System',
    icon: '🧠',
    color: '#D4956A',
    accentBg: 'from-amber-500/20 to-orange-500/10',
    borderColor: 'hover:border-amber-500/50',
    partsCount: 6,
    shortDesc: 'Master command center controlling conscious thought, memory, balance, and autonomic survival.'
  },
  {
    slug: 'heart',
    name: 'Human Heart',
    system: 'Cardiovascular System',
    icon: '🫀',
    color: '#E74C3C',
    accentBg: 'from-red-500/20 to-rose-500/10',
    borderColor: 'hover:border-red-500/50',
    partsCount: 6,
    shortDesc: 'Four-chambered muscular pump circulating 5 liters of oxygenated blood every minute.'
  },
  {
    slug: 'lungs',
    name: 'Human Lungs',
    system: 'Respiratory System',
    icon: '🫁',
    color: '#F06292',
    accentBg: 'from-pink-500/20 to-rose-500/10',
    borderColor: 'hover:border-pink-500/50',
    partsCount: 4,
    shortDesc: 'High-surface-area respiratory organs facilitating passive O2 and CO2 gas diffusion across alveoli.'
  },
  {
    slug: 'digestive-system',
    name: 'Digestive System',
    system: 'Digestive System',
    icon: '🌀',
    color: '#E67E22',
    accentBg: 'from-orange-500/20 to-amber-500/10',
    borderColor: 'hover:border-orange-500/50',
    partsCount: 7,
    shortDesc: 'A 30-foot biochemical processing tract that mechanically and enzymatically absorbs nutrients.'
  },
  {
    slug: 'kidney',
    name: 'Human Kidney',
    system: 'Urinary System',
    icon: '🫘',
    color: '#8E44AD',
    accentBg: 'from-purple-500/20 to-indigo-500/10',
    borderColor: 'hover:border-purple-500/50',
    partsCount: 5,
    shortDesc: 'Microscopic filtration powerhouse of 1 million nephrons regulating fluid, electrolytes, and waste.'
  },
  {
    slug: 'skeletal-system',
    name: 'Skeletal System',
    system: 'Skeletal System',
    icon: '🦴',
    color: '#F39C12',
    accentBg: 'from-yellow-500/20 to-amber-500/10',
    borderColor: 'hover:border-yellow-500/50',
    partsCount: 6,
    shortDesc: '206-bone architectural framework supporting muscles, protecting soft viscera, and housing marrow.'
  }
];

const SYSTEM_TABS = [
  'All Systems',
  'Nervous System',
  'Cardiovascular System',
  'Respiratory System',
  'Digestive System',
  'Urinary System',
  'Skeletal System'
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('All Systems');
  const [progress, setProgress] = useState({
    exploredOrgans: [],
    currentStreak: 1,
    totalQuizzesTaken: 0,
    completionPercentage: 0,
    badges: []
  });

  useEffect(() => {
    const fetchProgress = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/progress`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.success && res.data.data) {
          setProgress(res.data.data);
        }
      } catch (err) {
        // Fallback for offline usage
      }
    };
    fetchProgress();
  }, []);

  const handleSearch = async (e) => {
    e?.preventDefault();
    const searchQuery = query.trim();
    if (!searchQuery) return;
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/ai/search`, { query: searchQuery });
      if (res.data?.success && res.data.organSlug) {
        navigate(`/viewer/${res.data.organSlug}`);
      } else {
        alert("Couldn't find an organ matching that search. Try searching for 'brain', 'heart', 'filter blood', or 'breathing'!");
      }
    } catch (err) {
      console.error(err);
      // Fallback local search
      const qLower = searchQuery.toLowerCase();
      const match = ORGANS_CATALOG.find(o => 
        o.name.toLowerCase().includes(qLower) || 
        o.slug.includes(qLower) ||
        o.system.toLowerCase().includes(qLower)
      );
      if (match) {
        navigate(`/viewer/${match.slug}`);
      } else {
        alert("Search failed. Please try clicking an organ card directly.");
      }
    } finally {
      setLoading(false);
    }
  };

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Your browser does not support Voice Search. Please use Chrome or Edge.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };
    recognition.onerror = (event) => {
      console.error("Speech error", event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const filteredOrgans = activeTab === 'All Systems'
    ? ORGANS_CATALOG
    : ORGANS_CATALOG.filter(o => o.system === activeTab);

  return (
    <div className="min-h-screen bg-[#070d1a] text-slate-100 flex flex-col relative overflow-hidden pb-16">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10 z-10 w-full">
        {/* Hero Section */}
        <section className="text-center space-y-5 pt-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-1.5 text-xs font-bold text-cyan-400 backdrop-blur-md shadow-inner shadow-cyan-500/20">
            <Zap size={13} className="text-cyan-400 animate-pulse" />
            Next-Gen Interactive Human Anatomy Learning System
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Explore Human Anatomy <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
              in Interactive 2.5D & AI
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Deconstruct organs, inspect histological functions, explore pathology, and master human biology with AI-powered pedagogical explanations.
          </p>

          {/* AI Voice & Semantic Search Input */}
          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto pt-2">
            <div className="glass-panel p-1.5 flex items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/70 focus-within:border-cyan-500/70 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all shadow-xl shadow-cyan-950/30">
              <Search className="text-slate-400 ml-3 shrink-0" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask or search: 'filter blood', 'pumping oxygen', 'cerebrum'..."
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none px-2 py-2"
              />
              <button
                type="button"
                onClick={startVoiceSearch}
                className={`p-2.5 rounded-xl transition-all ${
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800'
                }`}
                title="Voice Search"
              >
                <Mic size={18} />
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-5 py-2.5 text-sm font-semibold rounded-xl shrink-0 flex items-center gap-1.5"
              >
                {loading ? 'Searching...' : 'Explore'}
              </button>
            </div>
          </form>
        </section>

        {/* Quick Stats Banner */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Brain size={24} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">{progress.exploredOrgans?.length || 0} / 6</div>
              <div className="text-xs font-semibold text-slate-400">Organs Explored</div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Zap size={24} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">{progress.currentStreak || 1} Days</div>
              <div className="text-xs font-semibold text-slate-400">Daily Streak</div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Trophy size={24} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">{progress.totalQuizzesTaken || 0}</div>
              <div className="text-xs font-semibold text-slate-400">Quizzes Completed</div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">{progress.completionPercentage || 0}%</div>
              <div className="text-xs font-semibold text-slate-400">Mastery Level</div>
            </div>
          </div>
        </section>

        {/* System Category Filter Tabs */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>Interactive Organ Models</span>
              <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-2.5 py-0.5">
                {filteredOrgans.length} Ready
              </span>
            </h2>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {SYSTEM_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/25'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Organs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOrgans.map((organ) => {
              const isExplored = (progress.exploredOrgans || []).includes(organ.slug);
              return (
                <div
                  key={organ.slug}
                  className={`glass-panel p-5 rounded-3xl border border-slate-800/80 bg-gradient-to-b ${organ.accentBg} ${organ.borderColor} transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between group shadow-lg hover:shadow-cyan-950/20`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="text-4xl p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-inner">
                        {organ.icon}
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        isExplored 
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                      }`}>
                        {isExplored ? '✓ Explored' : 'New'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {organ.name}
                      </h3>
                      <div className="text-xs font-semibold text-cyan-400 mb-2">
                        {organ.system} • {organ.partsCount} Interactive Parts
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                        {organ.shortDesc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => navigate(`/viewer/${organ.slug}`)}
                      className="btn-primary flex-1 py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <span>Launch Visualizer</span>
                      <ChevronRight size={15} />
                    </button>
                    <button
                      onClick={() => navigate(`/quiz/${organ.slug}`)}
                      className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all text-xs font-bold"
                      title="Take Quiz"
                    >
                      Quiz
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Feature Hubs Grid */}
        <section className="space-y-4 pt-4">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Integrated Learning Hubs
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Disease Explorer Card */}
            <div 
              onClick={() => navigate('/diseases')}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 bg-slate-900/40 hover:bg-slate-800/40 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-3 group-hover:scale-110 transition-transform">
                <Stethoscope size={24} />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                <span>Disease Explorer</span>
                <ArrowUpRight size={16} className="text-slate-500 group-hover:text-cyan-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Explore clinical pathologies, symptoms, causes, and diseased organ alterations.
              </p>
            </div>

            {/* AI Biology Tutor */}
            <div 
              onClick={() => navigate('/chat')}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 bg-slate-900/40 hover:bg-slate-800/40 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                <span>AI Biology Tutor</span>
                <ArrowUpRight size={16} className="text-slate-500 group-hover:text-cyan-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Ask any anatomical or physiological question with conversational AI guidance.
              </p>
            </div>

            {/* Spaced Repetition Flashcards */}
            <div 
              onClick={() => navigate('/flashcards')}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 bg-slate-900/40 hover:bg-slate-800/40 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
                <Layers size={24} />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                <span>Flashcard Arena</span>
                <ArrowUpRight size={16} className="text-slate-500 group-hover:text-cyan-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Master anatomical nomenclature and clinical facts with 3D spaced repetition cards.
              </p>
            </div>

            {/* Virtual Labs */}
            <div 
              onClick={() => navigate('/labs')}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 bg-slate-900/40 hover:bg-slate-800/40 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                <TestTube2 size={24} />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                <span>Virtual Biology Labs</span>
                <ArrowUpRight size={16} className="text-slate-500 group-hover:text-cyan-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Simulate Osmosis in cells, Cardiac Cycle hemodynamics, and Enzyme Denaturation.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
