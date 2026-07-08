import { AnimatePresence, motion } from 'framer-motion';
import { Bot, ChevronRight, RotateCcw, Send, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useOnboardingOptional } from '../context/OnboardingContext';
import { api } from '../lib/api';
import { detectRole, loadProgress, type OnboardingRole } from '../lib/onboarding';

type Msg = { role: 'user' | 'assistant'; content: string; ai?: boolean };

const QUICK: Record<OnboardingRole, string[]> = {
  cliente: ['¿Qué productos tienen?', '¿Cómo pido una demo?', '¿Es gratis la demostración?'],
  vendedor: ['¿Cómo registro ventas?', '¿Qué es actividad semanal?', '¿Cómo agrego prospectos?'],
  admin: ['¿Qué veo en el dashboard?', '¿Cómo creo vendedores?', '¿Cómo cambio estado de leads?'],
};

function welcomeMsg(title: string, hint: string) {
  return `¡Hola! Soy **ANJE Guide**, tu asistente de ANJEYLEADERS.\n\n**${title}**\n${hint}\n\nEscríbeme o usa los accesos rápidos abajo.`;
}

function renderText(content: string) {
  return content.split('\n').map((line, j, arr) => (
    <span key={j}>
      {line.split(/(\*\*[^*]+\*\*)/).map((part, k) =>
        part.startsWith('**') ? <strong key={k}>{part.slice(2, -2)}</strong> : part,
      )}
      {j < arr.length - 1 && <br />}
    </span>
  ));
}

export default function AIAssistant() {
  const ctx = useOnboardingOptional();
  const { pathname } = useLocation();
  const role = detectRole(pathname);
  const [open, setOpen] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiLive, setAiLive] = useState<boolean | null>(null);
  const [lastAi, setLastAi] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const done = loadProgress(role) < 0;

  const isOpen = ctx?.open ?? open;
  const setIsOpen = ctx?.setOpen ?? setOpen;
  const onboarding = ctx?.onboarding;
  const currentStep = onboarding?.current;
  const activeStep = ctx?.stepIndex ?? 0;

  const resetWelcome = useCallback(() => {
    const title = currentStep?.title ?? '¿En qué te ayudo?';
    const hint = currentStep?.hint ?? 'Productos, demos, prospectos y reportes semanales.';
    setMessages([{ role: 'assistant', content: welcomeMsg(title, hint) }]);
  }, [currentStep?.title, currentStep?.hint]);

  useEffect(() => {
    api.assistant.status().then((s) => {
      setAiEnabled(Boolean(s.configured ?? s.ai));
      setAiLive(Boolean(s.live ?? s.ai));
    }).catch(() => {
      setAiEnabled(false);
      setAiLive(false);
    });
  }, []);

  useEffect(() => {
    setMessages([]);
    setLastAi(null);
  }, [role]);

  useEffect(() => {
    if (isOpen && messages.length === 0 && currentStep) {
      resetWelcome();
    }
  }, [isOpen, messages.length, currentStep, resetWelcome]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg: Msg = { role: 'user', content: msg };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setLoading(true);
    try {
      const res = await api.assistant.chat({
        role,
        message: msg,
        stepIndex: activeStep >= 0 ? activeStep : 0,
        history: nextHistory.filter((m) => m.role === 'user' || m.role === 'assistant').map((m) => ({
          role: m.role,
          content: m.content,
        })),
        context: currentStep ? `Paso: ${currentStep.title}` : undefined,
      });
      setLastAi(res.ai);
      setMessages((m) => [...m, { role: 'assistant', content: res.reply, ai: res.ai }]);
    } catch {
      setLastAi(false);
      setMessages((m) => [...m, {
        role: 'assistant',
        content: 'No pude conectar con la IA. Reintenta en un momento — el tour guiado sigue disponible.',
        ai: false,
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleNext() {
    const next = onboarding?.next;
    if (ctx) ctx.runStepAction();
    if (ctx) ctx.nextStep();
    if (next) {
      setMessages((m) => [...m, { role: 'assistant', content: `**${next.title}**\n${next.hint}` }]);
    } else if (onboarding && activeStep + 1 >= onboarding.total) {
      setMessages((m) => [...m, {
        role: 'assistant',
        content: 'Completaste el tour. Sigue usando el chat para cualquier duda.',
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
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-anje-pink-light to-white">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-anje-pink flex items-center justify-center text-white">
                  <Bot size={18} />
                </div>
                <div>
                  <div className="font-serif text-sm font-semibold">ANJE Guide</div>
                  <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                    {lastAi === true && <><Sparkles size={10} className="text-anje-pink" /> Gemini</>}
                    {lastAi === false && (aiLive === false && aiEnabled ? 'Guía offline (clave IA inválida)' : 'Guía offline')}
                    {lastAi === null && aiLive && <><Sparkles size={10} /> IA lista</>}
                    {lastAi === null && !aiLive && aiEnabled && 'Clave IA sin conexión'}
                    {lastAi === null && !aiEnabled && 'Modo guía'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={resetWelcome} className="p-1.5 rounded-lg hover:bg-neutral-100" aria-label="Reiniciar chat" title="Reiniciar">
                  <RotateCcw size={16} />
                </button>
                <button type="button" onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-neutral-100" aria-label="Cerrar">
                  <X size={18} />
                </button>
              </div>
            </div>

            {onboarding && activeStep >= 0 && !done && (
              <div className="px-4 py-2 bg-neutral-50 border-b">
                <div className="flex justify-between text-[10px] text-neutral-500 mb-1">
                  <span>Paso {activeStep + 1} de {onboarding.total}</span>
                  <button type="button" className="underline" onClick={() => ctx?.skipAll()}>Omitir tour</button>
                </div>
                <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-anje-pink rounded-full"
                    animate={{ width: `${((activeStep + 1) / onboarding.total) * 100}%` }}
                  />
                </div>
                {currentStep && (
                  <p className="text-xs font-medium text-anje-pink-dark mt-1.5">{currentStep.title}</p>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[320px]">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-anje-pink text-white rounded-br-md'
                        : 'bg-neutral-100 text-neutral-800 rounded-bl-md'
                    }`}
                  >
                    {renderText(m.content)}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-1 px-3 py-2">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="w-2 h-2 bg-anje-pink rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {QUICK[role].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  disabled={loading}
                  className="text-[10px] px-2 py-1 rounded-full border border-anje-pink/30 text-anje-pink-dark hover:bg-anje-pink-light transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="p-3 border-t bg-white space-y-2">
              {onboarding && activeStep >= 0 && !done && currentStep && (
                <button type="button" onClick={handleNext} className="w-full btn btn-primary btn-sm py-2.5">
                  Siguiente paso <ChevronRight size={16} />
                </button>
              )}
              <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
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
