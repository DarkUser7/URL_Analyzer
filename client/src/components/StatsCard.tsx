import { Card } from "./ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function StatsCard({ title, value, icon: Icon, description, trend }: StatsCardProps) {
  return (
    <Card className="p-6" data-testid={`card-stats-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold" data-testid={`text-stats-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <p className={`text-xs ${trend.isPositive ? "text-threat-benign" : "text-threat-malicious"}`}>
              {trend.value}
            </p>
          )}
        </div>
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </Card>
  );
}
