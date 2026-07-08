const BASE = '/api';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export type Vendedor = {
  id: string; nombre: string; telefono?: string; zona?: string; activo: boolean;
};

export type Lead = {
  id: string; createdAt: string; nombre: string; telefono: string; email?: string;
  producto?: string; estado: string; origen: string; vendedorId?: string;
};

export type Demo = {
  id: string; fecha: string; hora?: string; lugar: string; producto?: string;
  estado: string; vendedorId?: string; montoVenta: number;
};

export type Actividad = {
  id: string; vendedorId: string; semanaInicio: string;
  prospectos: number; llamadas: number; demostraciones: number; montoVentas: number;
  referidos: number; prospeccion: number; toquePuertas: number; notas?: string;
};

export const api = {
  auth: {
    admin: (pin: string) => req<{ ok: boolean }>('/auth/admin', { method: 'POST', body: JSON.stringify({ pin }) }),
    seller: (vendedorId: string, pin: string) =>
      req<{ ok: boolean; vendedor: Vendedor }>('/auth/seller', { method: 'POST', body: JSON.stringify({ vendedorId, pin }) }),
  },
  vendedores: {
    list: () => req<Vendedor[]>('/vendedores'),
    active: () => req<Vendedor[]>('/vendedores/activos'),
    create: (data: object) => req<Vendedor>('/vendedores', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: object) => req<Vendedor>(`/vendedores/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  leads: {
    list: (vendedorId?: string) => req<Lead[]>(`/leads${vendedorId ? `?vendedorId=${vendedorId}` : ''}`),
    create: (data: object) => req<Lead>('/leads', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: object) => req<Lead>(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => req(`/leads/${id}`, { method: 'DELETE' }),
  },
  demos: {
    list: (vendedorId?: string) => req<Demo[]>(`/demos${vendedorId ? `?vendedorId=${vendedorId}` : ''}`),
    create: (data: object) => req<Demo>('/demos', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: object) => req<Demo>(`/demos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => req(`/demos/${id}`, { method: 'DELETE' }),
  },
  actividad: {
    list: (semana?: string) => req<Actividad[]>(`/actividad${semana ? `?semana=${semana}` : ''}`),
    dashboard: (semana?: string) => req<Record<string, number>>(`/actividad/dashboard${semana ? `?semana=${semana}` : ''}`),
    upsert: (data: object) => req<Actividad>('/actividad', { method: 'POST', body: JSON.stringify(data) }),
  },
  assistant: {
    status: () => req<{ ai: boolean; name: string }>('/assistant/status'),
    onboarding: (role: string, step?: number) =>
      req<import('./onboarding').OnboardingState>(`/assistant/onboarding?role=${role}${step != null ? `&step=${step}` : ''}`),
    chat: (data: {
      role: string; message: string; stepIndex?: number; context?: string;
      history?: { role: 'user' | 'assistant'; content: string }[];
    }) => req<{ reply: string; ai: boolean; onboarding: import('./onboarding').OnboardingState }>(
      '/assistant/chat', { method: 'POST', body: JSON.stringify(data) },
    ),
  },
};
