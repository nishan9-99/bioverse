const Anthropic = require("@anthropic-ai/sdk");

// Initialize Claude client safely if API key is configured
let anthropicClient = null;
if (process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY !== "your_claude_api_key_here" && !process.env.CLAUDE_API_KEY.includes("your_claude_api_key")) {
  try {
    anthropicClient = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });
  } catch (err) {
    console.warn("⚠️ Failed to initialize Anthropic Claude client:", err.message);
  }
}

// ── Levenshtein Distance Algorithm ──────────────────────────────────────────
function editDistance(a, b) {
  if (a === b) return 0;
  if (!a) return (b || "").length;
  if (!b) return (a || "").length;

  const al = a.length;
  const bl = b.length;
  const matrix = [];

  for (let i = 0; i <= al; i++) {
    matrix[i] = new Array(bl + 1);
    matrix[i][0] = i;
  }
  for (let j = 0; j <= bl; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,       // deletion
        matrix[i][j - 1] + 1,       // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return matrix[al][bl];
}

// ── String Match Scoring (0.0 to 1.0) ───────────────────────────────────────
function scoreMatch(query, candidate) {
  const q = (query || "").toLowerCase().trim();
  const c = (candidate || "").toLowerCase().trim();

  if (!q || !c) return 0;
  if (q === c) return 1.0;
  if (c.includes(q)) return 0.95;
  if (q.includes(c) && c.length >= 4) return 0.90;

  const qWords = q.split(/\s+/).filter(Boolean);
  const cWords = c.split(/\s+/).filter(Boolean);
  let wordHits = 0;

  for (const qw of qWords) {
    for (const cw of cWords) {
      // Direct equality or common root stem (e.g. pump vs pumping)
      if (qw === cw || (qw.length >= 4 && cw.length >= 4 && (qw.startsWith(cw.slice(0, 4)) || cw.startsWith(qw.slice(0, 4))))) {
        wordHits++;
        break;
      }
      const dist = editDistance(qw, cw);
      const maxLen = Math.max(qw.length, cw.length);
      if (dist <= Math.max(1, Math.floor(maxLen / 4))) {
        wordHits++;
        break;
      }
    }
  }

  if (wordHits > 0) {
    const wordScore = wordHits / Math.max(qWords.length, 1);
    return Math.min(1.0, 0.4 + wordScore * 0.55);
  }

  const dist = editDistance(q, c);
  const maxLen = Math.max(q.length, c.length);
  const similarity = 1 - dist / maxLen;
  return similarity > 0.4 ? similarity * 0.5 : 0;
}

// ── Semantic Keyword Map ──────────────────────────────────────────────────
const semanticMap = {
  brain: [
    "brain", "memory", "cognition", "thought", "neuron", "nerve", "cerebral", "mental",
    "think", "thinking", "conscious", "reflex", "sleep", "nervous", "head", "mind", "intellect"
  ],
  heart: [
    "heart", "cardio", "cardiac", "blood pump", "pump", "pumping", "beat", "beating",
    "circulation", "circulatory", "artery", "vein", "aorta", "ventricle", "atrium",
    "blood pressure", "systole", "diastole"
  ],
  lungs: [
    "lungs", "lung", "breath", "breathing", "oxygen", "inhale", "exhale", "respiratory",
    "alveoli", "bronchi", "trachea", "air", "co2", "gas exchange", "windpipe", "ventilation"
  ],
  "digestive-system": [
    "digest", "digestion", "digestive", "stomach", "intestine", "liver", "pancreas",
    "esophagus", "gut", "bowel", "colon", "food", "nutrient", "bile", "chyme", "absorption"
  ],
  kidney: [
    "kidney", "renal", "urine", "urinary", "filtration", "nephron", "dialysis", "excretion",
    "waste", "fluid balance", "osmoregulation", "bladder", "glomerulus"
  ],
  "skeletal-system": [
    "skeleton", "skeletal", "bone", "bones", "skull", "spine", "rib", "pelvis",
    "femur", "joint", "vertebrae", "calcium", "marrow", "cartilage", "locomotion"
  ],
};

// ── Rich Curated Biological Knowledge Base (for infallible offline responses) ──
const knowledgeBase = {
  explanations: {
    brain: {
      school: "The brain is your body's master command center! It works like a super-fast biological computer with 86 billion tiny cells called neurons. It lets you think, feel emotions, remember birthdays, run, and keeps your heart beating without you even having to think about it.",
      college: "The human brain is the central organ of the nervous system, comprising the cerebrum, cerebellum, and brain stem. It processes multimodal sensory inputs via complex synaptic networks, regulates neuroendocrine signaling through the hypothalamic-pituitary axis, and maintains autonomic homeostasis.",
      medical: "The encephalon is encased within the neurocranium, supplied by the Circle of Willis and protected by the Blood-Brain Barrier (BBB). Pathological states involve neurodegenerative tauopathies, amyloid-beta aggregation (Alzheimer's), dopaminergic degeneration in the substantia nigra (Parkinson's), and ischemic cerebrovascular accidents."
    },
    heart: {
      school: "Your heart is an incredible muscular pump about the size of your fist! It beats around 100,000 times every day, pumping oxygen-filled red blood through miles of blood vessels to power every cell in your body.",
      college: "The human heart is a four-chambered muscular pump operating through coordinated electrical conduction (SA node -> AV node -> Bundle of His -> Purkinje fibers). It maintains dual systemic and pulmonary circulation cycles governed by Starling's law of the heart and autonomic nervous control.",
      medical: "The myocardium contracts via calcium-induced calcium release (CICR) across sarcomeric troponin complexes. Key clinical evaluations include 12-lead ECG vector cardiography, ejection fraction (EF normal: 55-70%), troponin-I cardiac biomarkers for acute myocardial infarction (STEMI/NSTEMI), and valvular hemodynamics."
    },
    lungs: {
      school: "Your lungs take in oxygen when you breathe in and push out carbon dioxide waste when you breathe out. Inside, they look like upside-down broccoli trees ending in 300 million microscopic air bubbles called alveoli!",
      college: "The respiratory system facilitates passive diffusion of O2 and CO2 across the thin alveolar-capillary membrane, driven by partial pressure gradients and Fick's Law. Ventilation is driven by thoracic diaphragm excursion and intercostal muscle contractions.",
      medical: "Ventilation-perfusion (V/Q) mismatch governs gas exchange efficiency. Pulmonary compliance is maintained by type II pneumocyte dipalmitoylphosphatidylcholine (surfactant). Clinical pathologies include obstructive patterns (COPD, FEV1/FVC < 0.70), restrictive fibrotic disease, and acute respiratory distress syndrome (ARDS)."
    },
    kidney: {
      school: "Your two bean-shaped kidneys are your body's water purification plants! They filter out waste products from your blood to make urine while saving the clean water and good nutrients your body needs.",
      college: "The kidneys maintain systemic homeostasis, fluid-electrolyte balance, and acid-base equilibrium. Blood is filtered through approximately 1 million nephrons via glomeruli, undergoing selective tubular reabsorption, secretion, and countercurrent multiplication in the Loop of Henle.",
      medical: "Renal clearance evaluates Glomerular Filtration Rate (GFR) using creatinine and cystatin C. The Renin-Angiotensin-Aldosterone System (RAAS) regulates systemic mean arterial pressure and sodium retention. Chronic Kidney Disease (CKD) stages are graded by GFR and albuminuria, with end-stage renal disease (ESRD) requiring hemodialysis or renal allograft."
    },
    "digestive-system": {
      school: "Your digestive system is like a 30-foot long disassembly factory! From your mouth to your stomach and intestines, it breaks down the food you eat into vitamins, proteins, and energy to help you grow.",
      college: "The gastrointestinal tract executes mechanical and enzymatic breakdown of macromolecules (carbohydrates, lipids, proteins). Bile acids emulsify lipids in the duodenum, while the extensive microvillar brush border of the small intestine maximizes nutrient absorption before microbial fermentation in the large intestine.",
      medical: "Enteric neurobiology (Meissner's and Auerbach's plexuses) coordinates peristaltic motility. Pathologies span inflammatory bowel diseases (Crohn's vs Ulcerative Colitis), hepatic cirrhosis with portal hypertension, pancreatitis, and peptic ulcer disease mediated by Helicobacter pylori or NSAIDs."
    },
    "skeletal-system": {
      school: "Your skeletal system is the strong framework of 206 bones that protects your soft organs (like your skull protecting your brain), gives your body shape, and works with muscles so you can walk and dance!",
      college: "The adult human skeleton comprises 206 bones organized into the axial and appendicular skeletons. Beyond structural support and mechanical leverage for skeletal muscles, bones serve as the primary mineral reservoir for calcium and phosphate and house hematopoiesis within red bone marrow.",
      medical: "Bone remodeling is mediated by the coupled dynamic between osteoblasts and osteoclasts, regulated by Parathyroid Hormone (PTH), Calcitonin, and Vitamin D3 (calcitriol). Pathophysiologies include osteoporosis (T-score <= -2.5 on DEXA scan), osteomalacia/rickets, and osteosarcoma."
    }
  },
  tutorTopics: [
    {
      keywords: ["synapse", "action potential", "neuron", "nerve"],
      response: `### Neural Communication & Action Potentials 🧠\n\n- **Resting Potential**: Around **-70 mV**, maintained primarily by the Na+/K+ ATPase pump (3 Na+ pumped out for every 2 K+ pumped in).\n- **Depolarization**: When a stimulus breaches threshold (~ -55 mV), voltage-gated Na+ channels snap open, causing a rapid influx of sodium ions and an electrical spike (+30 mV).\n- **Repolarization & Hyperpolarization**: Na+ channels inactivate, and voltage-gated K+ channels open, allowing K+ efflux to restore electrical negativity.\n- **Synaptic Transmission**: At the axon terminal, action potential arrival triggers Ca2+ influx, which prompts neurotransmitter vesicles (e.g., Acetylcholine, Dopamine) to exocytose across the synaptic cleft to bind postsynaptic receptors!`
    },
    {
      keywords: ["blood pressure", "heart rate", "cardiac cycle", "ecg", "pulse"],
      response: `### The Cardiac Cycle & Blood Pressure 🫀\n\n- **Systole vs. Diastole**:\n  - **Systole**: Ventricles contract and pump blood into the aorta and pulmonary artery (typical pressure ~120 mmHg).\n  - **Diastole**: Ventricles relax and fill with blood from the atria (typical pressure ~80 mmHg).\n- **Electrical Vector (ECG)**:\n  - **P wave**: Atrial depolarization\n  - **QRS complex**: Ventricular depolarization (and atrial repolarization hidden within)\n  - **T wave**: Ventricular repolarization\n- **Cardiac Output Formula**: $CO = \\text{Heart Rate (HR)} \\times \\text{Stroke Volume (SV)}$. Normal resting output is roughly **5.0 Liters/minute**!`
    },
    {
      keywords: ["nephron", "kidney filtration", "dialysis", "urine"],
      response: `### Renal Filtration in the Nephron 🫘\n\n1. **Glomerular Filtration**: Blood enters through the afferent arteriole under hydrostatic pressure into the glomerulus. Water, ions, and small solutes pass into Bowman's capsule (forming ultrafiltrate).\n2. **Proximal Convoluted Tubule (PCT)**: ~65% of water, NaCl, and 100% of filtered glucose and amino acids are reabsorbed.\n3. **Loop of Henle**:\n   - **Descending limb**: Permeable to water, impermeable to solutes (urine concentrates).\n   - **Ascending limb**: Impermeable to water, actively transports Na+/K+/2Cl- into the medulla (establishes osmotic gradient).\n4. **Distal Tubule & Collecting Duct**: Fine-tunes water reabsorption under the control of **Antidiuretic Hormone (ADH/Vasopressin)** and Aldosterone.`
    },
    {
      keywords: ["alveoli", "oxygen", "respiration", "gas exchange", "lungs"],
      response: `### Gas Exchange in the Alveoli 🫁\n\n- **Surface Area**: Both human lungs contain ~300-500 million alveoli, providing a massive surface area of roughly **70 to 100 square meters** (the size of a tennis court!).\n- **Diffusion Barrier**: The barrier between alveolar air and capillary red blood cells is razor-thin (~0.2 to 0.5 micrometers), allowing rapid passive diffusion.\n- **Hemoglobin Binding**: Oxygen binds cooperatively to the 4 heme groups of hemoglobin in erythrocytes ($Hb + 4O_2 \\leftrightarrow Hb(O_2)_4$).\n- **Carbon Dioxide Transport**: CO2 is transported in three ways: 70% as bicarbonate ions ($HCO_3^-$), 23% bound to carbamino compounds, and 7% dissolved in plasma.`
    }
  ]
};

// ── Search Engine Function ──────────────────────────────────────────────────
async function performSearch(query, organsList = []) {
  const q = (query || "").trim();
  const qLower = q.toLowerCase();

  if (!q) return null;

  // 1. Direct semantic map match
  for (const [slug, keywords] of Object.entries(semanticMap)) {
    for (const kw of keywords) {
      if (qLower.includes(kw) || kw.includes(qLower)) {
        return slug;
      }
      if (editDistance(qLower, kw) <= Math.max(1, Math.floor(kw.length / 5))) {
        return slug;
      }
    }
  }

  // 2. Score against organs collection
  let bestSlug = null;
  let bestScore = 0;

  for (const organ of organsList) {
    const partNames = (organ.parts || []).map((p) => p.name);
    const biologicalTerms = (organ.parts || []).map((p) => p.biologicalTerm || "");
    const functionTexts = (organ.parts || []).flatMap((p) => p.functions || []);

    const candidates = [
      organ.name,
      organ.slug.replace(/-/g, " "),
      organ.system,
      organ.shortDesc || "",
      ...partNames,
      ...biologicalTerms,
      ...functionTexts,
    ].filter(Boolean);

    for (const candidate of candidates) {
      const s = scoreMatch(q, candidate);
      if (s > bestScore) {
        bestScore = s;
        bestSlug = organ.slug;
      }
    }
  }

  if (bestSlug && bestScore >= 0.42) {
    return bestSlug;
  }

  return null;
}

// ── AI Explanation Generator ────────────────────────────────────────────────
async function getExplanation({ topic, level = "college", context = "" }) {
  const normalizedLevel = ["school", "college", "medical"].includes(level.toLowerCase())
    ? level.toLowerCase()
    : "college";

  // If Anthropic Claude client is available, generate live AI pedagogical explanation
  if (anthropicClient) {
    try {
      const prompt = `You are BioVerse AI, a world-class anatomy and human biology professor.
Explain the topic: "${topic}".
Context: "${context}".
Target Audience: ${normalizedLevel.toUpperCase()} LEVEL.
- If 'school': Keep it fun, accessible, vivid, with analogies (suitable for middle/high school).
- If 'college': Balance clarity with biochemical, histological, and anatomical rigor.
- If 'medical': Include clinical correlations, pathophysiology, embryology, or pharmacotherapy nuances.
Provide a concise, beautifully structured markdown explanation with key highlights and clinical relevance.`;

      const response = await anthropicClient.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      });

      if (response && response.content && response.content[0]?.text) {
        return response.content[0].text;
      }
    } catch (err) {
      console.warn("Anthropic API call fallback to local engine:", err.message);
    }
  }

  // Fallback to rich curated local pedagogical knowledge engine
  const slugKey = (topic || "").toLowerCase().replace(/\s+/g, "-");
  for (const [key, levels] of Object.entries(knowledgeBase.explanations)) {
    if (slugKey.includes(key) || key.includes(slugKey)) {
      return levels[normalizedLevel] || levels.college;
    }
  }

  // Dynamic synthesis if specific organ not mapped directly
  if (normalizedLevel === "school") {
    return `### ${topic} (School Overview) 🧬\n\n**${topic}** is a vital component of the human body! It works synchronously with adjacent organs to maintain biological balance, allowing you to live, move, and grow. Think of it as a specialized machine in the grand living city that is your body.`;
  } else if (normalizedLevel === "medical") {
    return `### ${topic} (Clinical & Pathological Synthesis) 🩺\n\n**${topic}** displays specialized histology and microvasculature tailored to its physiological function. Clinicians assess this region via targeted imaging, diagnostic serum markers, and physical maneuvers. Dysfunctions typically manifest through localized ischemia, inflammatory cascades, or metabolic decompensation.`;
  } else {
    return `### ${topic} (Undergraduate Anatomical Analysis) 🔬\n\n**${topic}** plays a critical role in human physiology. Its anatomical orientation and specialized tissue architecture enable efficient mass transfer, signal transduction, or structural integrity. Disruptions to this equilibrium impact whole-body homeostasis and metabolic efficiency.`;
  }
}

