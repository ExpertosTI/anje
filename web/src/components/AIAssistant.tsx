import { AnimatePresence, motion } from 'framer-motion';
import { Bot, ChevronRight, Send, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useOnboardingOptional } from '../context/OnboardingContext';
import { api } from '../lib/api';
import { detectRole, loadProgress } from '../lib/onboarding';
import { useLocation } from 'react-router-dom';

type Msg = { role: 'user' | 'assistant'; content: string };

export default function AIAssistant() {
  const ctx = useOnboardingOptional();
  const { pathname } = useLocation();
  const role = detectRole(pathname);
  const [open, setOpen] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const done = loadProgress(role) < 0;

  const isOpen = ctx?.open ?? open;
  const setIsOpen = ctx?.setOpen ?? setOpen;
  const onboarding = ctx?.onboarding;
  const currentStep = onboarding?.current;
  const activeStep = ctx?.stepIndex ?? stepIndex;

  useEffect(() => {
    api.assistant.status().then((s) => setAiEnabled(s.ai)).catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0 && currentStep && !done) {
      setMessages([{
        role: 'assistant',
        content: `¡Hola! Soy **ANJE Guide** 🌸\n\nVoy a guiarte paso a paso. Empezamos:\n\n**${currentStep.title}**\n${currentStep.hint}\n\n¿Listo? Pulsa "Siguiente paso" o escríbeme cualquier duda.`,
      }]);
    }
  }, [isOpen, currentStep?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg: Msg = { role: 'user', content: msg };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    try {
      const res = await api.assistant.chat({
        role,
        message: msg,
        stepIndex: activeStep >= 0 ? activeStep : 0,
        history: [...messages, userMsg],
        context: currentStep ? `Paso: ${currentStep.title}` : undefined,
      });
      setMessages((m) => [...m, { role: 'assistant', content: res.reply }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Hubo un error. Intenta de nuevo o usa "Siguiente paso".' }]);
    } finally {
      setLoading(false);
    }
  }

  function handleNext() {
    const next = onboarding?.next;
    if (ctx) ctx.runStepAction();
    if (ctx) {
      ctx.nextStep();
    } else {
      setStepIndex((s) => s + 1);
    }
    if (next) {
      setMessages((m) => [...m, {
        role: 'assistant',
        content: `**${next.title}**\n${next.hint}`,
      }]);
    } else if (onboarding && activeStep + 1 >= onboarding.total) {
      setMessages((m) => [...m, {
        role: 'assistant',
        content: '¡Excelente! Completaste el onboarding. Estoy aquí si necesitas ayuda.',
      }]);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 pl-3 pr-4 py-3 rounded-full text-white shadow-xl transition-transform hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #E197B1, #C97898)' }}
        aria-label="Abrir guía ANJE"
      >
        <Sparkles size={20} />
        <span className="text-sm font-semibold hidden sm:inline">Guía ANJE</span>
        {!done && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse border-2 border-anje-pink" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-4 sm:left-6 z-50 w-[min(400px,calc(100vw-2rem))] flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-2xl overflow-hidden"
            style={{ maxHeight: 'min(560px, calc(100vh - 7rem))' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-anje-pink-light to-white">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-anje-pink flex items-center justify-center text-white">
                  <Bot size={18} />
                </div>
                <div>
                  <div className="font-serif text-sm font-semibold">ANJE Guide</div>
                  <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                    {aiEnabled ? <><Sparkles size={10} /> IA activa</> : 'Modo guía inteligente'}
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-neutral-100" aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>

            {/* Progress */}
            {onboarding && activeStep >= 0 && (
              <div className="px-4 py-2 bg-neutral-50 border-b">
                <div className="flex justify-between text-[10px] text-neutral-500 mb-1">
                  <span>Paso {activeStep + 1} de {onboarding.total}</span>
                  <button type="button" className="underline" onClick={() => ctx?.skipAll()}>Omitir tour</button>
                </div>
                <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-anje-pink rounded-full"
                    animate={{ width: `${((activeStep + 1) / onboarding.total) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                {currentStep && (
                  <p className="text-xs font-medium text-anje-pink-dark mt-1.5">{currentStep.title}</p>
                )}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-anje-pink text-white rounded-br-md'
                        : 'bg-neutral-100 text-neutral-800 rounded-bl-md'
                    }`}
                  >
                    {m.content.split('\n').map((line, j) => (
                      <span key={j}>
                        {line.split(/(\*\*[^*]+\*\*)/).map((part, k) =>
                          part.startsWith('**') ? <strong key={k}>{part.slice(2, -2)}</strong> : part,
                        )}
                        {j < m.content.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-1 px-3 py-2">
                  <span className="w-2 h-2 bg-anje-pink rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-anje-pink rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-anje-pink rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {['¿Qué productos tienen?', '¿Cómo registro ventas?', '¿Qué es una demo?'].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="text-[10px] px-2 py-1 rounded-full border border-anje-pink/30 text-anje-pink-dark hover:bg-anje-pink-light transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="p-3 border-t bg-white space-y-2">
              {onboarding && activeStep >= 0 && currentStep && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full btn btn-primary btn-sm py-2.5"
                >
                  Siguiente paso <ChevronRight size={16} />
                </button>
              )}
              <form
                onSubmit={(e) => { e.preventDefault(); send(); }}
                className="flex gap-2"
              >
                <input
                  className="input flex-1 py-2 text-sm"
                  placeholder="Pregúntame lo que necesites..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" className="btn btn-primary px-3 py-2" disabled={loading || !input.trim()} aria-label="Enviar">
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
