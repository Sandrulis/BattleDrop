import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getSafeRedirectPath } from "./safe-redirect-path.ts";
import { isBlockedIpAddress } from "./safe-url.ts";

describe("getSafeRedirectPath", () => {
  it("accepts normal in-app paths", () => {
    assert.equal(getSafeRedirectPath("/submit"), "/submit");
    assert.equal(getSafeRedirectPath("/submit?projectId=1"), "/submit?projectId=1");
  });

  it("rejects protocol-relative and external redirects", () => {
    assert.equal(getSafeRedirectPath("//evil.com"), "/");
    assert.equal(getSafeRedirectPath("https://evil.com"), "/");
    assert.equal(getSafeRedirectPath("/\\evil.com"), "/");
  });
});

describe("isBlockedIpAddress", () => {
  it("blocks private and loopback ranges", () => {
    assert.equal(isBlockedIpAddress("127.0.0.1"), true);
    assert.equal(isBlockedIpAddress("10.0.0.5"), true);
    assert.equal(isBlockedIpAddress("192.168.1.10"), true);
    assert.equal(isBlockedIpAddress("169.254.169.254"), true);
    assert.equal(isBlockedIpAddress("::1"), true);
  });

  it("allows public addresses", () => {
    assert.equal(isBlockedIpAddress("8.8.8.8"), false);
    assert.equal(isBlockedIpAddress("1.1.1.1"), false);
  });
});
