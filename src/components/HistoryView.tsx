import React, { useState } from "react";
import { History, Search, Trash2, Eye, ShieldAlert, ShieldCheck, ArrowRight } from "lucide-react";
import { AnalysisResponse } from "../types";

interface HistoryViewProps {
  history: AnalysisResponse[];
  onDeleteHistoryItem: (id: string) => void;
  onSelectForInspection: (item: AnalysisResponse) => void;
  searchFilter: string;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onDeleteHistoryItem,
  onSelectForInspection,
  searchFilter,
}) => {
  const [selectedItem, setSelectedItem] = useState<AnalysisResponse | null>(null);

  const filteredHistory = (history || []).filter((item) => {
    const preview = item.input_preview || {};
    const query = (searchFilter || "").toLowerCase();
    
    return (
      (preview.sender_email || "").toLowerCase().includes(query) ||
      (preview.url || "").toLowerCase().includes(query) ||
      (item.psychological_hook || "").toLowerCase().includes(query) ||
      (item.verdict || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h3 className="font-mono-code text-xs text-indigo-600 dark:text-cyan-400 uppercase tracking-widest font-bold flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
            Historical Threat Submissions & Scans ({filteredHistory.length})
          </h3>
          <span className="text-xs font-mono-code text-slate-500">
            Real-time Threat Intelligence Archive
          </span>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-mono-code text-xs">
            No threat scans recorded yet. Go to Sandbox to run your first analysis.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-code text-xs">
              <thead className="bg-slate-200/60 dark:bg-white/5 text-[10px] uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-3 font-bold">Timestamp</th>
                  <th className="p-3 font-bold">Risk Score</th>
                  <th className="p-3 font-bold">Sender / Target Link</th>
                  <th className="p-3 font-bold">Psychological Hook</th>
                  <th className="p-3 font-bold">Verdict</th>
                  <th className="p-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {filteredHistory.map((item) => {
                  const isHighRisk = item.risk_score >= 60;
                  return (
                    <tr key={item.id} className="hover:bg-slate-200/40 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="p-3 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] ${
                            isHighRisk ? "bg-rose-500/20 text-rose-500" : "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400"
                          }`}
                        >
                          {item.risk_score}/100
                        </span>
                      </td>
                      <td className="p-3 max-w-[220px] truncate font-mono-code text-slate-800 dark:text-slate-200">
                        {item.input_preview.sender_email || item.input_preview.url || "Raw text input"}
                      </td>
                      <td className="p-3 font-bold text-indigo-600 dark:text-cyan-400">
                        {item.psychological_hook}
                      </td>
                      <td className="p-3 truncate max-w-[180px] font-bold">
                        <span className={isHighRisk ? "text-rose-500" : "text-cyan-600 dark:text-cyan-400"}>
                          {item.verdict}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            onSelectForInspection(item);
                          }}
                          className="p-1.5 rounded bg-slate-200 dark:bg-white/10 hover:text-indigo-600 dark:hover:text-cyan-400 text-slate-700 dark:text-slate-300"
                          title="View Full Breakdown"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteHistoryItem(item.id)}
                          className="p-1.5 rounded bg-slate-200 dark:bg-white/10 hover:text-rose-500 text-slate-700 dark:text-slate-300"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Inspection Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-3xl w-full text-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono-code text-slate-400 uppercase">
                  Scan ID: {selectedItem.id}
                </span>
                <h3 className="text-lg font-bold text-emerald-400 font-mono-code">
                  {selectedItem.verdict}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white font-mono-code"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono-code text-xs">
              <div className="grid grid-cols-2 gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <span className="text-slate-400 block text-[10px]">RISK SCORE</span>
                  <span className="text-xl font-bold text-rose-400">{selectedItem.risk_score} / 100</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">PRIMARY HOOK</span>
                  <span className="text-xl font-bold text-emerald-400">{selectedItem.psychological_hook}</span>
                </div>
              </div>

              <div>
                <strong className="text-slate-300 block mb-1">Psychological Analysis:</strong>
                <p className="p-3 bg-white/5 rounded-xl text-slate-300 leading-relaxed">
                  {selectedItem.layman_explanation}
                </p>
              </div>

              <div>
                <strong className="text-slate-300 block mb-1">Sender & Domain Analysis:</strong>
                <div className="p-3 bg-white/5 rounded-xl space-y-1">
                  <p>Official Domain: <span className="text-emerald-400 font-bold">{selectedItem.sender_analysis.official_domain}</span></p>
                  <p>Actual Sender Host: <span className="text-rose-400 font-bold">{selectedItem.sender_analysis.fake_domain}</span></p>
                </div>
              </div>

              <div>
                <strong className="text-slate-300 block mb-1">Safe Action Recommendations:</strong>
                <ul className="list-disc pl-5 space-y-1 text-emerald-300">
                  {selectedItem.action_recommendations.safe_actions.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-mono-code text-xs font-bold rounded-xl"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
