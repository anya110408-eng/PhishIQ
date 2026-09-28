import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  UserCheck,
  UserX,
  Sun,
  Moon,
  Compass,
  User,
  FileText,
  Sparkles,
  Globe,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  X,
  ChevronRight,
  Zap,
} from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import { generateExecutivePdfReport } from "../utils/pdfGenerator";
import { AnalysisResponse, SystemStats, DepartmentRisk } from "../types";

interface GenAiSearchResult {
  query: string;
  personalized_analyst: string;
  summary: string;
  risk_level: string;
  matched_domains: Array<{
    domain: string;
    category: string;
    trust_score: number;
    risk_status: string;
    explanation: string;
  }>;
  threat_findings: Array<{
    title: string;
    domain: string;
    type: string;
    score: number;
    details: string;
  }>;
  personalized_recommendation: string;
}

interface HeaderProps {
  title: string;
  subtitle: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  onOpenTour?: () => void;
  onOpenEmailAlerts?: () => void;
  onOpenAuth?: () => void;
  currentUser?: FirebaseUser | null;
  currentAnalysis?: AnalysisResponse | null;
  stats?: SystemStats | null;
  departments?: DepartmentRisk[];
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  searchQuery,
  setSearchQuery,
  isDark,
  toggleTheme,
  onOpenTour,
  onOpenEmailAlerts,
  onOpenAuth,
  currentUser,
  currentAnalysis,
  stats,
  departments,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [genAiResult, setGenAiResult] = useState<GenAiSearchResult | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "domains" | "findings">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced GenAI multi-domain search trigger
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setGenAiResult(null);
      setIsDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setIsDropdownOpen(true);
      try {
        const res = await fetch("/api/search-genai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: searchQuery,
            analyst: currentUser ? (currentUser.displayName || currentUser.email || "Lead Analyst") : "Anya & Kush (SOC Lead Analysts)",
          }),
        });

        if (res.ok) {
          const data: GenAiSearchResult = await res.json();
          setGenAiResult(data);
        }
      } catch (err) {
        console.error("GenAI multi-domain search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery, currentUser]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim().length >= 2) {
      setIsDropdownOpen(true);
    }
    if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative">
      <div>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h2>
        <p className="text-sm font-mono-code text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search input with GenAI Multi-Domain Intelligence */}
        <div className="relative" ref={dropdownRef}>
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length >= 2) setIsDropdownOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
              className="w-56 md:w-72 bg-slate-200/90 dark:bg-slate-900/90 border border-slate-300 dark:border-cyan-500/30 rounded-full pl-9 pr-14 py-1.5 text-xs font-mono-code focus:outline-none focus:ring-2 focus:ring-cyan-500/50 dark:focus:ring-cyan-400/50 transition-all text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 shadow-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 px-1.5 py-0.5 rounded-full text-[9px] font-mono-code font-bold pointer-events-none">
              <Sparkles className="w-2.5 h-2.5 animate-pulse" />
              <span>AI</span>
            </div>
          </div>

          {/* Search Results Overlay Dropdown */}
          {isDropdownOpen && searchQuery.trim().length >= 2 && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-[480px] md:w-[560px] max-h-[520px] overflow-y-auto bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-4 shadow-2xl z-50 text-slate-100 space-y-4">
              {/* Header inside dropdown */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono-code text-xs font-bold text-white uppercase tracking-wider">
                        Search
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[9px] font-mono-code">
                        Personalized
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono-code">
                      Searching across domain registries, threat databases & department vectors
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Loading State */}
              {isSearching ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-2 text-cyan-400">
                  <Loader2 className="w-7 h-7 animate-spin" />
                  <p className="text-xs font-mono-code font-bold">
                    Running Risk Analysis for "{searchQuery}"...
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono-code">
                    Personalizing results using Anya & Kush SOC threat algorithms
                  </p>
                </div>
              ) : genAiResult ? (
                <div className="space-y-4">
                  {/* Summary & Analyst Context */}
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-cyan-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono-code text-cyan-400 font-bold uppercase tracking-wider">
                        Synthesis Summary
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      {genAiResult.summary}
                    </p>
                  </div>

                  {/* Filter chips */}
                  <div className="flex items-center gap-2 text-[10px] font-mono-code">
                    <button
                      onClick={() => setActiveFilter("all")}
                      className={`px-2.5 py-1 rounded-lg border transition-all ${
                        activeFilter === "all"
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold"
                          : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      All Results ({genAiResult.matched_domains.length + genAiResult.threat_findings.length})
                    </button>
                    <button
                      onClick={() => setActiveFilter("domains")}
                      className={`px-2.5 py-1 rounded-lg border transition-all ${
                        activeFilter === "domains"
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold"
                          : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Matched Domains ({genAiResult.matched_domains.length})
                    </button>
                    <button
                      onClick={() => setActiveFilter("findings")}
                      className={`px-2.5 py-1 rounded-lg border transition-all ${
                        activeFilter === "findings"
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold"
                          : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Threat Findings ({genAiResult.threat_findings.length})
                    </button>
                  </div>

                  {/* Domain Intelligence Matches */}
                  {(activeFilter === "all" || activeFilter === "domains") && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono-code text-slate-400 uppercase tracking-widest font-bold">
                        Multi-Domain Intelligence Matches
                      </div>

                      {genAiResult.matched_domains.length > 0 ? (
                        <div className="space-y-2">
                          {genAiResult.matched_domains.map((dom, idx) => {
                            const isHigh = dom.risk_status === "HIGH_RISK";
                            const isSafe = dom.risk_status === "SAFE";
                            return (
                              <div
                                key={idx}
                                className={`p-3 rounded-xl border transition-all space-y-1.5 ${
                                  isHigh
                                    ? "bg-rose-950/30 border-rose-500/40"
                                    : isSafe
                                    ? "bg-emerald-950/30 border-emerald-500/40"
                                    : "bg-amber-950/30 border-amber-500/40"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono-code text-xs font-bold text-white">
                                      {dom.domain}
                                    </span>
                                    <span className="text-[9px] font-mono-code px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                                      {dom.category}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-[9px] font-mono-code font-bold px-2 py-0.5 rounded-full ${
                                        isHigh
                                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                                          : isSafe
                                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                          : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                      }`}
                                    >
                                      {dom.risk_status}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-xs text-slate-300 leading-snug">
                                  {dom.explanation}
                                </p>

                                {/* Trust Score Bar */}
                                <div className="flex items-center gap-2 pt-1">
                                  <span className="text-[9px] font-mono-code text-slate-400">
                                    Trust Score:
                                  </span>
                                  <div className="flex-grow h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full ${
                                        dom.trust_score > 70
                                          ? "bg-emerald-500"
                                          : dom.trust_score > 40
                                          ? "bg-amber-500"
                                          : "bg-rose-500"
                                      }`}
                                      style={{ width: `${dom.trust_score}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-[10px] font-mono-code font-bold text-slate-200">
                                    {dom.trust_score}/100
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No domain matches found for this query.</p>
                      )}
                    </div>
                  )}

                  {/* Threat Findings & Internal Incidents */}
                  {(activeFilter === "all" || activeFilter === "findings") && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono-code text-slate-400 uppercase tracking-widest font-bold">
                        Internal Incidents & Matrix Matches
                      </div>

                      {genAiResult.threat_findings.length > 0 ? (
                        <div className="space-y-1.5">
                          {genAiResult.threat_findings.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-cyan-500/40 transition-all space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono-code text-xs font-bold text-slate-100">
                                  {item.title}
                                </span>
                                <span className="text-[9px] font-mono-code px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                  {item.type}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300">{item.details}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No historical threats matching search.</p>
                      )}
                    </div>
                  )}


                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* PDF Executive Report Download Button */}
        <button
          onClick={() => generateExecutivePdfReport(currentAnalysis, stats, departments)}
          className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all font-mono-code text-xs font-bold flex items-center gap-1.5 shadow-sm"
          title="Export Executive PDF Threat Report"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export PDF</span>
        </button>

        {/* Guided Tour Trigger */}
        {onOpenTour && (
          <button
            onClick={onOpenTour}
            className="px-3 py-1.5 rounded-full bg-indigo-500/10 dark:bg-cyan-500/10 border border-indigo-500/30 dark:border-cyan-500/30 text-indigo-600 dark:text-cyan-400 hover:bg-indigo-500/20 transition-all font-mono-code text-xs font-bold flex items-center gap-1.5"
            title="Start Interactive Platform Tour"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tour</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-cyan-400 transition-all"
          title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Bell Notifications (Email Alert Rules) */}
        <button
          onClick={onOpenEmailAlerts}
          className="p-2 rounded-full bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-cyan-400 transition-all relative"
          title="Configure Email & SOC Threat Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 dark:bg-cyan-400 animate-pulse"></span>
        </button>

        {/* User Account & Login / Sign Up Trigger - Clean Person Icon Logo */}
        <button
          onClick={onOpenAuth}
          className={`p-2 rounded-full border transition-all relative flex items-center justify-center ${
            currentUser
              ? "bg-indigo-500/20 dark:bg-cyan-500/20 border-indigo-500/40 dark:border-cyan-500/40 text-indigo-600 dark:text-cyan-400 shadow-sm"
              : "bg-slate-200/80 dark:bg-slate-800/80 border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-cyan-400"
          }`}
          title={currentUser ? `Account: ${currentUser.displayName || currentUser.email || "Guest"} (Click to manage)` : "Sign In or Register Account"}
        >
          {currentUser ? (
            <>
              <UserCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900"></span>
            </>
          ) : (
            <User className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
          )}
        </button>
      </div>
    </header>
  );
};


