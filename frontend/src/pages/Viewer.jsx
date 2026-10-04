import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, CheckCircle2, Brain, HelpCircle, Volume2, Sparkles, 
  Stethoscope, Layers, ChevronRight, X, AlertTriangle, Lightbulb, Compass
} from 'lucide-react';
import InteractiveAnatomy from '../components/InteractiveAnatomy';

// Fallback catalog in case backend DB is still starting up
const FALLBACK_ORGANS = {
  brain: {
    name: "Human Brain",
    slug: "brain",
    system: "Nervous System",
    parts: [
      { name: "Cerebrum", biologicalTerm: "Telencephalon", location: "Upper region", description: "Largest part of brain responsible for reasoning, speech, memory, and voluntary movements.", functions: ["Thinking", "Memory", "Sensory processing"], additionalFacts: "Accounts for 85% of total brain weight." },
      { name: "Cerebellum", biologicalTerm: "Metencephalon", location: "Lower back", description: "Coordinates motor movements, balance, and fine motor skills.", functions: ["Balance", "Coordination", "Posture"], additionalFacts: "Contains over half the brain's total neurons." },
      { name: "Thalamus", biologicalTerm: "Diencephalon", location: "Deep central region", description: "Relays sensory signals between the brainstem and cerebral cortex.", functions: ["Sensory relay", "Sleep/wake regulation"], additionalFacts: "All senses except smell pass through here." },
      { name: "Hypothalamus", biologicalTerm: "Diencephalon", location: "Below thalamus", description: "Regulates body temperature, thirst, hunger, sleep, and endocrine hormones.", functions: ["Homeostasis", "Hormone control", "Circadian cycles"], additionalFacts: "Direct link between nervous and endocrine systems." },
      { name: "Brain Stem", biologicalTerm: "Truncus Encephali", location: "Base of brain", description: "Controls automatic life-support functions like breathing, blood pressure, and heart rate.", functions: ["Breathing", "Heart rate", "Autonomic control"], additionalFacts: "Damage to the brain stem is immediately life-threatening." },
      { name: "Pituitary Gland", biologicalTerm: "Hypophysis", location: "Base below hypothalamus", description: "Master endocrine gland controlling growth, metabolism, and reproductive organs.", functions: ["Hormone production", "Growth regulation"], additionalFacts: "Rests securely in the bony sella turcica." }
    ]
  },
  heart: {
    name: "Human Heart",
    slug: "heart",
    system: "Cardiovascular System",
    parts: [
      { name: "Left Atrium", biologicalTerm: "Atrium Sinistrum", location: "Upper left chamber", description: "Receives oxygenated blood returning from pulmonary veins.", functions: ["Receives oxygenated blood from lungs"], additionalFacts: "Pumps blood through mitral valve into left ventricle." },
      { name: "Right Atrium", biologicalTerm: "Atrium Dextrum", location: "Upper right chamber", description: "Receives deoxygenated blood returning from systemic body tissues.", functions: ["Receives venous blood from vena cava"], additionalFacts: "Houses the SA node (cardiac pacemaker)." },
      { name: "Left Ventricle", biologicalTerm: "Ventriculus Sinister", location: "Lower left chamber", description: "Thick-walled muscular chamber pumping oxygenated blood into systemic aorta.", functions: ["Pumps blood to the entire body"], additionalFacts: "Generates high pressure (120 mmHg systolic)." },
      { name: "Right Ventricle", biologicalTerm: "Ventriculus Dexter", location: "Lower right chamber", description: "Pumps deoxygenated blood into the pulmonary artery to reach the lungs.", functions: ["Pumps blood to lungs"], additionalFacts: "Operates under lower resistance than left ventricle." },
      { name: "Aorta", biologicalTerm: "Aorta", location: "Emerges from left ventricle", description: "Largest systemic artery in the body, branching to distribute oxygen-rich blood.", functions: ["Distributes systemic arterial blood"], additionalFacts: "Capable of expanding and recoiling with every heartbeat." },
      { name: "Pulmonary Artery", biologicalTerm: "Truncus Pulmonalis", location: "Emerges from right ventricle", description: "Vessel conveying deoxygenated blood away from the heart into both lungs.", functions: ["Transports blood to lungs"], additionalFacts: "The only artery carrying deoxygenated blood." }
    ]
  },
  lungs: {
    name: "Human Lungs",
    slug: "lungs",
    system: "Respiratory System",
    parts: [
      { name: "Trachea", biologicalTerm: "Trachea", location: "Neck down to upper chest", description: "Cartilaginous windpipe conducting air between larynx and pulmonary bronchi.", functions: ["Air conduction", "Air warming and filtering"], additionalFacts: "Kept open by C-shaped cartilage rings." },
      { name: "Bronchi", biologicalTerm: "Bronchus", location: "Upper lung hilum", description: "Primary bifurcations of the trachea directing air into left and right lungs.", functions: ["Conducts air into each lung lobe"], additionalFacts: "Right bronchus is wider and steeper than the left." },
      { name: "Bronchioles", biologicalTerm: "Bronchioli", location: "Throughout lung tissue", description: "Narrow branching microscopic tubes ending at the alveolar sacs.", functions: ["Air distribution", "Regulating airway resistance"], additionalFacts: "Constrict during asthma attacks due to smooth muscle spasm." },
      { name: "Alveoli", biologicalTerm: "Alveoli Pulmonis", location: "Microscopic terminals", description: "Microscopic air sacs where oxygen and carbon dioxide diffuse across capillary walls.", functions: ["Gas exchange (O2 and CO2)"], additionalFacts: "Total alveolar surface area equals a tennis court (~70-100 sqm)." }
    ]
  },
  'digestive-system': {
    name: "Digestive System",
    slug: "digestive-system",
    system: "Digestive System",
    parts: [
      { name: "Mouth", biologicalTerm: "Cavitas Oris", location: "Facial cavity", description: "Oral cavity where mechanical chewing and salivary enzymes initiate digestion.", functions: ["Ingestion", "Chewing", "Salivary starch breakdown"], additionalFacts: "Produces 1.5 liters of saliva daily." },
      { name: "Esophagus", biologicalTerm: "Oesophagus", location: "Throat to stomach", description: "Muscular peristaltic conduit propelling food smoothly to the stomach.", functions: ["Transports food by peristalsis"], additionalFacts: "Approximately 25 cm long." },
      { name: "Stomach", biologicalTerm: "Gaster", location: "Upper left abdomen", description: "Muscular bag churning food with hydrochloric acid and pepsin into chyme.", functions: ["Protein digestion", "Mechanical churning"], additionalFacts: "Gastric juice pH is 1.5 to 2.0." },
      { name: "Liver", biologicalTerm: "Hepar", location: "Upper right abdomen", description: "Chemical factory manufacturing bile, detoxifying xenobiotics, and storing energy.", functions: ["Bile production", "Detoxification", "Nutrient storage"], additionalFacts: "Largest internal organ; can regenerate naturally." },
      { name: "Pancreas", biologicalTerm: "Pancreas", location: "Behind stomach", description: "Gland producing essential digestive enzymes and regulating glucose via insulin.", functions: ["Enzyme synthesis", "Insulin and glucagon secretion"], additionalFacts: "Dual endocrine and exocrine functions." },
      { name: "Small Intestine", biologicalTerm: "Intestinum Tenue", location: "Central abdomen", description: "Primary site where 90% of nutrient and vitamin absorption occurs.", functions: ["Nutrient absorption", "Final enzymatic breakdown"], additionalFacts: "Over 6 meters (20 feet) long with microscopic villi." },
      { name: "Large Intestine", biologicalTerm: "Intestinum Crassum", location: "Perimeter of abdomen", description: "Reabsorbs water, compacts fecal matter, and houses the gut microbiome.", functions: ["Water absorption", "Waste compaction", "Vitamin synthesis"], additionalFacts: "Houses over 100 trillion symbiotic gut microbes." }
    ]
  },
  kidney: {
    name: "Human Kidney",
    slug: "kidney",
    system: "Urinary System",
    parts: [
      { name: "Cortex", biologicalTerm: "Cortex Renis", location: "Outer layer", description: "Outer renal layer containing glomeruli where blood filtration initiates.", functions: ["Ultrafiltration", "Erythropoietin synthesis"], additionalFacts: "Receives 90% of renal blood flow." },
      { name: "Medulla", biologicalTerm: "Medulla Renis", location: "Inner layer", description: "Inner layer of renal pyramids concentrating urine via osmotic gradients.", functions: ["Urine concentration", "Solute reabsorption"], additionalFacts: "Contains the Loops of Henle." },
      { name: "Nephron", biologicalTerm: "Nephronum", location: "Throughout cortex and medulla", description: "Microscopic functional unit filtering blood and producing urine.", functions: ["Filtration", "Reabsorption", "Secretion"], additionalFacts: "Each kidney houses about 1 million nephrons." },
      { name: "Renal Artery", biologicalTerm: "Arteria Renalis", location: "Branches from aorta", description: "Artery carrying high-pressure unfiltered systemic blood into the kidney.", functions: ["Supplies blood for purification"], additionalFacts: "Carries 20% to 25% of total cardiac output." },
      { name: "Renal Vein", biologicalTerm: "Vena Renalis", location: "Connects to vena cava", description: "Vein draining purified, waste-cleared blood back to the heart.", functions: ["Returns purified blood to circulation"], additionalFacts: "Has the lowest urea concentration in the entire body." }
    ]
  },
  'skeletal-system': {
    name: "Skeletal System",
    slug: "skeletal-system",
    system: "Skeletal System",
    parts: [
      { name: "Skull", biologicalTerm: "Cranium", location: "Head", description: "Bony protective vault enclosing the brain and framing facial features.", functions: ["Brain protection", "Sensory organ support"], additionalFacts: "Composed of 22 fused bones." },
      { name: "Spine", biologicalTerm: "Columna Vertebralis", location: "Midline back", description: "Flexible vertebral column protecting the spinal cord and carrying body weight.", functions: ["Axial support", "Spinal cord protection", "Trunk flexibility"], additionalFacts: "Composed of 33 vertebrae." },
      { name: "Rib Cage", biologicalTerm: "Cavea Thoracis", location: "Chest cavity", description: "Thoracic cage protecting the heart and lungs while expanding during breathing.", functions: ["Visceral protection", "Respiratory mechanics"], additionalFacts: "Composed of 12 pairs of ribs and the sternum." },
      { name: "Pelvis", biologicalTerm: "Pelvis", location: "Lower trunk", description: "Basin of fused bones transmitting torso weight to the lower limbs.", functions: ["Weight transfer", "Pelvic organ protection"], additionalFacts: "Displays distinct sexual dimorphism for childbirth." },
      { name: "Arm Bones", biologicalTerm: "Ossa Membri Superioris", location: "Upper extremities", description: "Humerus, radius, and ulna facilitating reaching, manipulation, and dexterity.", functions: ["Lifting and tool manipulation"], additionalFacts: "Shoulder joint has greatest range of motion in body." },
      { name: "Leg Bones", biologicalTerm: "Ossa Membri Inferioris", location: "Lower extremities", description: "Femur, tibia, and fibula supporting full body weight during bipedal locomotion.", functions: ["Weight bearing", "Locomotion and stability"], additionalFacts: "Femur is the longest and strongest bone in the body." }
    ]
  }
};

