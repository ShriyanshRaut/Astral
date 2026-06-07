import { motion, AnimatePresence } from "framer-motion";
import { Cloud, CloudLightning, WifiOff, HardDrive } from "lucide-react";
import { useStore } from "../store/useStore";

const STATUS_CONFIG = {
  synced:  { icon: Cloud,          label: "Synced",   color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  syncing: { icon: CloudLightning, label: "Syncing",  color: "text-cyan-400",    bg: "bg-cyan-400/10 border-cyan-400/20"       },
  offline: { icon: WifiOff,        label: "Offline",  color: "text-red-400",     bg: "bg-red-400/10 border-red-400/20"         },
  local:   { icon: HardDrive,      label: "Local",    color: "text-white/40",    bg: "bg-white/5 border-white/10"              },
};

export function SyncIndicator() {
  const syncStatus = useStore((s) => s.syncStatus);
  const cfg = STATUS_CONFIG[syncStatus] || STATUS_CONFIG.local;
  const Icon = cfg.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={syncStatus}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${cfg.color} ${cfg.bg}`}
      >
        <Icon className={`h-3 w-3 ${syncStatus === "syncing" ? "animate-pulse" : ""}`} />
        {cfg.label}
      </motion.div>
    </AnimatePresence>
  );
}