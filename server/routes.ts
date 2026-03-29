

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { users, InsertUser, insertScanResultSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import { scanStorage } from "./scanStorage";
import { extractURLFeatures } from "./urlFeatures";
import { scoreURL } from "./urlScoring";
import fs from "fs";
// Load dataset from file or URL if DATASET env is set
let dataset: Record<string, any> = {};
async function loadDataset() {
  if (!process.env.DATASET) return;
  try {
    let rawData;
    if (/^https?:\/\//i.test(process.env.DATASET)) {
      // Load from URL
      const res = await fetch(process.env.DATASET);
      if (!res.ok) throw new Error(`Failed to fetch dataset: ${res.status}`);
      rawData = await res.text();
    } else {
      // Load from file
      rawData = fs.readFileSync(process.env.DATASET, "utf-8");
    }
    // Try to parse as JSON first
    let parsed;
    try {
      parsed = JSON.parse(rawData);
      // JSON format: { url: label }
      dataset = Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k.toLowerCase(), v]));
      console.log("JSON dataset loaded, entries:", Object.keys(dataset).length);
      return;
    } catch (e) {
      // Not JSON, try CSV
    }
    // CSV support for 'Phishing URLs.csv' (url,Type) format
    const lines = rawData.split(/\r?\n/).filter(Boolean);
    if (lines.length > 1 && lines[0].toLowerCase().includes('url')) {
      dataset = {};
      for (let i = 1; i < lines.length; ++i) {
        const [url, type] = lines[i].split(/,(.+)/); // split on first comma
        if (url && type && type.trim().toLowerCase().startsWith('phishing')) {
          dataset[url.trim().toLowerCase()] = 'phishing';
        }
      }
      console.log("CSV phishing URL dataset loaded, entries:", Object.keys(dataset).length);
      return;
    }
    throw new Error("Unknown dataset format");
  } catch (err) {
    console.error("Failed to load dataset from", process.env.DATASET, err);
    dataset = {};
  }
}
// Immediately invoke loader (async in top-level for ESM)
// (dataset is loaded in registerRoutes)
import fetch from "node-fetch";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User login endpoint
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Missing username or password" });
      }
      const user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.username, username) });
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || "devsecret", { expiresIn: "7d" });
      return res.status(200).json({ token, user: { id: user.id, username: user.username, email: user.email, info: user.info } });
    } catch (err) {
      console.error("/api/login error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  // Load dataset before registering routes
  await loadDataset();
  // User registration with validation and error handling
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        username: z.string().min(3).max(32),
        password: z.string().min(6).max(128),
        email: z.string().email().optional(),
        info: z.string().max(256).optional(),
      });
      const { username, password, email, info } = schema.parse(req.body);
      const existing = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.username, username) });
      if (existing) {
        return res.status(409).json({ message: "Username already taken" });
      }
      const hashed = await bcrypt.hash(password, 10);
      const [user] = await db.insert(users).values({ username, password: hashed, email, info }).returning();
      return res.status(201).json({ id: user.id, username: user.username, email: user.email, info: user.info });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: err.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update user profile (email, info, name)
  app.post("/api/scan", authMiddleware, async (req: Request & { user?: any }, res: Response) => {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ message: "Missing URL" });

      // 0. Project logic (dataset or robust heuristics)
      let features = null;
      let projectResult = null;
      const suspiciousKeywords = [
        "login", "verify", "update", "secure", "account", "bank", "webscr", "ebayisapi", "signin", "wp-admin", "confirm", "pay", "password", "admin", "auth", "validate", "reset"
      ];
      const suspiciousTLDs = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".work", ".support", ".info", ".club"];
      const urlObj = (() => { try { return new URL(url); } catch { return null; } })();
      if (dataset && Object.keys(dataset).length > 0) {
        const urlKey = url.trim().toLowerCase();
        const datasetMatch = dataset[urlKey];
        console.log("[SCAN DEBUG] Incoming URL:", url);
        console.log("[SCAN DEBUG] Normalized key:", urlKey);
        console.log("[SCAN DEBUG] Dataset match:", datasetMatch);
        if (datasetMatch) {
          // Set phishing result if matched in dataset, but do not short-circuit
          projectResult = {
            classification: "phishing",
            confidence: 99,
            score: 0.99,
            triggered: ["Matched in dataset"],
            reasoning: "Matched in dataset as phishing.",
            source: "dataset",
            label: "Test_Dataset"
          };
        }
      }
      if (!projectResult && urlObj) {
        // Heuristic rules
        let reasons = [];
        let score = 0;
        // 1. Suspicious keywords in path or hostname
        const lowerUrl = url.toLowerCase();
        const keywordHits = suspiciousKeywords.filter(k => lowerUrl.includes(k));
        if (keywordHits.length > 0) {
          score += 30;
          reasons.push(`Contains suspicious keywords: ${keywordHits.join(", ")}`);
        }
        // 2. Excessive subdomains
        const subdomainCount = urlObj.hostname.split(".").length - 2;
        if (subdomainCount > 2) {
          score += 20;
          reasons.push("Excessive subdomains");
        }
        // 3. Uses IP address
        if (/^\d+\.\d+\.\d+\.\d+$/.test(urlObj.hostname)) {
          score += 40;
          reasons.push("Uses IP address as hostname");
        }
        // 4. Suspicious TLD
        if (suspiciousTLDs.some(tld => urlObj.hostname.endsWith(tld))) {
          score += 20;
          reasons.push("Suspicious top-level domain");
        }
        // 5. Uses URL shortener
        const shorteners = ["bit.ly", "goo.gl", "tinyurl.com", "ow.ly", "t.co", "is.gd", "buff.ly", "adf.ly", "bit.do", "cutt.ly", "shorte.st", "mcaf.ee", "rebrand.ly"];
        if (shorteners.some(s => urlObj.hostname.includes(s))) {
          score += 30;
          reasons.push("Uses known URL shortener");
        }
        // 6. Long URL
        if (url.length > 75) {
          score += 10;
          reasons.push("Unusually long URL");
        }
        // 7. HTTPS missing
        if (urlObj.protocol !== "https:") {
          score += 10;
          reasons.push("Does not use HTTPS");
        }
        // 8. Hyphens in domain
        if (urlObj.hostname.includes("-")) {
          score += 10;
          reasons.push("Hyphens in domain");
        }
        // Final classification: confidence <30 benign, 30-59 suspicious, 60+ malicious
        // Check PhishTank dataset for known phishing URLs
        let inDataset = false;
        if (dataset && typeof dataset === 'object') {
          inDataset = !!(dataset[url] || dataset[url.toLowerCase()]);
        }
        let projConfidence = Math.min(score, 99);
        let projClassification = "benign";
        let projReasoning = reasons.length > 0 ? reasons.join("; ") : "No suspicious features detected.";
        let projTriggered = reasons;
        if (inDataset) {
          projClassification = "phishing";
          projConfidence = 99;
          projReasoning = "Matched in dataset as phishing.";
          projTriggered = ["Matched in dataset"];
        } else if (projConfidence >= 60) {
          projClassification = "malicious";
        } else if (projConfidence >= 30) {
          projClassification = "suspicious";
        }
        projectResult = {
          classification: projClassification,
          confidence: projConfidence,
          score: projConfidence / 100,
          triggered: projTriggered,
          reasoning: projReasoning,
          source: inDataset ? "heuristics+dataset" : "heuristics",
          label: projClassification === "benign" ? "Benign" : (projClassification.charAt(0).toUpperCase() + projClassification.slice(1))
        };
                // Final classification: confidence <30 benign, 30-59 suspicious, 60+ malicious
                let confidence = Math.min(score, 99);
                let classification = "benign";
                if (confidence >= 60) classification = "malicious";
                else if (confidence >= 30) classification = "suspicious";
                projectResult = {
                  classification,
                  confidence,
                  score: confidence / 100,
                  triggered: reasons,
                  reasoning: reasons.length > 0 ? reasons.join("; ") : "No suspicious features detected.",
                  source: "heuristics"
                };
      }

      // 1. ChatGPT
      let gptResult = null;
      try {
        const prompt = `You are a cybersecurity AI. Analyze the following URL and classify it as 'benign', 'suspicious', or 'malicious'. Provide a confidence score (0-100) and a short reasoning.\nURL: ${url}`;
        const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.CHATGPT_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              { role: "system", content: "You are a cybersecurity AI assistant." },
              { role: "user", content: prompt },
            ],
            max_tokens: 256,
            temperature: 0.2,
          }),
        });
        if (gptRes.ok) {
          const gptData = await gptRes.json();
          const content = gptData.choices?.[0]?.message?.content || "";
          const match = content.match(/Classification:\s*(benign|suspicious|malicious)[\s\S]*?Confidence:\s*(\d+)[\s\S]*?Reasoning:\s*([\s\S]*)/i);
          if (match) {
            gptResult = {
              classification: match[1].toLowerCase(),
              confidence: parseInt(match[2]),
              score: parseInt(match[2]) / 100,
              triggered: [],
              reasoning: match[3].trim(),
              raw: content,
              source: "gpt"
            };
          }
        } else {
          console.error("ChatGPT API error:", await gptRes.text());
        }
      } catch (gptErr) {
        console.error("ChatGPT API call failed:", gptErr);
      }

      // 2. VirusTotal
      let vtResult = null;
      try {
        const vtApiKey = process.env.VIRUSTOTAL_API_KEY || "";
        const vtRes = await fetch(`https://www.virustotal.com/api/v3/urls`, {
          method: "POST",
          headers: {
            "x-apikey": vtApiKey,
            "Content-Type": "application/x-www-form-urlencoded",
          } as any,
          body: `url=${encodeURIComponent(url)}`,
        });
        if (vtRes.ok) {
          const vtData = await vtRes.json();
          const vtId = vtData.data?.id;
          if (vtId) {
            // Polling logic for VirusTotal verdict
            const pollInterval = 5000; // 5 seconds
            const maxWait = 60000; // 60 seconds
            let waited = 0;
            let finalReport = null;
            let vtDataAttr = null;
            let stats = null;
            let results = null;
            while (waited <= maxWait) {
              const reportRes = await fetch(`https://www.virustotal.com/api/v3/analyses/${vtId}`, {
                headers: { "x-apikey": vtApiKey } as any,
              });
              if (reportRes.ok) {
                const report = await reportRes.json();
                vtDataAttr = report.data?.attributes || {};
                if (vtDataAttr.status === "completed") {
                  finalReport = report;
                  stats = vtDataAttr.stats;
                  results = vtDataAttr.results || {};
                  break;
                }
              }
              await new Promise((resolve) => setTimeout(resolve, pollInterval));
              waited += pollInterval;
            }
            if (finalReport && stats && results) {
              let vtClassification = "benign";
              let vtConfidence = 99;
              let vtReasoning = "No VirusTotal engines flagged as malicious, suspicious, or phishing.";
              let vtTriggered = ["No VirusTotal engines flagged"];

              // Check all engine verdicts for any malicious/suspicious category
              let flaggedEngines: string[] = [];
              const maliciousCategories = ["malicious", "phishing", "suspicious", "spam", "malware", "blacklist"];
              for (const [engine, verdict] of Object.entries(results)) {
                const v = verdict as any;
                const category = v.category?.toLowerCase?.() || "";
                if (maliciousCategories.includes(category)) {
                  flaggedEngines.push(`${engine}: ${category}`);
                }
              }

              if (flaggedEngines.length > 0) {
                vtClassification = "malicious";
                vtConfidence = 95;
                vtReasoning = `Flagged as malicious/suspicious by: ${flaggedEngines.join(", ")}`;
                vtTriggered = flaggedEngines;
              } else if (stats && typeof stats.suspicious === 'number' && stats.suspicious > 0) {
                vtClassification = "suspicious";
                vtConfidence = 70;
                vtReasoning = `Flagged by ${stats.suspicious} VirusTotal engines as suspicious.`;
                vtTriggered = ["VirusTotal engines flagged as suspicious"];
              }
              vtResult = {
                classification: vtClassification,
                confidence: vtConfidence,
                score: vtConfidence / 100,
                triggered: vtTriggered,
                reasoning: vtReasoning,
                raw: finalReport,
                source: "virustotal"
              };
            }
          }
        } else {
          console.error("VirusTotal API error:", await vtRes.text());
        }
      } catch (vtErr) {
        console.error("VirusTotal API call failed:", vtErr);
      }

      // Save the main result (projectResult) to DB
      const scanData = {
        url: url,
        timestamp: new Date().toISOString(),
        classification: projectResult?.classification || "benign",
        confidence: projectResult?.confidence?.toString() || "0",
        source: projectResult?.source || "ai",
        userId: req.user.id,
      };
      let result;
      try {
        result = await scanStorage.createScanResult(scanData);
      } catch (dbErr) {
        console.error("DB error on scan result:", dbErr);
        return res.status(500).json({ message: "Database error" });
      }

      // Return all three results for frontend display
      return res.status(201).json({
        ...result,
        features,
        projectResult,
        gptResult,
        virustotal: vtResult ? { ...vtResult, label: "Model-1" } : null,
      });
    } catch (err) {
      console.error("/api/scan error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
// (Removed duplicate and broken code blocks from previous merges. Only one correct /api/scan endpoint remains above.)

  // Get scan history for user (protected, with error handling)
  app.get("/api/scan/history", authMiddleware, async (req: Request & { user?: any }, res: Response) => {
    try {
      const results = await scanStorage.getUserScanResults(req.user.id);
      return res.json(results);
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
// End of file

// JWT auth middleware
function authMiddleware(req: Request & { user?: any }, res: Response, next: Function) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
}
