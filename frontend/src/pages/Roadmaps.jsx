import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, Map, Clock, CheckCircle2, ChevronRight, 
  Award, Sparkles, BookOpen, Brain, Heart, TestTube2
} from 'lucide-react';

const ROADMAP_STAGES = [
  {
    step: "01",
    title: "Stage 1: Cellular & Tissue Foundations",
    subtitle: "Microscopic building blocks of multicellular life",
    topics: ["Cell Membrane & Organelles", "Active vs Passive Transport", "Four Primary Tissues (Epithelial, Connective, Muscle, Nervous)", "Extracellular Matrix"],
    actionSlug: "brain"
  },
  {
    step: "02",
    title: "Stage 2: Core Visceral Organ Systems",
    subtitle: "Macroscopic anatomy & physiology",
    topics: ["Central & Peripheral Nervous Systems", "Cardiovascular Double Circulation", "Pulmonary Alveolar Ventilation", "Gastrointestinal Absorption & Hepatic Metabolism", "Renal Nephron Ultrafiltration", "Axial & Appendicular Skeletal Leverage"],
    actionSlug: "heart"
  },
  {
    step: "03",
    title: "Stage 3: Systemic Homeostatic Regulation",
    subtitle: "Negative feedback loops & biochemical equilibrium",
    topics: ["Renin-Angiotensin-Aldosterone System (RAAS)", "Autonomic Baroreceptor Reflex", "Blood Gas & Arterial pH Acid-Base Buffering", "Calcium & Phosphate Mineral Remodeling"],
    actionSlug: "kidney"
  },
  {
    step: "04",
    title: "Stage 4: Clinical Pathophysiology & Diagnostics",
    subtitle: "Disease alterations & evidence-based pharmacology",
    topics: ["Ischemic Coronary Disease & ECG Interpretation", "Neurodegenerative Tauopathies & Synucleinopathies", "Obstructive vs Restrictive Pulmonary Disease", "Metabolic Decompensation & End-Stage Renal Disease"],
    actionSlug: "diseases"
  }
];

const DISCOVERY_TIMELINE = [
  {
    year: "1665",
    discoverer: "Robert Hooke",
    achievement: "First Observation of Cells",
    desc: "Observed microscopic box-like chambers in cork tissue using an early compound microscope and coined the biological term 'Cell'."
  },
  {
    year: "1674",
    discoverer: "Antonie van Leeuwenhoek",
    achievement: "Microscopic Microorganisms ('Animalcules')",
    desc: "Discovered living unicellular bacteria and protozoa in pond water and human plaque using handcrafted single-lens microscopes."
  },
  {
    year: "1859",
    discoverer: "Charles Darwin",
    achievement: "Theory of Natural Selection",
    desc: "Published 'On the Origin of Species', establishing natural selection as the unifying mechanism of evolutionary biological diversity."
  },
  {
    year: "1865",
    discoverer: "Gregor Mendel",
    achievement: "Fundamental Laws of Inheritance",
    desc: "Cross-bred Pisum sativum pea plants to deduce the principles of dominant and recessive alleles, founding modern genetics."
  },
  {
    year: "1928",
    discoverer: "Alexander Fleming",
    achievement: "Discovery of Penicillin",
    desc: "Observed that Penicillium notatum mold prevented staphylococcal bacterial colonies, ushering in the antibiotic medical era."
  },
  {
    year: "1953",
    discoverer: "Watson, Crick & Franklin",
    achievement: "DNA Double Helix Architecture",
    desc: "Decoded the antiparallel double-helix structure of DNA using Rosalind Franklin's historic X-ray diffraction Photo 51."
  },
  {
    year: "2003",
    discoverer: "Human Genome Project",
    achievement: "Complete Human Genome Mapped",
    desc: "International consortium successfully sequenced all 3.2 billion base pairs of the human euchromatic genome."
  },
  {
    year: "2012",
    discoverer: "Doudna & Charpentier",
    achievement: "CRISPR-Cas9 Gene Editing",
    desc: "Repurposed bacterial antiviral immune defenses into a revolutionary programmable molecular scalpel for precise gene editing."
  }
];

export default function Roadmaps() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('roadmap'); // 'roadmap' | 'timeline'

  return (
    <div className="min-h-screen bg-[#070d1a] text-slate-100 pb-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/3 w-[650px] h-[350px] bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 z-10 relative">
        {/* Header */}
        <section className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-3.5 py-1 text-xs font-bold text-cyan-400">
            <Compass size={14} className="text-cyan-400" />
            Curriculum & Discovery Timeline
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Learning Roadmaps & <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-300">
              Biology Discovery Timeline
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Follow a systematic pedagogical pathway from fundamental cytology to clinical medicine, or travel through 350+ years of breakthrough biological discoveries.
          </p>
        </section>

        {/* View Switcher Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'roadmap'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Map size={16} />
            <span>Anatomy Mastery Roadmap</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'timeline'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Clock size={16} />
            <span>Discovery Timeline (1665 - 2020s)</span>
          </button>
        </div>

        {/* Roadmap View */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6 pt-2">
            {ROADMAP_STAGES.map((stage, idx) => (
              <div 
                key={stage.step}
                className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/40 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-black text-xl shrink-0 shadow-inner">
                    {stage.step}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h3 className="text-lg font-bold text-white">{stage.title}</h3>
                      <p className="text-xs text-cyan-400 font-semibold">{stage.subtitle}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {stage.topics.map((t, i) => (
                        <span key={i} className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/60 px-2.5 py-1 rounded-lg">
                          • {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (stage.actionSlug === 'diseases') navigate('/diseases');
                    else navigate(`/viewer/${stage.actionSlug}`);
                  }}
                  className="btn-primary text-xs font-bold px-4 py-2.5 rounded-xl shrink-0 flex items-center gap-1.5 shadow"
                >
                  <span>Launch Study</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Timeline View */}
        {activeTab === 'timeline' && (
          <div className="relative border-l-2 border-slate-800 ml-4 pl-6 sm:pl-8 space-y-8 pt-4">
            {DISCOVERY_TIMELINE.map((item, idx) => (
              <div key={idx} className="relative group">
                {/* Node on vertical timeline line */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-cyan-400 group-hover:bg-cyan-400 transition-colors shadow-sm shadow-cyan-400/50" />

                <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/50 group-hover:border-cyan-500/30 transition-all space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-sm font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
                      {item.year}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {item.discoverer}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-200 transition-colors">
                    {item.achievement}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
