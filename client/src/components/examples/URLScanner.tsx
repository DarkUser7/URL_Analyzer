import { useState } from "react";
import URLScanner from "../URLScanner";

export default function URLScannerExample() {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = (url: string) => {
    console.log("Scanning URL:", url);
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2000);
  };

  return (
    <div className="p-6 max-w-4xl">
      <URLScanner onScan={handleScan} isScanning={isScanning} />
    </div>
  );
}
