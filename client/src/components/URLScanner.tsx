import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Loader2 } from "lucide-react";

interface URLScannerProps {
  onScan: (url: string) => void;
  isScanning?: boolean;
  disabled?: boolean;
}

export default function URLScanner({ onScan, isScanning = false, disabled = false }: URLScannerProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onScan(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-url-scanner">
      <div className="flex gap-3">
        <Input
          type="text"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="font-mono text-base h-12 flex-1"
          disabled={isScanning || disabled}
          data-testid="input-url"
        />
        <Button
          type="submit"
          size="lg"
          disabled={!url.trim() || isScanning || disabled}
          className="px-8"
          data-testid="button-scan"
        >
          {isScanning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Scanning
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Scan URL
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
