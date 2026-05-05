export class ApiKey {
  private constructor(private readonly value: string) {}

  static create(key: string): ApiKey {
    if (!key || key.length < 10) {
      throw new Error('Invalid API key: must be at least 10 characters');
    }
    return new ApiKey(key);
  }

  static tryCreate(key: string): ApiKey | null {
    try {
      return ApiKey.create(key);
    } catch {
      return null;
    }
  }

  masked(): string {
    if (this.value.length <= 8) {
      return '****';
    }
    return `${this.value.slice(0, 4)}...${this.value.slice(-4)}`;
  }

  valueOf(): string {
    return this.value;
  }

  toString(): string {
    return this.masked();
  }
}
