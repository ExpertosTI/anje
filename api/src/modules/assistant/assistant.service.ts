import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { ANJE_KNOWLEDGE, ONBOARDING_STEPS, OnboardingRole } from './knowledge';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const MODEL_FALLBACKS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
];

@Injectable()
export class AssistantService {
  private readonly log = new Logger(AssistantService.name);
  private genai: GoogleGenAI | null = null;
  private genaiKey = '';
  private probeCache: { at: number; live: boolean; error?: string } | null = null;

  constructor(private cfg: ConfigService) {}

  isAiEnabled() {
    return Boolean(this.apiKey());
  }

  async status() {
    const configured = this.isAiEnabled();
    if (!configured) {
      return { ai: false, configured: false, live: false, name: 'ANJE Guide' };
    }

    const now = Date.now();
    if (this.probeCache && now - this.probeCache.at < 60_000) {
      return {
        ai: this.probeCache.live,
        configured: true,
        live: this.probeCache.live,
        name: 'ANJE Guide',
        ...(this.probeCache.error ? { error: this.probeCache.error } : {}),
      };
    }

    try {
      await this.callGemini('Responde solo: ok', 'ok', []);
      this.probeCache = { at: now, live: true };
      return { ai: true, configured: true, live: true, name: 'ANJE Guide' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.log.warn(`Gemini probe failed: ${msg}`);
      this.probeCache = { at: now, live: false, error: msg.slice(0, 120) };
      return {
        ai: false,
        configured: true,
        live: false,
        name: 'ANJE Guide',
        error: msg.slice(0, 120),
      };
    }
  }

  private apiKey() {
    return this.cfg.get('GEMINI_API_KEY')?.trim() || '';
  }

  private preferredModel() {
    return this.cfg.get('GEMINI_MODEL', 'gemini-2.5-flash');
  }

  private models() {
    const p = this.preferredModel();
    return [p, ...MODEL_FALLBACKS.filter((m) => m !== p)];
  }

  private isAuthKey() {
    return this.apiKey().startsWith('AQ.');
  }

  private getClient() {
    const key = this.apiKey();
    if (!key) throw new Error('gemini_not_configured');
    if (!this.genai || this.genaiKey !== key) {
      this.genai = new GoogleGenAI({ apiKey: key });
      this.genaiKey = key;
    }
    return this.genai;
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
    const history = body.history || [];

    if (this.isAiEnabled()) {
      try {
        const text = await this.callGemini(system, body.message, history);
        return { reply: text, ai: true, onboarding };
      } catch (err) {
        this.log.warn(`Gemini fallback: ${err instanceof Error ? err.message : err}`);
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
      return `¡Hola! Soy **ANJE Guide**. Estás en el paso **${step.title}**: ${step.hint}\n\n¿Seguimos? Puedo explicarte productos, demos, métricas semanales o el panel admin.`;
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

    return `Paso actual: **${step.title}** — ${step.hint}\n\nPregúntame sobre productos, demos, prospectos o reporte semanal.`;
  }

  private buildTurns(message: string, history: ChatMessage[]) {
    const turns = history.slice(-10).map((m) => ({
      role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
      text: m.content,
    }));
    const last = turns[turns.length - 1];
    if (!last || last.text !== message || last.role !== 'user') {
      turns.push({ role: 'user', text: message });
    }
    return turns;
  }

  private async callGemini(system: string, message: string, history: ChatMessage[]) {
    const turns = this.buildTurns(message, history);
    const strategies = this.isAuthKey()
      ? [this.interactionChat.bind(this), this.sdkChat.bind(this), this.httpChat.bind(this)]
      : [this.sdkChat.bind(this), this.httpChat.bind(this), this.interactionChat.bind(this)];

    let lastErr = 'gemini_failed';
    for (const model of this.models()) {
      for (const strategy of strategies) {
        try {
          const text = await strategy(model, system, turns);
          if (text) return text;
        } catch (err) {
          lastErr = err instanceof Error ? err.message : String(err);
          this.log.debug(`${strategy.name} ${model}: ${lastErr}`);
        }
      }
    }
    throw new Error(lastErr);
  }

  private async interactionChat(model: string, system: string, turns: { role: 'user' | 'model'; text: string }[]) {
    const input = turns
      .map((t) => `${t.role === 'user' ? 'Usuario' : 'Asistente'}: ${t.text}`)
      .join('\n');
    const interaction = await this.getClient().interactions.create({
      model,
      input,
      system_instruction: system,
    });
    const outputs = interaction.outputs as Array<{ text?: string }> | undefined;
    const fromOutputs = outputs?.map((o) => o.text || '').join('').trim();
    if (fromOutputs) return fromOutputs;
    const legacy = (interaction as { output_text?: string }).output_text?.trim();
    if (legacy) return legacy;
    throw new Error('gemini_empty_interaction');
  }

  private async sdkChat(model: string, system: string, turns: { role: 'user' | 'model'; text: string }[]) {
    const history = turns.slice(0, -1).map((t) => ({
      role: t.role,
      parts: [{ text: t.text }],
    }));
    const last = turns[turns.length - 1];
    const response = await this.getClient().models.generateContent({
      model,
      contents: [...history, { role: 'user', parts: [{ text: last.text }] }],
      config: {
        systemInstruction: system,
        temperature: 0.7,
        maxOutputTokens: 512,
      },
    });
    const text = response.text?.trim();
    if (!text) throw new Error('gemini_empty_sdk');
    return text;
  }

  private async httpChat(model: string, system: string, turns: { role: 'user' | 'model'; text: string }[]) {
    const key = this.apiKey();
    const contents = turns.map((t) => ({
      role: t.role,
      parts: [{ text: t.text }],
    }));
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
        }),
      },
    );
    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(`gemini_${res.status}:${err.slice(0, 150)}`);
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('gemini_empty_http');
    return text.trim();
  }
}
