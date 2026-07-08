export const BRAND = {
  name: 'ANJEYLEADERS',
  shortName: 'ANJE',
  slogan: 'Descubre el talento que hay en ti',
  phone: '809-000-0000',
  whatsapp: '18090000000',
  domain: 'anje.renace.tech',
} as const;

export const PRODUCTS = [
  { key: 'utensilios', label: 'Utensilios de cocina', desc: 'Calidad premium para tu cocina diaria.' },
  { key: 'ollas', label: 'Juegos de ollas', desc: 'Sets completos con garantía de durabilidad.' },
  { key: 'sartenes', label: 'Sartenes', desc: 'Antiadherentes de última generación.' },
  { key: 'electrodomesticos', label: 'Electrodomésticos', desc: 'Eficientes para el hogar moderno.' },
  { key: 'filtro_ducha', label: 'Filtro de ducha', desc: 'Agua pura en cada ducha.' },
  { key: 'purificador', label: 'Purificador de aire', desc: 'Aire limpio para tu familia.' },
] as const;

export const LEAD_ESTADOS: Record<string, string> = {
  nuevo: 'Nuevo', contactado: 'Contactado', demo_agendada: 'Demo agendada', vendido: 'Vendido', descartado: 'Descartado',
};

export const LEAD_ORIGENES: Record<string, string> = {
  web: 'Sitio web', referido: 'Referido', prospeccion: 'Prospección', toque_puertas: 'Toque de puertas', evento: 'Evento',
};

export const DEMO_ESTADOS: Record<string, string> = {
  programada: 'Programada', realizada: 'Realizada', cancelada: 'Cancelada', venta: 'Venta cerrada',
};

export function formatMoney(n: number) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(n);
}

export function formatDate(d: string | Date) {
  return new Intl.DateTimeFormat('es-DO', { dateStyle: 'medium' }).format(new Date(d));
}

export function weekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}
