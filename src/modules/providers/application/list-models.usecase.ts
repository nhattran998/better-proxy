import { getProviderAdapter, getAvailableProviders } from "../domain/provider.factory";
import type { IConnectionRepository } from "#/core/ports/repositories/connection.repository";

export interface ModelInfo {
  id: string;
  provider: string;
  name: string;
}

export class ListModelsUseCase {
  constructor(private readonly connectionRepo: IConnectionRepository) {}

  async execute(providerId?: string): Promise<ModelInfo[]> {
    const providers = providerId ? [providerId] : getAvailableProviders();
    const models: ModelInfo[] = [];

    for (const pid of providers) {
      try {
        const adapter = getProviderAdapter(pid);
        const connection = await this.connectionRepo.getActiveCredentials(pid);

        const providerModels = await adapter.listModels({
          apiKey: connection?.apiKey,
          accessToken: connection?.accessToken,
        });

        for (const model of providerModels) {
          models.push({
            id: `${pid}/${model}`,
            provider: pid,
            name: model,
          });
        }
      } catch {
        // Skip providers with errors
      }
    }

    return models;
  }
}
