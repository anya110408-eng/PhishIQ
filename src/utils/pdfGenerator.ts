import { jsPDF } from "jspdf";
import { AnalysisResponse, DepartmentRisk, SystemStats } from "../types";

export const generateExecutivePdfReport = (
  analysis?: AnalysisResponse | null,
  stats?: SystemStats | null,
  departments?: DepartmentRisk[]
) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;

  // Colors
  const darkNavy = "#0f172a";
  const indigoPrimary = "#4f46e5";
  const cyanAccent = "#0891b2";
  const roseDanger = "#e11d48";
  const amberWarn = "#d97706";
  const emeraldSafe = "#059669";
  const textDark = "#1e293b";
  const textMuted = "#64748b";
  const bgLight = "#f8fafc";

  // --- Header Banner ---
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("PhishIQ | SOC Threat Assessment Report", margin, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // #94a3b8
  const timestampStr = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  doc.text(`Generated: ${timestampStr} | Confidential Executive Briefing`, margin, 21);

  y = 38;

  // --- Section 1: Executive Overview / Stats ---
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 26, 3, 3, "F");

  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 26, 3, 3, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("EXECUTIVE THREAT METRICS OVERVIEW", margin + 5, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);

  const totalScans = stats?.total_scans ?? 1284;
  const highRisk = stats?.high_risk_scans ?? 342;
  const resilience = stats?.resilience_score ?? 78;

  doc.text(`Total Threat Scans: ${totalScans}`, margin + 5, y + 17);
  doc.text(`High Risk Threats: ${highRisk}`, margin + 65, y + 17);
  doc.text(`Organizational Resilience: ${resilience}/100`, margin + 125, y + 17);

  y += 34;

  // --- Section 2: Active Sample Threat Analysis (if available) ---
  if (analysis) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(79, 70, 229); // Indigo
    doc.text("Incident Assessment Detail", margin, y);
    y += 6;

    // Risk Box
    const riskScore = analysis.risk_score;
    const isHigh = riskScore >= 70;
    const isMed = riskScore >= 40 && riskScore < 70;

    const boxBg = isHigh ? "#fff1f2" : isMed ? "#fffbebe" : "#f0fdf4";
    const boxBorder = isHigh ? roseDanger : isMed ? amberWarn : emeraldSafe;

    // RGB Colors based on risk level
    const rFill = isHigh ? 255 : isMed ? 254 : 240;
    const gFill = isHigh ? 241 : isMed ? 243 : 253;
    const bFill = isHigh ? 242 : isMed ? 199 : 244;

    const rText = isHigh ? 225 : isMed ? 217 : 5;
    const gText = isHigh ? 29 : isMed ? 119 : 150;
    const bText = isHigh ? 72 : isMed ? 6 : 105;

    doc.setFillColor(rFill, gFill, bFill);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 38, 3, 3, "F");

    doc.setDrawColor(rText, gText, bText);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 38, 3, 3, "D");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(rText, gText, bText);
    doc.text(`VERDICT: ${analysis.verdict} (Risk Index: ${analysis.risk_score}/100)`, margin + 5, y + 9);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(`Psychological Hook: ${analysis.psychological_hook}`, margin + 5, y + 17);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const splitExplanation = doc.splitTextToSize(analysis.layman_explanation, pageWidth - margin * 2 - 10);
    doc.text(splitExplanation.slice(0, 2), margin + 5, y + 25);

    y += 46;

    // Detected Indicators & Traps
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("Identified Threat Flags & Indicators:", margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    if (analysis.detected_flags && analysis.detected_flags.length > 0) {
      analysis.detected_flags.forEach((flag) => {
        doc.text(`• ${flag}`, margin + 3, y);
        y += 4.5;
      });
    } else {
      doc.text("• No critical indicators detected in raw payload.", margin + 3, y);
      y += 4.5;
    }

    y += 4;
  }

  // --- Section 3: Department Vulnerability Breakdown ---
  if (departments && departments.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229);
    doc.text("Departmental Risk Matrix & Exposure", margin, y);
    y += 6;

    // Table Header
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, pageWidth - margin * 2, 7, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("DEPARTMENT", margin + 4, y + 5);
    doc.text("RISK LEVEL", margin + 55, y + 5);
    doc.text("FAILURE RATE", margin + 95, y + 5);
    doc.text("PRIMARY VECTOR", margin + 135, y + 5);

    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    departments.forEach((dept, idx) => {
      const isEven = idx % 2 === 0;
      doc.setFillColor(isEven ? 248 : 255, isEven ? 250 : 255, isEven ? 252 : 255);
      doc.rect(margin, y, pageWidth - margin * 2, 6.5, "F");

      doc.setTextColor(15, 23, 42);
      doc.text(dept.name, margin + 4, y + 4.5);

      if (dept.risk_level === "CRITICAL" || dept.risk_level === "HIGH") {
        doc.setTextColor(225, 29, 72);
      } else if (dept.risk_level === "MEDIUM") {
        doc.setTextColor(217, 119, 6);
      } else {
        doc.setTextColor(5, 150, 105);
      }
      doc.text(dept.risk_level, margin + 55, y + 4.5);

      doc.setTextColor(51, 65, 85);
      doc.text(`${dept.click_rate}%`, margin + 95, y + 4.5);
      doc.text(dept.top_trigger, margin + 135, y + 4.5);

      y += 6.5;
    });

    y += 8;
  }

  // --- Section 4: Recommended SOC Remediation Guidelines ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Recommended SOC Action Plan:", margin, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const recommendations = [
    "1. Enforce strict DMARC/SPF/DKIM domain verification across all external gateway relays.",
    "2. Deploy targeted micro-simulation modules to high-exposure departments (e.g. Finance & Operations).",
    "3. Conduct out-of-band identity verification for wire transfers or credential reset requests.",
    "4. Review and update homoglyph & lookalike domain whitelists in PhishIQ Settings.",
  ];

  recommendations.forEach((rec) => {
    doc.text(rec, margin + 3, y);
    y += 5;
  });

  // --- Footer ---
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `PhishIQ Threat Intelligence Platform • Page ${i} of ${pageCount}`,
      margin,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  // Download PDF
  const filename = `PhishIQ_Executive_Threat_Report_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
};
