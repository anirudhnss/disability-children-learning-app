
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppScreen, StudentProfile } from './types';
import { 
  RobotIcon, CameraIcon, MicIcon, PaletteIcon, 
  BrainIcon, EmojiHappyIcon, BackIcon,
  HomeIcon, BookIcon, PencilIcon, StarIcon
} from './components/Icons';
import { Camera } from './components/Camera';
import { analyzeImage, speakText, stopSpeech, verifyFace } from './services/geminiService';

// --- Revamped Components ---

const FloatingFeedback: React.FC<{ text: string; isProcessing?: boolean; onClose: () => void }> = ({ text, isProcessing, onClose }) => {
  if (!text && !isProcessing) return null;
  
  const displayableText = text
    .replace(/^STRICT_SUCCESS:/i, '')
    .replace(/^STRICT_FAIL:/i, '')
    .replace(/^SUCCESS:/i, '')
    .replace(/^TRY_AGAIN:/i, '')
    .trim();

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[94%] max-w-[600px] z-[9999] px-4 animate-in fade-in slide-in-from-top-12 duration-700 pointer-events-auto">
      <div className="bg-white/95 backdrop-blur-md border-[6px] border-indigo-50 text-slate-900 p-5 md:p-6 rounded-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] flex flex-col gap-4 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500 transition-colors z-20"
        >
          ✕
        </button>

        <div className="flex items-center gap-4 w-full">
          <div className="shrink-0 bg-indigo-600 p-3 rounded-2xl shadow-lg border-2 border-indigo-400">
            <span className={`text-3xl md:text-4xl block ${isProcessing ? 'animate-bounce' : 'animate-wiggle'}`}>
              {isProcessing ? '🧐' : '🤖'}
            </span>
          </div>
          <div className="flex-1 pr-8">
            <h4 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em]">Tejas Says:</h4>
            {isProcessing && (
              <div className="flex items-center gap-2 mt-1">
                <span className="font-black text-slate-400 uppercase text-base">Thinking...</span>
              </div>
            )}
            {!isProcessing && (
              <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-lg md:text-xl font-black leading-tight text-slate-800 break-words">
                  {displayableText}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-10 h-10 bg-white/95 border-l-[6px] border-t-[6px] border-indigo-50 rotate-45 mx-auto -mb-5 -mt-5 relative z-[-1]"></div>
    </div>
  );
};

const Header: React.FC<{ title: string; onBack: () => void; color?: string }> = ({ title, onBack, color = "bg-primary" }) => (
  <header className={`${color} pt-6 pb-8 px-6 text-white rounded-b-[50px] shadow-2xl flex items-center gap-4 z-[2000] sticky top-0 w-full`}>
    <button 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onBack();
      }} 
      className="bg-black/30 p-4 rounded-3xl bouncy-press flex items-center justify-center min-w-[64px] min-h-[64px] cursor-pointer hover:bg-black/50 transition-all border-2 border-white/20"
    >
      <BackIcon className="w-8 h-8 pointer-events-none text-white" />
    </button>
    <h2 className="text-2xl font-black truncate drop-shadow-lg tracking-tight">{title}</h2>
  </header>
);

