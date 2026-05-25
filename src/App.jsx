import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";

const STORAGE_KEY = "flashy-todo-v3";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const todayString = new Date().toISOString().split("T")[0];

const initialTasks = [
  {
    id: uid(),
    text: "Ship the UI polish pass",
    completed: false,
    date: todayString,
  },
  {
    id: uid(),
    text: "Add smooth enter animations",
    completed: true,
    date: todayString,
  },
  {
    id: uid(),
    text: "Review today's priorities",
    completed: false,
    date: todayString,
  },
];

const themes = {
  dark: {
    background:
      "bg-[#030712] bg-[radial-gradient(circle_at_top,_rgba(91,33,182,0.35),_transparent_30%),radial-gradient(circle_at_right,_rgba(6,182,212,0.22),_transparent_26%)] text-white",

    card:
      "border-white/10 bg-white/10 text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl",

    subtle: "text-white/70",

    input:
      "bg-white/5 border-white/10 placeholder:text-white/35",

    button:
      "border border-white/10 bg-white/5 text-white hover:bg-white/10",

    accent:
      "from-cyan-400 via-violet-500 to-fuchsia-500",

    activeCalendar:
      "border-cyan-400/40 bg-gradient-to-br from-cyan-500/30 via-violet-500/30 to-fuchsia-500/30 shadow-[0_0_20px_rgba(34,211,238,0.25)]",

    progress:
      "from-cyan-400 to-fuchsia-500",
  },

  pink: {
    background:
      "bg-[#14040f] bg-[radial-gradient(circle_at_top,_rgba(255,0,128,0.35),_transparent_30%),radial-gradient(circle_at_right,_rgba(236,72,153,0.25),_transparent_28%)] text-pink-50",

    card:
      "border-pink-300/10 bg-pink-200/10 text-pink-50 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl",

    subtle: "text-pink-100/70",

    input:
      "bg-pink-200/10 border-pink-200/10 placeholder:text-pink-100/40",

    button:
      "border border-pink-300/20 bg-pink-200/10 text-pink-50 hover:bg-pink-200/20",

    accent:
      "from-pink-400 via-fuchsia-500 to-rose-500",

    activeCalendar:
      "border-pink-400/40 bg-gradient-to-br from-pink-500/30 via-fuchsia-500/30 to-rose-500/30 shadow-[0_0_20px_rgba(236,72,153,0.25)]",

    progress:
      "from-pink-400 to-rose-500",
  },

  beige: {
    background:
      "bg-[#e8dfd2] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_transparent_35%),radial-gradient(circle_at_right,_rgba(232,210,160,0.35),_transparent_30%)] text-[#3b3026]",

    card:
      "border-[#d6c7b5]/60 bg-[#f5efe6]/85 text-[#3b3026] shadow-[0_20px_50px_rgba(120,90,40,0.08)] backdrop-blur-xl",

    subtle: "text-[#6f6256]",

    input:
      "bg-[#fffaf3] border-[#d9ccb8] placeholder:text-[#9c8d7b]",

    button:
      "border border-[#d6c7b5] bg-[#fff8ef] text-[#3b3026] hover:bg-[#f1e2c7]",

    accent:
      "from-[#f2d28b] via-[#e6c27a] to-[#d4a94f]",

    activeCalendar:
      "border-[#d4a94f] bg-gradient-to-br from-[#f7e7ba] via-[#efd08a] to-[#ddb865] shadow-[0_0_20px_rgba(212,169,79,0.25)]",

    progress:
      "from-[#efd08a] to-[#d4a94f]",
  },
};

