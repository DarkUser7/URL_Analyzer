import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { XCircle } from "lucide-react";
import ThreatBadge from "./ThreatBadge";

interface MaliciousURLAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  confidence: number;
  signals: string[];
}

export default function MaliciousURLAlert({
  open,
  onOpenChange,
  url,
  confidence,
  signals,
}: MaliciousURLAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-l-8 border-l-threat-malicious" data-testid="dialog-malicious-alert">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-threat-malicious/20 flex items-center justify-center flex-shrink-0">
              <XCircle className="h-6 w-6 text-threat-malicious" />
            </div>
            <div className="flex-1 min-w-0">
              <AlertDialogTitle className="text-xl">Malicious URL Detected!</AlertDialogTitle>
              <ThreatBadge level="malicious" className="mt-2" />
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription asChild>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Detected URL:</p>
              <p className="font-mono text-sm bg-muted p-3 rounded-md break-all" data-testid="text-malicious-url">
                {url}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Confidence: <span className="text-threat-malicious" data-testid="text-malicious-confidence">{confidence}%</span>
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Threat Signals:</p>
              <ul className="space-y-1.5">
                {signals.map((signal, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-threat-malicious mt-0.5">⚠</span>
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3">
              <p className="text-sm font-medium text-destructive">
                ⚠️ Warning: Do not click or visit this URL. It has been identified as malicious.
              </p>
            </div>
          </div>
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogAction data-testid="button-dismiss-alert">
            Dismiss
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
