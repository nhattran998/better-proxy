import { getProviderAdapter } from "../domain/provider.factory";
import type { IConnectionRepository } from "#/core/ports/repositories/connection.repository";

export class ValidateCredentialsUseCase {
  constructor(private readonly connectionRepo: IConnectionRepository) {}

  async execute(connectionId: string): Promise<{ valid: boolean; error?: string }> {
    const connection = await this.connectionRepo.findById(connectionId);
    if (!connection) {
      return { valid: false, error: "Connection not found" };
    }

    // Get provider from connection
    const providerId = connection.providerId.split("/")[0] || connection.providerId;

    try {
      const adapter = getProviderAdapter(providerId);
      const valid = await adapter.validateCredentials({
        apiKey: connection.apiKey,
        accessToken: connection.accessToken,
        refreshToken: connection.refreshToken,
        expiresAt: connection.expiresAt,
      });

      return { valid };
    } catch (err) {
      return { valid: false, error: String(err) };
    }
  }
}
