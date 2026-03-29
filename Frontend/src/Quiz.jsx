import { useState } from 'react';
import { ArrowLeft, Sparkles, Zap, Moon, Sun, Coffee, MessageSquare, Terminal, Layout, Cpu, Ghost, AlertTriangle } from 'lucide-react';

const questions = [
  {
    id: 1,
    question: "When do you reach your peak productivity?",
    options: [
      { text: "Late night with lo-fi beats", icon: Moon, tag: "Night Owl" },
      { text: "Early morning with fresh coffee", icon: Sun, tag: "Early Bird" },
      { text: "Whenever the vibes are right", icon: Sparkles, tag: "Vibe Manager" },
      { text: "In hyper-focused short sprints", icon: Zap, tag: "Speedrunner" }
    ]
  },
  {
    id: 2,
    question: "How do you start a new project?",
    options: [
      { text: "Start coding immediately", icon: Terminal, tag: "Code Ninja" },
      { text: "Focus on perfect visuals first", icon: Layout, tag: "Design Guru" },
      { text: "Plan the architecture thoroughly", icon: Cpu, tag: "Architect" },
      { text: "Discuss and iterate with the team", icon: MessageSquare, tag: "Main Character" }
    ]
  },
  {
    id: 3,
    question: "How do you feel about 'quick calls'?",
    options: [
      { text: "Prefer to stay behind the scenes", icon: Ghost, tag: "Silent Protector" },
      { text: "Love documenting the process", icon: Sparkles, tag: "Content Creator" },
      { text: "Could this have been an email?", icon: Coffee, tag: "Efficiency Expert" },
      { text: "Always ready for the discussion", icon: Zap, tag: "The Hypebeast" }
    ]
  },
  {
    id: 4,
    question: "How do you approach a difficult bug?",
    options: [
      { text: "Document it as a unique feature", icon: Ghost, tag: "Gaslighter" },
      { text: "Persist until it's completely solved", icon: AlertTriangle, tag: "The Grindset" },
      { text: "Leverage AI tools for solutions", icon: Cpu, tag: "AI Whisperer" },
      { text: "Refactor everything to fix it", icon: AlertTriangle, tag: "Chaos Agent" }
    ]
  }
];

const results = {
  "Night Owl": { description: "You find your best focus when the world is quiet and still.", color: "text-indigo-600", bg: "bg-indigo-50" },
  "Early Bird": { description: "You're at your best when the day is fresh and full of potential.", color: "text-orange-600", bg: "bg-orange-50" },
  "Vibe Manager": { description: "You keep the energy high and the team connected through great culture.", color: "text-pink-600", bg: "bg-pink-50" },
  "Speedrunner": { description: "You value momentum and getting things delivered with high velocity.", color: "text-emerald-600", bg: "bg-emerald-50" },
  "Code Ninja": { description: "You approach code with precision and a quiet, efficient mastery.", color: "text-slate-800", bg: "bg-slate-100" },
  "Design Guru": { description: "You believe that every detail matters and aesthetics are fundamental.", color: "text-purple-600", bg: "bg-purple-50" },
  "Architect": { description: "You build systems that are logical, structured, and built to last.", color: "text-blue-600", bg: "bg-blue-50" },
  "Main Character": { description: "You lead with strong communication and a clear vision for the project.", color: "text-yellow-700", bg: "bg-yellow-50" },
  "Silent Protector": { description: "You ensure everything runs smoothly from behind the scenes, no drama.", color: "text-slate-600", bg: "bg-slate-100" },
  "Content Creator": { description: "You see the journey as part of the work and share it with others.", color: "text-red-600", bg: "bg-red-50" },
  "Efficiency Expert": { description: "You prioritize time and direct, meaningful collaboration over fluff.", color: "text-emerald-700", bg: "bg-emerald-50" },
  "The Hypebeast": { description: "You're always on top of trends and bring high energy to every sprint.", color: "text-cyan-600", bg: "bg-cyan-50" },
  "Gaslighter": { description: "You move with absolute confidence, turning every challenge into a win.", color: "text-teal-600", bg: "bg-teal-50" },
  "The Grindset": { description: "Your persistence is your greatest asset. You never back down from a challenge.", color: "text-amber-700", bg: "bg-amber-50" },
  "AI Whisperer": { description: "You leverage modern tools to work smarter and stay ahead of the curve.", color: "text-violet-600", bg: "bg-violet-50" },
  "Chaos Agent": { description: "You're not afraid to shake things up to find a better, more creative path.", color: "text-rose-600", bg: "bg-rose-50" }
};

export default function Quiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAnswer = async (tag) => {
    const newAnswers = [...answers, tag];
    setAnswers(newAnswers);
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
      await saveResult(tag);
    }
  };

  const saveResult = async (finalTag) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          personality: { label: finalTag }
        })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Error saving quiz result:', error);
    } finally {
      setSaving(false);
    }
  };

  const getFinalResult = () => {
    // Count occurrences of each tag
    const counts = answers.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});
    
    // Find the tag with most occurrences
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers([]);
    setShowResult(false);
  };

  if (showResult) {
    const finalTag = getFinalResult();
    const resultInfo = results[finalTag];
    
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-12 animate-in fade-in zoom-in-95 duration-500">
          <div className="space-y-4">
            <div className={`w-20 h-20 ${resultInfo.bg} rounded-3xl mx-auto flex items-center justify-center relative`}>
              <Sparkles className={`w-10 h-10 ${resultInfo.color}`} />
              {saving && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-3xl">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700"></div>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                {saving ? 'Saving your profile...' : 'Your working style is'}
              </p>
              <h2 className={`text-4xl font-black ${resultInfo.color} tracking-tight`}>{finalTag}</h2>
            </div>
          </div>

          <p className="text-gray-500 font-medium leading-relaxed max-w-sm mx-auto">
            {resultInfo.description}
          </p>
          
          <div className="flex flex-col gap-3 pt-6 max-w-[240px] mx-auto">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-8 py-2.5 bg-emerald-700 text-white rounded-full text-sm font-bold hover:bg-emerald-800 transition-all active:scale-[0.98]"
            >
              Back to Dashboard
            </button>
            <button
              onClick={resetQuiz}
              className="px-8 py-2.5 bg-transparent text-gray-400 rounded-full text-sm font-bold hover:text-gray-600 transition-all active:scale-[0.98]"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="mb-12 flex items-center gap-2 text-gray-400 font-bold hover:text-emerald-700 transition-colors group text-sm"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </button>

        <div className="space-y-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-1 w-8 bg-emerald-600 rounded-full" />
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                Question {currentStep + 1} / {questions.length}
              </p>
            </div>
            <h2 className="text-3xl font-black text-gray-900 leading-tight tracking-tight">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="grid gap-3">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option.tag)}
                className="group w-full flex items-center gap-4 p-5 bg-white hover:bg-emerald-50/30 border border-gray-100 hover:border-emerald-100 rounded-[2rem] transition-all text-left active:scale-[0.98] shadow-sm hover:shadow-emerald-50"
              >
                <div className="w-10 h-10 bg-gray-50 group-hover:bg-white rounded-2xl flex items-center justify-center transition-colors">
                  <option.icon className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
                </div>
                <span className="flex-1 font-bold text-gray-600 group-hover:text-emerald-900 text-sm">
                  {option.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
