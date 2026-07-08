export type OnboardingRole = 'cliente' | 'vendedor' | 'admin';

export type OnboardingStep = {
  id: string;
  title: string;
  hint: string;
  target: string | null;
  action: string | null;
};

export type OnboardingState = {
  role: OnboardingRole;
  stepIndex: number;
  total: number;
  current: OnboardingStep;
  next: OnboardingStep | null;
  steps: OnboardingStep[];
};

export const STORAGE_KEY = 'anje_onboarding';

export function detectRole(path: string): OnboardingRole {
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/vendedor')) return 'vendedor';
  return 'cliente';
}

export function loadProgress(role: OnboardingRole): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw) as Record<string, { step: number; done?: boolean }>;
    if (data[role]?.done) return -1;
    return data[role]?.step ?? 0;
  } catch {
    return 0;
  }
}

export function saveProgress(role: OnboardingRole, step: number, done = false) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data[role] = { step, done };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}
