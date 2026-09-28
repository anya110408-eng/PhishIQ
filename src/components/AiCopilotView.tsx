import React, { useState } from "react";
import { Sparkles, Bot, Send, Zap, ShieldAlert, RefreshCw, Copy, Check, FileText } from "lucide-react";
import { AnalysisResponse } from "../types";

interface AiCopilotViewProps {
  currentAnalysis: AnalysisResponse | null;
}

export const AiCopilotView: React.FC<AiCopilotViewProps> = ({ currentAnalysis }) => {
  const [activeSubTab, setActiveSubTab] = useState<"copilot" | "simulation">("copilot");

  // Chat State
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string; time: string }>>([
    {
      sender: "ai",
      text: "Hello Analyst. I am your PhishIQ AI SOC Copilot. Ask me to analyze threat vectors, draft employee security advisories, or explain psychological hooks.",
      time: "Just now",
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoadingCopilot, setIsLoadingCopilot] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Simulation Generator State
  const [dept, setDept] = useState("Finance & Operations");
  const [trigger, setTrigger] = useState("Authority Bias");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [isGeneratingSim, setIsGeneratingSim] = useState(false);
  const [simResult, setSimResult] = useState<{
    subject: string;
    sender: string;
    body: string;
    key_traps: string[];
    mitigation_tip: string;
  } | null>(null);

  const handleSendCopilot = async (promptToSend?: string) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim() || isLoadingCopilot) return;

    const userMsg = { sender: "user" as const, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, userMsg]);
    if (!promptToSend) setInputPrompt("");
    setIsLoadingCopilot(true);

    try {
      const res = await fetch("/api/ai-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          context: currentAnalysis ? {
            risk_score: currentAnalysis.risk_score,
            verdict: currentAnalysis.verdict,
            hook: currentAnalysis.psychological_hook,
            flags: currentAnalysis.detected_flags,
          } : {},
        }),
      });

      if (!res.ok) throw new Error("Failed to reach AI Copilot");
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.reply || "Analysis completed.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I am operating in resilient offline mode. Ensure GEMINI_API_KEY is configured in Settings > Secrets for real-time generative intelligence.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoadingCopilot(false);
    }
  };

  const handleGenerateSimulation = async () => {
    setIsGeneratingSim(true);
    try {
      const res = await fetch("/api/ai-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department: dept, trigger, difficulty }),
      });

      if (!res.ok) throw new Error("Failed to generate simulation");
      const data = await res.json();
      setSimResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingSim(false);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* View Switcher Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSubTab("copilot")}
            className={`px-4 py-2 rounded-xl text-xs font-mono-code font-bold uppercase transition-all flex items-center gap-2 ${
              activeSubTab === "copilot"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                : "bg-slate-200/80 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/10"
            }`}
          >
            <Bot className="w-4 h-4" />
            AI SOC Security Copilot
          </button>
          <button
            onClick={() => setActiveSubTab("simulation")}
            className={`px-4 py-2 rounded-xl text-xs font-mono-code font-bold uppercase transition-all flex items-center gap-2 ${
              activeSubTab === "simulation"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                : "bg-slate-200/80 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/10"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            AI Phishing Simulation Generator
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono-code text-indigo-600 dark:text-cyan-400 bg-indigo-500/10 dark:bg-cyan-500/10 px-3 py-1 rounded-full border border-indigo-500/20 dark:border-cyan-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini 3.6 Flash Engine Active</span>
        </div>
      </div>

      {/* Subtab 1: AI SOC Copilot Chat */}
      {activeSubTab === "copilot" && (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10 flex flex-col h-[580px]">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
                <div>
                  <h3 className="font-mono-code text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">
                    AI Threat Analyst Dialogue
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Real-time generative intelligence for incident triage
                  </p>
                </div>
              </div>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "ai" && (
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 dark:bg-cyan-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-cyan-400">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl p-4 text-xs font-mono-code space-y-1 relative group ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-bl-none"
                    }`}
                  >
                    <div className="flex justify-between items-center gap-4 text-[10px] opacity-75 pb-1">
                      <span className="font-bold uppercase">
                        {msg.sender === "user" ? "Security Analyst" : "PhishIQ AI"}
                      </span>
                      <span>{msg.time}</span>
                    </div>

                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                    {msg.sender === "ai" && (
                      <button
                        onClick={() => copyToClipboard(msg.text, idx)}
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-all"
                        title="Copy response"
                      >
                        {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                  {msg.sender === "user" && (
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs">
                      YOU
                    </div>
                  )}
                </div>
              ))}

              {isLoadingCopilot && (
                <div className="flex items-center gap-3 text-xs font-mono-code text-indigo-600 dark:text-cyan-400 animate-pulse py-2">
                  <Bot className="w-4 h-4 animate-spin" />
                  <span>Gemini Copilot is reasoning...</span>
                </div>
              )}
            </div>

            {/* Input Box */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendCopilot()}
                  placeholder="Ask Gemini to draft an advisory, explain DMARC, or analyze a threat vector..."
                  className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono-code text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400"
                />
                <button
                  onClick={() => handleSendCopilot()}
                  disabled={isLoadingCopilot || !inputPrompt.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs font-mono-code uppercase transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Quick Prompt Cards Side Panel */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-white/10 space-y-3">
              <h4 className="font-mono-code text-xs font-bold text-indigo-600 dark:text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Quick AI Prompt Presets
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any prompt to instantly query Gemini AI SOC analyst:
              </p>

              <div className="space-y-2 pt-1">
                {[
                  "Draft an emergency employee advisory email for executive spoofing.",
                  "Explain how homoglyph domain attacks bypass traditional secure email gateways.",
                  "What are the step-by-step SOC incident response actions for credential harvesting?",
                  "How do attackers manipulate Authority Bias to bypass approval channels?",
                  "Explain SPF, DKIM, and DMARC verification best practices.",
                ].map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendCopilot(promptText)}
                    className="w-full text-left p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 dark:hover:border-cyan-500/40 text-xs font-mono-code text-slate-800 dark:text-slate-200 transition-all hover:bg-indigo-500/10 flex items-start gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <span>{promptText}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: AI Phishing Simulation Generator */}
      {activeSubTab === "simulation" && (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-5">
            <div>
              <h3 className="font-mono-code text-xs text-indigo-600 dark:text-cyan-400 uppercase tracking-widest font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Configure AI Phishing Scenario
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Generate tailored simulation emails using Gemini to test specific departments against psychological triggers.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono-code text-slate-700 dark:text-slate-300 uppercase mb-1 font-bold">
                  Target Department
                </label>
                <select
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono-code text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Finance & Operations">Finance & Operations</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Engineering & IT">Engineering & IT</option>
                  <option value="Sales & Marketing">Sales & Marketing</option>
                  <option value="Executive Suite">Executive Suite</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono-code text-slate-700 dark:text-slate-300 uppercase mb-1 font-bold">
                  Psychological Trigger Vector
                </label>
                <select
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono-code text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Authority Bias">Authority Bias</option>
                  <option value="Manufactured Urgency">Manufactured Urgency</option>
                  <option value="Scarcity / FOMO">Scarcity / FOMO</option>
                  <option value="Liking & Rapport">Liking & Rapport</option>
                  <option value="Social Proof">Social Proof</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono-code text-slate-700 dark:text-slate-300 uppercase mb-1 font-bold">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono-code text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Beginner">Beginner (Obvious typos, raw IP links)</option>
                  <option value="Intermediate">Intermediate (Lookalike domain, executive tone)</option>
                  <option value="Advanced SPEARPHISH">Advanced SPEARPHISH (Zero typos, contextual hook)</option>
                </select>
              </div>

              <button
                onClick={handleGenerateSimulation}
                disabled={isGeneratingSim}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs font-mono-code uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                {isGeneratingSim ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating Scenario...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Generate AI Simulation with Gemini
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result Display Box */}
          <div className="col-span-12 lg:col-span-7 glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-3">
              <h3 className="font-mono-code text-xs text-indigo-600 dark:text-cyan-400 uppercase tracking-widest font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                Generated Simulation Preview
              </h3>
              {simResult && (
                <span className="text-[11px] font-mono-code font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-cyan-400">
                  Target: {dept}
                </span>
              )}
            </div>

            {simResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-900 text-slate-100 rounded-xl border border-white/10 font-mono-code space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 uppercase font-bold">Sender: </span>
                    <span className="text-amber-400">{simResult.sender}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase font-bold">Subject: </span>
                    <span className="font-bold text-slate-100">{simResult.subject}</span>
                  </div>
                  <hr className="border-white/10 my-2" />
                  <p className="whitespace-pre-wrap leading-relaxed text-slate-300">{simResult.body}</p>
                </div>

                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2 font-mono-code text-xs">
                  <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                    Identified Cognitive Traps ({simResult.key_traps.length}):
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                    {simResult.key_traps.map((trap, idx) => (
                      <li key={idx}>{trap}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl font-mono-code text-xs space-y-1">
                  <span className="font-bold text-indigo-600 dark:text-cyan-400 uppercase tracking-wider block">
                    Recommended Security Coaching Tip:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">{simResult.mitigation_tip}</p>
                </div>
              </div>
            ) : (
              <div className="h-[320px] flex flex-col items-center justify-center text-center p-6 text-slate-400 font-mono-code space-y-3 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl">
                <Bot className="w-10 h-10 text-slate-400 animate-pulse" />
                <p className="text-xs">No scenario generated yet.</p>
                <p className="text-[11px] text-slate-500 max-w-sm">
                  Select a target department and psychological vector on the left, then click "Generate AI Simulation" to create custom training scenarios.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
