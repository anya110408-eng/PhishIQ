import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { VulnerabilityProfileView } from "./components/VulnerabilityProfileView";
import { SandboxView } from "./components/SandboxView";
import { HistoryView } from "./components/HistoryView";
import { SettingsView } from "./components/SettingsView";
import { AiCopilotView } from "./components/AiCopilotView";
import { ResilienceTrendChart } from "./components/ResilienceTrendChart";
import { InteractiveTour } from "./components/InteractiveTour";
import { EmailAlertsModal } from "./components/EmailAlertsModal";
import { AuthModal } from "./components/AuthModal";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { AnalysisResponse, DepartmentRisk, SystemStats } from "./types";
import { ShieldCheck, ArrowRight, Zap, Brain, FlaskConical } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("vulnerability");
  const [isDark, setIsDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isEmailAlertsOpen, setIsEmailAlertsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const [stats, setStats] = useState<SystemStats | null>(null);
  const [departments, setDepartments] = useState<DepartmentRisk[]>([]);
  const [history, setHistory] = useState<AnalysisResponse[]>(() => {
  try {
    const saved = localStorage.getItem("phishiq_history");
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
});

useEffect(() => {
  try {
    localStorage.setItem("phishiq_history", JSON.stringify(history));
  } catch (e) {}
}, [history]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Sync dark class on html root element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Initial Data Fetching from backend
  const fetchData = async () => {
    try {
      const [statsRes, deptsRes, historyRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/departments"),
        fetch("/api/history"),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (deptsRes.ok) setDepartments(await deptsRes.json());
      if (historyRes.ok) {
        const histData: AnalysisResponse[] = await historyRes.json();
        setHistory(histData);
        if (histData.length > 0 && !currentAnalysis) {
          setCurrentAnalysis(histData[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch backend data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle new analysis submission
  const handleAnalyze = async (payload: {
    email_body?: string;
    url?: string;
    sender_email?: string;
  }): Promise<AnalysisResponse | null> => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Backend analysis failed");
      const result: AnalysisResponse = await res.json();
      setCurrentAnalysis(result);

      // Refresh stats & history
      await fetchData();
      setActiveTab("sandbox");
      return result;
    } catch (err) {
      console.error("Error running analysis:", err);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Toggle department training assignment
  const handleAssignTraining = async (id: string) => {
    try {
      const res = await fetch("/api/departments/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments);
      }
    } catch (err) {
      console.error("Failed to assign training:", err);
    }
  };

  // Delete history item
  const handleDeleteHistory = async (id: string) => {
    try {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete history item:", err);
    }
  };

  // Title mappings
  const getHeaderMeta = () => {
    switch (activeTab) {
      case "dashboard":
        return {
          title: "Command Overview",
          subtitle: "Enterprise Threat Monitoring & Active Phishing Defence Hub",
        };
      case "sandbox":
        return {
          title: "Phishing Sandbox & Live Detector",
          subtitle: "Heuristic and Psychological Threat Analysis Engine",
        };
      case "vulnerability":
        return {
          title: "Vulnerability Profile",
          subtitle: "System-wide Human Error Propensity Matrix",
        };
      case "history":
        return {
          title: "Threat History & Forensic Logs",
          subtitle: "Archive of Past Scans, Mismatches, and Vector Scoring",
        };
      case "settings":
        return {
          title: "System Settings & Customization",
          subtitle: "Theme, Sensitivity, Whitelists & Engine Controls",
        };
      case "copilot":
        return {
          title: "AI SOC Copilot & Simulation Lab",
          subtitle: "Generative Intelligence Assistant & Phishing Scenario Studio",
        };
      default:
        return {
          title: "Vulnerability Profile",
          subtitle: "System-wide Human Error Propensity Matrix",
        };
    }
  };

  const headerMeta = getHeaderMeta();

  return (
    <div className="min-h-screen bg-surface text-on-surface transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewAnalysis={() => setActiveTab("sandbox")}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="ml-0 lg:ml-[280px] min-h-screen p-4 sm:p-6 md:p-8 transition-all">
        <Header
          title={headerMeta.title}
          subtitle={headerMeta.subtitle}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isDark={isDark}
          toggleTheme={toggleTheme}
          onOpenTour={() => setIsTourOpen(true)}
          onOpenEmailAlerts={() => setIsEmailAlertsOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          currentUser={currentUser}
          currentAnalysis={currentAnalysis}
          stats={stats}
          departments={departments}
        />

        {/* Tab Route Views */}
        {activeTab === "vulnerability" && (
          <VulnerabilityProfileView
            stats={stats}
            departments={departments}
            onAssignTraining={handleAssignTraining}
            searchFilter={searchQuery}
            history={history}
            onNavigateSandbox={() => setActiveTab("sandbox")}
          />
        )}

        {activeTab === "sandbox" && (
          <SandboxView
            onAnalyze={handleAnalyze}
            currentAnalysis={currentAnalysis}
            isLoading={isAnalyzing}
          />
        )}

        {activeTab === "copilot" && (
          <AiCopilotView currentAnalysis={currentAnalysis} />
        )}

        {activeTab === "history" && (
          <HistoryView
            history={history}
            onDeleteHistoryItem={handleDeleteHistory}
            onSelectForInspection={(item) => {
              setCurrentAnalysis(item);
              setActiveTab("sandbox");
            }}
            searchFilter={searchQuery}
          />
        )}

        {activeTab === "settings" && (
          <SettingsView
            isDark={isDark}
            toggleTheme={toggleTheme}
            onOpenEmailAlerts={() => setIsEmailAlertsOpen(true)}
          />
        )}

        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Quick Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-white/10">
                <span className="font-mono-code text-[10px] text-slate-500 uppercase tracking-wider block">
                  Total Scans Performed
                </span>
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {stats?.total_scans || history.length}
                </span>
              </div>

              <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-white/10">
                <span className="font-mono-code text-[10px] text-slate-500 uppercase tracking-wider block">
                  High Risk Scams Detected
                </span>
                <span className="text-3xl font-black text-rose-500 mt-1 block">
                  {stats?.high_risk_scans || 2}
                </span>
              </div>

              <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-white/10">
                <span className="font-mono-code text-[10px] text-slate-500 uppercase tracking-wider block">
                  Resilience Score
                </span>
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {stats?.resilience_score || 75}/100
                </span>
              </div>

              <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-white/10">
                <span className="font-mono-code text-[10px] text-slate-500 uppercase tracking-wider block">
                  Primary Weakness Vector
                </span>
                <span className="text-sm font-bold font-mono-code text-rose-400 mt-2 block truncate">
                  {stats?.primary_weakness || "Authority Bias (84%)"}
                </span>
              </div>
            </div>

            {/* 30-Day Resilience Score Trend Line Chart */}
            <ResilienceTrendChart />

            {/* Quick Actions Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                onClick={() => setActiveTab("sandbox")}
                className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono-code font-bold rounded-lg uppercase">
                    Live Scanner
                  </span>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Analyze Suspicious Email or Link
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Run raw email content or target URLs through the heuristic domain mismatch & psychological hook analyzer.
                </p>
              </div>

              <div
                onClick={() => setActiveTab("vulnerability")}
                className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono-code font-bold rounded-lg uppercase">
                    Vulnerability Matrix
                  </span>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  View Department Risk Profile & Radar
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Examine human error propensity radar, 6-month simulation trends, and assign mandatory training modules.
                </p>
              </div>
            </div>

            {/* Embed Vulnerability Matrix */}
            <VulnerabilityProfileView
              stats={stats}
              departments={departments}
              onAssignTraining={handleAssignTraining}
              searchFilter={searchQuery}
              history={history}
              onNavigateSandbox={() => setActiveTab("sandbox")}
            />
          </div>
        )}
      </main>
      {/* Interactive Feature Tour */}
      <InteractiveTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Email Alerts Configuration Modal */}
      <EmailAlertsModal
        isOpen={isEmailAlertsOpen}
        onClose={() => setIsEmailAlertsOpen(false)}
      />

      {/* Authentication Sign In / Sign Up Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
