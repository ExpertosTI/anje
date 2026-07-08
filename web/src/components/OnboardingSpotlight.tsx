import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useOnboardingOptional } from '../context/OnboardingContext';

/** Resalta el elemento del paso activo del tour */
export default function OnboardingSpotlight() {
  const ctx = useOnboardingOptional();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const target = ctx?.onboarding?.current?.target;
  const open = ctx?.open && ctx.stepIndex >= 0;

  useEffect(() => {
    if (!open || !target) {
      setRect(null);
      return;
    }
    const el = document.querySelector(target);
    if (!el) {
      setRect(null);
      return;
    }
    const update = () => setRect(el.getBoundingClientRect());
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, target, ctx?.stepIndex]);

  return (
    <AnimatePresence>
      {rect && open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 pointer-events-none"
          aria-hidden
        >
          <div
            className="absolute rounded-2xl ring-4 ring-anje-pink shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] transition-all duration-500"
            style={{
              top: rect.top - 8,
              left: rect.left - 8,
              width: rect.width + 16,
              height: rect.height + 16,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
