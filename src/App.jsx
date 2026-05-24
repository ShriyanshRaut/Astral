import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Circle, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const STORAGE_KEY = "flashy-todo-v1";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const todayString = new Date().toISOString().split("T")[0];

const initialTasks = [
  { id: uid(), text: "Ship the UI polish pass", completed: false, date: todayString },
  { id: uid(), text: "Add smooth enter and exit animations", completed: true, date: todayString },
  { id: uid(), text: "Review today’s priorities", completed: false, date: todayString },
];

const initialSavedTasks = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return initialTasks;

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed.tasks)
      ? parsed.tasks
      : initialTasks;
  } catch {
    return initialTasks;
  }
})();



export default function FlashyTodoApp() {
  const mounted = true;
  const [tasks, setTasks] = useState(initialSavedTasks);
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(todayString);
  const heroRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const cursorGlowRef = useRef(null);
  const cursorRingRef = useRef(null);
  const cursorDotRef = useRef(null);
  const cursorTarget = useRef({ x: 0, y: 0 });
  const cursorCurrent = useRef({ x: 0, y: 0 });
  const ringCurrent = useRef({ x: 0, y: 0 });


  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks }));
  }, [tasks]);

  useLayoutEffect(() => {
    if (!mounted) return;

    const handleMouseMove = (event) => {
      cursorTarget.current.x = event.clientX;
      cursorTarget.current.y = event.clientY;

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationFrame;

    const animateCursor = () => {
      cursorCurrent.current.x += (cursorTarget.current.x - cursorCurrent.current.x) * 0.08;
      cursorCurrent.current.y += (cursorTarget.current.y - cursorCurrent.current.y) * 0.08;

      ringCurrent.current.x += (cursorCurrent.current.x - ringCurrent.current.x) * 0.12;
      ringCurrent.current.y += (cursorCurrent.current.y - ringCurrent.current.y) * 0.12;

      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.transform = `translate3d(${cursorCurrent.current.x}px, ${cursorCurrent.current.y}px, 0)`;
      }

      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate3d(${ringCurrent.current.x}px, ${ringCurrent.current.y}px, 0)`;
      }

      animationFrame = requestAnimationFrame(animateCursor);
    };

    animateCursor();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current,
        { y: 24, opacity: 0, filter: "blur(8px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.9, ease: "power3.out" }
      );

      gsap.fromTo(
        ".glass-card",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "power3.out", delay: 0.15 }
      );
    });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrame);
      ctx.revert();
    };
  }, [tasks.length]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesDate = task.date === selectedDate;
      const matchesQuery = task.text.toLowerCase().includes(query.toLowerCase());
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !task.completed) ||
        (filter === "done" && task.completed);
      return matchesQuery && matchesFilter && matchesDate;
    });
  }, [tasks, query, filter]);

  const remaining = tasks.filter((t) => !t.completed && t.date === selectedDate).length;
  const todaysTasks = tasks.filter((task) => task.date === selectedDate);

  const progress = todaysTasks.length
    ? Math.round((todaysTasks.filter((t) => t.completed).length / todaysTasks.length) * 100)
    : 0;

  const currentDate = new Date(selectedDate);

  const calendarDays = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(currentDate);
    day.setDate(currentDate.getDate() - 3 + index);
    return day;
  });

  const addTask = () => {
    const text = input.trim();
    if (!text) return;
    const newTask = { id: uid(), text, completed: false, date: selectedDate };
    setTasks((prev) => [newTask, ...prev]);
    setInput("");
    requestAnimationFrame(() => inputRef.current?.focus());

    if (listRef.current) {
      gsap.fromTo(
        listRef.current.querySelector(`[data-task-id="${newTask.id}"]`),
        { y: -12, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.7)" }
      );
    }
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  const deleteTask = (id) => {
    const el = listRef.current?.querySelector(`[data-task-id="${id}"]`);
    if (el) {
      gsap.to(el, {
        x: 24,
        opacity: 0,
        scale: 0.95,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => setTasks((prev) => prev.filter((task) => task.id !== id)),
      });
      return;
    }
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const clearCompleted = () => setTasks((prev) => prev.filter((task) => !task.completed));

  const themeClasses =
    "bg-[#030712] bg-[radial-gradient(circle_at_top,_rgba(91,33,182,0.35),_transparent_30%),radial-gradient(circle_at_right,_rgba(6,182,212,0.22),_transparent_26%)] text-white overflow-hidden";

  const cardBase =
    "border-white/10 bg-white/10 text-white shadow-[0_20px_80px_rgba(0,0,0,0.35)]";

  const subtleText = "text-white/70";
  const inputBg = "bg-white/8 border-white/10 placeholder:text-white/35";
  const theme = "dark";

return (
  <div className={`min-h-screen overflow-hidden cursor-none ${themeClasses}`}>
    
    <div
      ref={cursorGlowRef}
      className="pointer-events-none fixed left-0 top-0 z-[1] h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 mix-blend-screen"
      style={{
        background:
          "radial-gradient(circle, rgba(139,92,246,0.34) 0%, rgba(34,211,238,0.18) 38%, rgba(255,255,255,0.02) 72%, transparent 100%)",
        filter: "blur(58px)",
        willChange: "transform",
      }}
    />

    <div
      ref={cursorRingRef}
      className="pointer-events-none fixed left-0 top-0 z-[1] h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-300/60 mix-blend-screen"
      style={{
        boxShadow: "0 0 45px rgba(45, 212, 191, 0.45)",
        filter: "blur(2px)",
        willChange: "transform",
      }}
    />

    <div
      ref={cursorDotRef}
      className="pointer-events-none fixed left-0 top-0 z-[1] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-screen"
      style={{
        boxShadow:
          "0 0 20px rgba(255,255,255,0.95), 0 0 40px rgba(34,211,238,0.55)",
        willChange: "transform",
      }}
    />

    <div className="pointer-events-none absolute inset-0 overflow-hidden">

      <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:80px_80px]" />

      <div className="absolute left-1/2 top-0 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[120px]" />

      <div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="absolute right-[-4rem] top-32 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="absolute bottom-[-5rem] left-10 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />

    </div>

      <main className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          <section ref={heroRef} className="space-y-6">
            <div className={`glass-card ${cardBase} relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.08] p-6 backdrop-blur-2xl before:absolute before:inset-0 before:bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.06),transparent)] before:opacity-40 sm:p-8`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide backdrop-blur-md">
                    <Sparkles className="h-3.5 w-3.5" />
                    Task orbit controller
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Flashy Todo App ✨
                  </h1>
                  <p className={`mt-2 max-w-xl text-sm leading-6 ${subtleText}`}>
                    A neon mission-control dashboard with cinematic glow trails, holographic cards, and orbit-based daily task tracking.
                  </p>
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 shadow-lg shadow-cyan-500/10">
                  Cyber mode engaged
                </div>
              </div>

              <div className="mt-8 rounded-[2rem] border border-white/10 bg-black/20 p-5 shadow-[0_0_60px_rgba(59,130,246,0.12)] backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <CalendarDays className="h-4 w-4" />
                      Orbit calendar
                    </div>
                    <p className={`mt-1 text-xs ${subtleText}`}>
                      Every day gets its own mission queue.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const prev = new Date(selectedDate);
                        prev.setDate(prev.getDate() - 1);
                        setSelectedDate(prev.toISOString().split("T")[0]);
                      }}
                      className="rounded-2xl border border-white/10 bg-white/5 p-2 transition hover:scale-105"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => {
                        const next = new Date(selectedDate);
                        next.setDate(next.getDate() + 1);
                        setSelectedDate(next.toISOString().split("T")[0]);
                      }}
                      className="rounded-2xl border border-white/10 bg-white/5 p-2 transition hover:scale-105"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day) => {
                    const iso = day.toISOString().split("T")[0];
                    const isActive = iso === selectedDate;
                    const dayTasks = tasks.filter((task) => task.date === iso).length;

                    return (
                      <button
                        key={iso}
                        onClick={() => setSelectedDate(iso)}
                        className={`rounded-2xl border p-3 text-center transition-all hover:-translate-y-1 ${
                          isActive
                            ? "border-cyan-400/40 bg-gradient-to-br from-cyan-500/30 via-violet-500/30 to-fuchsia-500/30 shadow-lg shadow-cyan-500/20"
                            : theme === "dark"
                            ? "border-white/10 bg-white/5 hover:bg-white/10"
                            : "border-slate-200 bg-white/60 hover:bg-white"
                        }`}
                      >
                        <p className={`text-[10px] uppercase tracking-[0.2em] ${subtleText}`}>
                          {day.toLocaleDateString("en-US", { weekday: "short" })}
                        </p>
                        <p className="mt-1 text-xl font-bold">
                          {day.getDate()}
                        </p>
                        <div className="mt-2 flex items-center justify-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-cyan-400" />
                          <span className="text-xs font-medium">{dayTasks}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Total tasks", value: tasks.length },
                  { label: "Left to do", value: remaining },
                  { label: "Progress", value: `${progress}%` },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`glass-card rounded-[1.8rem] border border-white/10 bg-white/[0.07] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl`}
                  >
                    <p className={`text-xs uppercase tracking-[0.22em] ${subtleText}`}>{item.label}</p>
                    <p className="mt-3 text-3xl font-bold">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-black/10 p-4 backdrop-blur-md">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className={subtleText}>Completion ring</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500"
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 160, damping: 18 }}
                  />
                </div>
              </div>
            </div>

            <div className={`glass-card ${cardBase} rounded-[2rem] border p-4 backdrop-blur-xl sm:p-5`}>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${inputBg}`}>
                  <Plus className="h-4 w-4 opacity-70" />
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                    placeholder="Add a new task"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
                <button
                  onClick={addTask}
                  className="rounded-2xl bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_40px_rgba(168,85,247,0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_65px_rgba(34,211,238,0.55)] active:translate-y-0"
                >
                  Add task
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${inputBg}`}>
                  <Search className="h-4 w-4 opacity-70" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search tasks"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
                <div className="inline-flex rounded-2xl border p-1">
                  {[
                    ["all", "All"],
                    ["active", "Active"],
                    ["done", "Done"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                        filter === key
                          ? "bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={clearCompleted}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium transition hover:-translate-y-0.5 active:translate-y-0"
                >
                  Clear done
                </button>
              </div>
            </div>
          </section>

          <section className={`glass-card ${cardBase} rounded-[2rem] border p-4 backdrop-blur-xl sm:p-6`}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Mission Control</h2>
                <p className={`mt-1 text-xs ${subtleText}`}>
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className={`mt-1 text-sm ${subtleText}`}>{filteredTasks.length} item(s) visible</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium">
                {tasks.filter((t) => t.completed && t.date === selectedDate).length} done
              </div>
            </div>

            <div ref={listRef} className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-10 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <p className="text-lg font-semibold">Mission queue is empty</p>
                  <p className={`mt-1 text-sm ${subtleText}`}>Add a task or relax for a second. Your list is on standby.</p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    data-task-id={task.id}
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.28 }}
                    className={`group relative overflow-hidden flex items-center gap-4 rounded-[1.8rem] border p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 before:absolute before:inset-0 before:bg-gradient-to-r before:from-cyan-500/[0.03] before:via-violet-500/[0.04] before:to-fuchsia-500/[0.03] before:opacity-0 hover:before:opacity-100 ${
                      task.completed
                        ? "border-emerald-400/20 bg-emerald-400/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="shrink-0 transition-transform hover:scale-110 active:scale-95"
                      aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                    >
                      {task.completed ? (
                        <Check className="h-6 w-6 text-emerald-400" />
                      ) : (
                        <Circle className={`h-6 w-6 ${subtleText}`} />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className={`text-[15px] font-medium ${task.completed ? "opacity-60 line-through" : ""}`}>
                        {task.text}
                      </p>
                      <p className={`mt-1 text-xs ${subtleText}`}>
                        Tap the circle to toggle completion.
                      </p>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="rounded-2xl bg-white/5 p-3 text-white/70 transition hover:scale-105 hover:bg-red-500/20 hover:text-white active:scale-95"
                      aria-label="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
