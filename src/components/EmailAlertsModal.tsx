import React, { useState } from "react";
import { Mail, Bell, Send, CheckCircle2, ShieldAlert, Sliders, X } from "lucide-react";

interface EmailAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailAlertsModal: React.FC<EmailAlertsModalProps> = ({ isOpen, onClose }) => {
  const [recipients, setRecipients] = useState("security-alerts@enterprise.org, ciso@enterprise.org");
  const [riskThreshold, setRiskThreshold] = useState(70);
  const [instantAlerts, setInstantAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState("https://hooks.slack.com/services/T00/B00/XXXX");
  const [testSent, setTestSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSendTestAlert = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-xl w-full text-slate-100 shadow-2xl relative space-y-6 font-mono-code text-xs">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400 animate-bounce" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              PhishIQ Automated Email & SOC Alert Rules
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Controls */}
        <div className="space-y-4">
          {/* Recipient Emails */}
          <div>
            <label className="block text-[11px] text-slate-400 uppercase font-bold mb-1.5">
              Alert Recipient Email Addresses (Comma Separated):
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Trigger Threshold */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-200 text-[11px] uppercase flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Instant Alert Risk Score Trigger ({riskThreshold}%)
              </span>
              <span className="text-amber-400 font-bold">{riskThreshold >= 75 ? "HIGH CRITICAL" : "MEDIUM"}</span>
            </div>
            <input
              type="range"
              min="50"
              max="90"
              value={riskThreshold}
              onChange={(e) => setRiskThreshold(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              Triggers an automated high-severity email alert whenever sandbox analysis exceeds this risk score.
            </p>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-3">
            <label className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between cursor-pointer hover:border-cyan-500/30 transition-all">
              <div>
                <span className="font-bold block text-slate-200">Instant Critical Email</span>
                <span className="text-[10px] text-slate-400">Real-time alerts</span>
              </div>
              <input
                type="checkbox"
                checked={instantAlerts}
                onChange={(e) => setInstantAlerts(e.target.checked)}
                className="accent-indigo-500 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between cursor-pointer hover:border-cyan-500/30 transition-all">
              <div>
                <span className="font-bold block text-slate-200">Weekly Threat Digest</span>
                <span className="text-[10px] text-slate-400">Executive summary</span>
              </div>
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={(e) => setWeeklyDigest(e.target.checked)}
                className="accent-indigo-500 w-4 h-4 cursor-pointer"
              />
            </label>
          </div>

          {/* Webhook Endpoint */}
          <div>
            <label className="block text-[11px] text-slate-400 uppercase font-bold mb-1.5">
              Slack / SOC Webhook Integration URL:
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          <button
            onClick={handleSendTestAlert}
            disabled={isSending}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-200 font-bold rounded-xl transition-all flex items-center gap-2 border border-white/10"
          >
            {isSending ? (
              <span>Dispatching...</span>
            ) : testSent ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Test Email Sent ✓</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-cyan-400" />
                <span>Send Test Email Alert</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-indigo-500/20 uppercase"
          >
            Save Alert Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
