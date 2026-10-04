import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, Search, Filter, AlertCircle, ArrowRight, Activity, 
  ChevronRight, Pill, ShieldAlert, Sparkles, BookOpen
} from 'lucide-react';
import axios from 'axios';

const FALLBACK_DISEASES = [
  {
    slug: "alzheimers",
    name: "Alzheimer's Disease",
    affectedOrgans: ["brain"],
    category: "Neurological",
    shortDesc: "Progressive neurodegenerative disorder destroying memory, executive cognition, and independence.",
    symptoms: ["Memory loss", "Spatial disorientation", "Impaired executive function", "Aphasia (language struggle)"],
    causes: ["Extracellular beta-amyloid plaques", "Intracellular neurofibrillary tau tangles", "APOE-e4 alleles"],
    treatment: ["Cholinesterase inhibitors (Donepezil)", "NMDA receptor antagonists (Memantine)", "Cognitive stimulation"],
    stages: ["Preclinical", "Mild Cognitive Impairment", "Moderate Dementia", "Severe Dementia"],
    funFact: "Accounts for approximately 60% to 80% of all clinical dementia cases globally."
  },
  {
    slug: "parkinsons",
    name: "Parkinson's Disease",
    affectedOrgans: ["brain"],
    category: "Neurological",
    shortDesc: "Neurodegenerative movement disorder caused by progressive loss of dopamine neurons in the substantia nigra.",
    symptoms: ["Resting tremor (pill-rolling)", "Bradykinesia (slowness)", "Cogwheel muscular rigidity", "Postural instability"],
    causes: ["Degeneration of dopaminergic neurons in substantia nigra", "Lewy body alpha-synuclein protein aggregates"],
    treatment: ["Levodopa-Carbidopa", "Dopamine receptor agonists", "Deep Brain Stimulation (DBS) neurosurgery"],
    stages: ["Unilateral symptoms", "Bilateral posture changes", "Impaired gait balance", "Severe motor disability"],
    funFact: "First formally classified in 1817 as 'The Shaking Palsy' by British physician James Parkinson."
  },
  {
    slug: "heart-attack",
    name: "Myocardial Infarction (Heart Attack)",
    affectedOrgans: ["heart"],
    category: "Cardiovascular",
    shortDesc: "Ischemic necrosis of cardiac myocardium caused by sudden acute coronary arterial thrombosis.",
    symptoms: ["Crushing substernal chest pressure", "Radiation to left jaw/arm", "Diaphoresis (cold sweats)", "Severe dyspnea"],
    causes: ["Rupture of vulnerable coronary atherosclerotic plaque with occlusive thrombus formation"],
    treatment: ["Emergency PCI (angioplasty and stenting)", "Aspirin & antiplatelet therapy", "Beta-blockers, ACE inhibitors"],
    stages: ["Hyperacute ischemia", "Acute infarction necrosis", "Subacute healing", "Chronic fibrous remodeling"],
    funFact: "Administering emergency chewable aspirin within minutes can reduce acute mortality by up to 23%."
  },
  {
    slug: "asthma",
    name: "Bronchial Asthma",
    affectedOrgans: ["lungs"],
    category: "Respiratory",
    shortDesc: "Chronic inflammatory disorder characterized by bronchial hyper-responsiveness and reversible airflow obstruction.",
    symptoms: ["Expiratory wheezing", "Chest tightness", "Dyspnea upon exertion", "Nocturnal paroxysmal cough"],
    causes: ["Airway hyper-reactivity to allergens, viral respiratory infections, exercise, or cold air"],
    treatment: ["Inhaled short-acting beta-agonists (Albuterol)", "Inhaled corticosteroids", "Leukotriene modifiers"],
    stages: ["Intermittent", "Mild Persistent", "Moderate Persistent", "Severe Persistent"],
    funFact: "Affects over 260 million people globally, making it one of the most common chronic non-communicable diseases."
  },
  {
    slug: "diabetes",
    name: "Diabetes Mellitus",
    affectedOrgans: ["digestive-system", "kidney", "heart"],
    category: "Metabolic",
    shortDesc: "Metabolic disease marked by chronic hyperglycemia stemming from insulin deficiency or peripheral insulin resistance.",
    symptoms: ["Polyuria (frequent urination)", "Polydipsia (excessive thirst)", "Unexplained weight loss", "Fatigue"],
    causes: ["Type 1: Autoimmune beta-cell destruction. Type 2: Peripheral insulin resistance & secretory defect."],
    treatment: ["Subcutaneous insulin therapy", "Metformin (biguanide)", "SGLT2 inhibitors", "Carbohydrate dietary control"],
    stages: ["Prediabetes (impaired fasting glucose)", "Overt Diabetes", "Microvascular complications stage"],
    funFact: "Ancient Greek physicians diagnosed diabetes by tasting patient urine to detect sweet glucose presence."
  },
  {
    slug: "kidney-stones",
    name: "Nephrolithiasis (Kidney Stones)",
    affectedOrgans: ["kidney"],
    category: "Urinary",
    shortDesc: "Insoluble mineral crystalline aggregates forming in renal calyces that obstruct ureteral urine outflow.",
    symptoms: ["Excruciating unilateral flank pain radiating to groin", "Gross hematuria", "Nausea and diaphoresis"],
    causes: ["Supersaturation of urine with calcium oxalate, phosphate, or uric acid; chronic low fluid intake"],
    treatment: ["Aggressive intravenous hydration", "Alpha-blockers (Tamsulosin)", "Shock Wave Lithotripsy (ESWL)"],
    stages: ["Nucleation", "Crystal growth", "Aggregation", "Pelvic / Ureteral obstruction"],
    funFact: "Archaeologists have identified kidney stones in Egyptian mummies dating back over 7,000 years."
  },
  {
    slug: "cirrhosis",
    name: "Hepatic Cirrhosis",
    affectedOrgans: ["digestive-system"],
    category: "Gastrointestinal",
    shortDesc: "End-stage hepatic fibrosis resulting in diffuse reorganization of normal liver parenchyma into regenerative nodules.",
    symptoms: ["Jaundice (icterus)", "Ascites (abdominal swelling)", "Spider angiomas", "Hepatic encephalopathy"],
    causes: ["Chronic viral hepatitis B or C", "Alcohol-induced liver damage", "Non-alcoholic steatohepatitis (NASH)"],
    treatment: ["Etiological treatment", "Low-sodium diet with diuretics (Spironolactone)", "Liver transplantation"],
    stages: ["Compensated Cirrhosis", "Decompensated Cirrhosis (variceal bleeding or encephalopathy)"],
    funFact: "The liver is the only human internal organ capable of full structural regeneration if toxic insults cease early."
  },
  {
    slug: "osteoporosis",
    name: "Osteoporosis",
    affectedOrgans: ["skeletal-system"],
    category: "Musculoskeletal",
    shortDesc: "Systemic skeletal disease characterized by low bone mineral density and microarchitectural fragility.",
    symptoms: ["Asymptomatic until sudden fragility fracture", "Progressive loss of standing height", "Dorsal kyphosis"],
    causes: ["Osteoclastic bone resorption outpaces osteoblastic synthesis, accelerated by postmenopausal estrogen drops"],
    treatment: ["Bisphosphonates (Alendronate)", "Denosumab (RANKL monoclonal antibody)", "Calcium and Vitamin D3"],
    stages: ["Normal BMD", "Osteopenia (T-score -1.0 to -2.5)", "Osteoporosis (T-score <= -2.5)"],
    funFact: "Causes more than 8.9 million fragility fractures worldwide each year — an osteoporotic fracture every 3 seconds."
  }
];

