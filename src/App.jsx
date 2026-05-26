import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import {
  CalendarDays, Check, ChevronLeft, ChevronRight,
  Plus, Search, Sparkles, Trash2, Volume2, VolumeX, SkipForward,
  Flame, Target, AlertCircle, Tag, Clock, Settings, X, User, Sliders, ShieldCheck,
  ChevronDown
} from "lucide-react";

const STORAGE_KEY = "flashy-todo-v4";
const SETTINGS_KEY = "flashy-settings-v1";

function uid() { return Math.random().toString(36).slice(2, 10); }

function getLocalIsoDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const todayString = getLocalIsoDate();

const initialTasks = [
  { id: uid(), text: "Ship the UI polish pass", completed: false, date: todayString, priority: "high", tags: ["Development"], dueTime: "14:00" },
  { id: uid(), text: "Add smooth enter animations", completed: true, date: todayString, priority: "medium", tags: ["Design"], dueTime: "16:30" },
  { id: uid(), text: "Review today's priorities", completed: false, date: todayString, priority: "critical", tags: ["Planning"], dueTime: "09:00" },
];

const defaultSettings = {
  dailyGoal: 5,
  userName: "Operator",
  forgivingStreak: true,
  volume: 0.25
};

const AUDIO_TRACKS = [
  { name: "Lo-Fi Study",    url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3" },
  { name: "Chill Beats",    url: "https://cdn.pixabay.com/audio/2026/03/24/audio_cff6ecc835.mp3" },
  { name: "Night Rain",     url: "https://cdn.pixabay.com/audio/2025/05/31/audio_41498a0307.mp3" },
  { name: "Coffee Shop",    url: "https://cdn.pixabay.com/audio/2022/11/22/audio_febc508520.mp3" },
  { name: "Ambient Space",  url: "https://cdn.pixabay.com/audio/2026/03/05/audio_4bcdfdf1cb.mp3" }
];

const EMPTY_MESSAGES = [
  "System idle. Awaiting directives.",
  "The grid is quiet. Add a mission.",
  "No active protocols.",
  "Cyber-deck clear. Ready for input."
];

const PRIORITY_OPTIONS = [
  { value: "low",      label: "Low Priority",    dot: "bg-gray-400"   },
  { value: "medium",   label: "Medium Priority",  dot: "bg-blue-400"   },
  { value: "high",     label: "High Priority",    dot: "bg-orange-400" },
  { value: "critical", label: "Critical",         dot: "bg-red-400"    },
];

const themes = {
  dark: {
    bg: "#030712", gradBlob1: "rgba(91,33,182,0.18)", gradBlob2: "rgba(6,182,212,0.10)",
    particleColor: "#a78bfa", ringColor: "rgba(167,139,250,0.7)",
    glowColor: "rgba(139,92,246,0.25)", glowColor2: "rgba(109,40,217,0.12)",
    dotShadow: "0 0 20px rgba(255,255,255,0.95), 0 0 40px rgba(139,92,246,0.7), 0 0 70px rgba(109,40,217,0.4)",
    ringBoxShadow: "0 0 45px rgba(139,92,246,0.55), inset 0 0 12px rgba(109,40,217,0.2)",
    background: "bg-[#030712] text-white",
    card: "border-white/10 bg-white/[0.06] text-white shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-md",
    subtle: "text-white/70", input: "bg-white/5 border-white/10 placeholder:text-white/35",
    button: "border border-white/10 bg-white/5 text-white hover:bg-white/10",
    accent: "from-cyan-400 via-violet-500 to-fuchsia-500",
    activeCalendar: "border-cyan-400/40 bg-gradient-to-br from-cyan-500/30 via-violet-500/30 to-fuchsia-500/30 shadow-[0_0_20px_rgba(34,211,238,0.25)]",
    progress: "from-cyan-400 to-fuchsia-500", progressStart: "#22d3ee", progressEnd: "#d946ef",
    cardHoverGlow: "rgba(139,92,246,0.25)", accentText: "text-white",
    solidBg: "#030712", solidText: "#ffffff", solidBorder: "rgba(255,255,255,0.1)"
  },
  pink: {
    bg: "#14040f", gradBlob1: "rgba(255,0,128,0.18)", gradBlob2: "rgba(236,72,153,0.12)",
    particleColor: "#f472b6", ringColor: "rgba(244,114,182,0.75)",
    glowColor: "rgba(236,72,153,0.25)", glowColor2: "rgba(217,70,239,0.12)",
    dotShadow: "0 0 20px rgba(255,255,255,0.95), 0 0 40px rgba(236,72,153,0.7), 0 0 70px rgba(217,70,239,0.4)",
    ringBoxShadow: "0 0 45px rgba(236,72,153,0.55), inset 0 0 12px rgba(217,70,239,0.2)",
    background: "bg-[#14040f] text-pink-50",
    card: "border-pink-300/10 bg-pink-200/[0.06] text-pink-50 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-md",
    subtle: "text-pink-100/70", input: "bg-pink-200/10 border-pink-200/10 placeholder:text-pink-100/40",
    button: "border border-pink-300/20 bg-pink-200/10 text-pink-50 hover:bg-pink-200/20",
    accent: "from-pink-400 via-fuchsia-500 to-rose-500",
    activeCalendar: "border-pink-400/40 bg-gradient-to-br from-pink-500/30 via-fuchsia-500/30 to-rose-500/30 shadow-[0_0_20px_rgba(236,72,153,0.25)]",
    progress: "from-pink-400 to-rose-500", progressStart: "#f472b6", progressEnd: "#f43f5e",
    cardHoverGlow: "rgba(236,72,153,0.25)", accentText: "text-white",
    solidBg: "#14040f", solidText: "#fdf2f8", solidBorder: "rgba(236,72,153,0.1)"
  },
  beige: {
    bg: "#1a1208", gradBlob1: "rgba(180,130,60,0.22)", gradBlob2: "rgba(140,95,30,0.15)",
    particleColor: "#d4a94f", ringColor: "rgba(184,133,42,0.65)",
    glowColor: "rgba(200,150,50,0.35)", glowColor2: "rgba(180,130,40,0.18)",
    dotShadow: "0 0 10px rgba(160,100,20,0.6), 0 0 22px rgba(212,169,79,0.4)",
    ringBoxShadow: "0 0 18px rgba(180,120,30,0.35), inset 0 0 8px rgba(212,169,79,0.15)",
    background: "bg-[#1a1208] text-[#f0e6d0]",
    card: "border-[#c8a96a]/20 bg-[#2e2010]/70 text-[#f0e6d0] shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-md",
    subtle: "text-[#c8a96a]", input: "bg-[#241a0a] border-[#8a6a30]/40 placeholder:text-[#c8a96a]/50",
    button: "border border-[#8a6a30]/30 bg-[#2e2010]/60 text-[#f0e6d0] hover:bg-[#3d2c10]/80",
    accent: "from-[#c49a3c] via-[#b8852a] to-[#9e6e1a]",
    activeCalendar: "border-[#b8852a] bg-gradient-to-br from-[#d4aa55] via-[#c49535] to-[#a87820] shadow-[0_0_20px_rgba(180,130,40,0.35)]",
    progress: "from-[#c49a3c] to-[#9e6e1a]", progressStart: "#c49a3c", progressEnd: "#9e6e1a",
    cardHoverGlow: "rgba(196,154,60,0.25)", accentText: "text-[#1a1208]",
    solidBg: "#241a0a", solidText: "#f0e6d0", solidBorder: "rgba(138,106,48,0.4)"
  },
};

const PARTICLES = Array.from({ length: 38 }, () => ({
  left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, size: `${Math.random() * 3 + 1}px`,
  duration: `${Math.random() * 15 + 10}s`, delay: `-${Math.random() * 10}s`,
  opacity: Math.random() * 0.6 + 0.15, glow: Math.random() * 6 + 3,
}));

// ─── Particle ─────────────────────────────────────────────────────────────────
function Particle({ data, color }) {
  return (
    <div className="absolute rounded-full pointer-events-none"
      style={{ left: data.left, top: data.top, width: data.size, height: data.size, opacity: data.opacity, background: color, boxShadow: `0 0 ${data.glow}px ${color}`, animationName: "floatParticle", animationDuration: data.duration, animationDelay: data.delay, animationTimingFunction: "ease-in-out", animationIterationCount: "infinite", animationDirection: "alternate" }}
    />
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────
function ProgressRing({ progress, theme }) {
  const r = 52, circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  const th = themes[theme];
  const gradId = `prog-${theme}`;
  return (
    <div className="relative flex items-center justify-center" style={{ width: 130, height: 130 }}>
      <svg width="130" height="130" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <motion.circle cx="65" cy="65" r={r} fill="none" stroke={`url(#${gradId})`} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} animate={{ strokeDashoffset: offset }} transition={{ type: "spring", stiffness: 60, damping: 14 }} />
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={th.progressStart} />
            <stop offset="100%" stopColor={th.progressEnd} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-black">{progress}%</span>
        <span className={`text-[10px] tracking-widest uppercase ${th.subtle}`}>done</span>
      </div>
    </div>
  );
}

// ─── Magnetic Button ──────────────────────────────────────────────────────────
function MagneticButton({ children, className, onClick, strength = 0.35, title }) {
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
    <motion.button ref={ref} style={{ x, y }} onMouseMove={onMove} onMouseLeave={onLeave} onClick={onClick} className={className} whileTap={{ scale: 0.96 }} title={title}>
      {children}
    </motion.button>
  );
}

// ─── Glow Card ────────────────────────────────────────────────────────────────
function GlowCard({ children, className, glowColor }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className={`relative transition-all duration-300 ${className}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ boxShadow: hovered ? `0 0 0 1px ${glowColor}, 0 0 30px ${glowColor}, 0 20px 60px rgba(0,0,0,0.4)` : undefined }}>
      {hovered && <div className="pointer-events-none absolute inset-0 rounded-[inherit] z-0" style={{ background: `radial-gradient(circle at 50% 0%, ${glowColor} 0%, transparent 70%)` }} />}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ─── Priority Select (portal-based to escape backdrop-blur stacking context) ──
function PrioritySelect({ value, onChange, t }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const selected = PRIORITY_OPTIONS.find(o => o.value === value) || PRIORITY_OPTIONS[1];

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 6, left: rect.left });
    }
    setOpen(o => !o);
  };

  useEffect(() => {
    const handler = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold outline-none cursor-none transition-all duration-200 border ${t.input}`}
      >
        <span className={`w-2.5 h-2.5 rounded-full ${selected.dot} shrink-0`} />
        <span className="whitespace-nowrap">{selected.label}</span>
        <ChevronDown className={`w-3 h-3 opacity-50 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && createPortal(
        <div
          className="fixed z-[999999]"
          style={{ top: coords.top, left: coords.left }}
        >
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`min-w-[160px] rounded-xl border overflow-hidden shadow-2xl ${t.card}`}
            style={{ backdropFilter: "blur(16px)" }}
          >
            {PRIORITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold transition-all duration-150 cursor-none ${opt.value === value ? "bg-white/10" : "hover:bg-white/5"}`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${opt.dot} shrink-0`} />
                <span>{opt.label}</span>
                {opt.value === value && <span className="ml-auto text-[10px] opacity-60">✓</span>}
              </button>
            ))}
          </motion.div>
        </div>,
        document.body
      )}
    </>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialTasks; }
    catch { return initialTasks; }
  });
  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || defaultSettings; }
    catch { return defaultSettings; }
  });

  const [input, setInput]               = useState("");
  const [priority, setPriority]         = useState("medium");
  const [tagInput, setTagInput]         = useState("");
  const [dueTime, setDueTime]           = useState("");
  const [query, setQuery]               = useState("");
  const [filter, setFilter]             = useState("all");
  const [activeTag, setActiveTag]       = useState("all");
  const [theme, setTheme]               = useState("dark");
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [calendarOffset, setCalendarOffset] = useState(0);
  const [audioOn, setAudioOn]           = useState(false);
  const [trackIndex, setTrackIndex]     = useState(0);
  const [isChangingTheme, setIsChangingTheme] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen]   = useState(false);

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    if (audioRef.current) audioRef.current.volume = settings.volume;
  }, [settings]);

  useLayoutEffect(() => {
    const onMove = (e) => {
      cursorTarget.current.x = e.clientX;
      cursorTarget.current.y = e.clientY;
      bgMousePos.current.x = e.clientX / window.innerWidth;
      bgMousePos.current.y = e.clientY / window.innerHeight;
      if (cursorDotRef.current) cursorDotRef.current.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
    };
    window.addEventListener("mousemove", onMove);
    let raf;
    const loop = () => {
      cursorCurrent.current.x += (cursorTarget.current.x - cursorCurrent.current.x) * 0.08;
      cursorCurrent.current.y += (cursorTarget.current.y - cursorCurrent.current.y) * 0.08;
      ringCurrent.current.x   += (cursorCurrent.current.x - ringCurrent.current.x) * 0.12;
      ringCurrent.current.y   += (cursorCurrent.current.y - ringCurrent.current.y) * 0.12;
      if (cursorGlowRef.current) cursorGlowRef.current.style.transform = `translate3d(${cursorCurrent.current.x}px,${cursorCurrent.current.y}px,0)`;
      if (cursorRingRef.current) cursorRingRef.current.style.transform = `translate3d(${ringCurrent.current.x}px,${ringCurrent.current.y}px,0)`;
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
    if (audioOn) { audioRef.current.volume = settings.volume; audioRef.current.play().catch(() => {}); }
    else audioRef.current.pause();
  }, [audioOn, trackIndex, settings.volume]);

  const changeTheme = (next) => {
    if (next === theme) return;
    setIsChangingTheme(true);
    setTimeout(() => { setTheme(next); setIsChangingTheme(false); }, 180);
  };

  const updateSetting = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const filteredTasks = useMemo(() => tasks.filter(task => {
    const matchDate   = task.date === selectedDate;
    const matchQuery  = task.text.toLowerCase().includes(query.toLowerCase()) || (task.tags && task.tags.some(tg => tg.toLowerCase().includes(query.toLowerCase())));
    const matchFilter = filter === "all" || (filter === "active" && !task.completed) || (filter === "done" && task.completed);
    const matchTag    = activeTag === "all" || (task.tags && task.tags.includes(activeTag));
    return matchDate && matchQuery && matchFilter && matchTag;
  }), [tasks, query, filter, selectedDate, activeTag]);

  const currentStreak = useMemo(() => {
    let streakCount = 0;
    let checkDate = new Date();
    const todayIso = getLocalIsoDate(checkDate);
    const todayHasCompleted = tasks.some(tk => tk.date === todayIso && tk.completed);
    if (settings.forgivingStreak && !todayHasCompleted) checkDate.setDate(checkDate.getDate() - 1);
    while (true) {
      const iso = getLocalIsoDate(checkDate);
      if (tasks.some(tk => tk.date === iso && tk.completed)) { streakCount++; checkDate.setDate(checkDate.getDate() - 1); }
      else break;
    }
    return streakCount;
  }, [tasks, settings.forgivingStreak]);

  const uniqueTags = useMemo(() => {
    const tags = new Set();
    tasks.filter(tk => tk.date === selectedDate).forEach(tk => tk.tags?.forEach(tg => tags.add(tg)));
    return Array.from(tags);
  }, [tasks, selectedDate]);

  const completedToday     = filteredTasks.filter(tk => tk.completed).length;
  const progress           = filteredTasks.length ? Math.round((completedToday / filteredTasks.length) * 100) : 0;
  const goalProgressPercent = Math.min(100, (completedToday / settings.dailyGoal) * 100);

  const addTask = () => {
    const text = input.trim();
    if (!text) return;
    const parsedTags = tagInput ? tagInput.split(',').map(tg => tg.trim()).filter(Boolean) : [];
    setTasks(prev => [{ id: uid(), text, completed: false, date: selectedDate, priority, tags: parsedTags, dueTime }, ...prev]);
    setInput(""); setTagInput(""); setDueTime(""); setPriority("medium");
  };

  const toggleTask     = (id) => setTasks(prev => prev.map(tk => tk.id === id ? { ...tk, completed: !tk.completed } : tk));
  const deleteTask     = (id) => setTasks(prev => prev.filter(tk => tk.id !== id));
  const clearCompleted = ()   => setTasks(prev => prev.filter(tk => !tk.completed));

  const calendarDays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 3 + i + calendarOffset); return d;
  }), [calendarOffset]);

  const emptyStateMessage = useMemo(() =>
    EMPTY_MESSAGES[new Date(selectedDate).getDate() % EMPTY_MESSAGES.length],
  [selectedDate]);

  return (
    <>
    <motion.div
      animate={{ filter: isChangingTheme ? "blur(4px)" : "none" }}
      transition={{ duration: isChangingTheme ? 0.18 : 0.32, ease: "easeOut" }}
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
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input[type=range] { -webkit-appearance: none; width: 100%; background: transparent; }
        input[type=range]:focus { outline: none; }
        input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 6px; cursor: pointer; background: rgba(255,255,255,0.1); border-radius: 3px; }
        input[type=range]::-webkit-slider-thumb { height: 18px; width: 18px; border-radius: 50%; background: #ffffff; cursor: pointer; -webkit-appearance: none; margin-top: -6px; box-shadow: 0 0 10px rgba(255,255,255,0.5); }
      `}</style>

      <audio ref={audioRef} src={AUDIO_TRACKS[trackIndex].url} loop />

      <div ref={bgRef} className="pointer-events-none fixed inset-0 z-0 transition-all duration-75" />

      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        {PARTICLES.map((p, i) => <Particle key={i} data={p} color={t.particleColor} />)}
      </div>



      <div className="flex w-full max-w-[1240px] items-stretch gap-8 px-4 py-8">

        {/* ── LEFT COLUMN ── */}
        <div className="flex-1 flex flex-col gap-5">
          <GlowCard glowColor={t.cardHoverGlow} className={`glass-card flex-1 rounded-[1.4rem] border p-5 ${t.card}`}>

            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs">
                  <Sparkles className="h-3.5 w-3.5" /> Welcome back, {settings.userName}.
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
                      <MagneticButton onClick={() => setTrackIndex(i => (i + 1) % AUDIO_TRACKS.length)} className={`rounded-full p-2 transition-all duration-300 ${t.button}`} title="Next Track">
                        <SkipForward className="h-4 w-4" />
                      </MagneticButton>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="w-[1px] h-6 bg-current opacity-20 mx-1" />

                {["dark","pink","beige"].map(th => (
                  <MagneticButton key={th} onClick={() => changeTheme(th)}
                    className={`rounded-full px-4 py-2 text-sm transition-all duration-300 ${theme === th ? `bg-gradient-to-r ${t.accent} ${t.accentText} shadow-lg` : t.button}`}>
                    {th.charAt(0).toUpperCase() + th.slice(1)}
                  </MagneticButton>
                ))}

                <div className="w-[1px] h-6 bg-current opacity-20 mx-1" />

                <MagneticButton onClick={() => setIsSettingsOpen(true)} className={`rounded-full p-2 transition-all duration-300 ${t.button}`}>
                  <Settings className="h-4 w-4" />
                </MagneticButton>
              </div>
            </div>

            {/* Calendar */}
            <div className={`rounded-[1.4rem] border p-4 ${t.card}`}>
              <div className="mb-5 flex items-center justify-between z-50">
                <div>
                  <div className="flex items-center gap-2 text-xl font-semibold"><CalendarDays className="h-5 w-5" /> Orbit calendar</div>
                  <p className={`mt-1 text-sm ${t.subtle}`}>Daily mission queues.</p>
                </div>
                <div className="flex gap-2">
                  <MagneticButton onClick={() => setCalendarOffset(prev => prev - 7)} className={`rounded-xl p-3 ${t.button}`}><ChevronLeft className="h-4 w-4" /></MagneticButton>
                  <MagneticButton onClick={() => setCalendarOffset(prev => prev + 7)} className={`rounded-xl p-3 ${t.button}`}><ChevronRight className="h-4 w-4" /></MagneticButton>
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
                      <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
                      <div className="mt-2 text-3xl font-black">{day.getDate()}</div>
                      <div className="mt-2 flex items-center justify-center gap-1 text-xs">
                        <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${t.progress}`} /> {dayTasks}
                      </div>
                    </MagneticButton>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-5 grid grid-cols-3 gap-4 items-stretch">
              <GlowCard glowColor={t.cardHoverGlow} className={`glass-card rounded-[1.2rem] border p-4 flex flex-col justify-center ${t.card}`}>
                <div className={`text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 mb-3 ${t.subtle}`}><Target className="w-3.5 h-3.5"/> Daily Target</div>
                <div className="text-4xl font-black">{completedToday} <span className="text-xl font-medium opacity-40">/ {settings.dailyGoal}</span></div>
                <div className="w-full bg-black/30 h-1.5 rounded-full mt-4 overflow-hidden relative">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${goalProgressPercent}%` }} className={`absolute left-0 top-0 h-full bg-gradient-to-r ${t.progress}`} />
                </div>
              </GlowCard>

              <GlowCard glowColor={t.cardHoverGlow} className={`glass-card rounded-[1.2rem] border p-4 flex flex-col justify-center ${t.card}`}>
                <div className={`text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 mb-3 ${t.subtle}`}><Flame className="w-3.5 h-3.5 text-orange-400"/> Current Streak</div>
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                  {currentStreak} <span className="text-xl font-medium text-white/40">Days</span>
                </div>
              </GlowCard>

              <div className={`glass-card rounded-[1.2rem] border p-2 flex items-center justify-center ${t.card}`}>
                <ProgressRing progress={progress} theme={theme} />
              </div>
            </div>
          </GlowCard>

          {/* Input card */}
          <GlowCard glowColor={t.cardHoverGlow} className={`glass-card rounded-[1.4rem] border p-5 ${t.card} z-50`}>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Plus className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addTask()}
                  placeholder="Add a new task"
                  className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition-all duration-300 ${t.input} cursor-none`} />
              </div>
              <MagneticButton onClick={addTask} className={`rounded-xl bg-gradient-to-r px-6 py-3 text-sm font-bold transition-all duration-300 ${t.accent} ${t.accentText}`}>
                Add task
              </MagneticButton>
            </div>

            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar items-center">
              {/* ── Custom priority dropdown replacing native <select> ── */}
              <PrioritySelect value={priority} onChange={setPriority} t={t} />

              <div className="relative">
                <Tag className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 opacity-50" />
                <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Tags (e.g. Work, Gym)" className={`rounded-lg py-2 pl-8 pr-3 text-xs font-semibold outline-none w-36 cursor-none ${t.input}`} />
              </div>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 opacity-50" />
                <input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} className={`rounded-lg py-2 pl-8 pr-3 text-xs font-semibold outline-none cursor-none ${t.input}`} />
              </div>
            </div>

            <div className="w-full h-px bg-white/10 my-4" />

            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search missions or tags..." className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition-all duration-300 ${t.input} cursor-none`} />
              </div>
              <div className="flex gap-2">
                {["all","active","done"].map(type => (
                  <MagneticButton key={type} onClick={() => setFilter(type)}
                    className={`rounded-xl px-4 py-3 text-sm transition-all duration-300 ${filter === type ? `bg-gradient-to-r ${t.accent} ${t.accentText}` : t.button}`}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MagneticButton>
                ))}
              </div>
              <MagneticButton onClick={clearCompleted} className={`rounded-xl px-4 py-3 text-sm ${t.button}`}>Clear done</MagneticButton>
            </div>
          </GlowCard>
        </div>

        {/* ── RIGHT COLUMN — Missions ── */}
        <GlowCard glowColor={t.cardHoverGlow} className={`glass-card w-[440px] self-stretch rounded-[1.4rem] border p-6 flex flex-col ${t.card} z-40`}>
          <div className="mb-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-black">Missions</h2>
                <p className={`mt-1 text-sm ${t.subtle}`}>
                  {(() => { const [y, m, d] = selectedDate.split("-"); return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }); })()}
                </p>
              </div>
              <div className={`rounded-full border px-4 py-2 text-sm font-bold ${t.button}`}>
                {filteredTasks.length} Active
              </div>
            </div>

            {uniqueTags.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button onClick={() => setActiveTag('all')} className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${activeTag === 'all' ? 'bg-white text-black border-white' : t.button}`}>All</button>
                {uniqueTags.map(tg => (
                  <button key={tg} onClick={() => setActiveTag(tg)} className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${activeTag === tg ? 'bg-white text-black border-white' : t.button}`}>{tg}</button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1 no-scrollbar pb-10">
            <AnimatePresence mode="popLayout">
              {filteredTasks.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className={`rounded-[1.4rem] border border-dashed p-10 text-center ${t.card}`}>
                  <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.2rem] bg-gradient-to-r ${t.accent}`}>
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-black">{emptyStateMessage}</h3>
                </motion.div>
              ) : (
                filteredTasks.map(task => (
                  <motion.div key={task.id} layout
                    initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 24, scale: 0.95 }}
                    transition={{ duration: 0.28 }}
                    className={`group flex items-start gap-4 rounded-[1.1rem] border p-4 transition-all duration-300 hover:-translate-y-0.5 ${task.completed ? "border-emerald-400/20 bg-emerald-400/5" : t.card}`}
                    style={{ boxShadow: task.completed ? "0 0 20px rgba(52,211,153,0.08)" : undefined }}>

                    <MagneticButton strength={0.4} onClick={() => toggleTask(task.id)}
                      className={`mt-0.5 flex shrink-0 h-7 w-7 items-center justify-center rounded-full border transition-all duration-300 ${task.completed ? "border-emerald-400 bg-emerald-400 text-white shadow-[0_0_15px_rgba(52,211,153,0.4)]" : t.button}`}>
                      <AnimatePresence>
                        {task.completed && (
                          <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                            <Check className="h-4 w-4" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </MagneticButton>

                    <div className="flex-1 min-w-0">
                      <h3 className={`text-base font-semibold leading-tight transition-all duration-300 break-words ${task.completed ? "line-through opacity-50" : ""}`}>
                        {task.text}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {task.priority && (
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${
                            task.priority === 'critical' ? 'border-red-500/40 text-red-400 bg-red-500/10' :
                            task.priority === 'high'     ? 'border-orange-500/40 text-orange-400 bg-orange-500/10' :
                            task.priority === 'medium'   ? 'border-blue-500/40 text-blue-400 bg-blue-500/10' :
                                                           'border-gray-400/40 text-gray-400 bg-gray-400/10'
                          }`}>
                            <AlertCircle className="w-2.5 h-2.5" /> {task.priority}
                          </span>
                        )}
                        {task.tags && task.tags.map(tg => (
                          <span key={tg} className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${t.button}`}>
                            <Tag className="w-2.5 h-2.5" /> {tg}
                          </span>
                        ))}
                        {task.dueTime && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider text-emerald-400 border-emerald-400/30 bg-emerald-400/10">
                            <Clock className="w-2.5 h-2.5" /> {task.dueTime}
                          </span>
                        )}
                      </div>
                    </div>

                    <MagneticButton strength={0.4} onClick={() => deleteTask(task.id)}
                      className={`rounded-xl p-2.5 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 ${t.button}`}>
                      <Trash2 className="h-4 w-4" />
                    </MagneticButton>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </GlowCard>
      </div>

      {/* ── Settings Modal ── */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99990] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`w-full max-w-md rounded-[2rem] border p-8 shadow-2xl relative ${t.card}`}
            >
              <button onClick={() => setIsSettingsOpen(false)} className={`absolute top-6 right-6 p-2 rounded-full border transition-all hover:bg-white/10 ${t.button}`}>
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                <Settings className="w-6 h-6 text-cyan-400" /> System Config
              </h2>
              <div className="space-y-6">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${t.subtle}`}><User className="w-4 h-4"/> Operator Designation</label>
                  <input type="text" value={settings.userName} onChange={e => updateSetting('userName', e.target.value)} className={`w-full rounded-xl border py-3 px-4 outline-none transition-all duration-300 ${t.input} cursor-none`} />
                </div>
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${t.subtle}`}><Target className="w-4 h-4"/> Daily Mission Quota</label>
                  <div className="flex items-center gap-4">
                    <button onClick={() => updateSetting('dailyGoal', Math.max(1, settings.dailyGoal - 1))} className={`w-10 h-10 rounded-full border flex items-center justify-center ${t.button}`}>-</button>
                    <div className="text-3xl font-black w-12 text-center">{settings.dailyGoal}</div>
                    <button onClick={() => updateSetting('dailyGoal', settings.dailyGoal + 1)} className={`w-10 h-10 rounded-full border flex items-center justify-center ${t.button}`}>+</button>
                  </div>
                </div>
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${t.subtle}`}><Sliders className="w-4 h-4"/> Ambient Volume</label>
                  <input type="range" min="0" max="1" step="0.05" value={settings.volume} onChange={e => updateSetting('volume', parseFloat(e.target.value))} className="w-full mt-2 cursor-none" />
                </div>
                <div className={`p-4 rounded-xl border flex items-center justify-between mt-4 ${t.input}`}>
                  <div>
                    <div className="font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400"/> Forgiving Streaks</div>
                    <div className={`text-xs mt-1 max-w-[240px] ${t.subtle}`}>Don't break the streak if today isn't over yet</div>
                  </div>
                  <button onClick={() => updateSetting('forgivingStreak', !settings.forgivingStreak)} className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${settings.forgivingStreak ? 'bg-emerald-500' : 'bg-white/10'}`}>
                    <motion.div layout className="w-6 h-6 bg-white rounded-full shadow-md" animate={{ x: settings.forgivingStreak ? 24 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>

    {/* Cursor rendered in portal — outside motion.div filter stacking context */}
    {createPortal(
      <>
        <div ref={cursorGlowRef}
          className="pointer-events-none fixed left-0 top-0 h-[16rem] w-[16rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
          style={{ zIndex: 2147483647, background: `radial-gradient(circle, ${t.glowColor} 0%, ${t.glowColor2} 38%, transparent 72%)`, mixBlendMode: "screen", filter: "blur(58px)", willChange: "transform" }} />
        <div ref={cursorRingRef}
          className="pointer-events-none fixed left-0 top-0 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ zIndex: 2147483647, border: `1px solid ${t.ringColor}`, boxShadow: t.ringBoxShadow, mixBlendMode: "screen", filter: "blur(1px)", willChange: "transform" }} />
        <div ref={cursorDotRef}
          className="pointer-events-none fixed left-0 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
          style={{ zIndex: 2147483647, mixBlendMode: "screen", boxShadow: t.dotShadow, willChange: "transform" }} />
      </>,
      document.body
    )}
    </>
  );
}