import { useEffect, useRef, useState } from "react";

type ThreatLevel = "benign" | "suspicious" | "malicious";

interface ScanResult {
  url: string;
  threatLevel: ThreatLevel;
  confidence: number;
  signals: string[];
  timestamp: Date;
}

interface UseURLMonitorOptions {
  enabled?: boolean;
  onMaliciousDetected?: (result: ScanResult) => void;
  onScanComplete?: (result: ScanResult) => void;
}

// Mock scan function - TODO: replace with actual API call
const scanURL = async (url: string): Promise<ScanResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock different results based on URL patterns
      let threatLevel: ThreatLevel = "benign";
      let confidence = 95;
      let signals: string[] = [
        "Valid SSL certificate detected",
        "Domain age: 5 years",
        "No malicious keywords found",
        "Clean reputation score",
      ];

      // Simulate suspicious URLs
      if (url.includes("suspicious") || url.includes("phishing") || url.includes(".xyz")) {
        threatLevel = "suspicious";
        confidence = 72;
        signals = [
          "Recently registered domain (< 30 days)",
          "Contains suspicious keywords",
          "Low domain reputation score",
        ];
      }

      // Simulate malicious URLs
      if (
        url.includes("malicious") ||
        url.includes("hack") ||
        url.includes("phish") ||
        url.includes("scam")
      ) {
        threatLevel = "malicious";
        confidence = 89;
        signals = [
          "Known phishing domain",
          "Blacklisted by security vendors",
          "SSL certificate mismatch",
          "High entropy in URL structure",
        ];
      }

      resolve({
        url,
        threatLevel,
        confidence,
        signals,
        timestamp: new Date(),
      });
    }, 500);
  });
};

export const useURLMonitor = ({
  enabled = true,
  onMaliciousDetected,
  onScanComplete,
}: UseURLMonitorOptions = {}) => {
  const [scannedURLs] = useState(new Set<string>());
  const observerRef = useRef<MutationObserver | null>(null);

  const scanLink = async (url: string) => {
    // Skip if already scanned
    if (scannedURLs.has(url)) return;

    // Skip internal navigation and anchors
    if (url.startsWith("#") || url.startsWith("javascript:")) return;

    // Skip non-http(s) protocols
    if (!url.startsWith("http://") && !url.startsWith("https://")) return;

    scannedURLs.add(url);

    try {
      const result = await scanURL(url);

      // Log all scans
      console.log(`[URL Monitor] Scanned: ${url} - ${result.threatLevel.toUpperCase()}`);

      // Call the completion callback
      onScanComplete?.(result);

      // Alert if malicious
      if (result.threatLevel === "malicious") {
        console.warn(`[URL Monitor] ⚠️ MALICIOUS URL DETECTED: ${url}`);
        console.warn(`[URL Monitor] Confidence: ${result.confidence}%`);
        console.warn(`[URL Monitor] Signals:`, result.signals);
        onMaliciousDetected?.(result);
      }
    } catch (error) {
      console.error(`[URL Monitor] Error scanning ${url}:`, error);
    }
  };

  const scanAllLinks = () => {
    const links = document.querySelectorAll("a[href]");
    links.forEach((link) => {
      const href = (link as HTMLAnchorElement).href;
      if (href) {
        scanLink(href);
      }
    });
  };

  useEffect(() => {
    if (!enabled) return;

    // Initial scan of existing links
    scanAllLinks();

    // Set up MutationObserver to watch for new links
    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          // Check if the added node is a link
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.tagName === "A") {
              const href = (element as HTMLAnchorElement).href;
              if (href) {
                scanLink(href);
              }
            }
            // Also check for links within the added node
            element.querySelectorAll?.("a[href]").forEach((link) => {
              const href = (link as HTMLAnchorElement).href;
              if (href) {
                scanLink(href);
              }
            });
          }
        });
      });
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [enabled]);

  return { scanAllLinks };
};
