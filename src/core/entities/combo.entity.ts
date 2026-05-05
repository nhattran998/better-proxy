export type ComboStrategy = 'fallback' | 'round-robin';

export interface Combo {
  id: string;
  name: string;
  models: string[];
  strategy: ComboStrategy;
  isActive: boolean;
}