export default function FlashyTodoApp() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return initialTasks;

    try {
      return JSON.parse(saved);
    } catch {
      return initialTasks;
    }
  });

  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [theme, setTheme] = useState("dark");
  const [selectedDate, setSelectedDate] = useState(todayString);

  const currentTheme = themes[theme];

  // Cursor refs
  const cursorGlowRef = useRef(null);
  const cursorRingRef = useRef(null);
  const cursorDotRef = useRef(null);
  const cursorTarget = useRef({ x: 0, y: 0 });
  const cursorCurrent = useRef({ x: 0, y: 0 });
  const ringCurrent = useRef({ x: 0, y: 0 });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useLayoutEffect(() => {
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
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesDate = task.date === selectedDate;

      const matchesQuery = task.text
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !task.completed) ||
        (filter === "done" && task.completed);

      return matchesDate && matchesQuery && matchesFilter;
    });
  }, [tasks, query, filter, selectedDate]);

  const progress = filteredTasks.length
    ? Math.round(
        (filteredTasks.filter((t) => t.completed).length /
          filteredTasks.length) *
          100
      )
    : 0;

  const addTask = () => {
    const text = input.trim();

    if (!text) return;

    setTasks((prev) => [
      {
        id: uid(),
        text,
        completed: false,
        date: selectedDate,
      },
      ...prev,
    ]);

    setInput("");
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((task) => !task.completed));
  };

  const calendarDays = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - 3 + index);
    return day;
  });

  return (
    <div
      className={`min-h-screen overflow-hidden transition-all duration-500 cursor-none ${currentTheme.background}`}
    >
      {/* GSAP Cursor: glow blob */}
      <div
        ref={cursorGlowRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70"
        style={{
          background: theme === "beige"
            ? "radial-gradient(circle, rgba(180,120,40,0.28) 0%, rgba(212,169,79,0.18) 38%, rgba(180,120,40,0.04) 72%, transparent 100%)"
            : theme === "pink"
            ? "radial-gradient(circle, rgba(236,72,153,0.45) 0%, rgba(217,70,239,0.25) 38%, rgba(244,114,182,0.04) 72%, transparent 100%)"
            : "radial-gradient(circle, rgba(139,92,246,0.45) 0%, rgba(109,40,217,0.25) 38%, rgba(167,139,250,0.04) 72%, transparent 100%)",
          mixBlendMode: theme === "beige" ? "multiply" : "screen",
          filter: "blur(58px)",
          willChange: "transform",
        }}
      />

      {/* GSAP Cursor: trailing ring */}
      <div
        ref={cursorRingRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          border: theme === "beige"
            ? "1.5px solid rgba(160,100,30,0.55)"
            : theme === "pink"
            ? "1px solid rgba(244,114,182,0.75)"
            : "1px solid rgba(167,139,250,0.7)",
          boxShadow: theme === "beige"
            ? "0 0 18px rgba(180,120,30,0.35), inset 0 0 8px rgba(212,169,79,0.15)"
            : theme === "pink"
            ? "0 0 45px rgba(236,72,153,0.55), inset 0 0 12px rgba(217,70,239,0.2)"
            : "0 0 45px rgba(139,92,246,0.55), inset 0 0 12px rgba(109,40,217,0.2)",
          mixBlendMode: theme === "beige" ? "multiply" : "screen",
          filter: "blur(1px)",
          willChange: "transform",
        }}
      />

      {/* GSAP Cursor: sharp dot */}
      <div
        ref={cursorDotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "white",
          mixBlendMode: theme === "beige" ? "multiply" : "screen",
          boxShadow: theme === "beige"
            ? "0 0 10px rgba(160,100,20,0.6), 0 0 22px rgba(212,169,79,0.4)"
            : theme === "pink"
            ? "0 0 20px rgba(255,255,255,0.95), 0 0 40px rgba(236,72,153,0.7), 0 0 70px rgba(217,70,239,0.4)"
            : "0 0 20px rgba(255,255,255,0.95), 0 0 40px rgba(139,92,246,0.7), 0 0 70px rgba(109,40,217,0.4)",
          willChange: "transform",
        }}
      />

      <div className="mx-auto flex min-h-screen max-w-[1180px] items-stretch gap-8 px-4 py-4 scale-[0.84] origin-top">
        <div className="flex-1 flex flex-col">
          <div
            className={`glass-card flex-1 rounded-[1.4rem] border p-5 ${currentTheme.card}`}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                  Task orbit controller
                </div>

                <h1 className="text-4xl font-black tracking-tight">
                  Flashy Todo App ✨
                </h1>

                <p
                  className={`mt-3 max-w-lg text-base ${currentTheme.subtle}`}
                >
                  Futuristic task management with cinematic gradients and
                  smooth productivity flow.
                </p>
              </div>

              <div className="flex gap-2">
                {["dark", "pink", "beige"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`rounded-full px-4 py-2 text-sm transition-all duration-300 ${
                      theme === t
                        ? `bg-gradient-to-r ${currentTheme.accent} ${
                            theme === "beige"
                              ? "text-[#3b3026]"
                              : "text-white"
                          } shadow-lg`
                        : currentTheme.button
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={`glass-card rounded-[1.4rem] border p-4 ${currentTheme.card}`}
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xl font-semibold">
                    <CalendarDays className="h-5 w-5" />
                    Orbit calendar
                  </div>

                  <p className={`mt-1 text-sm ${currentTheme.subtle}`}>
                    Daily mission queues.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    className={`rounded-xl p-3 ${currentTheme.button}`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    className={`rounded-xl p-3 ${currentTheme.button}`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-3">
                {calendarDays.map((day) => {
                  const iso = day.toISOString().split("T")[0];

                  const isActive = iso === selectedDate;

                  const dayTasks = tasks.filter(
                    (task) => task.date === iso
                  ).length;

                  return (
                    <button
                      key={iso}
                      onClick={() => setSelectedDate(iso)}
                      className={`rounded-[1rem] border p-3 transition-all duration-300 ${
                        isActive
                          ? currentTheme.activeCalendar
                          : currentTheme.button
                      }`}
                    >
                      <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">
                        {day.toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </div>

                      <div className="mt-2 text-3xl font-black">
                        {day.getDate()}
                      </div>

                      <div className="mt-2 flex items-center justify-center gap-1 text-xs">
                        <div
                          className={`h-2 w-2 rounded-full bg-gradient-to-r ${currentTheme.progress}`}
                        />
                        {dayTasks}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-4">
              {[
                {
                  label: "TOTAL TASKS",
                  value: filteredTasks.length,
                },
                {
                  label: "LEFT TO DO",
                  value: filteredTasks.filter((t) => !t.completed)
                    .length,
                },
                {
                  label: "PROGRESS",
                  value: `${progress}%`,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`glass-card rounded-[1.2rem] border p-5 ${currentTheme.card}`}
                >
                  <div
                    className={`text-[11px] tracking-[0.25em] ${currentTheme.subtle}`}
                  >
                    {stat.label}
                  </div>

                  <div className="mt-3 text-4xl font-black">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`mt-5 rounded-[1.2rem] border p-4 ${currentTheme.card}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className={`text-sm ${currentTheme.subtle}`}>
                  Completion ring
                </span>

                <span className="text-sm font-bold">
                  {progress}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-black/10">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${currentTheme.progress}`}
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div
            className={`glass-card mt-5 rounded-[1.4rem] border p-5 ${currentTheme.card}`}
          >
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Plus className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />

                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && addTask()
                  }
                  placeholder="Add a new task"
                  className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none ${currentTheme.input}`}
                />
              </div>

              <button
                onClick={addTask}
                className={`rounded-xl bg-gradient-to-r px-6 py-3 text-sm font-bold transition-all duration-300 ${currentTheme.accent} ${
                  theme === "beige"
                    ? "text-[#3b3026]"
                    : "text-white"
                }`}
              >
                Add task
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tasks"
                  className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none ${currentTheme.input}`}
                />
              </div>

              <div className="flex gap-2">
                {["all", "active", "done"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`rounded-xl px-4 py-3 text-sm transition-all duration-300 ${
                      filter === type
                        ? `bg-gradient-to-r ${currentTheme.accent} ${
                            theme === "beige"
                              ? "text-[#3b3026]"
                              : "text-white"
                          }`
                        : currentTheme.button
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              <button
                onClick={clearCompleted}
                className={`rounded-xl px-4 py-3 text-sm ${currentTheme.button}`}
              >
                Clear done
              </button>
            </div>
          </div>
        </div>

        <div
          className={`glass-card w-[420px] self-stretch rounded-[1.4rem] border p-6 ${currentTheme.card}`}
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black">
                Mission Control
              </h2>

              <p className={`mt-1 text-sm ${currentTheme.subtle}`}>
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div
              className={`rounded-full border px-4 py-2 text-sm ${currentTheme.button}`}
            >
              {
                filteredTasks.filter((t) => t.completed)
                  .length
              }{" "}
              done
            </div>
          </div>

          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div
                className={`rounded-[1.4rem] border border-dashed p-10 text-center ${currentTheme.card}`}
              >
                <div
                  className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.2rem] bg-gradient-to-r ${currentTheme.accent}`}
                >
                  <Sparkles className="h-7 w-7 text-white" />
                </div>

                <h3 className="text-2xl font-black">
                  Mission queue empty
                </h3>

                <p className={`mt-2 text-sm ${currentTheme.subtle}`}>
                  Add a task and begin your orbit.
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                  }}
                  className={`flex items-center gap-3 rounded-[1.1rem] border p-4 transition-all duration-300 ${
                    task.completed
                      ? "border-emerald-400/20 bg-emerald-400/10"
                      : currentTheme.card
                  }`}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${
                      task.completed
                        ? "border-emerald-400 bg-emerald-400 text-white"
                        : currentTheme.button
                    }`}
                  >
                    {task.completed && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>

                  <div className="flex-1 flex flex-col">
                    <h3
                      className={`text-lg font-semibold ${
                        task.completed
                          ? "line-through opacity-50"
                          : ""
                      }`}
                    >
                      {task.text}
                    </h3>

                    <p className={`mt-1 text-xs ${currentTheme.subtle}`}>
                      Tap to toggle completion.
                    </p>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className={`rounded-xl p-3 transition-all duration-300 ${currentTheme.button}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}