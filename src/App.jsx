import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import {
  CalendarDays, Check, ChevronLeft, ChevronRight,
  Plus, Search, Sparkles, Trash2, Volume2, VolumeX, SkipForward
} from "lucide-react";

const STORAGE_KEY = "flashy-todo-v3";
function uid() { return Math.random().toString(36).slice(2, 10); }

function getLocalIsoDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const todayString = getLocalIsoDate();

const initialTasks = [
  { id: uid(), text: "Ship the UI polish pass",   completed: false, date: todayString },
  { id: uid(), text: "Add smooth enter animations", completed: true,  date: todayString },
  { id: uid(), text: "Review today's priorities",   completed: false, date: todayString },
];

const AUDIO_TRACKS = [
  { name: "Lo-Fi Study", url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3" },
  { name: "Chill Beats", url: "https://cdn.pixabay.com/audio/2026/03/24/audio_cff6ecc835.mp3" },
  { name: "Night Rain",  url: "https://cdn.pixabay.com/audio/2025/05/31/audio_41498a0307.mp3" },
  { name: "Coffee Shop", url: "https://cdn.pixabay.com/audio/2022/11/22/audio_febc508520.mp3" },
  { name: "Ambient Space", url: "https://cdn.pixabay.com/audio/2026/03/05/audio_4bcdfdf1cb.mp3" }
];

const themes = {
  dark: {
    bg: "#030712",
    gradBlob1: "rgba(91,33,182,0.18)", gradBlob2: "rgba(6,182,212,0.10)",
    particleColor: "#a78bfa",
    ringColor: "rgba(167,139,250,0.7)",
    glowColor: "rgba(139,92,246,0.25)", glowColor2: "rgba(109,40,217,0.12)",
    dotShadow: "0 0 20px rgba(255,255,255,0.95), 0 0 40px rgba(139,92,246,0.7), 0 0 70px rgba(109,40,217,0.4)",
    ringBoxShadow: "0 0 45px rgba(139,92,246,0.55), inset 0 0 12px rgba(109,40,217,0.2)",
    background: "bg-[#030712] text-white",
    card: "border-white/10 bg-white/[0.06] text-white shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-md",
    subtle: "text-white/70",
    input: "bg-white/5 border-white/10 placeholder:text-white/35",
    button: "border border-white/10 bg-white/5 text-white hover:bg-white/10",
    accent: "from-cyan-400 via-violet-500 to-fuchsia-500",
    activeCalendar: "border-cyan-400/40 bg-gradient-to-br from-cyan-500/30 via-violet-500/30 to-fuchsia-500/30 shadow-[0_0_20px_rgba(34,211,238,0.25)]",
    progress: "from-cyan-400 to-fuchsia-500",
    progressStart: "#22d3ee", progressEnd: "#d946ef",
    cardHoverGlow: "rgba(139,92,246,0.25)",
    accentText: "text-white",
  },
  pink: {
    bg: "#14040f",
    gradBlob1: "rgba(255,0,128,0.18)", gradBlob2: "rgba(236,72,153,0.12)",
    particleColor: "#f472b6",
    ringColor: "rgba(244,114,182,0.75)",
    glowColor: "rgba(236,72,153,0.25)", glowColor2: "rgba(217,70,239,0.12)",
    dotShadow: "0 0 20px rgba(255,255,255,0.95), 0 0 40px rgba(236,72,153,0.7), 0 0 70px rgba(217,70,239,0.4)",
    ringBoxShadow: "0 0 45px rgba(236,72,153,0.55), inset 0 0 12px rgba(217,70,239,0.2)",
    background: "bg-[#14040f] text-pink-50",
    card: "border-pink-300/10 bg-pink-200/[0.06] text-pink-50 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-md",
    subtle: "text-pink-100/70",
    input: "bg-pink-200/10 border-pink-200/10 placeholder:text-pink-100/40",
    button: "border border-pink-300/20 bg-pink-200/10 text-pink-50 hover:bg-pink-200/20",
    accent: "from-pink-400 via-fuchsia-500 to-rose-500",
    activeCalendar: "border-pink-400/40 bg-gradient-to-br from-pink-500/30 via-fuchsia-500/30 to-rose-500/30 shadow-[0_0_20px_rgba(236,72,153,0.25)]",
    progress: "from-pink-400 to-rose-500",
    progressStart: "#f472b6", progressEnd: "#f43f5e",
    cardHoverGlow: "rgba(236,72,153,0.25)",
    accentText: "text-white",
  },
  beige: {
    bg: "#1a1208",
    gradBlob1: "rgba(180,130,60,0.22)", gradBlob2: "rgba(140,95,30,0.15)",
    particleColor: "#d4a94f",
    ringColor: "rgba(184,133,42,0.65)",
    glowColor: "rgba(200,150,50,0.35)", glowColor2: "rgba(180,130,40,0.18)",
    dotShadow: "0 0 10px rgba(160,100,20,0.6), 0 0 22px rgba(212,169,79,0.4)",
    ringBoxShadow: "0 0 18px rgba(180,120,30,0.35), inset 0 0 8px rgba(212,169,79,0.15)",
    background: "bg-[#1a1208] text-[#f0e6d0]",
    card: "border-[#c8a96a]/20 bg-[#2e2010]/70 text-[#f0e6d0] shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-md",
    subtle: "text-[#c8a96a]",
    input: "bg-[#241a0a] border-[#8a6a30]/40 placeholder:text-[#c8a96a]/50",
    button: "border border-[#8a6a30]/30 bg-[#2e2010]/60 text-[#f0e6d0] hover:bg-[#3d2c10]/80",
    accent: "from-[#c49a3c] via-[#b8852a] to-[#9e6e1a]",
    activeCalendar: "border-[#b8852a] bg-gradient-to-br from-[#d4aa55] via-[#c49535] to-[#a87820] shadow-[0_0_20px_rgba(180,130,40,0.35)]",
    progress: "from-[#c49a3c] to-[#9e6e1a]",
    progressStart: "#c49a3c", progressEnd: "#9e6e1a",
    cardHoverGlow: "rgba(196,154,60,0.25)",
    accentText: "text-[#1a1208]",
  },
};

const PARTICLES = Array.from({ length: 38 }, () => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  size: `${Math.random() * 3 + 1}px`,
  duration: `${Math.random() * 15 + 10}s`,
  delay: `-${Math.random() * 10}s`,
  opacity: Math.random() * 0.6 + 0.15,
  glow: Math.random() * 6 + 3,
  tx1: `${Math.random() > 0.5 ? "" : "-"}${Math.floor(Math.random() * 40 + 10)}px`,
  ty1: `-${Math.floor(Math.random() * 60 + 20)}px`,
  tx2: `${Math.random() > 0.5 ? "" : "-"}${Math.floor(Math.random() * 30 + 5)}px`,
  ty2: `-${Math.floor(Math.random() * 80 + 30)}px`,
  ty3: `-${Math.floor(Math.random() * 100 + 40)}px`,
}));