const ActionCard: React.FC<{ title: string; icon: React.ReactNode; onClick: () => void; iconColor?: string }> = ({ title, icon, onClick, iconColor }) => (
  <button onClick={onClick} className="bg-white p-8 rounded-[50px] shadow-2xl border-b-[12px] border-slate-200 flex flex-col items-center gap-6 bouncy-press group w-full transition-all active:border-b-0 active:translate-y-3">
    <div className={`p-7 rounded-[30px] group-hover:scale-110 group-hover:rotate-3 transition-transform ${iconColor || 'bg-slate-100'}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-14 h-14 md:w-20 md:h-20" })}
    </div>
    <div className="font-black text-xl md:text-3xl text-slate-800 uppercase tracking-tighter">{title}</div>
  </button>
);

// --- Game Logic Components ---

const GameMatch: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [target, setTarget] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [celebration, setCelebration] = useState('');

  const generateLevel = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
    const newTarget = chars[Math.floor(Math.random() * chars.length)];
    const otherOptions = chars.filter(c => c !== newTarget).sort(() => 0.5 - Math.random()).slice(0, 2);
    const allOptions = [...otherOptions, newTarget].sort(() => 0.5 - Math.random());
    
    setTarget(newTarget);
    setOptions(allOptions);
    setIsCorrect(null);
    setCelebration('');
    
    speakText(`Find the character ${newTarget}. Which one is it?`);
  }, []);

  useEffect(() => {
    generateLevel();
  }, [generateLevel]);

  const handleSelect = async (choice: string) => {
    if (choice === target) {
      setIsCorrect(true);
      const praise = await analyzeImage("", `The user successfully matched the character '${target}'. Give a very short, happy, and simple high-five praise!`, false);
      setCelebration(praise);
      speakText(praise);
      setTimeout(generateLevel, 3000);
    } else {
      setIsCorrect(false);
      speakText("Oops! Let's try again. You can do it!");
      setTimeout(() => setIsCorrect(null), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col overflow-hidden">
      <Header title="Match Buddy" onBack={onBack} color="bg-amber-500" />
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-12">
        <div className="relative">
          <div className="w-56 h-56 md:w-72 md:h-72 bg-white rounded-[60px] shadow-3xl border-[15px] border-amber-200 flex items-center justify-center text-[120px] md:text-[180px] font-black text-amber-600 animate-pulse">
            {target}
          </div>
          <div className="absolute -top-6 -right-6 bg-white p-4 rounded-full shadow-xl border-4 border-amber-400">
             <StarIcon className="w-10 h-10 text-amber-400" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 w-full max-w-2xl">
          {options.map((opt, idx) => (
            <button 
              key={idx} 
              onClick={() => handleSelect(opt)}
              className={`aspect-square rounded-[40px] shadow-2xl text-6xl md:text-8xl font-black bouncy-press flex items-center justify-center border-b-[12px] transition-all active:translate-y-2 active:border-b-0
                ${isCorrect === true && opt === target ? 'bg-emerald-500 text-white border-emerald-700' : 
                  isCorrect === false && opt !== target ? 'bg-slate-200 text-slate-400 border-slate-300' : 
                  'bg-white text-indigo-600 border-indigo-100'}`}
            >
              {opt}
            </button>
          ))}
        </div>

        {celebration && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-10 bg-amber-500/20 backdrop-blur-sm pointer-events-none">
             <div className="bg-white p-10 rounded-[50px] shadow-3xl border-[8px] border-amber-400 text-center animate-bounce">
                <h2 className="text-4xl font-black text-amber-600 mb-4">AWESOME! 🌟</h2>
                <p className="text-2xl font-bold text-slate-700">{celebration}</p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

const GamePop: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [bubbles, setBubbles] = useState<{ id: number; char: string; x: number; color: string }[]>([]);
  const [target, setTarget] = useState('');
  const [score, setScore] = useState(0);

  const spawnBubble = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
    const colors = ['#f43f5e', '#10b981', '#6366f1', '#f59e0b', '#8b5cf6'];
    const id = Date.now() + Math.random();
    const char = chars[Math.floor(Math.random() * chars.length)];
    const x = Math.random() * 80 + 10;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    setBubbles(prev => [...prev.slice(-10), { id, char, x, color }]);
  }, []);

  useEffect(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
    const newTarget = chars[Math.floor(Math.random() * chars.length)];
    setTarget(newTarget);
    speakText(`Pop the bubble with the character ${newTarget}!`);
    
    const timer = setInterval(spawnBubble, 1500);
    return () => clearInterval(timer);
  }, [spawnBubble]);

  const pop = (id: number, char: string) => {
    if (char === target) {
      setScore(s => s + 1);
      speakText("Pop! Good job!");
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
      const newTarget = chars[Math.floor(Math.random() * chars.length)];
      setTarget(newTarget);
      speakText(`Now find ${newTarget}!`);
    } else {
      speakText("Not that one! Try again.");
    }
    setBubbles(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col overflow-hidden relative">
      <Header title="Bubble Pop" onBack={onBack} color="bg-sky-500" />
      
      <div className="absolute top-32 left-1/2 -translate-x-1/2 bg-white/90 px-8 py-3 rounded-full border-4 border-sky-400 font-black text-2xl text-sky-600 shadow-xl z-10">
        FIND: <span className="text-4xl ml-2">{target}</span>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {bubbles.map(b => (
          <button 
            key={b.id}
            onClick={() => pop(b.id, b.char)}
            className="absolute bottom-0 w-24 h-24 md:w-32 md:h-32 rounded-full shadow-2xl flex items-center justify-center text-4xl md:text-5xl font-black text-white border-4 border-white/50 animate-float-up transition-transform active:scale-150"
            style={{ 
              left: `${b.x}%`, 
              backgroundColor: b.color,
              animationDuration: '6s'
            }}
          >
            {b.char}
            <div className="absolute inset-2 border-2 border-white/20 rounded-full"></div>
            <div className="absolute top-4 left-4 w-4 h-4 bg-white/40 rounded-full"></div>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes floatUp {
          from { transform: translateY(100px); opacity: 0; }
          10% { opacity: 1; }
          to { transform: translateY(-100vh); opacity: 1; }
        }
        .animate-float-up {
          animation: floatUp 6s linear forwards;
        }
      `}</style>
    </div>
  );
};

