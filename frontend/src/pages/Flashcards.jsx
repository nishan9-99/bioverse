import React, { useState, useEffect } from 'react';
import { 
  Layers, RotateCw, CheckCircle2, XCircle, ChevronLeft, ChevronRight, 
  Sparkles, Shuffle, RefreshCw, Trophy, BookOpen
} from 'lucide-react';
import axios from 'axios';

const DEFAULT_DECKS = {
  brain: [
    { front: "What structure connects the left and right cerebral hemispheres?", back: "The Corpus Callosum — a broad band of nerve fibers facilitating interhemispheric communication." },
    { front: "Which brain lobe is primarily responsible for primary visual processing?", back: "The Occipital Lobe, situated at the posterior region of the cerebral cortex." },
    { front: "What is the primary function of the Hippocampus?", back: "Consolidation of information from short-term memory into long-term memory and spatial navigation." },
    { front: "Which cranial nerve provides extensive parasympathetic innervation to thoracic and abdominal organs?", back: "The Vagus Nerve (Cranial Nerve X)." },
    { front: "What glial cells produce the myelin sheath in the Central Nervous System?", back: "Oligodendrocytes (Schwann cells perform this function in the peripheral nervous system)." }
  ],
  heart: [
    { front: "Where does the electrical impulse originate in a normal sinus rhythm?", back: "The Sinoatrial (SA) Node located in the upper wall of the right atrium." },
    { front: "Which heart valve prevents backflow from the left ventricle into the left atrium?", back: "The Mitral (Bicuspid) Valve." },
    { front: "What blood vessels supply oxygen-rich blood directly to the heart myocardium?", back: "The Left and Right Coronary Arteries, branching directly from the base of the ascending aorta." },
    { front: "What is the definition of Cardiac Output (CO)?", back: "The volume of blood pumped by each ventricle per minute: CO = Heart Rate (HR) × Stroke Volume (SV)." },
    { front: "What causes the 'lub-dub' heart sounds heard with a stethoscope?", back: "'Lub' (S1) is closure of AV valves (mitral/tricuspid); 'Dub' (S2) is closure of semilunar valves (aortic/pulmonary)." }
  ],
  lungs: [
    { front: "What substance secreted by type II alveolar pneumocytes prevents alveolar collapse?", back: "Pulmonary Surfactant (primarily dipalmitoylphosphatidylcholine), which reduces alveolar surface tension." },
    { front: "What is the primary respiratory muscle responsible for quiet inhalation?", back: "The Diaphragm, which contracts and flattens downwards, expanding the vertical thoracic cavity dimension." },
    { front: "How is the vast majority (~70%) of Carbon Dioxide transported in the bloodstream?", back: "As Bicarbonate ions (HCO3-) dissolved in blood plasma after hydration by carbonic anhydrase." },
    { front: "What is Tidal Volume (TV) in a healthy resting adult?", back: "Approximately 500 mL — the volume of air displaced between normal inspiration and expiration." }
  ],
  'digestive-system': [
    { front: "Which stomach cells secrete Hydrochloric Acid (HCl) and Intrinsic Factor?", back: "Parietal (oxyntic) cells in the gastric mucosa." },
    { front: "What is the primary site of dietary lipid emulsification and absorption?", back: "The Duodenum (emulsification via bile) and Jejunum (absorption across enterocytes)." },
    { front: "What dual hormones regulate blood glucose from the pancreatic islets of Langerhans?", back: "Insulin (secreted by Beta cells to lower glucose) and Glucagon (secreted by Alpha cells to raise glucose)." },
    { front: "What anatomical sphincter separates the stomach from the duodenum?", back: "The Pyloric Sphincter." }
  ],
  kidney: [
    { front: "What is the basic functional filtering unit of the human kidney?", back: "The Nephron — each healthy kidney contains approximately 1 million nephrons." },
    { front: "Where in the nephron is 100% of filtered glucose reabsorbed under normal conditions?", back: "The Proximal Convoluted Tubule (PCT) via sodium-glucose cotransporters (SGLT2 and SGLT1)." },
    { front: "Which hormone increases water reabsorption in the collecting ducts?", back: "Antidiuretic Hormone (ADH / Vasopressin), which stimulates insertion of aquaporin-2 water channels." },
    { front: "What enzyme secreted by juxtaglomerular cells converts angiotensinogen to angiotensin I?", back: "Renin — the rate-limiting step of the RAAS pathway." }
  ],
  'skeletal-system': [
    { front: "What is the longest, heaviest, and strongest bone in the human body?", back: "The Femur (thigh bone)." },
    { front: "What two cell types dynamically remodel bone tissue throughout life?", back: "Osteoblasts (synthesize new bone matrix) and Osteoclasts (resorb mineralized bone tissue)." },
    { front: "How many vertebrae make up the normal human cervical spine?", back: "7 cervical vertebrae (C1 through C7), including C1 (Atlas) and C2 (Axis)." },
    { front: "What type of joint allows the greatest multi-axial range of motion (e.g. shoulder, hip)?", back: "Ball-and-Socket (enarthrodial / spheroidal) Synovial Joint." }
  ]
};

