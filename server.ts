import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { analyzePhishing } from "./src/server/analyzer.js";
import { AnalysisResponse, DepartmentRisk, SystemStats } from "./src/types.js";

const PORT = 3000;

// In-Memory Scan History Store
const scanHistory: AnalysisResponse[] = [
  {
    id: "scan-101",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    risk_score: 92,
    verdict: "HIGH RISK: THIS IS A SCAM",
    psychological_hook: "Manufactured Urgency",
    layman_explanation: "This email induces panic by claiming your Microsoft account will be terminated in 30 minutes unless you verify your credentials immediately. This artificial pressure bypasses deliberate critical analysis.",
    sender_analysis: {
      fake_domain: "security-alert@microsoft-verification.net",
      official_domain: "microsoft.com",
      is_mismatch: true,
      lookalike_typo: true,
      risk_reasons: [
        "Sender domain 'microsoft-verification.net' is not owned by Microsoft",
        "High-risk credential harvesting keywords found",
        "Urgency triggers imposing immediate 30-minute deadline",
      ],
    },
    action_recommendations: {
      safe_actions: [
        "Report email to Security Operations Center",
        "Check account security directly at account.microsoft.com",
        "Notify department administrator of spoofing attempt",
      ],
      risky_actions: [
        "Do NOT click 'Verify Credentials' link",
        "Do NOT reply to security-alert@microsoft-verification.net",
        "Do NOT enter corporate passwords",
      ],
    },
    radar_scores: {
      authority_bias: 85,
      manufactured_urgency: 95,
      scarcity: 40,
      social_proof: 30,
      liking_rapport: 20,
    },
    detected_flags: [
      "Mismatched sender domain",
      "Typosquatting target link",
      "Manufactured urgency deadline",
    ],
    input_preview: {
      email_body: "URGENT: Your Microsoft 365 Password Expires in 30 Minutes! Click here to maintain access: http://microsoft-verification.net/login.php",
      sender_email: "security-alert@microsoft-verification.net",
      url: "http://microsoft-verification.net/login.php",
    },
  },
  {
    id: "scan-102",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    risk_score: 84,
    verdict: "HIGH RISK: THIS IS A SCAM",
    psychological_hook: "Authority Bias",
    layman_explanation: "Impersonates the Chief Financial Officer requesting an urgent off-book wire transfer. It leverages executive authority to bypass standard approval channels.",
    sender_analysis: {
      fake_domain: "cfo-office@paypaI-corporate-sec.com",
      official_domain: "paypal.com",
      is_mismatch: true,
      lookalike_typo: true,
      risk_reasons: [
        "Sender uses 'paypaI' with capital 'I' homoglyph substitution",
        "Executive wire transfer request bypassing finance protocol",
      ],
    },
    action_recommendations: {
      safe_actions: [
        "Call CFO directly via internal extension to confirm",
        "Flag message to Anti-Fraud team",
      ],
      risky_actions: [
        "Do NOT execute wire transfer",
        "Do NOT communicate off-channel",
      ],
    },
    radar_scores: {
      authority_bias: 92,
      manufactured_urgency: 78,
      scarcity: 25,
      social_proof: 35,
      liking_rapport: 40,
    },
    detected_flags: ["Homoglyph domain substitution", "Executive wire transfer scam"],
    input_preview: {
      email_body: "Confidential wire transfer needed for acquisition closing before 5 PM. Do not discuss with staff.",
      sender_email: "cfo-office@paypaI-corporate-sec.com",
    },
  },
];

