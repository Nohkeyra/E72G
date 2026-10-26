import dns from "dns";
import http from "http";
import https from "https";
import { URL } from "url";

/**
 * Checks if an IPv4 address is in private, loopback, link-local, carrier-NAT, or reserved ranges.
 */
export function isPrivateOrReservedIPv4(ip: string): boolean {
  const parts = ip.split(".").map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // Malformed IPv4 is treated as unsafe
  }

  const [b0, b1, b2, b3] = parts;

  // 0.0.0.0/8 (Current network)
  if (b0 === 0) return true;

  // 10.0.0.0/8 (Private-Use)
  if (b0 === 10) return true;

  // 100.64.0.0/10 (Shared Address Space / CGNAT)
  if (b0 === 100 && b1 >= 64 && b1 <= 127) return true;

  // 127.0.0.0/8 (Loopback)
  if (b0 === 127) return true;

  // 169.254.0.0/16 (Link-Local / Cloud Metadata e.g. AWS/GCP 169.254.169.254)
  if (b0 === 169 && b1 === 254) return true;

  // 172.16.0.0/12 (Private-Use)
  if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;

  // 192.0.0.0/24 (IETF Protocol Assignments)
  if (b0 === 192 && b1 === 0 && b2 === 0) return true;

  // 192.0.2.0/24 (TEST-NET-1)
  if (b0 === 192 && b1 === 0 && b2 === 2) return true;

  // 192.88.99.0/24 (6to4 Relay Anycast)
  if (b0 === 192 && b1 === 88 && b2 === 99) return true;

  // 192.168.0.0/16 (Private-Use)
  if (b0 === 192 && b1 === 168) return true;

  // 198.18.0.0/15 (Network Benchmark Tests)
  if (b0 === 198 && (b1 === 18 || b1 === 19)) return true;

  // 198.51.100.0/24 (TEST-NET-2)
  if (b0 === 198 && b1 === 51 && b2 === 100) return true;

  // 203.0.113.0/24 (TEST-NET-3)
  if (b0 === 203 && b1 === 0 && b2 === 113) return true;

  // 224.0.0.0/4 (Multicast)
  if (b0 >= 224 && b0 <= 239) return true;

  // 240.0.0.0/4 (Reserved / Future use)
  if (b0 >= 240) return true;

  // 255.255.255.255 (Broadcast)
  if (b0 === 255 && b1 === 255 && b2 === 255 && b3 === 255) return true;

  return false;
}

/**
 * Checks if an IPv6 address is loopback, unique local, link-local, or IPv4-mapped.
 */
export function isPrivateOrReservedIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase().trim();

  // Unspecified ::
  if (normalized === "::" || normalized === "0000:0000:0000:0000:0000:0000:0000:0000") return true;

  // Loopback ::1
  if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") return true;

  // IPv4-mapped IPv6 (::ffff:127.0.0.1)
  const mappedMatch = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)/);
  if (mappedMatch) {
    return isPrivateOrReservedIPv4(mappedMatch[1]);
  }

  // Unique Local Address (ULA) fc00::/7 (fc00... or fd00...)
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;

  // Link-Local fe80::/10 (fe8, fe9, fea, feb)
  if (/^fe[89ab]/i.test(normalized)) return true;

  // Multicast ff00::/8
  if (normalized.startsWith("ff")) return true;

  // Documentation 2001:db8::/32
  if (normalized.startsWith("2001:db8:") || normalized.startsWith("2001:0db8:")) return true;

  // Discard 100::/64
  if (normalized.startsWith("100:")) return true;

  return false;
}

/**
 * Determines whether an IP address (v4 or v6) is private or reserved.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  if (ip.includes(":")) {
    return isPrivateOrReservedIPv6(ip);
  }
  return isPrivateOrReservedIPv4(ip);
}

/**
 * Validates a remote URL and verifies all resolved IP addresses are safe public destinations.
 */