export default function Flashcards() {
  const [selectedOrgan, setSelectedOrgan] = useState('brain');
  const [cards, setCards] = useState(DEFAULT_DECKS.brain);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setCards(DEFAULT_DECKS[selectedOrgan] || DEFAULT_DECKS.brain);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredCards([]);
  }, [selectedOrgan]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const markMastered = () => {
    if (!masteredCards.includes(currentIndex)) {
      setMasteredCards([...masteredCards, currentIndex]);
    }
    handleNext();
  };

  const markReview = () => {
    setMasteredCards(masteredCards.filter((i) => i !== currentIndex));
    handleNext();
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const currentCard = cards[currentIndex] || cards[0];
  const isCurrentMastered = masteredCards.includes(currentIndex);

  return (
    <div className="min-h-screen bg-[#070d1a] text-slate-100 pb-20 relative overflow-hidden flex flex-col items-center">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 w-full pt-8 space-y-8 z-10">
        {/* Header */}
        <section className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-3.5 py-1 text-xs font-bold text-purple-400">
            <Layers size={14} className="text-purple-400" />
            Spaced Repetition Flashcard Arena
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Anatomical Recall Deck
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
            Test your active recall on physiological terms, cell types, vascular innervation, and clinical pearls. Click the card or press flip to reveal answers.
          </p>
        </section>

        {/* Organ Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 justify-center scrollbar-none">
          {[
            { slug: 'brain', label: '🧠 Brain' },
            { slug: 'heart', label: '🫀 Heart' },
            { slug: 'lungs', label: '🫁 Lungs' },
            { slug: 'digestive-system', label: '🌀 Digestive' },
            { slug: 'kidney', label: '🫘 Kidney' },
            { slug: 'skeletal-system', label: '🦴 Skeleton' }
          ].map((item) => (
            <button
              key={item.slug}
              onClick={() => setSelectedOrgan(item.slug)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                selectedOrgan === item.slug
                  ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-900/30'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Progress & Stats Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-2">
          <div>
            Card <span className="text-white font-bold">{currentIndex + 1}</span> of <span className="text-white font-bold">{cards.length}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 size={14} /> {masteredCards.length} Mastered
            </span>
            <button
              onClick={handleShuffle}
              className="flex items-center gap-1 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              title="Shuffle Deck"
            >
              <Shuffle size={14} /> Shuffle
            </button>
          </div>
        </div>

        {/* 3D Flip Card */}
        <div className="w-full max-w-xl mx-auto h-80 sm:h-96 [perspective:1000px] cursor-pointer" onClick={handleFlip}>
          <div
            className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform ${
              isFlipped ? '[transform:rotateY(180deg)]' : ''
            }`}
          >
            {/* Front Card Face */}
            <div className="absolute inset-0 w-full h-full glass-panel rounded-3xl p-8 flex flex-col justify-between border border-slate-700/80 bg-gradient-to-br from-slate-900 via-slate-900/90 to-purple-950/20 [backface-visibility:hidden] shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                  Question / Concept
                </span>
                {isCurrentMastered && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 size={13} /> Mastered
                  </span>
                )}
              </div>

              <div className="text-center my-auto px-4">
                <h3 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                  {currentCard.front}
                </h3>
              </div>

              <div className="flex items-center justify-center text-xs text-slate-500 gap-1.5">
                <RotateCw size={13} /> Click to flip & reveal answer
              </div>
            </div>

            {/* Back Card Face */}
            <div className="absolute inset-0 w-full h-full glass-panel rounded-3xl p-8 flex flex-col justify-between border border-purple-500/40 bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-900 [transform:rotateY(180deg)] [backface-visibility:hidden] shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                  Explanation / Answer
                </span>
                <span className="text-xs text-slate-500">
                  {selectedOrgan.replace(/-/g, ' ').toUpperCase()}
                </span>
              </div>

              <div className="text-center my-auto px-4">
                <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium">
                  {currentCard.back}
                </p>
              </div>

              <div className="flex items-center justify-center text-xs text-slate-500 gap-1.5">
                <RotateCw size={13} /> Click to return to question
              </div>
            </div>
          </div>
        </div>

        {/* Card Controls & Navigation */}
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3 pt-2">
          <button
            onClick={handlePrev}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            title="Previous Card"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={markReview}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-red-500/20 border border-slate-800 hover:border-red-500/30 text-xs font-bold text-slate-300 hover:text-red-400 transition-all flex items-center gap-1.5"
            >
              <XCircle size={15} /> Needs Review
            </button>

            <button
              onClick={markMastered}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-950/40"
            >
              <CheckCircle2 size={15} /> Mastered
            </button>
          </div>

          <button
            onClick={handleNext}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            title="Next Card"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </main>
    </div>
  );
}
