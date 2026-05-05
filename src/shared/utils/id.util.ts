export function generateId(): string {
  return crypto.randomUUID();
}

export function generateShortId(length: number = 8): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, length);
}
