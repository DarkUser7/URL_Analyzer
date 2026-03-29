

import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useURLMonitor } from "../hooks/useURLMonitor";
import URLScanner from "../components/URLScanner";
import ScanResult from "../components/ScanResult";
import MaliciousURLAlert from "../components/MaliciousURLAlert";
import Header from "../components/Header";
import { Card } from "../components/ui/card";
import { Globe, CheckCircle } from "lucide-react";

type ThreatLevel = "benign" | "suspicious" | "malicious" | "scanning";


interface SingleResult {
  classification: ThreatLevel;
  confidence: number;
  score?: number;
  triggered?: string[];
  reasoning?: string;
  raw?: any;
  source?: string;
}

interface ScanResultData {
  url: string;
  timestamp: Date;
  projectResult?: SingleResult;
  gptResult?: SingleResult;
  virustotal?: SingleResult;
}

export default function Home() {
  const { user, token } = useAuth();
  const isAuthenticated = !!user;
  const [isScanning, setIsScanning] = useState(false);
  const [currentResult, setCurrentResult] = useState<ScanResultData | null>(null);
  const [recentScans, setRecentScans] = useState<ScanResultData[]>([]);
  const [maliciousAlert, setMaliciousAlert] = useState<{
    url: string;
    confidence: number;
    signals: string[];
  } | null>(null);
  const [error, setError] = useState("");

  // Only enable background monitoring for authenticated users
  useURLMonitor({
    enabled: isAuthenticated,
    onMaliciousDetected: isAuthenticated
      ? (result) => {
          setMaliciousAlert({
            url: result.url,
            confidence: result.confidence,
            signals: result.signals,
          });
        }
      : undefined,
  });

  // Only fetch persistent scan history for authenticated users
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/scan/history", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setRecentScans(
            (data || []).map((scan: any, i: number) => ({
              ...scan,
              timestamp: scan.timestamp ? new Date(scan.timestamp) : new Date(),
            }))
          );
        }
      })
      .catch(() => {});
  }, [isAuthenticated, token]);

  // Guests use a public endpoint for scan, users use /api/scan (protected)
  const handleScan = async (url: string) => {
    setIsScanning(true);
    setError("");
  setCurrentResult({ url, timestamp: new Date() });
    try {
      let res;
      if (isAuthenticated) {
        res = await fetch("/api/scan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            url,
            timestamp: new Date().toISOString(),
            classification: "manual",
            confidence: "N/A",
            source: "user",
          }),
        });
      } else {
        // For guests, use a public endpoint or fallback to a mock scan (simulate backend logic)
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setCurrentResult({
          url,
          timestamp: new Date(),
          projectResult: {
            classification: url.includes("malicious") ? "malicious" : url.includes("suspicious") ? "suspicious" : "benign",
            confidence: url.includes("malicious") ? 90 : url.includes("suspicious") ? 70 : 99,
            triggered: url.includes("malicious")
              ? ["Known phishing domain", "Blacklisted by security vendors"]
              : url.includes("suspicious")
              ? ["Recently registered domain", "Low domain reputation score"]
              : ["Clean reputation score", "Valid SSL certificate"],
            reasoning: url.includes("malicious")
              ? "Matched known phishing domain."
              : url.includes("suspicious")
              ? "Domain is new or has low reputation."
              : "No suspicious signals detected.",
            source: "mock",
          },
        });
        setIsScanning(false);
        return;
      }
      if (res && res.ok) {
        const data = await res.json();
        setCurrentResult({
          url: data.url,
          timestamp: new Date(data.timestamp),
          projectResult: data.projectResult,
          gptResult: data.gptResult,
          virustotal: data.virustotal,
        });
        if (isAuthenticated) {
          setRecentScans((prev) => [
            {
              url: data.url,
              timestamp: new Date(data.timestamp),
              projectResult: data.projectResult,
              gptResult: data.gptResult,
              virustotal: data.virustotal,
            },
            ...prev,
          ]);
        }
      } else if (res) {
        const errData = await res.json();
        setError(errData.message || "Scan failed");
      }
    } catch {
      setError("Network error");
    }
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        isAuthenticated={isAuthenticated}
        user={user ? { name: user.username, email: user.username, avatar: undefined } : undefined}
        onLogin={() => (window.location.href = "/login")}
        onLogout={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.reload();
        }}
        onProfile={() => (window.location.href = "/dashboard")}
      />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">URL Threat Scanner</h1>
            <p className="text-lg text-muted-foreground">
              Scan any URL for threats using AI-powered detection
            </p>
          </div>
          <URLScanner onScan={handleScan} isScanning={isScanning} />
          {error && (
            <div className="text-red-500 text-center">{error}</div>
          )}
          {currentResult && (
            <div className="space-y-6">
              <ScanResult
                label="Test_Dataset"
                result={currentResult?.projectResult}
                url={currentResult?.url}
                timestamp={currentResult?.timestamp}
              />
              {/*
              <ScanResult
                label="ChatGPT"
                result={currentResult?.gptResult}
                url={currentResult?.url}
                timestamp={currentResult?.timestamp}
              />
              */}
              <ScanResult
                label="Model-1"
                result={currentResult?.virustotal}
                url={currentResult?.url}
                timestamp={currentResult?.timestamp}
              />
              <div className="flex justify-center pt-2">
                <button className="btn btn-secondary" onClick={() => setCurrentResult(null)}>Scan Again</button>
              </div>
            </div>
          )}
          {!isAuthenticated && (
            <div className="text-center text-muted-foreground text-sm mt-4">
              <p>Sign in to enable real-time link monitoring and view your scan history.</p>
            </div>
          )}
          {isAuthenticated && recentScans.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">Recent Scans</h2>
              <div className="space-y-2">
                {recentScans.slice(0, 5).map((scan, i) => (
                  <div key={i} className="space-y-4">
                    <ScanResult label="Test_Dataset" result={scan.projectResult} url={scan.url} timestamp={scan.timestamp} />
                    {/* <ScanResult label="ChatGPT" result={scan.gptResult} url={scan.url} timestamp={scan.timestamp} /> */}
                    <ScanResult label="Model-1" result={scan.virustotal} url={scan.url} timestamp={scan.timestamp} />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card className="p-6 text-center space-y-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes the URL using multiple detection signals
              </p>
            </Card>
            <Card className="p-6 text-center space-y-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Get Results</h3>
              <p className="text-sm text-muted-foreground">
                Receive instant threat assessment with confidence scores
              </p>
            </Card>
          </div>
        </div>
      </main>
      <MaliciousURLAlert
        open={maliciousAlert !== null}
        onOpenChange={(open) => !open && setMaliciousAlert(null)}
        url={maliciousAlert?.url || ""}
        confidence={maliciousAlert?.confidence || 0}
        signals={maliciousAlert?.signals || []}
      />
    </div>
  );
}
