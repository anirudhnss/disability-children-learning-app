
import React, { useState, useEffect, useRef } from 'react';
import { AppScreen, StudentProfile, Lesson } from './types';
import { 
  RobotIcon, CameraIcon, MicIcon, PaletteIcon, 
  BrainIcon, EmojiHappyIcon, BackIcon, LightIcon 
} from './components/Icons';
import { Camera } from './components/Camera';
import { analyzeImage, speakText, stopSpeech, verifyFace } from './services/geminiService';

// --- Shared Components ---

const Header: React.FC<{ title: string; onBack: () => void; color?: string; right?: React.ReactNode }> = ({ title, onBack, color = "bg-indigo-500", right }) => (
  <header className={`${color} p-6 text-white rounded-b-[40px] shadow-lg flex justify-between items-center z-20 relative overflow-hidden`}>
    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
       <RobotIcon className="w-24 h-24" />
    </div>
    <div className="flex items-center gap-4 z-10">
      <button 
        onClick={onBack} 
        className="bg-white/30 backdrop-blur-md p-3 rounded-2xl hover:bg-white/40 transition-all active:scale-90 shadow-sm"
        aria-label="Go back"
      >
        <BackIcon className="w-6 h-6" />
      </button>
      <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">{title}</h2>
    </div>
    <div className="z-10">{right}</div>
  </header>
);

const ActionCard: React.FC<{ title: string; icon: React.ReactNode; color: string; onClick: () => void; desc?: string; badge?: string }> = ({ title, icon, color, onClick, desc, badge }) => (
  <button 
    onClick={onClick}
    className={`bg-white p-8 rounded-[40px] shadow-xl shadow-${color}-100/50 border-b-8 border-${color}-500 flex flex-col items-center gap-4 active:scale-95 transition-all text-center relative overflow-hidden group`}
  >
    {badge && <span className="absolute top-4 right-4 bg-rose-500 text-white text-xs px-3 py-1 rounded-full font-black animate-pulse shadow-md">{badge}</span>}
    <div className={`text-${color}-500 p-6 bg-${color}-50 rounded-[32px] group-hover:rotate-6 transition-transform`}>{icon}</div>
    <div>
      <div className={`font-black text-xl text-gray-800 tracking-tight`}>{title}</div>
      {desc && <div className="text-sm font-medium text-gray-400 mt-1">{desc}</div>}
    </div>
  </button>
);

// --- Screen Components ---

const LoginScreen: React.FC<{ onEnter: (role: 'student' | 'educator') => void }> = ({ onEnter }) => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-6 text-center">
    <div className="bg-white/95 backdrop-blur-sm p-10 rounded-[50px] shadow-2xl w-full max-w-sm space-y-10 border-4 border-white flex flex-col items-center">
      <div className="space-y-6 flex flex-col items-center w-full">
        <div className="bg-indigo-100 p-6 rounded-full w-32 h-32 flex items-center justify-center text-indigo-600 shadow-inner">
          <RobotIcon className="w-20 h-20" />
        </div>
        <div className="flex flex-col items-center w-full">
          {/* Centered Title with Floating Icon */}
          <div className="relative inline-block mb-1">
            <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase leading-none whitespace-nowrap">
              Project Tejas
            </h1>
            <div className="absolute top-0 -right-11">
              <LightIcon className="w-10 h-10 text-yellow-500 animate-pulse drop-shadow-md" />
            </div>
          </div>
          <p className="text-indigo-500 font-bold uppercase tracking-widest text-sm mt-2">Learning is Magic!</p>
        </div>
      </div>
      
      <div className="space-y-5 w-full">
        <button 
          onClick={() => onEnter('student')}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 rounded-[35px] shadow-xl shadow-indigo-200 transition-all flex flex-col items-center gap-1 active:scale-95"
        >
          <span className="text-2xl">I'm a Student 🎒</span>
          <span className="text-xs opacity-70 font-bold">Face Recognition Login</span>
        </button>
        
        <button 
          // Fix: Corrected 'teacher' to 'educator' to match defined union type
          onClick={() => onEnter('educator')}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-6 rounded-[35px] shadow-xl shadow-slate-200 transition-all flex flex-col items-center gap-1 active:scale-95"
        >
          <span className="text-2xl">I'm a Teacher 👩‍🏫</span>
          <span className="text-xs opacity-70 font-bold">Classroom Management</span>
        </button>
      </div>
    </div>
  </div>
);