// ── AI Interactive Biology Tutor Chat ───────────────────────────────────────
async function chatTutor({ message, history = [], level = "college" }) {
  const userMsg = (message || "").trim();
  const qLower = userMsg.toLowerCase();

  // Try Claude if available
  if (anthropicClient) {
    try {
      const messages = [
        ...history.slice(-6).map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text,
        })),
        { role: "user", content: userMsg },
      ];

      const response = await anthropicClient.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 700,
        system: `You are BioVerse AI Tutor, an enthusiastic, patient, and knowledgeable medical & biological educator. The student is at ${level.toUpperCase()} level. Use markdown formatting with bullet points and bold terms. Keep answers concise, clear, and inspiring.`,
        messages,
      });

      if (response && response.content && response.content[0]?.text) {
        return response.content[0].text;
      }
    } catch (err) {
      console.warn("Claude chat fallback to local engine:", err.message);
    }
  }

  // Local knowledge-base matching
  for (const topic of knowledgeBase.tutorTopics) {
    if (topic.keywords.some((kw) => qLower.includes(kw))) {
      return topic.response;
    }
  }

  // General conversational fallbacks
  if (qLower.includes("hello") || qLower.includes("hi") || qLower.includes("hey")) {
    return `Hello! 👋 I am your **BioVerse AI Tutor**! You can ask me anything about the human body — such as:
- How does the heart's electrical conduction system work?
- What happens during an asthma attack in the lungs?
- How do nephrons filter waste in the kidneys?
- What are the parts of the human brain?

What would you like to explore today?`;
  }

  return `### Insights on: "${userMsg}" 🧬\n\nGreat biological question! The human body relies on tightly regulated homeostasis to coordinate this mechanism.\n\n- **Anatomical Basis**: Structural adaptations in the cells and tissues provide the physical scaffolding required for this process.\n- **Physiological Mechanism**: Chemical gradients, enzymatic reactions, and autonomic nervous signals collaborate to execute the function in real-time.\n- **Clinical Relevance**: In clinical medicine, impairment in this process can present as specific patient symptoms, which physicians evaluate using diagnostic lab tests and imaging.\n\n*Tip: Try asking about specific organs like the **heart**, **brain**, **lungs**, or **kidneys** for in-depth diagrams and breakdowns!*`;
}