// --- Main App Logic ---

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.LOGIN);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [targetWord, setTargetWord] = useState(''); 
  const [isFreeDraw, setIsFreeDraw] = useState(false);
  const [flashType, setFlashType] = useState<'correct' | 'wrong' | 'none'>('none');
  const [lessonStep, setLessonStep] = useState<'draw' | 'success'>('draw');
  const [lessonTab, setLessonTab] = useState<'letters' | 'numbers'>('letters');
  
  const [tempName, setTempName] = useState('');
  const [drawColor, setDrawColor] = useState('#6366f1');
  const [brushSize, setBrushSize] = useState(18);
  const [isEraser, setIsEraser] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('tejas_student_v4');
    if (saved) setStudent(JSON.parse(saved));
  }, []);

  const initCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, []);

  useEffect(() => {
    if (screen === AppScreen.WRITING_CORRECTION && lessonStep === 'draw') {
      const timer = setTimeout(initCanvas, 300);
      return () => clearTimeout(timer);
    }
  }, [screen, lessonStep, initCanvas]);

  const handleNavigate = (newScreen: AppScreen, options?: { speech?: string, isFree?: boolean, target?: string }) => {
    stopSpeech();
    setIsProcessing(false);
    setAiResult('');
    setLessonStep('draw');
    setFlashType('none');
    setIsFreeDraw(!!options?.isFree);
    if (options?.target) setTargetWord(options.target);
    setScreen(newScreen);
    if (options?.speech) {
      setTimeout(() => speakText(options.speech!), 500);
    }
  };

  const handleCaptureAndAnalyze = async (base64: string, prompt: string, isActualLesson: boolean) => {
    setIsProcessing(true);
    setAiResult(''); 
    
    const result = await analyzeImage(base64, prompt, isActualLesson);
    setAiResult(result);
    setIsProcessing(false);
    
    if (!isActualLesson) {
      speakText(result);
      setTimeout(() => setAiResult(''), 15000); 
    } else {
      const normalizedResult = result.toUpperCase();
      const isCorrect = normalizedResult.startsWith('STRICT_SUCCESS:');

      if (isCorrect) {
        setFlashType('correct');
        speakText(result);
        setLessonStep('success');
        setTimeout(() => setFlashType('none'), 1500);
      } else {
        setFlashType('wrong');
        speakText(result);
        setTimeout(() => {
          setFlashType('none');
        }, 2000);
      }
    }
  };

  const startDrawing = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = isEraser ? '#ffffff' : drawColor;
    ctx.lineWidth = brushSize;
    ctx.beginPath();
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const draw = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.closePath();
  };

  const clearFeedback = () => setAiResult('');

  const saveStudentProfile = (profile: StudentProfile) => {
    setStudent(profile);
    localStorage.setItem('tejas_student_v4', JSON.stringify(profile));
  };

  const handleFaceRegister = (base64: string) => {
    if (!student) return;
    const updated = { ...student, faceData: base64 };
    saveStudentProfile(updated);
    speakText(`Wonderful! I've memorized your face, ${student.name}. Let's learn together!`);
    setScreen(AppScreen.HOME);
  };

  const handleFaceLogin = async (base64: string) => {
    if (!student?.faceData) {
      setScreen(AppScreen.FACE_REGISTER);
      return;
    }
    setIsProcessing(true);
    setAiResult("Checking your face...");
    const result = await verifyFace(student.faceData, base64);
    setIsProcessing(false);
    
    if (result === "YES") {
      speakText(`Welcome back, ${student.name}! I missed you!`);
      setScreen(AppScreen.HOME);
    } else {
      setAiResult("Hmm, that doesn't look like my friend! Try again or ask a grown-up for help.");
      speakText("Hmm, that doesn't look like my friend! Try again!");
    }
  };

  switch (screen) {
    case AppScreen.LOGIN:
      return (
        <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-12 rounded-[70px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] w-full max-w-sm flex flex-col gap-10 border-b-[15px] border-slate-200">
            <div className="bg-indigo-50 p-10 rounded-[40px] w-40 h-40 mx-auto flex items-center justify-center text-indigo-600 shadow-inner relative overflow-hidden">
              <div className="absolute inset-0 bg-indigo-500 opacity-5 animate-pulse"></div>
              <RobotIcon className="w-24 h-24 animate-wiggle relative z-10" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-slate-800 tracking-tighter">TEJAS AI</h1>
              <p className="text-slate-500 font-bold text-base uppercase tracking-[0.4em] mt-2 opacity-60">Learning Buddy</p>
            </div>
            <button 
              onClick={() => {
                if (!student) {
                  setScreen(AppScreen.REGISTER);
                } else if (!student.faceData) {
                  setScreen(AppScreen.FACE_REGISTER);
                } else {
                  setScreen(AppScreen.FACE_LOGIN);
                }
              }} 
              className="w-full bg-indigo-600 text-white font-black py-8 rounded-[40px] text-3xl shadow-3xl bouncy-press border-t-4 border-indigo-400 active:shadow-none"
            >
              START 🚀
            </button>
          </div>
        </div>
      );

    case AppScreen.FACE_REGISTER:
      return (
        <div className="min-h-screen bg-black flex flex-col overflow-hidden">
          <Header title="Face Registration" onBack={() => setScreen(AppScreen.REGISTER)} color="bg-black" />
          <div className="flex-1 relative">
            <Camera isActive={true} onCapture={handleFaceRegister} />
            <div className="absolute top-10 left-0 right-0 pointer-events-none flex flex-col items-center">
              <div className="bg-white/90 backdrop-blur-md px-10 py-5 rounded-[40px] shadow-2xl border-4 border-indigo-500 text-slate-800 font-black text-xl md:text-2xl animate-bounce">
                📸 Smile for Tejas!
              </div>
            </div>
          </div>
        </div>
      );

    case AppScreen.FACE_LOGIN:
      return (
        <div className="min-h-screen bg-black flex flex-col overflow-hidden">
          <Header title="Who's There?" onBack={() => setScreen(AppScreen.LOGIN)} color="bg-black" />
          <div className="flex-1 relative">
            <Camera isActive={true} onCapture={handleFaceLogin} />
            <div className="absolute top-10 left-0 right-0 pointer-events-none flex flex-col items-center">
              <div className="bg-white/90 backdrop-blur-md px-10 py-5 rounded-[40px] shadow-2xl border-4 border-indigo-500 text-slate-800 font-black text-xl md:text-2xl animate-pulse">
                🔍 Let me see your face...
              </div>
            </div>
            {(isProcessing || aiResult) && <FloatingFeedback text={aiResult} isProcessing={isProcessing} onClose={clearFeedback} />}
          </div>
        </div>
      );

    case AppScreen.HOME:
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <header className="bg-indigo-600 pt-14 pb-20 px-12 text-white rounded-b-[70px] shadow-3xl text-center relative overflow-hidden">
             <h2 className="text-4xl md:text-5xl font-black relative z-10 drop-shadow-xl">Hey {student?.name}! 🌟</h2>
             <p className="font-bold opacity-100 mt-4 text-xl relative z-10 uppercase tracking-[0.2em]">Ready to explore?</p>
          </header>
          <main className="flex-1 px-8 -mt-12 space-y-10 pb-44 overflow-y-auto">
            <button onClick={() => handleNavigate(AppScreen.MAGIC_MENU)} className="w-full bg-gradient-to-br from-purple-600 to-indigo-900 p-12 rounded-[60px] text-white shadow-3xl bouncy-press flex items-center justify-between group overflow-hidden">
              <div className="text-left relative z-10">
                <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter">AI Magic Hub ✨</h3>
                <p className="font-bold opacity-80 text-xl mt-1">Scanner & Voice Buddy</p>
              </div>
              <RobotIcon className="w-24 h-24 transition-transform group-hover:scale-125" />
            </button>
            <ActionCard title="Fun Play Zone" icon={<EmojiHappyIcon />} onClick={() => handleNavigate(AppScreen.GAMES_HUB, { speech: "Let's play some fun games!" })} iconColor="bg-amber-100 text-amber-600" />
            <ActionCard title="Writing Practice" icon={<BookIcon />} onClick={() => handleNavigate(AppScreen.LESSONS)} iconColor="bg-emerald-100 text-emerald-600" />
          </main>
          <BottomNav current={AppScreen.HOME} onNav={handleNavigate} />
        </div>
      );

    case AppScreen.GAMES_HUB:
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Header title="Fun Play Zone" onBack={() => handleNavigate(AppScreen.HOME)} color="bg-amber-500" />
          <div className="p-10 grid grid-cols-1 sm:grid-cols-2 gap-10 pb-44 overflow-y-auto">
            <ActionCard title="Match Buddy" icon={<PaletteIcon />} onClick={() => setScreen(AppScreen.GAME_MATCH)} iconColor="bg-orange-100 text-orange-600" />
            <ActionCard title="Bubble Pop" icon={<StarIcon />} onClick={() => setScreen(AppScreen.GAME_POP)} iconColor="bg-sky-100 text-sky-600" />
          </div>
          <BottomNav current={AppScreen.GAMES_HUB} onNav={handleNavigate} />
        </div>
      );

    case AppScreen.GAME_MATCH:
      return <GameMatch onBack={() => setScreen(AppScreen.GAMES_HUB)} />;

    case AppScreen.GAME_POP:
      return <GamePop onBack={() => setScreen(AppScreen.GAMES_HUB)} />;

    case AppScreen.LESSONS:
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Header title="Writing Classroom" onBack={() => handleNavigate(AppScreen.HOME)} color="bg-emerald-600" />
          <div className="p-8 flex gap-4 justify-center bg-white sticky top-[100px] z-[1000] border-b shadow-sm">
            <button onClick={() => setLessonTab('letters')} className={`flex-1 py-4 rounded-3xl font-black text-lg transition-all ${lessonTab === 'letters' ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-100 text-slate-400'}`}>LETTERS</button>
            <button onClick={() => setLessonTab('numbers')} className={`flex-1 py-4 rounded-3xl font-black text-lg transition-all ${lessonTab === 'numbers' ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-100 text-slate-400'}`}>NUMBERS</button>
          </div>
          <div className="p-8 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 pb-44 overflow-y-auto">
            {(lessonTab === 'letters' ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') : '0123456789'.split('')).map(char => (
              <button key={char} onClick={() => handleNavigate(AppScreen.WRITING_CORRECTION, { target: char, speech: `Let's write the character ${char}!` })} className="bg-white aspect-square rounded-[40px] shadow-2xl text-5xl font-black text-indigo-600 bouncy-press border-b-[8px] border-slate-200 flex items-center justify-center active:border-b-0 active:translate-y-2">
                {char}
              </button>
            ))}
          </div>
          <BottomNav current={AppScreen.LESSONS} onNav={handleNavigate} />
        </div>
      );

    case AppScreen.MAGIC_MENU:
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Header title="AI Super Scanner" onBack={() => handleNavigate(AppScreen.HOME)} color="bg-purple-700" />
          <div className="p-10 grid grid-cols-1 sm:grid-cols-2 gap-10 pb-44 overflow-y-auto">
            <ActionCard title="Object Scanner" icon={<CameraIcon />} onClick={() => handleNavigate(AppScreen.OBJECT_DETECT)} iconColor="bg-blue-100 text-blue-600" />
            <ActionCard title="Voice Buddy" icon={<MicIcon />} onClick={() => handleNavigate(AppScreen.SPEECH_CORRECTION)} iconColor="bg-rose-100 text-rose-600" />
            <ActionCard title="Free Canvas" icon={<PaletteIcon />} onClick={() => handleNavigate(AppScreen.WRITING_CORRECTION, { isFree: true })} iconColor="bg-purple-100 text-purple-600" />
          </div>
          <BottomNav current={AppScreen.MAGIC_MENU} onNav={handleNavigate} />
        </div>
      );

    case AppScreen.WRITING_CORRECTION:
      return (
        <div className="min-h-screen bg-slate-100 flex flex-col overflow-hidden">
          <Header title={isFreeDraw ? "Magic Canvas" : `Write "${targetWord}"`} onBack={() => handleNavigate(isFreeDraw ? AppScreen.HOME : AppScreen.LESSONS)} color="bg-indigo-600" />
          
          <div className="flex-1 p-4 md:p-8 flex flex-col space-y-4 overflow-hidden">
            {lessonStep === 'draw' ? (
              <>
                {/* TOOLBAR */}
                <div className="bg-white p-4 rounded-[35px] shadow-2xl flex flex-wrap items-center justify-between gap-4 border-b-[6px] border-slate-200">
                   {/* Colors */}
                   <div className="flex gap-2">
                     {['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#000000'].map(c => (
                        <button key={c} onClick={() => { setDrawColor(c); setIsEraser(false); }} className={`w-10 h-10 rounded-full border-4 shadow-sm transition-transform ${!isEraser && drawColor === c ? 'border-slate-800 scale-125' : 'border-white'}`} style={{ backgroundColor: c }} />
                     ))}
                     <button onClick={() => setIsEraser(true)} className={`w-10 h-10 rounded-full border-4 flex items-center justify-center bg-slate-100 shadow-sm ${isEraser ? 'border-indigo-600 scale-125' : 'border-white'}`}>
                       <span className="text-xl">🧽</span>
                     </button>
                   </div>
                   
                   {/* Brush Sizes */}
                   <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl">
                     {[8, 18, 32].map(s => (
                        <button key={s} onClick={() => setBrushSize(s)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${brushSize === s ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400'}`}>
                          <div className="bg-current rounded-full" style={{ width: s/2, height: s/2 }} />
                        </button>
                     ))}
                   </div>

                   <button onClick={() => initCanvas()} className="text-rose-600 font-black uppercase text-sm px-6 py-3 bg-rose-50 rounded-2xl border-2 border-rose-200 active:scale-90">Reset</button>
                </div>
                
                {/* CANVAS */}
                <div className="flex-1 bg-white rounded-[50px] shadow-3xl relative overflow-hidden border-[8px] border-white canvas-container">
                  <canvas ref={canvasRef} onPointerDown={startDrawing} onPointerUp={stopDrawing} onPointerLeave={stopDrawing} onPointerMove={draw} className="w-full h-full cursor-crosshair" />
                  {isProcessing && (
                    <div className="absolute inset-0 z-50 pointer-events-none">
                       <div className="absolute left-0 right-0 h-2 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-scan"></div>
                       <div className="absolute inset-0 bg-indigo-500/5 backdrop-blur-[1px]"></div>
                    </div>
                  )}
                  {!isFreeDraw && !isDrawing && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] md:text-[300px] opacity-[0.03] font-black pointer-events-none select-none">
                      {targetWord}
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    const img = canvas.toDataURL('image/jpeg', 0.8);
                    const prompt = isFreeDraw 
                      ? "Look closely. Identify exactly what is drawn in this picture and describe it briefly." 
                      : `Evaluate this handwritten character. Is it clearly and correctly intended to be the letter/number '${targetWord}'? Analyze the shape carefully.`;
                    handleCaptureAndAnalyze(img, prompt, !isFreeDraw);
                  }} 
                  disabled={isProcessing}
                  className={`w-full py-8 bg-indigo-600 text-white rounded-[40px] font-black text-2xl shadow-3xl bouncy-press uppercase active:bg-indigo-700 ${isProcessing ? 'animate-pulse opacity-80' : ''}`}
                >
                  {isProcessing ? "Checking..." : "Show Robot Buddy 🤖"}
                </button>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12 animate-in fade-in zoom-in">
                 <div className="text-[180px] drop-shadow-3xl animate-bounce">🥇</div>
                 <h2 className="text-6xl font-black text-emerald-600 tracking-tighter">AWESOME!</h2>
                 <button onClick={() => { setLessonStep('draw'); setAiResult(''); setFlashType('none'); }} className="bg-indigo-600 text-white px-20 py-10 rounded-[50px] font-black text-3xl shadow-3xl bouncy-press">AGAIN! 🚀</button>
              </div>
            )}
          </div>
          
          {(isProcessing || aiResult) && <FloatingFeedback text={aiResult} isProcessing={isProcessing} onClose={clearFeedback} />}
          
          <div className={`fixed inset-0 z-[1000] pointer-events-none transition-opacity duration-500 flex items-center justify-center ${flashType === 'correct' ? 'bg-emerald-500/40 opacity-100' : flashType === 'wrong' ? 'bg-red-500/40 opacity-100' : 'opacity-0'}`}>
              {flashType === 'correct' && <div className="text-[250px] animate-bounce">✨</div>}
              {flashType === 'wrong' && <div className="text-[250px] animate-shake">🩹</div>}
          </div>
        </div>
      );

    case AppScreen.OBJECT_DETECT:
      return (
        <div className="min-h-screen bg-black flex flex-col overflow-hidden">
          <Header title="Object Scanner" onBack={() => handleNavigate(AppScreen.MAGIC_MENU)} color="bg-black" />
          <div className="flex-1 relative">
            <Camera isActive={true} onCapture={(img) => handleCaptureAndAnalyze(img, "FOCUS: Look only at the main, central object in front of the camera. Ignore everything in the background. Tell me exactly what this one primary object is.", false)} />
            {(isProcessing || aiResult) && <FloatingFeedback text={aiResult} isProcessing={isProcessing} onClose={clearFeedback} />}
          </div>
        </div>
      );

    case AppScreen.SPEECH_CORRECTION:
      return (
        <div className="min-h-screen bg-rose-500 flex flex-col">
          <Header title="Voice Buddy" onBack={() => handleNavigate(AppScreen.MAGIC_MENU)} color="bg-rose-600" />
          <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-12">
            <div className="bg-white/10 p-16 rounded-[60px] text-white text-center w-full border-4 border-white/30 backdrop-blur-xl">
              <div className="text-[120px] mb-6 animate-pulse">🤖</div>
              <h3 className="text-4xl font-black uppercase">Talk to Tejas</h3>
              <p className="font-bold opacity-90 mt-4 text-xl">Tap the button and say something!</p>
            </div>
            <button 
              onClick={() => {
                const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                if (!Recognition) return;
                setIsProcessing(true);
                const rec = new Recognition();
                rec.onresult = async (e: any) => {
                  const res = await analyzeImage("", `The child said: "${e.results[0][0].transcript}". Respond to them nicely and clearly.`, false);
                  setAiResult(res);
                  speakText(res);
                  setIsProcessing(false);
                };
                rec.onerror = () => setIsProcessing(false);
                rec.start();
              }} 
              disabled={isProcessing} 
              className="w-56 h-56 bg-white rounded-full flex items-center justify-center shadow-3xl bouncy-press border-[12px] border-rose-100 transition-all"
            >
              <MicIcon className={`w-24 h-24 text-rose-500 ${isProcessing ? 'animate-pulse' : ''}`} />
            </button>
          </div>
          {(isProcessing || aiResult) && <FloatingFeedback text={aiResult} isProcessing={isProcessing} onClose={clearFeedback} />}
        </div>
      );

    case AppScreen.REGISTER:
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12 space-y-12">
          <div className="text-[180px] animate-wiggle">🎒</div>
          <h2 className="text-5xl font-black text-slate-800 uppercase tracking-tighter text-center">Hello Friend!</h2>
          <input 
            type="text" 
            autoFocus
            onChange={(e) => setTempName(e.target.value)} 
            className="w-full max-w-lg p-10 rounded-[40px] border-[8px] border-indigo-100 text-center font-black text-4xl outline-none focus:border-indigo-500 transition-all shadow-inner bg-indigo-50/30 text-slate-900 placeholder:text-slate-400" 
            placeholder="YOUR NAME?"
          />
          <button 
            onClick={() => {
              if (!tempName.trim()) return;
              saveStudentProfile({ name: tempName, marks: 0, accuracy: 0, timeTaken: 0, iq: 0, assignments: [] });
              setScreen(AppScreen.FACE_REGISTER);
            }} 
            className="w-full max-w-lg py-10 bg-indigo-600 text-white rounded-[40px] font-black text-3xl shadow-3xl bouncy-press uppercase"
          >
            I'M READY! 🚀
          </button>
        </div>
      );

    default:
      return <div className="min-h-screen flex items-center justify-center"><button onClick={() => setScreen(AppScreen.LOGIN)} className="bg-indigo-600 text-white px-16 py-8 rounded-[40px] font-black text-2xl">REBOOT</button></div>;
  }
};