const RegisterScreen: React.FC<{ onBack: () => void; onNext: (name: string) => void }> = ({ onBack, onNext }) => {
  const [name, setName] = useState('');
  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col">
      <Header title="New Student" onBack={onBack} color="bg-indigo-600" />
      <div className="flex-1 flex flex-col items-center justify-center p-10 space-y-8 text-center">
        <div className="text-6xl mb-4">🌟</div>
        <h2 className="text-3xl font-black text-indigo-900 uppercase tracking-tight">Welcome!</h2>
        <p className="text-indigo-400 font-bold">What is your name, little explorer?</p>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-8 rounded-[40px] border-4 border-indigo-200 outline-none focus:border-indigo-500 text-center font-black text-3xl shadow-inner transition-all placeholder:text-indigo-100"
          placeholder="Magic Name"
        />
        <button 
          onClick={() => name && onNext(name)}
          disabled={!name}
          className="w-full py-8 bg-indigo-600 disabled:bg-gray-300 text-white rounded-[40px] font-black text-2xl shadow-xl active:scale-95 transition-transform"
        >
          NEXT: FACE PHOTO 📸
        </button>
      </div>
    </div>
  );
};

const EducatorDashboard: React.FC<{ onScreen: (s: AppScreen) => void; onLogout: () => void }> = ({ onScreen, onLogout }) => (
  <div className="min-h-screen bg-slate-50">
    <Header title="Teacher's Zone" onBack={onLogout} color="bg-slate-800" />
    <main className="p-6 grid grid-cols-1 gap-6">
      <ActionCard title="Create Lesson" icon={<PaletteIcon className="w-10 h-10" />} color="blue" onClick={() => onScreen(AppScreen.CREATE_LESSON)} desc="Add magic content" />
      <ActionCard title="Manage Tests" icon={<BrainIcon className="w-10 h-10" />} color="purple" onClick={() => onScreen(AppScreen.MANAGE_EXAMS)} desc="Schedule Grand Tests" />
      <ActionCard title="Student Reports" icon={<EmojiHappyIcon className="w-10 h-10" />} color="emerald" onClick={() => onScreen(AppScreen.VIEW_REPORTS)} desc="View Marks & IQ" />
    </main>
  </div>
);

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.LOGIN);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [tempName, setTempName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [targetWord, setTargetWord] = useState('Apple'); 
  const [reportFromScreen, setReportFromScreen] = useState<AppScreen>(AppScreen.HOME);
  const [drawColor, setDrawColor] = useState('#8B5CF6');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('tejas_student_profile_v1');
    if (saved) setStudent(JSON.parse(saved));
  }, []);

  const navigateTo = (newScreen: AppScreen, speechTextPrompt?: string) => {
    stopSpeech();
    setScreen(newScreen);
    if (speechTextPrompt) {
      speakText(speechTextPrompt, true);
    }
  };

  const saveProfile = (updated: StudentProfile) => {
    setStudent(updated);
    localStorage.setItem('tejas_student_profile_v1', JSON.stringify(updated));
  };

  const handleCaptureAndAnalyze = async (base64: string, prompt: string) => {
    setIsProcessing(true);
    setAiResult('Thinking...');
    const result = await analyzeImage(base64, prompt);
    setAiResult(result);
    setIsProcessing(false);
    speakText(result);
    
    if (student && (screen === AppScreen.HOMEWORK_HELPER || screen === AppScreen.WRITING_CORRECTION)) {
      saveProfile({ ...student, assignments: [base64, ...student.assignments].slice(0, 10) });
    }
  };

  const getPointerPos = (e: any, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDrawing = (e: any) => { 
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    const pos = getPointerPos(e, canvas);
    const ctx = canvas.getContext('2d');
    if (ctx) { ctx.beginPath(); ctx.moveTo(pos.x, pos.y); }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) ctx.beginPath();
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (e.cancelable) e.preventDefault();
    const pos = getPointerPos(e, canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.strokeStyle = drawColor; 
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
      setAiResult('');
    }
  };

  const handleCorrection = async (type: 'speech' | 'writing') => {
    setIsProcessing(true);
    setAiResult('Checking...');
    
    if (type === 'speech') {
      const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!Recognition) {
        setAiResult("Speech API not supported here!");
        setIsProcessing(false);
        return;
      }
      const rec = new Recognition();
      rec.onresult = async (e: any) => {
        const transcript = e.results[0][0].transcript;
        const prompt = `The target word is "${targetWord}". The student said "${transcript}". Check their pronunciation. Be a super friendly encouraging robot. 1 short sentence response.`;
        // Fix: Use analyzeImage for speech correction text logic
        const result = await analyzeImage('', prompt);
        setAiResult(result);
        speakText(result);
        setIsProcessing(false);
      };
      rec.onerror = () => {
        setAiResult("Oops! Try again?");
        setIsProcessing(false);
      }
      rec.start();
    } else {
      const dataUrl = canvasRef.current?.toDataURL('image/jpeg');
      if (dataUrl) {
        const prompt = `The student tried to write "${targetWord}". Check their handwriting for correct formation. Be super kind. 1 short sentence response.`;
        await handleCaptureAndAnalyze(dataUrl, prompt);
      }
    }
  };

  const handleFaceRegister = (base64: string) => {
    const newProfile: StudentProfile = {
      name: tempName,
      marks: 92,
      accuracy: 88,
      timeTaken: 15,
      iq: 105,
      assignments: [],
      faceData: base64
    };
    saveProfile(newProfile);
    navigateTo(AppScreen.HOME, `Welcome, ${tempName}! Your face is now registered.`);
  };

  const handleFaceLogin = async (base64: string) => {
    if (!student || !student.faceData) {
      setAiResult("No registered student found.");
      return;
    }
    setIsProcessing(true);
    setAiResult("Recognizing...");
    const result = await verifyFace(student.faceData, base64);
    if (result.includes("YES")) {
      setAiResult("Welcome back!");
      navigateTo(AppScreen.HOME, `Welcome back, ${student.name}!`);
      setIsProcessing(false);
    } else {
      setAiResult("Hmm, I don't recognize you.");
      speakText("Hmm, I don't recognize you. Try again!", true);
      setIsProcessing(false);
    }
  };

  const drawColors = [
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Emerald', value: '#10B981' },
    { name: 'Sky', value: '#0EA5E9' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Black', value: '#000000' }
  ];

  // Router logic
  switch (screen) {
    case AppScreen.LOGIN:
      return <LoginScreen onEnter={(role) => {
        if (role === 'student') {
          if (student) navigateTo(AppScreen.FACE_LOGIN);
          else navigateTo(AppScreen.REGISTER);
        } else {
          navigateTo(AppScreen.EDUCATOR_DASHBOARD);
        }
      }} />;
    
    case AppScreen.REGISTER:
      return <RegisterScreen onBack={() => navigateTo(AppScreen.LOGIN)} onNext={(name) => { setTempName(name); navigateTo(AppScreen.FACE_REGISTER); }} />;

    case AppScreen.FACE_REGISTER:
      return (
        <div className="min-h-screen bg-indigo-50 flex flex-col">
          <Header title="Register Face 📸" onBack={() => navigateTo(AppScreen.REGISTER)} color="bg-indigo-600" />
          <div className="flex-1 p-6 flex flex-col space-y-6">
            <h3 className="text-2xl font-black text-indigo-900 text-center">Look at the camera, {tempName}!</h3>
            <div className="flex-1">
              <Camera isActive={true} onCapture={handleFaceRegister} />
            </div>
          </div>
        </div>
      );

    case AppScreen.FACE_LOGIN:
      return (
        <div className="min-h-screen bg-indigo-50 flex flex-col">
          <Header title="Face Login 📸" onBack={() => navigateTo(AppScreen.LOGIN)} color="bg-indigo-600" />
          <div className="flex-1 p-6 flex flex-col space-y-6">
            <h3 className="text-2xl font-black text-indigo-900 text-center">Smile for the camera!</h3>
            <div className="flex-1">
              <Camera isActive={true} onCapture={handleFaceLogin} />
            </div>
            {aiResult && <div className="p-4 bg-white rounded-2xl shadow-lg text-center font-bold text-indigo-600 animate-bounce">{aiResult}</div>}
            <button 
              onClick={() => navigateTo(AppScreen.REGISTER)}
              className="text-indigo-400 font-black underline p-4 hover:text-indigo-600 transition-colors"
            >
              Not registered? Sign up here.
            </button>
          </div>
        </div>
      );

    case AppScreen.EDUCATOR_DASHBOARD:
      return <EducatorDashboard onScreen={(s) => navigateTo(s)} onLogout={() => navigateTo(AppScreen.LOGIN)} />;

    case AppScreen.HOME:
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
          <header className="bg-indigo-600 p-10 text-white rounded-b-[60px] shadow-2xl flex justify-between items-center relative overflow-hidden">
            <div className="z-10">
              <h2 className="text-3xl font-black tracking-tight">Hi, {student?.name || 'Learner'}! 👋</h2>
              <p className="text-indigo-200 font-bold mt-1">Ready for magic learning?</p>
            </div>
            <button 
              onClick={() => navigateTo(AppScreen.LOGIN)} 
              className="bg-white/20 p-4 rounded-3xl z-10 hover:bg-white/30 transition-colors active:scale-90 shadow-lg"
            >
              <BackIcon className="w-8 h-8" />
            </button>
            <div className="absolute -right-10 -bottom-10 opacity-10"><RobotIcon className="w-60 h-60" /></div>
          </header>

          <main className="p-8 grid grid-cols-1 gap-8 flex-1">
            <button 
              onClick={() => navigateTo(AppScreen.MAGIC_MENU, "Magic Mate!")} 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 p-10 rounded-[50px] text-white shadow-2xl active:scale-95 transition-all flex items-center justify-between group border-4 border-purple-400/50"
            >
              <div>
                <h3 className="text-3xl font-black tracking-tight">Magic Mate ✨</h3>
                <p className="text-purple-100 font-bold mt-1">AI Tools & Games</p>
              </div>
              <div className="bg-white/20 p-5 rounded-full group-hover:rotate-12 transition-transform shadow-inner">
                <RobotIcon className="w-14 h-14" />
              </div>
            </button>

            <div className="grid grid-cols-2 gap-8">
              <ActionCard title="Lessons" icon={<PaletteIcon className="w-10 h-10" />} color="orange" onClick={() => navigateTo(AppScreen.LESSONS, "Lesson Path!")} desc="Learn Path" />
              <ActionCard title="Report Card" icon={<EmojiHappyIcon className="w-10 h-10" />} color="emerald" onClick={() => { setReportFromScreen(AppScreen.HOME); navigateTo(AppScreen.REPORT_CARD, "Magic Results!"); }} desc="My Marks" />
            </div>

            <button onClick={() => navigateTo(AppScreen.FEEDBACK)} className="w-full py-8 bg-white border-4 border-slate-100 rounded-[40px] text-slate-400 font-black text-xl hover:bg-slate-50 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-3">
              <span>SEND FEEDBACK</span> <span>💌</span>
            </button>
          </main>
        </div>
      );

    case AppScreen.MAGIC_MENU:
      return (
        <div className="min-h-screen bg-slate-50">
          <Header title="Magic Tools ✨" onBack={() => navigateTo(AppScreen.HOME)} color="bg-purple-700" />
          <div className="p-8 grid grid-cols-2 gap-8">
            <ActionCard title="Object Scan" icon={<CameraIcon className="w-10 h-10" />} color="blue" onClick={() => navigateTo(AppScreen.OBJECT_DETECT, "Magic Scanner!")} />
            <ActionCard title="Speech Pro" icon={<MicIcon className="w-10 h-10" />} color="red" onClick={() => { setTargetWord('Rainbow'); navigateTo(AppScreen.SPEECH_CORRECTION, "Speech Master!"); }} />
            <ActionCard title="Writing Pro" icon={<PaletteIcon className="w-10 h-10" />} color="indigo" onClick={() => { setTargetWord('S'); navigateTo(AppScreen.WRITING_CORRECTION, "Writing Pro!"); }} />
            <ActionCard title="Face Check" icon={<EmojiHappyIcon className="w-10 h-10" />} color="yellow" onClick={() => navigateTo(AppScreen.EMOTION_CHECK, "Emotion Detect!")} />
            <ActionCard title="Homework" icon={<BrainIcon className="w-10 h-10" />} color="gray" onClick={() => navigateTo(AppScreen.HOMEWORK_HELPER, "Magic Tutor!")} />
          </div>
        </div>
      );

    case AppScreen.LESSONS:
      const curriculum = [
        { id: 1, title: "Alphabets Adventure", icon: "🅰️", desc: "Assignments included!", color: "from-rose-400 to-rose-600" },
        { id: 2, title: "Fun with Words", icon: "🍎", desc: "Words for each alphabet", color: "from-amber-400 to-amber-600" },
        { id: 3, title: "Number Island", icon: "1️⃣", desc: "Counting basics", color: "from-emerald-400 to-emerald-600" },
        { id: 4, title: "Numbers in Words", icon: "📝", desc: "Spelling numbers", color: "from-sky-400 to-sky-600" },
        { type: 'test', id: 'gt1', title: "Grand Test (1-4)", desc: "Show what you learned!", color: "from-indigo-600 to-indigo-800" },
        { id: 5, title: "World of Colors", icon: "🌈", desc: "Primary & Secondary", color: "from-pink-400 to-pink-600" },
        { id: 6, title: "Emotion Lab", icon: "🎭", desc: "Face detection game", color: "from-purple-400 to-purple-600" },
        { id: 7, title: "Object Finder", icon: "🔍", desc: "Find the hidden items", color: "from-teal-400 to-teal-600" },
        { type: 'test', id: 'gt2', title: "Grand Test (5-7)", desc: "Observation master!", color: "from-indigo-600 to-indigo-800" },
        { type: 'test', id: 'final', title: "Final Mega Test (1-7)", desc: "The Ultimate Challenge!", color: "from-slate-800 to-black" },
      ];

      return (
        <div className="min-h-screen bg-slate-50 pb-20">
          <Header title="Lesson Path 🗺️" onBack={() => navigateTo(AppScreen.HOME)} color="bg-orange-500" />
          <div className="p-8 space-y-8 max-w-2xl mx-auto">
            {curriculum.map((item) => (
              item.type === 'test' ? (
                <button 
                  key={item.id}
                  onClick={() => speakText(`Starting ${item.title}!`, true)}
                  className={`w-full p-10 bg-gradient-to-br ${item.color} rounded-[50px] shadow-2xl text-white text-center active:scale-95 transition-all border-4 border-white group relative overflow-hidden`}
                >
                  <h4 className="text-3xl font-black tracking-tighter drop-shadow-md">{item.title}</h4>
                  <p className="font-bold opacity-80 mt-1">{item.desc}</p>
                </button>
              ) : (
                <button 
                  key={item.id}
                  onClick={() => speakText(`Let's start ${item.title}!`, true)}
                  className="w-full p-8 bg-white rounded-[45px] shadow-xl border-4 border-orange-50 flex items-center gap-8 active:scale-95 transition-all group hover:bg-orange-50/30"
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${item.color} text-white rounded-[32px] flex items-center justify-center font-black text-4xl shadow-lg group-hover:rotate-6 transition-transform`}>
                    {item.icon}
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-black text-2xl text-slate-800 tracking-tight">{item.id}. {item.title}</div>
                    <div className="text-slate-400 font-bold text-sm mt-1">{item.desc}</div>
                  </div>
                </button>
              )
            ))}
          </div>
        </div>
      );

    case AppScreen.REPORT_CARD:
      return (
        <div className="min-h-screen bg-emerald-50">
          <Header title="Magic Results 🌟" onBack={() => navigateTo(reportFromScreen)} color="bg-emerald-600" />
          <div className="p-8 flex-1 flex flex-col">
            {student && (
              <div className="bg-white p-12 rounded-[60px] shadow-2xl text-center space-y-8 border-4 border-white relative overflow-hidden flex-1 flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-8 opacity-5"><EmojiHappyIcon className="w-60 h-60" /></div>
                <div>
                  <h3 className="text-8xl font-black text-emerald-600 drop-shadow-sm">{student.marks}%</h3>
                  <p className="font-black text-emerald-300 tracking-widest uppercase mt-2">Overall Magic Score</p>
                </div>
                <div className="grid grid-cols-2 gap-8 w-full">
                  <div className="p-8 bg-emerald-50 rounded-[40px] border-4 border-emerald-100 shadow-inner">
                    <div className="font-black text-4xl text-emerald-700">{student.accuracy}%</div>
                    <div className="text-sm font-bold text-emerald-400 uppercase mt-1">Accuracy</div>
                  </div>
                  <div className="p-8 bg-amber-50 rounded-[40px] border-4 border-amber-100 shadow-inner">
                    <div className="font-black text-4xl text-amber-700">{student.iq}</div>
                    <div className="text-sm font-bold text-amber-400 uppercase mt-1">IQ Score</div>
                  </div>
                </div>
                <div className="p-8 bg-blue-50 rounded-[40px] border-4 border-blue-100 w-full shadow-inner">
                  <div className="font-black text-2xl text-blue-700 tracking-tight">You are a Superstar Learner! 🚀</div>
                </div>
              </div>
            )}
          </div>
        </div>
      );

    case AppScreen.CREATE_LESSON:
      return (
        <div className="min-h-screen bg-slate-50">
          <Header title="Create Magic ✨" onBack={() => navigateTo(AppScreen.EDUCATOR_DASHBOARD)} color="bg-blue-600" />
          <div className="p-10 space-y-8">
            <input type="text" className="w-full p-8 rounded-[40px] border-4 border-slate-100 outline-none focus:border-blue-500 shadow-inner text-xl font-bold" placeholder="E.g. Dinosaur Math" />
            <button className="w-full py-8 bg-blue-600 text-white rounded-[40px] font-black text-2xl shadow-2xl active:scale-95 transition-transform">SAVE MAGIC LESSON 💾</button>
          </div>
        </div>
      );

    case AppScreen.MANAGE_EXAMS:
      return (
        <div className="min-h-screen bg-slate-50">
          <Header title="Grand Tests 📝" onBack={() => navigateTo(AppScreen.EDUCATOR_DASHBOARD)} color="bg-purple-600" />
          <div className="p-10 space-y-8">
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">Active Exams</h3>
            <button className="w-full py-8 bg-purple-600 text-white rounded-[45px] font-black text-2xl shadow-2xl active:scale-95 transition-all">
              + NEW GRAND TEST
            </button>
          </div>
        </div>
      );

    case AppScreen.VIEW_REPORTS:
      return (
        <div className="min-h-screen bg-slate-50">
          <Header title="Class Insights 📈" onBack={() => navigateTo(AppScreen.EDUCATOR_DASHBOARD)} color="bg-slate-800" />
          <div className="p-10">
             <div className="bg-white rounded-[60px] overflow-hidden shadow-2xl border-4 border-white p-10">
                <h3 className="text-2xl font-black text-slate-800">Student Progress</h3>
                <div className="mt-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-4xl shadow-inner">👦</div>
                      <div className="font-black text-2xl text-slate-800">{student?.name || 'Tejas Junior'}</div>
                    </div>
                    <button 
                         className="bg-indigo-600 text-white px-8 py-4 rounded-[30px] font-black shadow-lg" 
                         onClick={() => { setReportFromScreen(AppScreen.VIEW_REPORTS); navigateTo(AppScreen.REPORT_CARD); }}
                    >
                         DETAILS
                    </button>
                </div>
             </div>
          </div>
        </div>
      );

    case AppScreen.SPEECH_CORRECTION:
      return (
        <div className="min-h-screen bg-rose-500 flex flex-col">
          <Header title="Speech Master 🎙️" onBack={() => navigateTo(AppScreen.MAGIC_MENU)} color="bg-rose-600" />
          <div className="flex-1 flex flex-col items-center justify-center p-10 space-y-12">
            <div className="bg-white/20 backdrop-blur-2xl p-16 rounded-[80px] text-white text-center w-full border-4 border-white/40 shadow-2xl">
              <h3 className="text-8xl font-black mt-6 drop-shadow-lg tracking-tighter">{targetWord}</h3>
            </div>
            <button 
              onClick={() => handleCorrection('speech')} 
              disabled={isProcessing} 
              className={`w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all text-rose-500 ${isProcessing ? 'animate-pulse' : ''}`}
            >
              <MicIcon className="w-24 h-24" />
            </button>
            <div className="bg-white p-10 rounded-[50px] w-full text-center shadow-2xl">
              <p className="font-black text-3xl text-rose-900 leading-tight">{aiResult || 'Tap the mic and speak!'}</p>
            </div>
          </div>
        </div>
      );

    case AppScreen.WRITING_CORRECTION:
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Header 
            title="Writing Pro ✍️" 
            onBack={() => navigateTo(AppScreen.MAGIC_MENU)} 
            color="bg-indigo-600" 
            right={<div className="bg-white/20 px-8 py-3 rounded-full font-black text-5xl shadow-inner">{targetWord}</div>} 
          />
          <div className="flex-1 p-8 flex flex-col space-y-6">
            <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {drawColors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setDrawColor(c.value)}
                  className={`w-12 h-12 rounded-full border-4 transition-all active:scale-90 flex-shrink-0 ${drawColor === c.value ? 'border-white ring-4 ring-indigo-200 scale-110 shadow-lg' : 'border-transparent shadow-sm'}`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
            <div className="flex-1 bg-white rounded-[60px] shadow-2xl border-8 border-indigo-50 relative overflow-hidden">
               <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseUp={stopDrawing} onMouseMove={draw} onTouchStart={startDrawing} onTouchEnd={stopDrawing} onTouchMove={draw} width={500} height={800} className="w-full h-full touch-none" />
               {aiResult && <div className="absolute top-8 left-8 right-8 p-6 bg-indigo-600 text-white font-black rounded-[35px] shadow-2xl text-center text-xl pointer-events-none">{aiResult}</div>}
            </div>
            <div className="grid grid-cols-2 gap-8 pb-10">
              <button onClick={clearCanvas} className="py-8 bg-slate-200 rounded-[45px] font-black text-2xl text-slate-500 shadow-xl active:scale-95 transition-all">ERASE ALL</button>
              <button onClick={() => handleCorrection('writing')} disabled={isProcessing} className="py-8 bg-indigo-600 text-white rounded-[45px] font-black text-2xl shadow-2xl active:scale-95 transition-all">CHECK WORK!</button>
            </div>
          </div>
        </div>
      );

    case AppScreen.OBJECT_DETECT:
    case AppScreen.EMOTION_CHECK:
    case AppScreen.HOMEWORK_HELPER:
      const titles: Record<string, string> = {
        [AppScreen.OBJECT_DETECT]: "Magic Scanner 🔍",
        [AppScreen.EMOTION_CHECK]: "Emotion Detect 🎭",
        [AppScreen.HOMEWORK_HELPER]: "Magic Tutor 📚"
      };
      const prompts: Record<string, string> = {
        [AppScreen.OBJECT_DETECT]: "Act like a friendly robot guide. Identify the main object in this photo for a child. Be super enthusiastic! 1 sentence.",
        [AppScreen.EMOTION_CHECK]: "Tell this student what emotion you see on their face and give a sweet encouraging tip. Be super friendly! 1 sentence.",
        [AppScreen.HOMEWORK_HELPER]: "You are a kind tutor. Explain this educational content simply for a 7 year old. Be encouraging! 1 sentence."
      };
      return (
        <div className="min-h-screen bg-black flex flex-col overflow-hidden">
          <Header title={titles[screen]} onBack={() => navigateTo(AppScreen.MAGIC_MENU)} color="bg-black/40 backdrop-blur-md" />
          <div className="flex-1 relative">
            <Camera isActive={true} onCapture={(img) => handleCaptureAndAnalyze(img, prompts[screen])} />
            <div className="absolute bottom-36 left-8 right-8 p-10 bg-white/95 backdrop-blur-2xl rounded-[50px] shadow-2xl border-4 border-white">
              <p className="text-slate-800 font-black text-2xl text-center leading-tight">
                {aiResult || 'Snap a photo of anything!'}
              </p>
            </div>
          </div>
        </div>
      );

    case AppScreen.FEEDBACK:
      return (
        <div className="min-h-screen bg-white">
          <Header title="Send Magic 💌" onBack={() => navigateTo(AppScreen.HOME)} color="bg-slate-800" />
          <div className="p-10 space-y-10 text-center text-8xl">📬</div>
        </div>
      );

    default:
      return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-10 text-center">
           <div className="text-9xl mb-8">🚧</div>
           <button onClick={() => navigateTo(AppScreen.HOME)} className="mt-12 px-16 py-6 bg-indigo-600 text-white rounded-full font-black text-2xl shadow-2xl active:scale-95 transition-all">GO BACK HOME</button>
        </div>
      );
  }
};

export default App;
