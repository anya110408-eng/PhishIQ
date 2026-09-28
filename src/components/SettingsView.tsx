import React, { useState } from "react";
import { Settings, Sun, Moon, ShieldCheck, Sliders, Bell, KeyRound } from "lucide-react";

interface SettingsViewProps {
  isDark: boolean;
  toggleTheme: () => void;
  onOpenEmailAlerts?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ isDark, toggleTheme, onOpenEmailAlerts }) => {
  const [sensitivity, setSensitivity] = useState(75);
  const [whitelist, setWhitelist] = useState("microsoft.com\npaypal.com\ngithub.com\ngoogle.com");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-6">
        <h3 className="font-mono-code text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-2">
          <Settings className="w-4 h-4 text-emerald-500" />
          PhishIQ Platform Settings & Customization
        </h3>

        {/* Theme Settings */}
        <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-white/5 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-mono-code text-xs font-bold text-slate-900 dark:text-slate-100">
                Interface Color Palette & Mode
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Switch between Cyber-Glassmorphic Dark Mode with high-contrast glowing accents or Light Mode with high-contrast clarity.
              </p>
            </div>

            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono-code text-xs font-bold flex items-center gap-2 hover:bg-emerald-500/20 transition-all"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-300" />
                  Dark Mode Active
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  Light Mode Active
                </>
              )}
            </button>
          </div>
        </div>

        {/* Heuristic Threshold */}
        <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-white/5 space-y-3 font-mono-code text-xs">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-500" />
              Heuristic Threat Engine Sensitivity Threshold ({sensitivity}%)
            </h4>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              {sensitivity > 80 ? "HIGH SENSITIVITY (STRICT)" : sensitivity > 50 ? "BALANCED" : "LENIENT"}
            </span>
          </div>

          <input
            type="range"
            min="30"
            max="95"
            value={sensitivity}
            onChange={(e) => setSensitivity(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Higher values flag subtle psychological triggers and homoglyphs aggressively.
          </p>
        </div>

        {/* Email Alerts & SOC Notifications */}
        <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-white/5 space-y-3 font-mono-code text-xs">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-500" />
                Automated Email Alerts & SOC Webhook Rules
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Configure instant critical alert thresholds, executive digests, and Slack/Teams webhooks.
              </p>
            </div>

            {onOpenEmailAlerts && (
              <button
                onClick={onOpenEmailAlerts}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/20 transition-all uppercase"
              >
                Configure Alerts
              </button>
            )}
          </div>
        </div>

        {/* Domain Whitelist */}
        <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-white/5 space-y-2 font-mono-code text-xs">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Verified Enterprise Whitelist Domains:
          </h4>
          <textarea
            rows={3}
            value={whitelist}
            onChange={(e) => setWhitelist(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-xl p-3 text-xs font-mono-code text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Backend API & AI Engine Status */}
        <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-white/5 flex items-center justify-between font-mono-code text-xs">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-500" />
              Server-Side AI Engine Status
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Gemini 3.6 Flash & Local Heuristic Rules active on Node.js server proxy.
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full font-bold text-[11px]">
            CONNECTED & OPERATIONAL
          </span>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-mono-code font-bold text-xs rounded-xl uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
          >
            {saved ? "Settings Saved ✓" : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
};
