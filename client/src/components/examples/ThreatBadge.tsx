import ThreatBadge from "../ThreatBadge";

export default function ThreatBadgeExample() {
  return (
    <div className="flex gap-4 flex-wrap p-6">
      <ThreatBadge level="benign" />
      <ThreatBadge level="suspicious" />
      <ThreatBadge level="malicious" />
      <ThreatBadge level="scanning" />
    </div>
  );
}
