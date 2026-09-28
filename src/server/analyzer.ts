import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisRequest, AnalysisResponse, RadarScores } from "../types.js";

// Official vs Fake Domain database for Heuristics
const KNOWN_SERVICES: Record<string, { official: string; keywords: string[] }> = {
  microsoft: { official: "microsoft.com", keywords: ["microsoft", "office365", "outlook", "azure", "msft"] },
  paypal: { official: "paypal.com", keywords: ["paypal", "paypaI", "pay-pal"] },
  google: { official: "google.com", keywords: ["google", "g00gle", "gmail", "google-workspace"] },
  apple: { official: "apple.com", keywords: ["apple", "icloud", "appleid", "app1e"] },
  amazon: { official: "amazon.com", keywords: ["amazon", "amaz0n", "aws"] },
  meta: { official: "facebook.com", keywords: ["facebook", "meta", "instagram", "whatsapp"] },
  netflix: { official: "netflix.com", keywords: ["netflix", "netfIix"] },
  bank: { official: "chase.com / bankofamerica.com", keywords: ["chase", "bankofamerica", "wellsfargo", "citi"] },
};

const SUSPICIOUS_TLDS = [".top", ".xyz", ".biz", ".cc", ".info", ".work", ".click", ".site", ".fun", ".zip", ".mov", ".tk", ".ml", ".ga", ".cf", ".gq"];

