import React, { useState } from "react";
import { Sparkles, ArrowRight, ArrowLeft, Check, Compass, ShieldCheck, Flame, FlaskConical, Bell } from "lucide-react";

interface Step {
  title: string;
  badge: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  highlightTab: string;
}

const TOUR_STEPS: Step[] = [
  {
    title: "Welcome to PhishIQ",
    badge: "Interactive Onboarding",
    description: "PhishIQ maps human error propensity across psychological manipulation vectors (Authority, Urgency, Scarcity, Social Proof) rather than generic technical spam filters.",
    icon: Compass,
    highlightTab: "dashboard",
  },
  {
    title: "30-Day Resilience Score Trajectory",
    badge: "Command Dashboard",
    description: "Track your enterprise security posture and defense improvements over a 30-day timeline powered by live simulations and sandbox scans.",
    icon: ShieldCheck,
    highlightTab: "dashboard",
  },
  {
    title: "Cognitive Threat Heatmap Matrix",
    badge: "Risk Heatmap",
    description: "Visualize departmental vulnerability intensity. Discover which teams (e.g. Finance vs Engineering) are most susceptible to specific psychological hooks.",
    icon: Flame,
    highlightTab: "vulnerability",
  },
  {
    title: "Live Phishing & Threat Sandbox",
    badge: "Live Detector",
    description: "Submit suspicious email text, headers, or URLs to instantly calculate domain homoglyph mismatches, cognitive hook weights, and safe response steps.",
    icon: FlaskConical,
    highlightTab: "sandbox",
  },
  {
    title: "Automated Email & SOC Alerts",
    badge: "Real-time Response",
    description: "Set instant email notification thresholds when high-risk phishing attacks are detected, and dispatch targeted training modules directly to vulnerable departments.",
    icon: Bell,
    highlightTab: "settings",
  },
];

interface InteractiveTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tabId: string) => void;
}

export const InteractiveTour: React.FC<InteractiveTourProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIdx];
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (currentStepIdx < TOUR_STEPS.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      onNavigateTab(TOUR_STEPS[nextIdx].highlightTab);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      onNavigateTab(TOUR_STEPS[prevIdx].highlightTab);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn font-mono-code">
      <div className="bg-slate-900 border border-indigo-500/40 dark:border-cyan-500/40 rounded-2xl p-6 max-w-lg w-full text-slate-100 shadow-2xl relative space-y-6">
        {/* Step Indicator Top Bar */}
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              Guided Tour ({currentStepIdx + 1}/{TOUR_STEPS.length})
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white uppercase font-bold"
          >
            Skip Tour ✕
          </button>
        </div>

        {/* Step Icon & Title */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 dark:bg-cyan-500/10 border border-indigo-500/30 dark:border-cyan-500/30 rounded-full text-indigo-400 dark:text-cyan-400 text-[11px] font-bold uppercase">
            <Icon className="w-3.5 h-3.5" />
            <span>{currentStep.badge}</span>
          </div>

          <h3 className="text-xl font-bold text-slate-100">{currentStep.title}</h3>

          <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
            {currentStep.description}
          </p>
        </div>

        {/* Progress Bar Dots */}
        <div className="flex justify-center items-center gap-2">
          {TOUR_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStepIdx
                  ? "w-8 bg-cyan-400"
                  : idx < currentStepIdx
                  ? "w-3 bg-indigo-500"
                  : "w-3 bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={handlePrev}
            disabled={currentStepIdx === 0}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl hover:brightness-110 flex items-center gap-2 shadow-lg shadow-indigo-500/20 uppercase transition-all"
          >
            {currentStepIdx === TOUR_STEPS.length - 1 ? (
              <>
                <span>Finish Guided Tour</span>
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Next Feature</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
