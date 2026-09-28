import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { TrendingUp, ShieldCheck, Filter } from "lucide-react";

interface ResilienceDataPoint {
  day: string;
  date: string;
  score: number;
  simulations: number;
  failures: number;
}

// Generate 90 days of realistic trend data ending today
const generate90DayData = (): ResilienceDataPoint[] => {
  const data: ResilienceDataPoint[] = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 89);

  let score = 54; // start 90 days ago

  for (let i = 0; i < 90; i++) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(baseDate.getDate() + i);
    const dateStr = currentDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const delta = Math.floor(Math.sin(i / 4) * 2) + (i % 5 === 0 ? 1 : 0) + (i > 40 ? 1 : 0);
    score = Math.min(95, Math.max(45, score + delta));

    const simulations = Math.floor(Math.random() * 8) + 10;
    const failures = Math.max(1, Math.floor(simulations * ((100 - score) / 100) * 0.8));

    data.push({
      day: `Day ${i + 1}`,
      date: dateStr,
      score,
      simulations,
      failures,
    });
  }

  // Ensure current day matches expected score
  data[data.length - 1].score = 75;

  return data;
};

const full90DayData = generate90DayData();

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data: ResilienceDataPoint = payload[0].payload;
    return (
      <div className="bg-slate-900/95 border border-indigo-500/30 dark:border-cyan-500/30 rounded-xl p-3 shadow-xl backdrop-blur-md font-mono-code text-xs text-slate-100">
        <p className="font-bold text-indigo-400 dark:text-cyan-400 border-b border-white/10 pb-1 mb-2">
          {data.date} ({data.day})
        </p>
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Resilience Score:</span>
            <span className="font-bold text-indigo-400 dark:text-cyan-400">{data.score}/100</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Simulations Run:</span>
            <span className="font-bold text-slate-200">{data.simulations}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Failure Rate:</span>
            <span className="font-bold text-rose-400">
              {Math.round((data.failures / data.simulations) * 100)}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const ResilienceTrendChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("30d");

  const trendData =
    timeframe === "7d"
      ? full90DayData.slice(-7)
      : timeframe === "30d"
      ? full90DayData.slice(-30)
      : full90DayData;

  const currentScore = trendData[trendData.length - 1].score;
  const initialScore = trendData[0].score;
  const scoreDiff = currentScore - initialScore;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
            <h3 className="font-mono-code text-xs text-indigo-600 dark:text-cyan-400 uppercase tracking-widest font-bold">
              {timeframe === "7d" ? "7-Day" : timeframe === "30d" ? "30-Day" : "90-Day"} Resilience Score Trajectory
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time tracking of organizational security posture and human error defense index over time.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono-code text-xs">
          {/* Timeframe Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-white/5 rounded-xl border border-slate-300 dark:border-white/10 font-mono-code text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {(["7d", "30d", "90d"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-2.5 py-1 rounded-lg uppercase font-bold transition-all ${
                  timeframe === t
                    ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-cyan-500/10 border border-indigo-500/30 dark:border-cyan-500/30 text-indigo-600 dark:text-cyan-400 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{scoreDiff >= 0 ? `+${scoreDiff}` : scoreDiff} pts ({timeframe})</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="resilienceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" vertical={false} />

            <XAxis
              dataKey="date"
              tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "JetBrains Mono" }}
              axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
              tickLine={false}
              interval={timeframe === "7d" ? 0 : timeframe === "30d" ? 4 : 12}
            />

            <YAxis
              domain={[40, 100]}
              tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "JetBrains Mono" }}
              axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
              tickLine={false}
              ticks={[40, 60, 80, 100]}
            />

            <Tooltip content={<CustomTooltip />} />

            <ReferenceLine
              y={80}
              stroke="#6366F1"
              strokeDasharray="4 4"
              label={{
                value: "Security Benchmark (80)",
                fill: "#6366F1",
                fontSize: 10,
                position: "insideTopRight",
              }}
            />

            <Area
              type="monotone"
              dataKey="score"
              stroke="#6366F1"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#resilienceGrad)"
              activeDot={{ r: 6, fill: "#38BDF8", stroke: "#0F172A", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono-code text-xs pt-2 border-t border-slate-200 dark:border-white/10">
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
          <span className="text-[10px] text-slate-500 uppercase block">Window Start Benchmark</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">{initialScore} / 100</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
          <span className="text-[10px] text-slate-500 uppercase block">Current Posture</span>
          <span className="font-bold text-indigo-600 dark:text-cyan-400">{currentScore} / 100</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
          <span className="text-[10px] text-slate-500 uppercase block">{timeframe} Net Progress</span>
          <span className="font-bold text-indigo-600 dark:text-cyan-400">
            {scoreDiff >= 0 ? `+${scoreDiff}%` : `${scoreDiff}%`} Improvement
          </span>
        </div>
      </div>
    </div>
  );
};
