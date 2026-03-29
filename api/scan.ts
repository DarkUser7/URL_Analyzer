
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../server/db';
import { scanStorage } from '../server/scanStorage';
import { extractURLFeatures } from '../server/urlFeatures';
import { scoreURL } from '../server/urlScoring';
import fs from 'fs';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

let dataset: Record<string, any> = {};
let datasetLoaded = false;
async function loadDataset() {
  if (!process.env.DATASET) return;
  try {
    let rawData;
    if (/^https?:\/\//i.test(process.env.DATASET)) {
      const res = await fetch(process.env.DATASET);
      if (!res.ok) throw new Error(`Failed to fetch dataset: ${res.status}`);
      rawData = await res.text();
    } else {
      rawData = fs.readFileSync(process.env.DATASET, 'utf-8');
    }
    let parsed;
    try {
      parsed = JSON.parse(rawData);
      dataset = Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k.toLowerCase(), v]));
      return;
    } catch (e) {}
    const lines = rawData.split(/\r?\n/).filter(Boolean);
    if (lines.length > 1 && lines[0].toLowerCase().includes('url')) {
      dataset = {};
      for (let i = 1; i < lines.length; ++i) {
        const [url, type] = lines[i].split(/,(.+)/);
        if (url && type && type.trim().toLowerCase().startsWith('phishing')) {
          dataset[url.trim().toLowerCase()] = 'phishing';
        }
      }
      return;
    }
    throw new Error('Unknown dataset format');
  } catch (err) {
    dataset = {};
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!datasetLoaded) {
    await loadDataset();
    datasetLoaded = true;
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  // JWT auth (Authorization: Bearer ...)
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }
  let userId: string | undefined;
  try {
    const token = auth.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    if (typeof payload === 'string') {
      // Not expected, but fallback
      userId = payload;
    } else if (typeof payload === 'object' && payload && 'id' in payload) {
      userId = (payload as any).id;
    }
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
  if (!userId) {
    return res.status(401).json({ message: 'Invalid token payload' });
  }
  const { url } = req.body;
  if (!url) return res.status(400).json({ message: 'Missing URL' });

  // 0. Project logic (dataset or robust heuristics)
  let features = null;
  let projectResult = null;
  const suspiciousKeywords = [
    'login', 'verify', 'update', 'secure', 'account', 'bank', 'webscr', 'ebayisapi', 'signin', 'wp-admin', 'confirm', 'pay', 'password', 'admin', 'auth', 'validate', 'reset'
  ];
  const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work', '.support', '.info', '.club'];
  const urlObj = (() => { try { return new URL(url); } catch { return null; } })();
  if (dataset && Object.keys(dataset).length > 0) {
    const urlKey = url.trim().toLowerCase();
    const datasetMatch = dataset[urlKey];
    if (datasetMatch) {
      projectResult = {
        classification: 'phishing',
        confidence: 99,
        score: 0.99,
        triggered: ['Matched in dataset'],
        reasoning: 'Matched in dataset as phishing.',
        source: 'dataset',
        label: 'Test_Dataset'
      };
    }
  }
  if (!projectResult && urlObj) {
    // Heuristic rules
    let reasons = [];
    let score = 0;
    const lowerUrl = url.toLowerCase();
    const keywordHits = suspiciousKeywords.filter(k => lowerUrl.includes(k));
    if (keywordHits.length > 0) {
      score += 30;
      reasons.push(`Contains suspicious keywords: ${keywordHits.join(', ')}`);
    }
    const subdomainCount = urlObj.hostname.split('.').length - 2;
    if (subdomainCount > 2) {
      score += 20;
      reasons.push('Excessive subdomains');
    }
    if (/^\d+\.\d+\.\d+\.\d+$/.test(urlObj.hostname)) {
      score += 40;
      reasons.push('Uses IP address as hostname');
    }
    if (suspiciousTLDs.some(tld => urlObj.hostname.endsWith(tld))) {
      score += 20;
      reasons.push('Suspicious top-level domain');
    }
    const shorteners = ['bit.ly', 'goo.gl', 'tinyurl.com', 'ow.ly', 't.co', 'is.gd', 'buff.ly', 'adf.ly', 'bit.do', 'cutt.ly', 'shorte.st', 'mcaf.ee', 'rebrand.ly'];
    if (shorteners.some(s => urlObj.hostname.includes(s))) {
      score += 30;
      reasons.push('Uses known URL shortener');
    }
    if (url.length > 75) {
      score += 10;
      reasons.push('Unusually long URL');
    }
    if (urlObj.protocol !== 'https:') {
      score += 10;
      reasons.push('Does not use HTTPS');
    }
    if (urlObj.hostname.includes('-')) {
      score += 10;
      reasons.push('Hyphens in domain');
    }
    let inDataset = false;
    if (dataset && typeof dataset === 'object') {
      inDataset = !!(dataset[url] || dataset[url.toLowerCase()]);
    }
    let projConfidence = Math.min(score, 99);
    let projClassification = 'benign';
    let projReasoning = reasons.length > 0 ? reasons.join('; ') : 'No suspicious features detected.';
    let projTriggered = reasons;
    if (inDataset) {
      projClassification = 'phishing';
      projConfidence = 99;
      projReasoning = 'Matched in dataset as phishing.';
      projTriggered = ['Matched in dataset'];
    } else if (projConfidence >= 60) {
      projClassification = 'malicious';
    } else if (projConfidence >= 30) {
      projClassification = 'suspicious';
    }
    projectResult = {
      classification: projClassification,
      confidence: projConfidence,
      score: projConfidence / 100,
      triggered: projTriggered,
      reasoning: projReasoning,
      source: inDataset ? 'heuristics+dataset' : 'heuristics',
      label: projClassification === 'benign' ? 'Benign' : (projClassification.charAt(0).toUpperCase() + projClassification.slice(1))
    };
  }

  // 1. ChatGPT (optional, can be removed if not needed)
  let gptResult = null;
  try {
    const prompt = `You are a cybersecurity AI. Analyze the following URL and classify it as 'benign', 'suspicious', or 'malicious'. Provide a confidence score (0-100) and a short reasoning.\nURL: ${url}`;
    const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a cybersecurity AI assistant.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 256,
        temperature: 0.2,
      }),
    });
    if (gptRes.ok) {
      const gptData = await gptRes.json();
      const content = gptData.choices?.[0]?.message?.content || '';
      const match = content.match(/Classification:\s*(benign|suspicious|malicious)[\s\S]*?Confidence:\s*(\d+)[\s\S]*?Reasoning:\s*([\s\S]*)/i);
      if (match) {
        gptResult = {
          classification: match[1].toLowerCase(),
          confidence: parseInt(match[2]),
          score: parseInt(match[2]) / 100,
          triggered: [],
          reasoning: match[3].trim(),
          raw: content,
          source: 'gpt'
        };
      }
    }
  } catch {}

  // 2. VirusTotal
  let vtResult = null;
  try {
    const vtApiKey = process.env.VIRUSTOTAL_API_KEY || '';
    const vtRes = await fetch('https://www.virustotal.com/api/v3/urls', {
      method: 'POST',
      headers: {
        'x-apikey': vtApiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      } as any,
      body: `url=${encodeURIComponent(url)}`,
    });
    if (vtRes.ok) {
      const vtData = await vtRes.json();
      const vtId = vtData.data?.id;
      if (vtId) {
        const pollInterval = 5000;
        const maxWait = 60000;
        let waited = 0;
        let finalReport = null;
        let vtDataAttr = null;
        let stats = null;
        let results = null;
        while (waited <= maxWait) {
          const reportRes = await fetch(`https://www.virustotal.com/api/v3/analyses/${vtId}`, {
            headers: { 'x-apikey': vtApiKey } as any,
          });
          if (reportRes.ok) {
            const report = await reportRes.json();
            vtDataAttr = report.data?.attributes || {};
            if (vtDataAttr.status === 'completed') {
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
          let vtClassification = 'benign';
          let vtConfidence = 99;
          let vtReasoning = 'No VirusTotal engines flagged as malicious, suspicious, or phishing.';
          let vtTriggered = ['No VirusTotal engines flagged'];
          let flaggedEngines: string[] = [];
          const maliciousCategories = ['malicious', 'phishing', 'suspicious', 'spam', 'malware', 'blacklist'];
          for (const [engine, verdict] of Object.entries(results)) {
            const v = verdict as any;
            const category = v.category?.toLowerCase?.() || '';
            if (maliciousCategories.includes(category)) {
              flaggedEngines.push(`${engine}: ${category}`);
            }
          }
          if (flaggedEngines.length > 0) {
            vtClassification = 'malicious';
            vtConfidence = 95;
            vtReasoning = `Flagged as malicious/suspicious by: ${flaggedEngines.join(', ')}`;
            vtTriggered = flaggedEngines;
          } else if (stats && typeof stats.suspicious === 'number' && stats.suspicious > 0) {
            vtClassification = 'suspicious';
            vtConfidence = 70;
            vtReasoning = `Flagged by ${stats.suspicious} VirusTotal engines as suspicious.`;
            vtTriggered = ['VirusTotal engines flagged as suspicious'];
          }
          vtResult = {
            classification: vtClassification,
            confidence: vtConfidence,
            score: vtConfidence / 100,
            triggered: vtTriggered,
            reasoning: vtReasoning,
            raw: finalReport,
            source: 'virustotal'
          };
        }
      }
    }
  } catch {}

  // Save the main result (projectResult) to DB
  const scanData = {
    url: url,
    timestamp: new Date().toISOString(),
    classification: projectResult?.classification || 'benign',
    confidence: projectResult?.confidence?.toString() || '0',
    source: projectResult?.source || 'ai',
    userId: userId,
  };
  let result;
  try {
    result = await scanStorage.createScanResult(scanData);
  } catch (dbErr) {
    return res.status(500).json({ message: 'Database error' });
  }

  // Return all three results for frontend display
  return res.status(201).json({
    ...result,
    features,
    projectResult,
    gptResult,
    virustotal: vtResult ? { ...vtResult, label: 'Model-1' } : null,
  });
}
