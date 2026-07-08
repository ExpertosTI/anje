-- ANJE Leaders · Insforge / PostgreSQL
-- Ejecutar en consola SQL de Insforge o con: npm run seed:db

create table if not exists anje_vendedores (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  nombre text not null,
  telefono text,
  email text,
  whatsapp text,
  pin text not null,
  zona text,
  activo boolean not null default true
);

create index if not exists anje_vendedores_activo_idx on anje_vendedores (activo);

create table if not exists anje_leads (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  nombre text not null,
  telefono text not null,
  email text,
  whatsapp text,
  producto text,
  direccion text,
  ciudad text,
  comentarios text,
  estado text not null default 'nuevo',
  origen text not null default 'web',
  vendedor_id text references anje_vendedores (id) on delete set null
);

create index if not exists anje_leads_created_at_idx on anje_leads (created_at desc);
create index if not exists anje_leads_estado_idx on anje_leads (estado);
create index if not exists anje_leads_vendedor_idx on anje_leads (vendedor_id);

create table if not exists anje_demostraciones (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  lead_id text references anje_leads (id) on delete set null,
  vendedor_id text references anje_vendedores (id) on delete set null,
  fecha date not null,
  hora text,
  lugar text not null,
  direccion text,
  producto text,
  estado text not null default 'programada',
  notas text,
  monto_venta numeric(12, 2) default 0,
  asistentes integer default 0
);

create index if not exists anje_demostraciones_fecha_idx on anje_demostraciones (fecha desc);
create index if not exists anje_demostraciones_vendedor_idx on anje_demostraciones (vendedor_id);
create index if not exists anje_demostraciones_estado_idx on anje_demostraciones (estado);

create table if not exists anje_actividad_semanal (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  vendedor_id text not null references anje_vendedores (id) on delete cascade,
  semana_inicio date not null,
  prospectos integer not null default 0,
  llamadas integer not null default 0,
  demostraciones integer not null default 0,
  monto_ventas numeric(12, 2) not null default 0,
  referidos integer not null default 0,
  prospeccion integer not null default 0,
  toque_puertas integer not null default 0,
  notas text,
  unique (vendedor_id, semana_inicio)
);

create index if not exists anje_actividad_semana_idx on anje_actividad_semanal (semana_inicio desc);
create index if not exists anje_actividad_vendedor_idx on anje_actividad_semanal (vendedor_id);
