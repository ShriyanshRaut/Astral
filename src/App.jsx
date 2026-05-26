import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import {
  CalendarDays, Check, ChevronLeft, ChevronRight,
  Plus, Search, Sparkles, Trash2, Volume2, VolumeX, SkipForward,
  Flame, Target, AlertCircle, Tag, Clock, Settings, X, User, Sliders, ShieldCheck,
  ChevronDown, ImagePlus, Trash, UploadCloud
} from "lucide-react";

const STORAGE_KEY      = "flashy-todo-v4";
const SETTINGS_KEY     = "flashy-settings-v1";
const CUSTOM_THEME_KEY = "flashy-custom-theme-v1";

function uid() { return Math.random().toString(36).slice(2, 10); }
function getLocalIsoDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
const todayString = getLocalIsoDate();


const defaultSettings = { dailyGoal: 5, userName: "Operator", forgivingStreak: true, volume: 0.25 };

const AUDIO_TRACKS = [
  { name: "Lo-Fi Study",   url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3" },
  { name: "Chill Beats",   url: "https://cdn.pixabay.com/audio/2026/03/24/audio_cff6ecc835.mp3" },
  { name: "Night Rain",    url: "https://cdn.pixabay.com/audio/2025/05/31/audio_41498a0307.mp3" },
  { name: "Coffee Shop",   url: "https://cdn.pixabay.com/audio/2022/11/22/audio_febc508520.mp3" },
  { name: "Ambient Space", url: "https://cdn.pixabay.com/audio/2026/03/05/audio_4bcdfdf1cb.mp3" },
];

const EMPTY_MESSAGES = [
  "System idle. Awaiting directives.",
  "The grid is quiet. Add a mission.",
  "No active protocols.",
  "Cyber-deck clear. Ready for input.",
];

const PRIORITY_OPTIONS = [
  { value: "low",      label: "Low Priority",  dot: "bg-gray-400"   },
  { value: "medium",   label: "Med Priority",  dot: "bg-blue-400"   },
  { value: "high",     label: "High Priority", dot: "bg-orange-400" },
  { value: "critical", label: "Critical",      dot: "bg-red-400"    },
];

const themes = {
  dark: {
    bg: "#030712",
    gradBlob1: "rgba(91,33,182,0.18)", gradBlob2: "rgba(6,182,212,0.10)",
    particleColor: "#a78bfa", ringColor: "rgba(167,139,250,0.7)",
    glowColor: "rgba(139,92,246,0.25)", glowColor2: "rgba(109,40,217,0.12)",
    dotShadow: "0 0 20px rgba(255,255,255,0.95),0 0 40px rgba(139,92,246,0.7),0 0 70px rgba(109,40,217,0.4)",
    ringBoxShadow: "0 0 45px rgba(139,92,246,0.55),inset 0 0 12px rgba(109,40,217,0.2)",
    background: "bg-[#030712] text-white",
    card: "border-white/10 bg-white/[0.06] text-white shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-md",
    subtle: "text-white/70", input: "bg-white/5 border-white/10 placeholder:text-white/35",
    button: "border border-white/10 bg-white/5 text-white hover:bg-white/10",
    accent: "from-cyan-400 via-violet-500 to-fuchsia-500",
    activeCalendar: "border-cyan-400/40 bg-gradient-to-br from-cyan-500/30 via-violet-500/30 to-fuchsia-500/30 shadow-[0_0_20px_rgba(34,211,238,0.25)]",
    progress: "from-cyan-400 to-fuchsia-500", progressStart: "#22d3ee", progressEnd: "#d946ef",
    cardHoverGlow: "rgba(139,92,246,0.25)", accentText: "text-white",
    overlayColor: "rgba(3,7,18,0.55)",
    transitionBoxShadow: "0 0 0 1px rgba(139,92,246,0.7),0 0 40px rgba(139,92,246,0.45),0 0 80px rgba(109,40,217,0.25)",
  },
  pink: {
    bg: "#14040f",
    gradBlob1: "rgba(255,0,128,0.18)", gradBlob2: "rgba(236,72,153,0.12)",
    particleColor: "#f472b6", ringColor: "rgba(244,114,182,0.75)",
    glowColor: "rgba(236,72,153,0.25)", glowColor2: "rgba(217,70,239,0.12)",
    dotShadow: "0 0 20px rgba(255,255,255,0.95),0 0 40px rgba(236,72,153,0.7),0 0 70px rgba(217,70,239,0.4)",
    ringBoxShadow: "0 0 45px rgba(236,72,153,0.55),inset 0 0 12px rgba(217,70,239,0.2)",
    background: "bg-[#14040f] text-pink-50",
    card: "border-pink-300/10 bg-pink-200/[0.06] text-pink-50 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-md",
    subtle: "text-pink-100/70", input: "bg-pink-200/10 border-pink-200/10 placeholder:text-pink-100/40",
    button: "border border-pink-300/20 bg-pink-200/10 text-pink-50 hover:bg-pink-200/20",
    accent: "from-pink-400 via-fuchsia-500 to-rose-500",
    activeCalendar: "border-pink-400/40 bg-gradient-to-br from-pink-500/30 via-fuchsia-500/30 to-rose-500/30 shadow-[0_0_20px_rgba(236,72,153,0.25)]",
    progress: "from-pink-400 to-rose-500", progressStart: "#f472b6", progressEnd: "#f43f5e",
    cardHoverGlow: "rgba(236,72,153,0.25)", accentText: "text-white",
    overlayColor: "rgba(20,4,15,0.55)",
    transitionBoxShadow: "0 0 0 1px rgba(236,72,153,0.75),0 0 40px rgba(236,72,153,0.5),0 0 80px rgba(217,70,239,0.3)",
  },
  beige: {
    bg: "#1a1208",
    gradBlob1: "rgba(180,130,60,0.22)", gradBlob2: "rgba(140,95,30,0.15)",
    particleColor: "#d4a94f", ringColor: "rgba(184,133,42,0.65)",
    glowColor: "rgba(200,150,50,0.35)", glowColor2: "rgba(180,130,40,0.18)",
    dotShadow: "0 0 10px rgba(160,100,20,0.6),0 0 22px rgba(212,169,79,0.4)",
    ringBoxShadow: "0 0 18px rgba(180,120,30,0.35),inset 0 0 8px rgba(212,169,79,0.15)",
    background: "bg-[#1a1208] text-[#f0e6d0]",
    card: "border-[#c8a96a]/20 bg-[#2e2010]/70 text-[#f0e6d0] shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-md",
    subtle: "text-[#c8a96a]", input: "bg-[#241a0a] border-[#8a6a30]/40 placeholder:text-[#c8a96a]/50",
    button: "border border-[#8a6a30]/30 bg-[#2e2010]/60 text-[#f0e6d0] hover:bg-[#3d2c10]/80",
    accent: "from-[#c49a3c] via-[#b8852a] to-[#9e6e1a]",
    activeCalendar: "border-[#b8852a] bg-gradient-to-br from-[#d4aa55] via-[#c49535] to-[#a87820] shadow-[0_0_20px_rgba(180,130,40,0.35)]",
    progress: "from-[#c49a3c] to-[#9e6e1a]", progressStart: "#c49a3c", progressEnd: "#9e6e1a",
    cardHoverGlow: "rgba(196,154,60,0.25)", accentText: "text-[#1a1208]",
    overlayColor: "rgba(26,18,8,0.55)",
    transitionBoxShadow: "0 0 0 1px rgba(212,169,79,0.75),0 0 40px rgba(196,154,60,0.55),0 0 80px rgba(180,130,40,0.3)",
  },
};

// Build a theme from extracted palette + wallpaper URL
function buildCustomTheme(imageUrl, palette) {
  const p = palette.primary;
  const s = palette.secondary;
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const hex  = (c) => "#" + c.map(v => v.toString(16).padStart(2,"0")).join("");
  return {
    isCustom: true,
    wallpaperUrl: imageUrl,
    bg: "transparent",
    gradBlob1: rgba(p,0.28), gradBlob2: rgba(s,0.18),
    particleColor: hex(p),
    ringColor: rgba(p,0.75),
    glowColor: rgba(p,0.35), glowColor2: rgba(p,0.15),
    dotShadow: `0 0 20px rgba(255,255,255,0.95),0 0 40px ${rgba(p,0.7)},0 0 70px ${rgba(s,0.4)}`,
    ringBoxShadow: `0 0 45px ${rgba(p,0.55)},inset 0 0 12px ${rgba(s,0.2)}`,
    background: "text-white",
    card: "border-white/15 bg-white/[0.03] text-white shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl",
    subtle: "text-white/65",
    input: "bg-white/[0.08] border-white/15 placeholder:text-white/40 backdrop-blur-xl",
    button: "border border-white/15 bg-white/[0.08] text-white hover:bg-white/[0.18] backdrop-blur-xl",
    accent: "from-white/30 via-white/20 to-white/10",
    accentGradient: `linear-gradient(135deg,${hex(p)},${hex(s)})`,
    activeCalendar: "border-white/40 bg-white/20",
    progress: "from-white/70 to-white/40",
    progressStart: hex(p), progressEnd: hex(s),
    cardHoverGlow: rgba(p,0.35), accentText: "text-white",
    overlayColor: "rgba(0,0,0,0.45)",
    transitionBoxShadow: `0 0 0 1px ${rgba(p,0.75)},0 0 40px ${rgba(p,0.5)},0 0 80px ${rgba(s,0.3)}`,
  };
}

// Canvas-based palette extractor — no npm needed
function extractPalette(imgEl) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 80;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgEl, 0, 0, 80, 80);
    const data = ctx.getImageData(0, 0, 80, 80).data;
    const buckets = {};
    for (let i = 0; i < data.length; i += 16) {
      const r = Math.round(data[i]   / 32) * 32;
      const g = Math.round(data[i+1] / 32) * 32;
      const b = Math.round(data[i+2] / 32) * 32;
      const key = `${r},${g},${b}`;
      buckets[key] = (buckets[key] || 0) + 1;
    }
    const sorted = Object.entries(buckets)
      .sort((a,b) => b[1]-a[1])
      .map(([k]) => k.split(",").map(Number))
      .filter(([r,g,b]) => { const l=0.299*r+0.587*g+0.114*b; return l>30 && l<225; });
    resolve({
      primary:   sorted[0] || [120,80,200],
      secondary: sorted[3] || [60,40,160],
      light:     sorted[6] || [200,160,240],
    });
  });
}