export async function validateSafeUrl(urlString: string): Promise<URL> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlString);
  } catch {
    throw new Error("Invalid URL format");
  }

  // Protocol must be HTTP or HTTPS
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error(`Unsupported URL protocol: '${parsedUrl.protocol}'. Only http: and https: are allowed.`);
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Basic check on localhost aliases
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    throw new Error("Access to local destinations is blocked for security.");
  }

  // Resolve hostname via DNS
  let records: dns.LookupAddress[];
  try {
    records = await dns.promises.lookup(hostname, { all: true });
  } catch (err: unknown) {
    throw new Error(`Failed to resolve host '${hostname}': ${(err as Error).message}`);
  }

  if (!records || records.length === 0) {
    throw new Error(`No DNS records found for host '${hostname}'`);
  }

  for (const record of records) {
    if (isPrivateOrReservedIp(record.address)) {
      throw new Error(`Access to destination IP ${record.address} is blocked (private/reserved address).`);
    }
  }

  return parsedUrl;
}

export interface SafeFetchResult {
  buffer: Buffer;
  contentType: string;
}

/**
 * Safely fetches a remote image with strict SSRF protections:
 * - Validates destination protocol and resolved IPs
 * - Follows up to maxRedirects, re-validating each hop
 * - Enforces timeout and max response size
 * - Validates image content-type
 */
export async function fetchSafeImage(
  initialUrl: string,
  options: {
    maxBytes?: number;
    timeoutMs?: number;
    maxRedirects?: number;
  } = {}
): Promise<SafeFetchResult> {
  const maxBytes = options.maxBytes ?? 20 * 1024 * 1024; // 20 MB max
  const timeoutMs = options.timeoutMs ?? 10000; // 10s
  const maxRedirects = options.maxRedirects ?? 3;

  let currentUrl = initialUrl;
  let redirectsRemaining = maxRedirects;

  while (true) {
    const validatedUrl = await validateSafeUrl(currentUrl);

    const client = validatedUrl.protocol === "https:" ? https : http;

    const result = await new Promise<SafeFetchResult | { redirectUrl: string }>((resolve, reject) => {
      const req = client.get(
        validatedUrl,
        {
          timeout: timeoutMs,
          headers: {
            "User-Agent": "Elite72-DesignIntelligence/1.0",
            Accept: "image/*"
          }
        },
        (res) => {
          // Handle redirects
          if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode)) {
            const location = res.headers.location;
            if (!location) {
              res.resume();
              return reject(new Error(`Redirect response missing Location header (status ${res.statusCode})`));
            }
            const nextUrl = new URL(location, validatedUrl).toString();
            res.resume();
            return resolve({ redirectUrl: nextUrl });
          }

          if (res.statusCode !== 200) {
            res.resume();
            return reject(new Error(`Remote image server responded with status ${res.statusCode}`));
          }

          const rawContentType = (res.headers["content-type"] || "").toLowerCase();
          const mime = rawContentType.split(";")[0].trim();
          const validMimes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/avif",
            "image/svg+xml"
          ];

          if (!mime.startsWith("image/") && !validMimes.includes(mime)) {
            res.resume();
            return reject(new Error(`Invalid content type '${rawContentType}'. Expected an image format.`));
          }

          const contentLengthHeader = res.headers["content-length"];
          if (contentLengthHeader) {
            const len = parseInt(contentLengthHeader, 10);
            if (!isNaN(len) && len > maxBytes) {
              res.resume();
              return reject(new Error(`Remote image exceeds maximum allowed size of ${maxBytes} bytes.`));
            }
          }

          const chunks: Buffer[] = [];
          let totalBytes = 0;

          res.on("data", (chunk: Buffer) => {
            totalBytes += chunk.length;
            if (totalBytes > maxBytes) {
              req.destroy();
              return reject(new Error(`Image download exceeded size limit of ${maxBytes} bytes.`));
            }
            chunks.push(chunk);
          });

          res.on("end", () => {
            resolve({
              buffer: Buffer.concat(chunks),
              contentType: mime
            });
          });

          res.on("error", (err) => {
            reject(err);
          });
        }
      );

      req.on("timeout", () => {
        req.destroy();
        reject(new Error(`Request timed out after ${timeoutMs}ms`));
      });

      req.on("error", (err) => {
        reject(err);
      });
    });

    if ("redirectUrl" in result) {
      if (redirectsRemaining <= 0) {
        throw new Error("Too many redirects encountered while fetching reference image.");
      }
      redirectsRemaining -= 1;
      currentUrl = result.redirectUrl;
      continue;
    }

    return result;
  }
}
