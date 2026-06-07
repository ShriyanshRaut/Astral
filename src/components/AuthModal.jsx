import { useState, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, Sparkles, Loader2 } from "lucide-react";
import { createPortal } from "react-dom";
import { supabase } from "../lib/supabase";

const PARTICLES = Array.from({ length: 24 }, () => ({
  left:     `${Math.random() * 100}%`,
  top:      `${Math.random() * 100}%`,
  size:     `${Math.random() * 3 + 1}px`,
  duration: `${Math.random() * 12 + 8}s`,
  delay:    `-${Math.random() * 8}s`,
  opacity:  Math.random() * 0.5 + 0.15,
  glow:     Math.random() * 5 + 2,
}));

const CURSOR = {
  glowColor:  "rgba(139,92,246,0.25)",
  glowColor2: "rgba(109,40,217,0.12)",
  ringColor:  "rgba(167,139,250,0.7)",
  ringBoxShadow: "0 0 45px rgba(139,92,246,0.55), inset 0 0 12px rgba(109,40,217,0.2)",
  dotShadow: "0 0 20px rgba(255,255,255,0.95), 0 0 40px rgba(139,92,246,0.7), 0 0 70px rgba(109,40,217,0.4)",
};

export function AuthModal() {
  const [loading, setLoading] = useState(null);
  const [error, setError]     = useState(null);

  // Cursor refs
  const cursorGlowRef = useRef(null);
  const cursorRingRef = useRef(null);
  const cursorDotRef  = useRef(null);
  const cursorTarget  = useRef({ x: 0, y: 0 });
  const cursorCurrent = useRef({ x: 0, y: 0 });
  const ringCurrent   = useRef({ x: 0, y: 0 });
  const bgRef         = useRef(null);
  const bgMousePos    = useRef({ x: 0.5, y: 0.5 });

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
        bgRef.current.style.background = `
          radial-gradient(circle at ${mx}% ${my}%, rgba(91,33,182,0.22) 0%, transparent 40%),
          radial-gradient(circle at ${100-mx}% ${100-my}%, rgba(6,182,212,0.14) 0%, transparent 35%)
        `;
      }

      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const signIn = async (provider) => {
    setLoading(provider);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (e) {
      setError(e.message || "Sign-in failed. Try again.");
      setLoading(null);
    }
  };

  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#030712] cursor-none">

        <style>{`
          @keyframes floatParticle {
            0%   { transform: translate(0, 0) scale(1); }
            33%  { transform: translate(12px, -30px) scale(1.2); }
            66%  { transform: translate(-8px, -60px) scale(0.9); }
            100% { transform: translate(4px, -100px) scale(1.1); opacity: 0; }
          }
        `}</style>

        {/* Reactive BG */}
        <div ref={bgRef} className="pointer-events-none absolute inset-0 z-0 transition-all duration-75" />

        {/* Static BG glows */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-violet-600/10 blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-0 w-60 h-60 rounded-full bg-fuchsia-500/10 blur-3xl" />
        </div>

        {/* Particles */}
        <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
          {PARTICLES.map((p, i) => (
            <div key={i} className="absolute rounded-full"
              style={{ left: p.left, top: p.top, width: p.size, height: p.size,
                opacity: p.opacity, background: "#a78bfa",
                boxShadow: `0 0 ${p.glow}px #a78bfa`,
                animationName: "floatParticle", animationDuration: p.duration,
                animationDelay: p.delay, animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite", animationDirection: "alternate" }} />
          ))}
        </div>

        {/* Glass card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-sm mx-4 rounded-[2rem] border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.5)] p-10"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.2rem] bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 shadow-[0_0_40px_rgba(139,92,246,0.5)]">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Astral</h1>
            <p className="mt-2 text-sm text-white/50 text-center">Your cinematic mission-control OS</p>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] uppercase tracking-widest text-white/30">Sign in to sync</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="space-y-3">
            <AuthButton
              label="Continue with Google"
              icon={<GoogleIcon />}
              onClick={() => signIn("google")}
              loading={loading === "google"}
              disabled={!!loading}
            />
            <AuthButton
              label="Continue with GitHub"
              icon={<GitBranch className="h-5 w-5" />}
              onClick={() => signIn("github")}
              loading={loading === "github"}
              disabled={!!loading}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-4 text-center text-xs text-red-400"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <p className="mt-8 text-center text-[10px] text-white/25 leading-relaxed">
            By signing in you agree to nothing sketchy.<br />Your tasks stay yours.
          </p>
        </motion.div>
      </div>

      {/* Cursor — portaled outside to avoid stacking context issues */}
      {createPortal(
        <>
          <div ref={cursorGlowRef}
            className="pointer-events-none fixed left-0 top-0 h-[16rem] w-[16rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
            style={{ zIndex: 2147483647, background: `radial-gradient(circle, ${CURSOR.glowColor} 0%, ${CURSOR.glowColor2} 38%, transparent 72%)`, mixBlendMode: "screen", filter: "blur(58px)", willChange: "transform" }} />
          <div ref={cursorRingRef}
            className="pointer-events-none fixed left-0 top-0 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ zIndex: 2147483647, border: `1px solid ${CURSOR.ringColor}`, boxShadow: CURSOR.ringBoxShadow, mixBlendMode: "screen", filter: "blur(1px)", willChange: "transform" }} />
          <div ref={cursorDotRef}
            className="pointer-events-none fixed left-0 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
            style={{ zIndex: 2147483647, mixBlendMode: "screen", boxShadow: CURSOR.dotShadow, willChange: "transform" }} />
        </>,
        document.body
      )}
    </>
  );
}

function AuthButton({ label, icon, onClick, loading, disabled }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-none"
    >
      {loading
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : <span className="flex h-5 w-5 items-center justify-center">{icon}</span>
      }
      {label}
    </motion.button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}