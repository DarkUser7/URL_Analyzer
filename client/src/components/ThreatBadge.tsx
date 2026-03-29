import { Badge } from "./ui/badge";
import { Shield, AlertTriangle, XCircle, Loader2 } from "lucide-react";

type ThreatLevel = "benign" | "suspicious" | "malicious" | "phishing" | "scanning";

interface ThreatBadgeProps {
  level: ThreatLevel;
  className?: string;
}

const threatConfig = {
  benign: {
    label: "BENIGN",
    icon: Shield,
    bgClass: "bg-threat-benign/20 text-threat-benign border-threat-benign/30",
  },
  suspicious: {
    label: "SUSPICIOUS",
    icon: AlertTriangle,
    bgClass: "bg-threat-suspicious/20 text-threat-suspicious border-threat-suspicious/30",
  },
  malicious: {
    label: "MALICIOUS",
    icon: XCircle,
    bgClass: "bg-threat-malicious/20 text-threat-malicious border-threat-malicious/30",
  },
  phishing: {
    label: "PHISHING",
    icon: XCircle,
    bgClass: "bg-threat-malicious/20 text-threat-malicious border-threat-malicious/30",
  },
  scanning: {
    label: "SCANNING",
    icon: Loader2,
    bgClass: "bg-threat-scanning/20 text-threat-scanning border-threat-scanning/30",
  },
};


export default function ThreatBadge({ level, className = "" }: ThreatBadgeProps) {
  const config = threatConfig[level];
  if (!config) {
    // fallback for unknown threat level
    return (
      <Badge variant="outline" className={`bg-gray-200 text-gray-700 border-gray-300 font-semibold text-xs uppercase gap-1.5 px-3 py-1 ${className}`}
        data-testid={`badge-threat-unknown`}>
        <Shield className="h-3.5 w-3.5" />
        UNKNOWN
      </Badge>
    );
  }
  const Icon = config.icon;
  return (
    <Badge
      variant="outline"
      className={`${config.bgClass} font-semibold text-xs uppercase gap-1.5 px-3 py-1 ${className}`}
      data-testid={`badge-threat-${level}`}
    >
      <Icon className={`h-3.5 w-3.5 ${level === "scanning" ? "animate-spin" : ""}`} />
      {config.label}
    </Badge>
  );
}
