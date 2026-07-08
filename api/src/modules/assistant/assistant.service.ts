import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ANJE_KNOWLEDGE, ONBOARDING_STEPS, OnboardingRole } from './knowledge';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

@Injectable()
export class AssistantService {
  constructor(private cfg: ConfigService) {}

  isAiEnabled() {
    return Boolean(this.cfg.get('GEMINI_API_KEY')?.trim());
  }

  private apiKey() {
    return this.cfg.get('GEMINI_API_KEY')?.trim() || '';
  }

  private model() {
    return this.cfg.get('GEMINI_MODEL', 'gemini-2.5-flash');
  }

  getOnboarding(role: OnboardingRole, stepIndex = 0) {
    const steps = ONBOARDING_STEPS[role] || ONBOARDING_STEPS.cliente;
    const idx = Math.min(Math.max(0, stepIndex), steps.length - 1);
    return {
      role,
      stepIndex: idx,
      total: steps.length,
      current: steps[idx],
      next: steps[idx + 1] ?? null,
      steps,
    };
  }

  async chat(body: {
    role: OnboardingRole;
    message: string;
    history?: ChatMessage[];
    stepIndex?: number;
    context?: string;
  }) {
    const onboarding = this.getOnboarding(body.role, body.stepIndex ?? 0);
    const stepCtx = onboarding.current
      ? `Paso activo (${onboarding.stepIndex + 1}/${onboarding.total}): "${onboarding.current.title}" — ${onboarding.current.hint}`
      : '';

    const system = `${ANJE_KNOWLEDGE}\n\n## Contexto actual\nRol: ${body.role}\n${stepCtx}\n${body.context || ''}`;

    if (this.isAiEnabled()) {
      try {
        const text = await this.callGemini(system, body.message, body.history || []);
        return { reply: text, ai: true, onboarding };
      } catch (err) {
        console.warn('[assistant] gemini fallback:', err instanceof Error ? err.message : err);
      }
    }

    return {
      reply: this.fallbackReply(body.role, body.message, onboarding),
      ai: false,
      onboarding,
    };
  }

  private fallbackReply(
    role: OnboardingRole,
    message: string,
    onboarding: ReturnType<AssistantService['getOnboarding']>,
  ) {
    const q = message.toLowerCase();
    const step = onboarding.current;

    if (/hola|empez|inicio|ayuda|guia|guía/.test(q)) {
      return `¡Hola! Soy tu guía ANJE. Estás en el paso **${step.title}**: ${step.hint}\n\n¿Seguimos? Puedo explicarte productos, demos, métricas semanales o el panel admin.`;
    }
    if (/producto|catálogo|catalogo|ollas|sarten/.test(q)) {
      return 'Tenemos 6 líneas: utensilios de cocina, juegos de ollas, sartenes, electrodomésticos, filtro de ducha y purificador de aire. ¿Quieres solicitar una demostración gratuita?';
    }
    if (/demo|demostraci/.test(q)) {
      return 'Las demos son sin compromiso, en tu hogar o en eventos. Ve al formulario "Solicita tu demo" y deja nombre, teléfono y producto de interés.';
    }
    if (/prospecto|lead|cliente/.test(q)) {
      return role === 'vendedor'
        ? 'En la pestaña **Prospectos** registra nombre, teléfono y origen (referido, prospección o toque de puertas).'
        : 'Los prospectos entran por la web o los registra un vendedor. El admin los ve en Prospectos y cambia el estado.';
    }
    if (/semana|métrica|metrica|llamada|venta|referido/.test(q)) {
      return 'Cada semana reporta: prospectos, llamadas, demostraciones, monto de ventas (RD$), referidos, prospección y toque de puertas. Hazlo en **Actividad semanal** antes del lunes.';
    }
    if (/admin|administrador|pin/.test(q)) {
      return 'El administrador ve el dashboard global, gestiona vendedores (PIN por persona) y supervisa demos. Accede en /admin.';
    }

    return `Entendido. Paso actual: **${step.title}** — ${step.hint}\n\nPregúntame sobre productos, demos, prospectos o reporte semanal.`;
  }

  private async callGemini(system: string, message: string, history: ChatMessage[]) {
    const model = this.model();
    const key = this.apiKey();
    const contents = [
      ...history.slice(-8).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': key,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
        }),
      },
    );

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(`gemini_${res.status}:${err.slice(0, 120)}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('gemini_empty');
    return text.trim();
  }
}
