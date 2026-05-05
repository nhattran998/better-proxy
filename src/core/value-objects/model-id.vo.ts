import { InvalidModelError } from '@/core/errors';

export class ModelId {
  private constructor(
    public readonly provider: string,
    public readonly model: string
  ) {}

  static parse(modelStr: string): ModelId {
    const parts = modelStr.split('/');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new InvalidModelError(modelStr);
    }
    return new ModelId(parts[0], parts[1]);
  }

  static tryParse(modelStr: string): ModelId | null {
    try {
      return ModelId.parse(modelStr);
    } catch {
      return null;
    }
  }

  toString(): string {
    return `${this.provider}/${this.model}`;
  }

  equals(other: ModelId): boolean {
    return this.provider === other.provider && this.model === other.model;
  }
}