const CATEGORIES = [
  'All Categories',
  'Neurological',
  'Cardiovascular',
  'Respiratory',
  'Metabolic',
  'Urinary',
  'Gastrointestinal',
  'Musculoskeletal'
];

export default function Diseases() {
  const navigate = useNavigate();
  const [diseases, setDiseases] = useState(FALLBACK_DISEASES);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedOrgan, setSelectedOrgan] = useState('all');
  const [expandedSlug, setExpandedSlug] = useState(null);

  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/diseases`);
        if (res.data?.success && res.data.data?.length > 0) {
          setDiseases(res.data.data);
        }
      } catch (err) {
        // Fallback already preloaded
      }
    };
    fetchDiseases();
  }, []);

  const filteredDiseases = diseases.filter((d) => {
    const matchesSearch = 
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.shortDesc.toLowerCase().includes(search.toLowerCase()) ||
      (d.symptoms || []).some(s => s.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = 
      selectedCategory === 'All Categories' || 
      d.category.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesOrgan = 
      selectedOrgan === 'all' || 
      (d.affectedOrgans || []).includes(selectedOrgan);

    return matchesSearch && matchesCategory && matchesOrgan;
  });

  return (
    <div className="min-h-screen bg-[#070d1a] text-slate-100 pb-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[400px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 z-10 relative">
        {/* Header */}
        <section className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-3.5 py-1 text-xs font-bold text-red-400">
            <Stethoscope size={14} className="text-red-400" />
            Clinical Pathology & Disease Explorer
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Human Diseases & <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-rose-300 to-amber-300">
              Affected Organ Alterations
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Investigate pathological mechanisms, clinical manifestations, etiology, and evidence-based therapeutic regimens. Connect any disease directly to its affected anatomical organ in the visualizer.
          </p>
        </section>

        {/* Search & Filter Controls */}
        <section className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search disease name, symptoms (e.g. 'tremor', 'chest pressure')..."
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500/60"
              />
            </div>

            {/* Organ Filter */}
            <div className="relative">
              <select
                value={selectedOrgan}
                onChange={(e) => setSelectedOrgan(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-red-500/60 cursor-pointer"
              >
                <option value="all">All Affected Organs</option>
                <option value="brain">Brain (Nervous)</option>
                <option value="heart">Heart (Cardiovascular)</option>
                <option value="lungs">Lungs (Respiratory)</option>
                <option value="digestive-system">Digestive System</option>
                <option value="kidney">Kidney (Urinary)</option>
                <option value="skeletal-system">Skeletal System</option>
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-red-500 text-white font-bold shadow-md shadow-red-500/25'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Diseases Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredDiseases.map((disease) => {
            const isExpanded = expandedSlug === disease.slug;
            return (
              <div
                key={disease.slug}
                className="glass-panel p-6 rounded-3xl border border-slate-800/80 bg-slate-900/50 hover:border-red-500/40 transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Header info */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                        {disease.category}
                      </span>
                      <h3 className="text-xl font-bold text-white">{disease.name}</h3>
                    </div>

                    {/* Affected Organs Button */}
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {disease.affectedOrgans.map((organ) => (
                        <button
                          key={organ}
                          onClick={() => navigate(`/viewer/${organ}`)}
                          className="bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                          title={`Inspect ${organ} in 2.5D visualizer`}
                        >
                          <span className="capitalize">{organ.replace(/-/g, ' ')}</span>
                          <ArrowRight size={12} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    {disease.shortDesc}
                  </p>

                  {/* Symptoms Tags */}
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Key Clinical Symptoms</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {disease.symptoms.map((symptom, i) => (
                        <span key={i} className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/60 px-2.5 py-1 rounded-lg">
                          • {symptom}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Expandable Clinical Details */}
                  {isExpanded && (
                    <div className="space-y-4 pt-3 border-t border-slate-800/80 animate-fade-in-up">
                      {/* Etiology / Causes */}
                      <div>
                        <h4 className="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <AlertCircle size={13} /> Pathophysiological Causes
                        </h4>
                        <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1">
                          {disease.causes.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>

                      {/* Treatments */}
                      <div>
                        <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Pill size={13} /> Clinical Treatments & Management
                        </h4>
                        <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1">
                          {disease.treatment.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                      </div>

                      {/* Clinical Stages */}
                      {disease.stages && (
                        <div>
                          <h4 className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1.5">Disease Progression Stages</h4>
                          <div className="flex flex-wrap gap-1">
                            {disease.stages.map((stg, i) => (
                              <span key={i} className="text-[11px] bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 px-2 py-0.5 rounded">
                                {i + 1}. {stg}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Fun fact */}
                      {disease.funFact && (
                        <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40 text-xs text-slate-400 italic">
                          💡 {disease.funFact}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Expand / Collapse */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedSlug(isExpanded ? null : disease.slug)}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {isExpanded ? '▲ Hide Clinical Details' : '▼ View Causes, Stages & Treatments'}
                  </button>

                  <button
                    onClick={() => navigate(`/viewer/${disease.affectedOrgans[0]}`)}
                    className="btn-primary text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                  >
                    <span>View Organ</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
