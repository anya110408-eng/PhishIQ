import React, { useState } from "react";
import { Flame, ShieldAlert, Filter, Info, ArrowUpRight } from "lucide-react";

interface HeatmapCell {
  department: string;
  vector: string;
  riskScore: number; // 0 - 100
  incidentCount: number;
}

const DEPARTMENTS = ["Finance & Legal", "Human Resources", "Executive Leadership", "Engineering", "Sales & Mktg"];
const VECTORS = ["Authority Bias", "Urgency", "Scarcity", "Social Proof", "Liking / Rapport"];

// Matrix dataset mapping department x vector risk
const HEATMAP_DATA: Record<string, Record<string, { risk: number; incidents: number }>> = {
  "Finance & Legal": {
    "Authority Bias": { risk: 92, incidents: 34 },
    "Urgency": { risk: 85, incidents: 28 },
    "Scarcity": { risk: 42, incidents: 11 },
    "Social Proof": { risk: 30, incidents: 6 },
    "Liking / Rapport": { risk: 65, incidents: 19 },
  },
  "Human Resources": {
    "Authority Bias": { risk: 68, incidents: 18 },
    "Urgency": { risk: 88, incidents: 31 },
    "Scarcity": { risk: 75, incidents: 22 },
    "Social Proof": { risk: 50, incidents: 12 },
    "Liking / Rapport": { risk: 80, incidents: 25 },
  },
  "Executive Leadership": {
    "Authority Bias": { risk: 95, incidents: 41 },
    "Urgency": { risk: 70, incidents: 15 },
    "Scarcity": { risk: 35, incidents: 8 },
    "Social Proof": { risk: 60, incidents: 14 },
    "Liking / Rapport": { risk: 78, incidents: 21 },
  },
  "Engineering": {
    "Authority Bias": { risk: 38, incidents: 9 },
    "Urgency": { risk: 45, incidents: 12 },
    "Scarcity": { risk: 28, incidents: 5 },
    "Social Proof": { risk: 62, incidents: 16 },
    "Liking / Rapport": { risk: 32, incidents: 7 },
  },
  "Sales & Mktg": {
    "Authority Bias": { risk: 72, incidents: 23 },
    "Urgency": { risk: 82, incidents: 29 },
    "Scarcity": { risk: 65, incidents: 17 },
    "Social Proof": { risk: 85, incidents: 30 },
    "Liking / Rapport": { risk: 90, incidents: 36 },
  },
};

