export interface AnalysisRequest {
  email_body?: string;
  url?: string;
  sender_email?: string;
}

export interface SenderAnalysis {
  fake_domain: string;
  official_domain: string;
  is_mismatch: boolean;
  ip_detected?: string;
  lookalike_typo?: boolean;
  risk_reasons: string[];
}

export interface ActionRecommendations {
  safe_actions: string[];
  risky_actions: string[];
}

export interface RadarScores {
  authority_bias: number;
  manufactured_urgency: number;
  scarcity: number;
  social_proof: number;
  liking_rapport: number;
}

export interface AnalysisResponse {
  id: string;
  timestamp: string;
  risk_score: number; // 0 - 100
  verdict: string; // e.g. "HIGH RISK: THIS IS A SCAM"
  psychological_hook: string;
  layman_explanation: string;
  sender_analysis: SenderAnalysis;
  action_recommendations: ActionRecommendations;
  radar_scores: RadarScores;
  detected_flags: string[];
  input_preview: {
    email_body?: string;
    url?: string;
    sender_email?: string;
  };
}

export interface DepartmentRisk {
  id: string;
  name: string;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  click_rate: number; // percentage
  top_trigger: string;
  mandatory_training: string;
  assigned: boolean;
}

export interface SystemStats {
  total_scans: number;
  high_risk_scans: number;
  resilience_score: number;
  primary_weakness: string;
  resilience_factor: string;
  monthly_trend: Array<{
    month: string;
    simulations: number;
    failures: number;
  }>;
}