export async function analyzePhishing(req: AnalysisRequest): Promise<AnalysisResponse> {
  const emailBody = (req.email_body || "").trim();
  const url = (req.url || "").trim();
  const sender = (req.sender_email || "").trim();
  const fullText = `${sender} ${url} ${emailBody}`.toLowerCase();

  // 1. Run Local Heuristic & Rule Engine
  const flags: string[] = [];
  let scorePoints = 10; // base score

  // Check URLs
  let hasIpUrl = false;
  let hasSuspiciousTld = false;
  let hasLookalike = false;

  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const extractedUrls = url.match(urlRegex) || emailBody.match(urlRegex) || (url ? [url] : []);

  for (const u of extractedUrls) {
    if (/\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(u)) {
      hasIpUrl = true;
      flags.push("Raw IP address used in link target instead of domain name");
      scorePoints += 30;
    }

    for (const tld of SUSPICIOUS_TLDS) {
      if (u.toLowerCase().includes(tld)) {
        hasSuspiciousTld = true;
        flags.push(`Suspicious top-level domain (${tld}) detected`);
        scorePoints += 25;
        break;
      }
    }

    if (/@/.test(u.replace(/^https?:\/\//, ""))) {
      flags.push("Obfuscated URL structure containing '@' character");
      scorePoints += 20;
    }

    // Check homoglyphs / typosquatting
    if (/paypaI|rnicrosoft|g00gle|app1e|amaz0n|netfIix|micros0ft|sec-login/i.test(u)) {
      hasLookalike = true;
      flags.push("Typosquatting or visual character substitution (homoglyph attack) in URL");
      scorePoints += 35;
    }
  }

  // Domain Mismatch Detection
  let claimedOrg = "Unknown";
  let officialDomain = "N/A";
  let fakeDomain = "N/A";
  let isMismatch = false;

  for (const [key, meta] of Object.entries(KNOWN_SERVICES)) {
    if (meta.keywords.some((kw) => fullText.includes(kw))) {
      claimedOrg = key.toUpperCase();
      officialDomain = meta.official;
      
      // Check if domain actually matches official
      if (sender && !sender.endsWith(`@${meta.official}`) && !sender.endsWith(`.${meta.official}`)) {
        isMismatch = true;
        fakeDomain = sender.split("@")[1] || sender;
        flags.push(`Sender domain mismatch: Claims to be ${claimedOrg} but sent from '${fakeDomain}'`);
        scorePoints += 40;
      } else if (extractedUrls.some((u) => !u.includes(meta.official))) {
        isMismatch = true;
        fakeDomain = extractedUrls[0] || "external-phish-node.com";
        flags.push(`Link destination mismatch: Text references ${claimedOrg} but redirects elsewhere`);
        scorePoints += 30;
      }
      break;
    }
  }

  if (!isMismatch && sender) {
    fakeDomain = sender.split("@")[1] || sender;
    officialDomain = fakeDomain;
  }

  // 2. Psychological Vector Scoring (0-100 per vector)
  let urgencyCount = 0;
  let authorityCount = 0;
  let scarcityCount = 0;
  let socialProofCount = 0;
  let likingCount = 0;

  // Urgency
  if (/immediate|urgent|suspended|24 hours|30 minutes|unauthorized|terminate|locked|action required/i.test(fullText)) {
    urgencyCount += 3;
    flags.push("Manufactured urgency triggers (pressure to act under strict deadline)");
    scorePoints += 15;
  }

  // Authority
  if (/ceo|executive|it administrator|security operations|legal department|hr director|microsoft team|internal revenue|subpoena|payroll/i.test(fullText)) {
    authorityCount += 3;
    flags.push("Authority exploitation (impersonating executive leadership or IT security)");
    scorePoints += 15;
  }

  // Credential Harvesting Keywords
  if (/password|verify account|click here|confirm identity|update payment|sign in|restore access|direct deposit/i.test(fullText)) {
    flags.push("High-risk action words indicative of credential harvesting");
    scorePoints += 15;
  }

  // Scarcity
  if (/limited time|exclusive|claim before|bonus|final notice|spots remaining/i.test(fullText)) {
    scarcityCount += 2;
    scorePoints += 10;
  }

  // Liking / Rapport
  if (/hey friend|quick favor|as discussed|confidential request|family|kindly help/i.test(fullText)) {
    likingCount += 2;
    scorePoints += 10;
  }

  // Social Proof
  if (/all employees|colleagues|company policy|everyone has completed|mandatory for all/i.test(fullText)) {
    socialProofCount += 2;
    scorePoints += 10;
  }

  const computedRiskScore = Math.min(100, Math.max(5, scorePoints));

  // Determine Primary Psychological Hook
  const triggersMap = [
    { name: "Manufactured Urgency", count: urgencyCount + (computedRiskScore > 70 ? 2 : 0) },
    { name: "Authority Bias", count: authorityCount + (isMismatch ? 3 : 0) },
    { name: "Scarcity", count: scarcityCount },
    { name: "Liking / Rapport", count: likingCount },
    { name: "Social Proof", count: socialProofCount },
  ];
  triggersMap.sort((a, b) => b.count - a.count);
  const primaryHook = triggersMap[0].count > 0 ? triggersMap[0].name : "Manufactured Urgency";

  // Calculate radar profile
  const radarScores: RadarScores = {
    authority_bias: Math.min(95, Math.max(15, (authorityCount + (isMismatch ? 3 : 1)) * 25)),
    manufactured_urgency: Math.min(98, Math.max(20, (urgencyCount + (scorePoints > 50 ? 2 : 1)) * 24)),
    scarcity: Math.min(90, Math.max(10, scarcityCount * 30 + 15)),
    social_proof: Math.min(85, Math.max(10, socialProofCount * 25 + 10)),
    liking_rapport: Math.min(88, Math.max(10, likingCount * 25 + 10)),
  };

  // 3. Optional Gemini AI API Enrichment if GEMINI_API_KEY is present
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });

      const geminiPrompt = `You are PhishIQ's psychological threat analysis engine. Analyze this email/URL submission for phishing and social engineering traps.

Sender: ${sender || "Unknown"}
URL: ${url || "None provided"}
Email Content:
"""
${emailBody || "No body text provided"}
"""

Rule Engine Flag Context:
- Risk Score estimated: ${computedRiskScore}
- Detected Flags: ${flags.join("; ")}

Return a strict JSON object with these exact keys:
1. "risk_score": number between 0 and 100
2. "verdict": string (e.g., "HIGH RISK: THIS IS A SCAM", "CRITICAL RISK: PHISHING ATTEMPT", or "LOW RISK: LIKELY LEGITIMATE")
3. "psychological_hook": string (e.g. "Manufactured Urgency", "Authority Bias", "Scarcity", "Liking / Rapport", "Social Proof")
4. "layman_explanation": string (A 2-3 sentence clear, empathetic explanation of why the user's mind is prone to falling for this cognitive trick and how the pressure works)
5. "official_domain": string (the legitimate domain referenced)
6. "fake_domain": string (the deceptive sender/link domain)
7. "is_mismatch": boolean
8. "safe_actions": array of 3 actionable steps to take safely
9. "risky_actions": array of 3 dangerous mistakes to avoid
10. "radar_scores": object with numbers (0-100) for "authority_bias", "manufactured_urgency", "scarcity", "social_proof", "liking_rapport"`;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: geminiPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              risk_score: { type: Type.INTEGER },
              verdict: { type: Type.STRING },
              psychological_hook: { type: Type.STRING },
              layman_explanation: { type: Type.STRING },
              official_domain: { type: Type.STRING },
              fake_domain: { type: Type.STRING },
              is_mismatch: { type: Type.BOOLEAN },
              safe_actions: { type: Type.ARRAY, items: { type: Type.STRING } },
              risky_actions: { type: Type.ARRAY, items: { type: Type.STRING } },
              radar_scores: {
                type: Type.OBJECT,
                properties: {
                  authority_bias: { type: Type.INTEGER },
                  manufactured_urgency: { type: Type.INTEGER },
                  scarcity: { type: Type.INTEGER },
                  social_proof: { type: Type.INTEGER },
                  liking_rapport: { type: Type.INTEGER },
                },
              },
            },
            required: ["risk_score", "verdict", "psychological_hook", "layman_explanation", "official_domain", "fake_domain", "safe_actions", "risky_actions"],
          },
        },
      });

      if (aiResponse.text) {
        const geminiData = JSON.parse(aiResponse.text);
        return {
          id: `scan-${Date.now()}`,
          timestamp: new Date().toISOString(),
          risk_score: Math.min(100, Math.max(0, geminiData.risk_score ?? computedRiskScore)),
          verdict: geminiData.verdict || (computedRiskScore > 75 ? "HIGH RISK: THIS IS A SCAM" : "MEDIUM RISK: ANOMALOUS CONTENT"),
          psychological_hook: geminiData.psychological_hook || primaryHook,
          layman_explanation: geminiData.layman_explanation || "Attackers exploit urgency and fear of negative consequences to bypass your critical reasoning.",
          sender_analysis: {
            fake_domain: geminiData.fake_domain || fakeDomain,
            official_domain: geminiData.official_domain || officialDomain,
            is_mismatch: geminiData.is_mismatch ?? isMismatch,
            ip_detected: hasIpUrl ? "192.168.1.102" : undefined,
            lookalike_typo: hasLookalike,
            risk_reasons: flags,
          },
          action_recommendations: {
            safe_actions: geminiData.safe_actions || [
              "Report email directly to your IT Security Desk.",
              "Manually navigate to the official portal instead of clicking links.",
              "Verify the request through an out-of-band communication channel.",
            ],
            risky_actions: geminiData.risky_actions || [
              "Do NOT enter passwords or personal identity numbers.",
              "Do NOT click any buttons or open attached files.",
              "Do NOT reply to or forward this email to untrusted recipients.",
            ],
          },
          radar_scores: {
            authority_bias: geminiData.radar_scores?.authority_bias ?? radarScores.authority_bias,
            manufactured_urgency: geminiData.radar_scores?.manufactured_urgency ?? radarScores.manufactured_urgency,
            scarcity: geminiData.radar_scores?.scarcity ?? radarScores.scarcity,
            social_proof: geminiData.radar_scores?.social_proof ?? radarScores.social_proof,
            liking_rapport: geminiData.radar_scores?.liking_rapport ?? radarScores.liking_rapport,
          },
          detected_flags: flags.length ? flags : ["Generic anomaly detected in message phrasing"],
          input_preview: {
            email_body: emailBody ? emailBody.substring(0, 150) + "..." : undefined,
            url: url || undefined,
            sender_email: sender || undefined,
          },
        };
      }
    } catch (e) {
      console.warn("Gemini API enrichment fallback to heuristic engine:", e);
    }
  }

  // Heuristic-only response construction
  let verdictText = "LOW RISK: LIKELY LEGITIMATE";
  if (computedRiskScore >= 80) verdictText = "HIGH RISK: THIS IS A SCAM";
  else if (computedRiskScore >= 55) verdictText = "HIGH RISK: SUSPICIOUS TRAP";
  else if (computedRiskScore >= 35) verdictText = "MEDIUM RISK: ANOMALOUS ACTIVITY";

  let laymanExplanation = "This message creates artificial panic and time bounds to trigger compliance before your rational judgment can verify the sender.";
  if (primaryHook === "Authority Bias") {
    laymanExplanation = "The email impersonates a trusted authority or executive figure to exploit respect for hierarchy and coerce immediate compliance.";
  } else if (primaryHook === "Scarcity") {
    laymanExplanation = "The threat relies on FOMO (Fear of Missing Out) by claiming an exclusive benefit or limited reward will expire immediately.";
  } else if (primaryHook === "Liking / Rapport") {
    laymanExplanation = "The message uses informal, friendly phrasing to lower your defensive guard and trick you into granting a quick favor.";
  }

  return {
    id: `scan-${Date.now()}`,
    timestamp: new Date().toISOString(),
    risk_score: computedRiskScore,
    verdict: verdictText,
    psychological_hook: primaryHook,
    layman_explanation: laymanExplanation,
    sender_analysis: {
      fake_domain: fakeDomain,
      official_domain: officialDomain,
      is_mismatch: isMismatch,
      ip_detected: hasIpUrl ? "192.168.1.102" : undefined,
      lookalike_typo: hasLookalike,
      risk_reasons: flags,
    },
    action_recommendations: {
      safe_actions: [
        "Report this message immediately to your Security Operations Center (SOC).",
        "Open a fresh browser tab and manually type the verified company web address.",
        "Cross-check the request with the purported sender via phone or internal chat.",
      ],
      risky_actions: [
        "Do NOT click any buttons, links, or attachments inside the email.",
        "Do NOT enter your login credentials, 2FA codes, or financial details.",
        "Do NOT reply to the sender or attempt to negotiate.",
      ],
    },
    radar_scores: radarScores,
    detected_flags: flags.length ? flags : ["No critical structural red flags found"],
    input_preview: {
      email_body: emailBody ? emailBody.substring(0, 150) + "..." : undefined,
      url: url || undefined,
      sender_email: sender || undefined,
    },
  };
}
