export function now(): Date {
  return new Date();
}

export function addMs(date: Date, ms: number): Date {
  return new Date(date.getTime() + ms);
}

export function addHours(date: Date, hours: number): Date {
  return addMs(date, hours * 60 * 60 * 1000);
}

export function addDays(date: Date, days: number): Date {
  return addMs(date, days * 24 * 60 * 60 * 1000);
}

export function isExpired(date: Date): boolean {
  return date.getTime() < Date.now();
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600_000) return `${Math.round(ms / 60_000)}m`;
  return `${Math.round(ms / 3600_000)}h`;
}
