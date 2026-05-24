import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Trash2,
  Check,
  Circle,
} from "lucide-react";

const STORAGE_KEY = "flashy-todo-v2";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const todayString = new Date().toISOString().split("T")[0];

export default function App() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayString);

  const glowRef = useRef(null);
  const ringRef = useRef(null);
  const dotRef = useRef(null);

  const cursor = useRef({ x: 0, y: 0 });
  const glow = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });

  const initialSavedTasks = (() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    return saved ? JSON.parse(saved) : [];
  })();

  const [tasks, setTasks] = useState(initialSavedTasks);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const move = (e) => {
      cursor.current.x = e.clientX;
      cursor.current.y = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    window.addEventListener("mousemove", move);

    let frame;

    const animate = () => {
      glow.current.x +=
        (cursor.current.x - glow.current.x) * 0.08;

      glow.current.y +=
        (cursor.current.y - glow.current.y) * 0.08;

      ring.current.x +=
        (glow.current.x - ring.current.x) * 0.12;

      ring.current.y +=
        (glow.current.y - ring.current.y) * 0.12;

      if (glowRef.current) {
        glowRef.current.style.transform =
          `translate(${glow.current.x}px, ${glow.current.y}px)`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate(${ring.current.x}px, ${ring.current.y}px)`;
      }

      frame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(frame);
    };
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      return (
        task.date === selectedDate &&
        task.text.toLowerCase().includes(query.toLowerCase())
      );
    });
  }, [tasks, query, selectedDate]);

  const addTask = () => {
    if (!input.trim()) return;

    setTasks([
      {
        id: uid(),
        text: input,
        completed: false,
        date: selectedDate,
      },
      ...tasks,
    ]);

    setInput("");
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const currentDate = new Date(selectedDate);

  const calendarDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentDate);

    d.setDate(currentDate.getDate() - 3 + i);

    return d;
  });

  return (
    <div className="min-h-screen overflow-hidden bg-[#050816] text-white cursor-none">

      {/* CURSOR */}

      <div
        ref={glowRef}
        className="pointer-events-none fixed top-0 left-0 z-50 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.34) 0%, rgba(34,211,238,0.18) 40%, transparent 70%)",
          filter: "blur(58px)",
        }}
      />

      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-50 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/60 mix-blend-screen"
        style={{
          boxShadow: "0 0 45px rgba(34,211,238,0.45)",
        }}
      />

      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-50 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
      />

      {/* MAIN */}

      <main className="mx-auto max-w-6xl p-6">

        <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

          <div className="flex items-center justify-between">

            <div>
              <h1 className="text-5xl font-bold">
                Flashy Todo App ✨
              </h1>

              <p className="mt-3 text-white/70">
                Your cyberpunk task dashboard.
              </p>
            </div>

            <div className="rounded-2xl bg-cyan-400/10 px-4 py-2 text-cyan-300">
              Dark mode engaged
            </div>
          </div>

          {/* CALENDAR */}

          <div className="mt-8">

            <div className="mb-4 flex items-center justify-between">

              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                <span>Orbit Calendar</span>
              </div>

              <div className="flex gap-2">

                <button
                  onClick={() => {
                    const d = new Date(selectedDate);
                    d.setDate(d.getDate() - 1);

                    setSelectedDate(
                      d.toISOString().split("T")[0]
                    );
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 p-2"
                >
                  <ChevronLeft />
                </button>

                <button
                  onClick={() => {
                    const d = new Date(selectedDate);
                    d.setDate(d.getDate() + 1);

                    setSelectedDate(
                      d.toISOString().split("T")[0]
                    );
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 p-2"
                >
                  <ChevronRight />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">

              {calendarDays.map((day) => {
                const iso =
                  day.toISOString().split("T")[0];

                const active =
                  iso === selectedDate;

                return (
                  <button
                    key={iso}
                    onClick={() =>
                      setSelectedDate(iso)
                    }
                    className={`rounded-2xl border p-3 transition ${
                      active
                        ? "border-cyan-400 bg-cyan-400/20"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <p className="text-xs text-white/60">
                      {day.toLocaleDateString(
                        "en-US",
                        { weekday: "short" }
                      )}
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      {day.getDate()}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* INPUT */}

        <div className="mb-6 flex gap-3">

          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <Search className="h-4 w-4 text-white/50" />

            <input
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              placeholder="Search tasks"
              className="w-full bg-transparent outline-none"
            />
          </div>

          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <Plus className="h-4 w-4 text-white/50" />

            <input
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              onKeyDown={(e) =>
                e.key === "Enter" && addTask()
              }
              placeholder="Add task"
              className="w-full bg-transparent outline-none"
            />
          </div>

          <button
            onClick={addTask}
            className="rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 px-6 font-semibold"
          >
            Add
          </button>
        </div>

        {/* TASKS */}

        <div className="space-y-3">

          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-4 rounded-3xl border p-4 ${
                task.completed
                  ? "border-emerald-400/20 bg-emerald-400/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <button
                onClick={() =>
                  toggleTask(task.id)
                }
              >
                {task.completed ? (
                  <Check className="text-emerald-400" />
                ) : (
                  <Circle className="text-white/50" />
                )}
              </button>

              <div className="flex-1">
                <p
                  className={
                    task.completed
                      ? "line-through opacity-60"
                      : ""
                  }
                >
                  {task.text}
                </p>
              </div>

              <button
                onClick={() =>
                  deleteTask(task.id)
                }
              >
                <Trash2 className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}