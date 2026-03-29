import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

interface GuestBannerProps {
  scansUsed: number;
  maxScans: number;
  onLogin: () => void;
}

export default function GuestBanner({ scansUsed, maxScans, onLogin }: GuestBannerProps) {
  const percentage = (scansUsed / maxScans) * 100;

  return (
    <Alert className="bg-threat-suspicious/10 border-threat-suspicious/30" data-testid="alert-guest-banner">
      <AlertCircle className="h-4 w-4 text-threat-suspicious" />
      <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-2 flex-1 min-w-[200px]">
          <p className="text-sm font-medium">
            Guest Mode - Limited to {maxScans} scans per session
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span data-testid="text-scans-used">{scansUsed} of {maxScans} scans used</span>
              <span>{maxScans - scansUsed} remaining</span>
            </div>
            <Progress value={percentage} className="h-1.5" indicatorClassName="bg-threat-suspicious" />
          </div>
        </div>
        <Button onClick={onLogin} size="sm" data-testid="button-login-guest-banner">
          Sign In for Unlimited Scans
        </Button>
      </AlertDescription>
    </Alert>
  );
}
