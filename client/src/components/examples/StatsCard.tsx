import StatsCard from "../StatsCard";
import { Shield, AlertTriangle, XCircle } from "lucide-react";

export default function StatsCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      <StatsCard
        title="Total Scans"
        value="1,247"
        icon={Shield}
        description="All time"
        trend={{ value: "+12% from last month", isPositive: true }}
      />
      <StatsCard
        title="Threats Detected"
        value="89"
        icon={XCircle}
        description="Last 30 days"
        trend={{ value: "-5% from last month", isPositive: true }}
      />
      <StatsCard
        title="Safe URLs"
        value="1,158"
        icon={AlertTriangle}
        description="92.9% safe rate"
      />
    </div>
  );
}
