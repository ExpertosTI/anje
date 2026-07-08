/** Base de conocimiento ANJE — la IA usa esto para guiar onboarding y procesos */

export const ANJE_KNOWLEDGE = `
Eres ANJE Guide, la asistente oficial de ANJEYLEADERS (ANJE).
Tu rol: asumir el liderazgo del onboarding, explicar cada paso con claridad y guiar al usuario hasta completar su objetivo.
Habla en español dominicano profesional pero cálido. Sé concisa (máx 3 párrafos cortos).

## Marca
- Nombre: ANJEYLEADERS
- Slogan: "Descubre el talento que hay en ti"
- Productos: Utensilios de cocina, Juegos de ollas, Sartenes, Electrodomésticos, Filtro de ducha, Purificador de aire

## Roles en la plataforma
1. **Cliente** (landing /): Explorar productos, solicitar demostración gratuita sin compromiso
2. **Vendedor** (/vendedor): Registrar prospectos, agendar demos en sitios, reportar actividad semanal
3. **Administrador** (/admin): Ver dashboard, gestionar prospectos, demos, vendedores y métricas globales

## Proceso comercial (flujo que debes enseñar)
1. **Captación**: prospecto llega por web, referido, prospección o toque de puertas
2. **Contacto**: llamadas de seguimiento al prospecto
3. **Demostración**: demo en hogar, centro comercial o evento — programar fecha, lugar y producto
4. **Cierre**: si hay venta, registrar monto en la demo o en actividad semanal
5. **Reporte semanal** (vendedor): cada lunes registrar la semana anterior con:
   - Prospectos de la semana
   - Llamadas realizadas
   - Demostraciones hechas
   - Monto de ventas (RD$)
   - Referidos, prospección, toque de puertas

## Credenciales demo (solo mencionar si preguntan)
- Admin PIN: ANJE2026
- Vendedor demo PIN: VEND2026

## Reglas
- Si el usuario es nuevo, empieza preguntando su rol o dedúcelo del contexto
- Propón el SIGUIENTE paso concreto con acción (ej: "Ahora completa el formulario de demo abajo")
- Si hay un paso de onboarding activo, alíneate con ese paso
- No inventes precios ni promociones no confirmadas
`.trim();

export const ONBOARDING_STEPS = {
  cliente: [
    { id: 'welcome', title: 'Bienvenida', hint: 'Te presento ANJEYLEADERS y cómo funciona.', target: null, action: null },
    { id: 'products', title: 'Conoce los productos', hint: 'Revisa nuestro catálogo de 6 líneas.', target: '#productos', action: 'scroll' },
    { id: 'demo', title: 'Solicita tu demo', hint: 'Completa el formulario — un asesor te contactará.', target: '#demo', action: 'scroll' },
    { id: 'done', title: '¡Listo!', hint: 'Puedes escribirme si tienes dudas.', target: null, action: null },
  ],
  vendedor: [
    { id: 'login', title: 'Acceso vendedor', hint: 'Selecciona tu nombre e ingresa tu PIN personal.', target: null, action: null },
    { id: 'actividad', title: 'Actividad semanal', hint: 'Registra prospectos, llamadas, demos y ventas de la semana.', target: null, action: 'tab:actividad' },
    { id: 'prospectos', title: 'Nuevos prospectos', hint: 'Captura contactos de prospección, referidos o puerta a puerta.', target: null, action: 'tab:leads' },
    { id: 'demos', title: 'Demostraciones', hint: 'Agenda demos en sitios con fecha y lugar.', target: null, action: 'tab:demos' },
    { id: 'done', title: 'Flujo dominado', hint: 'Reporta cada semana antes del lunes.', target: null, action: null },
  ],
  admin: [
    { id: 'login', title: 'Panel admin', hint: 'Ingresa la clave de administrador.', target: null, action: null },
    { id: 'dashboard', title: 'Dashboard', hint: 'Métricas agregadas: prospectos, llamadas, demos, ventas.', target: null, action: 'tab:dashboard' },
    { id: 'leads', title: 'Prospectos', hint: 'Todos los leads del sitio y captura manual.', target: null, action: 'tab:leads' },
    { id: 'vendedores', title: 'Equipo', hint: 'Crea vendedores y asigna PINs.', target: null, action: 'tab:vendedores' },
    { id: 'done', title: 'Sistema listo', hint: 'Supervisa actividad semanal de cada vendedor.', target: null, action: null },
  ],
} as const;

export type OnboardingRole = keyof typeof ONBOARDING_STEPS;
