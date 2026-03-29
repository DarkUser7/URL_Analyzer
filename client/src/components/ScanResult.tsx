import { Card } from "./ui/card";
import ThreatBadge from "./ThreatBadge";
import ConfidenceMeter from "./ConfidenceMeter";
import { Button } from "./ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "../hooks/use-toast";


type ThreatLevel = "benign" | "suspicious" | "malicious" | "phishing" | "scanning";

interface ScanResultProps {
  label: string;
  result?: {
    classification?: ThreatLevel;
    confidence?: number;
    triggered?: string[];
    reasoning?: string;
    source?: string;
  };
  url: string;
  timestamp: Date;
}

export default function ScanResult({ label, result, url, timestamp }: ScanResultProps) {
  const { toast } = useToast();

  const getBorderColor = () => {
    switch (result?.classification) {
      case "benign":
        return "border-l-threat-benign";
      case "suspicious":
        return "border-l-threat-suspicious";
      case "malicious":
      case "phishing":
        return "border-l-threat-malicious";
      default:
        return "border-l-primary";
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copied",
      description: "URL has been copied to clipboard",
    });
  };

  return (
    <Card className={`p-8 border-l-8 ${getBorderColor()}`} data-testid="card-scan-result">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base">{label}</span>
            {result?.classification && <ThreatBadge level={result.classification} />}
          </div>
          <div className="text-sm text-muted-foreground">{timestamp.toLocaleString()}</div>
        </div>
        <div className="flex items-center gap-2 group">
          <p className="font-mono text-sm break-all" data-testid="text-scanned-url">{url}</p>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            onClick={copyUrl}
            data-testid="button-copy-url"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
        {typeof result?.confidence === "number" ? (
          <ConfidenceMeter confidence={result.confidence} />
        ) : result?.classification === "phishing" ? null : (
          <div className="text-muted-foreground text-sm">No result available.</div>
        )}
        {result?.reasoning && (
          <div className="text-sm text-muted-foreground"><b>Reasoning:</b> {result.reasoning}</div>
        )}
        {Array.isArray(result?.triggered) && result.triggered.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold">Detection Signals</h4>
            <ul className="space-y-1">
              {result.triggered.map((signal, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button variant="outline" asChild data-testid="button-visit-url">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Visit URL
          </a>
        </Button>
      </div>
    </Card>
  );
}