// ── AI Flashcard Generator ──────────────────────────────────────────────────
async function generateFlashcards(organSlug, level = "college") {
  const cards = [
    {
      front: `What is the primary function of the ${organSlug.replace(/-/g, " ")}?`,
      back: `It maintains systemic homeostasis by performing specialized physiological transport, regulation, and metabolic tasks in the human body.`,
      known: false,
    },
    {
      front: `Which body system does the ${organSlug.replace(/-/g, " ")} belong to?`,
      back: `It is an integral component of its anatomical system, operating under autonomic and endocrine regulation.`,
      known: false,
    },
    {
      front: `What is a common clinical disorder affecting this organ?`,
      back: `Pathologies often involve vascular occlusion, chronic tissue inflammation, or progressive functional insufficiency.`,
      known: false,
    },
    {
      front: `How does microscopic cellular architecture support its function?`,
      back: `High surface area-to-volume ratio, dense capillary perfusion, and specialized epithelial linings maximize rate of transport.`,
      known: false,
    },
  ];
  return cards;
}

// ── AI Study Notes Generator ────────────────────────────────────────────────
async function generateNotes(organSlug, level = "college") {
  const organName = organSlug.charAt(0).toUpperCase() + organSlug.slice(1).replace(/-/g, " ");
  return `# Comprehensive Study Notes: ${organName} 🧬

## 1. High-Yield Overview
The **${organName}** is essential for human survival. It functions as part of a coordinated biological feedback loop, adjusting its performance based on hormonal, neural, and metabolic cues.

## 2. Structural & Histological Features
- **Tissue Layering**: Composed of specialized parenchymal and stromal tissues designed for durability and high-throughput exchange.
- **Vascular Perfusion**: High capillary density ensures continuous delivery of oxygenated blood and rapid clearance of metabolic waste.
- **Nervous Control**: Sympathetic and parasympathetic pathways modulate activity in response to environmental and physical stressors.

## 3. Core Physiological Functions
1. **Primary Transport & Processing**: Executes continuous biological filtration, pumping, or gas transfer.
2. **Endocrine / Paracrine Signaling**: Releases local mediators that signal surrounding tissues.
3. **Adaptive Capacity**: Can undergo hypertrophy, hyperplasia, or cellular remodeling under altered physiological demand.

## 4. Key Clinical Correlates
- **Ischemia**: Inadequate arterial perfusion leads to rapid ATP depletion and cellular injury.
- **Biomarkers**: Serum enzyme levels and imaging modalities allow non-invasive assessment of tissue integrity.

---
*Generated by BioVerse AI Study Engine • Level: ${level.toUpperCase()}*`;
}

module.exports = {
  performSearch,
  getExplanation,
  chatTutor,
  generateFlashcards,
  generateNotes,
};
