import test from "node:test";
import assert from "node:assert/strict";
import {
  isPrivateOrReservedIPv4,
  isPrivateOrReservedIPv6,
  isPrivateOrReservedIp,
  validateSafeUrl
} from "../server/ssrfValidator";

test("SSRF: IPv4 private and reserved ranges detection", () => {
  // Loopback
  assert.equal(isPrivateOrReservedIPv4("127.0.0.1"), true);
  assert.equal(isPrivateOrReservedIPv4("127.255.255.254"), true);

  // Private classes A, B, C
  assert.equal(isPrivateOrReservedIPv4("10.0.0.1"), true);
  assert.equal(isPrivateOrReservedIPv4("10.254.1.1"), true);
  assert.equal(isPrivateOrReservedIPv4("172.16.0.1"), true);
  assert.equal(isPrivateOrReservedIPv4("172.31.255.255"), true);
  assert.equal(isPrivateOrReservedIPv4("192.168.1.1"), true);
  assert.equal(isPrivateOrReservedIPv4("192.168.100.5"), true);

  // Link-local / Cloud Metadata (169.254.169.254)
  assert.equal(isPrivateOrReservedIPv4("169.254.169.254"), true);
  assert.equal(isPrivateOrReservedIPv4("169.254.0.1"), true);

  // Carrier-grade NAT (100.64.0.0/10)
  assert.equal(isPrivateOrReservedIPv4("100.64.0.1"), true);
  assert.equal(isPrivateOrReservedIPv4("100.127.255.255"), true);

  // Current network & Broadcast
  assert.equal(isPrivateOrReservedIPv4("0.0.0.0"), true);
  assert.equal(isPrivateOrReservedIPv4("255.255.255.255"), true);

  // Multicast
  assert.equal(isPrivateOrReservedIPv4("224.0.0.1"), true);

  // Public IPs must pass as NOT private
  assert.equal(isPrivateOrReservedIPv4("8.8.8.8"), false);
  assert.equal(isPrivateOrReservedIPv4("1.1.1.1"), false);
  assert.equal(isPrivateOrReservedIPv4("142.250.190.46"), false);
});

test("SSRF: IPv6 private and reserved ranges detection", () => {
  // Loopback
  assert.equal(isPrivateOrReservedIPv6("::1"), true);

  // Unspecified
  assert.equal(isPrivateOrReservedIPv6("::"), true);

  // IPv4-mapped IPv6
  assert.equal(isPrivateOrReservedIPv6("::ffff:127.0.0.1"), true);
  assert.equal(isPrivateOrReservedIPv6("::ffff:10.0.0.1"), true);
  assert.equal(isPrivateOrReservedIPv6("::ffff:8.8.8.8"), false);

  // Unique local addresses (fc00::/7)
  assert.equal(isPrivateOrReservedIPv6("fc00::1"), true);
  assert.equal(isPrivateOrReservedIPv6("fd12:3456:789a::1"), true);

  // Link local (fe80::/10)
  assert.equal(isPrivateOrReservedIPv6("fe80::1"), true);

  // Multicast (ff00::/8)
  assert.equal(isPrivateOrReservedIPv6("ff02::1"), true);
});

test("SSRF: isPrivateOrReservedIp routing", () => {
  assert.equal(isPrivateOrReservedIp("127.0.0.1"), true);
  assert.equal(isPrivateOrReservedIp("169.254.169.254"), true);
  assert.equal(isPrivateOrReservedIp("::1"), true);
  assert.equal(isPrivateOrReservedIp("93.184.216.34"), false); // example.com
});

test("SSRF: validateSafeUrl blocks unsafe protocols and localhost", async () => {
  await assert.rejects(
    async () => validateSafeUrl("file:///etc/passwd"),
    /Unsupported URL protocol/
  );

  await assert.rejects(
    async () => validateSafeUrl("ftp://example.com/image.png"),
    /Unsupported URL protocol/
  );

  await assert.rejects(
    async () => validateSafeUrl("javascript:alert(1)"),
    /Unsupported URL protocol/
  );

  await assert.rejects(
    async () => validateSafeUrl("http://localhost:3000/api/secret"),
    /blocked for security/
  );

  await assert.rejects(
    async () => validateSafeUrl("http://127.0.0.1:8080/image.png"),
    /blocked/
  );

  await assert.rejects(
    async () => validateSafeUrl("http://169.254.169.254/latest/meta-data"),
    /blocked/
  );
});