export const ThreatHeatmap: React.FC = () => {
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d" | "90d">("30d");
  const [selectedCellCoord, setSelectedCellCoord] = useState<{
    dept: string;
    vector: string;
  }>({
    dept: "Finance & Legal",
    vector: "Authority Bias",
  });

  const getCellData = (dept: string, vector: string, tf: "24h" | "7d" | "30d" | "90d") => {
    const base = HEATMAP_DATA[dept]?.[vector] || { risk: 50, incidents: 10 };
    switch (tf) {
      case "24h":
        return {
          risk: Math.min(99, Math.max(10, base.risk + (vector === "Urgency" ? 8 : -5))),
          incidents: Math.max(1, Math.round(base.incidents * 0.08)),
        };
      case "7d":
        return {
          risk: Math.min(99, Math.max(10, base.risk + (vector === "Authority Bias" ? 3 : -2))),
          incidents: Math.max(1, Math.round(base.incidents * 0.28)),
        };
      case "30d":
        return {
          risk: base.risk,
          incidents: base.incidents,
        };
      case "90d":
        return {
          risk: Math.min(99, Math.max(10, base.risk + (vector === "Liking / Rapport" ? 5 : 2))),
          incidents: Math.round(base.incidents * 2.85),
        };
    }
  };

  const currentSelectedData = getCellData(selectedCellCoord.dept, selectedCellCoord.vector, timeframe);

  const getCellColor = (risk: number) => {
    if (risk >= 80) return "bg-rose-500/80 hover:bg-rose-500 text-white shadow-rose-500/20";
    if (risk >= 60) return "bg-amber-500/80 hover:bg-amber-500 text-slate-950 shadow-amber-500/20";
    if (risk >= 40) return "bg-yellow-500/40 hover:bg-yellow-500/60 text-slate-900 dark:text-slate-100";
    return "bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-800 dark:text-cyan-300";
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <h3 className="font-mono-code text-xs text-indigo-600 dark:text-cyan-400 uppercase tracking-widest font-bold">
              Cognitive Threat Heatmap Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Departmental vulnerability intensity mapped across psychological manipulation vectors.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-white/5 rounded-xl border border-slate-300 dark:border-white/10 font-mono-code text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          {(["24h", "7d", "30d", "90d"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 rounded-lg uppercase font-bold transition-all ${
                timeframe === t
                  ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Active Timeframe Indicator Banner */}
      <div className="flex justify-between items-center px-3 py-1.5 bg-indigo-500/10 dark:bg-cyan-500/10 border border-indigo-500/20 dark:border-cyan-500/20 rounded-xl font-mono-code text-[11px] text-indigo-600 dark:text-cyan-400">
        <span className="font-bold uppercase flex items-center gap-1.5">
          <Filter className="w-3 h-3" />
          Active Telemetry Window: {timeframe === "24h" ? "Last 24 Hours" : timeframe === "7d" ? "Last 7 Days" : timeframe === "30d" ? "Last 30 Days" : "Last 90 Days"}
        </span>
        <span className="opacity-80">
          Dataset updated for {timeframe} window
        </span>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Header Row (Vectors) */}
          <div className="grid grid-cols-6 gap-2 mb-2 font-mono-code text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
            <div className="p-2">Department</div>
            {VECTORS.map((vector) => (
              <div key={vector} className="p-2 text-center truncate">
                {vector}
              </div>
            ))}
          </div>

          {/* Rows (Departments) */}
          <div className="space-y-2 font-mono-code text-xs">
            {DEPARTMENTS.map((dept) => (
              <div key={dept} className="grid grid-cols-6 gap-2 items-center">
                <div className="p-2 font-bold text-slate-800 dark:text-slate-200 truncate">
                  {dept}
                </div>
                {VECTORS.map((vector) => {
                  const data = getCellData(dept, vector, timeframe);
                  const isSelected =
                    selectedCellCoord.dept === dept && selectedCellCoord.vector === vector;

                  return (
                    <button
                      key={vector}
                      onClick={() => setSelectedCellCoord({ dept, vector })}
                      className={`h-12 rounded-xl p-2 font-bold transition-all flex flex-col items-center justify-center cursor-pointer shadow-sm relative group ${getCellColor(
                        data.risk
                      )} ${isSelected ? "ring-2 ring-indigo-500 dark:ring-cyan-400 scale-105 z-10" : ""}`}
                    >
                      <span className="text-sm">{data.risk}%</span>
                      <span className="text-[9px] opacity-80 uppercase tracking-tighter">
                        {data.incidents} cases
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend & Detail Drawer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-white/10 font-mono-code text-xs">
        {/* Heatmap Legend */}
        <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-bold uppercase">Risk Scale:</span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-cyan-500/30 border border-cyan-500/50"></span>
            <span>Low (&lt;40%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber-500/80"></span>
            <span>Medium (60-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-rose-500"></span>
            <span>Critical (&ge;80%)</span>
          </div>
        </div>

        {/* Selected Cell Insight */}
        {selectedCellCoord && (
          <div className="p-3 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-bold">
                Cell Insight ({timeframe}): {selectedCellCoord.dept} &bull; {selectedCellCoord.vector}
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                {currentSelectedData.incidents} simulated attacks logged &bull; {currentSelectedData.risk}% failure propensity
              </span>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                currentSelectedData.risk >= 80
                  ? "bg-rose-500/20 text-rose-500 border border-rose-500/30"
                  : currentSelectedData.risk >= 60
                  ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                  : "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30"
              }`}
            >
              {currentSelectedData.risk >= 80 ? "HIGH EXPOSURE" : currentSelectedData.risk >= 60 ? "MODERATE" : "STABLE"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
