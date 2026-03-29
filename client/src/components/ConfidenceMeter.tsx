import { Progress } from "./ui/progress";

interface ConfidenceMeterProps {
  confidence: number;
  className?: string;
}

export default function ConfidenceMeter({ confidence, className = "" }: ConfidenceMeterProps) {
  const getColorClass = () => {
    if (confidence >= 80) return "bg-threat-benign";
    if (confidence >= 60) return "bg-threat-suspicious";
    return "bg-threat-malicious";
  };

  return (
    <div className={`space-y-2 ${className}`} data-testid="confidence-meter">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">Confidence</span>
        <span className="text-sm font-semibold" data-testid="text-confidence-value">
          {confidence}%
        </span>
      </div>
      <Progress value={confidence} className="h-2" indicatorClassName={getColorClass()} />
    </div>
  );
}
