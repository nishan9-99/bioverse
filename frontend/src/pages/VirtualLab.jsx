import React, { useState } from 'react';
import { 
  TestTube2, Activity, Flame, Droplets, Zap, Info, 
  RotateCcw, Sliders, CheckCircle2, AlertTriangle, ArrowRight
} from 'lucide-react';

export default function VirtualLab() {
  const [activeLab, setActiveLab] = useState('osmosis'); // 'osmosis' | 'cardiac' | 'enzyme'

  // Lab 1: Osmosis State
  const [osmolarity, setOsmolarity] = useState(300); // 100 to 600 mOsm/L

  // Lab 2: Cardiac Hemodynamics State
  const [heartRate, setHeartRate] = useState(72); // 40 to 180 BPM
  const [strokeVolume, setStrokeVolume] = useState(70); // 40 to 120 mL

  // Lab 3: Enzyme State
  const [temperature, setTemperature] = useState(37); // 0 to 90 °C
  const [ph, setPh] = useState(7.4); // 1 to 14

  // Osmosis calculations
  const getOsmosisState = () => {
    if (osmolarity < 200) return { type: 'Hypotonic', desc: 'Hypotonic Solution — Net influx of water into erythrocyte. Swelling, risk of lysis.', cellScale: 1.35, crenated: false, lysed: osmolarity < 140 };
    if (osmolarity > 380) return { type: 'Hypertonic', desc: 'Hypertonic Solution — Net efflux of water out of erythrocyte. Cell undergoes crenation (shriveling).', cellScale: 0.72, crenated: true, lysed: false };
    return { type: 'Isotonic', desc: 'Isotonic (Equilibrium ~290-310 mOsm/L) — Dynamic balance of water flux. Normal biconcave erythrocyte morphology.', cellScale: 1.0, crenated: false, lysed: false };
  };

  // Cardiac calculations
  const cardiacOutput = ((heartRate * strokeVolume) / 1000).toFixed(2); // L/min
  const estSystolic = Math.round(100 + (heartRate * 0.15) + (strokeVolume * 0.2));
  const estDiastolic = Math.round(65 + (heartRate * 0.1));
  const estMap = Math.round(estDiastolic + (estSystolic - estDiastolic) / 3);

  // Enzyme calculations
  // Optimum: T = 37°C, pH = 7.4
  const tempFactor = Math.max(0, 1 - Math.pow(temperature - 37, 2) / 600);
  const phFactor = Math.max(0, 1 - Math.pow(ph - 7.4, 2) / 16);
  const reactionRate = Math.round(tempFactor * phFactor * 100);
  const isDenatured = temperature > 55 || ph < 3.5 || ph > 11.5;

  const osmosisState = getOsmosisState();

  return (
    <div className="min-h-screen bg-[#070d1a] text-slate-100 pb-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 right-1/4 w-[700px] h-[400px] bg-emerald-600/10 rounded-full blur-[160px] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 z-10 relative">
        {/* Header */}
        <section className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3.5 py-1 text-xs font-bold text-emerald-400">
            <TestTube2 size={14} className="text-emerald-400" />
            Interactive Biology Simulations
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Virtual Physiology & <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
              Biophysical Lab Simulations
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Manipulate physiological variables in real-time. Observe erythrocyte osmolar dynamics, cardiac cycle outputs, and enzyme catalytic denaturation.
          </p>
        </section>

        {/* Lab Switcher Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
          {[
            { id: 'osmosis', label: '🔬 Lab 1: Osmosis & Cell Membrane', icon: Droplets },
            { id: 'cardiac', label: '🫀 Lab 2: Cardiac Cycle & Hemodynamics', icon: Activity },
            { id: 'enzyme', label: '⚡ Lab 3: Enzyme Kinetics & Denaturation', icon: Zap }
          ].map((lab) => {
            const Icon = lab.icon;
            const isActive = activeLab === lab.id;
            return (
              <button
                key={lab.id}
                onClick={() => setActiveLab(lab.id)}
                className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
                <span>{lab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Lab 1: Osmosis Simulator */}
        {activeLab === 'osmosis' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual simulation canvas */}
            <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/40 flex flex-col items-center justify-between min-h-[380px]">
              <div className="w-full flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Extracellular Fluid Bath</span>
                <span className={`px-2.5 py-1 rounded-full uppercase tracking-wider text-[10px] ${
                  osmosisState.type === 'Isotonic' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : osmosisState.type === 'Hypotonic'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                }`}>
                  {osmosisState.type} Environment
                </span>
              </div>

              {/* Erythrocyte Graphic */}
              <div className="my-auto py-8 relative flex items-center justify-center">
                <svg width="240" height="240" viewBox="0 0 200 200" className="transition-all duration-300">
                  {/* Surrounding fluid ripples */}
                  <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(6,182,212,0.15)" strokeWidth="2" strokeDasharray="4 4" className="animate-spin-slow" />
                  
                  {/* Erythrocyte */}
                  <g transform={`scale(${osmosisState.cellScale})`} transform-origin="100 100" className="transition-transform duration-300">
                    {osmosisState.lysed ? (
                      /* Burst cell */
                      <g>
                        <circle cx="100" cy="100" r="30" fill="#E74C3C" opacity="0.3" filter="blur(4px)" />
                        <path d="M 60,90 Q 75,60 100,65 Q 130,55 140,85 Q 155,120 120,135 Q 85,150 70,120 Z" fill="#C0392B" />
                        {/* Escaping Hemoglobin dots */}
                        <circle cx="50" cy="70" r="4" fill="#E74C3C" />
                        <circle cx="150" cy="65" r="5" fill="#E74C3C" />
                        <circle cx="140" cy="150" r="4" fill="#E74C3C" />
                        <circle cx="45" cy="120" r="3" fill="#E74C3C" />
                        <text x="100" y="105" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">HEMOLYSIS (BURST)</text>
                      </g>
                    ) : osmosisState.crenated ? (
                      /* Spiky shriveled cell */
                      <path 
                        d="M 100,50 L 115,70 L 140,60 L 135,85 L 160,100 L 135,115 L 140,140 L 115,130 L 100,150 L 85,130 L 60,140 L 65,115 L 40,100 L 65,85 L 60,60 L 85,70 Z" 
                        fill="#A93226" 
                        stroke="#641E16" 
                        strokeWidth="3"
                      />
                    ) : (
                      /* Normal / turgid biconcave disc */
                      <g>
                        <ellipse cx="100" cy="100" rx="55" ry="42" fill="#E74C3C" />
                        <ellipse cx="100" cy="100" rx="28" ry="18" fill="#C0392B" />
                        <ellipse cx="98" cy="98" rx="20" ry="12" fill="#922B21" opacity="0.6" />
                      </g>
                    )}
                  </g>
                </svg>
              </div>

              {/* Status explanation */}
              <div className="w-full bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/50 text-xs text-slate-300">
                <span className="font-bold text-white">Physiological State: </span>
                {osmosisState.desc}
              </div>
            </div>

            {/* Controls & Clinical Correlation */}
            <div className="lg:col-span-5 space-y-5">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/50 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sliders size={18} className="text-emerald-400" />
                    <span>Bath Solution Parameters</span>
                  </h3>
                  <button
                    onClick={() => setOsmolarity(300)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <RotateCcw size={12} /> Reset Isotonic
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Extracellular Osmolarity:</span>
                    <span className="text-emerald-400 font-mono text-sm font-bold">{osmolarity} mOsm/L</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="600"
                    step="10"
                    value={osmolarity}
                    onChange={(e) => setOsmolarity(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                    <span>100 (Hypotonic)</span>
                    <span>300 (Isotonic Normal)</span>
                    <span>600 (Hypertonic)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Info size={14} className="text-cyan-400" />
                    <span>Clinical Correlates:</span>
                  </div>
                  <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
                    <li>• <strong className="text-white">Normal Saline (0.9% NaCl)</strong> has an osmolarity of ~308 mOsm/L, matching human plasma to maintain erythrocyte volume.</li>
                    <li>• <strong className="text-white">Hypotonic IV Fluids (0.45% Saline)</strong> are infused to hydrate intracellular dehydration (e.g. in DKA).</li>
                    <li>• <strong className="text-white">Hypertonic Mannitol</strong> is given clinically to draw edema fluid out of swollen brain tissue during intracranial hypertension.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lab 2: Cardiac Hemodynamics Simulator */}
        {activeLab === 'cardiac' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual ECG & Metrics */}
            <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lead II Electrocardiogram (ECG)</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                    <Activity size={14} className="animate-pulse" />
                    <span>{heartRate} BPM</span>
                  </span>
                </div>

                {/* Animated ECG Canvas */}
                <div className="h-32 bg-slate-950 rounded-2xl border border-slate-800 p-2 flex items-center justify-center relative overflow-hidden">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-40" />

                  {/* Dynamic Animated Pulse Line */}
                  <svg width="100%" height="80" viewBox="0 0 400 80" className="relative z-10">
                    <path
                      d="M 0,40 L 40,40 L 50,30 L 60,40 L 80,40 L 90,10 L 100,75 L 110,35 L 120,40 L 145,40 L 160,25 L 175,40 L 220,40 L 230,30 L 240,40 L 260,40 L 270,10 L 280,75 L 290,35 L 300,40 L 325,40 L 340,25 L 355,40 L 400,40"
                      fill="none"
                      stroke="#22D3EE"
                      strokeWidth="2.5"
                      className="animate-pulse"
                    />
                  </svg>
                </div>
              </div>

              {/* Calculated Metrics Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800 text-center">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Cardiac Output</div>
                  <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono mt-1">{cardiacOutput}</div>
                  <div className="text-[10px] text-slate-500">Liters / min</div>
                </div>

                <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800 text-center">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Est. Blood Pressure</div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">{estSystolic}/{estDiastolic}</div>
                  <div className="text-[10px] text-slate-500">mmHg</div>
                </div>

                <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800 text-center">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Mean Arterial (MAP)</div>
                  <div className="text-xl sm:text-2xl font-black text-purple-400 font-mono mt-1">{estMap}</div>
                  <div className="text-[10px] text-slate-500">mmHg</div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="lg:col-span-5 space-y-5">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/50 space-y-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders size={18} className="text-emerald-400" />
                  <span>Cardiac Controls</span>
                </h3>

                <div className="space-y-4">
                  {/* HR Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Heart Rate (HR):</span>
                      <span className="text-cyan-400 font-mono font-bold">{heartRate} BPM</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="180"
                      step="2"
                      value={heartRate}
                      onChange={(e) => setHeartRate(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                      <span>40 (Bradycardia)</span>
                      <span>72 (Normal)</span>
                      <span>180 (Tachycardia)</span>
                    </div>
                  </div>

                  {/* Stroke Volume Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Stroke Volume (SV):</span>
                      <span className="text-emerald-400 font-mono font-bold">{strokeVolume} mL / beat</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="120"
                      step="2"
                      value={strokeVolume}
                      onChange={(e) => setStrokeVolume(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                      <span>40 (Heart Failure)</span>
                      <span>70 (Resting)</span>
                      <span>120 (Athletic)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2 text-xs text-slate-400">
                  <span className="font-bold text-white">The Frank-Starling Law: </span>
                  Stroke volume increases in response to greater ventricular filling volume (end-diastolic volume), stretching myocardial fibers to optimize sarcomere overlap and contraction force.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lab 3: Enzyme Kinetics Simulator */}
        {activeLab === 'enzyme' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Enzyme Catalysis Graphic */}
            <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catalytic Site Conformation</span>
                <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                  isDenatured 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {isDenatured ? '⚠ Denatured' : 'Active State'}
                </span>
              </div>

              {/* Graphic */}
              <div className="py-6 flex items-center justify-center">
                <svg width="240" height="180" viewBox="0 0 240 180" className="transition-all duration-300">
                  {isDenatured ? (
                    /* Unfolded floppy denatured enzyme */
                    <g>
                      <path 
                        d="M 40,80 Q 70,30 110,90 Q 150,140 180,70 Q 200,30 210,110" 
                        fill="none" 
                        stroke="#EF4444" 
                        strokeWidth="8" 
                        strokeLinecap="round" 
                      />
                      <circle cx="80" cy="140" r="10" fill="#F59E0B" />
                      <text x="120" y="160" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="bold">ACTIVE POCKET DESTROYED</text>
                    </g>
                  ) : (
                    /* Folded 3D active enzyme with substrate locked in */
                    <g>
                      <path 
                        d="M 60,50 C 40,90 40,130 80,140 C 130,150 170,140 180,100 C 190,70 170,50 150,50 C 135,50 130,80 115,80 C 100,80 95,50 60,50 Z" 
                        fill="#06B6D4" 
                        stroke="#0891B2" 
                        strokeWidth="4" 
                      />
                      {/* Substrate */}
                      <path 
                        d="M 100,55 C 105,70 125,70 130,55 Z" 
                        fill="#F59E0B" 
                        stroke="#D97706" 
                        strokeWidth="2" 
                      />
                      <text x="115" y="125" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">ENZYME-SUBSTRATE COMPLEX</text>
                    </g>
                  )}
                </svg>
              </div>

              {/* Reaction Velocity Meter */}
              <div className="space-y-1.5 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">Catalytic Reaction Velocity:</span>
                  <span className="text-cyan-400 font-mono text-sm">{reactionRate}% Vmax</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-700">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${reactionRate}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="lg:col-span-5 space-y-5">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/50 space-y-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders size={18} className="text-emerald-400" />
                  <span>Reaction Conditions</span>
                </h3>

                <div className="space-y-4">
                  {/* Temp */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Temperature:</span>
                      <span className="text-amber-400 font-mono font-bold">{temperature} °C</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      step="1"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                      <span>0°C (Frozen)</span>
                      <span>37°C (Optimum)</span>
                      <span>90°C (Boiling)</span>
                    </div>
                  </div>

                  {/* pH */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Solution pH:</span>
                      <span className="text-cyan-400 font-mono font-bold">{ph}</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="14.0"
                      step="0.1"
                      value={ph}
                      onChange={(e) => setPh(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                      <span>1 (Stomach Acid)</span>
                      <span>7.4 (Blood)</span>
                      <span>14 (Caustic Base)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2 text-xs text-slate-400 leading-relaxed">
                  <span className="font-bold text-white">Denaturation Principle: </span>
                  Hydrogen bonds and ionic interactions maintaining tertiary and quaternary protein structure are disrupted at extreme temperatures and pH values, permanently deforming the catalytic active site.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
