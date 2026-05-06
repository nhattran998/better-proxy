import type { IProviderAdapter } from "./provider.interface";
import { ClaudeAdapter } from "../infrastructure/adapters/claude.adapter";
import { CodexAdapter } from "../infrastructure/adapters/codex.adapter";
import { OpenCodeAdapter } from "../infrastructure/adapters/opencode.adapter";
import { DeepseekAdapter } from "../infrastructure/adapters/deepseek.adapter";
import { GlmAdapter } from "../infrastructure/adapters/glm.adapter";

type ProviderConstructor = new () => IProviderAdapter;

const adapters: Record<string, ProviderConstructor> = {
  claude: ClaudeAdapter,
  codex: CodexAdapter,
  opencode: OpenCodeAdapter,
  deepseek: DeepseekAdapter,
  glm: GlmAdapter,
};

const instances = new Map<string, IProviderAdapter>();

export function getProviderAdapter(providerId: string): IProviderAdapter {
  const existing = instances.get(providerId);
  if (existing) return existing;

  const Adapter = adapters[providerId];
  if (!Adapter) {
    throw new Error(`Unknown provider: ${providerId}`);
  }

  const instance = new Adapter();
  instances.set(providerId, instance);
  return instance;
}

export function getAvailableProviders(): string[] {
  return Object.keys(adapters);
}

export function hasProvider(providerId: string): boolean {
  return providerId in adapters;
}
