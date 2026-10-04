import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle2, XCircle, Trophy, RefreshCw, BookOpen, Award } from 'lucide-react';

// Multi-question quiz bank per organ
const quizBank = {
  brain: [
    {
      question: "Which part of the brain controls body balance and coordination?",
      options: ["Cerebrum", "Cerebellum", "Thalamus", "Pituitary Gland"],
      answer: "Cerebellum",
      explanation: "The Cerebellum coordinates voluntary movements, balance, and fine motor control."
    },
    {
      question: "What is the largest and most prominent part of the brain?",
      options: ["Cerebellum", "Brain Stem", "Cerebrum", "Hypothalamus"],
      answer: "Cerebrum",
      explanation: "The Cerebrum (Telencephalon) accounts for about 85% of the brain's total weight."
    },
    {
      question: "Which brain structure acts as the 'sensory relay station'?",
      options: ["Hypothalamus", "Pituitary Gland", "Brain Stem", "Thalamus"],
      answer: "Thalamus",
      explanation: "Every sense except smell passes through the Thalamus before reaching the cortex."
    },
    {
      question: "What is the biological term for the Brain Stem?",
      options: ["Telencephalon", "Hypophysis", "Truncus Encephali", "Diencephalon"],
      answer: "Truncus Encephali",
      explanation: "The Brain Stem (Truncus Encephali) connects the brain to the spinal cord and controls breathing and heart rate."
    },
    {
      question: "Which gland is often called the 'master gland' of the endocrine system?",
      options: ["Thyroid", "Hypothalamus", "Adrenal Gland", "Pituitary Gland"],
      answer: "Pituitary Gland",
      explanation: "The Pituitary Gland (Hypophysis) controls growth, blood pressure, and other endocrine glands."
    }
  ],
  heart: [
    {
      question: "Which chamber pumps oxygenated blood to the entire body?",
      options: ["Right Atrium", "Left Atrium", "Right Ventricle", "Left Ventricle"],
      answer: "Left Ventricle",
      explanation: "The Left Ventricle has the thickest muscular wall to pump oxygenated blood throughout the body."
    },
    {
      question: "Which is the only artery in the body that carries deoxygenated blood?",
      options: ["Aorta", "Coronary Artery", "Pulmonary Artery", "Carotid Artery"],
      answer: "Pulmonary Artery",
      explanation: "The Pulmonary Artery carries deoxygenated blood from the right ventricle to the lungs."
    },
    {
      question: "What is the largest artery in the human body?",
      options: ["Pulmonary Artery", "Carotid Artery", "Aorta", "Femoral Artery"],
      answer: "Aorta",
      explanation: "The Aorta is the primary systemic artery that carries oxygen-rich blood away from the heart."
    },
    {
      question: "Which chamber collects oxygen-rich blood returning from the lungs?",
      options: ["Left Ventricle", "Right Atrium", "Right Ventricle", "Left Atrium"],
      answer: "Left Atrium",
      explanation: "The Left Atrium receives oxygenated blood from the pulmonary veins and pumps it to the Left Ventricle."
    },
    {
      question: "What is the biological term for the Right Atrium?",
      options: ["Ventriculus Dexter", "Atrium Sinistrum", "Atrium Dextrum", "Ventriculus Sinister"],
      answer: "Atrium Dextrum",
      explanation: "Atrium Dextrum (Right Atrium) collects deoxygenated blood from the body via the vena cava."
    }
  ],
  lungs: [
    {
      question: "Where does actual gas exchange (O2 and CO2) occur in the lungs?",
      options: ["Trachea", "Bronchi", "Bronchioles", "Alveoli"],
      answer: "Alveoli",
      explanation: "Alveoli are tiny air sacs surrounded by capillaries where oxygen enters the blood and CO2 leaves."
    },
    {
      question: "What is the windpipe commonly known as?",
      options: ["Bronchi", "Trachea", "Larynx", "Pharynx"],
      answer: "Trachea",
      explanation: "The Trachea (windpipe) connects the larynx to the bronchi and is kept open by C-shaped cartilage rings."
    },
    {
      question: "What are the fine branch subdivisions leading directly to the alveoli?",
      options: ["Bronchi", "Tracheal rings", "Bronchioles", "Pleura"],
      answer: "Bronchioles",
      explanation: "Bronchioles are tiny airways branching from the bronchi that deliver air to the alveoli."
    },
    {
      question: "Which structure divides the trachea into left and right passages?",
      options: ["Alveoli", "Bronchioles", "Tracheal rings", "Bronchi"],
      answer: "Bronchi",
      explanation: "The primary Bronchi split into left and right main bronchi, directing air into each lung."
    },
    {
      question: "What is the biological term for Alveoli?",
      options: ["Bronchioli", "Trachea", "Pleura", "Alveoli Pulmonis"],
      answer: "Alveoli Pulmonis",
      explanation: "Alveoli Pulmonis are the microscopic air sacs at the terminal end of the bronchioles."
    }
  ],
  kidney: [
    {
      question: "What is the functional unit of filtration in the kidney?",
      options: ["Cortex", "Medulla", "Nephron", "Renal Vein"],
      answer: "Nephron",
      explanation: "Each kidney contains about 1 million nephrons — the microscopic units that filter blood."
    },
    {
      question: "Which part of the kidney contains filtration units and produces erythropoietin?",
      options: ["Medulla", "Pelvis", "Renal Artery", "Cortex"],
      answer: "Cortex",
      explanation: "The Cortex (outer layer) contains renal corpuscles and produces the hormone erythropoietin."
    },
    {
      question: "Which blood vessel supplies unfiltered blood to the kidney?",
      options: ["Renal Vein", "Pulmonary Artery", "Renal Artery", "Aorta"],
      answer: "Renal Artery",
      explanation: "The Renal Artery branches from the abdominal aorta and carries up to 20% of cardiac output."
    },
    {
      question: "The inner region containing renal pyramids is called the?",
      options: ["Cortex", "Pelvis", "Medulla", "Nephron"],
      answer: "Medulla",
      explanation: "The Renal Medulla (inner portion) is formed of renal pyramids that funnel and concentrate urine."
    },
    {
      question: "What is the biological term for the kidney's outer layer?",
      options: ["Medulla Renis", "Nephronum", "Cortex Renis", "Arteria Renalis"],
      answer: "Cortex Renis",
      explanation: "Cortex Renis is the outer layer of the kidney that carries out primary blood filtration."
    }
  ],
  "skeletal-system": [
    {
      question: "How many bones make up the human skull?",
      options: ["12", "32", "22", "42"],
      answer: "22",
      explanation: "The skull is composed of 22 bones connected by cranial sutures — 8 cranial and 14 facial bones."
    },
    {
      question: "How many vertebrae make up the human spine?",
      options: ["24", "30", "26", "33"],
      answer: "33",
      explanation: "The spine (Columna Vertebralis) consists of 33 vertebrae organized into cervical, thoracic, lumbar, sacral, and coccygeal regions."
    },
    {
      question: "Which structure protects the heart and lungs?",
      options: ["Pelvis", "Skull", "Spine", "Rib Cage"],
      answer: "Rib Cage",
      explanation: "The Rib Cage (Cavea Thoracis) encloses the thoracic cavity and aids in breathing movements."
    },
    {
      question: "How many pairs of ribs does the human body have?",
      options: ["10", "11", "12", "13"],
      answer: "12",
      explanation: "The human rib cage is composed of 12 pairs of ribs attached to the thoracic vertebrae and sternum."
    },
    {
      question: "What is the biological term for the human spine?",
      options: ["Pelvis", "Cavea Thoracis", "Cranium", "Columna Vertebralis"],
      answer: "Columna Vertebralis",
      explanation: "Columna Vertebralis (vertebral column) supports the body, allows flexibility, and protects the spinal cord."
    }
  ],
  "digestive-system": [
    {
      question: "Which organ produces bile for fat digestion?",
      options: ["Stomach", "Pancreas", "Liver", "Small Intestine"],
      answer: "Liver",
      explanation: "The Liver (Hepar) produces bile, processes nutrients, and filters blood toxins. It is the largest internal organ."
    },
    {
      question: "Where does most nutrient absorption occur?",
      options: ["Stomach", "Large Intestine", "Esophagus", "Small Intestine"],
      answer: "Small Intestine",
      explanation: "The Small Intestine is approximately 20 feet long and is the primary site of nutrient absorption."
    },
    {
      question: "Which organ both produces digestive enzymes AND regulates blood sugar?",
      options: ["Liver", "Stomach", "Pancreas", "Large Intestine"],
      answer: "Pancreas",
      explanation: "The Pancreas has both exocrine (enzymes) and endocrine (insulin/glucagon) functions."
    },
    {
      question: "What muscular action propels food through the esophagus?",
      options: ["Diffusion", "Peristalsis", "Osmosis", "Absorption"],
      answer: "Peristalsis",
      explanation: "The Esophagus uses wave-like muscular contractions called peristalsis to move food to the stomach."
    },
    {
      question: "Which part of the digestive system hosts the largest microbiome?",
      options: ["Stomach", "Small Intestine", "Esophagus", "Large Intestine"],
      answer: "Large Intestine",
      explanation: "The Large Intestine (Intestinum Crassum) hosts trillions of beneficial bacteria and absorbs water."
    }
  ]
};

