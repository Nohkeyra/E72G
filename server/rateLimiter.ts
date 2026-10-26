import type { Request, Response, NextFunction } from "express";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
}) {
  const { windowMs, maxRequests, message = "Rate limit exceeded. Please wait a moment before retrying." } = options;
  const store = new Map<string, RateLimitRecord>();

  // Cleanup expired entries periodically (every 5 minutes)
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    // Generate client key: check personal API key first (to avoid punishing shared IP), else client IP
    const personalKey = req.headers["x-gemini-api-key"];
    const ip = req.ip || req.socket.remoteAddress || "unknown-ip";
    const clientKey = typeof personalKey === "string" && personalKey.trim()
      ? `key:${personalKey.trim().slice(-8)}`
      : `ip:${ip}`;

    const now = Date.now();
    let record = store.get(clientKey);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      store.set(clientKey, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, maxRequests - record.count);
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));

    if (record.count > maxRequests) {
      res.setHeader("Retry-After", retryAfterSeconds);
      return res.status(429).json({
        error: message,
        retryAfter: retryAfterSeconds
      });
    }

    next();
  };
}
