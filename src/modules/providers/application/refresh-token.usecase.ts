import { getProviderAdapter } from "../domain/provider.factory";
import type { IConnectionRepository } from "#/core/ports/repositories/connection.repository";

export class RefreshTokenUseCase {
  constructor(private readonly connectionRepo: IConnectionRepository) {}

  async execute(connectionId: string): Promise<{ success: boolean; error?: string }> {
    const connection = await this.connectionRepo.findById(connectionId);
    if (!connection) {
      return { success: false, error: "Connection not found" };
    }

    const providerId = connection.providerId.split("/")[0] || connection.providerId;

    try {
      const adapter = getProviderAdapter(providerId);

      if (!adapter.refreshToken) {
        return { success: false, error: "Provider does not support token refresh" };
      }

      const newCredentials = await adapter.refreshToken({
        apiKey: connection.apiKey,
        accessToken: connection.accessToken,
        refreshToken: connection.refreshToken,
        expiresAt: connection.expiresAt,
      });

      await this.connectionRepo.update(connectionId, {
        accessToken: newCredentials.accessToken,
        refreshToken: newCredentials.refreshToken,
        expiresAt: newCredentials.expiresAt,
      });

      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }
}
