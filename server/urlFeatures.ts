import { URL } from "url";
import dns from "dns/promises";
import whois from "whois-json";

export interface URLFeatures {
  normalized: string;
  scheme: string;
  host: string;
  domain: string;
  subdomain: string;
  path: string;
  query: string;
  port: string;
  fragment: string;
  credentials: string;
  lexical: Record<string, any>;
  dns: Record<string, any>;
  whois: Record<string, any>;
  reputation: Record<string, any>;
  content: Record<string, any>;
  redirectionChain: string[];
}

export async function extractURLFeatures(inputUrl: string): Promise<URLFeatures> {
  // 1. Input & normalization
  let url: URL;
  try {
    url = new URL(inputUrl);
  } catch {
    throw new Error("Invalid URL");
  }
  // Normalize
  let normalized = url.toString();
  normalized = normalized.replace(/#.*$/, ""); // Remove fragment
  normalized = normalized.replace(/:80\//, "/"); // Remove default port
  // Canonicalize www
  let host = url.hostname.toLowerCase();
  if (host.startsWith("www.")) host = host.slice(4);
  // Credentials
  const credentials = url.username || url.password ? `${url.username}:${url.password}` : "";
  // Redirection chain (placeholder)
  const redirectionChain = [normalized];

  // 2. Parse components
  const scheme = url.protocol.replace(":", "");
  const path = url.pathname;
  const query = url.search;
  const port = url.port;
  const fragment = url.hash;
  // Domain/subdomain
  const parts = host.split(".");
  const domain = parts.slice(-2).join(".");
  const subdomain = parts.length > 2 ? parts.slice(0, -2).join(".") : "";

  // 3. Lexical features
  const lexical = {
    urlLength: normalized.length,
    hostLength: host.length,
    pathLength: path.length,
    numDots: (host.match(/\./g) || []).length,
    numHyphens: (host.match(/-/g) || []).length,
    numDigits: (host.match(/[0-9]/g) || []).length,
    numSubdomains: subdomain ? subdomain.split(".").length : 0,
    pathDepth: path.split("/").filter(Boolean).length,
    hasSuspiciousToken: /login|secure|update|verify|account|bank|signin|password/i.test(normalized),
    usesIP: /^\d+\.\d+\.\d+\.\d+$/.test(host),
    entropy: entropy(host),
  };

  // 4. DNS/WHOIS features
  let dnsInfo: Record<string, any> = {};
  let whoisInfo: Record<string, any> = {};
  try {
    dnsInfo = await dns.lookup(host);
    whoisInfo = await whois(host);
  } catch {}

  // 5. Reputation (placeholder)
  const reputation = {};

  // 6. Content (placeholder)
  const content = {};

  return {
    normalized,
    scheme,
    host,
    domain,
    subdomain,
    path,
    query,
    port,
    fragment,
    credentials,
    lexical,
    dns: dnsInfo,
    whois: whoisInfo,
    reputation,
    content,
    redirectionChain,
  };
}

function entropy(str: string): number {
  const map: Record<string, number> = {};
  for (const c of str) map[c] = (map[c] || 0) + 1;
  let e = 0;
  for (const k in map) {
    const p = map[k] / str.length;
    e -= p * Math.log2(p);
  }
  return e;
}
