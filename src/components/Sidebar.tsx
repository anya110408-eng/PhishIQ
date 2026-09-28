import React from "react";
import {
  LayoutDashboard,
  FlaskConical,
  Brain,
  History,
  Settings,
  PlusCircle,
  Sun,
  Moon,
  ShieldCheck,
  Bot,
  User,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewAnalysis: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onNewAnalysis,
  isDark,
  toggleTheme,
}) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "sandbox", label: "Sandbox", icon: FlaskConical },
    { id: "vulnerability", label: "Vulnerability Profile", icon: Brain },
    { id: "copilot", label: "AI Copilot & Sims", icon: Bot },
    { id: "history", label: "History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] glass-panel border-r border-white/10 dark:border-white/10 flex flex-col py-6 px-4 z-40 transition-colors">
      {/* Brand Header */}
      <div className="mb-8 px-2 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-cyan-400" />
            <h1 className="font-extrabold text-2xl tracking-tighter text-indigo-600 dark:text-cyan-400">
              PHISHIQ
            </h1>
          </div>
          <p className="font-mono-code text-[10px] text-slate-500 dark:text-slate-400 tracking-[0.2em] uppercase mt-0.5">
            ACTIVE MONITORING
          </p>
        </div>

        {/* Theme switch in sidebar header */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
          className="p-1.5 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:opacity-80 transition-all"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-grow space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-mono-code text-xs tracking-wider transition-all ${
                isActive
                  ? "text-indigo-600 dark:text-cyan-400 font-bold bg-indigo-500/10 dark:bg-cyan-500/10 border-r-2 border-indigo-600 dark:border-cyan-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/5"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600 dark:text-cyan-400" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom CTA & Profile */}
      <div className="mt-auto px-1 pt-4 border-t border-slate-200 dark:border-white/10 space-y-4">
        <button
          onClick={onNewAnalysis}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white font-bold rounded-xl transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 text-xs font-mono-code uppercase tracking-wider"
        >
          <PlusCircle className="w-4 h-4" />
          New Analysis
        </button>

        {/* Analysts Section */}
        <div className="space-y-2">
          <p className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            SOC Lead Analysts
          </p>
          <div className="grid grid-cols-1 gap-2">
            {/* Analyst 1: Anya */}
            <div className="flex items-center gap-2.5 p-2 bg-slate-200/60 dark:bg-white/5 rounded-xl border border-slate-300/40 dark:border-white/10 hover:border-cyan-500/30 transition-all">
              <div className="w-7 h-7 rounded-full border border-cyan-500/40 flex-shrink-0 bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold text-xs font-mono-code">
                A
              </div>
              <div className="overflow-hidden">
                <p className="font-mono-code text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  Anya
                </p>
                <p className="text-[9px] text-cyan-600 dark:text-cyan-400 font-mono-code uppercase tracking-wider font-semibold truncate">
                  Lead Threat Analyst
                </p>
              </div>
            </div>

            {/* Analyst 2: Kush */}
            <div className="flex items-center gap-2.5 p-2 bg-slate-200/60 dark:bg-white/5 rounded-xl border border-slate-300/40 dark:border-white/10 hover:border-indigo-500/30 transition-all">
              <div className="w-7 h-7 rounded-full border border-indigo-500/40 flex-shrink-0 bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs font-mono-code">
                K
              </div>
              <div className="overflow-hidden">
                <p className="font-mono-code text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  Kush
                </p>
                <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-mono-code uppercase tracking-wider font-semibold truncate">
                  SOC Security Engineer
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
