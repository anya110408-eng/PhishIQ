import { AnalysisResponse, SystemStats } from "../types";

export interface PersonalizedStats extends SystemStats {
  high_risk_percentage: number;
  avg_risk_score: number;
  authority_avg: number;
  urgency_avg: number;
  scarcity_avg: number;
  social_proof_avg: number;
  liking_avg: number;
}

export function computeStatsFromHistory(history: AnalysisResponse[] = []): PersonalizedStats {
  const totalScans = history.length;

  if (totalScans === 0) {
    return {
      total_scans: 0,
      high_risk_scans: 0,
      resilience_score: 100,
      primary_weakness: "None Detected",
      resilience_factor: "No Search History",
      high_risk_percentage: 0,
      avg_risk_score: 0,
      authority_avg: 0,
      urgency_avg: 0,
      scarcity_avg: 0,
      social_proof_avg: 0,
      liking_avg: 0,
      monthly_trend: [],
    };
  }

  const highRiskScans = history.filter((item) => (item.risk_score || 0) >= 60).length;
  const highRiskPercentage = Math.round((highRiskScans / totalScans) * 100);

  const totalRiskScore = history.reduce((acc, curr) => acc + (curr.risk_score || 0), 0);
  const avgRiskScore = Math.round(totalRiskScore / totalScans);
  const resilienceScore = Math.max(0, 100 - avgRiskScore);

  let authSum = 0;
  let urgSum = 0;
  let scarSum = 0;
  let socSum = 0;
  let likeSum = 0;

  history.forEach((item) => {
    const radar = item.radar_scores || {
      authority_bias: 0,
      manufactured_urgency: 0,
      scarcity: 0,
      social_proof: 0,
      liking_rapport: 0,
    };
    authSum += radar.authority_bias || 0;
    urgSum += radar.manufactured_urgency || 0;
    scarSum += radar.scarcity || 0;
    socSum += radar.social_proof || 0;
    likeSum += radar.liking_rapport || 0;
  });

  const authorityAvg = Math.round(authSum / totalScans);
  const urgencyAvg = Math.round(urgSum / totalScans);
  const scarcityAvg = Math.round(scarSum / totalScans);
  const socialProofAvg = Math.round(socSum / totalScans);
  const likingAvg = Math.round(likeSum / totalScans);

  const vectors = [
    { name: "Authority Bias", score: authorityAvg },
    { name: "Manufactured Urgency", score: urgencyAvg },
    { name: "Scarcity / FOMO", score: scarcityAvg },
    { name: "Social Proof", score: socialProofAvg },
    { name: "Liking & Rapport", score: likingAvg },
  ];

  vectors.sort((a, b) => b.score - a.score);
  const topVector = vectors[0];
  const lowestVector = vectors[vectors.length - 1];

  const primaryWeakness = topVector && topVector.score > 0
    ? `${topVector.name} (${topVector.score}%)`
    : "None Detected";

  const resilienceFactor = lowestVector
    ? `${lowestVector.name} (${lowestVector.score}%)`
    : "Low Threat Exposure";

  return {
    total_scans: totalScans,
    high_risk_scans: highRiskScans,
    resilience_score: resilienceScore,
    primary_weakness: primaryWeakness,
    resilience_factor: resilienceFactor,
    high_risk_percentage: highRiskPercentage,
    avg_risk_score: avgRiskScore,
    authority_avg: authorityAvg,
    urgency_avg: urgencyAvg,
    scarcity_avg: scarcityAvg,
    social_proof_avg: socialProofAvg,
    liking_avg: likingAvg,
    monthly_trend: [],
  };
}
