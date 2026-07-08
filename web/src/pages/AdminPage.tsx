import { LogOut, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOnboardingOptional } from '../context/OnboardingContext';
import { api, type Actividad, type Demo, type Lead, type Vendedor } from '../lib/api';
import { DEMO_ESTADOS, formatDate, formatMoney, LEAD_ESTADOS, weekStart } from '../lib/constants';

type Tab = 'dashboard' | 'leads' | 'demos' | 'actividad' | 'vendedores';

export default function AdminPage() {
  const onboarding = useOnboardingOptional();
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('anje_admin') === '1');
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');
  const [tab, setTab] = useState<Tab>('dashboard');
  const [semana, setSemana] = useState(weekStart());
  const [stats, setStats] = useState<Record<string, number>>({});
  const [leads, setLeads] = useState<Lead[]>([]);
  const [demos, setDemos] = useState<Demo[]>([]);
  const [actividad, setActividad] = useState<Actividad[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.auth.admin(pin);
      sessionStorage.setItem('anje_admin', '1');
      setAuthed(true);
      setErr('');
    } catch {
      setErr('Clave incorrecta');
    }
  }

  async function load() {
    const [s, l, d, a, v] = await Promise.all([
      api.actividad.dashboard(semana),
      api.leads.list(),
      api.demos.list(),
      api.actividad.list(semana),
      api.vendedores.list(),
    ]);
    setStats(s); setLeads(l); setDemos(d); setActividad(a); setVendedores(v);
  }

  useEffect(() => { if (authed) load().catch(console.error); }, [authed, semana]);

  useEffect(() => {
    if (!onboarding) return;
    return onboarding.registerActionHandler((action) => {
      const t = action.replace('tab:', '') as Tab;
      if (['dashboard', 'leads', 'demos', 'actividad', 'vendedores'].includes(t)) setTab(t);
    });
  }, [onboarding]);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-anje-pink-light to-white p-4">
        <form onSubmit={login} className="card p-8 w-full max-w-md text-center">
          <img src="/brand/logo.png" alt="" className="h-20 mx-auto mb-4" />
          <h1 className="font-serif text-2xl mb-2">Panel administrador</h1>
          <input type="password" className="input mb-4" placeholder="Clave de acceso" value={pin} onChange={(e) => setPin(e.target.value)} autoFocus />
          {err && <p className="text-red-600 text-sm mb-3">{err}</p>}
          <button type="submit" className="btn btn-primary w-full"><Shield size={18} /> Entrar</button>
          <Link to="/" className="block mt-4 text-sm text-neutral-500">← Volver al sitio</Link>
        </form>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'leads', label: 'Prospectos' },
    { id: 'demos', label: 'Demos' },
    { id: 'actividad', label: 'Actividad' },
    { id: 'vendedores', label: 'Vendedores' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2"><img src="/brand/logo.png" alt="" className="h-8" /><span className="font-serif text-sm">Admin ANJE</span></div>
          <button type="button" className="btn btn-sm btn-dark" onClick={() => { sessionStorage.removeItem('anje_admin'); setAuthed(false); }}>
            <LogOut size={14} /> Salir
          </button>
        </div>
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${tab === t.id ? 'bg-anje-pink-light text-anje-pink-dark' : 'text-neutral-500 hover:bg-neutral-100'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {tab === 'dashboard' && (
          <>
            <input type="date" className="input w-auto mb-4" value={semana} onChange={(e) => setSemana(e.target.value)} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                ['Prospectos', stats.prospectos], ['Llamadas', stats.llamadas], ['Demos', stats.demostraciones],
                ['Ventas', formatMoney(stats.montoVentas || 0)], ['Referidos', stats.referidos],
                ['Prospección', stats.prospeccion], ['Puertas', stats.toquePuertas], ['Leads web', leads.length],
              ].map(([l, v]) => (
                <div key={String(l)} className="card p-4"><div className="text-2xl font-serif text-anje-pink-dark">{v ?? 0}</div><div className="text-xs text-neutral-500">{l}</div></div>
              ))}
            </div>
          </>
        )}

        {tab === 'leads' && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-neutral-50 text-left text-xs uppercase text-neutral-500">
                <th className="p-3">Fecha</th><th className="p-3">Nombre</th><th className="p-3">Tel</th><th className="p-3">Estado</th>
              </tr></thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b hover:bg-anje-pink-light/30">
                    <td className="p-3">{formatDate(l.createdAt)}</td>
                    <td className="p-3 font-medium">{l.nombre}</td>
                    <td className="p-3">{l.telefono}</td>
                    <td className="p-3">
                      <select className="input py-1 text-xs" value={l.estado} onChange={(e) => api.leads.update(l.id, { estado: e.target.value }).then(load)}>
                        {Object.entries(LEAD_ESTADOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'demos' && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-neutral-50 text-left text-xs uppercase text-neutral-500">
                <th className="p-3">Fecha</th><th className="p-3">Lugar</th><th className="p-3">Estado</th><th className="p-3">Venta</th>
              </tr></thead>
              <tbody>
                {demos.map((d) => (
                  <tr key={d.id} className="border-b">
                    <td className="p-3">{d.fecha}</td><td className="p-3">{d.lugar}</td>
                    <td className="p-3">
                      <select className="input py-1 text-xs" value={d.estado} onChange={(e) => api.demos.update(d.id, { estado: e.target.value }).then(load)}>
                        {Object.entries(DEMO_ESTADOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </td>
                    <td className="p-3">{Number(d.montoVenta) > 0 ? formatMoney(Number(d.montoVenta)) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'actividad' && vendedores.filter((v) => v.activo).map((v) => {
          const ex = actividad.find((a) => a.vendedorId === v.id);
          return (
            <ActividadForm key={v.id} vendedor={v} semana={semana} existing={ex} onSaved={load} />
          );
        })}

        {tab === 'vendedores' && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-neutral-50 text-left text-xs uppercase"><th className="p-3">Nombre</th><th className="p-3">Zona</th><th className="p-3">Activo</th></tr></thead>
              <tbody>{vendedores.map((v) => (
                <tr key={v.id} className="border-b"><td className="p-3 font-medium">{v.nombre}</td><td className="p-3">{v.zona || '—'}</td>
                  <td className="p-3"><input type="checkbox" checked={v.activo} onChange={(e) => api.vendedores.update(v.id, { activo: e.target.checked }).then(load)} /></td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

function ActividadForm({ vendedor, semana, existing, onSaved }: {
  vendedor: Vendedor; semana: string; existing?: Actividad; onSaved: () => void;
}) {
  const [f, setF] = useState({
    prospectos: existing?.prospectos ?? 0, llamadas: existing?.llamadas ?? 0,
    demostraciones: existing?.demostraciones ?? 0, montoVentas: Number(existing?.montoVentas ?? 0),
    referidos: existing?.referidos ?? 0, prospeccion: existing?.prospeccion ?? 0,
    toquePuertas: existing?.toquePuertas ?? 0,
  });

  return (
    <form className="card p-4 mb-4" onSubmit={(e) => { e.preventDefault(); api.actividad.upsert({ vendedorId: vendedor.id, semanaInicio: semana, ...f }).then(onSaved); }}>
      <h3 className="font-serif mb-3">{vendedor.nombre} — {semana}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['prospectos', 'llamadas', 'demostraciones', 'referidos', 'prospeccion', 'toquePuertas'] as const).map((k) => (
          <label key={k} className="text-xs"><span className="text-neutral-500 capitalize">{k}</span>
            <input type="number" min={0} className="input mt-1" value={f[k]} onChange={(e) => setF({ ...f, [k]: Number(e.target.value) })} />
          </label>
        ))}
        <label className="text-xs"><span className="text-neutral-500">Ventas RD$</span>
          <input type="number" min={0} className="input mt-1" value={f.montoVentas} onChange={(e) => setF({ ...f, montoVentas: Number(e.target.value) })} />
        </label>
      </div>
      <button type="submit" className="btn btn-primary btn-sm mt-3">Guardar</button>
    </form>
  );
}
