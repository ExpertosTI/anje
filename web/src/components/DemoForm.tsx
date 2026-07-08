import { CheckCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { api } from '../lib/api';

export default function DemoForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', producto: '', ciudad: '', comentarios: '' });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.leads.create({ ...form, origen: 'web' });
      setSent(true);
      setForm({ nombre: '', telefono: '', email: '', producto: '', ciudad: '', comentarios: '' });
    } catch {
      alert('Error al enviar. Intenta por WhatsApp.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
        <h3 className="font-serif text-xl mb-2">¡Solicitud recibida!</h3>
        <p className="text-neutral-600 mb-4">Te contactaremos pronto.</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setSent(false)}>Otra solicitud</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-8 space-y-4">
      <h3 className="font-serif text-xl">Solicita tu demostración</h3>
      <input className="input" placeholder="Nombre *" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
      <input className="input" placeholder="Teléfono / WhatsApp *" required value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
      <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <select className="input" value={form.producto} onChange={(e) => setForm({ ...form, producto: e.target.value })}>
        <option value="">Producto de interés</option>
        <option value="utensilios">Utensilios de cocina</option>
        <option value="ollas">Juegos de ollas</option>
        <option value="sartenes">Sartenes</option>
        <option value="electrodomesticos">Electrodomésticos</option>
        <option value="filtro_ducha">Filtro de ducha</option>
        <option value="purificador">Purificador de aire</option>
      </select>
      <input className="input" placeholder="Ciudad" value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />
      <textarea className="input" rows={3} placeholder="Comentarios" value={form.comentarios} onChange={(e) => setForm({ ...form, comentarios: e.target.value })} />
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        <Send size={18} /> {loading ? 'Enviando…' : 'Enviar solicitud'}
      </button>
    </form>
  );
}