const PARTICLES = Array.from({ length: 38 }, () => ({
  left:`${Math.random()*100}%`, top:`${Math.random()*100}%`,
  size:`${Math.random()*3+1}px`, duration:`${Math.random()*15+10}s`,
  delay:`-${Math.random()*10}s`, opacity:Math.random()*0.6+0.15, glow:Math.random()*6+3,
}));
function Particle({ data, color }) {
  return (
    <div className="absolute rounded-full pointer-events-none"
      style={{ left:data.left, top:data.top, width:data.size, height:data.size,
        opacity:data.opacity, background:color, boxShadow:`0 0 ${data.glow}px ${color}`,
        animationName:"floatParticle", animationDuration:data.duration,
        animationDelay:data.delay, animationTimingFunction:"ease-in-out",
        animationIterationCount:"infinite", animationDirection:"alternate" }} />
  );
}

function ProgressRing({ progress, t }) {
  const r = 52, circ = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center justify-center transition-all duration-500" style={{ width:130, height:130 , borderRadius:"9999px",boxShadow:t.ringBoxShadow,}}>
      <svg width="130" height="130" style={{ transform:"rotate(-90deg)" }}>
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <motion.circle cx="65" cy="65" r={r} fill="none" stroke={`url(#${"progressGradient"})`}
          strokeWidth="8" strokeLinecap="round" strokeDasharray={circ}
          animate={{ strokeDashoffset: circ - (progress/100)*circ }}
          transition={{ type:"spring", stiffness:60, damping:14 }} />
        <defs>
          <linearGradient id={"progressGradient"} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={t.progressStart} />
            <stop offset="100%" stopColor={t.progressEnd}   />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-black leading-none">{progress}%</span>
        <span className={`text-[10px] tracking-widest uppercase ${t.subtle}`}>done</span>
      </div>
    </div>
  );
}

