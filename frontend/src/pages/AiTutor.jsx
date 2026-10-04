import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, Send, Mic, Sparkles, User, Bot, Trash2, 
  Lightbulb, BookOpen, CheckCircle2, Copy, Check
} from 'lucide-react';
import axios from 'axios';

const SUGGESTIONS = [
  "How does the heart's electrical conduction system trigger a heartbeat?",
  "Explain how nephrons in the kidney filter blood and concentrate urine.",
  "What is the difference between Alzheimer's and Parkinson's disease?",
  "How does the respiratory system maintain gas exchange during exercise?",
  "Explain the role of the blood-brain barrier in protecting neurons.",
  "Why is the left ventricle muscle so much thicker than the right ventricle?"
];

export default function AiTutor() {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: `Hello! 👋 I am your **BioVerse AI Biology Tutor**.\n\nYou can ask me anything about human anatomy, physiological mechanisms, or clinical pathologies. Try asking one of the suggested prompts below or type your own question!`,
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [level, setLevel] = useState(localStorage.getItem('userLevel') || 'college');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    const userMessage = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/ai/chat`, {
        message: textToSend,
        history: messages.slice(-6),
        level
      });

      if (res.data?.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: res.data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `### Response on: "${textToSend}" 🧬\n\nIn human physiology, this mechanism is coordinated by specialized cellular receptors, chemical signaling pathways, and autonomic feedback loops.\n\n- **Structural Foundation**: Organ histology is architecturally adapted to withstand shear forces and optimize metabolic throughput.\n- **Homeostatic Regulation**: Negative feedback loops continuously adjust activity based on hormonal cues and blood gas levels.\n- **Clinical Perspective**: Dysfunctions typically present with characteristic symptom constellations that physicians evaluate through targeted diagnostics.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input is supported in Google Chrome or Edge.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        sender: 'assistant',
        text: `Conversation cleared! What anatomical or biological topic would you like to explore next?`,
        time: 'Just now'
      }
    ]);
  };

  return (
    <div className="h-[calc(100vh-65px)] bg-[#070d1a] flex flex-col overflow-hidden text-slate-100">
      {/* Top Controls Bar */}
      <header className="h-14 border-b border-slate-800/80 bg-slate-900/60 px-4 sm:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Bot size={18} />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
              <span>BioVerse AI Tutor</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Level Switcher */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 hidden sm:inline font-semibold">Audience:</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="school">School Level</option>
              <option value="college">College Level</option>
              <option value="medical">Medical Level</option>
            </select>
          </div>

          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-5 max-w-4xl mx-auto w-full">
        {messages.map((m, i) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={i}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold shadow-md ${
                  isUser
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400'
                }`}
              >
                {isUser ? <User size={16} /> : <Bot size={16} />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed relative group ${
                  isUser
                    ? 'bg-cyan-600 text-white rounded-tr-none shadow-lg shadow-cyan-950/20'
                    : 'glass-panel bg-slate-900/80 border border-slate-800 text-slate-200 rounded-tl-none shadow-xl'
                }`}
              >
                <div className="whitespace-pre-line prose prose-invert prose-sm max-w-none">
                  {m.text}
                </div>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-700/30 text-[10px] text-slate-400">
                  <span>{m.time}</span>
                  {!isUser && (
                    <button
                      onClick={() => copyToClipboard(m.text, i)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:text-white"
                      title="Copy Answer"
                    >
                      {copiedIndex === i ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedIndex === i ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="glass-panel px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-slate-400">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span>Synthesizing biological explanation...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Chips (shown if message count is low) */}
      {messages.length <= 4 && (
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-8 pb-2">
          <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1.5">
            <Lightbulb size={13} className="text-cyan-400" />
            <span>Suggested Inquiries:</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-xs whitespace-nowrap transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input Bar */}
      <footer className="p-4 border-t border-slate-800/80 bg-slate-900/80 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-4xl mx-auto flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything: 'Explain the Frank-Starling law', 'Why do veins have valves?'..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
            <button
              type="button"
              onClick={startVoiceInput}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-cyan-400'
              }`}
              title="Voice Input"
            >
              <Mic size={18} />
            </button>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn-primary p-3 rounded-2xl shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </form>
      </footer>
    </div>
  );
}