export default function Quiz() {
  const { organSlug } = useParams();
  const navigate = useNavigate();

  const questions = quizBank[organSlug] || quizBank.brain;
  const organName = organSlug
    ? organSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Brain';

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);

  useEffect(() => {
    if (finished) {
      const token = localStorage.getItem('token');
      if (token) {
        axios.post(`${import.meta.env.VITE_API_URL}/quiz/submit`, {
          organ: organSlug || 'brain',
          quizType: 'mcq',
          totalQuestions: questions.length,
          correctAnswers: score,
          score: Math.round((score / questions.length) * 100),
          answers: answers.map(a => ({
            question: a.question,
            userAnswer: a.selected,
            correctAnswer: a.correct,
            isCorrect: a.isCorrect
          }))
        }, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
          if (res.data?.newBadges?.length > 0) {
            setEarnedBadges(res.data.newBadges);
          }
        }).catch(() => {});
      }
    }
  }, [finished]);

  const quiz = questions[currentQ];

  const handleSelect = (opt) => {
    if (!submitted) setSelected(opt);
  };

  const handleSubmit = () => {
    if (!selected) return;
    const isCorrect = selected === quiz.answer;
    if (isCorrect) setScore(s => s + 1);
    setAnswers(prev => [...prev, { question: quiz.question, selected, correct: quiz.answer, isCorrect }]);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentQ + 1 < questions.length) {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelected(null);
    setSubmitted(false);
    setScore(0);
    setFinished(false);
    setAnswers([]);
  };

  const percentage = Math.round((score / questions.length) * 100);
  const getGrade = () => {
    if (percentage >= 90) return { label: 'Excellent!', color: 'text-green-400', emoji: '🏆' };
    if (percentage >= 70) return { label: 'Good Job!', color: 'text-cyan-400', emoji: '⭐' };
    if (percentage >= 50) return { label: 'Keep Studying', color: 'text-yellow-400', emoji: '📚' };
    return { label: 'Try Again', color: 'text-red-400', emoji: '💪' };
  };

  // ── Score / Result Screen ───────────────────────────────────────────────
  if (finished) {
    const grade = getGrade();
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950">
        <div className="glass-panel max-w-2xl w-full p-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="text-6xl mb-4">{grade.emoji}</div>
            <h2 className="text-3xl font-bold text-white">Quiz Complete!</h2>
            <p className="text-slate-400">{organName} — Knowledge Check</p>
          </div>

          {/* Score Ring */}
          <div className="flex justify-center">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#1e293b" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke={percentage >= 70 ? '#06b6d4' : percentage >= 50 ? '#eab308' : '#ef4444'}
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - percentage / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{score}/{questions.length}</span>
                <span className="text-xs text-slate-400">{percentage}%</span>
              </div>
            </div>
          </div>

          <div className={`text-center text-2xl font-bold ${grade.color}`}>{grade.label}</div>

          {/* Newly Unlocked Badges */}
          {earnedBadges.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/40 p-4 rounded-2xl flex items-center justify-center gap-3 animate-bounce">
              <span className="text-3xl">{earnedBadges[0].icon}</span>
              <div className="text-left">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Achievement Badge Unlocked!</div>
                <div className="text-sm font-bold text-white">{earnedBadges[0].name}</div>
              </div>
            </div>
          )}

          {/* Answer Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Review Answers</h3>
            {answers.map((a, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${
                  a.isCorrect
                    ? 'bg-green-900/20 border-green-800/50'
                    : 'bg-red-900/20 border-red-800/50'
                }`}
              >
                {a.isCorrect
                  ? <CheckCircle2 size={16} className="text-green-400 mt-0.5 shrink-0" />
                  : <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 font-medium truncate">{a.question}</p>
                  {!a.isCorrect && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Your answer: <span className="text-red-400">{a.selected}</span>
                      {' · '}
                      Correct: <span className="text-green-400">{a.correct}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleRestart}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all"
            >
              <RefreshCw size={16} /> Retry Quiz
            </button>
            <button
              onClick={() => navigate(`/viewer/${organSlug}`)}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all"
            >
              <BookOpen size={16} /> Back to Study
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-all"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Question Screen ──────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
      >
        <ArrowLeft size={20} /> Back to Visualizer
      </button>

      <div className="glass-panel max-w-2xl w-full p-10 space-y-7">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy size={18} className="text-cyan-400" />
              {organName} Quiz
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Test your knowledge</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-cyan-400">{currentQ + 1}</span>
            <span className="text-slate-500">/{questions.length}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentQ) / questions.length) * 100}%` }}
          />
        </div>

        {/* Score Running Total */}
        <div className="flex justify-between text-xs text-slate-500">
          <span>Score: <span className="text-cyan-400 font-bold">{score}</span> correct</span>
          <span>{questions.length - currentQ - 1} question{questions.length - currentQ - 1 !== 1 ? 's' : ''} remaining</span>
        </div>

        {/* Question */}
        <p className="text-xl text-white font-semibold leading-relaxed">{quiz.question}</p>

        {/* Options */}
        <div className="space-y-3">
          {quiz.options.map((opt, i) => {
            const isCorrect = opt === quiz.answer;
            const isSelected = selected === opt;

            let btnClass =
              "w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-base flex items-center justify-between gap-3 ";

            if (!submitted) {
              btnClass += isSelected
                ? "border-cyan-500 bg-cyan-900/30 text-white shadow-lg shadow-cyan-950/40"
                : "border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600 text-slate-300 cursor-pointer";
            } else {
              if (isCorrect)
                btnClass += "border-green-500 bg-green-900/30 text-green-300";
              else if (isSelected && !isCorrect)
                btnClass += "border-red-500 bg-red-900/30 text-red-300";
              else
                btnClass += "border-slate-800 bg-slate-900/30 text-slate-600 opacity-50";
            }

            return (
              <button
                key={i}
                disabled={submitted}
                onClick={() => handleSelect(opt)}
                className={btnClass}
              >
                <span className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                    isSelected && !submitted ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300' :
                    submitted && isCorrect ? 'border-green-500 bg-green-500/20 text-green-300' :
                    submitted && isSelected ? 'border-red-500 bg-red-500/20 text-red-300' :
                    'border-slate-600 text-slate-500'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </span>
                {submitted && isCorrect && <CheckCircle2 className="text-green-400 shrink-0" size={20} />}
                {submitted && isSelected && !isCorrect && <XCircle className="text-red-400 shrink-0" size={20} />}
              </button>
            );
          })}
        </div>

        {/* Explanation (shown after submit) */}
        {submitted && (
          <div className={`p-4 rounded-xl border text-sm ${
            selected === quiz.answer
              ? 'bg-green-900/20 border-green-800/50 text-green-300'
              : 'bg-red-900/20 border-red-800/50 text-red-300'
          }`}>
            <span className="font-bold">{selected === quiz.answer ? '✓ Correct! ' : '✗ Incorrect. '}</span>
            <span className="text-slate-300">{quiz.explanation}</span>
          </div>
        )}

        {/* Action Button */}
        {!submitted ? (
          <button
            disabled={!selected}
            onClick={handleSubmit}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              selected
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/30 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-4 rounded-xl font-bold text-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-lg shadow-cyan-900/30 active:scale-95"
          >
            {currentQ + 1 < questions.length ? 'Next Question →' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  );
}