const BottomNav: React.FC<{ current: AppScreen; onNav: (s: AppScreen, o?: any) => void }> = ({ current, onNav }) => (
  <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-3xl rounded-[50px] border-[8px] border-slate-100 flex p-4 shadow-3xl z-[400] gap-10 md:gap-16">
    <button onClick={() => onNav(AppScreen.HOME)} className={`p-5 rounded-full transition-all ${current === AppScreen.HOME ? 'bg-indigo-600 text-white scale-125 shadow-2xl' : 'text-slate-400'}`}>
      <HomeIcon className="w-8 h-8 md:w-10 md:h-10" />
    </button>
    <button onClick={() => onNav(AppScreen.LESSONS)} className={`p-5 rounded-full transition-all ${current === AppScreen.LESSONS ? 'bg-emerald-600 text-white scale-125 shadow-2xl' : 'text-slate-400'}`}>
      <BookIcon className="w-8 h-8 md:w-10 md:h-10" />
    </button>
    <button onClick={() => onNav(AppScreen.GAMES_HUB)} className={`p-5 rounded-full transition-all ${current === AppScreen.GAMES_HUB || current === AppScreen.GAME_MATCH || current === AppScreen.GAME_POP ? 'bg-amber-500 text-white scale-125 shadow-2xl' : 'text-slate-400'}`}>
      <EmojiHappyIcon className="w-8 h-8 md:w-10 md:h-10" />
    </button>
    <button onClick={() => onNav(AppScreen.MAGIC_MENU)} className={`p-5 rounded-full transition-all ${current === AppScreen.MAGIC_MENU ? 'bg-purple-600 text-white scale-125 shadow-2xl' : 'text-slate-400'}`}>
      <RobotIcon className="w-8 h-8 md:w-10 md:h-10" />
    </button>
  </nav>
);

export default App;
