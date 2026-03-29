import ScanResult from "../ScanResult";

export default function ScanResultExample() {
  return (
    <div className="space-y-6 p-6 max-w-4xl">
      <ScanResult
        url="https://safe-website.com"
        threatLevel="benign"
        confidence={95}
        timestamp={new Date()}
        signals={[
          "Valid SSL certificate",
          "Domain age: 5 years",
          "No malicious keywords detected",
          "Clean reputation score",
        ]}
        onScanAgain={() => console.log("Scan again clicked")}
      />
      <ScanResult
        url="https://suspicious-link.xyz/phishing"
        threatLevel="suspicious"
        confidence={72}
        timestamp={new Date(Date.now() - 3600000)}
        signals={[
          "Recently registered domain",
          "Contains suspicious keywords",
          "Low domain reputation",
        ]}
        onScanAgain={() => console.log("Scan again clicked")}
      />
    </div>
  );
}