function MagneticButton({ children, className, onClick, strength=0.35, title, style, disabled }) {
  const ref = useRef(null);
  const x = useSpring(0,{stiffness:200,damping:18});
  const y = useSpring(0,{stiffness:200,damping:18});
  const onMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX-rect.left-rect.width/2)*strength);
    y.set((e.clientY-rect.top-rect.height/2)*strength);
  },[x,y,strength]);
  const onLeave = useCallback(()=>{ x.set(0); y.set(0); },[x,y]);
  return (
    <motion.button ref={ref} style={{x,y,...style}} onMouseMove={onMove}
      onMouseLeave={onLeave} onClick={onClick} className={className}
      whileTap={{ scale:0.96 }} title={title} disabled={disabled}>
      {children}
    </motion.button>
  );
}

function GlowCard({ children, className, glowColor, transitionGlow, style }) {
  const [hovered, setHovered] = useState(false);
  const boxShadow = transitionGlow || (hovered
    ? `0 0 0 1px ${glowColor},0 0 30px ${glowColor},0 20px 60px rgba(0,0,0,0.4)`
    : undefined);
  return (
    <div className={`relative transition-all duration-300 ${className}`}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ boxShadow, ...style }}>
      {(hovered || transitionGlow) && (
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] z-0"
          style={{ background:`radial-gradient(circle at 50% 0%,${glowColor} 0%,transparent 70%)` }} />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function PrioritySelect({ value, onChange, t }) {
  const [open, setOpen]     = useState(false);
  const [coords, setCoords] = useState({ top:0, left:0 });
  const btnRef = useRef(null);
  const sel    = PRIORITY_OPTIONS.find(o=>o.value===value) || PRIORITY_OPTIONS[1];
  const handleOpen = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setCoords({ top:r.bottom+6, left:r.left });
    }
    setOpen(o=>!o);
  };
  useEffect(()=>{
    const h=(e)=>{
      const dd=document.getElementById("priority-dropdown");
      if(btnRef.current && !btnRef.current.contains(e.target) && dd && !dd.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click",h);
    return ()=>document.removeEventListener("click",h);
  },[]);
  return (
    <>
      <button ref={btnRef} type="button" onClick={handleOpen}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold outline-none cursor-none transition-all duration-200 border ${t.input}`}>
        <span className={`w-2.5 h-2.5 rounded-full ${sel.dot} shrink-0`} />
        <span className="whitespace-nowrap">{sel.label}</span>
        <ChevronDown className={`w-3 h-3 opacity-50 transition-transform ${open?"rotate-180":""}`} />
      </button>
      {open && createPortal(
        <div className="fixed z-[999999]" style={{ top:coords.top, left:coords.left }}>
          <motion.div id="priority-dropdown"
            initial={{ opacity:0,y:-6,scale:0.97 }} animate={{ opacity:1,y:0,scale:1 }}
            exit={{ opacity:0,y:-6,scale:0.97 }} transition={{ duration:0.15 }}
            className={`min-w-[160px] rounded-xl border overflow-hidden shadow-2xl ${t.card}`}
            style={{ backdropFilter:"blur(16px)" }}>
            {PRIORITY_OPTIONS.map(opt=>(
              <button key={opt.value} type="button" onClick={()=>{ onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold transition-all cursor-none ${opt.value===value?"bg-white/10":"hover:bg-white/5"}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${opt.dot} shrink-0`} />
                <span>{opt.label}</span>
                {opt.value===value && <span className="ml-auto text-[10px] opacity-60">✓</span>}
              </button>
            ))}
          </motion.div>
        </div>, document.body
      )}
    </>
  );
}