function Particle({ data, color }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: data.left,
        top: data.top,
        width: data.size,
        height: data.size,
        opacity: data.opacity,
        background: color,
        boxShadow: `0 0 ${data.glow}px ${color}`,
        animationName: "floatParticle",
        animationDuration: data.duration,
        animationDelay: data.delay,
        animationTimingFunction: "ease-in-out",
        animationIterationCount: "infinite",
        animationDirection: "alternate",
      }}
    />
  );
}

function ProgressRing({ progress, theme }) {
  const r = 52, circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  const t = themes[theme];
  const gradId = `prog-${theme}`;
  return (
    <div className="relative flex items-center justify-center" style={{ width: 130, height: 130 }}>
      <svg width="130" height="130" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <motion.circle
          cx="65" cy="65" r={r} fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "spring", stiffness: 60, damping: 14 }}
        />
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={t.progressStart} />
            <stop offset="100%" stopColor={t.progressEnd} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-black">{progress}%</span>
        <span className={`text-[10px] tracking-widest uppercase ${t.subtle}`}>done</span>
      </div>
    </div>
  );
}

function MagneticButton({ children, className, onClick, strength = 0.35 }) {
  const ref = useRef(null);
  const x = useSpring(0, { stiffness: 200, damping: 18 });
  const y = useSpring(0, { stiffness: 200, damping: 18 });
  const onMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  }, [x, y, strength]);
  const onLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return (
    <motion.button ref={ref} style={{ x, y }}
      onMouseMove={onMove} onMouseLeave={onLeave}
      onClick={onClick} className={className} whileTap={{ scale: 0.96 }}>
      {children}
    </motion.button>
  );
}

