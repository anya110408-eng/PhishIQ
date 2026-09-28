import React, { useState } from "react";
import {
  Send,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Link as LinkIcon,
  Mail,
  Zap,
  Info,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import { AnalysisResponse } from "../types";
import { generateExecutivePdfReport } from "../utils/pdfGenerator";

interface SandboxViewProps {
  onAnalyze: (payload: { email_body?: string; url?: string; sender_email?: string }) => Promise<AnalysisResponse | null>;
  currentAnalysis: AnalysisResponse | null;
  isLoading: boolean;
}

// Preset samples for fast user testing
const PRESETS = [
  {
    label: "Microsoft Urgent Alert",
    sender: "security-alert@microsoft-verification.net",
    url: "http://microsoft-verification.net/login.php",
    body: "URGENT: Your Microsoft 365 Password Expires in 30 Minutes! Click here to verify credentials and maintain full account access immediately: http://microsoft-verification.net/login.php",
  },
  {
    label: "CFO Executive Wire",
    sender: "cfo-office@paypaI-corporate-sec.com",
    url: "http://paypaI-corporate-sec.com/wire-transfer",
    body: "Confidential wire transfer of $85,000 required before 5 PM today for acquisition closing. Do not discuss this with other staff. Respond with confirmation receipt.",
  },
  {
    label: "HR Payroll Direct Deposit",
    sender: "payroll-updates@hr-internal-portal.org",
    url: "http://hr-internal-portal.org/direct-deposit",
    body: "Notice: Your payroll direct deposit information has been updated. If you did not make this change, log in immediately to reverse unauthorized changes.",
  },
  {
    label: "Package Tracking Scam",
    sender: "support@usps-tracking-redelivery.top",
    url: "http://usps-tracking-redelivery.top/claim",
    body: "USPS Notice: Package delivery failed due to incorrect address. Pay $1.99 redelivery fee within 24 hours to claim your parcel.",
  },
  {
    label: "Safe Weekly Newsletter",
    sender: "digest@github.com",
    url: "https://github.com/explore",
    body: "Here is your weekly summary of trending repositories on GitHub. Explore open source projects and update your star list.",
  },
];

export const SandboxView: React.FC<SandboxViewProps> = ({
  onAnalyze,
  currentAnalysis,
  isLoading,
}) => {
  const [senderEmail, setSenderEmail] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const handleApplyPreset = (preset: (typeof PRESETS)[0]) => {
    setSenderEmail(preset.sender);
    setTargetUrl(preset.url);
    setEmailBody(preset.body);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderEmail && !targetUrl && !emailBody) return;
    await onAnalyze({
      sender_email: senderEmail,
      url: targetUrl,
      email_body: emailBody,
    });
  };

  return (
    <div className="space-y-8">
      {/* Input Form & Preset Bar */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="font-mono-code text-xs text-indigo-600 dark:text-cyan-400 uppercase tracking-widest font-bold flex items-center gap-2">
              <FlaskIcon className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
              Live Phishing & Threat Sandbox
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Submit raw email text or malicious URLs for heuristic and cognitive vulnerability mapping.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono-code text-indigo-600 dark:text-cyan-400 bg-indigo-500/10 dark:bg-cyan-500/10 px-3 py-1 rounded-full border border-indigo-500/20 dark:border-cyan-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI & Rule Engine Active</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="block text-[11px] font-mono-code text-slate-500 dark:text-slate-400 uppercase mb-2">
            Quick Attack Presets:
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="px-3 py-1.5 bg-slate-200/80 dark:bg-white/5 hover:bg-indigo-500/10 dark:hover:bg-cyan-500/10 hover:border-indigo-500/40 dark:hover:border-cyan-500/40 border border-slate-300 dark:border-white/10 rounded-xl text-xs font-mono-code text-slate-800 dark:text-slate-200 transition-all flex items-center gap-1.5"
              >
                <Zap className="w-3 h-3 text-amber-500" />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono-code text-slate-700 dark:text-slate-300 mb-1.5 font-bold">
                Sender Email Address:
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="e.g. security-alert@microsoft-verification.net"
                  className="w-full bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-mono-code text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono-code text-slate-700 dark:text-slate-300 mb-1.5 font-bold">
                Embedded URL / Target Link:
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="e.g. http://microsoft-verification.net/login.php"
                  className="w-full bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-mono-code text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono-code text-slate-700 dark:text-slate-300 mb-1.5 font-bold">
              Raw Email Body Text:
            </label>
            <textarea
              rows={4}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Paste email header, body content, or suspicious notification text..."
              className="w-full bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 rounded-xl p-3 text-xs font-mono-code text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || (!senderEmail && !targetUrl && !emailBody)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white font-bold font-mono-code text-xs uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Heuristic & Cognitive Model...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Run Psychological Threat Analysis
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Results Display */}
      {currentAnalysis && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Hero Banner: Risk Score Dial & Verdict */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
            {/* Risk Gauge Circle */}
            <div className="flex-shrink-0 w-36 h-36 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  fill="none"
                  stroke="currentColor"
                  className="text-slate-300 dark:text-slate-800"
                  strokeWidth="10"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  fill="none"
                  stroke={currentAnalysis.risk_score > 60 ? "#f43f5e" : currentAnalysis.risk_score > 35 ? "#f59e0b" : "#10b981"}
                  strokeWidth="10"
                  strokeDasharray="376.99"
                  strokeDashoffset={376.99 - (376.99 * currentAnalysis.risk_score) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`text-4xl font-black ${
                    currentAnalysis.risk_score > 60
                      ? "text-rose-500"
                      : currentAnalysis.risk_score > 35
                      ? "text-amber-500"
                      : "text-emerald-500"
                  }`}
                >
                  {currentAnalysis.risk_score}
                </span>
                <span className="text-[9px] uppercase font-mono-code font-bold text-slate-400">
                  Risk Score
                </span>
              </div>
            </div>

            {/* Verdict & Hook details */}
            <div className="flex-grow space-y-3 text-center md:text-left">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono-code font-bold uppercase tracking-wider bg-rose-500/10 border border-rose-500/30 text-rose-500">
                  <ShieldAlert className="w-4 h-4" />
                  <span>{currentAnalysis.verdict}</span>
                </div>

                <button
                  onClick={() => generateExecutivePdfReport(currentAnalysis)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono-code text-xs font-bold uppercase transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  title="Download Official PDF Report for this Incident"
                >
                  <FileText className="w-4 h-4" />
                  Download PDF Incident Report
                </button>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Primary Vector:{" "}
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {currentAnalysis.psychological_hook}
                  </span>
                </h3>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {currentAnalysis.layman_explanation}
                </p>
              </div>
            </div>
          </div>

          {/* 2-Column Breakdown: Sender Domain Analysis + Action Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sender Domain Analysis */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-4">
              <h4 className="font-mono-code text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Sender & Domain Forensics
              </h4>

              <div className="space-y-3 font-mono-code text-xs">
                <div className="p-3 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Purported Domain:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {currentAnalysis.sender_analysis.official_domain}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Actual Sender/Host:</span>
                    <span className="text-rose-500 font-bold truncate max-w-[200px]">
                      {currentAnalysis.sender_analysis.fake_domain}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Domain Mismatch:</span>
                    <span
                      className={`font-bold uppercase ${
                        currentAnalysis.sender_analysis.is_mismatch ? "text-rose-500" : "text-emerald-500"
                      }`}
                    >
                      {currentAnalysis.sender_analysis.is_mismatch ? "DETECTED (MISMATCH)" : "MATCHED"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 uppercase mb-2 font-bold">
                    Detected Structural Red Flags:
                  </label>
                  <ul className="space-y-1.5">
                    {currentAnalysis.sender_analysis.risk_reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Recommendations */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-4">
              <h4 className="font-mono-code text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Recommended Response Guidance
              </h4>

              <div className="space-y-4 font-mono-code text-xs">
                {/* Safe Actions */}
                <div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[11px] block mb-2">
                    Safe Navigation Actions (Do's):
                  </span>
                  <ul className="space-y-2">
                    {currentAnalysis.action_recommendations.safe_actions.map((act, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-slate-800 dark:text-slate-200"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dangerous Actions */}
                <div>
                  <span className="text-rose-500 font-bold uppercase text-[11px] block mb-2">
                    High Risk Actions (Don'ts):
                  </span>
                  <ul className="space-y-2">
                    {currentAnalysis.action_recommendations.risky_actions.map((act, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-slate-800 dark:text-slate-200"
                      >
                        <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Cognitive Vector Breakdown Bars */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-4">
            <h4 className="font-mono-code text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold">
              Cognitive Vector Impact Weights
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 font-mono-code text-xs">
              <div>
                <div className="flex justify-between mb-1 text-[11px]">
                  <span className="text-slate-500">Authority Bias</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {currentAnalysis.radar_scores.authority_bias}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${currentAnalysis.radar_scores.authority_bias}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-[11px]">
                  <span className="text-slate-500">Urgency</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {currentAnalysis.radar_scores.manufactured_urgency}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-400"
                    style={{ width: `${currentAnalysis.radar_scores.manufactured_urgency}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-[11px]">
                  <span className="text-slate-500">Scarcity</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {currentAnalysis.radar_scores.scarcity}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${currentAnalysis.radar_scores.scarcity}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-[11px]">
                  <span className="text-slate-500">Social Proof</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {currentAnalysis.radar_scores.social_proof}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-400"
                    style={{ width: `${currentAnalysis.radar_scores.social_proof}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-[11px]">
                  <span className="text-slate-500">Liking / Rapport</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {currentAnalysis.radar_scores.liking_rapport}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400"
                    style={{ width: `${currentAnalysis.radar_scores.liking_rapport}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function FlaskIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M10 2v7.31L4.75 18.1A2 2 0 0 0 6.47 21h11.06a2 2 0 0 0 1.72-2.9L14 9.31V2" />
      <line x1="85%" y1="2" x2="15%" y2="2" />
      <line x1="9" y1="9" x2="15" y2="9" />
    </svg>
  );
}
