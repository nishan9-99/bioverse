import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Layers, Eye, EyeOff } from 'lucide-react';

export default function InteractiveAnatomy({ organSlug, activePart, onPartSelect }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tiltY, setTiltY] = useState(0);        // -45 to +45 Y-axis 3D tilt
  const [isSplit, setIsSplit] = useState(false);
  const [dimOthers, setDimOthers] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredPart, setHoveredPart] = useState(null);
  const dragRef = useRef({ x: 0, y: 0 });

  const slug =
    organSlug === 'digestive' ? 'digestive-system' :
    organSlug === 'skeletal'  ? 'skeletal-system'  :
    organSlug;

  const onDown = e => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };
  const onMove = e => { if (isDragging) setPan({ x: e.clientX - dragRef.current.x, y: e.clientY - dragRef.current.y }); };
  const onUp = () => setIsDragging(false);
  const doZoom = f => setZoom(p => Math.max(0.35, Math.min(p * f, 4.5)));
  const doReset = () => { setZoom(1); setPan({ x:0,y:0 }); setTiltY(0); setIsSplit(false); setDimOthers(false); };

  // Toggle split: auto zoom-out + reset pan so all parts fit on screen
  const toggleSplit = () => {
    const turningOn = !isSplit;
    setIsSplit(turningOn);
    if (turningOn) {
      setZoom(0.72);
      setPan({ x: 0, y: 0 });
      setTiltY(0);
    }
  };

  // ── SPLIT OFFSETS — kept ≤ 75px so parts always stay on-screen ───────────
  // These are CSS px values applied at zoom=0.72, so effective canvas spread
  // is comfortable within the visible area.
  const OFFSETS = {
    brain: {
      'Cerebrum':        { x:  -12, y:  -78 },
      'Cerebellum':      { x:   95, y:   62 },
      'Thalamus':        { x:   88, y:  -52 },
      'Hypothalamus':    { x:  -95, y:   18 },
      'Brain Stem':      { x:    0, y:   92 },
      'Pituitary Gland': { x:  -88, y:   72 },
    },
    heart: {
      'Aorta':             { x:   5, y:  -88 },
      'Pulmonary Artery':  { x:  -82, y:  -62 },
      'Left Atrium':       { x:   85, y:  -42 },
      'Right Atrium':      { x:  -85, y:  -42 },
      'Left Ventricle':    { x:   68, y:   82 },
      'Right Ventricle':   { x:  -68, y:   82 },
    },
    lungs: {
      'Trachea':     { x:    0, y:  -75 },
      'Bronchi':     { x:   10, y:  -35 },
      'Bronchioles': { x:   88, y:   28 },
      'Alveoli':     { x:  -88, y:   62 },
    },
    'digestive-system': {
      'Mouth':            { x:    0, y:  -95 },
      'Esophagus':        { x:   78, y:  -62 },
      'Liver':            { x:  -88, y:  -15 },
      'Stomach':          { x:   88, y:  -15 },
      'Pancreas':         { x:   80, y:   42 },
      'Small Intestine':  { x:    0, y:   80 },
      'Large Intestine':  { x:  -80, y:   52 },
    },
    kidney: {
      'Cortex':       { x:   68, y:  -52 },
      'Medulla':      { x:  -52, y:   25 },
      'Nephron':      { x:   95, y:  -72 },
      'Renal Artery': { x:  -95, y:  -35 },
      'Renal Vein':   { x:  -95, y:   35 },
    },
    'skeletal-system': {
      'Skull':      { x:    0, y:  -88 },
      'Spine':      { x:   88, y:    8 },
      'Rib Cage':   { x:  -88, y:  -38 },
      'Pelvis':     { x:    0, y:   88 },
      'Arm Bones':  { x:  105, y:   48 },
      'Leg Bones':  { x: -105, y:   78 },
    },
  };

  const getOff = name => isSplit ? ((OFFSETS[slug] || {})[name] || {x:0,y:0}) : {x:0,y:0};

  const gProps = (name) => ({
    style: {
      transform: `translate(${getOff(name).x}px, ${getOff(name).y}px)`,
      transition: 'transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)',
      cursor: 'pointer',
    },
    onClick: e => { e.stopPropagation(); onPartSelect(name); },
    onMouseEnter: () => setHoveredPart(name),
    onMouseLeave: () => setHoveredPart(null),
    opacity: dimOthers && activePart ? (isAct(name) ? 1 : 0.18) : 1,
  });

  const isAct = n => activePart && activePart.toLowerCase() === n.toLowerCase();
  const isHov = n => hoveredPart === n;

  // Part SVG style helpers
  const pFill  = (n, active, normal)  => isAct(n) ? active : normal;
  const pStroke= n => isAct(n) ? '#22d3ee' : isHov(n) ? '#a0c8e0' : '#2a3a4a';
  const pStrokeW= n => isAct(n) ? 3 : isHov(n) ? 2 : 1.5;
  const pFilter = n => isAct(n) ? 'url(#fGlow)' : isHov(n) ? 'url(#fHover)' : undefined;

  const LabelText = ({ x, y, text, name }) => (
    <text x={x} y={y} textAnchor="middle" fontSize="10" fontFamily="Inter,sans-serif"
      fontWeight={isAct(name) ? "800" : "500"}
      fill={isAct(name) ? "#22d3ee" : isHov(name) ? "#e2e8f0" : "#64748b"}
      className="pointer-events-none select-none"
      style={{ letterSpacing: '0.3px' }}
    >{text}</text>
  );

  // ── Common SVG Defs ───────────────────────────────────────────────────────
  const Defs = () => (
    <defs>
      <filter id="fGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b"/>
        <feColorMatrix in="b" type="matrix" values="0 0 4 0 0  0 3 4 0 0.4  0 0 5 0 1  0 0 0 0.7 0" result="c"/>
        <feMerge><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="fHover" x="-20%" y="-20%" width="140%" height="140%">
        <feColorMatrix type="matrix" values="1.15 0 0 0 0.05  0 1.15 0 0 0.05  0 0 1.3 0 0.08  0 0 0 1 0"/>
      </filter>
      <filter id="fShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.55"/>
      </filter>

      {/* ─── Brain ─── */}
      <radialGradient id="gCerebrum" cx="37%" cy="30%" r="68%">
        <stop offset="0%"   stopColor="#f5bebe"/>
        <stop offset="45%"  stopColor="#c75050"/>
        <stop offset="100%" stopColor="#7a1818"/>
      </radialGradient>
      <radialGradient id="gCerebellum" cx="40%" cy="35%" r="65%">
        <stop offset="0%"   stopColor="#b5d8a5"/>
        <stop offset="55%"  stopColor="#568048"/>
        <stop offset="100%" stopColor="#244822"/>
      </radialGradient>
      <linearGradient id="gStem" x1="10%" y1="0%" x2="90%" y2="0%">
        <stop offset="0%"   stopColor="#5a4525"/>
        <stop offset="40%"  stopColor="#d0a060"/>
        <stop offset="100%" stopColor="#7a5830"/>
      </linearGradient>
      <radialGradient id="gThalamus" cx="40%" cy="35%" r="65%">
        <stop offset="0%"   stopColor="#ccc0f0"/>
        <stop offset="60%"  stopColor="#7060c0"/>
        <stop offset="100%" stopColor="#382068"/>
      </radialGradient>
      <radialGradient id="gHypothal" cx="40%" cy="35%" r="65%">
        <stop offset="0%"   stopColor="#c0b0e8"/>
        <stop offset="100%" stopColor="#5040a0"/>
      </radialGradient>
      <radialGradient id="gPituitary" cx="35%" cy="30%" r="70%">
        <stop offset="0%"   stopColor="#fce8b0"/>
        <stop offset="100%" stopColor="#b08020"/>
      </radialGradient>

      {/* ─── Heart ─── */}
      <radialGradient id="gHeart" cx="36%" cy="28%" r="74%">
        <stop offset="0%"   stopColor="#f05555"/>
        <stop offset="48%"  stopColor="#9e1818"/>
        <stop offset="100%" stopColor="#4a0505"/>
      </radialGradient>
      <linearGradient id="gAorta" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"   stopColor="#ff6868"/>
        <stop offset="100%" stopColor="#880000"/>
      </linearGradient>
      <linearGradient id="gPulm" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"   stopColor="#6898ff"/>
        <stop offset="100%" stopColor="#1032a8"/>
      </linearGradient>
      <radialGradient id="gLAtrium" cx="40%" cy="32%" r="66%">
        <stop offset="0%"   stopColor="#ee8080"/>
        <stop offset="100%" stopColor="#6a1010"/>
      </radialGradient>
      <radialGradient id="gRAtrium" cx="40%" cy="32%" r="66%">
        <stop offset="0%"   stopColor="#e08080"/>
        <stop offset="100%" stopColor="#601818"/>
      </radialGradient>
      <radialGradient id="gLVent" cx="38%" cy="28%" r="72%">
        <stop offset="0%"   stopColor="#e06060"/>
        <stop offset="55%"  stopColor="#961010"/>
        <stop offset="100%" stopColor="#3e0404"/>
      </radialGradient>
      <radialGradient id="gRVent" cx="38%" cy="28%" r="72%">
        <stop offset="0%"   stopColor="#d07070"/>
        <stop offset="55%"  stopColor="#861818"/>
        <stop offset="100%" stopColor="#380606"/>
      </radialGradient>

      {/* ─── Lungs ─── */}
      <radialGradient id="gLungL" cx="55%" cy="30%" r="70%">
        <stop offset="0%"   stopColor="#fcccd8"/>
        <stop offset="55%"  stopColor="#cc6888"/>
        <stop offset="100%" stopColor="#7a2848"/>
      </radialGradient>
      <radialGradient id="gLungR" cx="45%" cy="30%" r="70%">
        <stop offset="0%"   stopColor="#fcccd8"/>
        <stop offset="55%"  stopColor="#cc6888"/>
        <stop offset="100%" stopColor="#7a2848"/>
      </radialGradient>
      <linearGradient id="gTrachea" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor="#607888"/>
        <stop offset="50%"  stopColor="#a0b8c8"/>
        <stop offset="100%" stopColor="#607888"/>
      </linearGradient>

      {/* ─── Digestive ─── */}
      <radialGradient id="gLiver" cx="40%" cy="30%" r="70%">
        <stop offset="0%"   stopColor="#c86848"/>
        <stop offset="55%"  stopColor="#782810"/>
        <stop offset="100%" stopColor="#380800"/>
      </radialGradient>
      <radialGradient id="gStomach" cx="40%" cy="35%" r="65%">
        <stop offset="0%"   stopColor="#d08868"/>
        <stop offset="55%"  stopColor="#904030"/>
        <stop offset="100%" stopColor="#481010"/>
      </radialGradient>
      <radialGradient id="gPancreas" cx="40%" cy="35%" r="65%">
        <stop offset="0%"   stopColor="#e0c888"/>
        <stop offset="60%"  stopColor="#a07838"/>
        <stop offset="100%" stopColor="#583810"/>
      </radialGradient>
      <linearGradient id="gEsoph" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor="#806050"/>
        <stop offset="50%"  stopColor="#c09080"/>
        <stop offset="100%" stopColor="#806050"/>
      </linearGradient>
      <radialGradient id="gSmallInt" cx="40%" cy="35%" r="65%">
        <stop offset="0%"   stopColor="#e8b898"/>
        <stop offset="55%"  stopColor="#b07858"/>
        <stop offset="100%" stopColor="#683830"/>
      </radialGradient>
      <radialGradient id="gLargeInt" cx="40%" cy="35%" r="65%">
        <stop offset="0%"   stopColor="#d8a888"/>
        <stop offset="55%"  stopColor="#a06848"/>
        <stop offset="100%" stopColor="#582818"/>
      </radialGradient>

      {/* ─── Kidney ─── */}
      <radialGradient id="gCortex" cx="45%" cy="30%" r="65%">
        <stop offset="0%"   stopColor="#e08888"/>
        <stop offset="55%"  stopColor="#a03030"/>
        <stop offset="100%" stopColor="#500808"/>
      </radialGradient>
      <radialGradient id="gMedulla" cx="40%" cy="40%" r="60%">
        <stop offset="0%"   stopColor="#c06060"/>
        <stop offset="60%"  stopColor="#802020"/>
        <stop offset="100%" stopColor="#3e0808"/>
      </radialGradient>
      <radialGradient id="gNephron" cx="35%" cy="30%" r="70%">
        <stop offset="0%"   stopColor="#f0d0b0"/>
        <stop offset="60%"  stopColor="#b08040"/>
        <stop offset="100%" stopColor="#603808"/>
      </radialGradient>

      {/* ─── Skeletal ─── */}
      <radialGradient id="gBone" cx="35%" cy="28%" r="72%">
        <stop offset="0%"   stopColor="#f8f0d8"/>
        <stop offset="55%"  stopColor="#d4c080"/>
        <stop offset="100%" stopColor="#9a8030"/>
      </radialGradient>
      <linearGradient id="gBoneTube" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor="#c8b870"/>
        <stop offset="30%"  stopColor="#f5edc8"/>
        <stop offset="70%"  stopColor="#f5edc8"/>
        <stop offset="100%" stopColor="#c8b870"/>
      </linearGradient>
      <radialGradient id="gSkull" cx="40%" cy="32%" r="68%">
        <stop offset="0%"   stopColor="#faf4e0"/>
        <stop offset="55%"  stopColor="#ddd098"/>
        <stop offset="100%" stopColor="#a09030"/>
      </radialGradient>
    </defs>
  );

  // ── SVG Renderers ─────────────────────────────────────────────────────────
  const renderBrain = () => (
    <svg viewBox="0 0 440 360" className="w-full h-full select-none" overflow="visible">
      <Defs/>

      {/* === BRAIN STEM === */}
      <g {...gProps('Brain Stem')} filter={pFilter('Brain Stem')}>
        {/* Main stem body */}
        <path d="M 188,185 C 182,200 180,225 182,245 C 183,258 186,295 194,318 C 197,326 207,328 215,324 C 222,319 225,295 225,278 C 227,255 225,225 218,200 C 215,190 205,184 188,185 Z"
          fill={pFill('Brain Stem', '#22d3ee22', 'url(#gStem)')}
          stroke={pStroke('Brain Stem')} strokeWidth={pStrokeW('Brain Stem')}/>
        {/* Pons bulge */}
        <ellipse cx="203" cy="218" rx="18" ry="12" fill="none" stroke={pStroke('Brain Stem')} strokeWidth="1" opacity="0.4"/>
        {/* Medulla detail lines */}
        <path d="M 196,240 C 196,275 198,300 200,320 M 208,240 C 208,275 206,300 204,320"
          stroke={pStroke('Brain Stem')} strokeWidth="1" fill="none" opacity="0.3"/>
        <LabelText x={225} y={265} text="Brain Stem" name="Brain Stem"/>
      </g>

      {/* === CEREBELLUM === */}
      <g {...gProps('Cerebellum')} filter={pFilter('Cerebellum')}>
        <path d="M 222,192 C 250,182 292,188 305,212 C 315,232 305,258 280,268 C 258,276 228,265 220,245 C 212,225 208,200 222,192 Z"
          fill={pFill('Cerebellum', '#22d3ee22', 'url(#gCerebellum)')}
          stroke={pStroke('Cerebellum')} strokeWidth={pStrokeW('Cerebellum')} filter={pFilter('Cerebellum')}/>
        {/* Arbor vitae striation lines */}
        {[0,1,2,3,4,5].map(i => (
          <path key={i}
            d={`M ${230+i*10},${200+i*3} Q ${252+i*5},${220} ${270+i*6},${215+i*5}`}
            stroke={isAct('Cerebellum') ? '#22d3ee55' : '#5a9050'} strokeWidth="1.5" fill="none" opacity="0.55"/>
        ))}
        <LabelText x={265} y={230} text="Cerebellum" name="Cerebellum"/>
      </g>

      {/* === HYPOTHALAMUS === */}
      <g {...gProps('Hypothalamus')} filter={pFilter('Hypothalamus')}>
        <path d="M 160,152 C 162,144 178,142 185,148 C 190,153 182,162 172,161 C 164,160 158,158 160,152 Z"
          fill={pFill('Hypothalamus', '#22d3ee44', 'url(#gHypothal)')}
          stroke={pStroke('Hypothalamus')} strokeWidth={pStrokeW('Hypothalamus')}/>
        <LabelText x={158} y={175} text="Hypothalamus" name="Hypothalamus"/>
      </g>

      {/* === PITUITARY GLAND === */}
      <g {...gProps('Pituitary Gland')} filter={pFilter('Pituitary Gland')}>
        <line x1="172" y1="160" x2="162" y2="180" stroke={pStroke('Pituitary Gland')} strokeWidth="2"/>
        <circle cx="158" cy="186" r="10"
          fill={pFill('Pituitary Gland', '#22d3ee55', 'url(#gPituitary)')}
          stroke={pStroke('Pituitary Gland')} strokeWidth={pStrokeW('Pituitary Gland')}/>
        <LabelText x={140} y={205} text="Pituitary" name="Pituitary Gland"/>
      </g>

      {/* === THALAMUS === */}
      <g {...gProps('Thalamus')} filter={pFilter('Thalamus')}>
        <ellipse cx="198" cy="135" rx="28" ry="20"
          fill={pFill('Thalamus', '#22d3ee33', 'url(#gThalamus)')}
          stroke={pStroke('Thalamus')} strokeWidth={pStrokeW('Thalamus')}/>
        {/* Internal massa intermedia */}
        <ellipse cx="198" cy="135" rx="7" ry="5" fill="none" stroke={pStroke('Thalamus')} strokeWidth="1" opacity="0.4"/>
        <LabelText x={198} y={130} text="Thalamus" name="Thalamus"/>
      </g>

      {/* === CEREBRUM (drawn last so it's on top in assembled view) === */}
      <g {...gProps('Cerebrum')} filter={pFilter('Cerebrum')}>
        {/* Main cerebrum mass — realistic lateral profile */}
        <path d="M 195,62 C 170,35 128,30 100,50 C 68,74 58,108 62,140 C 66,175 82,185 105,182 C 118,180 128,185 148,185 C 168,185 180,180 188,185 C 195,182 210,185 222,185 C 242,185 260,178 268,162 C 288,148 305,128 300,100 C 290,60 258,38 225,38 C 215,36 204,43 195,62 Z"
          fill={pFill('Cerebrum', '#22d3ee22', 'url(#gCerebrum)')}
          stroke={pStroke('Cerebrum')} strokeWidth={pStrokeW('Cerebrum')} filter={pFilter('Cerebrum')}/>
        {/* Gyri (fold lines) — layered organic waves */}
        <path d="M 115,90 C 132,72 152,72 160,85 C 168,98 188,78 210,92 C 232,106 258,78 278,100"
          stroke={isAct('Cerebrum') ? '#22d3ee55' : '#c07070'} strokeWidth="1.8" fill="none" opacity="0.45" strokeLinecap="round"/>
        <path d="M 90,118 C 110,108 130,118 150,106 C 170,94 192,118 212,108 C 232,98 255,120 285,125"
          stroke={isAct('Cerebrum') ? '#22d3ee55' : '#c07070'} strokeWidth="1.8" fill="none" opacity="0.45" strokeLinecap="round"/>
        <path d="M 100,148 C 115,140 132,148 150,138 C 168,128 185,148 205,142 C 225,136 248,155 268,152"
          stroke={isAct('Cerebrum') ? '#22d3ee55' : '#c07070'} strokeWidth="1.5" fill="none" opacity="0.38" strokeLinecap="round"/>
        <path d="M 158,55 C 172,65 185,52 198,65 C 211,78 235,58 258,78"
          stroke={isAct('Cerebrum') ? '#22d3ee55' : '#c07070'} strokeWidth="1.5" fill="none" opacity="0.38" strokeLinecap="round"/>
        {/* Central sulcus dividing line */}
        <path d="M 185,65 C 175,90 172,118 175,138"
          stroke={isAct('Cerebrum') ? '#22d3ee66' : '#a04040'} strokeWidth="2" fill="none" opacity="0.4" strokeLinecap="round"/>
        <LabelText x={185} y={95} text="Cerebrum" name="Cerebrum"/>
      </g>
    </svg>
  );

  const renderHeart = () => (
    <svg viewBox="0 0 440 360" className="w-full h-full select-none" overflow="visible">
      <Defs/>

      {/* === RIGHT VENTRICLE === */}
      <g {...gProps('Right Ventricle')} filter={pFilter('Right Ventricle')}>
        <path d="M 175,168 C 152,172 128,185 120,210 C 108,240 122,278 148,290 C 168,300 200,295 215,280 L 210,170 Z"
          fill={pFill('Right Ventricle', '#22d3ee22', 'url(#gRVent)')}
          stroke={pStroke('Right Ventricle')} strokeWidth={pStrokeW('Right Ventricle')}/>
        {/* Trabeculae carnae muscle ridges */}
        <path d="M 150,195 C 145,215 142,240 148,265 M 162,190 C 155,215 152,245 158,270"
          stroke={isAct('Right Ventricle') ? '#22d3ee44' : '#7a1515'} strokeWidth="1.5" fill="none" opacity="0.4"/>
        <LabelText x={155} y={240} text="R. Ventricle" name="Right Ventricle"/>
      </g>

      {/* === LEFT VENTRICLE === */}
      <g {...gProps('Left Ventricle')} filter={pFilter('Left Ventricle')}>
        <path d="M 215,168 C 238,165 268,178 278,205 C 290,238 278,278 252,292 C 232,302 210,295 215,280 L 218,170 Z"
          fill={pFill('Left Ventricle', '#22d3ee22', 'url(#gLVent)')}
          stroke={pStroke('Left Ventricle')} strokeWidth={pStrokeW('Left Ventricle')}/>
        <path d="M 240,192 C 248,215 250,245 245,272 M 255,198 C 260,220 260,248 255,272"
          stroke={isAct('Left Ventricle') ? '#22d3ee44' : '#701010'} strokeWidth="1.5" fill="none" opacity="0.4"/>
        <LabelText x={255} y={240} text="L. Ventricle" name="Left Ventricle"/>
      </g>

      {/* === RIGHT ATRIUM === */}
      <g {...gProps('Right Atrium')} filter={pFilter('Right Atrium')}>
        <path d="M 148,120 C 128,118 110,128 108,148 C 106,168 118,178 140,180 C 158,182 175,175 175,168 L 170,125 Z"
          fill={pFill('Right Atrium', '#22d3ee22', 'url(#gRAtrium)')}
          stroke={pStroke('Right Atrium')} strokeWidth={pStrokeW('Right Atrium')}/>
        {/* Pectinate muscles detail */}
        <path d="M 125,135 C 130,148 132,162 130,175 M 138,130 C 140,148 140,165 138,178"
          stroke={isAct('Right Atrium') ? '#22d3ee44' : '#6a1818'} strokeWidth="1" fill="none" opacity="0.35"/>
        <LabelText x={140} y={152} text="R. Atrium" name="Right Atrium"/>
      </g>

      {/* === LEFT ATRIUM === */}
      <g {...gProps('Left Atrium')} filter={pFilter('Left Atrium')}>
        <path d="M 252,120 C 272,118 290,128 292,148 C 294,168 282,178 260,180 C 242,182 225,175 215,168 L 220,125 Z"
          fill={pFill('Left Atrium', '#22d3ee22', 'url(#gLAtrium)')}
          stroke={pStroke('Left Atrium')} strokeWidth={pStrokeW('Left Atrium')}/>
        <path d="M 262,130 C 265,148 265,162 262,175 M 275,135 C 275,150 272,165 270,178"
          stroke={isAct('Left Atrium') ? '#22d3ee44' : '#701010'} strokeWidth="1" fill="none" opacity="0.35"/>
        <LabelText x={262} y={152} text="L. Atrium" name="Left Atrium"/>
      </g>

      {/* === PULMONARY ARTERY === */}
      <g {...gProps('Pulmonary Artery')} filter={pFilter('Pulmonary Artery')}>
        {/* Main trunk going up-left */}
        <path d="M 218,130 C 218,105 195,88 172,78"
          fill="none" stroke={pFill('Pulmonary Artery', '#22d3ee', 'url(#gPulm)')}
          strokeWidth={isAct('Pulmonary Artery') ? 20 : 17} strokeLinecap="round"/>
        {/* Branch to right lung */}
        <path d="M 218,130 C 218,112 248,105 265,95"
          fill="none" stroke={pFill('Pulmonary Artery', '#22d3ee', 'url(#gPulm)')}
          strokeWidth={isAct('Pulmonary Artery') ? 15 : 12} strokeLinecap="round"/>
        {/* Highlight center line */}
        <path d="M 218,130 C 218,105 195,88 172,78"
          fill="none" stroke="rgba(150,190,255,0.3)" strokeWidth="4" strokeLinecap="round"/>
        <LabelText x={185} y={100} text="Pulmonary A." name="Pulmonary Artery"/>
      </g>

      {/* === AORTA === */}
      <g {...gProps('Aorta')} filter={pFilter('Aorta')}>
        {/* Ascending aorta */}
        <path d="M 225,128 C 222,90 248,68 255,52"
          fill="none" stroke={pFill('Aorta', '#22d3ee', 'url(#gAorta)')}
          strokeWidth={isAct('Aorta') ? 22 : 20} strokeLinecap="round"/>
        {/* Aortic arch */}
        <path d="M 248,68 C 258,52 272,50 278,60"
          fill="none" stroke={pFill('Aorta', '#22d3ee', 'url(#gAorta)')}
          strokeWidth={isAct('Aorta') ? 20 : 18} strokeLinecap="round"/>
        {/* Descending aorta */}
        <path d="M 275,62 C 285,75 280,95 272,115"
          fill="none" stroke={pFill('Aorta', '#22d3ee', 'url(#gAorta)')}
          strokeWidth={isAct('Aorta') ? 18 : 16} strokeLinecap="round"/>
        {/* Branch vessels (brachiocephalic, carotid, subclavian) */}
        <path d="M 248,68 L 238,38 M 258,60 L 260,35 M 268,54 L 280,35"
          stroke={pFill('Aorta', '#22d3ee', '#dd2020')} strokeWidth="7" strokeLinecap="round" fill="none"/>
        {/* Highlight */}
        <path d="M 225,128 C 222,90 248,68 255,52"
          fill="none" stroke="rgba(255,160,160,0.3)" strokeWidth="5" strokeLinecap="round"/>
        <LabelText x={242} y={80} text="Aorta" name="Aorta"/>
      </g>

      {/* Interventricular septum */}
      <line x1="212" y1="165" x2="212" y2="290" stroke="#3a0808" strokeWidth="3" opacity="0.5" className="pointer-events-none"/>
      {/* Atrioventricular groove */}
      <path d="M 145,175 C 165,172 175,168 215,168 C 255,168 275,172 295,175" stroke="#3a0808" strokeWidth="2" fill="none" opacity="0.4" className="pointer-events-none"/>
    </svg>
  );

  const renderLungs = () => (
    <svg viewBox="0 0 440 360" className="w-full h-full select-none" overflow="visible">
      <Defs/>

      {/* === LEFT LUNG (anatomical right on screen) === */}
      <g {...gProps('Bronchioles')} filter={pFilter('Bronchioles')}>
        {/* Right-side bronchiole tree */}
        <path d="M 268,152 C 282,162 292,178 295,200 M 268,152 C 275,172 270,198 268,218 M 268,218 C 260,232 265,248 258,260 M 295,200 C 302,215 298,235 292,248"
          stroke={pFill('Bronchioles', '#22d3ee', '#8095a8')}
          strokeWidth={isAct('Bronchioles') ? 6 : 5} strokeLinecap="round" fill="none"/>
        {/* Left-side bronchiole tree */}
        <path d="M 172,152 C 158,162 148,178 145,200 M 172,152 C 165,172 170,198 172,218 M 172,218 C 180,232 175,248 182,260 M 145,200 C 138,215 142,235 148,248"
          stroke={pFill('Bronchioles', '#22d3ee', '#8095a8')}
          strokeWidth={isAct('Bronchioles') ? 6 : 5} strokeLinecap="round" fill="none"/>
        <LabelText x={315} y={210} text="Bronchioles" name="Bronchioles"/>
      </g>

      {/* Right lung body */}
      <g {...gProps('Bronchioles')} style={{ ...gProps('Bronchioles').style, pointerEvents: 'none' }}>
        <path d="M 278,130 C 310,118 335,132 342,170 C 350,215 335,258 308,272 C 285,284 262,275 265,258 C 268,235 278,180 275,130 Z"
          fill="rgba(200,100,130,0.15)" stroke={pStroke('Bronchioles')} strokeWidth="1" strokeDasharray="5 3" opacity="0.5"/>
      </g>

      {/* Left lung body */}
      <g {...gProps('Bronchioles')} style={{ ...gProps('Bronchioles').style, pointerEvents: 'none' }}>
        <path d="M 162,130 C 130,118 105,132 98,170 C 90,215 105,258 132,272 C 155,284 178,275 175,258 C 172,235 162,180 165,130 Z"
          fill="rgba(200,100,130,0.15)" stroke={pStroke('Bronchioles')} strokeWidth="1" strokeDasharray="5 3" opacity="0.5"/>
      </g>

      {/* === ALVEOLI === */}
      <g {...gProps('Alveoli')} filter={pFilter('Alveoli')}>
        {[
          [108,215],[128,212],[118,238],[148,250],[135,265],
          [302,215],[285,212],[295,238],[265,250],[278,265],
        ].map(([cx,cy],i) => (
          <circle key={i} cx={cx} cy={cy} r="9"
            fill={pFill('Alveoli', '#22d3ee33', 'rgba(210,120,150,0.55)')}
            stroke={pStroke('Alveoli')} strokeWidth={pStrokeW('Alveoli')}/>
        ))}
        {/* Capillary network detail */}
        {[[108,215],[302,215]].map(([cx,cy],i) => (
          <circle key={`c${i}`} cx={cx} cy={cy} r="9" fill="none"
            stroke={isAct('Alveoli') ? '#22d3ee55' : 'rgba(255,100,100,0.3)'} strokeWidth="1.5"/>
        ))}
        <LabelText x={115} y={285} text="Alveoli" name="Alveoli"/>
      </g>

      {/* === BRONCHI === */}
      <g {...gProps('Bronchi')} filter={pFilter('Bronchi')}>
        <path d="M 220,118 C 205,135 178,145 165,152"
          fill="none" stroke={pFill('Bronchi', '#22d3ee', 'url(#gTrachea)')}
          strokeWidth={isAct('Bronchi') ? 13 : 11} strokeLinecap="round"/>
        <path d="M 220,118 C 235,135 262,145 275,152"
          fill="none" stroke={pFill('Bronchi', '#22d3ee', 'url(#gTrachea)')}
          strokeWidth={isAct('Bronchi') ? 13 : 11} strokeLinecap="round"/>
        {/* Cartilage rings */}
        {[[198,135],[208,128],[215,123],[235,128],[245,135],[258,143]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="3.5" fill="none"
            stroke={isAct('Bronchi') ? '#22d3ee66' : '#4a6070'} strokeWidth="1.5" opacity="0.55"/>
        ))}
        <LabelText x={200} y={165} text="Bronchi" name="Bronchi"/>
      </g>

      {/* === TRACHEA === */}
      <g {...gProps('Trachea')} filter={pFilter('Trachea')}>
        <rect x="210" y="32" width="20" height="90" rx="10"
          fill={pFill('Trachea', '#22d3ee44', 'url(#gTrachea)')}
          stroke={pStroke('Trachea')} strokeWidth={pStrokeW('Trachea')}/>
        {/* C-shaped tracheal rings */}
        {[48,60,72,84,96,108].map(y => (
          <path key={y} d={`M 212,${y} Q 210,${y} 208,${y+4} Q 210,${y+8} 212,${y+8}`}
            fill="none" stroke={isAct('Trachea') ? '#22d3ee88' : '#3a5060'} strokeWidth="2"/>
        ))}
        {[48,60,72,84,96,108].map(y => (
          <line key={`l${y}`} x1="212" y1={y} x2="228" y2={y}
            stroke={isAct('Trachea') ? '#22d3ee55' : '#3a5060'} strokeWidth="1.5" opacity="0.6"/>
        ))}
        <LabelText x={220} y={26} text="Trachea" name="Trachea"/>
      </g>
    </svg>
  );

  const renderDigestive = () => (
    <svg viewBox="0 0 440 360" className="w-full h-full select-none" overflow="visible">
      <Defs/>

      {/* === LARGE INTESTINE === */}
      <g {...gProps('Large Intestine')} filter={pFilter('Large Intestine')}>
        {/* Ascending colon */}
        <path d="M 252,215 L 252,280 C 252,288 246,295 238,295 L 202,295 C 194,295 188,288 188,280 L 188,215"
          fill="none" stroke={pFill('Large Intestine', '#22d3ee', 'url(#gLargeInt)')}
          strokeWidth={isAct('Large Intestine') ? 19 : 16} strokeLinejoin="round" strokeLinecap="round"/>
        {/* Haustra (pouches) detail */}
        {[225,240,258,272].map((y,i) => (
          <ellipse key={i} cx={i%2===0?258:182} cy={y} rx="6" ry="5"
            fill={isAct('Large Intestine') ? 'rgba(34,211,238,0.15)' : 'rgba(160,100,70,0.3)'}
            stroke="none"/>
        ))}
        <LabelText x={220} y={315} text="Large Intestine" name="Large Intestine"/>
      </g>

      {/* === SMALL INTESTINE === */}
      <g {...gProps('Small Intestine')} filter={pFilter('Small Intestine')}>
        <path d="M 208,218 C 222,210 232,220 224,232 C 212,245 235,242 228,255 C 218,268 230,272 222,282 C 210,286 200,275 205,262 C 208,250 192,252 195,240 C 198,228 208,218 208,218 Z"
          fill="none" stroke={pFill('Small Intestine', '#22d3ee', 'url(#gSmallInt)')}
          strokeWidth={isAct('Small Intestine') ? 13 : 11} strokeLinejoin="round" strokeLinecap="round"/>
        <LabelText x={218} y={258} text="Small Intestine" name="Small Intestine"/>
      </g>

      {/* === PANCREAS === */}
      <g {...gProps('Pancreas')} filter={pFilter('Pancreas')}>
        <path d="M 205,162 C 230,158 252,162 258,170 C 264,178 248,186 225,186 C 205,186 195,178 198,168 Z"
          fill={pFill('Pancreas', '#22d3ee33', 'url(#gPancreas)')}
          stroke={pStroke('Pancreas')} strokeWidth={pStrokeW('Pancreas')}/>
        {/* Pancreatic duct */}
        <path d="M 210,172 C 230,172 248,174 258,170" fill="none"
          stroke={isAct('Pancreas') ? '#22d3ee66' : '#806030'} strokeWidth="2" opacity="0.5"/>
        <LabelText x={228} y={198} text="Pancreas" name="Pancreas"/>
      </g>

      {/* === LIVER === */}
      <g {...gProps('Liver')} filter={pFilter('Liver')}>
        <path d="M 148,120 C 178,108 215,108 218,128 C 220,148 190,162 158,158 C 135,154 132,138 140,126 Z"
          fill={pFill('Liver', '#22d3ee22', 'url(#gLiver)')}
          stroke={pStroke('Liver')} strokeWidth={pStrokeW('Liver')}/>
        {/* Hepatic lobes dividing line */}
        <path d="M 188,110 C 185,130 182,150 184,158" fill="none"
          stroke={isAct('Liver') ? '#22d3ee55' : '#5a1808'} strokeWidth="2" opacity="0.45"/>
        {/* Bile duct */}
        <path d="M 190,158 C 195,168 198,175 200,182" fill="none"
          stroke={isAct('Liver') ? '#22d3ee66' : '#8a6020'} strokeWidth="3" opacity="0.5"/>
        <LabelText x={178} y={142} text="Liver" name="Liver"/>
      </g>

      {/* === STOMACH === */}
      <g {...gProps('Stomach')} filter={pFilter('Stomach')}>
        <path d="M 218,118 C 248,108 270,128 265,158 C 260,180 238,192 220,185 C 208,180 210,162 210,148 C 210,132 218,118 218,118 Z"
          fill={pFill('Stomach', '#22d3ee22', 'url(#gStomach)')}
          stroke={pStroke('Stomach')} strokeWidth={pStrokeW('Stomach')}/>
        {/* Rugae (stomach folds) */}
        {[130,145,162,175].map((y,i) => (
          <path key={i} d={`M ${220+i*3},${y} C ${235+i*2},${y+2} ${250-i},${y}`}
            fill="none" stroke={isAct('Stomach') ? '#22d3ee44' : '#803020'} strokeWidth="1.5" opacity="0.4"/>
        ))}
        <LabelText x={242} y={152} text="Stomach" name="Stomach"/>
      </g>

      {/* === ESOPHAGUS === */}
      <g {...gProps('Esophagus')} filter={pFilter('Esophagus')}>
        <rect x="212" y="35" width="14" height="86" rx="7"
          fill={pFill('Esophagus', '#22d3ee44', 'url(#gEsoph)')}
          stroke={pStroke('Esophagus')} strokeWidth={pStrokeW('Esophagus')}/>
        <LabelText x={230} y={75} text="Esophagus" name="Esophagus"/>
      </g>

      {/* === MOUTH === */}
      <g {...gProps('Mouth')} filter={pFilter('Mouth')}>
        <ellipse cx="219" cy="22" rx="14" ry="10"
          fill={pFill('Mouth', '#22d3ee33', 'rgba(200,150,160,0.7)')}
          stroke={pStroke('Mouth')} strokeWidth={pStrokeW('Mouth')}/>
        {/* Teeth line */}
        <line x1="206" y1="22" x2="232" y2="22" stroke={isAct('Mouth') ? '#22d3ee88' : '#aaa'} strokeWidth="1.5" opacity="0.5"/>
        <LabelText x={219} y={10} text="Mouth" name="Mouth"/>
      </g>
    </svg>
  );

  const renderKidney = () => (
    <svg viewBox="0 0 440 360" className="w-full h-full select-none" overflow="visible">
      <Defs/>

      {/* === RENAL ARTERY === */}
      <g {...gProps('Renal Artery')} filter={pFilter('Renal Artery')}>
        <path d="M 125,155 L 202,155" fill="none"
          stroke={pFill('Renal Artery', '#22d3ee', '#ef4444')}
          strokeWidth={isAct('Renal Artery') ? 13 : 11} strokeLinecap="round"/>
        {/* Branch into kidney */}
        <path d="M 202,155 L 215,140 M 202,155 L 218,162" fill="none"
          stroke={pFill('Renal Artery', '#22d3ee', '#ef4444')} strokeWidth="7" strokeLinecap="round"/>
        {/* Flow direction arrow */}
        <polygon points="195,148 202,155 195,162"
          fill={pFill('Renal Artery', '#22d3ee', '#ef4444')} opacity="0.6"/>
        <LabelText x={158} y={145} text="Renal Artery" name="Renal Artery"/>
      </g>

      {/* === RENAL VEIN === */}
      <g {...gProps('Renal Vein')} filter={pFilter('Renal Vein')}>
        <path d="M 125,175 L 202,175" fill="none"
          stroke={pFill('Renal Vein', '#22d3ee', '#3b82f6')}
          strokeWidth={isAct('Renal Vein') ? 13 : 11} strokeLinecap="round"/>
        <path d="M 202,175 L 215,165 M 202,175 L 218,185" fill="none"
          stroke={pFill('Renal Vein', '#22d3ee', '#3b82f6')} strokeWidth="7" strokeLinecap="round"/>
        <LabelText x={158} y={195} text="Renal Vein" name="Renal Vein"/>
      </g>

      {/* === MEDULLA (drawn before cortex) === */}
      <g {...gProps('Medulla')} filter={pFilter('Medulla')}>
        {/* Medullary pyramids */}
        {[[248,110,268,108,258,128],[260,148,278,145,262,168],[252,188,272,190,248,205]].map(([x1,y1,x2,y2,x3,y3],i) => (
          <path key={i} d={`M ${x1},${y1} L ${x2},${y2} L ${x3},${y3} Z`}
            fill={pFill('Medulla', '#22d3ee22', 'url(#gMedulla)')}
            stroke={pStroke('Medulla')} strokeWidth={pStrokeW('Medulla')}/>
        ))}
        {/* Papillae (tips) */}
        {[[258,128],[262,168],[248,205]].map(([cx,cy],i) => (
          <circle key={i} cx={cx} cy={cy} r="5"
            fill={pFill('Medulla', '#22d3ee', '#a02020')} opacity="0.7"/>
        ))}
        <LabelText x={290} y={158} text="Medulla" name="Medulla"/>
      </g>

      {/* === CORTEX (outer shell) === */}
      <g {...gProps('Cortex')} filter={pFilter('Cortex')}>
        {/* Main kidney bean shape */}
        <path d="M 215,68 C 285,50 325,108 318,172 C 310,238 270,262 230,252 C 210,246 238,205 238,168 C 238,130 210,98 215,68 Z"
          fill={pFill('Cortex', '#22d3ee22', 'url(#gCortex)')}
          stroke={pStroke('Cortex')} strokeWidth={pStrokeW('Cortex')}/>
        {/* Cortex texture — nephron dots */}
        {[[248,90],[275,105],[295,130],[305,162],[298,195],[278,218],[252,232]].map(([cx,cy],i) => (
          <circle key={i} cx={cx} cy={cy} r="3.5"
            fill="none" stroke={isAct('Cortex') ? '#22d3ee55' : '#c04040'} strokeWidth="1.5" opacity="0.35"/>
        ))}
        <LabelText x={300} y={105} text="Cortex" name="Cortex"/>
      </g>

      {/* === NEPHRON (inset zoom diagram) === */}
      <g {...gProps('Nephron')} filter={pFilter('Nephron')}>
        <rect x="310" y="62" width="100" height="100" rx="10"
          fill={pFill('Nephron', '#22d3ee11', 'rgba(15,23,42,0.85)')}
          stroke={pStroke('Nephron')} strokeWidth={pStrokeW('Nephron')}/>
        <text x="360" y="78" textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily="Inter,sans-serif" fontWeight="600" className="pointer-events-none">NEPHRON</text>
        {/* Bowman's capsule */}
        <circle cx="360" cy="100" r="18" fill="none"
          stroke={isAct('Nephron') ? '#22d3ee' : '#b08040'} strokeWidth="2"/>
        {/* Glomerulus */}
        <circle cx="360" cy="100" r="9"
          fill={isAct('Nephron') ? 'rgba(34,211,238,0.25)' : 'rgba(180,80,40,0.6)'}
          stroke={isAct('Nephron') ? '#22d3ee' : '#a06030'} strokeWidth="1.5"/>
        {/* Loop of Henle */}
        <path d="M 360,118 C 360,132 345,140 345,148 C 345,156 375,156 375,148 C 375,140 360,132 360,118"
          fill="none" stroke={isAct('Nephron') ? '#22d3ee' : '#c08040'} strokeWidth="2"/>
        {/* Collecting duct */}
        <line x1="360" y1="82" x2="360" y2="62"
          stroke={isAct('Nephron') ? '#22d3ee' : '#8060a0'} strokeWidth="3"/>
        <LabelText x={360} y={155} text="Nephron" name="Nephron"/>
      </g>

      {/* Renal pelvis */}
      <path d="M 215,145 C 215,158 222,168 215,178" fill="none"
        stroke="#501010" strokeWidth="8" strokeLinecap="round" opacity="0.6" className="pointer-events-none"/>
    </svg>
  );

  const renderSkeletal = () => (
    <svg viewBox="0 0 440 410" className="w-full h-full select-none" overflow="visible">
      <Defs/>

      {/* === LEG BONES === */}
      <g {...gProps('Leg Bones')} filter={pFilter('Leg Bones')}>
        {/* Left femur */}
        <path d="M 176,225 C 172,248 165,275 160,320 M 215,225 C 220,248 228,275 232,320"
          fill="none" stroke={pFill('Leg Bones', '#22d3ee', 'url(#gBoneTube)')}
          strokeWidth={isAct('Leg Bones') ? 12 : 10} strokeLinecap="round"/>
        {/* Knee joints */}
        <ellipse cx="158" cy="320" rx="9" ry="6" fill={pFill('Leg Bones', '#22d3ee33', 'url(#gBone)')}
          stroke={pStroke('Leg Bones')} strokeWidth={pStrokeW('Leg Bones')}/>
        <ellipse cx="234" cy="320" rx="9" ry="6" fill={pFill('Leg Bones', '#22d3ee33', 'url(#gBone)')}
          stroke={pStroke('Leg Bones')} strokeWidth={pStrokeW('Leg Bones')}/>
        {/* Tibia / fibula */}
        <path d="M 153,326 C 150,348 148,368 150,388 M 162,328 C 162,352 164,370 165,388"
          fill="none" stroke={pFill('Leg Bones', '#22d3ee', 'url(#gBoneTube)')}
          strokeWidth={isAct('Leg Bones') ? 9 : 7} strokeLinecap="round"/>
        <path d="M 228,326 C 232,350 232,368 230,388 M 238,328 C 238,352 238,370 236,388"
          fill="none" stroke={pFill('Leg Bones', '#22d3ee', 'url(#gBoneTube)')}
          strokeWidth={isAct('Leg Bones') ? 9 : 7} strokeLinecap="round"/>
        <LabelText x={155} y={400} text="Leg Bones" name="Leg Bones"/>
        <LabelText x={230} y={400} text="Leg Bones" name="Leg Bones"/>
      </g>

      {/* === ARM BONES === */}
      <g {...gProps('Arm Bones')} filter={pFilter('Arm Bones')}>
        {/* Left humerus */}
        <path d="M 158,100 L 128,158 M 128,158 L 108,200 M 128,158 L 115,195"
          fill="none" stroke={pFill('Arm Bones', '#22d3ee', 'url(#gBoneTube)')}
          strokeWidth={isAct('Arm Bones') ? 10 : 8} strokeLinecap="round"/>
        {/* Elbow joint left */}
        <circle cx="128" cy="158" r="7" fill={pFill('Arm Bones', '#22d3ee33', 'url(#gBone)')}
          stroke={pStroke('Arm Bones')} strokeWidth={pStrokeW('Arm Bones')}/>
        {/* Right humerus */}
        <path d="M 282,100 L 312,158 M 312,158 L 332,200 M 312,158 L 325,195"
          fill="none" stroke={pFill('Arm Bones', '#22d3ee', 'url(#gBoneTube)')}
          strokeWidth={isAct('Arm Bones') ? 10 : 8} strokeLinecap="round"/>
        {/* Elbow joint right */}
        <circle cx="312" cy="158" r="7" fill={pFill('Arm Bones', '#22d3ee33', 'url(#gBone)')}
          stroke={pStroke('Arm Bones')} strokeWidth={pStrokeW('Arm Bones')}/>
        <LabelText x={108} y={210} text="Arm" name="Arm Bones"/>
        <LabelText x={332} y={210} text="Arm" name="Arm Bones"/>
      </g>

      {/* === PELVIS === */}
      <g {...gProps('Pelvis')} filter={pFilter('Pelvis')}>
        <path d="M 168,198 C 158,192 148,200 148,215 C 148,235 162,245 180,240 C 195,235 198,225 200,215 Z"
          fill={pFill('Pelvis', '#22d3ee22', 'url(#gBone)')}
          stroke={pStroke('Pelvis')} strokeWidth={pStrokeW('Pelvis')}/>
        <path d="M 272,198 C 282,192 292,200 292,215 C 292,235 278,245 260,240 C 245,235 242,225 240,215 Z"
          fill={pFill('Pelvis', '#22d3ee22', 'url(#gBone)')}
          stroke={pStroke('Pelvis')} strokeWidth={pStrokeW('Pelvis')}/>
        {/* Sacrum */}
        <path d="M 200,215 C 200,225 215,232 220,232 C 225,232 240,225 240,215 L 235,198 L 205,198 Z"
          fill={pFill('Pelvis', '#22d3ee22', 'url(#gBone)')}
          stroke={pStroke('Pelvis')} strokeWidth={pStrokeW('Pelvis')}/>
        {/* Hip sockets */}
        <circle cx="172" cy="225" r="10" fill="none" stroke={pStroke('Pelvis')} strokeWidth="2" opacity="0.4"/>
        <circle cx="268" cy="225" r="10" fill="none" stroke={pStroke('Pelvis')} strokeWidth="2" opacity="0.4"/>
        <LabelText x={220} y={248} text="Pelvis" name="Pelvis"/>
      </g>

      {/* === RIB CAGE === */}
      <g {...gProps('Rib Cage')} filter={pFilter('Rib Cage')}>
        {/* Sternum */}
        <rect x="213" y="95" width="14" height="88" rx="5"
          fill={pFill('Rib Cage', '#22d3ee33', 'url(#gBone)')}
          stroke={pStroke('Rib Cage')} strokeWidth={pStrokeW('Rib Cage')}/>
        {/* Ribs — 6 pairs */}
        {[100,112,124,136,150,162].map((y,i) => (
          <g key={i}>
            <path d={`M 220,${y} C 188,${y-2} 165,${y+8} 160,${y+16} C 155,${y+24} 162,${y+28} 170,${y+26}`}
              fill="none" stroke={pFill('Rib Cage', '#22d3ee', 'url(#gBone)')}
              strokeWidth={isAct('Rib Cage') ? 5 : 4} strokeLinecap="round"/>
            <path d={`M 220,${y} C 252,${y-2} 275,${y+8} 280,${y+16} C 285,${y+24} 278,${y+28} 270,${y+26}`}
              fill="none" stroke={pFill('Rib Cage', '#22d3ee', 'url(#gBone)')}
              strokeWidth={isAct('Rib Cage') ? 5 : 4} strokeLinecap="round"/>
          </g>
        ))}
        <LabelText x={220} y={190} text="Rib Cage" name="Rib Cage"/>
      </g>

      {/* === SPINE === */}
      <g {...gProps('Spine')} filter={pFilter('Spine')}>
        {/* Vertebrae stack */}
        {[80,92,104,118,132,146,162,178,192].map((y,i) => (
          <rect key={i} x="213" y={y} width="14" height="9" rx="2"
            fill={pFill('Spine', '#22d3ee33', 'url(#gBone)')}
            stroke={pStroke('Spine')} strokeWidth={pStrokeW('Spine')}/>
        ))}
        {/* Intervertebral discs */}
        {[89,101,113,127,141,155,171,187].map((y,i) => (
          <rect key={`d${i}`} x="215" y={y} width="10" height="3" rx="1"
            fill={isAct('Spine') ? 'rgba(34,211,238,0.4)' : 'rgba(120,120,100,0.6)'}/>
        ))}
        <LabelText x={240} y={140} text="Spine" name="Spine"/>
      </g>

      {/* === SKULL === */}
      <g {...gProps('Skull')} filter={pFilter('Skull')}>
        {/* Cranium */}
        <path d="M 193,62 C 193,38 210,30 220,30 C 230,30 247,38 247,62 C 247,75 240,80 232,80 C 226,80 220,82 215,82 C 208,82 200,80 193,62 Z"
          fill={pFill('Skull', '#22d3ee22', 'url(#gSkull)')}
          stroke={pStroke('Skull')} strokeWidth={pStrokeW('Skull')}/>
        {/* Mandible (jaw) */}
        <path d="M 207,80 L 203,95 L 210,100 L 220,102 L 230,100 L 237,95 L 233,80"
          fill={pFill('Skull', '#22d3ee22', 'url(#gBone)')}
          stroke={pStroke('Skull')} strokeWidth={pStrokeW('Skull')}/>
        {/* Eye sockets */}
        <ellipse cx="210" cy="62" rx="7" ry="6" fill={isAct('Skull') ? 'rgba(34,211,238,0.2)' : '#0a0a18'}
          stroke={pStroke('Skull')} strokeWidth="1.5"/>
        <ellipse cx="230" cy="62" rx="7" ry="6" fill={isAct('Skull') ? 'rgba(34,211,238,0.2)' : '#0a0a18'}
          stroke={pStroke('Skull')} strokeWidth="1.5"/>
        {/* Nasal cavity */}
        <path d="M 216,72 L 214,78 L 220,80 L 226,78 L 224,72 Z"
          fill={isAct('Skull') ? 'rgba(34,211,238,0.15)' : '#0a0a18'} stroke={pStroke('Skull')} strokeWidth="1"/>
        {/* Cranial sutures */}
        <path d="M 220,30 L 218,52 M 193,54 C 205,50 215,52 220,52 C 225,52 235,50 247,54"
          fill="none" stroke={isAct('Skull') ? '#22d3ee55' : '#b8a050'} strokeWidth="1.5" opacity="0.5"/>
        <LabelText x={220} y={22} text="Skull" name="Skull"/>
      </g>
    </svg>
  );

  const renderSVG = () => {
    switch (slug) {
      case 'brain':    return renderBrain();
      case 'heart':    return renderHeart();
      case 'lungs':    return renderLungs();
      case 'digestive-system': return renderDigestive();
      case 'kidney':   return renderKidney();
      case 'skeletal-system':  return renderSkeletal();
      default:         return <svg viewBox="0 0 400 300"><text x="200" y="150" fill="#64748b" textAnchor="middle">Select an organ</text></svg>;
    }
  };

  const partCount = Object.keys((OFFSETS[slug] || {})).length;

  return (
    <div className="w-full h-full flex flex-col relative bg-[#060d18] border border-slate-800/60 rounded-2xl overflow-hidden shadow-2xl">

      {/* ── CONTROLS BAR ───────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/60 backdrop-blur-md">

        {/* Left: organ label */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0"/>
          <span className="text-xs font-bold text-slate-300 capitalize truncate">
            {slug.replace(/-/g, ' ')} Visualizer
          </span>
        </div>

        {/* Center controls */}
        <div className="flex items-center gap-3 flex-wrap">

          {/* Split Parts toggle */}
          <button
            onClick={toggleSplit}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              isSplit
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-lg shadow-cyan-950/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-600'
            }`}
            title={isSplit ? `Combine all ${partCount} parts` : `Explode into ${partCount} separate parts`}
          >
            <Layers size={13}/>
            <span>{isSplit ? `Combine Parts` : `Split Parts`}</span>
            {isSplit && <span className="ml-1 bg-cyan-500/30 text-cyan-200 rounded-full px-1.5 text-[10px]">{partCount}</span>}
          </button>

          {/* Dim Others toggle */}
          <button
            onClick={() => setDimOthers(p => !p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              dimOthers
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/60'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Dim unselected parts to focus on selected"
          >
            {dimOthers ? <EyeOff size={13}/> : <Eye size={13}/>}
            <span>Focus</span>
          </button>

          {/* 3D Tilt Rotation */}
          <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">3D Tilt</span>
            <input
              type="range" min="-45" max="45" value={tiltY}
              onChange={e => setTiltY(Number(e.target.value))}
              className="w-24 h-1 rounded-lg cursor-pointer"
              style={{ accentColor: '#22d3ee' }}
              title="Rotate view left/right for 3D perspective"
            />
            <span className="text-[10px] font-mono text-slate-400 w-8 text-right">{tiltY}°</span>
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
            <button onClick={() => doZoom(1.25)}
              className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-cyan-400 transition-colors" title="Zoom In">
              <ZoomIn size={13}/>
            </button>
            <button onClick={() => doZoom(0.8)}
              className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-cyan-400 transition-colors" title="Zoom Out">
              <ZoomOut size={13}/>
            </button>
            <button onClick={doReset}
              className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-cyan-400 transition-colors" title="Reset all controls">
              <RotateCcw size={13}/>
            </button>
          </div>
        </div>

        {/* Hovered part tooltip */}
        {hoveredPart && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-slate-900 border border-slate-700 text-xs text-cyan-300 px-3 py-1 rounded-lg shadow-xl pointer-events-none z-30 whitespace-nowrap font-semibold">
            {hoveredPart}
          </div>
        )}
      </div>

      {/* ── SVG CANVAS ─────────────────────────────────────────── */}
      {/* overflow-visible so split parts that extend slightly past SVG edges aren't clipped */}
      <div
        className={`flex-1 w-full pt-12 flex items-center justify-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ overflow: 'visible', position: 'relative', minHeight: 0 }}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
      >
        {/* Perspective wrapper for 3D tilt effect */}
        <div style={{ perspective: '800px', perspectiveOrigin: '50% 50%' }}>
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotateY(${tiltY}deg)`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              /* Fixed canvas size — SVG fills this via width/height 100% */
              width: '480px',
              height: '420px',
              /* Allow child <g> elements to animate outside this box without clipping */
              overflow: 'visible',
            }}
          >
            {renderSVG()}
          </div>
        </div>
      </div>

      {/* ── BOTTOM HINT ────────────────────────────────────────── */}
      <div className="absolute bottom-3 left-4 z-10 flex items-center gap-4 text-[10px] text-slate-600 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800/60 pointer-events-none backdrop-blur-sm">
        <span>🖱 Drag to pan</span>
        <span>📐 Tilt slider for 3D view</span>
        <span>👆 Click parts to select</span>
        {isSplit && <span className="text-cyan-600 font-semibold">✨ Split mode — each part is independent</span>}
      </div>
    </div>
  );
}
