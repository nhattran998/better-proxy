import { describe, it, expect } from "vitest";
import {
  getProviderAdapter,
  getAvailableProviders,
  hasProvider,
} from "#/modules/providers/domain/provider.factory";

describe("Provider Factory", () => {
  it("should return available providers", () => {
    const providers = getAvailableProviders();

    expect(providers).toContain("claude");
    expect(providers).toContain("codex");
    expect(providers).toContain("opencode");
    expect(providers).toContain("deepseek");
    expect(providers).toContain("glm");
    expect(providers).toHaveLength(5);
  });

  it("should check if provider exists", () => {
    expect(hasProvider("claude")).toBe(true);
    expect(hasProvider("unknown")).toBe(false);
  });

  it("should get claude adapter", () => {
    const adapter = getProviderAdapter("claude");

    expect(adapter.id).toBe("claude");
    expect(adapter.name).toBe("Claude (Anthropic)");
    expect(adapter.authType).toBe("api_key");
    expect(adapter.models.length).toBeGreaterThan(0);
  });

  it("should get codex adapter", () => {
    const adapter = getProviderAdapter("codex");

    expect(adapter.id).toBe("codex");
    expect(adapter.authType).toBe("oauth");
  });

  it("should get opencode adapter", () => {
    const adapter = getProviderAdapter("opencode");

    expect(adapter.id).toBe("opencode");
    expect(adapter.authType).toBe("none");
  });

  it("should throw for unknown provider", () => {
    expect(() => getProviderAdapter("unknown")).toThrow("Unknown provider: unknown");
  });

  it("should return same instance for same provider", () => {
    const a1 = getProviderAdapter("claude");
    const a2 = getProviderAdapter("claude");

    expect(a1).toBe(a2);
  });
});
