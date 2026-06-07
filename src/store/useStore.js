import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../lib/supabase";

// ─── helpers ──────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 10); }

function getLocalIsoDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const todayString = getLocalIsoDate();

const initialTasks = [
  { id: uid(), text: "Ship the UI polish pass",    completed: false, date: todayString, priority: "high",     tags: ["Development"], dueTime: "14:00" },
  { id: uid(), text: "Add smooth enter animations", completed: true,  date: todayString, priority: "medium",   tags: ["Design"],      dueTime: "16:30" },
  { id: uid(), text: "Review today's priorities",   completed: false, date: todayString, priority: "critical", tags: ["Planning"],    dueTime: "09:00" },
];

// ─── Zustand store ────────────────────────────────────────────────────────────
export const useStore = create(
  persist(
    (set, get) => ({

      // ── Auth ────────────────────────────────────────────────────────────────
      user: null,
      setUser: (user) => set({ user }),

      // ── Tasks ───────────────────────────────────────────────────────────────
      tasks: initialTasks,
      setTasks: (tasks) => set({ tasks }),

      addTask: (taskData) => {
        const task = {
          id: uid(),
          completed: false,
          date: todayString,
          priority: "medium",
          tags: [],
          dueTime: "",
          ...taskData,
        };
        set((s) => ({ tasks: [task, ...s.tasks] }));
        return task;
      },

      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t
          ),
        })),

      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      clearCompleted: () =>
        set((s) => ({ tasks: s.tasks.filter((t) => !t.completed) })),

      // ── Sync Status ─────────────────────────────────────────────────────────
      // "synced" | "syncing" | "offline" | "local"
      syncStatus: "local",
      setSyncStatus: (syncStatus) => set({ syncStatus }),

      // ── Settings ────────────────────────────────────────────────────────────
      settings: {
        dailyGoal: 5,
        userName: "Operator",
        forgivingStreak: true,
        volume: 0.25,
      },
      updateSetting: (key, value) =>
        set((s) => ({ settings: { ...s.settings, [key]: value } })),

      // ── UI State ────────────────────────────────────────────────────────────
      theme: "dark",
      setTheme: (theme) => set({ theme }),

      selectedDate: todayString,
      setSelectedDate: (selectedDate) => set({ selectedDate }),

      calendarOffset: 0,
      setCalendarOffset: (calendarOffset) => set({ calendarOffset }),

      filter: "all",
      setFilter: (filter) => set({ filter }),

      activeTag: "all",
      setActiveTag: (activeTag) => set({ activeTag }),

      query: "",
      setQuery: (query) => set({ query }),

      // ── Cloud Sync ──────────────────────────────────────────────────────────
      // Called once on login to migrate local tasks to cloud if cloud is empty
      migrateLocalTasksToCloud: async () => {
        const { user, tasks } = get();
        if (!user) return;

        const { data: cloudTasks, error } = await supabase
          .from("tasks")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);

        if (error || (cloudTasks && cloudTasks.length > 0)) return;

        // Cloud is empty — upload local tasks
        const toUpload = tasks.map((t) => ({
          id: t.id,
          user_id: user.id,
          text: t.text,
          completed: t.completed,
          date: t.date,
          priority: t.priority || "medium",
          tags: t.tags || [],
          due_time: t.dueTime || null,
        }));

        if (toUpload.length > 0) {
          await supabase.from("tasks").upsert(toUpload);
        }
      },

      // Fetch cloud tasks and merge into local state
      fetchCloudTasks: async () => {
        const { user, setSyncStatus } = get();
        if (!user) return;

        setSyncStatus("syncing");
        try {
          const { data, error } = await supabase
            .from("tasks")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (error) throw error;

          const mapped = data.map((t) => ({
            id: t.id,
            text: t.text,
            completed: t.completed,
            date: t.date,
            priority: t.priority,
            tags: t.tags || [],
            dueTime: t.due_time || "",
          }));

          set({ tasks: mapped });
          setSyncStatus("synced");
        } catch {
          setSyncStatus("offline");
        }
      },

      // Push a single task mutation to Supabase
      pushTask: async (task, action = "upsert") => {
        const { user, setSyncStatus } = get();
        if (!user) return;

        setSyncStatus("syncing");
        try {
          if (action === "delete") {
            await supabase.from("tasks").delete().eq("id", task.id).eq("user_id", user.id);
          } else {
            await supabase.from("tasks").upsert({
              id: task.id,
              user_id: user.id,
              text: task.text,
              completed: task.completed,
              date: task.date,
              priority: task.priority || "medium",
              tags: task.tags || [],
              due_time: task.dueTime || null,
            });
          }
          setSyncStatus("synced");
        } catch {
          setSyncStatus("offline");
        }
      },
    }),

    {
      name: "astral-store-v1",
      // Only persist these keys to localStorage
      partialize: (s) => ({
        tasks: s.tasks,
        settings: s.settings,
        theme: s.theme,
        selectedDate: s.selectedDate,
      }),
    }
  )
);