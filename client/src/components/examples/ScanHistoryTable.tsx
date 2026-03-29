import ScanHistoryTable from "../ScanHistoryTable";

export default function ScanHistoryTableExample() {
  const mockScans = [
    {
      id: "1",
      url: "https://google.com",
      threatLevel: "benign" as const,
      confidence: 98,
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: "2",
      url: "https://suspicious-website.xyz/login",
      threatLevel: "suspicious" as const,
      confidence: 75,
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "3",
      url: "https://malicious-phishing-site.com/secure",
      threatLevel: "malicious" as const,
      confidence: 92,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
  ];

  return (
    <div className="p-6">
      <ScanHistoryTable
        scans={mockScans}
        onRowClick={(scan) => console.log("Clicked scan:", scan)}
      />
    </div>
  );
}
