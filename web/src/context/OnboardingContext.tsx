import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import {
  detectRole, loadProgress, saveProgress, type OnboardingRole, type OnboardingState,
} from '../lib/onboarding';

type ActionHandler = (action: string) => void;

type Ctx = {
  role: OnboardingRole;
  open: boolean;
  setOpen: (v: boolean) => void;
  onboarding: OnboardingState | null;
  stepIndex: number;
  nextStep: () => void;
  skipAll: () => void;
  registerActionHandler: (fn: ActionHandler) => () => void;
  runStepAction: () => void;
};

const OnboardingCtx = createContext<Ctx | null>(null);

export function useOnboarding() {
  const ctx = useContext(OnboardingCtx);
  if (!ctx) throw new Error('useOnboarding outside provider');
  return ctx;
}

export function useOnboardingOptional() {
  return useContext(OnboardingCtx);
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const role = detectRole(pathname);
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(() => loadProgress(role));
  const [onboarding, setOnboarding] = useState<OnboardingState | null>(null);
  const [handler, setHandler] = useState<ActionHandler | null>(null);

  const registerActionHandler = useCallback((fn: ActionHandler) => {
    setHandler(() => fn);
    return () => setHandler(null);
  }, []);

  useEffect(() => {
    const saved = loadProgress(role);
    setStepIndex(saved >= 0 ? saved : 0);
    api.assistant.onboarding(role, saved >= 0 ? saved : 0)
      .then(setOnboarding)
      .catch(console.error);
  }, [role]);

  useEffect(() => {
    if (stepIndex < 0) return;
    api.assistant.onboarding(role, stepIndex).then(setOnboarding).catch(console.error);
    saveProgress(role, stepIndex);
  }, [role, stepIndex]);

  // Auto-abrir guía en primera visita por rol
  useEffect(() => {
    const saved = loadProgress(role);
    if (saved === 0) {
      const t = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(t);
    }
  }, [role]);

  const runStepAction = useCallback(() => {
    const step = onboarding?.current;
    if (!step?.action) return;
    if (step.action === 'scroll' && step.target) {
      document.querySelector(step.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (step.action.startsWith('tab:') && handler) {
      handler(step.action);
    }
  }, [onboarding, handler]);

  const nextStep = useCallback(() => {
    runStepAction();
    if (!onboarding) return;
    const next = stepIndex + 1;
    if (next >= onboarding.total) {
      saveProgress(role, stepIndex, true);
      setStepIndex(-1);
      setOpen(false);
    } else {
      setStepIndex(next);
    }
  }, [onboarding, stepIndex, role, runStepAction]);

  const skipAll = useCallback(() => {
    saveProgress(role, 0, true);
    setStepIndex(-1);
    setOpen(false);
  }, [role]);

  const value = useMemo(() => ({
    role, open, setOpen, onboarding, stepIndex, nextStep, skipAll, registerActionHandler, runStepAction,
  }), [role, open, onboarding, stepIndex, nextStep, skipAll, registerActionHandler, runStepAction]);

  return <OnboardingCtx.Provider value={value}>{children}</OnboardingCtx.Provider>;
}