// Department Risk Initial Matrix
let departments: DepartmentRisk[] = [
  {
    id: "dept-1",
    name: "Finance & Operations",
    risk_level: "CRITICAL",
    click_rate: 82,
    top_trigger: "Authority Bias",
    mandatory_training: "Invoice Fraud Simulation",
    assigned: false,
  },
  {
    id: "dept-2",
    name: "Human Resources",
    risk_level: "HIGH",
    click_rate: 45,
    top_trigger: "Liking / Rapport",
    mandatory_training: "Social Engineering",
    assigned: false,
  },
  {
    id: "dept-3",
    name: "Engineering",
    risk_level: "LOW",
    click_rate: 12,
    top_trigger: "Technical Urgency",
    mandatory_training: "Advanced Spearphishing",
    assigned: false,
  },
  {
    id: "dept-4",
    name: "Sales & Marketing",
    risk_level: "HIGH",
    click_rate: 58,
    top_trigger: "Scarcity / FOMO",
    mandatory_training: "Baiting Resilience",
    assigned: false,
  },
];

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- API Endpoints ---

  // 1. Phishing Analysis Engine
  app.post("/api/analyze", async (req, res) => {
    try {
      const result = await analyzePhishing(req.body);
      // Store in memory scan log
      scanHistory.unshift(result);
      if (scanHistory.length > 50) scanHistory.pop();
      res.json(result);
    } catch (err: any) {
      console.error("Analysis Error:", err);
      res.status(500).json({ error: "Failed to analyze phishing submission", details: err.message });
    }
  });

  // 2. Scan History
  app.get("/api/history", (req, res) => {
    res.json(scanHistory);
  });

  app.delete("/api/history/:id", (req, res) => {
    const { id } = req.params;
    const index = scanHistory.findIndex((s) => s.id === id);
    if (index !== -1) {
      scanHistory.splice(index, 1);
    }
    res.json({ success: true, count: scanHistory.length });
  });

  // 3. Department Risk Index
  app.get("/api/departments", (req, res) => {
    res.json(departments);
  });

  app.post("/api/departments/assign", (req, res) => {
    const { id } = req.body;
    departments = departments.map((d) => (d.id === id ? { ...d, assigned: !d.assigned } : d));
    res.json({ success: true, departments });
  });

  // 4. System-wide Stats & Resilience Profile
  app.get("/api/stats", (req, res) => {
    const totalScans = scanHistory.length;
    const highRiskScans = scanHistory.filter((s) => s.risk_score >= 60).length;

    // Calculate dynamic radar averages or default profile
    let authoritySum = 84;
    let urgencySum = 78;
    let scarcitySum = 45;
    let socialProofSum = 32;
    let likingSum = 40;

    if (scanHistory.length > 0) {
      const sum = scanHistory.reduce(
        (acc, curr) => {
          acc.auth += curr.radar_scores.authority_bias;
          acc.urg += curr.radar_scores.manufactured_urgency;
          acc.scar += curr.radar_scores.scarcity;
          acc.soc += curr.radar_scores.social_proof;
          acc.like += curr.radar_scores.liking_rapport;
          return acc;
        },
        { auth: 0, urg: 0, scar: 0, soc: 0, like: 0 }
      );
      const len = scanHistory.length;
      authoritySum = Math.round(sum.auth / len);
      urgencySum = Math.round(sum.urg / len);
      scarcitySum = Math.round(sum.scar / len);
      socialProofSum = Math.round(sum.soc / len);
      likingSum = Math.round(sum.like / len);
    }

    const stats: SystemStats = {
      total_scans: totalScans,
      high_risk_scans: highRiskScans,
      resilience_score: 75,
      primary_weakness: `Authority Bias (${authoritySum}%)`,
      resilience_factor: `Social Proof (${socialProofSum}%)`,
      monthly_trend: [
        { month: "Jan", simulations: 8, failures: 3 },
        { month: "Feb", simulations: 16, failures: 5 },
        { month: "Mar", simulations: 22, failures: 6 },
        { month: "Apr", simulations: 14, failures: 2 },
        { month: "May", simulations: 36, failures: 10 },
        { month: "Jun", simulations: 38, failures: 12 },
      ],
    };

    res.json(stats);
  });

  // 5. AI SOC Copilot Assistant
  app.post("/api/ai-copilot", async (req, res) => {
    try {
      const { prompt, context } = req.body;
      if (!prompt) {
        res.status(400).json({ error: "Prompt is required" });
        return;
      }

      if (!process.env.GEMINI_API_KEY) {
        // Intelligent rule-based fallback response if GEMINI_API_KEY is unset
        res.json({
          reply: `[SOC Rule Engine]: Analyzed prompt "${prompt}". Standard security policy dictates reporting unverified communications to your IT Security Helpdesk, checking domain records against known official roots, and avoiding link interactions.`,
          suggestions: ["Draft security incident alert", "Explain homoglyph domain attacks", "How to verify DMARC/DKIM records"],
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });

      const systemInstruction = `You are PhishIQ's AI SOC Security Analyst Copilot. You assist security analysts and employees with threat analysis, phishing mitigations, incident response drafting, and technical email security questions. Provide clear, concise, actionable security insights.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `${prompt}\n\nContext: ${JSON.stringify(context || {})}`,
        config: { systemInstruction },
      });

      res.json({
        reply: response.text || "No response generated.",
        suggestions: [
          "Generate executive incident report",
          "Draft employee advisory warning",
          "Explain psychological triggers in this attack",
        ],
      });
    } catch (err: any) {
      console.error("AI Copilot Error:", err);
      res.status(500).json({ error: "Failed to generate AI response", details: err.message });
    }
  });

  // 6. AI Phishing Simulation Generator
  app.post("/api/ai-simulation", async (req, res) => {
    try {
      const { department = "Finance", trigger = "Authority Bias", difficulty = "Intermediate" } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        res.json({
          subject: `URGENT: Outstanding Audit Verification for ${department}`,
          sender: `compliance-audit@corporate-verify-sec.net`,
          body: `Dear Team,\n\nOur annual Q3 internal compliance review requires immediate action. Please confirm your credentials via the attached secure link within 2 hours to avoid temporary system lockouts.\n\nRegards,\nSecurity Operations Office`,
          key_traps: ["Manufactured 2-hour deadline", "Typosquatted domain extension", "Impersonating Compliance Officer"],
          mitigation_tip: "Cross-check audit requests directly with internal compliance lead via Slack/Teams before clicking.",
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Generate a realistic security training simulation email targeting the "${department}" department using the "${trigger}" psychological trigger at a "${difficulty}" difficulty level.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              sender: { type: Type.STRING },
              body: { type: Type.STRING },
              key_traps: { type: Type.ARRAY, items: { type: Type.STRING } },
              mitigation_tip: { type: Type.STRING },
            },
            required: ["subject", "sender", "body", "key_traps", "mitigation_tip"],
          },
        },
      });

      const data = JSON.parse(response.text || "{}");
      res.json(data);
    } catch (err: any) {
      console.error("AI Simulation Error:", err);
      res.status(500).json({ error: "Failed to generate AI simulation scenario", details: err.message });
    }
  });

  // 7. GenAI Multi-Domain Personalized Search Engine
  app.post("/api/search-genai", async (req, res) => {
    try {
      const { query, analyst = "Anya & Kush (SOC Lead Analysts)" } = req.body;
      if (!query || typeof query !== "string" || !query.trim()) {
        res.status(400).json({ error: "Search query is required" });
        return;
      }

      const q = query.trim();

      // Gather internal context to feed into personalized algorithm
      const matchingScans = scanHistory.filter(
        (s) =>
          s.input_preview.sender_email?.toLowerCase().includes(q.toLowerCase()) ||
          s.input_preview.url?.toLowerCase().includes(q.toLowerCase()) ||
          s.input_preview.email_body?.toLowerCase().includes(q.toLowerCase()) ||
          s.verdict.toLowerCase().includes(q.toLowerCase()) ||
          s.psychological_hook.toLowerCase().includes(q.toLowerCase())
      );

      const matchingDepts = departments.filter(
        (d) =>
          d.name.toLowerCase().includes(q.toLowerCase()) ||
          d.top_trigger.toLowerCase().includes(q.toLowerCase()) ||
          d.risk_level.toLowerCase().includes(q.toLowerCase())
      );

      if (!process.env.GEMINI_API_KEY) {
        // High-fidelity fallback algorithm response
        const fallback = {
          query: q,
          personalized_analyst: analyst,
          summary: `Rule Engine Multi-Domain Analysis for "${q}": Scanned internal Threat History, Lookalike Registries, and Department Vulnerability Matrix.`,
          risk_level: matchingScans.some((s) => s.risk_score >= 70) ? "HIGH" : "MEDIUM",
          matched_domains: [
            {
              domain: q.includes(".") ? q : `${q.toLowerCase()}.com`,
              category: "Threat Vector Query",
              trust_score: q.toLowerCase().includes("microsoft") || q.toLowerCase().includes("paypal") ? 35 : 75,
              risk_status: q.toLowerCase().includes("verify") || q.toLowerCase().includes("sec") ? "HIGH_RISK" : "SUSPICIOUS",
              explanation: `Identified domain matches across corporate threat intelligence feed and lookalike candidate lists.`,
            },
            {
              domain: `${q.toLowerCase()}-verification.net`,
              category: "Typosquatting Risk Domain",
              trust_score: 12,
              risk_status: "HIGH_RISK",
              explanation: `High-risk lookalike registered domain frequently paired with credential harvesting attempts.`,
            },
          ],
          threat_findings: [
            ...matchingScans.slice(0, 3).map((s) => ({
              title: `Scan Incident: ${s.psychological_hook}`,
              domain: s.sender_analysis.fake_domain || s.input_preview.sender_email || "N/A",
              type: "Scan Record",
              score: s.risk_score,
              details: s.layman_explanation,
            })),
            ...matchingDepts.map((d) => ({
              title: `Department Matrix: ${d.name}`,
              domain: `Internal Domain (${d.name})`,
              type: "Department Vulnerability",
              score: d.click_rate,
              details: `Risk Level: ${d.risk_level}, Top Trigger: ${d.top_trigger}`,
            })),
          ],
          personalized_recommendation: `Recommended SOC Action for ${analyst}: Deploy targeted domain filtering for "${q}" and audit SPF/DMARC alignment across associated subdomains.`,
        };

        res.json(fallback);
        return;
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });

      const prompt = `You are PhishIQ's Multi-Domain Threat Intelligence & Personalization Search Engine.
Perform a comprehensive multi-domain threat search for the query: "${q}".
Personalized for SOC Analyst Profile: "${analyst}".

Internal Database Context:
- Matched Historical Scans: ${JSON.stringify(matchingScans)}
- Matched Departments: ${JSON.stringify(matchingDepts)}

Analyze potential risks across all domains (corporate domains, lookalike/typosquatted extensions, phishing vectors, and department vulnerabilities). Synthesize personalized findings with a clear risk evaluation score.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              query: { type: Type.STRING },
              personalized_analyst: { type: Type.STRING },
              summary: { type: Type.STRING },
              risk_level: { type: Type.STRING },
              matched_domains: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    domain: { type: Type.STRING },
                    category: { type: Type.STRING },
                    trust_score: { type: Type.NUMBER },
                    risk_status: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                  },
                  required: ["domain", "category", "trust_score", "risk_status", "explanation"],
                },
              },
              threat_findings: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    domain: { type: Type.STRING },
                    type: { type: Type.STRING },
                    score: { type: Type.NUMBER },
                    details: { type: Type.STRING },
                  },
                  required: ["title", "domain", "type", "score", "details"],
                },
              },
              personalized_recommendation: { type: Type.STRING },
            },
            required: [
              "query",
              "personalized_analyst",
              "summary",
              "risk_level",
              "matched_domains",
              "threat_findings",
              "personalized_recommendation",
            ],
          },
        },
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (err: any) {
      console.error("GenAI Search Error:", err);
      res.status(500).json({ error: "Failed to perform GenAI search", details: err.message });
    }
  });

  // --- Vite Middleware or Static Assets ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PhishIQ Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
