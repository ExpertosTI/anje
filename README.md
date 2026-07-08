# ANJEYLEADERS — NestJS + React

Stack moderno para landing, admin y portal vendedores.

| Capa | Tech |
|------|------|
| **API** | NestJS 11 + TypeORM + PostgreSQL |
| **Web** | React 19 + Vite + Tailwind 4 + Framer Motion |
| **Deploy** | Docker Swarm + Traefik (Renace) |

## URLs

- https://anje.renace.tech — Landing
- https://anje.renace.tech/admin — Administrador (PIN: `ANJE2026`)
- https://anje.renace.tech/vendedor — Vendedores (PIN demo: `VEND2026`)

## Guía IA — ANJE Guide

Botón **Guía ANJE** (esquina inferior izquierda) en todas las páginas:

- **Tour paso a paso** por rol (cliente, vendedor, admin)
- **Chat** con respuestas sobre productos, demos, métricas y procesos
- **Gemini** si `GEMINI_API_KEY` está configurada; si no, guía inteligente offline

```bash
# En api/.env o docker-compose
GEMINI_API_KEY=tu_clave
GEMINI_MODEL=gemini-2.5-flash
```

## Desarrollo local

```bash
# Terminal 1 — API (requiere PostgreSQL)
cd api && cp .env.example .env && npm install && npm run start:dev

# Terminal 2 — Web
cd web && npm install && npm run dev
```

Web en http://localhost:5173 · API en http://localhost:3001

## Producción

```bash
ssh root@45.9.191.18
cd /opt/anje && ./deploy.sh
```

Repo: https://github.com/ExpertosTI/anje
