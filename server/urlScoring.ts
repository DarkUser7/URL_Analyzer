import type { URLFeatures } from "./urlFeatures";

export interface ScoringResult {
  score: number;
  classification: "benign" | "suspicious" | "malicious";
  confidence: number;
  triggered: string[];
  reasoning: string;
}

export function scoreURL(features: URLFeatures): ScoringResult {
  let score = 0;
  const triggered: string[] = [];

  // Example heuristic rules
  if (features.lexical.urlLength > 100) {
    score += 0.2;
    triggered.push("Long URL");
  }
  if (features.lexical.hasSuspiciousToken) {
    score += 0.3;
    triggered.push("Suspicious token");
  }
  if (features.lexical.usesIP) {
    score += 0.3;
    triggered.push("Uses IP address");
  }
  if (features.lexical.entropy > 3.5) {
    score += 0.2;
    triggered.push("High entropy domain");
  }
  if (features.whois && features.whois.createdDate) {
    const age = Date.now() - new Date(features.whois.createdDate).getTime();
    if (age < 1000 * 60 * 60 * 24 * 30) {
      score += 0.2;
      triggered.push("Newly registered domain");
    }
  }
  // ...add more rules as needed

  // Clamp score
  if (score > 1) score = 1;

  let classification: "benign" | "suspicious" | "malicious" = "benign";
  if (score > 0.7) classification = "malicious";
  else if (score > 0.3) classification = "suspicious";

  return {
    score,
    classification,
    confidence: Math.round(score * 100),
    triggered,
    reasoning: triggered.join(", ") || "No suspicious features detected",
  };
}