// Wallpaper upload modal
function WallpaperModal({ isOpen, onClose, onApply, onClear, hasCustom, t }) {
  const [dragging,    setDragging]    = useState(false);
  const [preview,     setPreview]     = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [palPreview,  setPalPreview]  = useState(null);
  const fileRef = useRef(null);

  const processFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setLoading(true); setPalPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    const img = new Image();
    img.onload = async () => {
      const pal = await extractPalette(img);
      setPalPreview(pal);
      setLoading(false);
    };
    img.src = url;
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleApply = () => {
    if (!preview || !palPreview) return;
    onApply(preview, palPreview);
    onClose();
  };

  if (!isOpen) return null;
  const swatch = (c) => c ? `rgb(${c[0]},${c[1]},${c[2]})` : "#888";

  return createPortal(
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-[99990] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={e=>e.target===e.currentTarget && onClose()}>
      <motion.div initial={{ scale:0.93,opacity:0,y:24 }} animate={{ scale:1,opacity:1,y:0 }}
        exit={{ scale:0.93,opacity:0,y:24 }}
        className={`w-full max-w-lg rounded-[2rem] border p-8 shadow-2xl relative ${t.card}`}>

        <button onClick={onClose}
          className={`absolute top-6 right-6 p-2 rounded-full border transition-all hover:bg-white/10 ${t.button}`}>
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black mb-2 flex items-center gap-3">
          <ImagePlus className="w-6 h-6" /> Custom Wallpaper
        </h2>
        <p className={`text-sm mb-6 ${t.subtle}`}>
          Upload any image — the UI adapts its glow, cursor aura, and accents to match.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={e=>{ e.preventDefault(); setDragging(true); }}
          onDragLeave={()=>setDragging(false)}
          onDrop={handleDrop}
          onClick={()=>fileRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden
            ${dragging ? "border-white/60 scale-[1.02]" : "border-white/20 hover:border-white/40"}
            ${preview ? "h-52" : "h-40 flex items-center justify-center"}`}>
          {preview ? (
            <>
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-bold">Change image</span>
              </div>
            </>
          ) : (
            <div className={`flex flex-col items-center gap-3 ${t.subtle}`}>
              <UploadCloud className="w-10 h-10" />
              <span className="text-sm font-semibold">Drop image here or click to browse</span>
              <span className="text-xs opacity-60">PNG, JPG, WEBP — any wallpaper</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e=>processFile(e.target.files[0])} />

        {/* Palette swatches */}
        <AnimatePresence>
          {palPreview && !loading && (
            <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }}
              className="mt-5 flex items-center gap-3">
              <span className={`text-xs font-bold uppercase tracking-widest ${t.subtle}`}>Extracted palette</span>
              <div className="flex gap-2">
                {[palPreview.primary, palPreview.secondary, palPreview.light].map((c,i)=>(
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-white/20"
                    style={{ background:swatch(c), boxShadow:`0 0 12px ${swatch(c)}` }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className={`mt-4 text-sm ${t.subtle} flex items-center gap-2`}>
            <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity,duration:1,ease:"linear" }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            Extracting palette…
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <MagneticButton onClick={handleApply} disabled={!preview||!palPreview||loading}
            className="flex-1 rounded-xl py-3 text-sm font-bold transition-all duration-300 disabled:opacity-40 text-white"
            style={palPreview ? { background:`linear-gradient(135deg,rgb(${palPreview.primary}),rgb(${palPreview.secondary}))` } : undefined}>
            {loading ? "Extracting…" : "Apply Wallpaper"}
          </MagneticButton>
          {hasCustom && (
            <MagneticButton onClick={()=>{ onClear(); onClose(); }}
              className={`rounded-xl px-4 py-3 text-sm hover:bg-red-500/20 hover:text-red-400 hover:border-red-400/40 ${t.button}`}>
              <Trash className="w-4 h-4" />
            </MagneticButton>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tasks, setTasks] = useState(()=>{ try { return JSON.parse(localStorage.getItem(STORAGE_KEY))||initialTasks; } catch { return initialTasks; } });
  const [settings, setSettings] = useState(()=>{ try { return JSON.parse(localStorage.getItem(SETTINGS_KEY))||defaultSettings; } catch { return defaultSettings; } });
  const [customTheme, setCustomTheme] = useState(()=>{ try { return JSON.parse(localStorage.getItem(CUSTOM_THEME_KEY))||null; } catch { return null; } });

  const [input, setInput]     = useState("");
  const [priority, setPriority] = useState("medium");
  const [tagInput, setTagInput] = useState("");
  const [dueTime, setDueTime]   = useState("");
  const [query, setQuery]       = useState("");
  const [filter, setFilter]     = useState("all");
  const [activeTag, setActiveTag] = useState("all");
  const [theme, setTheme]         = useState("dark");
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [calendarOffset, setCalendarOffset] = useState(0);
  const [audioOn, setAudioOn]   = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isChangingTheme, setIsChangingTheme] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen]   = useState(false);
  const [isWallpaperOpen, setIsWallpaperOpen] = useState(false);
  const [parallax, setParallax] = useState({ x:0, y:0 });

  const outgoingThemeRef = useRef("dark");
  const t = customTheme || themes[theme];

  useEffect(()=>{ localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); },[tasks]);
  useEffect(()=>{ localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); if(audioRef.current) audioRef.current.volume=settings.volume; },[settings]);

  const cursorGlowRef = useRef(null);
  const cursorRingRef = useRef(null);
  const cursorDotRef  = useRef(null);
  const cursorTarget  = useRef({ x:0, y:0 });
  const cursorCurrent = useRef({ x:0, y:0 });
  const ringCurrent   = useRef({ x:0, y:0 });
  const bgRef         = useRef(null);
  const bgMousePos    = useRef({ x:0.5, y:0.5 });
  const audioRef      = useRef(null);

  useLayoutEffect(()=>{
    const onMove=(e)=>{
      cursorTarget.current.x=e.clientX; cursorTarget.current.y=e.clientY;
      bgMousePos.current.x=e.clientX/window.innerWidth;
      bgMousePos.current.y=e.clientY/window.innerHeight;
      if(cursorDotRef.current) cursorDotRef.current.style.transform=`translate3d(${e.clientX}px,${e.clientY}px,0)`;
      setParallax({ x:(e.clientX/window.innerWidth-0.5)*24, y:(e.clientY/window.innerHeight-0.5)*24 });
    };
    window.addEventListener("mousemove",onMove);
    let raf;
    const loop=()=>{
      cursorCurrent.current.x+=(cursorTarget.current.x-cursorCurrent.current.x)*0.08;
      cursorCurrent.current.y+=(cursorTarget.current.y-cursorCurrent.current.y)*0.08;
      ringCurrent.current.x+=(cursorCurrent.current.x-ringCurrent.current.x)*0.12;
      ringCurrent.current.y+=(cursorCurrent.current.y-ringCurrent.current.y)*0.12;
      if(cursorGlowRef.current) cursorGlowRef.current.style.transform=`translate3d(${cursorCurrent.current.x}px,${cursorCurrent.current.y}px,0)`;
      if(cursorRingRef.current) cursorRingRef.current.style.transform=`translate3d(${ringCurrent.current.x}px,${ringCurrent.current.y}px,0)`;
      if(bgRef.current && !customTheme){
        const mx=bgMousePos.current.x*100, my=bgMousePos.current.y*100;
        bgRef.current.style.background=`radial-gradient(circle at ${mx}% ${my}%,${t.gradBlob1} 0%,transparent 38%),radial-gradient(circle at ${100-mx}% ${100-my}%,${t.gradBlob2} 0%,transparent 32%)`;
      }
      raf=requestAnimationFrame(loop);
    };
    loop();
    return ()=>{ window.removeEventListener("mousemove",onMove); cancelAnimationFrame(raf); };
  },[t.gradBlob1,t.gradBlob2,customTheme]);

  useEffect(()=>{
    if(!audioRef.current) return;
    audioRef.current.load();
    if(audioOn){ audioRef.current.volume=settings.volume; audioRef.current.play().catch(()=>{}); }
    else audioRef.current.pause();
  },[audioOn,trackIndex,settings.volume]);

  const changeTheme=(next)=>{
    if(next===theme && !customTheme) return;
    outgoingThemeRef.current=theme;
    setIsChangingTheme(true);
    setTimeout(()=>{
      setTheme(next); setCustomTheme(null); localStorage.removeItem(CUSTOM_THEME_KEY);
      setTimeout(()=>setIsChangingTheme(false),220);
    },80);
  };

  const applyWallpaper=(imageUrl, palette)=>{
    outgoingThemeRef.current=theme;
    setIsChangingTheme(true);
    // Convert blob URL → base64 for persistence
    fetch(imageUrl).then(r=>r.blob()).then(blob=>new Promise(res=>{
      const reader=new FileReader(); reader.onloadend=()=>res(reader.result); reader.readAsDataURL(blob);
    })).then(base64=>{
      const built=buildCustomTheme(base64, palette);
      setCustomTheme(built);
      try { localStorage.setItem(CUSTOM_THEME_KEY, JSON.stringify(built)); } catch(e) {
        // Image too large for localStorage; store without persisting URL
        const slim={ ...built, wallpaperUrl: "" };
        setCustomTheme(slim);
      }
      setTimeout(()=>setIsChangingTheme(false),320);
    });
  };

  const clearWallpaper=()=>{
    setIsChangingTheme(true);
    setCustomTheme(null); localStorage.removeItem(CUSTOM_THEME_KEY);
    setTimeout(()=>setIsChangingTheme(false),220);
  };

  const filteredTasks=useMemo(()=>tasks.filter(task=>{
    return task.date===selectedDate &&
      (task.text.toLowerCase().includes(query.toLowerCase()) || task.tags?.some(tg=>tg.toLowerCase().includes(query.toLowerCase()))) &&
      (filter==="all"||(filter==="active"&&!task.completed)||(filter==="done"&&task.completed)) &&
      (activeTag==="all"||task.tags?.includes(activeTag));
  }),[tasks,query,filter,selectedDate,activeTag]);

  const currentStreak=useMemo(()=>{
    let count=0, d=new Date();
    const tiso=getLocalIsoDate(d);
    if(settings.forgivingStreak && !tasks.some(tk=>tk.date===tiso&&tk.completed)) d.setDate(d.getDate()-1);
    while(true){ const iso=getLocalIsoDate(d); if(tasks.some(tk=>tk.date===iso&&tk.completed)){ count++; d.setDate(d.getDate()-1); } else break; }
    return count;
  },[tasks,settings.forgivingStreak]);

  const uniqueTags=useMemo(()=>{ const s=new Set(); tasks.filter(tk=>tk.date===selectedDate).forEach(tk=>tk.tags?.forEach(tg=>s.add(tg))); return [...s]; },[tasks,selectedDate]);

  const completedToday=filteredTasks.filter(tk=>tk.completed).length;
  const progress=filteredTasks.length?Math.round((completedToday/filteredTasks.length)*100):0;
  const goalPct=Math.min(100,(completedToday/settings.dailyGoal)*100);

  const addTask=()=>{
    const text=input.trim(); if(!text) return;
    const parsedTags=tagInput?tagInput.split(",").map(tg=>tg.trim()).filter(Boolean):[];
    setTasks(prev=>[{ id:uid(), text, completed:false, date:selectedDate, priority, tags:parsedTags, dueTime },...prev]);
    setInput(""); setTagInput(""); setDueTime(""); setPriority("medium");
  };
  const toggleTask=(id)=>setTasks(prev=>prev.map(tk=>tk.id===id?{...tk,completed:!tk.completed}:tk));
  const deleteTask=(id)=>setTasks(prev=>prev.filter(tk=>tk.id!==id));
  const clearCompleted=()=>setTasks(prev=>prev.filter(tk=>!tk.completed));

  const calendarDays=useMemo(()=>Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-3+i+calendarOffset); return d; }),[calendarOffset]);
  const emptyMsg=useMemo(()=>EMPTY_MESSAGES[new Date(selectedDate).getDate()%EMPTY_MESSAGES.length],[selectedDate]);

  const cardTransitionGlow=isChangingTheme?t.transitionBoxShadow:undefined;
  const accentStyle=customTheme?.accentGradient?{ background:customTheme.accentGradient, color:"#fff" }:undefined;

  return (
    <>
      <div className={`app-root min-h-screen overflow-hidden cursor-none flex items-center justify-center ${t.background}`}
        style={{ backgroundColor: customTheme?"transparent":t.bg }}>
        <style>{`
          @keyframes floatParticle {
            0%{transform:translate(0,0) scale(1);} 33%{transform:translate(15px,-35px) scale(1.2);}
            66%{transform:translate(-10px,-65px) scale(0.9);} 100%{transform:translate(5px,-110px) scale(1.1);opacity:0;}
          }
          .no-scrollbar::-webkit-scrollbar{display:none;} .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none;}
          input[type=range]{-webkit-appearance:none;width:100%;background:transparent;}
          input[type=range]::-webkit-slider-runnable-track{height:6px;background:rgba(255,255,255,0.1);border-radius:3px;}
          input[type=range]::-webkit-slider-thumb{height:18px;width:18px;border-radius:50%;background:#fff;-webkit-appearance:none;margin-top:-6px;box-shadow:0 0 10px rgba(255,255,255,0.5);}
        `}</style>

        <audio ref={audioRef} src={AUDIO_TRACKS[trackIndex].url} loop />

        {/* ── Wallpaper layer with parallax depth ── */}
        {customTheme?.wallpaperUrl && (
          <>
            <div className="pointer-events-none fixed z-0"
              style={{
                inset:"-40px",
                backgroundImage:`url(${customTheme.wallpaperUrl})`,
                backgroundSize:"cover", backgroundPosition:"center",
                transform:`translate(${parallax.x}px,${parallax.y}px) scale(1.06)`,
                transition:"transform 0.1s linear",
                willChange:"transform",
              }} />
            {/* Cinematic dark vignette scrim */}
            <div className="pointer-events-none fixed inset-0 z-[1]"
              style={{ background:"radial-gradient(ellipse at center,rgba(0,0,0,0.2) 0%,rgba(0,0,0,0.55) 100%)" }} />
          </>
        )}

        {/* ── Standard gradient bg (non-custom) ── */}
        {!customTheme && <div ref={bgRef} className="pointer-events-none fixed inset-0 z-0" />}

        {/* ── Moving blob overlay in custom mode ── */}
        {customTheme && (
          <motion.div className="pointer-events-none fixed inset-0 z-[2]"
            style={{
              background:`radial-gradient(circle at ${(bgMousePos.current?.x||0.5)*100}% ${(bgMousePos.current?.y||0.5)*100}%,${t.gradBlob1} 0%,transparent 45%)`,
              mixBlendMode:"screen",
            }} />
        )}

        {/* ── Particles ── */}
        <div className="pointer-events-none fixed inset-0 z-[3] overflow-hidden">
          {PARTICLES.map((p,i)=><Particle key={i} data={p} color={t.particleColor} />)}
        </div>

        {/* ── Main layout ── */}
        <div className="flex w-full max-w-[1380px] items-stretch gap-6 px-5 py-5 scale-[0.95] origin-top relative z-10">

          {/* LEFT COLUMN */}
          <div className="flex-1 flex flex-col gap-5">
            <GlowCard glowColor={t.cardHoverGlow} transitionGlow={cardTransitionGlow}
              className={`glass-card flex-1 rounded-[1.4rem] border p-5 ${t.card}`}>

              {/* Header row */}
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs">
                    <Sparkles className="h-3.5 w-3.5" /> Welcome back, {settings.userName}.
                  </div>
                  <h1 className="text-3xl font-black tracking-tight leading-tight">Astral ✨</h1>
                  <p className={`mt-3 text-base whitespace-nowrap ${t.subtitle}`}>
                    {customTheme
                      ? "Your universe. Your wallpaper. Your rules."
                      : "Mission control for focus, flow, and deep work."}
                  </p>
                </div>

                <div className="flex items-center gap-4 z-50">
                  {/* Audio */}
                  <MagneticButton onClick={()=>setAudioOn(a=>!a)} className={`rounded-full p-2 ${t.button}`}>
                    {audioOn?<Volume2 className="h-4 w-4"/>:<VolumeX className="h-4 w-4"/>}
                  </MagneticButton>
                  <AnimatePresence>
                    {audioOn && (
                      <motion.div initial={{ width:0,opacity:0,scale:0.8 }} animate={{ width:"auto",opacity:1,scale:1 }}
                        exit={{ width:0,opacity:0,scale:0.8 }} className="flex items-center gap-2 origin-left overflow-hidden">
                        <div className={`flex items-center justify-center rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${t.button} whitespace-nowrap`}>
                          {AUDIO_TRACKS[trackIndex].name}
                        </div>
                        <MagneticButton onClick={()=>setTrackIndex(i=>(i+1)%AUDIO_TRACKS.length)} className={`rounded-full p-2 ${t.button}`} title="Next Track">
                          <SkipForward className="h-4 w-4"/>
                        </MagneticButton>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="w-px h-6 bg-current opacity-20 mx-1"/>

                  {/* Built-in themes */}
        <div className="flex items-center gap-2 pl-2">
          {["dark","pink","beige"].map(th=>(
            <MagneticButton
              key={th}
              onClick={()=>changeTheme(th)}
              className={`rounded-full px-4 py-2 text-sm transition-all duration-300 ${
                theme===th&&!customTheme
                  ?`bg-gradient-to-r ${t.accent} ${t.accentText} shadow-lg`
                  :t.button
              }`}
            >
              {th.charAt(0).toUpperCase()+th.slice(1)}
            </MagneticButton>
          ))}
        </div>
                  {/* Custom wallpaper button */}
                  <MagneticButton
                    onClick={()=>setIsWallpaperOpen(true)}
                    className={`min-w-[130px] rounded-full px-6 py-2 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                      customTheme
                        ? "border border-white/40 bg-white/15 text-white backdrop-blur-xl"
                        : t.button
                    }`}
                    style={
                      customTheme
                        ? { boxShadow:`0 0 20px ${t.glowColor}` }
                        : undefined
                    }
                  >
                    <ImagePlus className="h-3.5 w-3.5"/>
                    {customTheme ? "Wallpaper ✓" : "Custom"}
                  </MagneticButton>

                  <div className="mx-2 h-8 w-px bg-white/10 shrink-0"/>
                  <MagneticButton onClick={()=>setIsSettingsOpen(true)} className={`rounded-full p-2 ${t.button}`}>
                    <Settings className="h-4 w-4"/>
                  </MagneticButton>
                </div>
              </div>

              {/* Calendar */}
              <div className={`rounded-[1.4rem] border p-4 ${t.card}`}>
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xl font-semibold"><CalendarDays className="h-5 w-5"/> Orbit calendar</div>
                    <p className={`mt-1 text-sm ${t.subtle}`}>Daily mission queues.</p>
                  </div>
                  <div className="flex gap-2">
                    <MagneticButton onClick={()=>setCalendarOffset(p=>p-7)} className={`rounded-xl p-3 ${t.button}`}><ChevronLeft className="h-4 w-4"/></MagneticButton>
                    <MagneticButton onClick={()=>setCalendarOffset(p=>p+7)} className={`rounded-xl p-3 ${t.button}`}><ChevronRight className="h-4 w-4"/></MagneticButton>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map(day=>{
                    const iso=getLocalIsoDate(day);
                    const isActive=iso===selectedDate;
                    const dayTasks=tasks.filter(tk=>tk.date===iso).length;
                    return (
                      <MagneticButton key={iso} onClick={()=>setSelectedDate(iso)} strength={0.2}
                        className={`rounded-[1rem] border p-3 transition-all duration-300 ${isActive?t.activeCalendar:t.button}`}
                        style={isActive&&customTheme?{ background:"rgba(255,255,255,0.2)", borderColor:"rgba(255,255,255,0.5)", boxShadow:`0 0 20px ${t.glowColor}` }:undefined}>
                        <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">{day.toLocaleDateString("en-US",{weekday:"short"})}</div>
                        <div className="mt-2 text-2xl font-black">{day.getDate()}</div>
                        <div className="mt-2 flex items-center justify-center gap-1 text-xs">
                          <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${t.progress}`}/> {dayTasks}
                        </div>
                      </MagneticButton>
                    );
                  })}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-5 grid grid-cols-3 gap-3 items-stretch">
                <GlowCard glowColor={t.cardHoverGlow} transitionGlow={cardTransitionGlow}
                  className={`glass-card rounded-[1.2rem] border p-4 flex flex-col justify-center ${t.card}`}>
                  <div className={`text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 mb-3 ${t.subtle}`}>
                    <Target className="w-3.5 h-3.5"/> Daily Target
                  </div>
                  <div className="text-3xl font-black leading-none">
                    {completedToday} <span className="text-xl font-medium opacity-40">/ {settings.dailyGoal}</span>
                  </div>
                  <div className="w-full bg-black/30 h-1.5 rounded-full mt-4 overflow-hidden relative">
                    <motion.div initial={{ width:0 }} animate={{ width:`${goalPct}%` }}
                      className={`absolute left-0 top-0 h-full bg-gradient-to-r ${t.progress}`}
                      style={customTheme?{ background:customTheme.accentGradient }:undefined}/>
                  </div>
                </GlowCard>
                <GlowCard glowColor={t.cardHoverGlow} transitionGlow={cardTransitionGlow}
                  className={`glass-card rounded-[1.2rem] border p-4 flex flex-col justify-center ${t.card}`}>
                  <div className={`text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 mb-3 ${t.subtle}`}>
                    <Flame className="w-3.5 h-3.5 text-orange-400"/> Current Streak
                  </div>
                  <div className="text-3xl font-black leading-none text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                    {currentStreak} <span className="text-xl font-medium text-white/40">Days</span>
                  </div>
                </GlowCard>
                <div className={`glass-card rounded-[1.2rem] border p-2 flex items-center justify-center overflow-hidden ${t.card}`}>
                  <ProgressRing progress={progress} t={t}/>
                </div>
              </div>
            </GlowCard>

            {/* Add task */}
            <GlowCard glowColor={t.cardHoverGlow} transitionGlow={cardTransitionGlow}
              className={`glass-card rounded-[1.4rem] border p-5 ${t.card} z-50`}>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Plus className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60"/>
                  <input value={input} onChange={e=>setInput(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&addTask()} placeholder="Add a new task"
                    className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition-all ${t.input} cursor-none`}/>
                </div>
                <MagneticButton onClick={addTask}
                  className={`rounded-xl px-6 py-3 text-sm font-bold transition-all ${customTheme?"text-white":"bg-gradient-to-r "+t.accent+" "+t.accentText}`}
                  style={accentStyle}>
                  Add task
                </MagneticButton>
              </div>
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar items-center">
                <PrioritySelect value={priority} onChange={setPriority} t={t}/>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 opacity-50"/>
                  <input type="text" value={tagInput} onChange={e=>setTagInput(e.target.value)}
                    placeholder="Tags (e.g. Work, Gym)"
                    className={`rounded-lg py-2 pl-8 pr-3 text-xs font-semibold outline-none w-36 cursor-none ${t.input}`}/>
                </div>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 opacity-50"/>
                  <input type="time" value={dueTime} onChange={e=>setDueTime(e.target.value)}
                    className={`rounded-lg py-2 pl-8 pr-3 text-xs font-semibold outline-none cursor-none ${t.input}`}/>
                </div>
              </div>
              <div className="w-full h-px bg-white/10 my-4"/>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60"/>
                  <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search missions or tags…"
                    className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition-all ${t.input} cursor-none`}/>
                </div>
                <div className="flex gap-2">
                  {["all","active","done"].map(type=>(
                    <MagneticButton key={type} onClick={()=>setFilter(type)}
                      className={`rounded-xl px-4 py-3 text-sm transition-all ${filter===type?(customTheme?"text-white border border-white/50 bg-white/20":"bg-gradient-to-r "+t.accent+" "+t.accentText):t.button}`}
                      style={filter===type&&accentStyle?accentStyle:undefined}>
                      {type.charAt(0).toUpperCase()+type.slice(1)}
                    </MagneticButton>
                  ))}
                </div>
                <MagneticButton onClick={clearCompleted} className={`rounded-xl px-4 py-3 text-sm ${t.button}`}>Clear done</MagneticButton>
              </div>
            </GlowCard>
          </div>

          {/* RIGHT — Missions */}
          <GlowCard glowColor={t.cardHoverGlow} transitionGlow={cardTransitionGlow}
            className={`glass-card w-full max-w-[480px] min-w-[420px] self-stretch rounded-[1.4rem] border p-5 flex flex-col overflow-hidden ${t.card} z-40`}
            >
            <div className="mb-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-black">Missions</h2>
                  <p className={`mt-1 text-sm ${t.subtle}`}>
                    {(()=>{ const[y,m,d]=selectedDate.split("-"); return new Date(y,m-1,d).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}); })()}
                  </p>
                </div>
                <div className={`rounded-full border px-4 py-2 text-sm font-bold ${t.button}`}>{filteredTasks.length} Active</div>
              </div>
              {uniqueTags.length>0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  <button onClick={()=>setActiveTag("all")} className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${activeTag==="all"?"bg-white text-black border-white":t.button}`}>All</button>
                  {uniqueTags.map(tg=>(
                    <button key={tg} onClick={()=>setActiveTag(tg)} className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${activeTag===tg?"bg-white text-black border-white":t.button}`}>{tg}</button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto overflow-x-hidden pr-1 no-scrollbar pb-10">
              <AnimatePresence mode="popLayout">
                {filteredTasks.length===0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`rounded-[1.8rem] border border-dashed p-10 text-center ${t.card}`}
                  >
                    <div className="flex flex-col items-center justify-center py-8">
    
                      <div
                        className="mb-6 flex h-20 w-20 items-center justify-center rounded-[1.6rem]"
                        style={
                          accentStyle
                            ? {
                                ...accentStyle,
                                borderRadius: "1.6rem",
                                boxShadow: "0 0 35px rgba(255,255,255,0.12)",
                              }
                            : undefined
                          }
                        >
                          {!accentStyle && (
                            <div
                              className={`flex h-20 w-20 items-center justify-center rounded-[1.6rem] bg-gradient-to-r ${t.accent} shadow-[0_0_35px_rgba(168,85,247,0.35)]`}
                            >
                              <Sparkles className="h-9 w-9 text-white" />
                        </div>
                      )}

                      {accentStyle && (
                        <Sparkles className="h-9 w-9 text-white" />
                      )}
                    </div>

                    <h3 className="text-3xl font-black tracking-tight">
                        No active protocols.
                    </h3>

                    <p className={`mt-3 text-sm ${t.subtle}`}>
                      Your mission queue is currently empty.
                    </p>

                    </div>
                  </motion.div>
                ):(
                  filteredTasks.map(task=>(
                    <motion.div key={task.id} layout
                      initial={{ opacity:0,y:12,scale:0.97 }} animate={{ opacity:1,y:0,scale:1 }}
                      exit={{ opacity:0,x:24,scale:0.95 }} transition={{ duration:0.28 }}
                      className={`group flex items-start gap-4 rounded-[1.1rem] border p-4 transition-all hover:-translate-y-0.5 ${task.completed?"border-emerald-400/20 bg-emerald-400/5":t.card}`}>
                      <MagneticButton strength={0.4} onClick={()=>toggleTask(task.id)}
                        className={`mt-0.5 flex shrink-0 h-7 w-7 items-center justify-center rounded-full border transition-all ${task.completed?"border-emerald-400 bg-emerald-400 text-white shadow-[0_0_15px_rgba(52,211,153,0.4)]":t.button}`}>
                        <AnimatePresence>
                          {task.completed && (
                            <motion.span initial={{ scale:0,rotate:-90 }} animate={{ scale:1,rotate:0 }}
                              exit={{ scale:0,rotate:90 }} transition={{ type:"spring",stiffness:300,damping:20 }}>
                              <Check className="h-4 w-4"/>
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </MagneticButton>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-base font-semibold leading-tight break-words ${task.completed?"line-through opacity-50":""}`}>{task.text}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {task.priority && (
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${task.priority==="critical"?"border-red-500/40 text-red-400 bg-red-500/10":task.priority==="high"?"border-orange-500/40 text-orange-400 bg-orange-500/10":task.priority==="medium"?"border-blue-500/40 text-blue-400 bg-blue-500/10":"border-gray-400/40 text-gray-400 bg-gray-400/10"}`}>
                              <AlertCircle className="w-2.5 h-2.5"/> {task.priority}
                            </span>
                          )}
                          {task.tags?.map(tg=>(
                            <span key={tg} className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${t.button}`}>
                              <Tag className="w-2.5 h-2.5"/> {tg}
                            </span>
                          ))}
                          {task.dueTime && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider text-emerald-400 border-emerald-400/30 bg-emerald-400/10">
                              <Clock className="w-2.5 h-2.5"/> {task.dueTime}
                            </span>
                          )}
                        </div>
                      </div>
                      <MagneticButton strength={0.4} onClick={()=>deleteTask(task.id)}
                        className={`rounded-xl p-2.5 transition-all opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 ${t.button}`}>
                        <Trash2 className="h-4 w-4"/>
                      </MagneticButton>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </GlowCard>
        </div>

        {/* Settings modal */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-[99990] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
              <motion.div initial={{ scale:0.95,opacity:0,y:20 }} animate={{ scale:1,opacity:1,y:0 }}
                exit={{ scale:0.95,opacity:0,y:20 }}
                className={`w-full max-w-md rounded-[2rem] border p-8 shadow-2xl relative ${t.card}`}>
                <button onClick={()=>setIsSettingsOpen(false)} className={`absolute top-6 right-6 p-2 rounded-full border ${t.button}`}><X className="w-5 h-5"/></button>
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3"><Settings className="w-6 h-6 text-cyan-400"/> System Config</h2>
                <div className="space-y-6">
                  <div>
                    <label className={`text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${t.subtle}`}><User className="w-4 h-4"/> Operator Designation</label>
                    <input type="text" value={settings.userName} onChange={e=>setSettings(p=>({...p,userName:e.target.value}))}
                      className={`w-full rounded-xl border py-3 px-4 outline-none ${t.input} cursor-none`}/>
                  </div>
                  <div>
                    <label className={`text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${t.subtle}`}><Target className="w-4 h-4"/> Daily Mission Quota</label>
                    <div className="flex items-center gap-4">
                      <button onClick={()=>setSettings(p=>({...p,dailyGoal:Math.max(1,p.dailyGoal-1)}))} className={`w-10 h-10 rounded-full border flex items-center justify-center ${t.button}`}>-</button>
                      <div className="text-3xl font-black w-12 text-center">{settings.dailyGoal}</div>
                      <button onClick={()=>setSettings(p=>({...p,dailyGoal:p.dailyGoal+1}))} className={`w-10 h-10 rounded-full border flex items-center justify-center ${t.button}`}>+</button>
                    </div>
                  </div>
                  <div>
                    <label className={`text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${t.subtle}`}><Sliders className="w-4 h-4"/> Ambient Volume</label>
                    <input type="range" min="0" max="1" step="0.05" value={settings.volume}
                      onChange={e=>setSettings(p=>({...p,volume:parseFloat(e.target.value)}))} className="w-full mt-2 cursor-none"/>
                  </div>
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${t.input}`}>
                    <div>
                      <div className="font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400"/> Forgiving Streaks</div>
                      <div className={`text-xs mt-1 max-w-[240px] ${t.subtle}`}>Don't break the streak if today isn't over yet</div>
                    </div>
                    <button onClick={()=>setSettings(p=>({...p,forgivingStreak:!p.forgivingStreak}))}
                      className={`w-14 h-8 rounded-full p-1 transition-colors ${settings.forgivingStreak?"bg-emerald-500":"bg-white/10"}`}>
                      <motion.div layout className="w-6 h-6 bg-white rounded-full shadow-md"
                        animate={{ x:settings.forgivingStreak?24:0 }} transition={{ type:"spring",stiffness:500,damping:30 }}/>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Wallpaper modal */}
      <AnimatePresence>
        {isWallpaperOpen && (
          <WallpaperModal isOpen={isWallpaperOpen} onClose={()=>setIsWallpaperOpen(false)}
            onApply={applyWallpaper} onClear={clearWallpaper} hasCustom={!!customTheme} t={t}/>
        )}
      </AnimatePresence>

      {/* Portal: theme transition flash + custom cursor */}
      {createPortal(
        <>
          <AnimatePresence>
            {isChangingTheme && (
              <motion.div key="theme-flash"
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                transition={{ duration:0.18 }}
                className="fixed inset-0 pointer-events-none"
                style={{ zIndex:2147483640, background:themes[outgoingThemeRef.current]?.overlayColor||"rgba(0,0,0,0.5)", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)" }}/>
            )}
          </AnimatePresence>
          <div ref={cursorGlowRef}
            className="pointer-events-none fixed left-0 top-0 h-[16rem] w-[16rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
            style={{ zIndex:2147483647, background:`radial-gradient(circle,${t.glowColor} 0%,${t.glowColor2} 38%,transparent 72%)`, mixBlendMode:"screen", filter:"blur(58px)", willChange:"transform" }}/>
          <div ref={cursorRingRef}
            className="pointer-events-none fixed left-0 top-0 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ zIndex:2147483647, border:`1px solid ${t.ringColor}`, boxShadow:t.ringBoxShadow, mixBlendMode:"screen", filter:"blur(1px)", willChange:"transform" }}/>
          <div ref={cursorDotRef}
            className="pointer-events-none fixed left-0 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
            style={{ zIndex:2147483647, mixBlendMode:"screen", boxShadow:t.dotShadow, willChange:"transform" }}/>
        </>,
        document.body
      )}
    </>
  );
}