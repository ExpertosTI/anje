import { LogOut, UserCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOnboardingOptional } from '../context/OnboardingContext';
import { api, type Demo, type Lead, type Vendedor } from '../lib/api';
import { DEMO_ESTADOS, formatDate, LEAD_ORIGENES, weekStart } from '../lib/constants';

export default function VendedorPage() {
  const onboarding = useOnboardingOptional();
  const [vendedor, setVendedor] = useState<Vendedor | null>(() => {
    try { return JSON.parse(sessionStorage.getItem('anje_seller') || 'null'); } catch { return null; }
  });
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [vendedorId, setVendedorId] = useState('');
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');
  const [tab, setTab] = useState<'actividad' | 'leads' | 'demos'>('actividad');
  const [semana, setSemana] = useState(weekStart());
  const [leads, setLeads] = useState<Lead[]>([]);
  const [demos, setDemos] = useState<Demo[]>([]);
  const [actForm, setActForm] = useState({ prospectos: 0, llamadas: 0, demostraciones: 0, montoVentas: 0, referidos: 0, prospeccion: 0, toquePuertas: 0 });

  useEffect(() => { api.vendedores.active().then(setVendedores).catch(console.error); }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    try {
      const r = await api.auth.seller(vendedorId, pin);
      sessionStorage.setItem('anje_seller', JSON.stringify(r.vendedor));
      setVendedor(r.vendedor);
      setErr('');
    } catch {
      setErr('Clave incorrecta');
    }
  }

  async function load() {
    if (!vendedor) return;
    const [l, d, a] = await Promise.all([
      api.leads.list(vendedor.id),
      api.demos.list(vendedor.id),
      api.actividad.list(semana),
    ]);
    setLeads(l); setDemos(d);
    const ex = a.find((x) => x.vendedorId === vendedor.id);
    if (ex) setActForm({
      prospectos: ex.prospectos, llamadas: ex.llamadas, demostraciones: ex.demostraciones,
      montoVentas: Number(ex.montoVentas), referidos: ex.referidos, prospeccion: ex.prospeccion, toquePuertas: ex.toquePuertas,
    });
  }

  useEffect(() => { load().catch(console.error); }, [vendedor, semana]);

  useEffect(() => {
    if (!onboarding) return;
    return onboarding.registerActionHandler((action) => {
      const t = action.replace('tab:', '') as 'actividad' | 'leads' | 'demos';
      if (['actividad', 'leads', 'demos'].includes(t)) setTab(t);
    });
  }, [onboarding]);

  if (!vendedor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-anje-pink-light to-white p-4">
        <form onSubmit={login} className="card p-8 w-full max-w-md">
          <img src="/brand/logo.png" alt="" className="h-20 mx-auto mb-4" />
          <h1 className="font-serif text-2xl text-center mb-4">Portal vendedor</h1>
          <select className="input mb-3" value={vendedorId} onChange={(e) => setVendedorId(e.target.value)} required>
            <option value="">Seleccionar vendedor</option>
            {vendedores.map((v) => <option key={v.id} value={v.id}>{v.nombre}</option>)}
          </select>
          <input type="password" className="input mb-4" placeholder="Clave personal" value={pin} onChange={(e) => setPin(e.target.value)} required />
          {err && <p className="text-red-600 text-sm mb-3">{err}</p>}
          <button type="submit" className="btn btn-primary w-full"><UserCheck size={18} /> Entrar</button>
          <Link to="/" className="block mt-4 text-sm text-center text-neutral-500">← Volver</Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b px-4 h-14 flex items-center justify-between">
        <span className="font-serif">{vendedor.nombre}</span>
        <button type="button" className="btn btn-sm btn-dark" onClick={() => { sessionStorage.removeItem('anje_seller'); setVendedor(null); }}><LogOut size={14} /> Salir</button>
      </header>
      <div className="flex gap-2 p-4 max-w-2xl mx-auto">
        {(['actividad', 'leads', 'demos'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize ${tab === t ? 'bg-anje-pink-light text-anje-pink-dark' : 'bg-white border'}`}>{t}</button>
        ))}
      </div>
      <main className="max-w-2xl mx-auto px-4 pb-8">
        {tab === 'actividad' && (
          <form className="card p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); api.actividad.upsert({ vendedorId: vendedor.id, semanaInicio: semana, ...actForm }).then(() => alert('Guardado')); }}>
            <input type="date" className="input" value={semana} onChange={(e) => setSemana(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              {(['prospectos', 'llamadas', 'demostraciones', 'referidos', 'prospeccion', 'toquePuertas'] as const).map((k) => (
                <label key={k} className="text-xs capitalize">{k}
                  <input type="number" min={0} className="input mt-1" value={actForm[k]} onChange={(e) => setActForm({ ...actForm, [k]: Number(e.target.value) })} />
                </label>
              ))}
              <label className="text-xs">Ventas RD$
                <input type="number" min={0} className="input mt-1" value={actForm.montoVentas} onChange={(e) => setActForm({ ...actForm, montoVentas: Number(e.target.value) })} />
              </label>
            </div>
            <button type="submit" className="btn btn-primary w-full">Guardar semana</button>
          </form>
        )}
        {tab === 'leads' && (
          <LeadForm vendedorId={vendedor.id} onCreated={load} leads={leads} />
        )}
        {tab === 'demos' && (
          <DemoFormV vendedorId={vendedor.id} onCreated={load} demos={demos} />
        )}
      </main>
    </div>
  );
}

function LeadForm({ vendedorId, onCreated, leads }: { vendedorId: string; onCreated: () => void; leads: Lead[] }) {
  const [f, setF] = useState({ nombre: '', telefono: '', producto: '', origen: 'prospeccion' });
  return (
    <>
      <form className="card p-4 mb-4 space-y-3" onSubmit={(e) => { e.preventDefault(); api.leads.create({ ...f, vendedorId }).then(() => { onCreated(); setF({ nombre: '', telefono: '', producto: '', origen: 'prospeccion' }); }); }}>
        <input className="input" placeholder="Nombre" required value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} />
        <input className="input" placeholder="Teléfono" required value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} />
        <select className="input" value={f.origen} onChange={(e) => setF({ ...f, origen: e.target.value })}>
          {Object.entries(LEAD_ORIGENES).filter(([k]) => k !== 'web').map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button type="submit" className="btn btn-primary btn-sm w-full">Agregar prospecto</button>
      </form>
      <div className="card divide-y">{leads.map((l) => (
        <div key={l.id} className="p-3 text-sm"><strong>{l.nombre}</strong> · {l.telefono}<br /><span className="text-neutral-500">{formatDate(l.createdAt)}</span></div>
      ))}</div>
    </>
  );
}

function DemoFormV({ vendedorId, onCreated, demos }: { vendedorId: string; onCreated: () => void; demos: Demo[] }) {
  const [f, setF] = useState({ fecha: new Date().toISOString().slice(0, 10), lugar: '', producto: '' });
  return (
    <>
      <form className="card p-4 mb-4 space-y-3" onSubmit={(e) => { e.preventDefault(); api.demos.create({ ...f, vendedorId }).then(() => { onCreated(); setF({ ...f, lugar: '' }); }); }}>
        <input type="date" className="input" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} />
        <input className="input" placeholder="Lugar / sitio" required value={f.lugar} onChange={(e) => setF({ ...f, lugar: e.target.value })} />
        <button type="submit" className="btn btn-primary btn-sm w-full">Agendar demo</button>
      </form>
      <div className="card divide-y">{demos.map((d) => (
        <div key={d.id} className="p-3 text-sm flex justify-between">
          <span>{d.fecha} · {d.lugar}</span>
          <select className="text-xs border rounded px-2" value={d.estado} onChange={(e) => api.demos.update(d.id, { estado: e.target.value }).then(onCreated)}>
            {Object.entries(DEMO_ESTADOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      ))}</div>
    </>
  );
}