function GlowCard({ children, className, glowColor }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`relative transition-all duration-300 ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        boxShadow: hovered
          ? `0 0 0 1px ${glowColor}, 0 0 30px ${glowColor}, 0 20px 60px rgba(0,0,0,0.4)`
          : undefined,
      }}
    >
      {hovered && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] z-0"
          style={{ background: `radial-gradient(circle at 50% 0%, ${glowColor} 0%, transparent 70%)` }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialTasks; }
    catch { return initialTasks; }
  });
  const [input, setInput]               = useState("");
  const [query, setQuery]               = useState("");
  const [filter, setFilter]             = useState("all");
  const [theme, setTheme]               = useState("dark");
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [calendarOffset, setCalendarOffset] = useState(0);
  
  const [audioOn, setAudioOn]           = useState(false);
  const [trackIndex, setTrackIndex]     = useState(0);
  
  const [isChangingTheme, setIsChangingTheme] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);

  const t = themes[theme];

  const cursorGlowRef = useRef(null);
  const cursorRingRef = useRef(null);
  const cursorDotRef  = useRef(null);
  const cursorTarget  = useRef({ x: 0, y: 0 });
  const cursorCurrent = useRef({ x: 0, y: 0 });
  const ringCurrent   = useRef({ x: 0, y: 0 });
  const bgRef         = useRef(null);
  const bgMousePos    = useRef({ x: 0.5, y: 0.5 });
  const audioRef      = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialMount(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useLayoutEffect(() => {
    const onMove = (e) => {
      cursorTarget.current.x = e.clientX;
      cursorTarget.current.y = e.clientY;
      bgMousePos.current.x = e.clientX / window.innerWidth;
      bgMousePos.current.y = e.clientY / window.innerHeight;
      if (cursorDotRef.current)
        cursorDotRef.current.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
    };
    window.addEventListener("mousemove", onMove);
    let raf;
    const loop = () => {
      cursorCurrent.current.x += (cursorTarget.current.x - cursorCurrent.current.x) * 0.08;
      cursorCurrent.current.y += (cursorTarget.current.y - cursorCurrent.current.y) * 0.08;
      ringCurrent.current.x   += (cursorCurrent.current.x - ringCurrent.current.x) * 0.12;
      ringCurrent.current.y   += (cursorCurrent.current.y - ringCurrent.current.y) * 0.12;
      if (cursorGlowRef.current)
        cursorGlowRef.current.style.transform = `translate3d(${cursorCurrent.current.x}px,${cursorCurrent.current.y}px,0)`;
      if (cursorRingRef.current)
        cursorRingRef.current.style.transform = `translate3d(${ringCurrent.current.x}px,${ringCurrent.current.y}px,0)`;
      if (bgRef.current) {
        const mx = bgMousePos.current.x * 100;
        const my = bgMousePos.current.y * 100;
        bgRef.current.style.background = `radial-gradient(circle at ${mx}% ${my}%, ${t.gradBlob1} 0%, transparent 38%), radial-gradient(circle at ${100 - mx}% ${100 - my}%, ${t.gradBlob2} 0%, transparent 32%)`;
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, [t.gradBlob1, t.gradBlob2]);

  useEffect(() => {
    if (!audioRef.current) return;
    
    audioRef.current.load();

    if (audioOn) { 
      audioRef.current.volume = 0.25; 
      audioRef.current.play().catch(() => {}); 
    } else {
      audioRef.current.pause();
    }
  }, [audioOn, trackIndex]);

  const changeTheme = (next) => {
    if (next === theme) return;
    setIsChangingTheme(true);
    setTimeout(() => {
      setTheme(next);
      setIsChangingTheme(false);
    }, 180);
  };

  const filteredTasks = useMemo(() => tasks.filter(task => {
    const matchDate   = task.date === selectedDate;
    const matchQuery  = task.text.toLowerCase().includes(query.toLowerCase());
    const matchFilter = filter === "all" || (filter === "active" && !task.completed) || (filter === "done" && task.completed);
    return matchDate && matchQuery && matchFilter;
  }), [tasks, query, filter, selectedDate]);

  const progress = filteredTasks.length
    ? Math.round(filteredTasks.filter(tk => tk.completed).length / filteredTasks.length * 100)
    : 0;

  const addTask = () => {
    const text = input.trim();
    if (!text) return;
    setTasks(prev => [{ id: uid(), text, completed: false, date: selectedDate }, ...prev]);
    setInput("");
  };
  const toggleTask     = (id) => setTasks(prev => prev.map(tk => tk.id === id ? { ...tk, completed: !tk.completed } : tk));
  const deleteTask     = (id) => setTasks(prev => prev.filter(tk => tk.id !== id));
  const clearCompleted = ()   => setTasks(prev => prev.filter(tk => !tk.completed));

  const calendarDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); 
      d.setDate(d.getDate() - 3 + i + calendarOffset); 
      return d;
    });
  }, [calendarOffset]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, filter: "blur(12px)" }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        filter: isChangingTheme ? "blur(4px)" : "blur(0px)" 
      }}
      transition={{ 
        duration: isInitialMount ? 1.1 : (isChangingTheme ? 0.18 : 0.32), 
        ease: "easeOut" 
      }}
      className={`app-root min-h-screen overflow-hidden cursor-none flex items-center justify-center transition-colors duration-700 ${t.background}`}
      style={{ backgroundColor: t.bg }}
    >
      <style>{`
        @keyframes floatParticle {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(15px, -35px) scale(1.2); }
          66%  { transform: translate(-10px, -65px) scale(0.9); }
          100% { transform: translate(5px, -110px) scale(1.1); opacity: 0; }
        }
      `}</style>

      <audio 
        ref={audioRef} 
        src={AUDIO_TRACKS[trackIndex].url} 
        loop 
      />

      <div ref={bgRef} className="pointer-events-none fixed inset-0 z-0 transition-all duration-75" />

      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        {PARTICLES.map((p, i) => <Particle key={i} data={p} color={t.particleColor} />)}
      </div>

      <div ref={cursorGlowRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-[16rem] w-[16rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
        style={{
          background: `radial-gradient(circle, ${t.glowColor} 0%, ${t.glowColor2} 38%, transparent 72%)`,
          mixBlendMode: "screen", filter: "blur(58px)", willChange: "transform",
        }} />

      <div ref={cursorRingRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          border: `1px solid ${t.ringColor}`,
          boxShadow: t.ringBoxShadow,
          mixBlendMode: "screen", filter: "blur(1px)", willChange: "transform",
        }} />

      <div ref={cursorDotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
        style={{ mixBlendMode: "screen", boxShadow: t.dotShadow, willChange: "transform" }} />

      <div className="flex w-full max-w-[1180px] items-stretch gap-8 px-4 py-8 scale-[0.84]">
        <div className="flex-1 flex flex-col gap-5">
          <GlowCard glowColor={t.cardHoverGlow} className={`glass-card flex-1 rounded-[1.4rem] border p-5 ${t.card}`}>
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs">
                  <Sparkles className="h-3.5 w-3.5" /> Task orbit controller
                </div>
                <h1 className="text-4xl font-black tracking-tight">Flashy Todo App ✨</h1>
                <p className={`mt-3 max-w-lg text-base ${t.subtle}`}>
                  Futuristic task management with cinematic gradients and smooth productivity flow.
                </p>
              </div>
              <div className="flex items-center gap-2 z-50">
                <MagneticButton onClick={() => setAudioOn(a => !a)} className={`rounded-full p-2 transition-all duration-300 ${t.button}`}>
                  {audioOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </MagneticButton>

                <AnimatePresence>
                  {audioOn && (
                    <motion.div
                      initial={{ width: 0, opacity: 0, scale: 0.8 }}
                      animate={{ width: "auto", opacity: 1, scale: 1 }}
                      exit={{ width: 0, opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2 origin-left overflow-hidden"
                    >
                      <div className={`flex items-center justify-center rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${t.button} hover:bg-transparent cursor-default whitespace-nowrap`}>
                        {AUDIO_TRACKS[trackIndex].name}
                      </div>
                      <MagneticButton 
                        onClick={() => setTrackIndex(i => (i + 1) % AUDIO_TRACKS.length)} 
                        className={`rounded-full p-2 transition-all duration-300 ${t.button}`}
                        title="Next Track"
                      >
                        <SkipForward className="h-4 w-4" />
                      </MagneticButton>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="w-[1px] h-6 bg-current opacity-20 mx-1"></div>

                {["dark","pink","beige"].map(th => (
                  <MagneticButton key={th} onClick={() => changeTheme(th)}
                    className={`rounded-full px-4 py-2 text-sm transition-all duration-300 ${theme === th ? `bg-gradient-to-r ${t.accent} ${t.accentText} shadow-lg` : t.button}`}>
                    {th.charAt(0).toUpperCase() + th.slice(1)}
                  </MagneticButton>
                ))}
              </div>
            </div>

            <div className={`rounded-[1.4rem] border p-4 ${t.card}`}>
              <div className="mb-5 flex items-center justify-between z-50">
                <div>
                  <div className="flex items-center gap-2 text-xl font-semibold">
                    <CalendarDays className="h-5 w-5" /> Orbit calendar
                  </div>
                  <p className={`mt-1 text-sm ${t.subtle}`}>Daily mission queues.</p>
                </div>
                <div className="flex gap-2">
                  <MagneticButton 
                    onClick={() => setCalendarOffset(prev => prev - 7)} 
                    className={`rounded-xl p-3 ${t.button}`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </MagneticButton>
                  <MagneticButton 
                    onClick={() => setCalendarOffset(prev => prev + 7)} 
                    className={`rounded-xl p-3 ${t.button}`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </MagneticButton>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-3 z-50">
                {calendarDays.map(day => {
                  const iso = getLocalIsoDate(day);
                  const isActive = iso === selectedDate;
                  const dayTasks = tasks.filter(tk => tk.date === iso).length;
                  return (
                    <MagneticButton key={iso} onClick={() => setSelectedDate(iso)} strength={0.2}
                      className={`rounded-[1rem] border p-3 transition-all duration-300 ${isActive ? t.activeCalendar : t.button}`}>
                      <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">
                        {day.toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                      <div className="mt-2 text-3xl font-black">{day.getDate()}</div>
                      <div className="mt-2 flex items-center justify-center gap-1 text-xs">
                        <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${t.progress}`} />
                        {dayTasks}
                      </div>
                    </MagneticButton>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-4 items-center">
              {[
                { label: "TOTAL TASKS", value: filteredTasks.length },
                { label: "LEFT TO DO",  value: filteredTasks.filter(tk => !tk.completed).length },
                { label: "COMPLETED",   value: filteredTasks.filter(tk => tk.completed).length },
              ].map(stat => (
                <GlowCard key={stat.label} glowColor={t.cardHoverGlow} className={`glass-card rounded-[1.2rem] border p-5 ${t.card}`}>
                  <div className={`text-[11px] tracking-[0.25em] ${t.subtle}`}>{stat.label}</div>
                  <div className="mt-3 text-4xl font-black">{stat.value}</div>
                </GlowCard>
              ))}
              <div className={`glass-card rounded-[1.2rem] border p-3 flex items-center justify-center ${t.card}`}>
                <ProgressRing progress={progress} theme={theme} />
              </div>
            </div>
          </GlowCard>

          <GlowCard glowColor={t.cardHoverGlow} className={`glass-card rounded-[1.4rem] border p-5 ${t.card} z-50`}>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Plus className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addTask()}
                  placeholder="Add a new task"
                  className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition-all duration-300 ${t.input} cursor-none`} />
              </div>
              <MagneticButton onClick={addTask}
                className={`rounded-xl bg-gradient-to-r px-6 py-3 text-sm font-bold transition-all duration-300 ${t.accent} ${t.accentText}`}>
                Add task
              </MagneticButton>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
                <input value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search tasks"
                  className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition-all duration-300 ${t.input} cursor-none`} />
              </div>
              <div className="flex gap-2">
                {["all","active","done"].map(type => (
                  <MagneticButton key={type} onClick={() => setFilter(type)}
                    className={`rounded-xl px-4 py-3 text-sm transition-all duration-300 ${filter === type ? `bg-gradient-to-r ${t.accent} ${t.accentText}` : t.button}`}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MagneticButton>
                ))}
              </div>
              <MagneticButton onClick={clearCompleted} className={`rounded-xl px-4 py-3 text-sm ${t.button}`}>
                Clear done
              </MagneticButton>
            </div>
          </GlowCard>
        </div>

        <GlowCard glowColor={t.cardHoverGlow} className={`glass-card w-[420px] self-stretch rounded-[1.4rem] border p-6 ${t.card} z-50`}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black">Mission Control</h2>
              <p className={`mt-1 text-sm ${t.subtle}`}>
                {(() => {
                  const [y, m, d] = selectedDate.split("-");
                  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
                })()}
              </p>
            </div>
            <div className={`rounded-full border px-4 py-2 text-sm ${t.button}`}>
              {filteredTasks.filter(tk => tk.completed).length} done
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredTasks.length === 0 ? (
                <motion.div key="empty"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className={`rounded-[1.4rem] border border-dashed p-10 text-center ${t.card}`}>
                  <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.2rem] bg-gradient-to-r ${t.accent}`}>
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-black">Mission queue empty</h3>
                  <p className={`mt-2 text-sm ${t.subtle}`}>Add a task and begin your orbit.</p>
                </motion.div>
              ) : (
                filteredTasks.map(task => (
                  <motion.div key={task.id} layout
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 24, scale: 0.95 }}
                    transition={{ duration: 0.28 }}
                    className={`group flex items-center gap-3 rounded-[1.1rem] border p-4 transition-all duration-300 hover:-translate-y-0.5 ${task.completed ? "border-emerald-400/20 bg-emerald-400/10" : t.card}`}
                    style={{ boxShadow: task.completed ? "0 0 20px rgba(52,211,153,0.12)" : undefined }}>

                    <MagneticButton strength={0.4} onClick={() => toggleTask(task.id)}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${task.completed ? "border-emerald-400 bg-emerald-400 text-white" : t.button}`}>
                      <AnimatePresence>
                        {task.completed && (
                          <motion.span
                            initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                            <Check className="h-4 w-4" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </MagneticButton>

                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold transition-all duration-300 ${task.completed ? "line-through opacity-50" : ""}`}>
                        {task.text}
                      </h3>
                      <p className={`mt-1 text-xs ${t.subtle}`}>Tap to toggle completion.</p>
                    </div>

                    <MagneticButton strength={0.4} onClick={() => deleteTask(task.id)}
                      className={`rounded-xl p-3 transition-all duration-300 hover:bg-red-500/20 hover:text-red-400 ${t.button}`}>
                      <Trash2 className="h-4 w-4" />
                    </MagneticButton>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </GlowCard>
      </div>
    </motion.div>
  );
}