export default function Viewer() {
  const { organSlug } = useParams();
  const navigate = useNavigate();
  const [organData, setOrganData] = useState(null);
  const [activePart, setActivePart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiExplanation, setAiExplanation] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(localStorage.getItem('userLevel') || 'college');
  const [activeTab, setActiveTab] = useState('anatomy'); // 'anatomy' | 'ai' | 'diseases'

  // Handle URL alias rewrites
  useEffect(() => {
    if (organSlug === 'digestive') {
      navigate('/viewer/digestive-system', { replace: true });
    } else if (organSlug === 'skeletal') {
      navigate('/viewer/skeletal-system', { replace: true });
    }
  }, [organSlug, navigate]);

  // Fetch organ from API with fallback
  useEffect(() => {
    const fetchOrgan = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/organs/${organSlug}`);
        if (res.data?.success && res.data.data) {
          setOrganData(res.data.data);
          if (res.data.data.parts?.length > 0) {
            setActivePart(res.data.data.parts[0].name);
          }
        } else {
          loadFallback();
        }
      } catch (err) {
        loadFallback();
      } finally {
        setLoading(false);
      }
    };

    const loadFallback = () => {
      const fb = FALLBACK_ORGANS[organSlug];
      if (fb) {
        setOrganData(fb);
        setActivePart(fb.parts[0]?.name);
      }
    };

    fetchOrgan();

    // Mark organ as explored in user's profile
    const markExplored = async () => {
      const token = localStorage.getItem('token');
      if (token && organSlug) {
        try {
          await axios.post(`${import.meta.env.VITE_API_URL}/progress/explore/${organSlug}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (e) {
          // Non-blocking
        }
      }
    };
    markExplored();
  }, [organSlug]);

  const handlePronounce = () => {
    if (!activePartData) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = `${activePartData.name}. Biological term: ${activePartData.biologicalTerm || activePartData.name}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Your browser does not support pronunciation audio.");
    }
  };

  const handleAskAi = async () => {
    if (!activePartData) return;
    setActiveTab('ai');
    setLoadingAi(true);
    setAiExplanation('');

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/ai/explain`, {
        topic: `${organData.name} - ${activePartData.name}`,
        level: currentLevel,
        context: activePartData.description || ''
      });
      if (res.data?.success) {
        setAiExplanation(res.data.explanation);
      }
    } catch (err) {
      // Local fallback explanation
      setAiExplanation(`**${activePartData.name}** (${activePartData.biologicalTerm || 'Anatomical Structure'})\n\n` +
        `This structure is located at: **${activePartData.location}**.\n\n` +
        `### Core Physiological Role:\n${activePartData.description}\n\n` +
        `### Key Functions:\n` +
        activePartData.functions?.map(f => `- ${f}`).join('\n') +
        `\n\n*Pedagogical Level: ${currentLevel.toUpperCase()}*`
      );
    } finally {
      setLoadingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 min-h-screen">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!organData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 min-h-screen text-center">
        <h2 className="text-2xl font-bold mb-4 text-white">System/Organ Not Found</h2>
        <p className="text-slate-400 mb-6 max-w-md">We couldn't locate data for "{organSlug}". Return to the dashboard to select from our 6 core anatomical models.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary px-6 py-3 rounded-xl font-semibold">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const activePartData = activePart 
    ? organData.parts.find(p => p.name.toLowerCase() === activePart.toLowerCase()) 
    : null;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] overflow-hidden bg-slate-950">
      {/* Sub-Header Bar */}
      <header className="h-14 bg-slate-900/90 border-b border-slate-800 flex items-center px-4 md:px-6 justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white flex items-center gap-2">
              <Brain className="text-cyan-400" size={18} />
              {organData.name} Visualizer
            </span>
            <span className="hidden sm:inline text-xs font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
              {organData.system}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Level Switcher */}
          <select
            value={currentLevel}
            onChange={(e) => {
              setCurrentLevel(e.target.value);
              localStorage.setItem('userLevel', e.target.value);
              if (activeTab === 'ai') handleAskAi();
            }}
            className="bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-semibold rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none"
          >
            <option value="school">School</option>
            <option value="college">College</option>
            <option value="medical">Medical</option>
          </select>

          {/* Quick Quiz Button */}
          <button 
            onClick={() => navigate(`/quiz/${organSlug}`)} 
            className="btn-primary text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-cyan-950"
          >
            <HelpCircle size={15} />
            <span>Quiz</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Drawer: Anatomical Parts List */}
        <aside className="w-56 lg:w-64 bg-slate-900/60 border-r border-slate-800/80 p-3.5 overflow-y-auto shrink-0 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 px-1 flex items-center justify-between">
              <span>Anatomical Parts</span>
              <span className="text-cyan-400">{organData.parts.length}</span>
            </div>
            <ul className="space-y-1">
              {organData.parts.map(part => {
                const isSelected = activePart?.toLowerCase() === part.name.toLowerCase();
                return (
                  <li key={part.name}>
                    <button
                      onClick={() => {
                        setActivePart(part.name);
                        setActiveTab('anatomy');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                        isSelected 
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm' 
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                      }`}
                    >
                      <CheckCircle2 size={13} className={isSelected ? "text-cyan-400" : "text-slate-600 opacity-40"} />
                      <span className="truncate">{part.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Bottom Quick Card */}
          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 mt-4 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Compass size={13} className="text-cyan-400" />
              <span>Canvas Controls</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              • Drag to pan • Scroll to zoom • Tilt Y slider for 3D depth • Split/Assemble for exploded anatomy.
            </p>
          </div>
        </aside>

        {/* Center: 2.5D Interactive SVG Anatomy Engine */}
        <main className="flex-1 bg-gradient-to-b from-[#070d1a] to-slate-950 overflow-hidden flex flex-col justify-center relative">
          <InteractiveAnatomy 
            organSlug={organSlug} 
            activePart={activePart} 
            onPartSelect={(partName) => {
              setActivePart(partName);
              setActiveTab('anatomy');
            }} 
          />
        </main>

        {/* Right Drawer: Multi-Tab Anatomy, AI & Pathology Panel */}
        <aside className="w-80 lg:w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-hidden">
          {/* Panel Tab Navigation */}
          <div className="flex border-b border-slate-800 p-2 gap-1 bg-slate-900/80">
            <button
              onClick={() => setActiveTab('anatomy')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'anatomy' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Brain size={14} /> Anatomy
            </button>
            <button
              onClick={handleAskAi}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'ai' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles size={14} /> AI Explain
            </button>
            <button
              onClick={() => setActiveTab('diseases')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'diseases' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Stethoscope size={14} /> Pathology
            </button>
          </div>

          {/* Panel Content Body */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            {activeTab === 'anatomy' && activePartData && (
              <>
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-white leading-tight">{activePartData.name}</h2>
                  <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                    {organData.name} • {organData.system}
                  </p>
                </div>

                {/* Pronounce & AI Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={handlePronounce}
                    className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700/80 rounded-xl py-2.5 px-3 font-semibold text-xs transition-all shadow active:scale-95"
                  >
                    <Volume2 size={15} /> Pronounce
                  </button>
                  <button 
                    onClick={handleAskAi}
                    className="flex items-center justify-center gap-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl py-2.5 px-3 font-semibold text-xs transition-all shadow active:scale-95"
                  >
                    <Sparkles size={15} /> AI Breakdown
                  </button>
                </div>

                {/* Biological Term */}
                {activePartData.biologicalTerm && (
                  <div className="space-y-1 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Scientific / Latin Term</h3>
                    <p className="text-cyan-200 text-sm font-semibold italic">{activePartData.biologicalTerm}</p>
                  </div>
                )}

                {/* Description */}
                {activePartData.description && (
                  <div className="space-y-1">
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Histological Description</h3>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{activePartData.description}</p>
                  </div>
                )}

                {/* Location */}
                <div className="space-y-1">
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Anatomical Location</h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{activePartData.location}</p>
                </div>

                {/* Functions */}
                {activePartData.functions && (
                  <div className="space-y-2">
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Physiological Functions</h3>
                    <ul className="space-y-1.5 list-none pl-0">
                      {activePartData.functions.map((fn, i) => (
                        <li key={i} className="text-slate-300 text-xs sm:text-sm flex items-start gap-2">
                          <span className="text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
                          <span>{fn}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Additional Facts */}
                {activePartData.additionalFacts && (
                  <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50 mt-2 space-y-1">
                    <h3 className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                      <Lightbulb size={13} /> High-Yield Fact
                    </h3>
                    <p className="text-slate-300 text-xs leading-relaxed italic">{activePartData.additionalFacts}</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                      <Sparkles size={16} />
                    </div>
                    <span className="text-sm font-bold text-white">AI Pedagogical Analysis</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                    {currentLevel} Mode
                  </span>
                </div>

                {loadingAi ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-400 font-medium animate-pulse">Generating pedagogical synthesis...</p>
                  </div>
                ) : (
                  <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs leading-relaxed text-slate-300">
                    <div className="whitespace-pre-line prose prose-invert prose-sm">
                      {aiExplanation}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'diseases' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope size={18} className="text-red-400" />
                  <h3 className="text-sm font-bold text-white">Clinical Pathologies</h3>
                </div>

                <div className="space-y-3">
                  {(organData.clinicalDiseases || []).length > 0 ? (
                    organData.clinicalDiseases.map((d) => (
                      <div 
                        key={d.slug}
                        onClick={() => navigate('/diseases')}
                        className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-red-500/40 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-white group-hover:text-red-300 transition-colors">
                            {d.name}
                          </span>
                          <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                            {d.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">{d.shortDesc}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 text-center space-y-3">
                      <p className="text-xs text-slate-400">
                        Explore full pathology, clinical stages, and treatment regimens in our Disease Explorer.
                      </p>
                      <button
                        onClick={() => navigate('/diseases')}
                        className="btn-primary w-full py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1"
                      >
                        <span>Open Disease Explorer</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
